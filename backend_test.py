#!/usr/bin/env python3
"""
Backend API Testing for Awadhut Banquets & Catering
Tests all API endpoints with proper authentication and data validation
"""

import requests
import sys
import json
from datetime import datetime, timedelta

class AwadhutsAPITester:
    def __init__(self, base_url="https://event-manage-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def log_result(self, test_name, success, response_data=None, error_msg=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {error_msg}")
            self.failed_tests.append({
                'test': test_name,
                'error': error_msg,
                'response': response_data
            })

    def test_api_endpoint(self, method, endpoint, expected_status, data=None, test_name=None):
        """Generic API test method"""
        url = f"{self.base_url}/api/{endpoint}"
        test_name = test_name or f"{method} {endpoint}"
        
        try:
            if method == 'GET':
                response = self.session.get(url)
            elif method == 'POST':
                response = self.session.post(url, json=data)
            elif method == 'PUT':
                response = self.session.put(url, json=data)
            elif method == 'DELETE':
                response = self.session.delete(url)
            
            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            if success:
                self.log_result(test_name, True, response_data)
                return True, response_data
            else:
                self.log_result(test_name, False, response_data, 
                              f"Expected {expected_status}, got {response.status_code}")
                return False, response_data
                
        except Exception as e:
            self.log_result(test_name, False, None, str(e))
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.test_api_endpoint('GET', '', 200, test_name="API Health Check")

    def test_admin_login(self):
        """Test admin authentication with new credentials"""
        login_data = {
            "email": "chaitanyabanquetsmh24@gmail.com",
            "password": "Soham@123123"
        }
        
        success, response = self.test_api_endpoint('POST', 'auth/login', 200, login_data, "Admin Login (New Credentials)")
        
        if success and 'token' in response:
            self.token = response['token']
            self.session.headers.update({'Authorization': f'Bearer {self.token}'})
            print(f"🔑 Admin token obtained: {self.token[:20]}...")
            print(f"👤 Admin name: {response.get('name', 'N/A')}")
            print(f"📧 Admin email: {response.get('email', 'N/A')}")
            print(f"🔐 Admin role: {response.get('role', 'N/A')}")
            return True
        return False

    def test_packages_api(self):
        """Test packages CRUD operations"""
        # Test GET all packages
        success, packages = self.test_api_endpoint('GET', 'packages', 200, test_name="Get All Packages")
        if not success:
            return False
            
        print(f"📦 Found {len(packages)} packages")
        
        # Test GET packages by category
        self.test_api_endpoint('GET', 'packages?category=wedding', 200, test_name="Get Wedding Packages")
        self.test_api_endpoint('GET', 'packages?featured=true', 200, test_name="Get Featured Packages")
        
        # Test GET specific package (if packages exist)
        if packages and len(packages) > 0:
            package_id = packages[0]['id']
            self.test_api_endpoint('GET', f'packages/{package_id}', 200, test_name="Get Specific Package")
        
        # Test CREATE package (requires admin auth)
        if self.token:
            new_package = {
                "name": "Test Package",
                "category": "wedding",
                "price": 50000,
                "guestCount": 100,
                "includes": ["Hall", "Decoration"],
                "extras": ["Photography"],
                "notes": "Test package for API testing",
                "isFeatured": False,
                "image": ""
            }
            success, created_pkg = self.test_api_endpoint('POST', 'packages', 201, new_package, "Create Package")
            
            if success and 'id' in created_pkg:
                pkg_id = created_pkg['id']
                
                # Test UPDATE package
                update_data = {"name": "Updated Test Package", "price": 55000}
                self.test_api_endpoint('PUT', f'packages/{pkg_id}', 200, update_data, "Update Package")
                
                # Test DELETE package
                self.test_api_endpoint('DELETE', f'packages/{pkg_id}', 200, test_name="Delete Package")
        
        return True

    def test_bookings_api(self):
        """Test bookings API"""
        # Test CREATE booking (public endpoint)
        booking_data = {
            "name": "Test Customer",
            "email": "test@example.com",
            "phone": "+91 9876543210",
            "eventType": "wedding",
            "eventDate": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "guests": 150,
            "message": "Test booking from API test"
        }
        
        success, booking = self.test_api_endpoint('POST', 'bookings', 201, booking_data, "Create Booking")
        
        # Test GET bookings (requires admin auth)
        if self.token:
            self.test_api_endpoint('GET', 'bookings', 200, test_name="Get All Bookings (Admin)")
            
            if success and 'id' in booking:
                booking_id = booking['id']
                # Test update booking status
                self.test_api_endpoint('PUT', f'bookings/{booking_id}/status?status=confirmed', 200, 
                                     test_name="Update Booking Status")
        
        return True

    def test_user_auth_api(self):
        """Test user authentication endpoints"""
        # Test user registration
        user_data = {
            "name": "Test User",
            "email": f"testuser_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "testpass123"
        }
        
        success, user_response = self.test_api_endpoint('POST', 'auth/register', 201, user_data, "User Registration")
        
        if success and 'token' in user_response:
            user_token = user_response['token']
            print(f"🔑 User token obtained: {user_token[:20]}...")
            
            # Test duplicate registration
            self.test_api_endpoint('POST', 'auth/register', 400, user_data, "Duplicate Registration (should fail)")
            
            # Test user login
            login_data = {
                "email": user_data["email"],
                "password": user_data["password"]
            }
            success_login, login_response = self.test_api_endpoint('POST', 'auth/login', 200, login_data, "User Login")
            
            if success_login and 'token' in login_response:
                # Test /auth/me endpoint
                temp_headers = self.session.headers.copy()
                self.session.headers.update({'Authorization': f'Bearer {user_token}'})
                self.test_api_endpoint('GET', 'auth/me', 200, test_name="Get Current User Info")
                self.session.headers = temp_headers
                
                return user_token
        
        return None

    def test_reviews_api(self):
        """Test reviews API with authentication"""
        # Test GET reviews
        self.test_api_endpoint('GET', 'reviews', 200, test_name="Get All Reviews")
        self.test_api_endpoint('GET', 'reviews?approved=true', 200, test_name="Get Approved Reviews")
        
        # Test CREATE review without auth (should fail)
        review_data = {
            "rating": 5,
            "comment": "Excellent service! Test review from API testing.",
            "eventType": "Wedding"
        }
        
        # Remove auth header temporarily
        temp_headers = self.session.headers.copy()
        if 'Authorization' in self.session.headers:
            del self.session.headers['Authorization']
        
        self.test_api_endpoint('POST', 'reviews', 401, review_data, "Create Review Without Auth (should fail)")
        
        # Restore headers
        self.session.headers = temp_headers
        
        # Test user registration and review creation
        user_token = self.test_user_auth_api()
        
        if user_token:
            # Test CREATE review with user auth
            temp_headers = self.session.headers.copy()
            self.session.headers.update({'Authorization': f'Bearer {user_token}'})
            
            success, review = self.test_api_endpoint('POST', 'reviews', 201, review_data, "Create Review With User Auth")
            
            # Test get my reviews
            self.test_api_endpoint('GET', 'reviews/my', 200, test_name="Get My Reviews")
            
            # Restore admin headers
            self.session.headers = temp_headers
            
            # Test admin review operations
            if self.token and success and 'id' in review:
                review_id = review['id']
                self.test_api_endpoint('PUT', f'reviews/{review_id}/approve', 200, test_name="Approve Review (Admin)")
        
        return True

    def test_contact_api(self):
        """Test contact form API"""
        contact_data = {
            "name": "Test Contact",
            "email": "contact@example.com",
            "phone": "+91 9876543210",
            "subject": "API Test Inquiry",
            "message": "This is a test message from API testing."
        }
        
        success, response = self.test_api_endpoint('POST', 'contact', 200, contact_data, "Submit Contact Form")
        
        # Test GET contacts (admin only)
        if self.token:
            self.test_api_endpoint('GET', 'contacts', 200, test_name="Get Contact Messages (Admin)")
        
        return success

    def test_gallery_api(self):
        """Test gallery API"""
        # Test GET gallery
        self.test_api_endpoint('GET', 'gallery', 200, test_name="Get Gallery Items")
        self.test_api_endpoint('GET', 'gallery?category=Wedding', 200, test_name="Get Wedding Gallery")
        
        # Test CREATE gallery item (admin only)
        if self.token:
            gallery_data = {
                "title": "Test Gallery Item",
                "category": "Wedding",
                "imageUrl": "https://example.com/test-image.jpg",
                "description": "Test gallery item from API testing"
            }
            
            success, gallery_item = self.test_api_endpoint('POST', 'gallery', 201, gallery_data, "Create Gallery Item")
            
            if success and 'id' in gallery_item:
                item_id = gallery_item['id']
                self.test_api_endpoint('DELETE', f'gallery/{item_id}', 200, test_name="Delete Gallery Item")
        
        return True

    def test_dashboard_stats(self):
        """Test dashboard statistics (admin only)"""
        if self.token:
            success, stats = self.test_api_endpoint('GET', 'dashboard/stats', 200, test_name="Get Dashboard Stats")
            if success:
                required_fields = ['totalBookings', 'totalPackages', 'totalReviews', 'totalGallery']
                for field in required_fields:
                    if field not in stats:
                        self.log_result(f"Dashboard Stats - {field}", False, None, f"Missing field: {field}")
                    else:
                        print(f"📊 {field}: {stats[field]}")
            return success
        return False

    def test_events_api(self):
        """Test events CRUD operations"""
        # Test GET all events
        success, events = self.test_api_endpoint('GET', 'events', 200, test_name="Get All Events")
        if not success:
            return False
            
        print(f"🎉 Found {len(events)} events")
        
        # Test GET active events only
        self.test_api_endpoint('GET', 'events?active_only=true', 200, test_name="Get Active Events Only")
        
        # Test GET specific event (if events exist)
        if events and len(events) > 0:
            event_id = events[0]['id']
            self.test_api_endpoint('GET', f'events/{event_id}', 200, test_name="Get Specific Event")
        
        # Test CREATE event (requires admin auth)
        if self.token:
            new_event = {
                "title": "Test Event - API Testing",
                "description": "This is a test event created during API testing",
                "eventDate": "2026-03-15",
                "eventTime": "6:00 PM onwards",
                "venue": "Awadhut Banquets, Latur",
                "image": "https://images.unsplash.com/photo-1587271636175-90d58cdad458?w=800",
                "price": 500,
                "capacity": 100,
                "isActive": True
            }
            success, created_event = self.test_api_endpoint('POST', 'events', 201, new_event, "Create Event")
            
            if success and 'id' in created_event:
                event_id = created_event['id']
                
                # Test UPDATE event
                update_data = {"title": "Updated Test Event", "price": 600}
                self.test_api_endpoint('PUT', f'events/{event_id}', 200, update_data, "Update Event")
                
                # Test DELETE event
                self.test_api_endpoint('DELETE', f'events/{event_id}', 200, test_name="Delete Event")
        
        return True

    def test_cloudinary_signature(self):
        """Test Cloudinary signature endpoint (admin only)"""
        if self.token:
            success, signature_data = self.test_api_endpoint('GET', 'cloudinary/signature', 200, test_name="Get Cloudinary Signature")
            if success:
                required_fields = ['signature', 'timestamp', 'cloud_name', 'api_key', 'folder']
                for field in required_fields:
                    if field not in signature_data:
                        self.log_result(f"Cloudinary Signature - {field}", False, None, f"Missing field: {field}")
                    else:
                        if field == 'cloud_name':
                            expected_cloud = 'djivzwgi0'
                            actual_cloud = signature_data[field]
                            if actual_cloud == expected_cloud:
                                print(f"☁️ Cloud name correct: {actual_cloud}")
                            else:
                                self.log_result("Cloudinary Cloud Name", False, None, f"Expected {expected_cloud}, got {actual_cloud}")
                        else:
                            print(f"🔑 {field}: {signature_data[field]}")
            return success
        return False
    def test_listings_api(self):
        """Test listings/services API"""
        self.test_api_endpoint('GET', 'listings', 200, test_name="Get All Listings")
        self.test_api_endpoint('GET', 'listings?type=banquet', 200, test_name="Get Banquet Listings")
        
        return True

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting Awadhut Banquets API Testing...")
        print(f"🌐 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        test_sequence = [
            ("API Health Check", self.test_health_check),
            ("Admin Authentication", self.test_admin_login),
            ("Events API", self.test_events_api),
            ("Cloudinary Signature", self.test_cloudinary_signature),
            ("Packages API", self.test_packages_api),
            ("Bookings API", self.test_bookings_api),
            ("Reviews API with User Auth", self.test_reviews_api),
            ("Contact API", self.test_contact_api),
            ("Gallery API", self.test_gallery_api),
            ("Listings API", self.test_listings_api),
            ("Dashboard Stats", self.test_dashboard_stats),
        ]
        
        for test_name, test_func in test_sequence:
            print(f"\n🔍 Testing {test_name}...")
            try:
                test_func()
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {str(e)}")
                self.failed_tests.append({
                    'test': test_name,
                    'error': str(e),
                    'response': None
                })
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"  • {failure['test']}: {failure['error']}")
        
        return len(self.failed_tests) == 0

def main():
    """Main test execution"""
    tester = AwadhutsAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())