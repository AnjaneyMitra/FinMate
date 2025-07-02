#!/usr/bin/env python3

import google.cloud.firestore as firestore
import os

# Set up Firestore client
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Applications/Vscode/FinMate/backend/finmate-service-account.json"

def check_transactions():
    try:
        db = firestore.Client(project="finmate-aad4a")
        print("Connected to Firestore successfully")
        
        # Get all transactions
        transactions_ref = db.collection('transactions')
        all_transactions = list(transactions_ref.limit(10).get())
        
        print(f"Total transactions found: {len(all_transactions)}")
        
        if all_transactions:
            for doc in all_transactions:
                data = doc.to_dict()
                print(f"Transaction ID: {doc.id}")
                print(f"  User ID: {data.get('user_id', 'N/A')}")
                print(f"  Description: {data.get('description', 'N/A')}")
                print(f"  Amount: ${data.get('amount', 0)}")
                print(f"  Date: {data.get('date', 'N/A')}")
                print("---")
        else:
            print("No transactions found in the database")
            
        # Check specifically for the user
        user_id = 'ilk3jt72kzcJHiCGmThzume6EVx1'
        user_transactions = list(transactions_ref.where('user_id', '==', user_id).limit(5).get())
        print(f"\nTransactions for user {user_id}: {len(user_transactions)}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_transactions()
