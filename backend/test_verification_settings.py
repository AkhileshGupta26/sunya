import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_verification_settings():
    print("Testing Verification Settings Update...")
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
        
        # Update Settings
        update_url = f"{BASE_URL}/user/settings"
        
        # Test enabling everything
        print("\nEnabling all settings...")
        update_data = {
            "camera_enabled": True,
            "bpm_check": True,
            "timer_check": True
        }
        update_resp = requests.put(update_url, json=update_data, headers=headers)
        print(f"Update Status: {update_resp.status_code}")
        print(f"Update Response: {update_resp.text}")

        # Verify persistence via /auth/me
        me_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        user_data = me_resp.json()
        print(f"User Data (Camera): {user_data.get('settings_camera_enabled')}")
        print(f"User Data (BPM): {user_data.get('settings_bpm_check')}")
        
        # Test disabling
        print("\nDisabling BPM check...")
        update_data = {"bpm_check": False}
        requests.put(update_url, json=update_data, headers=headers)
        
        me_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"User Data (BPM): {me_resp.json().get('settings_bpm_check')}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_verification_settings()
