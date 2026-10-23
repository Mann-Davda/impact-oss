import logging
from datetime import datetime
from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import BaseAgent
from app.agents.gemini_client import gemini_client

logger = logging.getLogger(__name__)


class ConsensusAgent(BaseAgent):
    """
    Consensus Agent: Aggregates outputs from Intake, Intent, Verification, and Risk agents.
    Computes a mathematical weighted confidence average, discovers agreement and disagreement factors,
    and builds the formal Confidence Evolution timeline.
    """

    def __init__(self):
        super().__init__(name="consensus", phase="consensus_aggregation")

    async def process(
        self, incident_id: str, input_payload: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        intake_res = input_payload.get("intake_res", {})
        intent_res = input_payload.get("intent_res", {})
        verify_res = input_payload.get("verify_res", {})
        risk_res = input_payload.get("risk_res", {})

        c_intake = float(intake_res["confidence_score"])
        c_intent = float(intent_res["confidence_score"])
        c_verify = float(verify_res["confidence_score"])
        c_risk = float(risk_res["confidence_score"])
        if any(score < 0.0 or score > 1.0 for score in (c_intake, c_intent, c_verify, c_risk)):
            raise ValueError("Agent confidence scores must be between 0 and 1")

        # Weighted calculation (Verification has highest weight as ground-truth anchor)
        weights = {"intake": 0.20, "intent": 0.20, "verification": 0.35, "risk": 0.25}

        weighted_consensus = round(
            (c_intake * weights["intake"])
            + (c_intent * weights["intent"])
            + (c_verify * weights["verification"])
            + (c_risk * weights["risk"]),
            4,
        )

        min_conf = round(min(c_intake, c_intent, c_verify, c_risk), 3)
        max_conf = round(max(c_intake, c_intent, c_verify, c_risk), 3)

        prompt = f"""
You are the ImpactOS Consensus & Disagreement Arbiter.
Review the collective outputs and confidence evaluations from all prior pipeline agents:

1. Intake Agent (Confidence: {c_intake}):
   - Rationale: {intake_res.get("rationale")}
2. Intent Agent (Confidence: {c_intent}):
   - Rationale: {intent_res.get("rationale")}
3. Verification Agent (Confidence: {c_verify}):
   - Rationale: {verify_res.get("rationale")}
4. Risk Agent (Confidence: {c_risk}):
   - Rationale: {risk_res.get("rationale")}
   - Threat Level: {risk_res.get("threat_level")}

Computed Weighted Consensus Score: {weighted_consensus}

Task:
1. Synthesize the core Agreement Factors shared by the agents.
2. Identify any Disagreement Factors, variances, or epistemic tensions (e.g. visual vs sensor discrepancies, uncertainty on exact building coordinates).
3. Provide a unified consensus rationale summarizing why the system can act decisively.

Respond ONLY with valid JSON:
{{
  "agreement_factors": ["string", "string"],
  "disagreement_factors": ["string", "string"],
  "consensus_rationale": "string"
}}
"""
        arbiter_response = await gemini_client.generate_structured(prompt=prompt, temperature=0.1)

        agreements = arbiter_response.get("agreement_factors", [])

        disagreements = arbiter_response.get("disagreement_factors", [])

        consensus_rationale = arbiter_response.get(
            "consensus_rationale",
            (
                f"Weighted consensus ({weighted_consensus:.4f}) was computed from the four recorded agent confidence scores. "
                "AI consensus narrative is unavailable."
            ),
        )

        # Build Confidence Evolution
        now = datetime.utcnow()
        confidence_evolution = [
            {
                "step": 1,
                "agent": "intake",
                "label": "Multimodal Submission Ingestion",
                "score": c_intake,
                "timestamp": now.isoformat(),
                "rationale": intake_res.get("rationale"),
            },
            {
                "step": 2,
                "agent": "intent",
                "label": "Operational Intent Extraction",
                "score": c_intent,
                "timestamp": now.isoformat(),
                "rationale": intent_res.get("rationale"),
            },
            {
                "step": 3,
                "agent": "verification",
                "label": "Cross-Modal & Sensor Triangulation",
                "score": c_verify,
                "timestamp": now.isoformat(),
                "rationale": verify_res.get("rationale"),
            },
            {
                "step": 4,
                "agent": "risk",
                "label": "Compound Threat & Escalation Model",
                "score": c_risk,
                "timestamp": now.isoformat(),
                "rationale": risk_res.get("rationale"),
            },
            {
                "step": 5,
                "agent": "consensus",
                "label": "Weighted Mathematical Consensus",
                "score": weighted_consensus,
                "timestamp": now.isoformat(),
                "rationale": consensus_rationale,
            },
        ]

        return {
            "consensus_score": weighted_consensus,
            "confidence_score": weighted_consensus,
            "confidence_min": min_conf,
            "confidence_max": max_conf,
            "per_agent_scores": {
                "intake": c_intake,
                "intent": c_intent,
                "verification": c_verify,
                "risk": c_risk,
            },
            "agreement_factors": agreements,
            "disagreement_factors": disagreements,
            "rationale": consensus_rationale,
            "confidence_evolution": confidence_evolution,
            "status": arbiter_response.get("status", "success"),
        }


consensus_agent = ConsensusAgent()
