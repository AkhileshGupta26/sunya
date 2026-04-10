import json
import logging
import os
from typing import Any, Dict, List, Optional
from .providers.groq import GroqProvider
from .providers.gemini import GeminiProvider
from .prompts import (
    SYSTEM_PROMPT,
    SANKALPA_SYSTEM_PROMPT,
    VEDIC_SEARCH_PROMPT,
    JOURNEY_SYSTEM_PROMPT,
    APP_SUPPORT_SYSTEM_PROMPT,
    MEDITATION_TRACKS,
    YOGA_TRACKS
)
from backend.prompts.sunya_app_knowledge import SCREEN_GUIDE, FEATURES, FAQS

logger = logging.getLogger(__name__)

class AIOrchestrator:
    def __init__(self):
        self._cache = {}
        groq_key = (os.environ.get("GROQ_API_KEY") or "").strip()
        gemini_key = (os.environ.get("GEMINI_API_KEY") or "").strip()
        
        self.groq = GroqProvider(groq_key)
        self.gemini = GeminiProvider(gemini_key)

    def _generate_json(self, prompt: str, history: list = None, **kwargs) -> dict:
        cache_key = f"{prompt}_{json.dumps(history or [])}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        provider = self.groq if self.groq.is_available() else self.gemini
        
        try:
            result = provider.generate_json(prompt, history=history, **kwargs)
            self._cache[cache_key] = result
            return result
        except Exception as e:
            # Fallback if primary provider fails
            if provider == self.groq and self.gemini.is_available():
                logger.warning(f"Groq failed, falling back to Gemini: {e}")
                result = self.gemini.generate_json(prompt, history=history, **kwargs)
                self._cache[cache_key] = result
                return result
            raise e

    # --- Domain Methods ---

    def ask_yogi(self, message: str, history: list = None) -> dict:
        try:
            data = self._generate_json(
                f"{SYSTEM_PROMPT}\n\nUser input: {message}",
                history=history,
                temperature=0.85,
                top_p=0.95,
                max_output_tokens=700,
            )
            return self._normalize_track(data)
        except Exception as e:
            logger.error(f"Yogi Error: {e}")
            return {"wisdom": "The path is clear before you, even when clouds drift.", "recommended_track_id": None, "track_type": None}

    def search_vedic(self, query: str, history: list = None) -> dict:
        try:
            data = self._generate_json(
                f"{VEDIC_SEARCH_PROMPT}\n\nQuestion: {query}",
                history=history,
                temperature=0.7,
                max_output_tokens=3000,
            )
            return data
        except Exception as e:
            logger.error(f"Search Error: {e}")
            return {"wisdom": "The river of knowledge flows, but sometimes it is obscured by silence.", "sanskrit_shloka": "Om Shantih", "shloka_translation": "Om Peace", "practical_steps": [], "source_context": ""}

    def get_mantra(self, user_context: str) -> dict:
        try:
            return self._generate_json(f"{SANKALPA_SYSTEM_PROMPT}\n\nContext: {user_context}", temperature=0.8)
        except Exception:
            return {"sankalpa": "I am centered, I am whole.", "explanation": "Finding stillness within.", "focus_points": ["Breath"]}

    def get_journey_reflection(self, stats: dict) -> dict:
        try:
            return self._generate_json(JOURNEY_SYSTEM_PROMPT.format(stats=json.dumps(stats)), temperature=0.8)
        except Exception:
            return {"summary": "Paths are carved by patient footsteps.", "milestone_hit": None, "focus_advice": "Keep breathing."}

    def app_support(self, message: str) -> dict:
        # Simplified for now, logic can be moved here from ai_service.py
        try:
            return self._generate_json(f"{APP_SUPPORT_SYSTEM_PROMPT}\n\nUser: {message}", temperature=0.3)
        except Exception:
            return {"wisdom": "I can help with Sunya's features. What would you like to know?", "recommended_track_id": None, "track_type": None}

    def _normalize_track(self, data: dict) -> dict:
        valid_meditation = {track["id"] for track in MEDITATION_TRACKS}
        valid_yoga = {track["id"] for track in YOGA_TRACKS}
        
        tid = data.get("recommended_track_id")
        ttype = (data.get("track_type") or "").lower()
        
        if ttype == "meditation" and tid not in valid_meditation:
            tid = "silence"
        elif ttype == "yoga" and tid not in valid_yoga:
            tid = None
            ttype = None
            
        return {
            "wisdom": data.get("wisdom", "Focus on the present moment."),
            "recommended_track_id": tid,
            "track_type": ttype
        }
