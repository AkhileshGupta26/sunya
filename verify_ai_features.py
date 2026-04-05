import requests
import json
import sys

# Ensure UTF-8 output even on Windows terminals
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

BASE_URL = "http://localhost:8000"

def test_mantra():
    print("--- Testing Personalized Mantra Generator ---")
    try:
        response = requests.post(f"{BASE_URL}/api/yogi/mantra", json={})
        print("Status Code:", response.status_code)
        data = response.json()
        print(f"Mantra: {data.get('sankalpa')}")
        print(f"Explanation: {data.get('explanation')}")
        print(f"Focus Points: {data.get('focus_points')}")
    except Exception as e:
        print(f"Mantra Test Failed: {e}")

def test_search():
    print("\n--- Testing Vedic Smart Search ---")
    queries = [
        "What is the meaning of Pratyahara?",
        "Explain Bhagavad Gita Chapter 2 Verse 47",
        "Karma vs Dharma"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        try:
            response = requests.post(f"{BASE_URL}/api/yogi/search", json={"message": query})
            print("Status Code:", response.status_code)
            data = response.json()
            
            # Use data.get() to avoid KeyErrors if fallback is returned
            shloka = data.get("sanskrit_shloka", "N/A")
            meaning = data.get("shloka_translation", "N/A")
            wisdom = data.get("wisdom", "N/A")
            
            print(f"Shloka: {shloka}")
            print(f"Meaning: {meaning}")
            print(f"Wisdom: {wisdom[:150]}...")
            print(f"Source: {data.get('source_context')}")
            
            if "River of knowledge" in wisdom or "Silence of the Sages" in str(data):
                print("⚠️  Warning: Falling back to static response.")
        except Exception as e:
            print(f"Search Test Failed for '{query}': {e}")

if __name__ == "__main__":
    test_mantra()
    test_search()
