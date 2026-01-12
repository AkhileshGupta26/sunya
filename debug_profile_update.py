
import requests
import json

BASE_URL = "http://localhost:8000/api"

import requests
import json
import time
import random

BASE_URL = "http://localhost:8000/api"

def debug_profile():
    # 0. Register
    email = f"debug_{int(time.time())}_{random.randint(1000,9999)}@sunya.app"
    password = "password123"
    name = "Debug User"
    
    print(f"Registering {email}...")
    resp = requests.post(f"{BASE_URL}/auth/register", json={
        "name": name,
        "email": email,
        "password": password
    })
    
    if resp.status_code != 200:
        print(f"Registration failed: {resp.text}")
        # Try login if already exists (unlikely with timestamp)
        
    # 1. Login
    print("Logging in...")
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return

    data = resp.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    # ... rest of the script
    current_gender = data["user"].get("settings_gender", "male")
    print(f"Current gender: {current_gender}")

    # 2. Update Profile
    new_gender = "female" if current_gender == "male" else "male"
    new_name = "Debug User Updated"
    
    print(f"Updating to gender: {new_gender}, name: {new_name}")
    
    resp = requests.put(
        f"{BASE_URL}/user/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": new_name,
            "settings_gender": new_gender
        }
    )
    
    if resp.status_code != 200:
        print(f"Update failed: {resp.text}")
        return

    updated_user = resp.json()
    print(f"Update response gender: {updated_user.get('settings_gender')}")
    print(f"Update response name: {updated_user.get('name')}")

    # 3. Verify with /me
    print("Verifying with /me...")
    resp = requests.get(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    me_data = resp.json()
    print(f"Me endpoint gender: {me_data.get('settings_gender')}")
    print(f"Me endpoint name: {me_data.get('name')}")
    
    if me_data.get("settings_gender") == new_gender and me_data.get("name") == new_name:
        print("SUCCESS: Profile updated and verified.")
    else:
        print("FAILURE: Profile update not reflected in /me.")

if __name__ == "__main__":
    try:
        debug_profile()
    except Exception as e:
        print(f"Error: {e}")
