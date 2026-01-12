from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from typing import List
import random
import string
from bson import ObjectId
from backend.database import db
from backend.models import (
    CircleCreate, CircleJoin, CircleResponse, ZenNudge, 
    InstitutionJoin, InstitutionResponse
)
from backend.auth_utils import get_current_user

router = APIRouter(tags=["Circles"])

def generate_circle_code():
    return ''.join(random.choices(string.digits, k=6))

@router.post("/api/circles/create", response_model=CircleResponse)
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

@router.post("/api/circles/join", response_model=CircleResponse)
async def join_circle(join_data: CircleJoin, user_id: str = Depends(get_current_user)):
    circle = await db.circles.find_one({"code": join_data.code})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    # Check if already a member of *any* circle
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if user_doc.get("circle_id"):
        raise HTTPException(status_code=400, detail="You are already in a circle. Leave it first.")
    
    # Check if already a member (redundant but safe)
    if any(m["user_id"] == user_id for m in circle["members"]):
        raise HTTPException(status_code=400, detail="Already a member")
    
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

@router.get("/api/circles/my-circle")
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

@router.post("/api/circles/leave")
async def leave_circle(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    circle_id = user_doc.get("circle_id")
    
    if not circle_id:
        raise HTTPException(status_code=400, detail="Not in a circle")
        
    # Remove from circle using MongoDB $pull
    await db.circles.update_one(
        {"_id": ObjectId(circle_id)},
        {"$pull": {"members": {"user_id": user_id}}}
    )
    
    # Update user (remove circle_id)
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$unset": {"circle_id": ""}}
    )
    
    return {"success": True, "message": "Left circle"}

@router.post("/api/circles/nudge")
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

@router.post("/api/institutions/join")
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

@router.get("/api/institutions/leaderboard")
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
