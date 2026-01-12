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
            "profile_picture": None
        }
    }

@router.post("/login")
async def login(user: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": user.email})
    if not user_doc or not verify_password(user.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
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
            "profile_picture": user_doc.get("profile_picture")
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
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
        settings_gender=user_doc.get("settings_gender", "male")
    )
