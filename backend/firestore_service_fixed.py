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
        Get user expenses from Firestore with simplified querying to avoid index requirements
        """
        try:
            print(f"[Firestore] Fetching expenses for user {user_id}")
            
            # Use the simplest possible query to avoid index requirements
            query = self.db.collection('users').document(user_id).collection('transactions')
            
            # Only limit to avoid timeout
            query = query.limit(1000)
            
            # Execute query
            docs = query.stream()
            expenses = []
            
            for doc in docs:
                try:
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
                    
                    # Apply all filters in memory to avoid index requirements
                    # Date range filter
                    if start_date:
                        start_dt = start_date if isinstance(start_date, datetime) else datetime.fromisoformat(str(start_date))
                        if timestamp < start_dt:
                            continue
                    
                    if end_date:
                        end_dt = end_date if isinstance(end_date, datetime) else datetime.fromisoformat(str(end_date))
                        if timestamp > end_dt:
                            continue
                    
                    # Category filter
                    if category and category != 'all':
                        if data.get('category', '').lower() != category.lower():
                            continue
                    
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
                except Exception as doc_error:
                    print(f"Error processing document {doc.id}: {doc_error}")
                    continue
            
            # Sort in memory by timestamp (newest first)
            expenses.sort(key=lambda x: x['timestamp'], reverse=True)
            
            print(f"[Firestore] Successfully fetched {len(expenses)} expenses for user {user_id}")
            return expenses
            
        except Exception as e:
            print(f"[Firestore] Error fetching expenses: {e}")
            return []
    
    def get_monthly_expenses(self, user_id: str, year: int, month: int, category: str = None) -> List[Dict]:
        """
        Get expenses for a specific month by querying transactions directly
        """
        try:
            month_key = f"{year:04d}-{month:02d}"
            
            # Use simple query without compound filtering
            query = self.db.collection('users').document(user_id).collection('transactions')
            
            # Try to use month field if it exists, otherwise filter in memory
            try:
                query = query.where('month', '==', month_key)
                docs = query.stream()
            except Exception as query_error:
                print(f"Month query failed, using simple query: {query_error}")
                # Fallback to simple query and filter in memory
                query = self.db.collection('users').document(user_id).collection('transactions').limit(1000)
                docs = query.stream()
            
            expenses = []
            for doc in docs:
                try:
                    data = doc.to_dict()
                    
                    # If we couldn't filter by month in query, filter in memory
                    doc_month = data.get('month', '')
                    if doc_month != month_key:
                        # Parse date to check month
                        date_str = data.get('date', '')
                        try:
                            if date_str:
                                timestamp = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                                doc_month_key = timestamp.strftime('%Y-%m')
                                if doc_month_key != month_key:
                                    continue
                            else:
                                continue
                        except:
                            continue
                    
                    # Apply category filter in memory
                    if category and category != 'all':
                        if data.get('category', '').lower() != category.lower():
                            continue
                    
                    expenses.append({
                        'id': doc.id,
                        'amount': data.get('amount', 0),
                        'description': data.get('description', ''),
                        'category': data.get('category', 'uncategorized'),
                        'date': data.get('date', ''),
                        'type': data.get('type', 'expense'),
                        'month': data.get('month', ''),
                    })
                except Exception as doc_error:
                    print(f"Error processing document {doc.id}: {doc_error}")
                    continue
                    
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
    
    def get_monthly_summary(self, user_id: str, month_key: str) -> Dict:
        """
        Get monthly summary data for a specific month
        """
        try:
            monthly_doc = self.db.collection('users').document(user_id).collection('monthlyData').document(month_key).get()
            
            if monthly_doc.exists:
                return monthly_doc.to_dict()
            else:
                # If no monthly summary exists, calculate it from transactions
                year, month = map(int, month_key.split('-'))
                expenses = self.get_monthly_expenses(user_id, year, month)
                
                if not expenses:
                    return {
                        'totalExpenses': 0,
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
                    'totalExpenses': total_amount,
                    'transactionCount': len(expenses),
                    'categoryBreakdown': category_breakdown,
                    'month': month_key,
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                }
                
                # Save the calculated summary for future use
                try:
                    self.db.collection('users').document(user_id).collection('monthlyData').document(month_key).set(summary)
                except Exception as save_error:
                    print(f"Warning: Could not save monthly summary: {save_error}")
                
                return summary
                
        except Exception as e:
            print(f"Error getting monthly summary: {e}")
            return {
                'totalExpenses': 0,
                'transactionCount': 0,
                'categoryBreakdown': {},
                'month': month_key
            }

    def bulk_import_transactions(self, user_id: str, transactions: List[Dict]) -> Dict:
        """
        Import multiple transactions in bulk from bank statement or CSV
        """
        if not self.db:
            raise Exception("Firestore client not initialized")
            
        try:
            print(f"[Firestore] Starting bulk import of {len(transactions)} transactions for user {user_id}")
            
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
                    doc_ref = self.db.collection('users').document(user_id).collection('transactions').document()
                    batch.set(doc_ref, transaction_data)
                    
                    # Track monthly updates
                    if month_key not in monthly_updates:
                        monthly_updates[month_key] = {'count': 0, 'total': 0, 'categories': {}}
                    monthly_updates[month_key]['count'] += 1
                    monthly_updates[month_key]['total'] += transaction_data['amount']
                    
                    # Track category breakdown
                    category = transaction_data['category']
                    if category not in monthly_updates[month_key]['categories']:
                        monthly_updates[month_key]['categories'][category] = 0
                    monthly_updates[month_key]['categories'][category] += transaction_data['amount']
                    
                    imported_count += 1
                    
                except Exception as e:
                    print(f"Failed to process transaction: {e}")
                    failed_count += 1
                    continue
            
            # Commit the batch
            print(f"[Firestore] Committing batch of {imported_count} transactions")
            batch.commit()
            
            # Update monthly summaries
            for month_key, data in monthly_updates.items():
                try:
                    # Get existing monthly data or create new
                    monthly_ref = self.db.collection('users').document(user_id).collection('monthlyData').document(month_key)
                    monthly_doc = monthly_ref.get()
                    
                    if monthly_doc.exists:
                        existing_data = monthly_doc.to_dict()
                        new_total = existing_data.get('totalExpenses', 0) + data['total']
                        new_count = existing_data.get('transactionCount', 0) + data['count']
                        
                        # Merge category breakdowns
                        existing_categories = existing_data.get('categoryBreakdown', {})
                        for category, amount in data['categories'].items():
                            existing_categories[category] = existing_categories.get(category, 0) + amount
                        
                        category_breakdown = existing_categories
                    else:
                        new_total = data['total']
                        new_count = data['count']
                        category_breakdown = data['categories']
                    
                    monthly_ref.set({
                        'totalExpenses': new_total,
                        'transactionCount': new_count,
                        'categoryBreakdown': category_breakdown,
                        'month': month_key,
                        'lastUpdated': firestore.SERVER_TIMESTAMP
                    }, merge=True)
                    
                    print(f"[Firestore] Updated monthly summary for {month_key}: {new_count} transactions, ${new_total:.2f}")
                    
                except Exception as e:
                    print(f"Failed to update monthly summary for {month_key}: {e}")
            
            print(f"[Firestore] Bulk import completed: {imported_count} imported, {failed_count} failed")
            
            return {
                'imported': imported_count,
                'failed': failed_count,
                'total': len(transactions),
                'months_updated': list(monthly_updates.keys())
            }
            
        except Exception as e:
            print(f"Error in bulk import: {e}")
            raise e
