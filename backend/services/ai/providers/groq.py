import json
import logging
from typing import Any, Dict, List, Optional
from groq import Groq
from .base import AIProvider

logger = logging.getLogger(__name__)

class GroqProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = Groq(api_key=api_key) if api_key else None

    def is_available(self) -> bool:
        return self.client is not None

    def generate_json(self, prompt: str, history: Optional[List[Dict[str, str]]] = None, **kwargs) -> Dict[str, Any]:
        if not self.is_available():
            raise ValueError("Groq API key not configured.")

        # Convert history to Groq format if it's in Gemini format
        # Gemini: {"role": "user", "parts": [{"text": "..."}]}
        # Groq: {"role": "user", "content": "..."}
        messages = []
        if history:
            for entry in history:
                role = "assistant" if entry.get("role") == "model" else entry.get("role")
                content = ""
                parts = entry.get("parts", [])
                if parts:
                    content = parts[0].get("text", "")
                else:
                    content = entry.get("content", "")
                messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": prompt})

        try:
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                response_format={"type": "json_object"},
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_output_tokens", 2048),
                top_p=kwargs.get("top_p", 0.95),
            )
            return json.loads(completion.choices[0].message.content)
        except Exception as e:
            logger.error(f"Groq API Error: {e}")
            raise e
