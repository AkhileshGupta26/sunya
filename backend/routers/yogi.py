from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import os
import google.generativeai as genai
from backend.auth_utils import security
from jose import jwt, JWTError
import json
import logging
from backend.models import MantraResponse, VedicSearchResponse, JourneySummaryResponse
import re

router = APIRouter(prefix="/api/yogi", tags=["Yogi"])
logger = logging.getLogger(__name__)

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    logger.warning("GEMINI_API_KEY not found in environment variables.")

class YogiRequest(BaseModel):
    message: str

class YogiResponse(BaseModel):
    wisdom: str
    recommended_track_id: str = None
    track_type: str = None # "meditation" or "yoga"

# Optional Auth Helper
async def get_optional_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        logger.info("Yogi request: No valid auth header, proceeding as guest")
        return "guest_user"
    
    token = auth_header.split(" ")[1]
    if token == "null" or token == "undefined":
        logger.info("Yogi request: Null/Undefined token, proceeding as guest")
        return "guest_user"

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub", "guest_user")
    except JWTError as e:
        logger.info(f"Yogi request: JWT Error ({str(e)}), proceeding as guest")
        return "guest_user"

# Track metadata for AI context
MEDITATION_TRACKS = [
    {"id": "flute_music", "name": "Flute Music", "description": "Relaxing flute melody"},
    {"id": "beauty", "name": "Beauty", "description": "Radiant & calming vibes"},
    {"id": "silence", "name": "Sunya Silence", "description": "Absolute silence (Advanced, insight)"},
    {"id": "om_awareness", "name": "Om Awareness", "description": "Single Om / AUM chant (Focus)"},
    {"id": "cosmic_universe", "name": "Cosmic Universe Sound", "description": "Deep space ambience"},
    {"id": "rainfall", "name": "Rainfall", "description": "Soothing rain sounds"},
    {"id": "forest_presence", "name": "Forest Presence", "description": "Birds & leaves (Grounding)"},
    {"id": "bird_chirping", "name": "Bird Chirping", "description": "Gentle birdsong & piano"},
    {"id": "ocean", "name": "Ocean", "description": "Calming ocean waves"},
]

YOGA_TRACKS = [
    {"id": "nadi_shodhana", "name": "Nadi Shodhana", "description": "Alternate Nostril Breathing for balance"},
    {"id": "hatha", "name": "Hatha Yoga", "description": "Slow-paced stretching & breathing"},
    {"id": "vinyasa", "name": "Vinyasa Flow", "description": "Dynamic movement & energy"},
    {"id": "yin", "name": "Yin Yoga", "description": "Deep tissue release & calm"},
]

SYSTEM_PROMPT = f"""
You are the "Sunya Yogi", a wise and compassionate AI mentor for the Sunya mindfulness app. 
Your goal is to provide personalized guidance rooted in Vedic philosophy, mindfulness, and breathwork.

Tone: Calm, encouraging, poetic, and grounded.

Available Meditation Tracks: {json.dumps(MEDITATION_TRACKS)}
Available Yoga Tracks: {json.dumps(YOGA_TRACKS)}

When a user shares their feelings or state of mind:
1. Provide a short, wise reflection (2-3 sentences).
2. Recommend ONE specific track from the lists above.
3. Your output must be ONLY a raw JSON object (no markdown, no backticks) with this structure:
{{
  "wisdom": "The reflection text",
  "recommended_track_id": "the_track_id",
  "track_type": "meditation" OR "yoga"
}}
"""

@router.post("/ask", response_model=YogiResponse)
async def ask_yogi(request: YogiRequest, user_id: str = Depends(get_optional_user)):
    logger.info(f"Yogi API called by {user_id}. Message: {request.message[:100]}...")
    
    if not api_key:
        logger.error("GEMINI_API_KEY is missing from environment")
        return YogiResponse(
            wisdom="The connection to the heavens is clouded. Please ensure your API key is set.",
            recommended_track_id="silence",
            track_type="meditation"
        )

    try:
        # Use models/gemini-flash-lite-latest for highest possible quota/throughput
        model = genai.GenerativeModel('models/gemini-flash-lite-latest')
        response = model.generate_content(f"{SYSTEM_PROMPT}\n\nUser input: {request.message}")
        
        # Robust Parsing
        text = response.text.strip()
        logger.info(f"Raw AI Response: {text[:200]}...")

        # Extract JSON using regex (handles markdown blocks)
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
            
        data = json.loads(text)
        
        wisdom = data.get("wisdom", "The path is clear before you.")
        rec_id = data.get("recommended_track_id")
        t_type = data.get("track_type")

        # Validate existence of recommended track
        valid_meditation = [t["id"] for t in MEDITATION_TRACKS]
        valid_yoga = [t["id"] for t in YOGA_TRACKS]

        if t_type == "meditation":
            if rec_id not in valid_meditation:
                logger.warning(f"Yogi suggested invalid meditation ID: {rec_id}. Defaulting to silence.")
                rec_id = "silence"
        elif t_type == "yoga":
            if rec_id not in valid_yoga:
                logger.warning(f"Yogi suggested invalid yoga ID: {rec_id}. Skipping recommendation.")
                rec_id = None
                t_type = None
        else:
            # Fallback if AI gets the type slightly wrong but ID is correct
            if rec_id in valid_meditation:
                t_type = "meditation"
            elif rec_id in valid_yoga:
                t_type = "yoga"
            else:
                rec_id = None
                t_type = None

        return YogiResponse(
            wisdom=wisdom,
            recommended_track_id=rec_id,
            track_type=t_type
        )
    except Exception as e:
        logger.error(f"Critical Yogi Error: {str(e)}", exc_info=True)
        return YogiResponse(
            wisdom="My child, the clouds drift but the sun remains. Please take a deep breath and try again later.",
            recommended_track_id="silence",
            track_type="meditation"
        )

# --- Personalized Mantra (Sankalpa) ---

SANKALPA_SYSTEM_PROMPT = """
You are the Sunya Yogi. Your goal is to craft a "Sankalpa" (a sacred resolution/mantra).
A Sankalpa is a positive, present-tense affirmation that plants a seed of transformation in the subconscious.

Requirements:
1. One short, powerful sentence (can include a Sanskrit phrase if appropriate, like 'Aham Brahmasmi' or 'Om Shanti').
2. Provide a 1-2 sentence modern explanation of why this mantra specifically helps the user.
3. 2 Practical focus points for the day.

Your output must be ONLY raw JSON:
{
  "sankalpa": "The mantra text",
  "explanation": "Modern wisdom",
  "focus_points": ["Point 1", "Point 2"]
}
"""

@router.post("/mantra", response_model=MantraResponse)
async def get_daily_mantra(user_id: str = Depends(get_optional_user)):
    # In a full production app, we would fetch aspirations/state from DB here.
    # For now, we simulate with a default or guest context.
    logger.info(f"Mantra requested by {user_id}")
    
    # Simulation: In a real app, user object would have these.
    user_context = "Seeking clarity and calmness in a busy world."
    
    try:
        model = genai.GenerativeModel('models/gemini-flash-lite-latest')
        prompt = f"{SANKALPA_SYSTEM_PROMPT}\n\nUser Context: {user_context}"
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        data = json.loads(json_match.group(0)) if json_match else json.loads(text)
        
        return MantraResponse(
            sankalpa=data.get("sankalpa", "I am centered, I am whole."),
            explanation=data.get("explanation", "Finding stillness within."),
            focus_points=data.get("focus_points", ["Breath", "Presence"])
        )
    except Exception as e:
        logger.error(f"Mantra Error: {e}")
        return MantraResponse(
            sankalpa="I am the stillness within the movement.",
            explanation="The sun remains even when hidden by clouds.",
            focus_points=["Deep breathing", "Acceptance"]
        )

# --- Vedic Smart Search ---

VEDIC_SEARCH_PROMPT = """
You are the Sunya Yogi, a distinguished scholar of Vedic philosophy, Sanskrit scriptures, and modern mindfulness.
Your goal is to provide deep, cited wisdom coupled with practical steps and authentic Sanskrit verses.

Structure:
1. Sanskrit Shloka: Include a relevant verse from the Vedas, Upanishads, or Bhagavad Gita (in Devanagari or Transliterated Sanskrit).
2. Shloka Meaning: A direct or poetic translation of the verse.
3. Core Wisdom (1-2 paragraphs): Root the answer in a specific concept (e.g., Dharana, Tapas, Gunas).
4. Practical Steps (3 actionable items).
5. Source Concept: Detailed reference (e.g., "Patanjali Yoga Sutras 2.1").

Your output must be ONLY raw JSON:
{
  "sanskrit_shloka": "Verse text",
  "shloka_translation": "English translation",
  "wisdom": "The deep teaching",
  "practical_steps": ["Step 1", "Step 2", "Step 3"],
  "source_context": "Concept Reference"
}
"""

@router.post("/search", response_model=VedicSearchResponse)
async def search_vedic(request: YogiRequest):
    logger.info(f"Vedic Search: {request.message[:50]}...")
    
    try:
        generation_config = genai.types.GenerationConfig(
            temperature=0.8,
            top_p=0.95,
            top_k=40,
            max_output_tokens=1024,
        )
        model = genai.GenerativeModel('models/gemini-flash-lite-latest', generation_config=generation_config)
        prompt = f"{VEDIC_SEARCH_PROMPT}\n\nQuestion: {request.message}\n\nNote: Provide a unique response each time, exploring different ancient texts like Upanishads, Bhagavad Gita, or Vedas relevant to the query."
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        data = json.loads(json_match.group(0)) if json_match else json.loads(text)
        
        return VedicSearchResponse(
            sanskrit_shloka=data.get("sanskrit_shloka"),
            shloka_translation=data.get("shloka_translation"),
            wisdom=data.get("wisdom", "The wisdom of the Vedas is vast."),
            practical_steps=data.get("practical_steps", ["Breathe", "Observe", "Release"]),
            source_context=data.get("source_context", "Universal Wisdom")
        )
    except Exception as e:
        logger.error(f"Search Error: {e}")
        return VedicSearchResponse(
            sanskrit_shloka="ॐ शान्तिः शान्तिः शान्तिः",
            shloka_translation="Om Shanti, Shanti, Shanti (Peace in thought, word, and deed)",
            wisdom="The river of knowledge flows, but sometimes it is obscured by silence. Please try again briefly.",
            practical_steps=["Pause and reflect", "Ask in a different way", "Seek silence"],
            source_context="Silence of the Sages"
        )

# --- AI Journey Summary ---

JOURNEY_SYSTEM_PROMPT = """
You are the Sunya Yogi. A user is asking for a reflection on their mindfulness journey.
Stats provided: {stats}

Requirements:
1. Provide a poetic, 2-3 sentence summary of their progress (mentioning specific stats).
2. Identify a "Milestone" if applicable (e.g., reaching 10 days, 100 points, or first badge).
3. Give one brief piece of "Focus Advice" for their next phase.

Your output must be ONLY raw JSON:
{
  "summary": "Poetic text",
  "milestone_hit": "Milestone name or None",
  "focus_advice": "Advice text"
}
"""

@router.post("/journey", response_model=JourneySummaryResponse)
async def get_journey_summary(user_id: str = Depends(get_optional_user)):
    from backend.database import db
    from bson import ObjectId
    
    logger.info(f"Journey summary requested by {user_id}")
    
    # Fetch actual user stats
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)}) if user_id != "guest_user" else None
    
    if not user_doc:
        stats = {"streak": 0, "total_days": 0, "points": 0, "badges": []}
    else:
        stats = {
            "streak": user_doc.get("current_streak", 0),
            "total_days": user_doc.get("total_days", 0),
            "points": user_doc.get("total_points", 0),
            "badges": user_doc.get("badges", [])
        }

    try:
        model = genai.GenerativeModel('models/gemini-flash-lite-latest')
        prompt = JOURNEY_SYSTEM_PROMPT.format(stats=json.dumps(stats))
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        data = json.loads(json_match.group(0)) if json_match else json.loads(text)
        
        return JourneySummaryResponse(
            summary=data.get("summary", "Your journey is a river of light."),
            milestone_hit=data.get("milestone_hit"),
            focus_advice=data.get("focus_advice", "Keep breathing.")
        )
    except Exception as e:
        logger.error(f"Journey Error: {e}")
        return JourneySummaryResponse(
            summary="Paths are carved by patient footsteps. You are moving well.",
            milestone_hit=None,
            focus_advice="Patience is the anchor of peace."
        )
