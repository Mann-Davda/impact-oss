import os
import json
import base64
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiClient:
    """
    Robust asynchronous Gemini Client with structured JSON output,
    multimodal payload handling (images, audio, PDF, text),
    multi-model fallback resilience (gemini-3.8-flash -> gemini-3.5-flash),
    and graceful degraded failure modes.
    """
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.primary_model = model or settings.GEMINI_MODEL
        self.fallback_models = ["gemini-3.5-flash", "gemini-flash-latest"]
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def generate_structured(
        self,
        prompt: str,
        media_files: Optional[List[Dict[str, Any]]] = None,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """
        Calls Gemini with structured JSON output enforcement and automatic failover.
        media_files: list of dicts with {"mime_type": str, "data": bytes or base64_str, "path": Optional[str]}
        """
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set. Returning degraded fallback response.")
            return {
                "status": "degraded",
                "error": "GEMINI_API_KEY not configured",
                "confidence": 0.0,
                "rationale": "Degraded mode: No API key provided"
            }

        parts: List[Dict[str, Any]] = []

        # Process media files
        if media_files:
            for item in media_files:
                mime_type = item.get("mime_type", "application/octet-stream")
                data_b64 = None
                
                if "path" in item and os.path.exists(item["path"]):
                    with open(item["path"], "rb") as f:
                        data_b64 = base64.b64encode(f.read()).decode("utf-8")
                elif "data" in item:
                    raw_data = item["data"]
                    if isinstance(raw_data, bytes):
                        data_b64 = base64.b64encode(raw_data).decode("utf-8")
                    elif isinstance(raw_data, str):
                        data_b64 = raw_data

                if data_b64:
                    parts.append({
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": data_b64
                        }
                    })

        # Append prompt
        parts.append({"text": prompt})

        # Candidate models with primary first
        candidate_models = [self.primary_model]
        for fb in self.fallback_models:
            if fb not in candidate_models:
                candidate_models.append(fb)

        last_error = ""

        async with httpx.AsyncClient(timeout=25.0) as client:
            for target_model in candidate_models:
                url = f"{self.base_url}/models/{target_model}:generateContent?key={self.api_key}"
                request_body: Dict[str, Any] = {
                    "contents": [{"parts": parts}],
                    "generationConfig": {
                        "response_mime_type": "application/json",
                        "temperature": temperature
                    }
                }

                if system_instruction:
                    request_body["system_instruction"] = {
                        "parts": [{"text": system_instruction}]
                    }

                try:
                    response = await client.post(
                        url,
                        json=request_body,
                        headers={"Content-Type": "application/json"}
                    )

                    if response.status_code == 200:
                        data = response.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            text_response = candidates[0]["content"]["parts"][0]["text"].strip()
                            parsed = json.loads(text_response)
                            parsed["status"] = "success"
                            parsed["_model_used"] = target_model
                            return parsed
                    
                    logger.warning(f"Model {target_model} failed (HTTP {response.status_code}): {response.text[:200]}")
                    last_error = f"HTTP {response.status_code} on {target_model}"

                except httpx.TimeoutException:
                    logger.warning(f"Timeout on model {target_model}, attempting next available candidate...")
                    last_error = f"Timeout on {target_model}"
                except json.JSONDecodeError as e:
                    logger.warning(f"JSON decode failed on {target_model}: {e}")
                    last_error = f"Invalid JSON on {target_model}"
                except Exception as e:
                    logger.warning(f"Error invoking {target_model}: {e}")
                    last_error = str(e)

        # If all candidates fail or degrade gracefully
        logger.error(f"All Gemini models exhausted. Returning structured degraded state: {last_error}")
        return {
            "status": "degraded",
            "error": last_error,
            "confidence": 0.0,
            "rationale": f"API Failover exhausted: {last_error}"
        }

gemini_client = GeminiClient()
