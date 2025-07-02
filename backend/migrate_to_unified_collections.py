# Unified Transaction Collection Migration Script
# This script will consolidate all transactions into a single, standardized collection

import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from firestore_service import FirestoreService

def migrate_to_unified_transactions():
    """
    Migrate all transactions to use only the root 'transactions' collection.
    This eliminates the dual-collection complexity that was causing data inconsistency.
    """
    print("🔄 Starting transaction collection unification...")
    
    firestore_service = FirestoreService()
    if not firestore_service.db:
        print("❌ Firestore not available")
        return
    
    try:
        # Get all users who might have nested transactions
        users_ref = firestore_service.db.collection('users')
        users = users_ref.stream()
        
        migrated_count = 0
        skipped_count = 0
        
        for user_doc in users:
            user_id = user_doc.id
            print(f"📋 Checking user: {user_id}")
            
            # Check for nested transactions
            nested_transactions_ref = user_doc.reference.collection('transactions')
            nested_transactions = nested_transactions_ref.stream()
            
            for transaction_doc in nested_transactions:
                transaction_data = transaction_doc.to_dict()
                
                # Check if this transaction already exists in root collection
                root_query = firestore_service.db.collection('transactions').where('userId', '==', user_id)
                existing_docs = root_query.stream()
                
                # Create a unique identifier based on transaction details
                transaction_signature = f"{transaction_data.get('date', '')}_{transaction_data.get('amount', 0)}_{transaction_data.get('description', '')}"
                
                # Check if already exists
                already_exists = False
                for existing_doc in existing_docs:
                    existing_data = existing_doc.to_dict()
                    existing_signature = f"{existing_data.get('date', '')}_{existing_data.get('amount', 0)}_{existing_data.get('description', '')}"
                    if existing_signature == transaction_signature:
                        already_exists = True
                        break
                
                if not already_exists:
                    # Add to root collection
                    transaction_data['userId'] = user_id
                    transaction_data['source'] = 'migration'
                    transaction_data['migratedAt'] = datetime.now().isoformat()
                    
                    firestore_service.db.collection('transactions').add(transaction_data)
                    migrated_count += 1
                    print(f"  ✅ Migrated: {transaction_data.get('description', 'Unknown')}")
                else:
                    skipped_count += 1
                    print(f"  ⏭️ Skipped (duplicate): {transaction_data.get('description', 'Unknown')}")
        
        print(f"\n🎉 Migration completed!")
        print(f"   - Migrated: {migrated_count} transactions")
        print(f"   - Skipped: {skipped_count} duplicates")
        
        # Verify the unified collection
        print(f"\n🔍 Verifying unified collection...")
        test_user_id = "ilk3jt72kzcJHiCGmThzume6EVx1"
        
        # Get transactions using the old method (dual collection)
        old_transactions = get_transactions_dual_collection(firestore_service, test_user_id)
        
        # Get transactions using the new method (single collection)
        new_transactions = get_transactions_single_collection(firestore_service, test_user_id)
        
        print(f"   - Old method found: {len(old_transactions)} transactions")
        print(f"   - New method found: {len(new_transactions)} transactions")
        
        if len(new_transactions) >= len(old_transactions):
            print("   ✅ Migration successful - unified collection has complete data")
        else:
            print("   ⚠️ Migration may need review - fewer transactions in unified collection")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()

def get_transactions_dual_collection(firestore_service, user_id):
    """Get transactions using the old dual-collection method"""
    all_expenses = []
    
    # Root collection
    try:
        query_root = firestore_service.db.collection('transactions').where('userId', '==', user_id)
        docs_root = query_root.stream()
        for doc in docs_root:
            data = doc.to_dict()
            data['id'] = doc.id
            all_expenses.append(data)
    except Exception as e:
        print(f"Error fetching from root: {e}")

    # Nested collection
    try:
        query_nested = firestore_service.db.collection('users').document(user_id).collection('transactions')
        docs_nested = query_nested.stream()
        for doc in docs_nested:
            data = doc.to_dict()
            data['id'] = doc.id
            all_expenses.append(data)
    except Exception as e:
        print(f"Error fetching from nested: {e}")

    # Remove duplicates
    unique_expenses = {exp['id']: exp for exp in all_expenses}.values()
    return list(unique_expenses)

def get_transactions_single_collection(firestore_service, user_id):
    """Get transactions using the new single-collection method"""
    try:
        query = firestore_service.db.collection('transactions').where('userId', '==', user_id)
        docs = query.stream()
        
        transactions = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            transactions.append(data)
        
        return transactions
    except Exception as e:
        print(f"Error fetching from single collection: {e}")
        return []

if __name__ == '__main__':
    migrate_to_unified_transactions()
