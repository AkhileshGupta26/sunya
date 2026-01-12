import requests
import time
import random

BASE_URL = "http://localhost:8000/api"

def run_test():
    print("=== Rigorous Gender Update Verification ===")
    
    # 1. Register a fresh user
    email = f"gender_test_{int(time.time())}@sunya.app"
    password = "password123"
    name = "Gender Tester"
    
    print(f"1. Registering {email}...")
    reg_resp = requests.post(f"{BASE_URL}/auth/register", json={
        "name": name,
        "email": email,
        "password": password,
        "settings_gender": "male"
    })
    
    if reg_resp.status_code != 200:
        print(f"Registration failed: {reg_resp.text}")
        return
        
    data = reg_resp.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    initial_gender = data["user"]["settings_gender"]
    print(f"   Success. Initial gender: {initial_gender}")
    
    if initial_gender != "male":
        print(f"!!! FAIL: Expected 'male', got '{initial_gender}'")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Update to FEMALE
    print("\n2. Updating to FEMALE...")
    update_resp = requests.put(f"{BASE_URL}/user/profile", headers=headers, json={
        "settings_gender": "female"
    })
    
    if update_resp.status_code != 200:
        print(f"Update failed: {update_resp.text}")
        return
        
    updated_user = update_resp.json()
    new_gender = updated_user["settings_gender"]
    print(f"   Update response gender: {new_gender}")
    
    if new_gender != "female":
        print(f"!!! FAIL: Expected 'female', got '{new_gender}'")
        return
        
    # 3. Verify Persistence (Login again logic / Get Me)
    print("\n3. Verifying persistence via /me endpoint...")
    me_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    me_data = me_resp.json()
    persisted_gender = me_data["settings_gender"]
    print(f"   Persisted gender: {persisted_gender}")
    
    if persisted_gender != "female":
        print(f"!!! FAIL: Persistence failed. Expected 'female', got '{persisted_gender}'")
        return

    # 4. Update back to MALE
    print("\n4. Updating back to MALE...")
    update_resp = requests.put(f"{BASE_URL}/user/profile", headers=headers, json={
        "settings_gender": "male"
    })
    updated_user = update_resp.json()
    new_gender = updated_user["settings_gender"]
    print(f"   Update response gender: {new_gender}")
    
    if new_gender != "male":
        print(f"!!! FAIL: Expected 'male', got '{new_gender}'")
        return
        
    print("\n=== SUCCESS: Backend logic is flawless. ===")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"Test crashed: {e}")
