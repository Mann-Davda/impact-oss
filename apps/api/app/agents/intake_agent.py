import logging
from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import BaseAgent
from app.agents.gemini_client import gemini_client

logger = logging.getLogger(__name__)


class IntakeAgent(BaseAgent):
    """
    Intake Agent: Parses raw multimodal inputs (images, audio clips, text, PDFs),
    extracts metadata, classifies incident category, detects language, and performs initial transcription.
    """

    def __init__(self):
        super().__init__(name="intake", phase="intake_parsing")

    async def process(
        self, incident_id: str, input_payload: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        media_files = input_payload.get("media_files", [])
        situation_text = input_payload.get("situation_text", "")

        prompt = f"""
You are the ImpactOS Multimodal Intake Agent.
Analyze the incoming crisis submission consisting of media and situational text.

Situational text submitted: "{situation_text}"

Task:
1. Classify the crisis category (e.g. riverine_flood, flash_flood, landslide).
2. Extract visual cues if an image is provided (water level, submerged infrastructure, landmark signs).
3. Transcribe and translate any voice note / audio if present (especially Marathi, Hindi, or English).
4. Identify probable geographic location and landmarks.
5. Provide a confidence score (between 0.0 and 1.0) on input validity and parsing accuracy.
6. Provide a concise, factual rationale.

Respond ONLY with valid JSON with the following structure:
{{
  "incident_title": "string",
  "hazard_category": "string",
  "detected_location": "string",
  "audio_transcript_original": "string or null",
  "audio_transcript_english": "string or null",
  "visual_observations": "string or null",
  "situational_summary": "string",
  "confidence_score": 0.0,
  "rationale": "string"
}}
"""
        response = await gemini_client.generate_structured(
            prompt=prompt, media_files=media_files, temperature=0.1
        )

        if response.get("status") == "degraded":
            return {
                "incident_title": "Unassessed incident report",
                "hazard_category": "unclassified",
                "detected_location": "Unknown",
                "audio_transcript_original": None,
                "audio_transcript_english": None,
                "visual_observations": None,
                "situational_summary": situation_text or "Inputs were received but not analyzed.",
                "confidence_score": 0.0,
                "rationale": "Gemini is unavailable; submitted inputs have not been interpreted.",
                "status": "degraded",
            }

        return response


intake_agent = IntakeAgent()
