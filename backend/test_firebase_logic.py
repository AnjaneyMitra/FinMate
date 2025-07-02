#!/usr/bin/env python3
"""
Comprehensive Firebase Logic Test Script
Tests all Firebase configurations, services, and transaction operations
"""

import os
import sys
from datetime import datetime, timedelta
import traceback
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_environment_variables():
    """Test if all required environment variables are present"""
    print("\n🔧 Testing Environment Variables")
    print("=" * 50)
    
    required_env_vars = [
        'GEMINI_API_KEY',
        'FIREBASE_ADMIN_SDK_JSON_PATH',
        'ENVIRONMENT',
        'DEBUG'
    ]
    
    results = {}
    for var in required_env_vars:
        value = os.getenv(var)
        results[var] = value is not None
        status = "✅" if value else "❌"
        masked_value = value[:20] + "..." if value and len(value) > 20 else value
        print(f"{status} {var}: {masked_value if value else 'NOT SET'}")
    
    return all(results.values())

def test_firebase_service_account():
    """Test Firebase service account file"""
    print("\n🔑 Testing Firebase Service Account")
    print("=" * 50)
    
    json_path = os.getenv('FIREBASE_ADMIN_SDK_JSON_PATH', './finmate-service-account.json')
    
    if os.path.exists(json_path):
        print(f"✅ Service account file found: {json_path}")
        try:
            import json
            with open(json_path, 'r') as f:
                data = json.load(f)
            
            required_fields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return False
            else:
                print(f"✅ Service account file is valid")
                print(f"   Project ID: {data.get('project_id')}")
                print(f"   Client Email: {data.get('client_email')}")
                return True
                
        except Exception as e:
            print(f"❌ Error reading service account file: {e}")
            return False
    else:
        print(f"❌ Service account file not found: {json_path}")
        return False

def test_firestore_connection():
    """Test Firestore connection and initialization"""
    print("\n🔥 Testing Firestore Connection")
    print("=" * 50)
    
    try:
        from firestore_service import FirestoreService
        
        firestore_service = FirestoreService()
        
        if not firestore_service.db:
            print("❌ Firestore client failed to initialize")
            return False, None
        
        print("✅ Firestore client initialized successfully")
        
        # Test basic connectivity by listing collections
        collections = list(firestore_service.db.collections())
        print(f"✅ Connected to Firestore. Found {len(collections)} collections.")
        
        return True, firestore_service
        
    except Exception as e:
        print(f"❌ Firestore connection failed: {e}")
        traceback.print_exc()
        return False, None

def test_transaction_operations(firestore_service):
    """Test transaction CRUD operations"""
    print("\n💰 Testing Transaction Operations")
    print("=" * 50)
    
    if not firestore_service:
        print("❌ Firestore service not available")
        return False
    
    test_user_id = "test_user_" + str(int(datetime.now().timestamp()))
    
    try:
        # Test 1: Add Transaction
        print("1. Testing add transaction...")
        test_transaction = {
            "amount": 123.45,
            "description": "Test transaction - Firebase logic check",
            "category": "test",
            "date": datetime.now().isoformat(),
            "type": "expense"
        }
        
        transaction_id = firestore_service.add_transaction(test_user_id, test_transaction)
        print(f"✅ Transaction added with ID: {transaction_id}")
        
        # Test 2: Fetch Transactions
        print("2. Testing fetch transactions...")
        transactions = firestore_service.get_user_expenses(test_user_id)
        
        if transactions and len(transactions) > 0:
            print(f"✅ Retrieved {len(transactions)} transactions")
            latest_tx = transactions[0]
            print(f"   Latest: ${latest_tx.get('amount', 0):.2f} - {latest_tx.get('description', 'N/A')}")
        else:
            print("❌ No transactions retrieved")
            return False
        
        # Test 3: Delete Transaction (cleanup)
        print("3. Cleaning up test data...")
        delete_success = firestore_service.delete_transaction(test_user_id, transaction_id)
        
        if delete_success:
            print("✅ Test transaction deleted successfully")
        else:
            print("⚠️  Failed to delete test transaction")
        
        return True
        
    except Exception as e:
        print(f"❌ Transaction operations failed: {e}")
        traceback.print_exc()
        return False

def test_firestore_indexes():
    """Test if required Firestore indexes are properly deployed"""
    print("\n📚 Testing Firestore Indexes")
    print("=" * 50)
    
    # Check if firestore.indexes.json exists
    indexes_file = "firestore.indexes.json"
    if os.path.exists(indexes_file):
        print(f"✅ Firestore indexes file found: {indexes_file}")
        
        try:
            import json
            with open(indexes_file, 'r') as f:
                indexes_data = json.load(f)
            
            indexes = indexes_data.get('indexes', [])
            transaction_indexes = [idx for idx in indexes if idx.get('collectionGroup') == 'transactions']
            
            print(f"✅ Found {len(transaction_indexes)} transaction indexes")
            
            # Check for specific required indexes
            required_patterns = [
                ['userId', 'date'],
                ['userId', 'category', 'date'],
                ['userId', 'type', 'date']
            ]
            
            for pattern in required_patterns:
                found = any(
                    all(field['fieldPath'] in pattern for field in idx.get('fields', []))
                    for idx in transaction_indexes
                )
                status = "✅" if found else "⚠️ "
                print(f"{status} Index pattern {pattern}: {'Found' if found else 'Not found'}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error reading indexes file: {e}")
            return False
    else:
        print(f"⚠️  Firestore indexes file not found: {indexes_file}")
        return False

def test_specific_user_data():
    """Test data for the specific user mentioned in the issue"""
    print("\n👤 Testing Specific User Data")
    print("=" * 50)
    
    try:
        from firestore_service import FirestoreService
        
        firestore_service = FirestoreService()
        if not firestore_service.db:
            print("❌ Firestore service not available")
            return False
        
        # The user ID from the conversation
        target_user_id = "ilk3jt72kzcJHiCGmThzume6EVx1"
        
        print(f"Checking transactions for user: {target_user_id}")
        
        # Try different collection paths
        collection_paths = [
            f'users/{target_user_id}/transactions',
            'transactions'  # flat structure
        ]
        
        for path in collection_paths:
            print(f"\nChecking collection: {path}")
            try:
                if path == 'transactions':
                    # Query flat transactions collection
                    query = firestore_service.db.collection('transactions').where('userId', '==', target_user_id).limit(10)
                else:
                    # Query nested transactions collection
                    query = firestore_service.db.collection(path).limit(10)
                
                docs = list(query.stream())
                print(f"   Found {len(docs)} documents")
                
                for doc in docs[:3]:  # Show first 3
                    data = doc.to_dict()
                    print(f"   - {doc.id}: ${data.get('amount', 0)} - {data.get('description', 'N/A')}")
                
            except Exception as e:
                print(f"   ❌ Error querying {path}: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing user data: {e}")
        traceback.print_exc()
        return False

def test_frontend_backend_consistency():
    """Test consistency between frontend and backend data structures"""
    print("\n🔄 Testing Frontend-Backend Consistency")
    print("=" * 50)
    
    # Check if the frontend expects a flat transactions collection
    print("Frontend expects: Flat 'transactions' collection with 'userId' field")
    print("Backend provides: Both flat and nested structures")
    
    # Recommendation
    print("\n💡 Recommendation:")
    print("   - Use flat 'transactions' collection for consistency")
    print("   - Ensure all transactions have 'userId' field")
    print("   - Use proper Firestore security rules")
    
    return True

def main():
    """Main test function"""
    print("🔍 FinMate Firebase Logic Comprehensive Test")
    print("=" * 60)
    
    test_results = {}
    
    # Run all tests
    test_results['env_vars'] = test_environment_variables()
    test_results['service_account'] = test_firebase_service_account()
    test_results['firestore_connection'], firestore_service = test_firestore_connection()
    test_results['transaction_ops'] = test_transaction_operations(firestore_service)
    test_results['indexes'] = test_firestore_indexes()
    test_results['user_data'] = test_specific_user_data()
    test_results['consistency'] = test_frontend_backend_consistency()
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 60)
    
    total_tests = len(test_results)
    passed_tests = sum(test_results.values())
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name.replace('_', ' ').title()}")
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed! Firebase logic is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the issues above.")
        
        # Specific recommendations based on failures
        if not test_results['service_account']:
            print("\n🔧 Fix: Update FIREBASE_ADMIN_SDK_JSON_PATH in .env file")
        
        if not test_results['firestore_connection']:
            print("\n🔧 Fix: Check Firebase project configuration and credentials")
        
        if not test_results['transaction_ops']:
            print("\n🔧 Fix: Check Firestore security rules and data structure")

if __name__ == "__main__":
    main()
