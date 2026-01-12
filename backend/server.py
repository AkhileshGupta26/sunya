from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import logging
from backend.database import client, db_name
from backend.routers import auth, sessions, circles, users

# Create the main app
app = FastAPI()

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router) 
app.include_router(sessions.router) 
app.include_router(circles.router) 

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False, # We use Bearer tokens, not cookies
    allow_origins=["*"],     # Allow all origins safely since credentials are off
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.get("/")
def read_root():
    return {"message": "Sunya API is Live!"}

@app.on_event("startup")
async def startup_db_client():
    # Only creating indexes, connection is handled globally
    try:
        logging.info("Ensuring database indexes...")
        # Email unique index for fast lookups/login
        await client[db_name].users.create_index("email", unique=True)
        # Leaderboard sorting indexes
        await client[db_name].users.create_index([("total_points", -1)])
        await client[db_name].users.create_index([("detox_streak", -1)])
        # Circle lookups
        await client[db_name].users.create_index("circle_id")
        logging.info("Indexes confirmed.")
    except Exception as e:
        logging.error(f"Failed to create indexes: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()