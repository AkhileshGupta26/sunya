from fastapi import APIRouter, HTTPException, Depends
from backend.database import db
from backend.auth_utils import get_current_user
from backend.models import UserResponse
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/contests", tags=["Contests"])

class JoinContestRequest(BaseModel):
    contest_type: str  # "weekly" or "monthly"

@router.post("/join")
async def join_contest(data: JoinContestRequest, user_id: str = Depends(get_current_user)):
    if data.contest_type not in ["weekly", "monthly"]:
        raise HTTPException(status_code=400, detail="Invalid contest type")

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    current_contest = user.get("active_contest", "none")
    if current_contest != "none":
        raise HTTPException(status_code=400, detail=f"You are already in a {current_contest} contest")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "active_contest": data.contest_type,
            "contest_joined_at": datetime.utcnow().isoformat()
        }}
    )

    return {"success": True, "active_contest": data.contest_type}

@router.get("/standing")
async def get_standing(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    my_points = user.get("total_points", 0)
    
    # Count how many users have FEWER points than me
    # Percentile = (Users with < my_points) / Total Users * 100
    total_users = await db.users.count_documents({})
    if total_users <= 1:
        return {"percentile": 100.0, "total_users": total_users, "my_points": my_points}
        
    users_below = await db.users.count_documents({"total_points": {"$lt": my_points}})
    
    # Calculate percentile (0 to 100)
    # If I am the top user, users_below = total_users - 1. 
    # (total - 1) / total * 100 is close to 100 but not quite.
    # Standard formula: (Rank / N) * 100 is often inverse.
    
    # Let's use "Top X%" logic.
    # Users ABOVE me:
    users_above = await db.users.count_documents({"total_points": {"$gt": my_points}})
    
    # Top X% = (Rank / Total) * 100
    # Rank 1 = 1 user above (0) + 1 = 1.
    rank = users_above + 1
    top_percent = (rank / total_users) * 100
    
    return {
        "percentile": round(top_percent, 1), # e.g. "Top 5.2%"
        "rank": rank,
        "total_users": total_users,
        "my_points": my_points
    }

@router.get("/leaderboard")
async def get_contest_leaderboard(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    active_contest = user.get("active_contest", "none")
    
    if active_contest == "none":
        return {"active_contest": "none", "leaderboard": []}
        
    # Get users in the SAME contest
    users = await db.users.find({"active_contest": active_contest}).sort("total_points", -1).limit(50).to_list(50)
    
    leaderboard = []
    for idx, u in enumerate(users):
        leaderboard.append({
            "rank": idx + 1,
            "id": str(u["_id"]),
            "name": u["name"],
            "total_points": u.get("total_points", 0),
            "is_me": str(u["_id"]) == user_id,
            "badges": u.get("badges", [])
        })
        
    return {"active_contest": active_contest, "leaderboard": leaderboard}

@router.post("/claim-rewards")
async def claim_rewards(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # MOCK LOGIC for Demonstration
    # In production: Check Date vs Contest End Date -> Calculate Rank -> Award
    
    current_badges = user.get("badges", [])
    new_badges = []
    
    # Simple Rule: If > 1000 points and no Gold Badge, give Gold
    total_points = user.get("total_points", 0)
    
    if total_points >= 1000 and "Weekly Gold 🏆" not in current_badges:
        new_badges.append("Weekly Gold 🏆")
    elif total_points >= 500 and "Weekly Silver 🥈" not in current_badges:
        new_badges.append("Weekly Silver 🥈")
        
    if new_badges:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"badges": {"$each": new_badges}}}
        )
        return {"new_badges": new_badges}
        
    return {"new_badges": []}
