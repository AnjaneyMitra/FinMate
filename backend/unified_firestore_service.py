from google.cloud import firestore
from datetime import datetime, timedelta
import os
from typing import List, Dict, Optional
from google.cloud.firestore import FieldFilter
from dotenv import load_dotenv
import calendar

# Load environment variables
load_dotenv()

class UnifiedFirestoreService:
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
        Add a new transaction to the root transactions collection only.
        This ensures all transactions are stored in a single, consistent location.
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
                'updatedAt': firestore.SERVER_TIMESTAMP,
                'userId': user_id
            })
            
            # Add transaction to root transactions collection only
            doc_ref = self.db.collection('transactions').add(transaction_data)
            transaction_id = doc_ref[1].id
            
            print(f"✅ Transaction added to unified collection with ID: {transaction_id}")
            return transaction_id
            
        except Exception as e:
            print(f"❌ Error adding transaction: {e}")
            raise e
    
    def get_user_expenses(self, user_id: str, start_date: datetime = None, end_date: datetime = None, category: str = None) -> List[Dict]:
        """
        Get user expenses from the unified root transactions collection only.
        This eliminates the dual-collection complexity and ensures data consistency.
        """
        try:
            # Query only the root transactions collection
            query = self.db.collection('transactions').where('userId', '==', user_id)
            
            # Apply date filters
            if start_date and end_date:
                query = query.where('date', '>=', start_date.isoformat() if isinstance(start_date, datetime) else start_date)
                query = query.where('date', '<=', end_date.isoformat() if isinstance(end_date, datetime) else end_date)
            elif start_date:
                query = query.where('date', '>=', start_date.isoformat() if isinstance(start_date, datetime) else start_date)
            elif end_date:
                query = query.where('date', '<=', end_date.isoformat() if isinstance(end_date, datetime) else end_date)
            
            # Apply category filter
            if category and category != 'all':
                query = query.where('category', '==', category)
            
            # Order by date (descending)
            try:
                query = query.order_by('date', direction=firestore.Query.DESCENDING)
            except Exception as order_error:
                print(f"Warning: Could not apply ordering: {order_error}")
            
            # Limit results to prevent large queries
            query = query.limit(1000)
            
            # Execute query
            docs = query.stream()
            
            expenses = []
            for doc in docs:
                data = doc.to_dict()
                
                # Parse date properly
                date_str = data.get('date', '')
                try:
                    if isinstance(date_str, str):
                        timestamp = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    else:
                        timestamp = date_str if isinstance(date_str, datetime) else datetime.now()
                except:
                    timestamp = datetime.now()
                
                expenses.append({
                    'id': doc.id,
                    'amount': data.get('amount', 0),
                    'description': data.get('description', ''),
                    'category': data.get('category', 'uncategorized'),
                    'date': date_str,
                    'type': data.get('type', 'expense'),
                    'month': data.get('month', ''),
                    'timestamp': timestamp
                })
            
            # Sort in memory if we couldn't sort in query
            expenses.sort(key=lambda x: x['timestamp'], reverse=True)
            
            print(f"✅ Successfully fetched {len(expenses)} expenses for user {user_id} from unified collection")
            return expenses
            
        except Exception as e:
            print(f"❌ Error fetching expenses from unified collection: {e}")
            return []

    def get_monthly_expenses(self, user_id: str, year: int, month: int, category: str = None) -> List[Dict]:
        """
        Get expenses for a specific month from the unified transactions collection.
        """
        try:
            # Calculate start and end dates for the given month
            _, num_days = calendar.monthrange(year, month)
            start_date = datetime(year, month, 1)
            end_date = datetime(year, month, num_days, 23, 59, 59)

            start_date_iso = start_date.isoformat()
            end_date_iso = end_date.isoformat()

            query = self.db.collection('transactions').where('userId', '==', user_id)
            query = query.where('date', '>=', start_date_iso).where('date', '<=', end_date_iso)

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
            
            print(f"✅ Retrieved {len(expenses)} monthly expenses for {year}-{month:02d}")
            return expenses
        except Exception as e:
            print(f"❌ Error getting monthly expenses: {e}")
            return []

    def bulk_import_transactions(self, user_id: str, transactions: List[Dict]) -> Dict:
        """
        Import multiple transactions in bulk to the unified root collection only.
        """
        if not self.db:
            raise Exception("Firestore client not initialized")
            
        try:
            batch = self.db.batch()
            imported_count = 0
            failed_count = 0
            monthly_updates = {}
            
            for transaction in transactions:
                try:
                    # Validate and process transaction data
                    transaction_date = datetime.fromisoformat(transaction['date'].replace('Z', '+00:00'))
                    month_key = transaction_date.strftime('%Y-%m')
                    
                    # Prepare transaction data
                    transaction_data = {
                        'amount': float(transaction['amount']),
                        'description': transaction.get('description', ''),
                        'category': transaction.get('category', 'uncategorized'),
                        'date': transaction['date'],
                        'type': transaction.get('type', 'expense'),
                        'month': month_key,
                        'source': transaction.get('source', 'import'),
                        'createdAt': firestore.SERVER_TIMESTAMP,
                        'userId': user_id
                    }
                    
                    # Add to batch - root collection only
                    doc_ref = self.db.collection('transactions').document()
                    batch.set(doc_ref, transaction_data)
                    
                    # Track monthly updates
                    if month_key not in monthly_updates:
                        monthly_updates[month_key] = {'count': 0, 'total': 0}
                    monthly_updates[month_key]['count'] += 1
                    monthly_updates[month_key]['total'] += transaction_data['amount']
                    
                    imported_count += 1
                    
                except Exception as e:
                    print(f"❌ Failed to process transaction: {e}")
                    failed_count += 1
                    continue
            
            # Commit the batch
            batch.commit()
            print(f"✅ Batch committed: {imported_count} transactions imported to unified collection")
            
            return {
                'imported': imported_count,
                'failed': failed_count,
                'total': len(transactions),
                'months_updated': list(monthly_updates.keys())
            }
            
        except Exception as e:
            print(f"Error in bulk import: {e}")
            raise e

# Test the unified service
def test_unified_service():
    print("🧪 Testing Unified Firestore Service...")
    
    service = UnifiedFirestoreService()
    test_user_id = "ilk3jt72kzcJHiCGmThzume6EVx1"
    
    if service.db:
        # Test fetching expenses
        expenses = service.get_user_expenses(test_user_id)
        print(f"📊 Found {len(expenses)} transactions for user {test_user_id}")
        
        if expenses:
            print("🔍 Sample transactions:")
            for i, exp in enumerate(expenses[:3]):
                print(f"  {i+1}. {exp.get('description', 'N/A')}: ${exp.get('amount', 0)} ({exp.get('date', 'N/A')})")
        
        return len(expenses)
    else:
        print("❌ Service not available")
        return 0

if __name__ == '__main__':
    test_unified_service()
