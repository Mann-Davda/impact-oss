import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient
from sqlalchemy import inspect, select
from starlette.datastructures import Headers, UploadFile

from app.agents.consensus_agent import ConsensusAgent
from app.agents.gemini_client import GeminiClient, gemini_client
from app.config import settings
from app.db.models import Action, Base, Incident
from app.db.session import _create_missing_indexes, async_sessionmaker, create_async_engine
from app.main import app, root
from app.services.pipeline import IncidentPipelineService
from app.services.uploads import save_validated_upload


class UploadValidationTests(unittest.IsolatedAsyncioTestCase):
    async def test_validates_content_and_sanitizes_filename(self):
        with tempfile.TemporaryDirectory() as directory:
            upload = UploadFile(
                filename="../../unsafe name.jpg",
                file=io.BytesIO(b"\xff\xd8\xffmock jpeg"),
                headers=Headers({"content-type": "image/jpeg"}),
            )
            with patch.object(settings, "UPLOAD_DIR", directory):
                saved = await save_validated_upload(upload, "image")

            self.assertEqual(saved["filename"], "unsafe_name.jpg")
            self.assertEqual(saved["mime_type"], "image/jpeg")
            self.assertEqual(Path(saved["path"]).parent, Path(directory))
            self.assertEqual(Path(saved["path"]).read_bytes(), b"\xff\xd8\xffmock jpeg")

    async def test_rejects_mismatched_content_type(self):
        upload = UploadFile(
            filename="image.png",
            file=io.BytesIO(b"\xff\xd8\xffnot a png"),
            headers=Headers({"content-type": "image/png"}),
        )
        with self.assertRaises(HTTPException) as error:
            await save_validated_upload(upload, "image")
        self.assertEqual(error.exception.status_code, 415)

    async def test_rejects_empty_and_oversized_files(self):
        empty = UploadFile(
            filename="empty.jpg",
            file=io.BytesIO(b""),
            headers=Headers({"content-type": "image/jpeg"}),
        )
        with self.assertRaises(HTTPException) as error:
            await save_validated_upload(empty, "image")
        self.assertEqual(error.exception.status_code, 400)

        large = UploadFile(
            filename="large.jpg",
            file=io.BytesIO(b"\xff\xd8\xff" + b"x" * (10 * 1024 * 1024)),
            headers=Headers({"content-type": "image/jpeg"}),
        )
        with self.assertRaises(HTTPException) as error:
            await save_validated_upload(large, "image")
        self.assertEqual(error.exception.status_code, 413)


class DegradedModeTests(unittest.IsolatedAsyncioTestCase):
    async def test_root_reports_degraded_without_gemini_configuration(self):
        with patch.object(settings, "GEMINI_API_KEY", ""):
            response = await root()
        self.assertEqual(response["status"], "degraded")

    async def test_missing_gemini_key_returns_degraded_without_network(self):
        client = GeminiClient(api_key="")
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as post:
            result = await client.generate_structured("test")
        self.assertEqual(result["status"], "degraded")
        post.assert_not_awaited()

    async def test_consensus_uses_only_supplied_agent_scores(self):
        scores = {
            "intake_res": {"confidence_score": 0.5, "rationale": "input"},
            "intent_res": {"confidence_score": 0.6, "rationale": "intent"},
            "verify_res": {"confidence_score": 0.8, "rationale": "evidence"},
            "risk_res": {"confidence_score": 0.4, "rationale": "risk"},
        }
        with patch.object(
            gemini_client,
            "generate_structured",
            new_callable=AsyncMock,
            return_value={"status": "success"},
        ):
            result = await ConsensusAgent().process("inc_test", scores, None)
        self.assertEqual(result["consensus_score"], 0.6)
        self.assertEqual(result["per_agent_scores"]["verification"], 0.8)

    async def test_consensus_rejects_missing_confidence_instead_of_defaulting(self):
        with (
            patch.object(
                gemini_client,
                "generate_structured",
                new_callable=AsyncMock,
                return_value={"status": "success"},
            ),
            self.assertRaises(KeyError),
        ):
            await ConsensusAgent().process("inc_test", {}, None)

    async def test_pipeline_persists_unassessed_state_when_gemini_is_down(self):
        with tempfile.TemporaryDirectory() as directory:
            engine = create_async_engine(f"sqlite+aiosqlite:///{directory}/audit.sqlite")
            session_factory = async_sessionmaker(engine, expire_on_commit=False)
            async with engine.begin() as connection:
                await connection.run_sync(Base.metadata.create_all)
            async with session_factory() as session:
                incident = Incident(title="Processing Incident...", status="processing")
                session.add(incident)
                await session.commit()
                await IncidentPipelineService.mark_unassessed(
                    incident, session, "AI analysis unavailable."
                )
                self.assertEqual(incident.status, "degraded")
                self.assertEqual(incident.risk_level, "unassessed")
                self.assertEqual(incident.confidence_max, 1.0)
                self.assertFalse(incident.is_emergency)
                actions = await session.execute(
                    select(Action).where(Action.incident_id == incident.id)
                )
                self.assertEqual(actions.scalars().all(), [])
            await engine.dispose()


class ApiBoundaryTests(unittest.IsolatedAsyncioTestCase):
    async def test_init_db_creates_missing_indexes_for_existing_tables(self):
        with tempfile.TemporaryDirectory() as directory:
            engine = create_async_engine(f"sqlite+aiosqlite:///{directory}/indexes.sqlite")
            async with engine.begin() as connection:
                await connection.run_sync(Base.metadata.create_all)
                await connection.run_sync(
                    lambda sync_connection: next(
                        index
                        for index in Base.metadata.tables["incidents"].indexes
                        if index.name == "ix_incidents_updated_at"
                    ).drop(sync_connection)
                )
                await connection.run_sync(_create_missing_indexes)
                names = await connection.run_sync(
                    lambda sync_connection: {
                        index["name"] for index in inspect(sync_connection).get_indexes("incidents")
                    }
                )
            self.assertIn("ix_incidents_updated_at", names)
            await engine.dispose()

    async def test_cors_allows_configured_origin_only(self):
        transport = ASGITransport(app=app, client=("192.0.2.20", 1000))
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            trusted = await client.get("/", headers={"Origin": "http://localhost:3000"})
            untrusted = await client.get("/", headers={"Origin": "https://untrusted.example"})
        self.assertEqual(
            trusted.headers.get("access-control-allow-origin"), "http://localhost:3000"
        )
        self.assertIsNone(untrusted.headers.get("access-control-allow-origin"))

    async def test_rate_limiter_returns_429_after_configured_limit(self):
        with (
            patch.object(settings, "RATE_LIMIT_REQUESTS", 1),
            patch.object(settings, "RATE_LIMIT_WINDOW_SECONDS", 60),
        ):
            transport = ASGITransport(app=app, client=("192.0.2.21", 1000))
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                first = await client.get("/")
                second = await client.get("/")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 429)
        self.assertIn("retry-after", second.headers)


if __name__ == "__main__":
    unittest.main()
