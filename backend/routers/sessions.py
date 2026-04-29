from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from bson import ObjectId
from backend.database import db
from backend.models import MeditationSession, SessionResponse
from backend.auth_utils import get_current_user
import logging

logger = logging.getLogger(__name__)

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
    session_update = {
        "track_type": session_data.track_type,
        "completed": session_data.completed,
        "bpm_verified": session_data.bpm_verified,
        "awareness_probe_passed": session_data.awareness_probe_passed,
        "meditation_started": datetime.utcnow(),
        "duration_seconds": session_data.duration_seconds
    }
    
    result = await db.sessions.update_one(
        {"user_id": user_id, "date": today},
        {
            "$set": session_update
        }
    )
    
    # If no session existed for today (e.g. direct completion without start), insert it
    if result.matched_count == 0:
        session_update["user_id"] = user_id
        session_update["date"] = today
        session_update["grace_timer_started"] = datetime.utcnow()
        await db.sessions.insert_one(session_update)
    
    if session_data.completed:
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
        
        # 2. Handle Streak (Only for Meditation, NOT Yoga)
        # Yoga ids: nadi_shodhana, hatha, vinyasa, yin
        YOGA_IDS = ['nadi_shodhana', 'hatha', 'vinyasa', 'yin']
        is_yoga = session_data.track_type in YOGA_IDS
        
        # 1. Calculate and Award Points (ONLY IF NOT YOGA)
        # REPEATABLE: Logic allows multiple point awards per day.
        points_earned = 0
        if not is_yoga:
             # 10 points per minute
            minutes = session_data.duration_seconds // 60
            points_earned = minutes * 10
            if points_earned > 0:
                # --- SENIOR AUDITOR FIX: Lazy point reset for Leaderboards ---
                current_date = datetime.utcnow()
                current_week = current_date.isocalendar()[1]
                current_month = current_date.month
                
                user_last_week = user_doc.get("contest_joined_weekly_at") # Used as 'last_update_week'
                user_last_month = user_doc.get("contest_joined_monthly_at") # Used as 'last_update_month'
                
                reset_weekly = user_last_week != str(current_week)
                reset_monthly = user_last_month != str(current_month)
                
                # Perform the update
                await db.users.update_one(
                    {"_id": ObjectId(user_id)},
                    {
                        "$inc": {
                            "total_points": points_earned,
                            "weekly_points": points_earned if not reset_weekly else 0,
                            "monthly_points": points_earned if not reset_monthly else 0
                        },
                        "$set": {
                            "contest_joined_weekly_at": str(current_week),
                            "contest_joined_monthly_at": str(current_month)
                        }
                    }
                )
                
                # If reset occurred, we need to set the initial points for the new period
                if reset_weekly or reset_monthly:
                    inc_reset = {}
                    if reset_weekly: inc_reset["weekly_points"] = points_earned
                    if reset_monthly: inc_reset["monthly_points"] = points_earned
                    
                    await db.users.update_one(
                        {"_id": ObjectId(user_id)},
                        {"$set": inc_reset}
                    )

        # Check if we already credited streak for today
        # We check by looking for ANY completed meditation session for today (excluding this one if we just saved it? No, just check if user field updated?)
        # Actually simplest is: Did we already increment streak today? 
        # We don't store "last_streak_date", but we can infer.
        # Better: Check existing sessions for today. If there was ALREADY a completed session (before this call), then we don't increment.
        # But we just updated/inserted. 
        # Let's check if there are MULTIPLE completed sessions today.
        
        count_completed_today = await db.sessions.count_documents({
            "user_id": user_id, 
            "date": today, 
            "completed": True,
            "track_type": {"$nin": YOGA_IDS} # Count only meditation sessions
        })

        new_streak = user_doc["current_streak"]
        new_total_days = user_doc["total_days"]
        zen_passes = user_doc["zen_passes"]

        # If this is the FIRST valid meditation completion of the day, increment streak
        streak_updated = False
        if not is_yoga and count_completed_today == 1:
            streak_updated = True
            yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
            yesterday_session = await db.sessions.find_one({
                "user_id": user_id,
                "date": yesterday,
                "completed": True,
                "track_type": {"$nin": YOGA_IDS}
            })
            
            # Logic: If streak > 0, we check yesterday. If streak is 0, start new.
            # If yesterday missing but have Zen Pass? (Simplification: Auto-use pass not requested here, just standard logic)
            
            # --- SENIOR AUDITOR FIX: Zen Pass Heroics ---
            has_zen_pass = user_doc.get("zen_passes", 0) > 0
            
            if yesterday_session or user_doc["current_streak"] == 0:
                new_streak += 1
            elif has_zen_pass:
                # Automagically use a Zen Pass to save the streak!
                new_streak += 1
                zen_passes -= 1
                streak_updated = True
                logger.info(f"User {user_id} used a Zen Pass to save a {new_streak} day streak!")
            else:
                # Streak broken
                new_streak = 1 

            new_total_days += 1
            
            # Award zen pass every 10 days
            if new_streak > 0 and new_streak % 10 == 0:
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

        # Calculate Next Auto-Detox Duration based on Streak (ONLY IF NOT YOGA)
        next_detox_duration = 0
        if not is_yoga:
            detox_streak = user_doc.get("detox_streak", 0)
            base_minutes = 30
            increment = 10 * detox_streak
            next_detox_duration = min(base_minutes + increment, 130) * 60 # Seconds
        
        return {
            "success": True,
            "new_streak": new_streak,
            "points_earned": points_earned,
            "total_days": new_total_days,
            "zen_passes": zen_passes,
            "next_detox_duration": next_detox_duration,
            "is_yoga": is_yoga,
            "streak_updated": streak_updated
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
                "track_type": s.get("track_type"),
                "duration_seconds": s.get("duration_seconds", 0)
            }
            for s in sessions
        ]
    }
