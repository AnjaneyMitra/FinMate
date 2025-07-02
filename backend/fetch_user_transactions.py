import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from firestore_service import FirestoreService

def fetch_transactions(user_id):
    """
    Fetches all transactions for a given user from Firestore.
    """
    print(f"Fetching transactions for user: {user_id}")
    firestore_service = FirestoreService()
    transactions = firestore_service.get_user_expenses(user_id)
    if transactions:
        print("Found transactions:")
        for t in transactions:
            print(t)
    else:
        print("No transactions found for this user.")

if __name__ == '__main__':
    user_id = "ilk3jt72kzcJHiCGmThzume6EVx1"
    fetch_transactions(user_id)
