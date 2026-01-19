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
    print(f"DEBUG: User {user_id} attempting to join contest: {data.contest_type}")
    if data.contest_type not in ["weekly", "monthly"]:
        raise HTTPException(status_code=400, detail="Invalid contest type")

    # Time/Schedule Check for Weekly: Mon(0) - Sat(5) Open. Sun(6) Closed.
    if data.contest_type == "weekly":
        # Check temporarily disabled to allow joining regardless of timezone/server time issues
        # pass
        # Use IST (UTC+5:30) to avoid blocking Monday mornings in India
        # Sunday 6:30 PM UTC is already Monday 12:00 AM IST.
        # We want to open as soon as it's Monday in the target market.
        # from datetime import timedelta
        # ist_time = datetime.utcnow() + timedelta(hours=5, minutes=30)
        # weekday = ist_time.weekday()
        
        # if weekday == 6: # Sunday
        #     raise HTTPException(status_code=400, detail="Weekly contest is closed on Sundays. Results calculation in progress.")
        pass

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    active_contests = user.get("active_contests", [])
    
    # Check if already joined
    if data.contest_type in active_contests:
         # Check expiry to be safe? 
         # Assuming get_me handles lazy expiry, but if they call join directly...
         # Let's just return success if it's Monday-Friday.
         return {"success": True, "active_contests": active_contests}

    # Weekly Contest Logic: Checks current week number to ensure fresh start
    current_week = datetime.utcnow().isocalendar()[1]
    
    update_ops = {
        "$addToSet": {"active_contests": data.contest_type}
    }
    
    if data.contest_type == "weekly":
        # Check if user has data from a previous week
        last_week_joined = user.get("weekly_contest_week", 0)
        
        if last_week_joined != current_week:
            # New week, reset points
            update_ops["$set"] = {
                "contest_joined_weekly_at": datetime.utcnow().isoformat(),
                "weekly_points": 0,
                "weekly_contest_week": current_week
            }
        else:
             # Re-joining same week (maybe accidentally left?), keep points
             update_ops["$set"] = {
                "contest_joined_weekly_at": datetime.utcnow().isoformat()
             }
             
    elif data.contest_type == "monthly":
         # 21-Day Challenge Logic (mapped to 'monthly' internally)
         # Check if they are restarting after completion
         update_ops["$set"] = {
            "contest_joined_monthly_at": datetime.utcnow().isoformat(),
            # Only reset if they want a fresh start or it's their first time
            # For now, we assume 'Join' means Start/Restart
            "monthly_points": 0 
         }

    # Execute
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        update_ops
    )
    
    # Return updated list
    active_contests.append(data.contest_type)
    return {"success": True, "active_contests": active_contests}

@router.get("/standing")
async def get_standing(contest_type: str = "global", user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user: raise HTTPException(status_code=404, detail="User not found")

    # Determine which points to use
    if contest_type == "weekly":
        my_points = user.get("weekly_points", 0)
        query_field = "weekly_points"
        # Filter for users active in weekly?
        # Maybe rank against EVERYONE who has weekly_points > 0? 
        # Or only those currently in "active_contests": "weekly"?
        # User said "data removed then next contest starts". 
        # So we should only rank against valid participants.
        filter_query = {"active_contests": "weekly"} 
    elif contest_type == "monthly":
        my_points = user.get("monthly_points", 0)
        query_field = "monthly_points"
        filter_query = {"active_contests": "monthly"}
    else:
        my_points = user.get("total_points", 0)
        query_field = "total_points"
        filter_query = {} # All users

    total_users = await db.users.count_documents(filter_query)
    if total_users <= 1:
        return {"percentile": 100.0, "total_users": total_users, "my_points": my_points}
        
    # Users active in this contest with fewer points
    users_below = await db.users.count_documents({**filter_query, query_field: {"$lt": my_points}})
    users_above = await db.users.count_documents({**filter_query, query_field: {"$gt": my_points}})
    
    rank = users_above + 1
    top_percent = (rank / total_users) * 100
    
    return {
        "percentile": round(top_percent, 1),
        "rank": rank,
        "total_users": total_users,
        "my_points": my_points,
        "contest_type": contest_type
    }

@router.get("/leaderboard")
async def get_contest_leaderboard(contest_type: str = "global", user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    if contest_type == "weekly":
        query_field = "weekly_points"
        filter_query = {"active_contests": "weekly"}
    elif contest_type == "monthly":
        query_field = "monthly_points"
        filter_query = {"active_contests": "monthly"}
    else:
        # Default to active contest if not specified? 
        # Or old behavior behavior? 
        # Let's keep "global" as total_points
        query_field = "total_points"
        filter_query = {}

    # Get users
    users = await db.users.find(filter_query).sort(query_field, -1).limit(50).to_list(50)
    
    leaderboard = []
    for idx, u in enumerate(users):
        leaderboard.append({
            "rank": idx + 1,
            "id": str(u["_id"]),
            "name": u["name"],
            "total_points": u.get(query_field, 0), # polymorphic return
            "is_me": str(u["_id"]) == user_id,
            "badges": u.get("badges", [])
        })
        
    return {"contest_type": contest_type, "leaderboard": leaderboard}

@router.post("/claim-rewards")
async def claim_rewards(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user: raise HTTPException(status_code=404, detail="User not found")
    
    # Logic remains similar but could be scoped. 
    # For now, keep it simple mock.
    return {"new_badges": []}
