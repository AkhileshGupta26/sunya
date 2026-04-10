from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from backend.database import db
from backend.models import UserRegister, UserLogin, UserResponse
from backend.auth_utils import get_password_hash, verify_password, create_access_token, get_current_user
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
async def register(user: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_doc = {
        "name": user.name,
        "email": user.email,
        "password_hash": get_password_hash(user.password),
        "current_streak": 0,
        "detox_streak": 0,
        "last_detox_date": None,
        "total_days": 0,
        "zen_passes": 0,
        "total_points": 0,
        "wake_time": None,
        "circle_id": None,
        "institution_id": None,
        "settings_camera_enabled": False,
        "settings_bpm_check": False,
        "settings_timer_check": False,
        "settings_gender": user.settings_gender,
        "active_contest": "none",
        "contest_joined_at": None,
        "badges": [],
        "created_at": datetime.utcnow()
    }
    result = await db.users.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(result.inserted_id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(result.inserted_id),
            "name": user.name,
            "email": user.email,
            "current_streak": 0,
            "total_days": 0,
            "zen_passes": 0,
            "settings_gender": user.settings_gender,
            "active_contest": "none",
            "badges": [],
            "profile_picture": None
        }
    }

@router.post("/login")
async def login(user: UserLogin):
    print(f"DEBUG: Login attempt started for email: {user.email}")
    # Find user
    try:
        user_doc = await db.users.find_one({"email": user.email})
        if not user_doc:
            print(f"DEBUG: User not found: {user.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        print(f"DEBUG: User found in DB. Verifying password...")
        if not verify_password(user.password, user_doc["password_hash"]):
            print(f"DEBUG: Password verification failed for: {user.email}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        print(f"DEBUG: Password verified. Creating token...")
    except Exception as e:
        print(f"DEBUG: Database or Server Error during login: {e}")
        raise HTTPException(status_code=500, detail="Internal server error connecting to wisdom stream")
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user_doc["_id"])})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user_doc["_id"]),
            "name": user_doc["name"],
            "email": user_doc["email"],
            "current_streak": user_doc["current_streak"],
            "detox_streak": user_doc.get("detox_streak", 0),
            "last_detox_date": user_doc.get("last_detox_date"),
            "total_days": user_doc["total_days"],
            "zen_passes": user_doc["zen_passes"],
            "total_points": user_doc.get("total_points", 0),
            "wake_time": user_doc.get("wake_time"),
            "circle_id": user_doc.get("circle_id"),
            "institution_id": user_doc.get("institution_id"),
            "settings_camera_enabled": user_doc.get("settings_camera_enabled", False),
            "settings_bpm_check": user_doc.get("settings_bpm_check", False),
            "settings_timer_check": user_doc.get("settings_timer_check", False),
            "settings_gender": user_doc.get("settings_gender", "male"),
            "active_contest": user_doc.get("active_contest", "none"),
            "contest_joined_at": user_doc.get("contest_joined_at"),
            "badges": user_doc.get("badges", []),
            "profile_picture": user_doc.get("profile_picture")
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # --- Migration Logic (Old -> New) ---
    active_contests = user_doc.get("active_contests", [])
    joined_weekly = user_doc.get("contest_joined_weekly_at")
    joined_monthly = user_doc.get("contest_joined_monthly_at")
    
    old_active = user_doc.get("active_contest", "none")
    old_joined = user_doc.get("contest_joined_at")
    
    # If using old schema, migrate in memory (and optionally DB, but lazy is fine)
    if not active_contests and old_active != "none":
        if old_active == "weekly":
            active_contests.append("weekly")
            joined_weekly = old_joined
        elif old_active == "monthly":
            active_contests.append("monthly")
            joined_monthly = old_joined

    # --- Lazy Expiry Checks (Independent) ---
    updates = {}
    
    # Weekly Check
    if "weekly" in active_contests and joined_weekly:
        try:
            start_date = joined_weekly if isinstance(joined_weekly, datetime) else datetime.fromisoformat(joined_weekly)
            if (datetime.utcnow() - start_date).days >= 7:
                 active_contests.remove("weekly")
                 joined_weekly = None
                 updates["contest_joined_weekly_at"] = None
        except (ValueError, TypeError):
            pass

    # Monthly Check
    if "monthly" in active_contests and joined_monthly:
        try:
            start_date = joined_monthly if isinstance(joined_monthly, datetime) else datetime.fromisoformat(joined_monthly)
            if (datetime.utcnow() - start_date).days >= 30:
                 active_contests.remove("monthly")
                 joined_monthly = None
                 updates["contest_joined_monthly_at"] = None
        except (ValueError, TypeError):
             pass
             
    # Persist updates if any expiration happened
    if updates or ("active_contests" not in user_doc and old_active != "none"):
        # We also save the migrated list to DB to finalize migration
        updates["active_contests"] = active_contests
        if joined_weekly: updates["contest_joined_weekly_at"] = joined_weekly
        if joined_monthly: updates["contest_joined_monthly_at"] = joined_monthly
        
        await db.users.update_one({"_id": user_doc["_id"]}, {"$set": updates})

    return UserResponse(
        id=str(user_doc["_id"]),
        name=user_doc["name"],
        email=user_doc["email"],
        current_streak=user_doc["current_streak"],
        detox_streak=user_doc.get("detox_streak", 0),
        last_detox_date=user_doc.get("last_detox_date"),
        total_days=user_doc["total_days"],
        zen_passes=user_doc["zen_passes"],
        total_points=user_doc.get("total_points", 0),
        wake_time=user_doc.get("wake_time"),
        profile_picture=user_doc.get("profile_picture"),
        circle_id=user_doc.get("circle_id"),
        institution_id=user_doc.get("institution_id"),
        settings_camera_enabled=user_doc.get("settings_camera_enabled", False),
        settings_bpm_check=user_doc.get("settings_bpm_check", False),
        settings_timer_check=user_doc.get("settings_timer_check", False),
        settings_gender=user_doc.get("settings_gender", "male"),
        active_contests=active_contests,
        contest_joined_weekly_at=joined_weekly if isinstance(joined_weekly, str) else (joined_weekly.isoformat() if joined_weekly else None),
        contest_joined_monthly_at=joined_monthly if isinstance(joined_monthly, str) else (joined_monthly.isoformat() if joined_monthly else None),
        weekly_points=user_doc.get("weekly_points", 0),
        monthly_points=user_doc.get("monthly_points", 0),
        badges=user_doc.get("badges", [])
    )
