from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
# Debug: List all relevant env keys (names only) to verify Render dashboard sync
print("--- ENVIRONMENT DIAGNOSTICS ---")
found_keys = [k for k in os.environ.keys() if any(x in k for x in ['MONGO', 'SECRET', 'GROQ', 'DB_'])]
print(f"DEBUG: Found relevant environment keys: {found_keys}")

# Check multiple common names for better compatibility with different hosting environments
mongo_url = os.environ.get('MONGODB_URI') or os.environ.get('MONGO_URI') or os.environ.get('MONGO_URL')

if not mongo_url:
    print("WARNING: Database URL (MONGODB_URI/MONGO_URL) not found in environment. Falling back to localhost. This WILL FAIL on Render.")
    mongo_url = 'mongodb://localhost:27017'

client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'sunyab_db')
db = client[db_name]

async def test_db_connection():
    try:
        # The is_master command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print(f"✅ Database connected successfully to: {db_name}")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
