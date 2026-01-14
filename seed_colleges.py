from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv('backend/.env')

# Use correct variable name from .env
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "sunya")

if not MONGO_URL:
    print("Error: MONGO_URL not found in .env")
    exit(1)

colleges = [
    # Premier National Institutes
    "Indian Institute of Science, Bengaluru",
    "Indian Institute of Technology Bombay",
    "Indian Institute of Technology Delhi",
    "Indian Institute of Technology Madras",
    "Indian Institute of Technology Kanpur",
    "Indian Institute of Technology Kharagpur",
    "Indian Institute of Technology Roorkee",
    "Indian Institute of Technology Guwahati",
    "Indian Institute of Technology Hyderabad",
    "Indian Institute of Technology (Banaras Hindu University), Varanasi",

    # National Institutes of Technology
    "National Institute of Technology Tiruchirappalli",
    "National Institute of Technology Karnataka, Surathkal",
    "National Institute of Technology Warangal",
    "National Institute of Technology Calicut",
    "National Institute of Technology Rourkela",
    "National Institute of Technology Kurukshetra",
    "Motilal Nehru National Institute of Technology Allahabad",

    # Central & State Universities (Top)
    "Delhi Technological University",
    "Netaji Subhas University of Technology",
    "Jamia Millia Islamia",
    "Banaras Hindu University",
    "Aligarh Muslim University",
    "Anna University",
    "University of Delhi",

    # Major Private & Deemed Universities
    "Birla Institute of Technology and Science, Pilani",
    "Vellore Institute of Technology",
    "SRM Institute of Science and Technology",
    "Manipal Academy of Higher Education",
    "Thapar Institute of Engineering and Technology",
    "Amity University, Noida",
    "Shiv Nadar University",
    "Lovely Professional University",
    "Chandigarh University",

    # Major Colleges in Uttar Pradesh
    "Harcourt Butler Technical University, Kanpur",
    "Institute of Engineering and Technology, Lucknow",
    "G.L. Bajaj Institute of Technology and Management",
    "Galgotias College of Engineering and Technology",
    "Galgotias University",
    "Sharda University",
    "Noida Institute of Engineering and Technology",
    "JSS Academy of Technical Education, Noida",
    "KIET Group of Institutions, Ghaziabad",
    "ABES Engineering College"
]

def seed():
    print(f"Connecting to MongoDB...")
    try:
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Determine collection name (backend uses db.institutions)
        collection = db.institutions
        
        # Ensure index
        collection.create_index("name", unique=True)
        
        print(f"Seeding {len(colleges)} colleges...")
        count = 0
        for name in colleges:
            try:
                # Upsert
                res = collection.update_one(
                    {"name": name},
                    {"$setOnInsert": {"name": name, "total_minutes": 0, "member_count": 0}},
                    upsert=True
                )
                if res.upserted_id:
                    count += 1
            except Exception as e:
                print(f"Error inserting {name}: {e}")
                
        print(f"Seeding Complete. Added {count} new colleges.")
        client.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    seed()
