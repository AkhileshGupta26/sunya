from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from bson import ObjectId
from backend.database import db
from backend.models import (
    UserResponse, UserProfileUpdate, UserSettingsUpdate, WakeTimeUpdate, 
    DetoxComplete
)
from backend.auth_utils import get_current_user

router = APIRouter(tags=["Users"])

@router.put("/api/user/profile", response_model=UserResponse)
async def update_user_profile(profile_data: UserProfileUpdate, user_id: str = Depends(get_current_user)):
    print(f"DEBUG: Updating profile for {user_id} with data: {profile_data}")
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    updates = {}
    if profile_data.name is not None:
        updates["name"] = profile_data.name
    if profile_data.profile_picture is not None:
        updates["profile_picture"] = profile_data.profile_picture
    if profile_data.settings_gender is not None:
        updates["settings_gender"] = profile_data.settings_gender
    if profile_data.aspirations is not None:
        updates["aspirations"] = profile_data.aspirations
    if profile_data.current_state is not None:
        updates["current_state"] = profile_data.current_state
        
    if updates:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updates}
        )
        
    # Return updated user
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    return UserResponse(
        id=str(updated_user["_id"]),
        name=updated_user.get("name"),
        email=updated_user.get("email"),
        current_streak=updated_user.get("current_streak", 0),
        detox_streak=updated_user.get("detox_streak", 0),
        last_detox_date=updated_user.get("last_detox_date"),
        total_days=updated_user.get("total_days", 0),
        zen_passes=updated_user.get("zen_passes", 0),
        total_points=updated_user.get("total_points", 0),
        wake_time=updated_user.get("wake_time"),
        profile_picture=updated_user.get("profile_picture"),
        circle_id=updated_user.get("circle_id"),
        institution_id=updated_user.get("institution_id"),
        settings_camera_enabled=updated_user.get("settings_camera_enabled", False),
        settings_bpm_check=updated_user.get("settings_bpm_check", False),
        settings_timer_check=updated_user.get("settings_timer_check", False),
        settings_gender=updated_user.get("settings_gender", "male"),
        settings_alarm_enabled=updated_user.get("settings_alarm_enabled", False),
        settings_alarm_time=updated_user.get("settings_alarm_time", "06:00"),
        settings_alarm_ringtone=updated_user.get("settings_alarm_ringtone", "meditation_flute"),
        settings_notifications_enabled=updated_user.get("settings_notifications_enabled", False),
        active_contests=updated_user.get("active_contests", []),
        contest_joined_weekly_at=updated_user.get("contest_joined_weekly_at"),
        contest_joined_monthly_at=updated_user.get("contest_joined_monthly_at"),
        weekly_points=updated_user.get("weekly_points", 0),
        monthly_points=updated_user.get("monthly_points", 0),
        badges=updated_user.get("badges", []),
        aspirations=updated_user.get("aspirations", "Find inner peace and focus"),
        current_state=updated_user.get("current_state", "Feeling balanced")
    )

@router.put("/api/user/settings")
async def update_settings(settings: UserSettingsUpdate, user_id: str = Depends(get_current_user)):
    update_data = {}
    if settings.camera_enabled is not None:
        update_data["settings_camera_enabled"] = settings.camera_enabled
    if settings.bpm_check is not None:
        update_data["settings_bpm_check"] = settings.bpm_check
    if settings.timer_check is not None:
        update_data["settings_timer_check"] = settings.timer_check
    if settings.alarm_enabled is not None:
        update_data["settings_alarm_enabled"] = settings.alarm_enabled
    if settings.alarm_time is not None:
        update_data["settings_alarm_time"] = settings.alarm_time
    if settings.alarm_ringtone is not None:
        update_data["settings_alarm_ringtone"] = settings.alarm_ringtone
    if settings.notifications_enabled is not None:
        update_data["settings_notifications_enabled"] = settings.notifications_enabled
    
    if update_data:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
    
    return {"success": True, "updated": update_data}

@router.put("/api/user/wake-time")
async def update_wake_time(wake_time_data: WakeTimeUpdate, user_id: str = Depends(get_current_user)):
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"wake_time": wake_time_data.wake_time}}
    )
    return {"success": True, "wake_time": wake_time_data.wake_time}

@router.post("/api/detox/complete")
async def complete_detox(data: DetoxComplete, user_id: str = Depends(get_current_user)):
    points_earned = data.duration_minutes * 10  # 10 points per minute
    
    # Update Points
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"total_points": points_earned}}
    )
    
    # Update Detox Streak
    today = datetime.utcnow().strftime("%Y-%m-%d")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    last_detox = user.get("last_detox_date")
    new_detox_streak = user.get("detox_streak", 0)
    
    if last_detox != today: # Only increment once per day
        yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
        if last_detox == yesterday or new_detox_streak == 0:
            new_detox_streak += 1
        elif last_detox != today: # Broken streak
            new_detox_streak = 1
            
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "detox_streak": new_detox_streak,
                "last_detox_date": today
            }}
        )
    
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    return {
        "success": True,
        "points_earned": points_earned,
        "total_points": updated_user.get("total_points", 0),
        "detox_streak": new_detox_streak
    }

@router.get("/api/leaderboard")
async def get_leaderboard(type: str = "global", user_id: str = Depends(get_current_user)):
    # Supported types: global, weekly, monthly, circle
    sort_field = "total_points"
    query = {}
    
    if type == "weekly":
        sort_field = "weekly_points"
    elif type == "monthly":
        sort_field = "monthly_points"
    elif type == "circle":
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        circle_id = user.get("circle_id")
        if not circle_id:
            return {"leaderboard": []}
        query = {"circle_id": circle_id}
        
    users = await db.users.find(query).sort(sort_field, -1).limit(50).to_list(50)
    
    leaderboard = []
    for idx, u in enumerate(users):
        leaderboard.append({
            "rank": idx + 1,
            "id": str(u["_id"]),
            "name": u["name"],
            "points": u.get(sort_field, 0), # Map dynamic field to generic 'points'
            "total_points": u.get("total_points", 0),
            "is_me": str(u["_id"]) == user_id
        })
        
    return {"leaderboard": leaderboard}
