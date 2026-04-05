import os
import google.generativeai as genai
import json
import re
from dotenv import load_dotenv

# Load .env
load_dotenv("c:/Users/MSI/.gemini/antigravity/scratch/sunya/backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found")
    exit(1)

genai.configure(api_key=api_key)

MEDITATION_TRACKS = [
    {"id": "flute_music", "name": "Flute Music", "description": "Relaxing flute melody"},
    {"id": "beauty", "name": "Beauty", "description": "Radiant & calming vibes"},
    {"id": "silence", "name": "Sunya Silence", "description": "Absolute silence (Advanced, insight)"},
    {"id": "om_awareness", "name": "Om Awareness", "description": "Single Om / AUM chant (Focus)"},
    {"id": "cosmic_universe", "name": "Cosmic Universe Sound", "description": "Deep space ambience"},
    {"id": "rainfall", "name": "Rainfall", "description": "Soothing rain sounds"},
    {"id": "forest_presence", "name": "Forest Presence", "description": "Birds & leaves (Grounding)"},
    {"id": "bird_chirping", "name": "Bird Chirping", "description": "Gentle birdsong & piano"},
    {"id": "ocean", "name": "Ocean", "description": "Calming ocean waves"},
]

YOGA_TRACKS = [
    {"id": "nadi_shodhana", "name": "Nadi Shodhana", "description": "Alternate Nostril Breathing for balance"},
    {"id": "hatha", "name": "Hatha Yoga", "description": "Slow-paced stretching & breathing"},
    {"id": "vinyasa", "name": "Vinyasa Flow", "description": "Dynamic movement & energy"},
    {"id": "yin", "name": "Yin Yoga", "description": "Deep tissue release & calm"},
]

SYSTEM_PROMPT = f"""
You are the "Sunya Guru", a wise and compassionate AI mentor for the Sunya mindfulness app. 
Your goal is to provide personalized guidance rooted in Vedic philosophy, mindfulness, and breathwork.

Tone: Calm, encouraging, poetic, and grounded.

Available Meditation Tracks: {json.dumps(MEDITATION_TRACKS)}
Available Yoga Tracks: {json.dumps(YOGA_TRACKS)}

When a user shares their feelings or state of mind:
1. Provide a short, wise reflection (2-3 sentences).
2. Recommend ONE specific track from the lists above.
3. Your output must be ONLY a raw JSON object (no markdown, no backticks) with this structure:
{{
  "wisdom": "The reflection text",
  "recommended_track_id": "the_track_id",
  "track_type": "meditation" OR "yoga"
}}
"""

def test_guru(message):
    try:
        # Testing with gemini-flash-latest confirmed working in this env
        model_name = 'gemini-flash-latest'
        print(f"Testing with model: {model_name}")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(f"{SYSTEM_PROMPT}\n\nUser input: {message}")
        
        text = response.text.strip()
        print(f"Raw response: {text}")

        # Extract JSON using regex
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
            
        data = json.loads(text)
        print(f"Parsed data: {data}")
        
        # Validate ID
        valid_ids = [t['id'] for t in MEDITATION_TRACKS] + [t['id'] for t in YOGA_TRACKS]
        if data.get('recommended_track_id') not in valid_ids:
            print(f"Warning: Invalid ID recommended: {data.get('recommended_track_id')}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_guru("I am feeling very anxious and can't sleep.")
