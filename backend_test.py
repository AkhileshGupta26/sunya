#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Sunya Meditation App
Tests all backend APIs including authentication, sessions, circles, and institutions
"""

import requests
import json
import time
from datetime import datetime
import random
import string

# Configuration
BASE_URL = "http://localhost:8000/api"
HEADERS = {"Content-Type": "application/json"}

class SunyaBackendTester:
    def __init__(self):
        self.auth_token = None
        self.user_id = None
        self.circle_code = None
        self.test_results = {
            "authentication": {"passed": 0, "failed": 0, "errors": []},
            "sessions": {"passed": 0, "failed": 0, "errors": []},
            "streaks": {"passed": 0, "failed": 0, "errors": []},
            "circles": {"passed": 0, "failed": 0, "errors": []},
            "institutions": {"passed": 0, "failed": 0, "errors": []}
        }
        
    def log_result(self, category, test_name, success, response=None, error=None):
        """Log test results"""
        if success:
            self.test_results[category]["passed"] += 1
            print(f"✅ {test_name}: PASSED")
        else:
            self.test_results[category]["failed"] += 1
            error_msg = f"{test_name}: FAILED - {error}"
            if response:
                error_msg += f" | Response: {response.text if hasattr(response, 'text') else str(response)}"
            self.test_results[category]["errors"].append(error_msg)
            print(f"❌ {error_msg}")
    
    def generate_test_email(self):
        """Generate unique test email"""
        timestamp = str(int(time.time()))
        random_suffix = ''.join(random.choices(string.ascii_lowercase, k=4))
        return f"meditator_{timestamp}_{random_suffix}@sunya.app"
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        print("\n🔐 Testing User Registration...")
        
        test_email = self.generate_test_email()
        payload = {
            "name": "Arjun Sharma",
            "email": test_email,
            "password": "mindful123"
        }
        
        try:
            response = requests.post(f"{BASE_URL}/auth/register", 
                                   json=payload, headers=HEADERS, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.user_id = data["user"]["id"]
                    self.log_result("authentication", "User Registration", True)
                    return True
                else:
                    self.log_result("authentication", "User Registration", False, 
                                  response, "Missing access_token or user in response")
            else:
                self.log_result("authentication", "User Registration", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("authentication", "User Registration", False, 
                          None, str(e))
        return False
    
    def test_user_login(self):
        """Test user login with existing credentials"""
        print("\n🔑 Testing User Login...")
        
        # First register a user to login with
        test_email = self.generate_test_email()
        register_payload = {
            "name": "Priya Patel",
            "email": test_email,
            "password": "peaceful456"
        }
        
        try:
            # Register user
            reg_response = requests.post(f"{BASE_URL}/auth/register", 
                                       json=register_payload, headers=HEADERS, timeout=10)
            
            if reg_response.status_code != 200:
                print(f"Registration failed with status: {reg_response.status_code}")
                print(f"Response text: {reg_response.text}")
                self.log_result("authentication", "User Login Setup", False, 
                              reg_response, f"Failed to register test user - Status: {reg_response.status_code}")
                return False
            
            # Now test login
            login_payload = {
                "email": test_email,
                "password": "peaceful456"
            }
            
            response = requests.post(f"{BASE_URL}/auth/login", 
                                   json=login_payload, headers=HEADERS, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    # Update auth token for subsequent tests
                    self.auth_token = data["access_token"]
                    self.user_id = data["user"]["id"]
                    self.log_result("authentication", "User Login", True)
                    return True
                else:
                    self.log_result("authentication", "User Login", False, 
                                  response, "Missing access_token or user in response")
            else:
                self.log_result("authentication", "User Login", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("authentication", "User Login", False, None, str(e))
        return False
    
    def test_get_current_user(self):
        """Test getting current user info"""
        print("\n👤 Testing Get Current User...")
        
        if not self.auth_token:
            self.log_result("authentication", "Get Current User", False, 
                          None, "No auth token available")
            return False
        
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "name", "email", "current_streak", "total_days", "zen_passes"]
                if all(field in data for field in required_fields):
                    self.log_result("authentication", "Get Current User", True)
                    return True
                else:
                    self.log_result("authentication", "Get Current User", False, 
                                  response, "Missing required fields in response")
            else:
                self.log_result("authentication", "Get Current User", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("authentication", "Get Current User", False, None, str(e))
        return False
    
    def test_start_session(self):
        """Test starting a meditation session (grace timer)"""
        print("\n⏰ Testing Start Session...")
        
        if not self.auth_token:
            self.log_result("sessions", "Start Session", False, 
                          None, "No auth token available")
            return False
        
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {self.auth_token}"}
            response = requests.post(f"{BASE_URL}/sessions/start", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "grace_timer_started" in data:
                    self.log_result("sessions", "Start Session", True)
                    return True
                else:
                    self.log_result("sessions", "Start Session", False, 
                                  response, "Missing id or grace_timer_started in response")
            else:
                self.log_result("sessions", "Start Session", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("sessions", "Start Session", False, None, str(e))
        return False
    
    def test_complete_session(self):
        """Test completing a meditation session"""
        print("\n🧘 Testing Complete Session...")
        
        if not self.auth_token:
            self.log_result("sessions", "Complete Session", False, 
                          None, "No auth token available")
            return False
        
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {self.auth_token}"}
            payload = {
                "track_type": "vedic",
                "completed": True,
                "bpm_verified": True,
                "awareness_probe_passed": True
            }
            
            response = requests.post(f"{BASE_URL}/sessions/complete", 
                                   json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"]:
                    # Check if streak info is returned for completed sessions
                    if "new_streak" in data and "total_days" in data:
                        self.log_result("sessions", "Complete Session", True)
                        self.log_result("streaks", "Streak Calculation", True)
                        return True
                    else:
                        self.log_result("sessions", "Complete Session", True)
                        self.log_result("streaks", "Streak Calculation", False, 
                                      response, "Missing streak info in completion response")
                        return True
                else:
                    self.log_result("sessions", "Complete Session", False, 
                                  response, "Success field not true")
            else:
                self.log_result("sessions", "Complete Session", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("sessions", "Complete Session", False, None, str(e))
        return False
    
    def test_get_today_session(self):
        """Test getting today's session"""
        print("\n📅 Testing Get Today's Session...")
        
        if not self.auth_token:
            self.log_result("sessions", "Get Today Session", False, 
                          None, "No auth token available")
            return False
        
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{BASE_URL}/sessions/today", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "session" in data:
                    self.log_result("sessions", "Get Today Session", True)
                    return True
                else:
                    self.log_result("sessions", "Get Today Session", False, 
                                  response, "Missing session field in response")
            else:
                self.log_result("sessions", "Get Today Session", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("sessions", "Get Today Session", False, None, str(e))
        return False
    
    def test_get_session_history(self):
        """Test getting session history"""
        print("\n📊 Testing Get Session History...")
        
        if not self.auth_token:
            self.log_result("sessions", "Get Session History", False, 
                          None, "No auth token available")
            return False
        
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{BASE_URL}/sessions/history", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "sessions" in data and isinstance(data["sessions"], list):
                    self.log_result("sessions", "Get Session History", True)
                    return True
                else:
                    self.log_result("sessions", "Get Session History", False, 
                                  response, "Missing or invalid sessions field")
            else:
                self.log_result("sessions", "Get Session History", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("sessions", "Get Session History", False, None, str(e))
        return False
    
    def test_create_circle(self):
        """Test creating a family circle"""
        print("\n👨‍👩‍👧‍👦 Testing Create Family Circle...")
        
        if not self.auth_token:
            self.log_result("circles", "Create Circle", False, 
                          None, "No auth token available")
            return False
        
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {self.auth_token}"}
            payload = {
                "name": "Sharma Family Circle"
            }
            
            response = requests.post(f"{BASE_URL}/circles/create", 
                                   json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "code", "name", "harmony_score", "members"]
                if all(field in data for field in required_fields):
                    self.circle_code = data["code"]
                    self.log_result("circles", "Create Circle", True)
                    return True
                else:
                    self.log_result("circles", "Create Circle", False, 
                                  response, "Missing required fields in response")
            else:
                self.log_result("circles", "Create Circle", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("circles", "Create Circle", False, None, str(e))
        return False
    
    def test_join_circle(self):
        """Test joining a family circle"""
        print("\n🤝 Testing Join Family Circle...")
        
        if not self.auth_token or not self.circle_code:
            self.log_result("circles", "Join Circle", False, 
                          None, "No auth token or circle code available")
            return False
        
        # Create a second user to test joining
        try:
            test_email = self.generate_test_email()
            register_payload = {
                "name": "Kavya Sharma",
                "email": test_email,
                "password": "harmony789"
            }
            
            reg_response = requests.post(f"{BASE_URL}/auth/register", 
                                       json=register_payload, headers=HEADERS, timeout=10)
            
            if reg_response.status_code != 200:
                self.log_result("circles", "Join Circle Setup", False, 
                              reg_response, "Failed to register second user")
                return False
            
            second_user_token = reg_response.json()["access_token"]
            
            # Now test joining the circle
            headers = {**HEADERS, "Authorization": f"Bearer {second_user_token}"}
            payload = {
                "code": self.circle_code
            }
            
            response = requests.post(f"{BASE_URL}/circles/join", 
                                   json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "code", "name", "harmony_score", "members"]
                if all(field in data for field in required_fields):
                    self.log_result("circles", "Join Circle", True)
                    return True
                else:
                    self.log_result("circles", "Join Circle", False, 
                                  response, "Missing required fields in response")
            else:
                self.log_result("circles", "Join Circle", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("circles", "Join Circle", False, None, str(e))
        return False
    
    def test_get_my_circle(self):
        """Test getting user's circle info"""
        print("\n🔍 Testing Get My Circle...")
        
        if not self.auth_token:
            self.log_result("circles", "Get My Circle", False, 
                          None, "No auth token available")
            return False
        
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{BASE_URL}/circles/my-circle", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "circle" in data:
                    self.log_result("circles", "Get My Circle", True)
                    return True
                else:
                    self.log_result("circles", "Get My Circle", False, 
                                  response, "Missing circle field in response")
            else:
                self.log_result("circles", "Get My Circle", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("circles", "Get My Circle", False, None, str(e))
        return False
    
    def test_join_institution(self):
        """Test joining an institution"""
        print("\n🏫 Testing Join Institution...")
        
        if not self.auth_token:
            self.log_result("institutions", "Join Institution", False, 
                          None, "No auth token available")
            return False
        
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {self.auth_token}"}
            payload = {
                "institution_name": "Indian Institute of Technology Delhi"
            }
            
            response = requests.post(f"{BASE_URL}/institutions/join", 
                                   json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"] and "institution_id" in data:
                    self.log_result("institutions", "Join Institution", True)
                    return True
                else:
                    self.log_result("institutions", "Join Institution", False, 
                                  response, "Missing success or institution_id in response")
            else:
                self.log_result("institutions", "Join Institution", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("institutions", "Join Institution", False, None, str(e))
        return False
    
    def test_get_leaderboard(self):
        """Test getting institution leaderboard"""
        print("\n🏆 Testing Get Institution Leaderboard...")
        
        try:
            response = requests.get(f"{BASE_URL}/institutions/leaderboard", 
                                  headers=HEADERS, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "leaderboard" in data and isinstance(data["leaderboard"], list):
                    self.log_result("institutions", "Get Leaderboard", True)
                    return True
                else:
                    self.log_result("institutions", "Get Leaderboard", False, 
                                  response, "Missing or invalid leaderboard field")
            else:
                self.log_result("institutions", "Get Leaderboard", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("institutions", "Get Leaderboard", False, None, str(e))
        return False
    
    def test_update_wake_time(self):
        """Test updating user wake time"""
        print("\n⏰ Testing Update Wake Time...")
        
        if not self.auth_token:
            self.log_result("authentication", "Update Wake Time", False, 
                          None, "No auth token available")
            return False
        
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {self.auth_token}"}
            payload = {
                "wake_time": "06:30"
            }
            
            response = requests.put(f"{BASE_URL}/user/wake-time", 
                                  json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"] and "wake_time" in data:
                    self.log_result("authentication", "Update Wake Time", True)
                    return True
                else:
                    self.log_result("authentication", "Update Wake Time", False, 
                                  response, "Missing success or wake_time in response")
            else:
                self.log_result("authentication", "Update Wake Time", False, 
                              response, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_result("authentication", "Update Wake Time", False, None, str(e))
        return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Sunya Backend API Tests...")
        print(f"🌐 Testing against: {BASE_URL}")
        
        # Authentication Tests
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        self.test_update_wake_time()
        
        # Session Tests
        self.test_start_session()
        self.test_complete_session()
        self.test_get_today_session()
        self.test_get_session_history()
        
        # Circle Tests
        self.test_create_circle()
        self.test_join_circle()
        self.test_get_my_circle()
        
        # Institution Tests
        self.test_join_institution()
        self.test_get_leaderboard()
        
        # Print Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "="*60)
        print("📊 SUNYA BACKEND TEST RESULTS SUMMARY")
        print("="*60)
        
        total_passed = 0
        total_failed = 0
        
        for category, results in self.test_results.items():
            passed = results["passed"]
            failed = results["failed"]
            total_passed += passed
            total_failed += failed
            
            status = "✅ PASS" if failed == 0 else "❌ FAIL"
            print(f"{category.upper():<15} | {passed:>2} passed | {failed:>2} failed | {status}")
            
            # Print errors if any
            if results["errors"]:
                for error in results["errors"]:
                    print(f"  ❌ {error}")
        
        print("-" * 60)
        print(f"TOTAL RESULTS    | {total_passed:>2} passed | {total_failed:>2} failed")
        
        if total_failed == 0:
            print("🎉 ALL TESTS PASSED! Backend is working correctly.")
        else:
            print(f"⚠️  {total_failed} tests failed. Please check the errors above.")
        
        print("="*60)

if __name__ == "__main__":
    tester = SunyaBackendTester()
    tester.run_all_tests()