import logging
import json
import google.generativeai as genai
from typing import Any, Dict, List, Optional
from .base import AIProvider

logger = logging.getLogger(__name__)

class GeminiProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)

    def is_available(self) -> bool:
        return bool(self.api_key)

    def generate_json(self, prompt: str, history: Optional[List[Dict[str, Any]]] = None, **kwargs) -> Dict[str, Any]:
        if not self.is_available():
            raise ValueError("Gemini API key not configured.")

        try:
            config = genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=kwargs.get("temperature", 0.7),
                max_output_tokens=kwargs.get("max_output_tokens", 2048),
                top_p=kwargs.get("top_p", 0.95),
            )
            model = genai.GenerativeModel("gemini-2.0-flash", generation_config=config)
            
            if history:
                chat = model.start_chat(history=history)
                response = chat.send_message(prompt)
            else:
                response = model.generate_content(prompt)
            
            return self._parse_json_payload(self._extract_response_text(response))
        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            raise e

    def _extract_response_text(self, response) -> str:
        try:
            response_text = getattr(response, "text", None)
            if response_text:
                return response_text
        except Exception as exc:
            logger.warning("Gemini response.text was unavailable: %s", exc)

        candidates = getattr(response, "candidates", None) or []
        extracted_parts = []

        for candidate in candidates:
            content = getattr(candidate, "content", None)
            parts = getattr(content, "parts", None) or []
            for part in parts:
                part_text = getattr(part, "text", None)
                if part_text:
                    extracted_parts.append(part_text)

        if extracted_parts:
            return "\n".join(extracted_parts)

        raise ValueError("Gemini returned no text content.")

    def _parse_json_payload(self, raw_text: str) -> dict:
        cleaned = (raw_text or "").strip()
        if not cleaned:
            raise ValueError("Gemini returned an empty response.")

        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()

        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1 or end < start:
            raise ValueError(f"Gemini did not return a JSON object: {cleaned[:200]}")

        return json.loads(cleaned[start : end + 1])
