#!/usr/bin/env python3
"""
Edge Case Testing for Shunya Meditation App Backend
Tests error scenarios and edge cases
"""

import requests
import json

BASE_URL = "https://mindfulstart.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

def test_edge_cases():
    print("🧪 Testing Edge Cases and Error Scenarios...")
    
    # Test 1: Invalid login credentials
    print("\n❌ Testing Invalid Login...")
    response = requests.post(f"{BASE_URL}/auth/login", 
                           json={"email": "nonexistent@test.com", "password": "wrong"}, 
                           headers=HEADERS)
    if response.status_code == 401:
        print("✅ Invalid login correctly returns 401")
    else:
        print(f"❌ Invalid login returned {response.status_code}, expected 401")
    
    # Test 2: Duplicate email registration
    print("\n❌ Testing Duplicate Email Registration...")
    test_email = "duplicate@test.com"
    payload = {"name": "Test User", "email": test_email, "password": "test123"}
    
    # First registration
    response1 = requests.post(f"{BASE_URL}/auth/register", json=payload, headers=HEADERS)
    # Second registration with same email
    response2 = requests.post(f"{BASE_URL}/auth/register", json=payload, headers=HEADERS)
    
    if response2.status_code == 400:
        print("✅ Duplicate email registration correctly returns 400")
    else:
        print(f"❌ Duplicate email registration returned {response2.status_code}, expected 400")
    
    # Test 3: Unauthorized access to protected endpoints
    print("\n🔒 Testing Unauthorized Access...")
    response = requests.get(f"{BASE_URL}/auth/me", headers=HEADERS)
    if response.status_code == 403:
        print("✅ Unauthorized access correctly returns 403")
    else:
        print(f"❌ Unauthorized access returned {response.status_code}, expected 403")
    
    # Test 4: Invalid circle code
    print("\n🔍 Testing Invalid Circle Code...")
    # First get a valid token
    reg_response = requests.post(f"{BASE_URL}/auth/register", 
                               json={"name": "Test", "email": f"test_{int(time.time())}@test.com", "password": "test"}, 
                               headers=HEADERS)
    if reg_response.status_code == 200:
        token = reg_response.json()["access_token"]
        auth_headers = {**HEADERS, "Authorization": f"Bearer {token}"}
        
        response = requests.post(f"{BASE_URL}/circles/join", 
                               json={"code": "999999"}, 
                               headers=auth_headers)
        if response.status_code == 404:
            print("✅ Invalid circle code correctly returns 404")
        else:
            print(f"❌ Invalid circle code returned {response.status_code}, expected 404")
    
    print("\n✅ Edge case testing completed!")

if __name__ == "__main__":
    import time
    test_edge_cases()