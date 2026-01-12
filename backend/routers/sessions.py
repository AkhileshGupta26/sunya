from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from bson import ObjectId
from backend.database import db
from backend.models import MeditationSession, SessionResponse
from backend.auth_utils import get_current_user

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

@router.post("/start")
async def start_session(user_id: str = Depends(get_current_user)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Check if session already exists for today
    existing_session = await db.sessions.find_one({
        "user_id": user_id,
        "date": today
    })
    
    if existing_session:
        return {
            "id": str(existing_session["_id"]),
            "grace_timer_started": existing_session.get("grace_timer_started", datetime.utcnow())
        }
    
    # Create new session
    session_doc = {
        "user_id": user_id,
        "date": today,
        "grace_timer_started": datetime.utcnow(),
        "meditation_started": None,
        "track_type": None,
        "completed": False,
        "bpm_verified": False,
        "awareness_probe_passed": False
    }
    result = await db.sessions.insert_one(session_doc)
    
    return {
        "id": str(result.inserted_id),
        "grace_timer_started": session_doc["grace_timer_started"]
    }

@router.post("/complete")
async def complete_session(session_data: MeditationSession, user_id: str = Depends(get_current_user)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Update session
    result = await db.sessions.update_one(
        {"user_id": user_id, "date": today},
        {
            "$set": {
                "track_type": session_data.track_type,
                "completed": session_data.completed,
                "bpm_verified": session_data.bpm_verified,
                "awareness_probe_passed": session_data.awareness_probe_passed,
                "meditation_started": datetime.utcnow()
            }
        }
    )
    
    if session_data.completed:
        # Update user streak and stats
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
        
        # Check if yesterday had a session to maintain streak
        yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
        yesterday_session = await db.sessions.find_one({
            "user_id": user_id,
            "date": yesterday,
            "completed": True
        })
        
        new_streak = user_doc["current_streak"] + 1 if yesterday_session or user_doc["current_streak"] == 0 else 1
        new_total_days = user_doc["total_days"] + 1
        
        # Award zen pass every 10 days
        zen_passes = user_doc["zen_passes"]
        if new_streak % 10 == 0:
            zen_passes += 1
        
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "current_streak": new_streak,
                    "total_days": new_total_days,
                    "zen_passes": zen_passes
                }
            }
        )
        
        # Calculate Next Auto-Detox Duration based on Streak
        # Base: 30 mins. Increase: 10 mins per streak day. Max: 130 mins (2hr 10min)
        detox_streak = user_doc.get("detox_streak", 0)
        base_minutes = 30
        increment = 10 * detox_streak
        next_detox_duration = min(base_minutes + increment, 130) * 60 # Seconds
        
        return {
            "success": True,
            "new_streak": new_streak,
            "total_days": new_total_days,
            "zen_passes": zen_passes,
            "next_detox_duration": next_detox_duration
        }
    
    return {"success": True}

@router.get("/today")
async def get_today_session(user_id: str = Depends(get_current_user)):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    session = await db.sessions.find_one({"user_id": user_id, "date": today})
    
    if not session:
        return {"session": None}
    
    return {
        "session": {
            "id": str(session["_id"]),
            "date": session["date"],
            "grace_timer_started": session.get("grace_timer_started"),
            "completed": session["completed"],
            "track_type": session.get("track_type")
        }
    }

@router.get("/history")
async def get_session_history(user_id: str = Depends(get_current_user)):
    sessions = await db.sessions.find({"user_id": user_id}).sort("date", -1).limit(30).to_list(30)
    
    return {
        "sessions": [
            {
                "id": str(s["_id"]),
                "date": s["date"],
                "completed": s["completed"],
                "track_type": s.get("track_type")
            }
            for s in sessions
        ]
    }
