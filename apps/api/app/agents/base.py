import logging
import time
from datetime import datetime
from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AgentRun

logger = logging.getLogger(__name__)


class BaseAgent:
    def __init__(self, name: str, phase: str = "core_pipeline"):
        self.name = name
        self.phase = phase

    async def execute_tracked(
        self, incident_id: str, input_payload: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Executes agent logic, times the execution, records an AgentRun in the database,
        and returns the structured output.
        """
        start_time = time.time()
        status = "success"

        try:
            result = await self.process(incident_id, input_payload, db)
            if result.get("status") == "degraded":
                status = "degraded"
        except Exception as e:
            logger.exception(f"Error in agent {self.name}: {e}")
            status = "failed"
            result = {
                "status": "failed",
                "error": str(e),
                "confidence": 0.0,
                "rationale": f"Execution failure in agent {self.name}: {e!s}",
            }

        duration_ms = int((time.time() - start_time) * 1000)

        # Extract confidence and rationale
        confidence = float(result.get("confidence_score", result.get("confidence", 0.0)))
        risk_level = result.get("risk_level", None)
        rationale = result.get("rationale", result.get("reasoning", "No rationale provided"))

        # Persist AgentRun
        agent_run = AgentRun(
            incident_id=incident_id,
            agent_name=self.name,
            phase=self.phase,
            status=status,
            confidence=confidence,
            risk_level=risk_level,
            rationale=rationale,
            input_payload=input_payload,
            output_payload=result,
            duration_ms=duration_ms,
            created_at=datetime.utcnow(),
        )
        db.add(agent_run)
        await db.commit()
        await db.refresh(agent_run)

        result["_agent_run_id"] = agent_run.id
        result["_duration_ms"] = duration_ms
        return result

    async def process(
        self, incident_id: str, input_payload: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        raise NotImplementedError
