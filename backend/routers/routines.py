from fastapi import APIRouter, Header, HTTPException, Depends
from backend.database import db
from backend.models import RoutineLikeRequest, RoutineLikeResponse
from backend.auth_utils import verify_token
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/routines", tags=["routines"])

@router.get("/status/{routine_id}", response_model=RoutineLikeResponse)
async def get_routine_status(routine_id: str, authorization: str = Header(None)):
    user_id = None
    if authorization:
        try:
            payload = verify_token(authorization.split(" ")[1])
            user_id = payload.get("sub")
        except:
            pass # Allow viewing count even if not logged in (or token invalid)

    # Get total likes
    count = await db.routine_likes.count_documents({"routine_id": routine_id})
    
    # Check if user liked
    is_liked = False
    if user_id:
        existing = await db.routine_likes.find_one({
            "user_id": user_id,
            "routine_id": routine_id
        })
        if existing:
            is_liked = True

    return {
        "likes_count": count,
        "is_liked": is_liked
    }

@router.post("/like", response_model=RoutineLikeResponse)
async def toggle_like(req: RoutineLikeRequest, authorization: str = Header(...)):
    try:
        payload = verify_token(authorization.split(" ")[1])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    existing = await db.routine_likes.find_one({
        "user_id": user_id,
        "routine_id": req.routine_id
    })

    if existing:
        # Unlike
        await db.routine_likes.delete_one({"_id": existing["_id"]})
    else:
        # Like
        await db.routine_likes.insert_one({
            "user_id": user_id,
            "routine_id": req.routine_id,
            "created_at": datetime.utcnow()
        })

    # Return new stats
    count = await db.routine_likes.count_documents({"routine_id": req.routine_id})
    # We know is_liked based on toggle action, but query to be safe/simple or infer
    # If we deleted, it's false. If we inserted, it's true.
    is_liked = not existing 

    return {
        "likes_count": count,
        "is_liked": is_liked
    }
