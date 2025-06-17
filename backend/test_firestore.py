#!/usr/bin/env python3
"""
Firestore Connection and Data Testing Script
This script tests the Firestore connection and basic CRUD operations
"""

import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

def test_firestore_connection():
    """Test basic Firestore connection"""
    print("🔥 Testing Firestore Connection")
    print("=" * 40)
    
    try:
        from firestore_service import FirestoreService
        
        # Initialize service
        print("1. Initializing Firestore service...")
        firestore_service = FirestoreService()
        
        if not firestore_service.db:
            print("❌ Firestore client not initialized")
            return False
        
        print("✅ Firestore client initialized successfully")
        
        # Test basic connection
        print("2. Testing basic connection...")
        test_collection = firestore_service.db.collection('connection_test')
        test_doc = {
            'test': True,
            'timestamp': datetime.now(),
            'message': 'Connection test successful'
        }
        
        doc_ref = test_collection.add(test_doc)
        doc_id = doc_ref[1].id
        print(f"✅ Test document created with ID: {doc_id}")
        
        # Read the document back
        retrieved_doc = test_collection.document(doc_id).get()
        if retrieved_doc.exists:
            print("✅ Test document retrieved successfully")
        else:
            print("❌ Failed to retrieve test document")
            return False
        
        # Clean up test document
        test_collection.document(doc_id).delete()
        print("✅ Test document cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Firestore connection test failed: {e}")
        return False

def test_transaction_operations():
    """Test transaction CRUD operations"""
    print("\n💰 Testing Transaction Operations")
    print("=" * 40)
    
    try:
        from firestore_service import FirestoreService
        
        firestore_service = FirestoreService()
        if not firestore_service.db:
            print("❌ Firestore service not available")
            return False
        
        test_user_id = "test_user_12345"
        
        # Create test transaction
        print("1. Creating test transaction...")
        test_transaction = {
            "amount": 125.50,
            "description": "Test grocery purchase",
            "category": "food",
            "date": datetime.now().isoformat(),
            "type": "expense"
        }
        
        transaction_id = firestore_service.add_transaction(test_user_id, test_transaction)
        print(f"✅ Transaction created with ID: {transaction_id}")
        
        # Test monthly aggregation
        print("2. Testing monthly aggregation...")
        current_month = datetime.now().strftime('%Y-%m')
        monthly_summary = firestore_service.get_monthly_summary(test_user_id, current_month)
        
        if monthly_summary:
            print(f"✅ Monthly summary generated:")
            print(f"   - Total Expenses: ${monthly_summary.get('totalExpenses', 0):.2f}")
            print(f"   - Transaction Count: {monthly_summary.get('transactionCount', 0)}")
            print(f"   - Categories: {list(monthly_summary.get('categoryBreakdown', {}).keys())}")
        else:
            print("❌ Monthly summary not generated")
            return False
        
        # Test expense retrieval
        print("3. Testing expense retrieval...")
        expenses = firestore_service.get_user_expenses(test_user_id)
        
        if expenses:
            print(f"✅ Retrieved {len(expenses)} expenses")
            print(f"   - Latest expense: ${expenses[0].get('amount', 0):.2f} - {expenses[0].get('description', 'N/A')}")
        else:
            print("❌ No expenses retrieved")
            return False
        
        # Clean up test data
        print("4. Cleaning up test data...")
        firestore_service.delete_transaction(test_user_id, transaction_id)
        print("✅ Test data cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Transaction operations test failed: {e}")
        return False

def test_monthly_data_aggregation():
    # DEPRECATED: Monthly data aggregation is now handled in code at query time. This test is no longer needed.
    pass

def main():
    """Run all Firestore tests"""
    print("🚀 FinMate Firestore Testing Suite")
    print("=" * 50)
    
    # Check environment setup
    print("Environment Check:")
    print(f"   - FIREBASE_PROJECT_ID: {os.getenv('FIREBASE_PROJECT_ID', 'Not set')}")
    print(f"   - GOOGLE_APPLICATION_CREDENTIALS: {os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'Not set')}")
    print()
    
    tests = [
        ("Firestore Connection", test_firestore_connection),
        ("Transaction Operations", test_transaction_operations),
        # ("Monthly Data Aggregation", test_monthly_data_aggregation) # Commented out monthly aggregation test
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Print summary
    print("\n📋 Test Summary")
    print("=" * 30)
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Firestore is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please check your Firestore configuration.")
        
        print("\n🔧 Troubleshooting Tips:")
        print("1. Ensure Firebase project is set up correctly")
        print("2. Check that service account key is downloaded and path is correct")
        print("3. Verify GOOGLE_APPLICATION_CREDENTIALS environment variable")
        print("4. Make sure Firestore database is created in Firebase Console")
        print("5. Deploy Firestore security rules using: firebase deploy --only firestore:rules")

if __name__ == "__main__":
    main()
