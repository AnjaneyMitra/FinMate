from google.cloud import firestore
from datetime import datetime, timedelta
import os
from typing import List, Dict, Optional
from google.cloud.firestore import FieldFilter
from dotenv import load_dotenv
import calendar

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
        Get user expenses from the unified root transactions collection only.
        This eliminates the dual-collection complexity and ensures data consistency.
        """
        try:
            # Query only the root transactions collection
            query = self.db.collection('transactions').where('userId', '==', user_id)
            
            # Apply date filters - ensure proper string formatting
            if start_date and end_date:
                start_str = start_date.isoformat() if isinstance(start_date, datetime) else str(start_date)
                end_str = end_date.isoformat() if isinstance(end_date, datetime) else str(end_date)
                query = query.where('date', '>=', start_str).where('date', '<=', end_str)
            elif start_date:
                start_str = start_date.isoformat() if isinstance(start_date, datetime) else str(start_date)
                query = query.where('date', '>=', start_str)
            elif end_date:
                end_str = end_date.isoformat() if isinstance(end_date, datetime) else str(end_date)
                query = query.where('date', '<=', end_str)
            
            # Apply category filter
            if category and category != 'all':
                query = query.where('category', '==', category)
            
            # Order by date (descending) - skip if filters are complex
            try:
                if not (start_date or end_date or category):
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
                
                # Parse date properly for sorting
                date_str = data.get('date', '')
                try:
                    if isinstance(date_str, str) and date_str:
                        # Handle different date formats
                        if 'T' in date_str:
                            timestamp = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                        else:
                            timestamp = datetime.fromisoformat(date_str)
                    else:
                        timestamp = datetime.now()
                except Exception as date_error:
                    print(f"Date parsing error for '{date_str}': {date_error}")
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
            
            # Sort in memory by timestamp
            expenses.sort(key=lambda x: x['timestamp'], reverse=True)
            
            print(f"✅ Successfully fetched {len(expenses)} expenses for user {user_id} from unified collection")
            return expenses
            
        except Exception as e:
            print(f"❌ Error fetching expenses from unified collection: {e}")
            # Fallback to simple query without filters
            try:
                print("🔄 Attempting fallback query...")
                simple_query = self.db.collection('transactions').where('userId', '==', user_id).limit(100)
                docs = simple_query.stream()
                
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
                        'timestamp': datetime.now()
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
        Get expenses for a specific month by querying flat transactions collection.
        This is now more robust and uses the 'date' field instead of the 'month' field
        to support older transactions that may not have the 'month' field.
        """
        try:
            # Calculate start and end dates for the given month
            _, num_days = calendar.monthrange(year, month)
            start_date = datetime(year, month, 1)
            end_date = datetime(year, month, num_days, 23, 59, 59)

            # Firestore queries on ISO 8601 formatted strings work correctly for range filters.
            # The date is stored as a string from the frontend.
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

    # Tax Filing Data Management
    def save_tax_form_draft(self, user_id: str, form_type: str, form_data: Dict, progress: float = 0.0) -> str:
        """
        Save tax form draft for later completion
        """
        if not self.db:
            raise Exception("Firestore client not initialized")
        
        try:
            draft_data = {
                'userId': user_id,
                'formType': form_type,
                'formData': form_data,
                'progress': progress,
                'lastSaved': firestore.SERVER_TIMESTAMP,
                'status': 'draft'
            }
            
            # Save to tax_form_drafts collection
            doc_ref = self.db.collection('taxFormDrafts').document()
            doc_ref.set(draft_data)
            
            print(f"✅ Tax form draft saved with ID: {doc_ref.id}")
            return doc_ref.id
            
        except Exception as e:
            print(f"❌ Error saving tax form draft: {e}")
            raise e
    
    def get_user_tax_drafts(self, user_id: str) -> List[Dict]:
        """
        Get all tax form drafts for a user
        """
        try:
            query = self.db.collection('taxFormDrafts').where('userId', '==', user_id).order_by('lastSaved', direction=firestore.Query.DESCENDING)
            docs = query.stream()
            
            drafts = []
            for doc in docs:
                data = doc.to_dict()
                drafts.append({
                    'id': doc.id,
                    'formType': data.get('formType'),
                    'progress': data.get('progress', 0),
                    'lastSaved': data.get('lastSaved'),
                    'status': data.get('status', 'draft'),
                    'formData': data.get('formData', {})
                })
            
            print(f"✅ Retrieved {len(drafts)} tax drafts for user {user_id}")
            return drafts
            
        except Exception as e:
            print(f"❌ Error retrieving tax drafts: {e}")
            return []
    
    def update_tax_form_draft(self, draft_id: str, form_data: Dict, progress: float = None) -> bool:
        """
        Update existing tax form draft
        """
        try:
            update_data = {
                'formData': form_data,
                'lastSaved': firestore.SERVER_TIMESTAMP
            }
            
            if progress is not None:
                update_data['progress'] = progress

            self.db.collection('taxFormDrafts').document(draft_id).update(update_data)
            print(f"✅ Tax form draft {draft_id} updated successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error updating tax form draft: {e}")
            return False
    
    def save_tax_form_submission(self, user_id: str, form_type: str, form_data: Dict, 
                                acknowledgment_number: str = None) -> str:
        """
        Save completed tax form submission
        """
        if not self.db:
            raise Exception("Firestore client not initialized")
        
        try:
            submission_data = {
                'userId': user_id,
                'formType': form_type,
                'formData': form_data,
                'submittedAt': firestore.SERVER_TIMESTAMP,
                'acknowledgmentNumber': acknowledgment_number,
                'status': 'submitted'
            }
            
            doc_ref = self.db.collection('taxFormSubmissions').document()
            doc_ref.set(submission_data)
            
            print(f"✅ Tax form submission saved with ID: {doc_ref.id}")
            return doc_ref.id
            
        except Exception as e:
            print(f"❌ Error saving tax form submission: {e}")
            raise e
    
    def get_user_tax_submissions(self, user_id: str) -> List[Dict]:
        """
        Get all tax form submissions for a user
        """
        try:
            query = self.db.collection('taxFormSubmissions').where('userId', '==', user_id).order_by('submittedAt', direction=firestore.Query.DESCENDING)
            docs = query.stream()
            
            submissions = []
            for doc in docs:
                data = doc.to_dict()
                submissions.append({
                    'id': doc.id,
                    'formType': data.get('formType'),
                    'submittedAt': data.get('submittedAt'),
                    'acknowledgmentNumber': data.get('acknowledgmentNumber'),
                    'status': data.get('status', 'submitted')
                })
            
            print(f"✅ Retrieved {len(submissions)} tax submissions for user {user_id}")
            return submissions
            
        except Exception as e:
            print(f"❌ Error retrieving tax submissions: {e}")
            return []
    
    # Tax Document Management Methods
    
    def save_tax_document(self, doc_metadata: Dict) -> str:
        """
        Save tax document metadata to Firestore
        """
        try:
            if not self.db:
                raise Exception("Firestore client not initialized")
            
            # Add document to tax_documents collection
            doc_ref = self.db.collection('tax_documents').add(doc_metadata)
            document_id = doc_ref[1].id
            
            print(f"✅ Tax document saved with ID: {document_id}")
            return document_id
            
        except Exception as e:
            print(f"❌ Error saving tax document: {e}")
            raise e
    
    def get_user_tax_documents(self, user_id: str, form_id: str = None, category_id: str = None) -> List[Dict]:
        """
        Get all tax documents for a user, optionally filtered by form or category
        """
        try:
            if not self.db:
                raise Exception("Firestore client not initialized")
            
            # Start with basic query
            query = self.db.collection('tax_documents').where('user_id', '==', user_id)
            
            # Apply filters if provided
            if form_id:
                query = query.where('form_id', '==', form_id)
            
            if category_id:
                query = query.where('category_id', '==', category_id)
            
            # Order by upload timestamp
            try:
                query = query.order_by('upload_timestamp', direction=firestore.Query.DESCENDING)
            except Exception:
                # Continue without ordering if it fails
                pass
            
            docs = query.stream()
            documents = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id  # Add document ID
                documents.append(data)
            
            print(f"✅ Retrieved {len(documents)} tax documents for user {user_id}")
            return documents
            
        except Exception as e:
            print(f"❌ Error retrieving tax documents: {e}")
            return []
    
    def get_tax_document(self, document_id: str, user_id: str) -> Optional[Dict]:
        """
        Get a specific tax document by ID for a user
        """
        try:
            if not self.db:
                raise Exception("Firestore client not initialized")
            
            doc = self.db.collection('tax_documents').document(document_id).get()
            
            if doc.exists:
                data = doc.to_dict()
                
                # Verify ownership
                if data.get('user_id') == user_id:
                    data['id'] = doc.id
                    return data
                else:
                    print(f"Document {document_id} does not belong to user {user_id}")
                    return None
            else:
                print(f"Document {document_id} not found")
                return None
                
        except Exception as e:
            print(f"❌ Error retrieving tax document {document_id}: {e}")
            return None
    
    def delete_tax_document(self, document_id: str, user_id: str) -> bool:
        """
        Delete a tax document
        """
        try:
            if not self.db:
                raise Exception("Firestore client not initialized")
            
            # First verify ownership
            doc_metadata = self.get_tax_document(document_id, user_id)
            if not doc_metadata:
                return False
            
            # Delete the document
            self.db.collection('tax_documents').document(document_id).delete()
            
            print(f"✅ Tax document {document_id} deleted successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error deleting tax document {document_id}: {e}")
            return False
    
    def update_tax_document_ocr(self, document_id: str, user_id: str, ocr_text: str) -> bool:
        """
        Update OCR text for a tax document
        """
        try:
            if not self.db:
                raise Exception("Firestore client not initialized")
            
            # Verify ownership first
            doc_metadata = self.get_tax_document(document_id, user_id)
            if not doc_metadata:
                return False
            
            # Update OCR data
            self.db.collection('tax_documents').document(document_id).update({
                'ocr_text': ocr_text,
                'ocr_processed': True,
                'ocr_updated_at': firestore.SERVER_TIMESTAMP
            })
            
            print(f"✅ OCR data updated for document {document_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error updating OCR data for document {document_id}: {e}")
            return False

    # User Profile CRUD
    def get_user_profile(self, user_id: str) -> dict:
        """Get a user's profile document from the users collection."""
        if not self.db:
            raise Exception("Firestore client not initialized")
        doc = self.db.collection('users').document(user_id).get()
        if doc.exists:
            return doc.to_dict()
        return None

    def update_user_profile(self, user_id: str, profile_data: dict) -> bool:
        """Update a user's profile document in the users collection."""
        if not self.db:
            raise Exception("Firestore client not initialized")
        self.db.collection('users').document(user_id).set(profile_data, merge=True)
        return True

    def create_user_profile(self, user_id: str, profile_data: dict) -> str:
        """Create a new user profile document in the users collection."""
        if not self.db:
            raise Exception("Firestore client not initialized")
        self.db.collection('users').document(user_id).set(profile_data)
        return user_id
