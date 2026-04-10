from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    print("WARNING: MONGO_URL not found in environment. Falling back to localhost. This WILL FAIL on Render.")
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
