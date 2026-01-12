import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_register():
    print("Testing Registration...")
    url = f"{BASE_URL}/auth/register"
    data = {
        "name": "Test User",
        "email": "test_script_user@example.com",
        "password": "password123"
    }
    try:
        response = requests.post(url, json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_login():
    print("\nTesting Login...")
    url = f"{BASE_URL}/auth/login"
    data = {
        "email": "test_script_user@example.com",
        "password": "password123"
    }
    try:
        response = requests.post(url, json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register()
    test_login()
