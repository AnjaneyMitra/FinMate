#!/usr/bin/env python3
"""
Comprehensive Test Script for Enhanced Indian Tax Return Filing System
Tests all major components: form discovery, wizard, document management, and glossary
"""

import requests
import json
import os
import sys
from typing import Dict, List
import time

# Configuration
BASE_URL = "http://localhost:8000"
# Use a longer mock token that passes the basic validation in optional_firebase_token
TEST_USER_TOKEN = "test_token_12345_demo_user_firebase_bypass_for_comprehensive_testing"

class TaxFilingSystemTester:
    def __init__(self, base_url: str, auth_token: str):
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
        self.results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
    
    def test_health_check(self):
        """Test basic API health"""
        try:
            response = requests.get(f"{self.base_url}/health")
            success = response.status_code == 200
            self.log_test("API Health Check", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("API Health Check", False, f"Error: {str(e)}")
            return False
    
    def test_tax_forms_listing(self):
        """Test tax forms listing endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/tax/forms")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                forms_count = len(data.get("forms", []))
                self.log_test("Tax Forms Listing", success, f"Found {forms_count} forms")
            else:
                self.log_test("Tax Forms Listing", success, f"HTTP {response.status_code}")
            
            return success
        except Exception as e:
            self.log_test("Tax Forms Listing", False, f"Error: {str(e)}")
            return False
    
    def test_form_recommendations(self):
        """Test personalized form recommendations"""
        try:
            response = requests.post(
                f"{self.base_url}/api/tax/recommend-forms",
                headers=self.headers
            )
            success = response.status_code == 200
            
            if success:
                data = response.json()
                recommendations = data.get("recommendations", [])
                self.log_test("Form Recommendations", success, f"Generated {len(recommendations)} recommendations")
            else:
                self.log_test("Form Recommendations", success, f"HTTP {response.status_code}")
            
            return success
        except Exception as e:
            self.log_test("Form Recommendations", False, f"Error: {str(e)}")
            return False
    
    def test_tax_draft_operations(self):
        """Test tax draft save/load/update operations"""
        try:
            # Test saving a draft
            draft_data = {
                "form_id": "ITR1",
                "form_data": {
                    "personal_info": {
                        "name": "Test User",
                        "pan": "ABCDE1234F"
                    },
                    "income": {
                        "salary": 500000
                    }
                }
            }
            
            save_response = requests.post(
                f"{self.base_url}/api/tax/drafts",
                headers=self.headers,
                json=draft_data
            )
            
            if save_response.status_code == 200:
                draft_id = save_response.json().get("draft_id")
                self.log_test("Tax Draft Save", True, f"Draft saved with ID: {draft_id}")
                
                # Test retrieving drafts
                get_response = requests.get(
                    f"{self.base_url}/api/tax/drafts",
                    headers=self.headers
                )
                
                if get_response.status_code == 200:
                    drafts = get_response.json().get("drafts", [])
                    self.log_test("Tax Draft Retrieval", True, f"Retrieved {len(drafts)} drafts")
                    return True
                else:
                    self.log_test("Tax Draft Retrieval", False, f"HTTP {get_response.status_code}")
                    return False
            else:
                self.log_test("Tax Draft Save", False, f"HTTP {save_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Tax Draft Operations", False, f"Error: {str(e)}")
            return False
    
    def test_document_management(self):
        """Test document upload and management"""
        try:
            # Create a test file
            test_content = b"This is a test tax document content for ITR1 form"
            
            files = {'documents': ('test_document.pdf', test_content, 'application/pdf')}
            data = {
                'category_id': 'income_proof',
                'form_id': 'ITR1'
            }
            
            # Remove Content-Type from headers for multipart upload
            upload_headers = {"Authorization": f"Bearer {self.headers['Authorization'].split(' ')[1]}"}
            
            response = requests.post(
                f"{self.base_url}/api/tax/documents/upload",
                headers=upload_headers,
                files=files,
                data=data
            )
            
            if response.status_code == 200:
                upload_data = response.json()
                documents = upload_data.get("documents", [])
                if documents:
                    doc_id = documents[0]["id"]
                    self.log_test("Document Upload", True, f"Uploaded document ID: {doc_id}")
                    
                    # Test document listing
                    list_response = requests.get(
                        f"{self.base_url}/api/tax/documents",
                        headers=self.headers
                    )
                    
                    if list_response.status_code == 200:
                        docs = list_response.json().get("documents", [])
                        self.log_test("Document Listing", True, f"Listed {len(docs)} documents")
                        return True
                    else:
                        self.log_test("Document Listing", False, f"HTTP {list_response.status_code}")
                        return False
                else:
                    self.log_test("Document Upload", False, "No documents in response")
                    return False
            else:
                self.log_test("Document Upload", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Document Management", False, f"Error: {str(e)}")
            return False
    
    def test_ai_assistance(self):
        """Test AI-powered tax assistance"""
        try:
            assistance_request = {
                "form_id": "ITR1",
                "field_id": "salary_income",
                "user_query": "How do I calculate my salary income for tax purposes?",
                "form_data": {
                    "basic_salary": 400000,
                    "hra": 100000
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/tax/assist",
                headers=self.headers,
                json=assistance_request
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                assistance = data.get("assistance", "")
                self.log_test("AI Tax Assistance", success, f"Received assistance: {len(assistance)} chars")
            else:
                self.log_test("AI Tax Assistance", success, f"HTTP {response.status_code}")
            
            return success
        except Exception as e:
            self.log_test("AI Tax Assistance", False, f"Error: {str(e)}")
            return False
    
    def test_form_submission(self):
        """Test complete form submission"""
        try:
            submission_data = {
                "form_id": "ITR1",
                "form_data": {
                    "personal_info": {
                        "name": "Test User",
                        "pan": "ABCDE1234F",
                        "aadhaar": "123456789012",
                        "dob": "1990-01-01",
                        "address": "Test Address"
                    },
                    "income": {
                        "salary": 500000,
                        "interest": 5000
                    },
                    "deductions": {
                        "section_80c": 150000,
                        "section_80d": 25000
                    },
                    "tax_computation": {
                        "total_income": 330000,
                        "tax_payable": 0
                    },
                    "bank_details": {
                        "account_number": "1234567890",
                        "ifsc": "HDFC0001234"
                    }
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/tax/submit",
                headers=self.headers,
                json=submission_data
            )
            
            if response.status_code == 200:
                data = response.json()
                submission_id = data.get("submission_id")
                self.log_test("Tax Form Submission", True, f"Submitted with ID: {submission_id}")
                return True
            else:
                self.log_test("Tax Form Submission", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Tax Form Submission", False, f"Error: {str(e)}")
            return False
    
    def test_expense_forecasting(self):
        """Test expense forecasting for tax planning"""
        try:
            forecast_request = {
                "timeframe": 6,
                "category": "all"
            }
            
            response = requests.post(
                f"{self.base_url}/forecast-expenses",
                headers=self.headers,
                json=forecast_request
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                forecast = data.get("forecast", [])
                self.log_test("Expense Forecasting", success, f"Generated {len(forecast)} month forecast")
            else:
                self.log_test("Expense Forecasting", success, f"HTTP {response.status_code}")
            
            return success
        except Exception as e:
            self.log_test("Expense Forecasting", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Enhanced Indian Tax Return Filing System Tests")
        print("=" * 60)
        
        # Core API Tests
        print("\n📋 Core API Tests")
        self.test_health_check()
        
        # Tax Forms and Discovery Tests
        print("\n🔍 Tax Form Discovery Tests")
        self.test_tax_forms_listing()
        self.test_form_recommendations()
        
        # Tax Filing Workflow Tests
        print("\n📝 Tax Filing Workflow Tests")
        self.test_tax_draft_operations()
        self.test_ai_assistance()
        
        # Document Management Tests
        print("\n📄 Document Management Tests")
        self.test_document_management()
        
        # Submission Tests
        print("\n✅ Submission Tests")
        self.test_form_submission()
        
        # Additional Features Tests
        print("\n📊 Additional Features Tests")
        self.test_expense_forecasting()
        
        # Generate Summary
        self.generate_test_summary()
    
    def generate_test_summary(self):
        """Generate and display test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.results)
        passed_tests = sum(1 for result in self.results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
        
        # Component Status
        print(f"\n🎯 Component Status:")
        
        components = {
            "Form Discovery Engine": ["Tax Forms Listing", "Form Recommendations"],
            "Tax Filing Wizard": ["Tax Draft Operations", "AI Tax Assistance"],
            "Document Management": ["Document Management"],
            "Form Submission": ["Tax Form Submission"],
            "Additional Features": ["Expense Forecasting"]
        }
        
        for component, tests in components.items():
            component_success = all(
                any(result["test"] == test and result["success"] for result in self.results)
                for test in tests
            )
            status = "✅ Working" if component_success else "❌ Issues"
            print(f"   • {component}: {status}")
        
        # Recommendations
        print(f"\n💡 Recommendations:")
        if passed_tests == total_tests:
            print("   🎉 All tests passed! System is ready for production.")
        else:
            print("   🔧 Address failing tests before deployment.")
            print("   📚 Check logs for detailed error information.")
            print("   🌐 Ensure backend server is running on correct port.")

def main():
    """Main test execution"""
    print("Enhanced Indian Tax Return Filing System - Comprehensive Test Suite")
    print("=" * 70)
    
    # Check if server is accessible
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print(f"❌ Server not accessible at {BASE_URL}")
            print("   Please ensure the backend server is running.")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Cannot connect to server at {BASE_URL}")
        print(f"   Error: {e}")
        print("   Please start the backend server first.")
        sys.exit(1)
    
    # Run tests
    tester = TaxFilingSystemTester(BASE_URL, TEST_USER_TOKEN)
    tester.run_all_tests()

if __name__ == "__main__":
    main()
