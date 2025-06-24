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
        Add a new transaction to the flat transactions collection (consistent with frontend)
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
            
            # Add transaction to flat transactions collection (same as frontend)
            doc_ref = self.db.collection('transactions').add(transaction_data)
            transaction_id = doc_ref[1].id
            
            print(f"✅ Transaction added to Firestore with ID: {transaction_id}")
            return transaction_id
            
        except Exception as e:
            print(f"❌ Error adding transaction: {e}")
            raise e
    
    def get_user_expenses(self, user_id: str, start_date: datetime = None, end_date: datetime = None, category: str = None) -> List[Dict]:
        """
        Get user expenses from flat transactions collection (consistent with frontend)
        """
        try:
            # Start with basic query on flat transactions collection, filtering by userId
            query = self.db.collection('transactions').where('userId', '==', user_id)
            
            # Apply filters in order of selectivity to minimize index requirements
            # First apply date range if provided
            if start_date and end_date:
                # Use date range for better performance
                query = query.where('date', '>=', start_date.isoformat() if isinstance(start_date, datetime) else start_date)
                query = query.where('date', '<=', end_date.isoformat() if isinstance(end_date, datetime) else end_date)
            elif start_date:
                query = query.where('date', '>=', start_date.isoformat() if isinstance(start_date, datetime) else start_date)
            elif end_date:
                query = query.where('date', '<=', end_date.isoformat() if isinstance(end_date, datetime) else end_date)
            
            # If we have category filter and no date filters, apply category filter
            if category and category != 'all' and not start_date and not end_date:
                query = query.where('category', '==', category)
            
            # Order by date (descending) - this works with single field orders
            try:
                query = query.order_by('date', direction=firestore.Query.DESCENDING)
            except Exception as order_error:
                print(f"Warning: Could not apply ordering: {order_error}")
                # Continue without ordering if it fails
            
            # Limit results to prevent large queries
            query = query.limit(1000)
            
            # Execute query
            docs = query.stream()
            
            expenses = []
            for doc in docs:
                data = doc.to_dict()
                
                # Apply category filter in memory if we couldn't apply it in query
                if category and category != 'all' and (start_date or end_date):
                    if data.get('category', '').lower() != category.lower():
                        continue
                
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
            
            print(f"✅ Successfully fetched {len(expenses)} expenses for user {user_id}")
            return expenses
            
        except Exception as e:
            print(f"❌ Error fetching expenses from Firestore: {e}")
            # Try a simpler query as fallback
            try:
                print("🔄 Attempting simpler query without filters...")
                simple_query = self.db.collection('transactions').where('userId', '==', user_id).limit(100)
                docs = simple_query.stream()
                
                expenses = []
                for doc in docs:
                    data = doc.to_dict()
                    date_str = data.get('date', '')
                    try:
                        timestamp = datetime.fromisoformat(date_str.replace('Z', '+00:00')) if isinstance(date_str, str) else datetime.now()
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
                
                print(f"Fallback query returned {len(expenses)} expenses")
                return expenses
            except Exception as fallback_error:
                print(f"Fallback query also failed: {fallback_error}")
                return []

    def get_monthly_summary(self, user_id: str, month_key: str) -> Dict:
        """
        Get monthly summary data for a specific month (using flat collection structure)
        """
        try:
            # Check if monthly summary exists in separate collection
            monthly_doc = self.db.collection('monthlyData').document(f"{user_id}_{month_key}").get()
            
            if monthly_doc.exists:
                return monthly_doc.to_dict()
            else:
                # If no monthly summary exists, calculate it from transactions
                year, month = map(int, month_key.split('-'))
                expenses = self.get_monthly_expenses(user_id, year, month)
                
                if not expenses:
                    return {
                        'totalAmount': 0,
                        'transactionCount': 0,
                        'categoryBreakdown': {},
                        'month': month_key
                    }
                
                # Calculate summary
                total_amount = sum(exp['amount'] for exp in expenses)
                category_breakdown = {}
                
                for exp in expenses:
                    category = exp.get('category', 'uncategorized')
                    category_breakdown[category] = category_breakdown.get(category, 0) + exp['amount']
                
                summary = {
                    'totalAmount': total_amount,
                    'transactionCount': len(expenses),
                    'categoryBreakdown': category_breakdown,
                    'month': month_key,
                    'userId': user_id,
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                }
                
                # Save the calculated summary for future use
                self.db.collection('monthlyData').document(f"{user_id}_{month_key}").set(summary)
                
                return summary
                
        except Exception as e:
            print(f"❌ Error getting monthly summary: {e}")
            return {
                'totalAmount': 0,
                'transactionCount': 0,
                'categoryBreakdown': {},
                'month': month_key
            }

    def get_monthly_expenses(self, user_id: str, year: int, month: int, category: str = None) -> List[Dict]:
        """
        Get expenses for a specific month by querying flat transactions collection
        """
        try:
            month_key = f"{year:04d}-{month:02d}"
            query = self.db.collection('transactions').where('userId', '==', user_id).where('month', '==', month_key)
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
            print(f"❌ Error getting monthly expenses: {e}")
            return []

    def bulk_import_transactions(self, user_id: str, transactions: List[Dict]) -> Dict:
        """
        Import multiple transactions in bulk from bank statement or CSV
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
                    
                    # Add to batch
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
            print(f"✅ Batch committed: {imported_count} transactions imported")
            
            # Update monthly summaries
            for month_key, data in monthly_updates.items():
                try:
                    # Get existing monthly data or create new
                    monthly_ref = self.db.collection('monthlyData').document(f"{user_id}_{month_key}")
                    monthly_doc = monthly_ref.get()
                    
                    if monthly_doc.exists:
                        existing_data = monthly_doc.to_dict()
                        new_total = existing_data.get('totalAmount', 0) + data['total']
                        new_count = existing_data.get('transactionCount', 0) + data['count']
                    else:
                        new_total = data['total']
                        new_count = data['count']
                    
                    monthly_ref.set({
                        'totalAmount': new_total,
                        'transactionCount': new_count,
                        'month': month_key,
                        'userId': user_id,
                        'lastUpdated': firestore.SERVER_TIMESTAMP
                    }, merge=True)
                    
                except Exception as e:
                    print(f"Failed to update monthly summary for {month_key}: {e}")
            
            print(f"Successfully imported {imported_count} transactions, {failed_count} failed")
            
            return {
                'imported': imported_count,
                'failed': failed_count,
                'total': len(transactions),
                'months_updated': list(monthly_updates.keys())
            }
            
        except Exception as e:
            print(f"Error in bulk import: {e}")
            raise e
