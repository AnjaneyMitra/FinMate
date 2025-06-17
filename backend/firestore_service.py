from google.cloud import firestore
from datetime import datetime, timedelta
import os
from typing import List, Dict, Optional
from google.cloud.firestore import FieldFilter
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class FirestoreService:
    def __init__(self):
        """
        Initialize Firestore client with proper configuration
        """
        try:
            # Set up Firestore client with environment configuration
            project_id = os.getenv('FIREBASE_PROJECT_ID')
            
            if project_id:
                # Use explicit project ID if provided
                self.db = firestore.Client(project=project_id)
            else:
                # Use default credentials (for local development)
                self.db = firestore.Client()
                
            print(f"✅ Firestore client initialized successfully")
            
        except Exception as e:
            print(f"❌ Failed to initialize Firestore client: {e}")
            print("🔧 Please ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set")
            self.db = None
    
    def add_transaction(self, user_id: str, transaction_data: Dict) -> str:
        """
        Add a new transaction
        """
        if not self.db:
            raise Exception("Firestore client not initialized")
            
        try:
            # Add month field for easy querying
            transaction_date = datetime.fromisoformat(transaction_data['date'].replace('Z', '+00:00'))
            month_key = transaction_date.strftime('%Y-%m')
            
            transaction_data.update({
                'month': month_key,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'userId': user_id
            })
            
            # Add transaction to user's transactions collection
            doc_ref = self.db.collection('users').document(user_id).collection('transactions').add(transaction_data)
            transaction_id = doc_ref[1].id
            
            return transaction_id
            
        except Exception as e:
            print(f"Error adding transaction: {e}")
            raise e
    
    def update_transaction(self, user_id: str, transaction_id: str, transaction_data: Dict) -> bool:
        """
        Update an existing transaction
        """
        try:
            # Get the old transaction to determine which months to update
            old_doc = self.db.collection('users').document(user_id).collection('transactions').document(transaction_id).get()
            old_month = old_doc.to_dict().get('month') if old_doc.exists else None
            
            # Add month field for new data
            if 'date' in transaction_data:
                transaction_date = datetime.fromisoformat(transaction_data['date'].replace('Z', '+00:00'))
                new_month = transaction_date.strftime('%Y-%m')
                transaction_data['month'] = new_month
            
            transaction_data['updatedAt'] = firestore.SERVER_TIMESTAMP
            
            # Update the transaction
            self.db.collection('users').document(user_id).collection('transactions').document(transaction_id).update(transaction_data)
            
            return True
            
        except Exception as e:
            print(f"Error updating transaction: {e}")
            return False
    
    def delete_transaction(self, user_id: str, transaction_id: str) -> bool:
        """
        Delete a transaction
        """
        try:
            # Get transaction before deletion to update monthly data
            doc = self.db.collection('users').document(user_id).collection('transactions').document(transaction_id).get()
            if doc.exists:
                month_key = doc.to_dict().get('month')
                
                # Delete the transaction
                doc.reference.delete()
                
                return True
            return False
            
        except Exception as e:
            print(f"Error deleting transaction: {e}")
            return False
    
    def get_user_expenses(self, user_id: str, start_date: datetime = None, end_date: datetime = None, category: str = None) -> List[Dict]:
        """
        Get user expenses from Firestore with improved querying
        """
        try:
            # Query transactions collection for the specific user
            query = self.db.collection('users').document(user_id).collection('transactions')
            
            if start_date:
                query = query.where('date', '>=', start_date)
            
            if end_date:
                query = query.where('date', '<=', end_date)
                
            if category and category != 'all':
                query = query.where('category', '==', category)
            
            # Order by date for consistent results
            query = query.order_by('date', direction=firestore.Query.DESCENDING)
            
            # Execute query
            docs = query.stream()
            
            expenses = []
            for doc in docs:
                data = doc.to_dict()
                expenses.append({
                    'id': doc.id,
                    'amount': data.get('amount', 0),
                    'description': data.get('description', ''),
                    'category': data.get('category', 'uncategorized'),
                    'date': data.get('date', ''),
                    'type': data.get('type', 'expense'),
                    'month': data.get('month', ''),
                    'timestamp': data.get('date') if isinstance(data.get('date'), datetime) else datetime.fromisoformat(data.get('date', '').replace('Z', '+00:00')) if data.get('date') else datetime.now()
                })
            
            return expenses
            
        except Exception as e:
            print(f"Error fetching expenses from Firestore: {e}")
            return []
    
    def get_monthly_expenses(self, user_id: str, year: int, month: int, category: str = None) -> List[Dict]:
        """
        Get expenses for a specific month by querying transactions directly
        """
        try:
            month_key = f"{year:04d}-{month:02d}"
            query = self.db.collection('users').document(user_id).collection('transactions').where('month', '==', month_key)
            if category and category != 'all':
                query = query.where('category', '==', category)
            docs = query.stream()
            expenses = []
            for doc in docs:
                data = doc.to_dict()
                expenses.append({
                    'id': doc.id,
                    'amount': data.get('amount', 0),
                    'description': data.get('description', ''),
                    'category': data.get('category', 'uncategorized'),
                    'date': data.get('date', ''),
                    'type': data.get('type', 'expense'),
                    'month': data.get('month', ''),
                })
            return expenses
        except Exception as e:
            print(f"Error getting monthly expenses: {e}")
            return []
    
    def get_available_months(self, user_id: str) -> List[str]:
        """
        Get list of months that have transaction data
        """
        try:
            # Query monthly data collection for available months
            monthly_docs = self.db.collection('users').document(user_id).collection('monthlyData').stream()
            
            months = []
            for doc in monthly_docs:
                months.append(doc.id)  # Document ID is the month key (YYYY-MM)
            
            return sorted(months, reverse=True)  # Most recent first
            
        except Exception as e:
            print(f"Error getting available months: {e}")
            return []
    
    def save_user_profile(self, user_id: str, profile_data: Dict) -> bool:
        """
        Save or update a user profile in Firestore
        """
        if not self.db:
            raise Exception("Firestore client not initialized")
        try:
            # Save profile data to 'user_profiles' collection, document ID = user_id
            self.db.collection('user_profiles').document(user_id).set(profile_data, merge=True)
            return True
        except Exception as e:
            print(f"Error saving user profile: {e}")
            return False
