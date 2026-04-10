from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging
from backend.auth_utils import get_optional_user
from backend.services.ai_service import ai_service

router = APIRouter(tags=["AI Yogi"])
logger = logging.getLogger(__name__)

# --- Re-usable Data Models ---

class YogiRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class YogiResponse(BaseModel):
    wisdom: str
    recommended_track_id: Optional[str] = None
    track_type: Optional[str] = None

class VedicSearchResponse(BaseModel):
    sanskrit_shloka: str
    shloka_translation: str
    wisdom: str
    practical_steps: List[str]
    source_context: str

class MantraResponse(BaseModel):
    sankalpa: str
    explanation: str
    focus_points: List[str]

class JourneySummaryResponse(BaseModel):
    summary: str
    milestone_hit: Optional[str]
    focus_advice: str

# --- Endpoints ---

@router.post("/yogi/ask", response_model=YogiResponse)
def ask_yogi(request: YogiRequest, user_id: str = Depends(get_optional_user)):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="The silence is golden, but please share your thoughts.")

    logger.info(f"Yogi API called by {user_id}. Message: {message[:100]}")
    
    # Delegate to modular AI service
    response_data = ai_service.generate_yogi_response(message, history=request.history)
    
    return YogiResponse(
        wisdom=response_data["wisdom"],
        recommended_track_id=response_data["recommended_track_id"],
        track_type=response_data["track_type"]
    )

@router.post("/yogi/mantra", response_model=MantraResponse)
def get_mantra(user_id: str = Depends(get_optional_user)):
    logger.info(f"Daily Mantra requested by {user_id}")
    
    # We could fetch user-specific context here if we wanted to make it deeply personal
    user_context = "A seeker looking for mindfulness and daily focus."
    
    response_data = ai_service.generate_daily_mantra(user_context)
    
    return MantraResponse(
        sankalpa=response_data["sankalpa"],
        explanation=response_data["explanation"],
        focus_points=response_data["focus_points"]
    )

@router.post("/yogi/search", response_model=VedicSearchResponse)
def vedic_search(request: YogiRequest, user_id: str = Depends(get_optional_user)):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Please enter a topic for Vedic Search.")

    logger.info(f"Vedic Search: {message[:50]}...")

    response_data = ai_service.generate_vedic_search(message, history=request.history)
    
    return VedicSearchResponse(
        sanskrit_shloka=response_data["sanskrit_shloka"],
        shloka_translation=response_data["shloka_translation"],
        wisdom=response_data["wisdom"],
        practical_steps=response_data["practical_steps"],
        source_context=response_data["source_context"]
    )

@router.post("/yogi/journey", response_model=JourneySummaryResponse)
async def get_journey_summary(user_id: str = Depends(get_optional_user)):
    from backend.database import db
    from bson import ObjectId
    
    logger.info(f"Journey summary requested by {user_id}")
    
    # Fetch actual user stats
    user_doc = None
    if user_id != "guest_user":
        try:
            user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
        except Exception as e:
            logger.error(f"DB Error fetching user journey: {e}")
            user_doc = None
    
    if not user_doc:
        stats = {"streak": 0, "total_days": 0, "points": 0, "badges": []}
    else:
        stats = {
            "streak": user_doc.get("current_streak", 0),
            "total_days": user_doc.get("total_days", 0),
            "points": user_doc.get("total_points", 0),
            "badges": user_doc.get("badges", [])
        }

    response_data = ai_service.generate_journey_summary(stats)
    
    return JourneySummaryResponse(
        summary=response_data["summary"],
        milestone_hit=response_data["milestone_hit"],
        focus_advice=response_data["focus_advice"]
    )
