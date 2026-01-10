from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from bson import ObjectId
import random
import string

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "shunya-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

def generate_circle_code():
    return ''.join(random.choices(string.digits, k=6))

# Pydantic Models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    current_streak: int
    total_days: int
    zen_passes: int
    wake_time: Optional[str] = None
    circle_id: Optional[str] = None
    institution_id: Optional[str] = None

class WakeTimeUpdate(BaseModel):
    wake_time: str  # Format: "HH:MM"

class MeditationSession(BaseModel):
    track_type: str  # vedic, nature, guided, silence
    completed: bool
    bpm_verified: bool
    awareness_probe_passed: bool

class SessionResponse(BaseModel):
    id: str
    date: str
    track_type: str
    completed: bool
    grace_timer_completed: bool

class CircleCreate(BaseModel):
    name: str

class CircleJoin(BaseModel):
    code: str

class CircleResponse(BaseModel):
    id: str
    code: str
    name: str
    harmony_score: float
    members: List[dict]

class ZenNudge(BaseModel):
    target_user_id: str
    message: str = "Time to meditate! 🧘"

class InstitutionJoin(BaseModel):
    institution_name: str

class InstitutionResponse(BaseModel):
    id: str
    name: str
    total_minutes: int
    member_count: int
    rank: int

# Authentication Endpoints
@api_router.post("/auth/register")
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
        "total_days": 0,
        "zen_passes": 0,
        "wake_time": None,
        "circle_id": None,
        "institution_id": None,
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
            "zen_passes": 0
        }
    }

@api_router.post("/auth/login")
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
            "total_days": user_doc["total_days"],
            "zen_passes": user_doc["zen_passes"],
            "wake_time": user_doc.get("wake_time"),
            "circle_id": user_doc.get("circle_id"),
            "institution_id": user_doc.get("institution_id")
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user_doc["_id"]),
        name=user_doc["name"],
        email=user_doc["email"],
        current_streak=user_doc["current_streak"],
        total_days=user_doc["total_days"],
        zen_passes=user_doc["zen_passes"],
        wake_time=user_doc.get("wake_time"),
        circle_id=user_doc.get("circle_id"),
        institution_id=user_doc.get("institution_id")
    )

# User Settings
@api_router.put("/user/wake-time")
async def update_wake_time(wake_time_data: WakeTimeUpdate, user_id: str = Depends(get_current_user)):
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"wake_time": wake_time_data.wake_time}}
    )
    return {"success": True, "wake_time": wake_time_data.wake_time}

# Meditation Sessions
@api_router.post("/sessions/start")
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

@api_router.post("/sessions/complete")
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
        
        return {
            "success": True,
            "new_streak": new_streak,
            "total_days": new_total_days,
            "zen_passes": zen_passes
        }
    
    return {"success": True}

@api_router.get("/sessions/today")
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

@api_router.get("/sessions/history")
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

# Family Circles
@api_router.post("/circles/create", response_model=CircleResponse)
async def create_circle(circle_data: CircleCreate, user_id: str = Depends(get_current_user)):
    # Generate unique code
    code = generate_circle_code()
    while await db.circles.find_one({"code": code}):
        code = generate_circle_code()
    
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    
    circle_doc = {
        "code": code,
        "name": circle_data.name,
        "creator_id": user_id,
        "members": [{
            "user_id": user_id,
            "name": user_doc["name"],
            "joined_at": datetime.utcnow()
        }],
        "harmony_score": 0,
        "created_at": datetime.utcnow()
    }
    result = await db.circles.insert_one(circle_doc)
    
    # Update user's circle_id
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"circle_id": str(result.inserted_id)}}
    )
    
    return CircleResponse(
        id=str(result.inserted_id),
        code=code,
        name=circle_data.name,
        harmony_score=0,
        members=circle_doc["members"]
    )

@api_router.post("/circles/join", response_model=CircleResponse)
async def join_circle(join_data: CircleJoin, user_id: str = Depends(get_current_user)):
    circle = await db.circles.find_one({"code": join_data.code})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    # Check if already a member
    if any(m["user_id"] == user_id for m in circle["members"]):
        raise HTTPException(status_code=400, detail="Already a member")
    
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    
    # Add user to circle
    await db.circles.update_one(
        {"_id": circle["_id"]},
        {"$push": {"members": {
            "user_id": user_id,
            "name": user_doc["name"],
            "joined_at": datetime.utcnow()
        }}}
    )
    
    # Update user's circle_id
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"circle_id": str(circle["_id"])}}
    )
    
    updated_circle = await db.circles.find_one({"_id": circle["_id"]})
    
    return CircleResponse(
        id=str(updated_circle["_id"]),
        code=updated_circle["code"],
        name=updated_circle["name"],
        harmony_score=updated_circle["harmony_score"],
        members=updated_circle["members"]
    )

@api_router.get("/circles/my-circle")
async def get_my_circle(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc.get("circle_id"):
        return {"circle": None}
    
    circle = await db.circles.find_one({"_id": ObjectId(user_doc["circle_id"])})
    if not circle:
        return {"circle": None}
    
    # Calculate harmony score based on today's completions
    today = datetime.utcnow().strftime("%Y-%m-%d")
    completed_count = 0
    for member in circle["members"]:
        session = await db.sessions.find_one({
            "user_id": member["user_id"],
            "date": today,
            "completed": True
        })
        if session:
            completed_count += 1
    
    harmony_score = (completed_count / len(circle["members"])) * 100 if circle["members"] else 0
    
    # Update harmony score
    await db.circles.update_one(
        {"_id": circle["_id"]},
        {"$set": {"harmony_score": harmony_score}}
    )
    
    return {
        "circle": {
            "id": str(circle["_id"]),
            "code": circle["code"],
            "name": circle["name"],
            "harmony_score": harmony_score,
            "members": circle["members"]
        }
    }

@api_router.post("/circles/nudge")
async def send_nudge(nudge_data: ZenNudge, user_id: str = Depends(get_current_user)):
    # In a real app, this would send a push notification
    # For now, we'll just record it
    nudge_doc = {
        "from_user_id": user_id,
        "to_user_id": nudge_data.target_user_id,
        "message": nudge_data.message,
        "sent_at": datetime.utcnow()
    }
    await db.nudges.insert_one(nudge_doc)
    return {"success": True, "message": "Nudge sent!"}

# Institutions
@api_router.post("/institutions/join")
async def join_institution(inst_data: InstitutionJoin, user_id: str = Depends(get_current_user)):
    # Find or create institution
    institution = await db.institutions.find_one({"name": inst_data.institution_name})
    
    if not institution:
        inst_doc = {
            "name": inst_data.institution_name,
            "total_minutes": 0,
            "member_count": 1,
            "created_at": datetime.utcnow()
        }
        result = await db.institutions.insert_one(inst_doc)
        institution_id = str(result.inserted_id)
    else:
        institution_id = str(institution["_id"])
        await db.institutions.update_one(
            {"_id": institution["_id"]},
            {"$inc": {"member_count": 1}}
        )
    
    # Update user
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"institution_id": institution_id}}
    )
    
    return {"success": True, "institution_id": institution_id}

@api_router.get("/institutions/leaderboard")
async def get_institution_leaderboard():
    institutions = await db.institutions.find().sort("total_minutes", -1).limit(50).to_list(50)
    
    return {
        "leaderboard": [
            {
                "rank": idx + 1,
                "name": inst["name"],
                "total_minutes": inst["total_minutes"],
                "member_count": inst["member_count"]
            }
            for idx, inst in enumerate(institutions)
        ]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()