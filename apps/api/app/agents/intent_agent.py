import logging
from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import BaseAgent
from app.agents.gemini_client import gemini_client

logger = logging.getLogger(__name__)


class IntentAgent(BaseAgent):
    """
    Intent Agent: Analyzes parsed situational context and audio transcript
    to determine emergency intent, urgency, affected stakeholders, required response action,
    and priority resources.
    """

    def __init__(self):
        super().__init__(name="intent", phase="intent_extraction")

    async def process(
        self, incident_id: str, input_payload: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        intake_data = input_payload.get("intake_data", {})
        situation_summary = intake_data.get("situational_summary", "")
        transcript_en = intake_data.get("audio_transcript_english", "")
        transcript_mr = intake_data.get("audio_transcript_original", "")

        prompt = f"""
You are the ImpactOS Crisis Intent Agent.
Analyze the following parsed emergency report to extract operational intent and triage requirements:

Situational summary: {situation_summary}
Marathi Voice Note Transcript: {transcript_mr}
English Translation: {transcript_en}

Task:
1. Determine the Primary Intent (e.g. "Emergency Life Safety & Evacuation", "Asset Protection", "Informational").
2. Assess Urgency Level ("critical", "high", "moderate", "low").
3. Identify Key Affected Stakeholder (e.g. "Trapped Elderly Citizen", "Stranded Commuters", "General Public").
4. Define Primary Required Action (e.g. "Rapid Amphibious Evacuation & Geriatric Medical Transport").
5. List Required Tactical Resources (e.g. NDRF motorized rescue boat, emergency medical technician, shelter bed).
6. Assign Priority Level ("critical", "high", "medium", "low").
7. Compute Confidence Score (between 0.0 and 1.0) based on specificity of distress signals.
8. State clear, concise rationale.

Respond ONLY with valid JSON with the structure:
{{
  "primary_intent": "string",
  "urgency": "critical" | "high" | "moderate" | "low",
  "stakeholder": "string",
  "required_action": "string",
  "resources_needed": ["string", "string"],
  "priority": "critical" | "high" | "medium" | "low",
  "confidence_score": 0.0,
  "rationale": "string"
}}
"""
        response = await gemini_client.generate_structured(prompt=prompt, temperature=0.1)

        if response.get("status") == "degraded":
            return {
                "confidence_score": 0.0,
                "rationale": "Gemini is unavailable; operational intent has not been assessed.",
                "status": "degraded",
            }

        return response


intent_agent = IntentAgent()
