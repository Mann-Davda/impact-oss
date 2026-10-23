import logging
from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import BaseAgent
from app.agents.gemini_client import gemini_client

logger = logging.getLogger(__name__)


class RiskAgent(BaseAgent):
    """
    Risk Agent: Evaluates severity, threat level, escalation probability,
    and uncertainty bounds. Automatically determines whether Emergency Mode is warranted.
    """

    def __init__(self):
        super().__init__(name="risk", phase="risk_assessment")

    async def process(
        self, incident_id: str, input_payload: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        intake_data = input_payload.get("intake_data", {})
        intent_data = input_payload.get("intent_data", {})
        verification_data = input_payload.get("verification_data", {})
        weather_data = input_payload.get("weather_data", {})

        prompt = f"""
You are the ImpactOS Risk & Threat Assessment Agent.
Assess the compound risk profile and threat escalation for Incident {incident_id}.

Context:
- Verified Evidence items: {len(verification_data.get("evidence_items", []))} items verified
- Category: {intake_data.get("hazard_category")} at {intake_data.get("detected_location")}
- Citizen intent: {intent_data.get("primary_intent")} (Urgency: {intent_data.get("urgency")})
- Trapped Stakeholder: {intent_data.get("stakeholder")}
- River gauge: 7.82m (+1.32m over danger mark), 35,400 cusecs dam discharge, rising at 14.5 cm/hr
- IMD Alert: {weather_data.get("imd_alerts", {}).get("current_warning")}

Task:
1. Determine Threat Level: MUST be one of "critical", "high", "moderate", "low".
   (Note: If life is immediately threatened by fast-rising floodwaters and trapped vulnerable individuals, assign "critical").
2. Compute Numeric Risk Score: Float between 0.0 (benign) and 1.0 (catastrophic).
3. Compute Escalation Probability: Float between 0.0 and 1.0.
4. Establish Uncertainty Range: Lower confidence bound and Upper confidence bound (between 0.0 and 1.0).
5. State Key Assumptions underlying this assessment (Mandatory rule: Never present simulation as absolute certainty).
6. State Emergency Mode Activation: Boolean (True if threat level is "critical").
7. Provide Emergency Rationale explaining why emergency mode was triggered or avoided.
8. State overall agent confidence score (0.0 to 1.0) and rationale.

Respond ONLY with valid JSON:
{{
  "threat_level": "critical" | "high" | "moderate" | "low",
  "risk_score": 0.0,
  "escalation_probability": 0.0,
  "confidence_min": 0.0,
  "confidence_max": 0.0,
  "confidence_score": 0.0,
  "is_emergency": true | false,
  "emergency_rationale": "string",
  "assumptions": ["string", "string"],
  "rationale": "string"
}}
"""
        response = await gemini_client.generate_structured(prompt=prompt, temperature=0.1)

        if response.get("status") == "degraded":
            return {
                "threat_level": "unassessed",
                "risk_score": 0.0,
                "escalation_probability": 0.0,
                "confidence_min": 0.0,
                "confidence_max": 1.0,
                "confidence_score": 0.0,
                "is_emergency": False,
                "emergency_rationale": "Risk assessment unavailable; do not interpret this state as safe.",
                "assumptions": [],
                "rationale": "Gemini is unavailable; risk has not been assessed.",
                "status": "degraded",
            }

        return response


risk_agent = RiskAgent()
