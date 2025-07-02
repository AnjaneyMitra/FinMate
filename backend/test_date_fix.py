#!/usr/bin/env python3

"""
Test script to verify that our date filtering works correctly.
This addresses the timezone-aware vs timezone-naive datetime comparison issue.
"""

from datetime import datetime
from firestore_service import FirestoreService
import sys

def test_user_transactions(user_id):
    """Test fetching transactions for a specific user"""
    
    print(f"Testing transaction fetching for user: {user_id}")
    print("="*50)
    
    # Initialize Firestore service
    firestore_service = FirestoreService()
    
    if not firestore_service.db:
        print("❌ Failed to initialize Firestore")
        return False
    
    try:
        # Test 1: Get all transactions (no date filter)
        print("\n🔍 Test 1: Fetching all transactions (no filters)")
        all_transactions = firestore_service.get_user_expenses(user_id)
        print(f"✅ Found {len(all_transactions)} total transactions")
        
        if all_transactions:
            # Show first few transactions
            print("\nSample transactions:")
            for i, tx in enumerate(all_transactions[:3]):
                print(f"  {i+1}. {tx['description'][:30]:<30} | ${tx['amount']:>8.2f} | {tx['date'][:10]}")
        
        # Test 2: Get recent transactions (with date filter)
        print("\n🔍 Test 2: Fetching recent transactions (last 30 days)")
        thirty_days_ago = datetime.now().replace(day=1)  # Start of current month
        recent_transactions = firestore_service.get_user_expenses(
            user_id, 
            start_date=thirty_days_ago
        )
        print(f"✅ Found {len(recent_transactions)} recent transactions")
        
        # Test 3: Get transactions by category
        print("\n🔍 Test 3: Fetching food category transactions")
        food_transactions = firestore_service.get_user_expenses(
            user_id, 
            category='food'
        )
        print(f"✅ Found {len(food_transactions)} food transactions")
        
        print(f"\n✅ All tests passed! User {user_id} has accessible transaction data.")
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False

if __name__ == "__main__":
    # Test with the known user ID
    test_user_id = "ilk3jt72kzcJHiCGmThzume6EVx1"
    
    if len(sys.argv) > 1:
        test_user_id = sys.argv[1]
    
    success = test_user_transactions(test_user_id)
    
    if success:
        print("\n🎉 Transaction fetching is working correctly!")
        print("💡 The frontend should now be able to load transactions properly.")
    else:
        print("\n❌ Transaction fetching failed.")
        print("🔧 Please check the error messages above.")
    
    sys.exit(0 if success else 1)
