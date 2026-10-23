import tempfile
import unittest
from unittest.mock import AsyncMock, patch

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import selectinload

from app.db.models import Base, Incident
from app.services.pipeline import incident_pipeline_service

MOCK_GEMINI_OUTPUTS = [
    {
        "status": "success",
        "incident_title": "Pune River Inundation Report",
        "hazard_category": "riverine_flood",
        "detected_location": "Bund Garden, Pune",
        "audio_transcript_original": None,
        "audio_transcript_english": None,
        "visual_observations": "DEMO DATA: mock flood image",
        "situational_summary": "Mocked Pune flood submission",
        "confidence_score": 0.7,
        "rationale": "Mocked intake response.",
    },
    {
        "status": "success",
        "primary_intent": "Life safety",
        "urgency": "high",
        "stakeholder": "Residents",
        "required_action": "Human-reviewed evacuation assessment",
        "resources_needed": ["Rescue team"],
        "priority": "high",
        "confidence_score": 0.75,
        "rationale": "Mocked intent response.",
    },
    {
        "status": "success",
        "overall_verification_status": "verified",
        "confidence_score": 0.8,
        "rationale": "Mocked cross-modal verification.",
        "evidence_items": [
            {
                "claim": "DEMO DATA: simulated flood evidence",
                "verification_status": "verified",
                "confidence": 0.8,
                "source": "DEMO DATA: mock input",
                "source_type": "mock",
                "reasoning": "Returned by a mocked model for the test only.",
            }
        ],
    },
    {
        "status": "success",
        "threat_level": "high",
        "risk_score": 0.7,
        "escalation_probability": 0.5,
        "confidence_min": 0.6,
        "confidence_max": 0.8,
        "confidence_score": 0.7,
        "is_emergency": False,
        "emergency_rationale": "Mocked test assessment.",
        "assumptions": ["Mocked test data only."],
        "rationale": "Mocked risk response.",
    },
    {
        "status": "success",
        "agreement_factors": [],
        "disagreement_factors": [],
        "consensus_rationale": "Mocked test consensus.",
    },
]


class MockedPipelineTests(unittest.IsolatedAsyncioTestCase):
    async def test_pune_pipeline_runs_with_mocked_gemini_and_human_approval(self):
        with tempfile.TemporaryDirectory() as directory:
            engine = create_async_engine(f"sqlite+aiosqlite:///{directory}/pipeline.sqlite")
            session_factory = async_sessionmaker(engine, expire_on_commit=False)
            async with engine.begin() as connection:
                await connection.run_sync(Base.metadata.create_all)

            with patch(
                "app.agents.gemini_client.gemini_client.generate_structured",
                new_callable=AsyncMock,
                side_effect=MOCK_GEMINI_OUTPUTS,
            ) as generate:
                async with session_factory() as session:
                    incident = await incident_pipeline_service.run_pipeline(
                        db=session,
                        situation_text="DEMO DATA: Pune flood scenario test input",
                    )
                    result = await session.execute(
                        select(Incident)
                        .options(
                            selectinload(Incident.agent_runs),
                            selectinload(Incident.evidence_items),
                            selectinload(Incident.actions),
                        )
                        .where(Incident.id == incident.id)
                    )
                    stored = result.scalar_one()
                    self.assertEqual(stored.status, "verified")
                    self.assertEqual(stored.category, "riverine_flood")
                    self.assertEqual(stored.risk_score, 0.7)
                    self.assertEqual(stored.consensus_score, 0.745)
                    self.assertEqual(len(stored.evidence_items), 1)
                    self.assertGreaterEqual(len(stored.actions), 1)
                    self.assertTrue(all(action.status == "draft" for action in stored.actions))
                    self.assertTrue(
                        all(action.requires_human_approval for action in stored.actions)
                    )
                    self.assertEqual(len(stored.agent_runs), 5)
                    self.assertTrue(all(run.status == "success" for run in stored.agent_runs))
                self.assertEqual(generate.await_count, 5)

            await engine.dispose()


if __name__ == "__main__":
    unittest.main()
