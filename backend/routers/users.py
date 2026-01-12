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
        settings_gender=updated_user.get("settings_gender", "male")
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
    if type == "circle":
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        circle_id = user.get("circle_id")
        
        if not circle_id:
            return {"leaderboard": []}
            
        users = await db.users.find({"circle_id": circle_id}).sort("total_points", -1).limit(20).to_list(20)
    else:
        # Global
        users = await db.users.find().sort("total_points", -1).limit(50).to_list(50)
    
    leaderboard = []
    for idx, u in enumerate(users):
        leaderboard.append({
            "rank": idx + 1,
            "id": str(u["_id"]),
            "name": u["name"],
            "total_points": u.get("total_points", 0),
            "is_me": str(u["_id"]) == user_id
        })
        
    return {"leaderboard": leaderboard}
