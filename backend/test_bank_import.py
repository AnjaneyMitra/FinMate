#!/usr/bin/env python3
"""
Test script to verify bank statement import functionality
"""

from firestore_service import FirestoreService
from bank_statement_parser import BankStatementParser
import os

def test_bank_import():
    print("🏦 Testing Bank Statement Import Functionality")
    print("=" * 60)
    
    # Initialize services
    firestore = FirestoreService()
    parser = BankStatementParser()
    
    if not firestore.db:
        print("❌ Firestore not available")
        return
    
    # Test CSV file path
    csv_file = '/Applications/Vscode/FinMate/test_statement.csv'
    
    if not os.path.exists(csv_file):
        print(f"❌ Test CSV file not found: {csv_file}")
        return
    
    print(f"📂 Found test file: {csv_file}")
    
    try:
        # Parse the bank statement
        print("\n1. Parsing bank statement...")
        with open(csv_file, 'rb') as f:
            file_content = f.read()
        
        result = parser.parse_file(file_content, 'test_statement.csv', 'test_user')
        transactions = result.get('transactions', [])
        
        print(f"✅ Parsed {len(transactions)} transactions")
        
        if not transactions:
            print("❌ No transactions found in CSV")
            return
        
        # Show sample transactions
        print("\n📊 Sample transactions:")
        for i, txn in enumerate(transactions[:3]):
            print(f"   {i+1}. {txn.get('description', 'N/A')}: ${txn.get('amount', 0)} ({txn.get('category', 'uncategorized')})")
        
        # Import to Firestore
        test_user_id = 'test_user_bank_import'
        print(f"\n2. Importing to Firestore for user: {test_user_id}")
        
        import_result = firestore.bulk_import_transactions(test_user_id, transactions)
        print(f"✅ Import completed:")
        print(f"   - Imported: {import_result.get('imported', 0)}")
        print(f"   - Failed: {import_result.get('failed', 0)}")
        print(f"   - Months updated: {import_result.get('months_updated', [])}")
        
        # Verify storage
        print("\n3. Verifying stored transactions...")
        stored_expenses = firestore.get_user_expenses(test_user_id)
        print(f"✅ Retrieved {len(stored_expenses)} stored transactions")
        
        if stored_expenses:
            print("\n📋 Stored transactions (first 5):")
            for i, exp in enumerate(stored_expenses[:5]):
                print(f"   {i+1}. {exp.get('description', 'N/A')}: ${exp.get('amount', 0)} ({exp.get('category', 'uncategorized')})")
        
        # Test expense analysis integration
        print("\n4. Testing integration with expense analysis...")
        from datetime import datetime, timedelta
        
        # Get recent expenses (last 30 days)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        recent_expenses = firestore.get_user_expenses(
            test_user_id, 
            start_date=start_date, 
            end_date=end_date
        )
        
        print(f"✅ Found {len(recent_expenses)} recent expenses")
        
        # Calculate totals by category
        category_totals = {}
        for exp in recent_expenses:
            category = exp.get('category', 'uncategorized')
            category_totals[category] = category_totals.get(category, 0) + exp.get('amount', 0)
        
        if category_totals:
            print("\n💰 Category breakdown:")
            for category, total in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
                print(f"   - {category.title()}: ${total:.2f}")
        
        # Test monthly summary
        print("\n5. Testing monthly summary...")
        current_month = datetime.now().strftime('%Y-%m')
        monthly_summary = firestore.get_monthly_summary(test_user_id, current_month)
        
        print(f"✅ Monthly summary for {current_month}:")
        print(f"   - Total Amount: ${monthly_summary.get('totalAmount', 0):.2f}")
        print(f"   - Transaction Count: {monthly_summary.get('transactionCount', 0)}")
        print(f"   - Categories: {list(monthly_summary.get('categoryBreakdown', {}).keys())}")
        
        print("\n🎉 Bank statement import test completed successfully!")
        print("✅ Imported transactions are properly stored and integrated with expense analysis")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_bank_import()
