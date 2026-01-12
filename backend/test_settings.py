import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_wake_time():
    print("Testing Wake Time Update...")
    # Login to get token
    auth_url = f"{BASE_URL}/auth/login"
    auth_data = {
        "email": "test_script_user@example.com",
        "password": "password123"
    }
    
    try:
        # Login
        response = requests.post(auth_url, json=auth_data)
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return
            
        token = response.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Update Wake Time
        update_url = f"{BASE_URL}/user/wake-time"
        update_data = {"wake_time": "05:30"}
        
        update_resp = requests.put(update_url, json=update_data, headers=headers)
        print(f"Update Status: {update_resp.status_code}")
        print(f"Update Response: {update_resp.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_wake_time()
