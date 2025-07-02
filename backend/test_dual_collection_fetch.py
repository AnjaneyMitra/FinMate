import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
import unittest
import uuid

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from firestore_service import FirestoreService

class TestDualCollectionFetch(unittest.TestCase):
    def setUp(self):
        self.firestore_service = FirestoreService()
        self.test_user_id = f"test_user_{uuid.uuid4()}"
        self.transactions_to_delete = []

    def tearDown(self):
        # Clean up all test data
        for col, doc_id in self.transactions_to_delete:
            if col == "root":
                self.firestore_service.db.collection('transactions').document(doc_id).delete()
            else:
                self.firestore_service.db.collection('users').document(self.test_user_id).collection('transactions').document(doc_id).delete()

    def test_fetches_from_both_collections(self):
        # 1. Add a transaction to the root collection
        root_transaction_data = {
            "amount": 150,
            "description": "Root collection transaction",
            "category": "test",
            "date": datetime.now().isoformat(),
            "type": "expense"
        }
        root_transaction_id = self.firestore_service.add_transaction(self.test_user_id, root_transaction_data)
        self.transactions_to_delete.append(("root", root_transaction_id))

        # 2. Add a transaction directly to the nested collection
        nested_transaction_data = {
            "amount": 250,
            "description": "Nested collection transaction",
            "category": "test",
            "date": (datetime.now() - timedelta(days=1)).isoformat(),
            "type": "expense",
            "userId": self.test_user_id
        }
        nested_doc_ref = self.firestore_service.db.collection('users').document(self.test_user_id).collection('transactions').document()
        nested_doc_ref.set(nested_transaction_data)
        self.transactions_to_delete.append(("nested", nested_doc_ref.id))

        # 3. Fetch expenses for the user
        all_expenses = self.firestore_service.get_user_expenses(self.test_user_id)

        # 4. Assert that both transactions are fetched
        self.assertEqual(len(all_expenses), 2, "Should fetch transactions from both collections")

        descriptions = {t['description'] for t in all_expenses}
        self.assertIn("Root collection transaction", descriptions)
        self.assertIn("Nested collection transaction", descriptions)

if __name__ == '__main__':
    unittest.main()
