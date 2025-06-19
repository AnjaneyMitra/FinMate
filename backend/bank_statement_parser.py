"""
Bank Statement Parser Service for FinMate
Supports CSV and PDF bank statements from various Indian banks
"""

import csv
import io
import re
import pandas as pd
import pdfplumber
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import chardet
from fastapi import HTTPException


class BankStatementParser:
    """
    Parser for various bank statement formats (CSV, PDF)
    Supports major Indian banks like SBI, ICICI, HDFC, Axis, etc.
    """
    
    def __init__(self):
        self.supported_formats = ['.csv', '.pdf']
        self.bank_patterns = self._get_bank_patterns()
        
    def _get_bank_patterns(self) -> Dict[str, Dict]:
        """Define parsing patterns for different banks"""
        return {
            'sbi': {
                'date_patterns': [r'\d{2}/\d{2}/\d{4}', r'\d{2}-\d{2}-\d{4}'],
                'amount_patterns': [r'[\d,]+\.\d{2}'],
                'description_keywords': ['NEFT', 'IMPS', 'UPI', 'ATM', 'POS'],
                'csv_columns': {
                    'date': ['date', 'txn date', 'transaction date'],
                    'description': ['description', 'narration', 'remarks'],
                    'amount': ['amount', 'debit', 'credit', 'withdrawal', 'deposit'],
                    'balance': ['balance', 'running balance']
                }
            },
            'icici': {
                'date_patterns': [r'\d{2}/\d{2}/\d{4}', r'\d{2}-\d{2}-\d{4}'],
                'amount_patterns': [r'[\d,]+\.\d{2}'],
                'description_keywords': ['NEFT', 'IMPS', 'UPI', 'ATM', 'POS'],
                'csv_columns': {
                    'date': ['date', 'value date', 'transaction date'],
                    'description': ['description', 'transaction remarks', 'narration'],
                    'amount': ['amount', 'debit amount', 'credit amount'],
                    'balance': ['balance']
                }
            },
            'hdfc': {
                'date_patterns': [r'\d{2}/\d{2}/\d{4}', r'\d{2}-\d{2}-\d{4}'],
                'amount_patterns': [r'[\d,]+\.\d{2}'],
                'description_keywords': ['NEFT', 'IMPS', 'UPI', 'ATM', 'POS'],
                'csv_columns': {
                    'date': ['date', 'transaction date'],
                    'description': ['narration', 'description'],
                    'amount': ['amount', 'debit amount', 'credit amount'],
                    'balance': ['closing balance']
                }
            },
            'axis': {
                'date_patterns': [r'\d{2}/\d{2}/\d{4}', r'\d{2}-\d{2}-\d{4}'],
                'amount_patterns': [r'[\d,]+\.\d{2}'],
                'description_keywords': ['NEFT', 'IMPS', 'UPI', 'ATM', 'POS'],
                'csv_columns': {
                    'date': ['tran date', 'transaction date', 'date'],
                    'description': ['particulars', 'description', 'narration'],
                    'amount': ['amount', 'debit', 'credit'],
                    'balance': ['balance']
                }
            },
            'generic': {
                'date_patterns': [r'\d{2}/\d{2}/\d{4}', r'\d{2}-\d{2}-\d{4}', r'\d{4}-\d{2}-\d{2}'],
                'amount_patterns': [r'[\d,]+\.\d{2}'],
                'description_keywords': ['NEFT', 'IMPS', 'UPI', 'ATM', 'POS'],
                'csv_columns': {
                    'date': ['date', 'transaction date', 'txn date', 'transaction_date', 'trans date'],
                    'description': ['description', 'narration', 'remarks', 'particulars', 'details', 'transaction details'],
                    'amount': ['amount', 'debit', 'credit', 'withdrawal', 'deposit', 'transaction amount', 'value'],
                    'balance': ['balance', 'running balance', 'available balance', 'closing balance']
                }
            }
        }
    
    def detect_encoding(self, file_content: bytes) -> str:
        """Detect file encoding"""
        try:
            result = chardet.detect(file_content)
            encoding = result.get('encoding', 'utf-8')
            # Ensure we have a valid encoding
            if not encoding:
                encoding = 'utf-8'
            return encoding
        except:
            return 'utf-8'
    
    def parse_file(self, file_content: bytes, filename: str, user_id: str) -> Dict[str, Any]:
        """
        Main parsing function that routes to appropriate parser
        """
        file_extension = filename.lower().split('.')[-1]
        
        if file_extension not in ['csv', 'pdf']:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format: {file_extension}. Supported formats: CSV, PDF"
            )
        
        try:
            if file_extension == 'csv':
                return self._parse_csv(file_content, filename)
            elif file_extension == 'pdf':
                return self._parse_pdf(file_content, filename)
        except Exception as e:
            raise HTTPException(
                status_code=422,
                detail=f"Error parsing file: {str(e)}"
            )
    
    def _parse_csv(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Parse CSV bank statement"""
        try:
            # Ensure we have bytes
            if isinstance(file_content, str):
                file_content = file_content.encode('utf-8')
            
            # Detect encoding
            encoding = self.detect_encoding(file_content)
            
            # Try to read with pandas first
            try:
                # Convert bytes to string
                content_str = file_content.decode(encoding)
                df = pd.read_csv(io.StringIO(content_str))
            except Exception as e:
                # Fallback to standard CSV reader
                content_str = file_content.decode('utf-8')
                csv_reader = csv.DictReader(io.StringIO(content_str))
                data = list(csv_reader)
                df = pd.DataFrame(data)
            
            # Detect bank and parse accordingly
            bank_type = self._detect_bank_type(df.columns.tolist())
            transactions = self._extract_transactions_from_csv(df, bank_type)
            
            return {
                'success': True,
                'bank_type': bank_type,
                'total_transactions': len(transactions),
                'transactions': transactions,
                'file_info': {
                    'filename': filename,
                    'format': 'csv',
                    'encoding': encoding,
                    'columns': df.columns.tolist()
                }
            }
            
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"CSV parsing error: {str(e)}")
    
    def _parse_pdf(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Parse PDF bank statement"""
        try:
            transactions = []
            
            # Ensure we have bytes
            if isinstance(file_content, str):
                file_content = file_content.encode('utf-8')
            
            print(f"DEBUG: PDF file size: {len(file_content)} bytes")
            
            # Create a file-like object from bytes
            pdf_file = io.BytesIO(file_content)
            
            with pdfplumber.open(pdf_file) as pdf:
                all_text = ""
                tables = []
                
                print(f"DEBUG: PDF has {len(pdf.pages)} pages")
                
                for page_num, page in enumerate(pdf.pages):
                    print(f"DEBUG: Processing page {page_num + 1}")
                    
                    # Extract text
                    page_text = page.extract_text()
                    if page_text:
                        all_text += page_text + "\n"
                        print(f"DEBUG: Page {page_num + 1} text length: {len(page_text)}")
                        # Show first 500 characters of each page for debugging
                        print(f"DEBUG: Page {page_num + 1} preview: {page_text[:500]}...")
                    
                    # Extract tables
                    page_tables = page.extract_tables()
                    if page_tables:
                        tables.extend(page_tables)
                        print(f"DEBUG: Page {page_num + 1} found {len(page_tables)} tables")
                
                print(f"DEBUG: Total text length: {len(all_text)}")
                print(f"DEBUG: Total tables found: {len(tables)}")
                
                # Detect bank type from text
                bank_type = self._detect_bank_type_from_text(all_text)
                print(f"DEBUG: Detected bank type: {bank_type}")
                
                # Show sample of text for debugging
                print(f"DEBUG: Sample text (first 1000 chars): {all_text[:1000]}")
                
                # Try to extract transactions from tables first
                if tables:
                    print("DEBUG: Attempting to extract from tables...")
                    for i, table in enumerate(tables):
                        print(f"DEBUG: Table {i} has {len(table)} rows")
                        if len(table) > 0:
                            print(f"DEBUG: Table {i} first row: {table[0]}")
                        if len(table) > 1:
                            print(f"DEBUG: Table {i} second row: {table[1]}")
                    transactions = self._extract_transactions_from_pdf_tables(tables, bank_type)
                    print(f"DEBUG: Extracted {len(transactions)} transactions from tables")
                
                # If no tables found, try text parsing
                if not transactions:
                    print("DEBUG: Attempting to extract from text...")
                    transactions = self._extract_transactions_from_pdf_text(all_text, bank_type)
                    print(f"DEBUG: Extracted {len(transactions)} transactions from text")
            
            return {
                'success': True,
                'bank_type': bank_type,
                'total_transactions': len(transactions),
                'transactions': transactions,
                'file_info': {
                    'filename': filename,
                    'format': 'pdf',
                    'pages': len(pdf.pages),
                    'tables_found': len(tables)
                }
            }
            
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"PDF parsing error: {str(e)}")
    
    def _detect_bank_type(self, columns: List[str]) -> str:
        """Detect bank type from CSV columns"""
        columns_lower = [col.lower().strip() for col in columns]
        
        for bank, patterns in self.bank_patterns.items():
            score = 0
            for field_type, field_names in patterns['csv_columns'].items():
                for field_name in field_names:
                    if field_name.lower() in columns_lower:
                        score += 1
            
            if score >= 2:  # Minimum match threshold
                return bank
        
        return 'generic'
    
    def _detect_bank_type_from_text(self, text: str) -> str:
        """Detect bank type from PDF text content"""
        text_lower = text.lower()
        
        bank_identifiers = {
            'hdfc': ['hdfc bank', 'hdfc', 'hdfc bank ltd', 'hdfcbank', 'housing development finance corporation'],
            'sbi': ['state bank of india', 'sbi', 'state bank'],
            'icici': ['icici bank', 'icici'],
            'axis': ['axis bank', 'axis'],
            'pnb': ['punjab national bank', 'pnb'],
            'boi': ['bank of india', 'boi'],
            'canara': ['canara bank', 'canara'],
            'uco': ['uco bank', 'uco'],
            'union': ['union bank', 'union'],
        }
        
        print(f"DEBUG: Checking bank identifiers in text...")
        for bank, identifiers in bank_identifiers.items():
            for identifier in identifiers:
                if identifier in text_lower:
                    print(f"DEBUG: Found '{identifier}' - identified as {bank}")
                    return bank
        
        print("DEBUG: No bank identifiers found, using generic")
        return 'generic'
    
    def _extract_transactions_from_csv(self, df: pd.DataFrame, bank_type: str) -> List[Dict]:
        """Extract and normalize transactions from CSV DataFrame"""
        transactions = []
        
        # Get column mappings for the detected bank
        bank_config = self.bank_patterns.get(bank_type, self.bank_patterns['sbi'])
        column_mapping = bank_config['csv_columns']
        
        # Find actual column names
        actual_columns = self._map_columns(df.columns.tolist(), column_mapping)
        
        for index, row in df.iterrows():
            try:
                transaction = self._extract_transaction_from_row(row, actual_columns, bank_type)
                if transaction:
                    transactions.append(transaction)
            except Exception as e:
                print(f"Error processing row {index}: {e}")
                continue
        
        return transactions
    
    def _map_columns(self, df_columns: List[str], column_mapping: Dict) -> Dict[str, str]:
        """Map DataFrame columns to standard transaction fields"""
        df_columns_lower = [col.lower().strip() for col in df_columns]
        actual_columns = {}
        
        for field_type, possible_names in column_mapping.items():
            for possible_name in possible_names:
                for i, col in enumerate(df_columns_lower):
                    if possible_name.lower() in col:
                        actual_columns[field_type] = df_columns[i]
                        break
                if field_type in actual_columns:
                    break
        
        return actual_columns
    
    def _extract_transaction_from_row(self, row: pd.Series, column_mapping: Dict, bank_type: str) -> Optional[Dict]:
        """Extract transaction details from a DataFrame row"""
        try:
            # Extract date
            date_str = None
            if 'date' in column_mapping:
                date_str = str(row[column_mapping['date']]).strip()
            
            if not date_str or date_str.lower() in ['nan', 'none', '']:
                return None
            
            # Parse date
            transaction_date = self._parse_date(date_str)
            if not transaction_date:
                return None
            
            # Extract description
            description = ""
            if 'description' in column_mapping:
                description = str(row[column_mapping['description']]).strip()
            
            # Extract amount (handle both debit/credit columns and single amount column)
            amount = 0.0
            transaction_type = "expense"  # default
            
            if 'amount' in column_mapping:
                amount_str = str(row[column_mapping['amount']]).strip()
                amount = self._parse_amount(amount_str)
                
                # Determine if it's income or expense based on description or amount sign
                if amount > 0:
                    if any(keyword.lower() in description.lower() for keyword in ['salary', 'credit', 'deposit', 'transfer in', 'refund']):
                        transaction_type = "income"
                    else:
                        transaction_type = "expense"
                elif amount < 0:
                    amount = abs(amount)
                    transaction_type = "expense"
            
            # Categorize transaction
            category = self._categorize_transaction(description)
            
            transaction = {
                'date': transaction_date.isoformat(),
                'description': description,
                'amount': amount,
                'transaction_type': transaction_type,  # Changed from 'type' to 'transaction_type'
                'category': category,
                'source': f'{bank_type}_csv',
                'raw_data': row.to_dict()
            }
            
            return transaction
            
        except Exception as e:
            print(f"Error extracting transaction: {e}")
            return None
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse various date formats"""
        date_formats = [
            '%d/%m/%Y',
            '%d-%m-%Y',
            '%Y-%m-%d',
            '%d/%m/%y',
            '%d-%m-%y',
            '%m/%d/%Y',
            '%m-%d-%Y'
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        return None
    
    def _parse_amount(self, amount_str: str) -> float:
        """Parse amount string to float"""
        if not amount_str or amount_str.lower() in ['nan', 'none', '']:
            return 0.0
        
        # Remove currency symbols and commas
        cleaned = re.sub(r'[₹$,\s]', '', amount_str)
        
        # Handle negative amounts in parentheses
        if cleaned.startswith('(') and cleaned.endswith(')'):
            cleaned = '-' + cleaned[1:-1]
        
        try:
            return float(cleaned)
        except ValueError:
            return 0.0
    
    def _categorize_transaction(self, description: str) -> str:
        """Automatically categorize transactions based on description"""
        description_lower = description.lower()
        
        category_keywords = {
            'food': ['restaurant', 'cafe', 'food', 'zomato', 'swiggy', 'dominos', 'pizza', 'mcdonald', 'kfc', 'grocery', 'supermarket'],
            'transport': ['uber', 'ola', 'metro', 'bus', 'taxi', 'fuel', 'petrol', 'diesel', 'gas station', 'parking'],
            'bills': ['electricity', 'water', 'gas', 'internet', 'mobile', 'phone', 'broadband', 'cable', 'dth'],
            'shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'mall', 'store', 'market'],
            'entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment'],
            'healthcare': ['hospital', 'doctor', 'medical', 'pharmacy', 'medicine', 'health'],
            'education': ['school', 'college', 'university', 'course', 'book', 'education'],
            'investment': ['mutual fund', 'sip', 'fd', 'rd', 'investment', 'shares', 'stocks'],
            'transfer': ['neft', 'imps', 'upi', 'transfer', 'payment'],
            'atm': ['atm', 'cash withdrawal', 'cash'],
            'salary': ['salary', 'wages', 'income']
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in description_lower for keyword in keywords):
                return category
        
        return 'miscellaneous'
    
    def _extract_transactions_from_pdf_tables(self, tables: List, bank_type: str) -> List[Dict]:
        """Extract transactions from PDF tables"""
        transactions = []
        
        print(f"DEBUG: Starting table extraction for {bank_type}")
        
        for table_idx, table in enumerate(tables):
            if not table:  # Skip completely empty tables
                print(f"DEBUG: Skipping table {table_idx} - completely empty")
                continue
            
            # For HDFC, we need to handle single-row tables that contain concatenated data
            if bank_type == 'hdfc' and len(table) == 1:
                # Check if this single row contains concatenated transaction data
                row = table[0]
                has_concatenated_data = any(cell and '\n' in str(cell) for cell in row if cell)
                if has_concatenated_data:
                    print(f"DEBUG: Processing HDFC single-row table {table_idx} with concatenated data")
                    try:
                        transactions_from_row = self._extract_hdfc_concatenated_transactions(row, table_idx, 0)
                        transactions.extend(transactions_from_row)
                        continue
                    except Exception as e:
                        print(f"DEBUG: Error processing single-row table {table_idx}: {e}")
                        continue
                else:
                    print(f"DEBUG: Skipping table {table_idx} - single row without concatenated data")
                    continue
            elif len(table) < 2:  # Skip tables that are too small for other banks
                print(f"DEBUG: Skipping table {table_idx} - too small")
                continue
            
            print(f"DEBUG: Processing table {table_idx} with {len(table)} rows")
            
            # For HDFC, look for specific table structures
            if bank_type == 'hdfc':
                # HDFC tables often have headers like: Date, Narration, Chq/Ref No, Value Dt, Withdrawal Amt, Deposit Amt, Closing Balance
                # The key issue: Multiple transactions are concatenated in single cells with '\n' separators
                
                for row_idx, row in enumerate(table):
                    if row_idx == 0:  # Header row
                        print(f"DEBUG: Table {table_idx} headers: {row}")
                        continue
                    
                    if not row or len(row) < 4:  # Need at least 4 columns
                        continue
                        
                    try:
                        print(f"DEBUG: Processing HDFC table row {row_idx}: {row}")
                        
                        # For HDFC PDFs, check if we have concatenated data (newlines in cells)
                        has_concatenated_data = any(cell and '\n' in str(cell) for cell in row if cell)
                        
                        if has_concatenated_data:
                            print(f"DEBUG: Found concatenated data in row {row_idx}")
                            # Split concatenated data into individual transactions
                            transactions_from_row = self._extract_hdfc_concatenated_transactions(row, table_idx, row_idx)
                            transactions.extend(transactions_from_row)
                        else:
                            # Regular single transaction per row
                            transaction = self._extract_single_hdfc_transaction(row, table_idx, row_idx)
                            if transaction:
                                transactions.append(transaction)
                    
                    except Exception as e:
                        print(f"DEBUG: Error processing table row {row_idx}: {e}")
                        continue
            else:
                # Generic table processing
                try:
                    df = pd.DataFrame(table[1:], columns=table[0])  # First row as header
                    
                    # Clean column names
                    df.columns = [str(col).strip() if col else f'col_{i}' for i, col in enumerate(df.columns)]
                    
                    # Extract transactions using CSV logic
                    bank_transactions = self._extract_transactions_from_csv(df, bank_type)
                    transactions.extend(bank_transactions)
                    
                except Exception as e:
                    print(f"DEBUG: Error processing table {table_idx}: {e}")
                    continue
        
        print(f"DEBUG: Table extraction completed. Found {len(transactions)} transactions")
        return transactions
    
    def _extract_transactions_from_pdf_text(self, text: str, bank_type: str) -> List[Dict]:
        """Extract transactions from PDF text using regex patterns"""
        transactions = []
        
        print(f"DEBUG: Starting text parsing for bank type: {bank_type}")
        
        # Split text into lines for processing
        lines = text.split('\n')
        print(f"DEBUG: Processing {len(lines)} lines of text")
        
        # Enhanced patterns for different banks
        if bank_type == 'hdfc':
            # HDFC specific patterns - more flexible
            date_pattern = r'\b\d{2}/\d{2}/\d{4}\b'
            amount_pattern = r'\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b'
            # Also look for lines that have transaction-like structure
            transaction_line_pattern = r'(\d{2}/\d{2}/\d{4}).+?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
        else:
            # Generic patterns
            date_pattern = r'\b\d{2}[/-]\d{2}[/-]\d{4}\b'
            amount_pattern = r'\b[\d,]+\.\d{2}\b'
            transaction_line_pattern = r'(\d{2}[/-]\d{2}[/-]\d{4}).+?([\d,]+\.\d{2})'
        
        transaction_count = 0
        
        # Try pattern-based matching first
        if bank_type == 'hdfc':
            print("DEBUG: Using HDFC pattern matching...")
            transaction_matches = re.finditer(transaction_line_pattern, text)
            
            for match in transaction_matches:
                try:
                    date_str = match.group(1)
                    amount_str = match.group(2)
                    
                    # Get the full line for description
                    start_pos = max(0, match.start() - 100)
                    end_pos = min(len(text), match.end() + 100)
                    context = text[start_pos:end_pos]
                    
                    # Find the line containing this match
                    lines_context = context.split('\n')
                    transaction_line = ""
                    for line in lines_context:
                        if date_str in line and amount_str in line:
                            transaction_line = line.strip()
                            break
                    
                    if transaction_line:
                        # Extract description
                        description = transaction_line.replace(date_str, '').replace(amount_str, '')
                        description = re.sub(r'\s+', ' ', description).strip()
                        
                        # Parse amount and date
                        amount = self._parse_amount(amount_str)
                        transaction_date = self._parse_date(date_str)
                        
                        if amount > 0 and transaction_date and description and len(description) > 3:
                            transaction = {
                                'date': transaction_date.isoformat(),
                                'description': description,
                                'amount': amount,
                                'transaction_type': 'expense',
                                'category': self._categorize_transaction(description),
                                'source': f'{bank_type}_pdf_text_pattern',
                                'raw_data': {'line': transaction_line}
                            }
                            
                            transactions.append(transaction)
                            transaction_count += 1
                            print(f"DEBUG: Pattern match {transaction_count}: {date_str} | {amount} | {description[:50]}...")
                
                except Exception as e:
                    print(f"DEBUG: Error processing pattern match: {e}")
                    continue
        
        # Fallback to line-by-line processing if pattern matching didn't work well
        if len(transactions) < 5:  # If we didn't find many transactions
            print("DEBUG: Using line-by-line parsing as fallback...")
            
            for i, line in enumerate(lines):
                line = line.strip()
                if not line or len(line) < 15:  # Skip very short lines
                    continue
                
                # Look for date patterns
                date_matches = re.findall(date_pattern, line)
                if not date_matches:
                    continue
                
                # Look for amount patterns
                amount_matches = re.findall(amount_pattern, line)
                if not amount_matches:
                    continue
                
                # Skip header lines or non-transaction lines
                skip_keywords = ['account', 'branch', 'address', 'phone', 'email', 'page', 'statement', 
                               'balance brought forward', 'balance carried forward', 'opening balance', 
                               'closing balance', 'total', 'summary']
                if any(keyword in line.lower() for keyword in skip_keywords):
                    continue
                
                try:
                    # Use the first date
                    date_str = date_matches[0]
                    
                    # Try different amounts (look for transaction amounts, not balances)
                    for amount_str in amount_matches:
                        amount = self._parse_amount(amount_str)
                        if amount > 0 and amount < 1000000:  # Reasonable transaction amount
                            transaction_date = self._parse_date(date_str)
                            
                            if transaction_date:
                                # Extract description (remove date and amount from line)
                                description = line
                                for date_match in date_matches:
                                    description = description.replace(date_match, '')
                                for amount_match in amount_matches:
                                    description = description.replace(amount_match, '')
                                description = re.sub(r'\s+', ' ', description).strip()
                                
                                if description and len(description) > 3:  # Valid description
                                    transaction = {
                                        'date': transaction_date.isoformat(),
                                        'description': description,
                                        'amount': amount,
                                        'transaction_type': 'expense',  # Default
                                        'category': self._categorize_transaction(description),
                                        'source': f'{bank_type}_pdf_text_line',
                                        'raw_data': {'line': line, 'line_number': i}
                                    }
                                    
                                    transactions.append(transaction)
                                    transaction_count += 1
                                    print(f"DEBUG: Line match {transaction_count}: {date_str} | {amount} | {description[:50]}...")
                                    break  # Only take first valid amount per line
                            
                except Exception as e:
                    print(f"DEBUG: Error parsing line {i}: {line[:100]}... | Error: {e}")
                    continue
        
        print(f"DEBUG: Text parsing completed. Found {len(transactions)} transactions")
        return transactions

    def validate_transactions(self, transactions: List[Dict]) -> Tuple[List[Dict], List[str]]:
        """Validate parsed transactions and return valid ones with errors"""
        valid_transactions = []
        errors = []
        
        required_fields = ['date', 'description', 'amount', 'transaction_type', 'category']
        
        for i, transaction in enumerate(transactions):
            transaction_errors = []
            
            # Check required fields
            for field in required_fields:
                if field not in transaction or not transaction[field]:
                    transaction_errors.append(f"Missing {field}")
            
            # Validate amount
            if 'amount' in transaction:
                try:
                    amount = float(transaction['amount'])
                    if amount <= 0:
                        transaction_errors.append("Amount must be positive")
                    transaction['amount'] = amount
                except (ValueError, TypeError):
                    transaction_errors.append("Invalid amount format")
            
            # Validate date
            if 'date' in transaction:
                try:
                    datetime.fromisoformat(transaction['date'].replace('Z', '+00:00'))
                except ValueError:
                    transaction_errors.append("Invalid date format")
            
            # Validate type
            if 'transaction_type' in transaction and transaction['transaction_type'] not in ['income', 'expense']:
                transaction_errors.append("Transaction type must be 'income' or 'expense'")
            
            if transaction_errors:
                errors.append(f"Transaction {i+1}: {', '.join(transaction_errors)}")
            else:
                valid_transactions.append(transaction)
        
        return valid_transactions, errors
    
    def _extract_hdfc_concatenated_transactions(self, row: List, table_idx: int, row_idx: int) -> List[Dict]:
        """Extract individual transactions from HDFC concatenated row data"""
        transactions = []
        
        try:
            print(f"DEBUG: Extracting concatenated HDFC transactions from row: {row}")
            
            # Expected columns: ['Date', 'Narration', 'Chq./Ref.No.', 'ValueDt', 'WithdrawalAmt.', 'DepositAmt.', 'ClosingBalance']
            # Typical structure has dates, descriptions, ref numbers, amounts, and balances concatenated with '\n'
            
            dates = []
            descriptions = []
            ref_numbers = []
            withdrawal_amounts = []
            deposit_amounts = []
            closing_balances = []
            
            # Split each column by newlines to get individual transaction data
            for col_idx, cell in enumerate(row):
                if cell is None:
                    continue
                    
                cell_parts = str(cell).split('\n')
                
                if col_idx == 0:  # Date column
                    # Filter out non-date entries
                    dates = [part.strip() for part in cell_parts if part.strip() and re.match(r'\d{2}/\d{2}/\d{2}', part.strip())]
                elif col_idx == 1:  # Narration/Description column
                    descriptions = [part.strip() for part in cell_parts if part.strip()]
                elif col_idx == 2:  # Ref number column
                    ref_numbers = [part.strip() for part in cell_parts if part.strip()]
                elif col_idx == 3:  # Value date column (similar to dates)
                    # Usually similar to dates, can skip for now
                    pass
                elif col_idx == 4:  # Withdrawal amounts
                    withdrawal_amounts = [part.strip() for part in cell_parts if part.strip() and re.match(r'[\d,]+\.?\d*', part.strip())]
                elif col_idx == 5:  # Deposit amounts
                    deposit_amounts = [part.strip() for part in cell_parts if part.strip() and re.match(r'[\d,]+\.?\d*', part.strip())]
                elif col_idx == 6:  # Closing balances
                    closing_balances = [part.strip() for part in cell_parts if part.strip() and re.match(r'[\d,]+\.?\d*', part.strip())]
            
            print(f"DEBUG: Split data - Dates: {len(dates)}, Descriptions: {len(descriptions)}, Withdrawals: {len(withdrawal_amounts)}, Deposits: {len(deposit_amounts)}")
            print(f"DEBUG: Dates: {dates}")
            print(f"DEBUG: Descriptions: {descriptions[:3]}...")  # Show first 3
            print(f"DEBUG: Withdrawals: {withdrawal_amounts}")
            print(f"DEBUG: Deposits: {deposit_amounts}")
            
            # Match transactions based on the data we have
            # Strategy: Use dates as the primary key, then match descriptions and amounts
            
            num_transactions = max(len(dates), len(withdrawal_amounts), len(deposit_amounts))
            
            for i in range(num_transactions):
                try:
                    # Get date (cycle through available dates if fewer)
                    date_str = dates[i % len(dates)] if dates else None
                    if not date_str:
                        continue
                    
                    # Convert DD/MM/YY to DD/MM/YYYY
                    if len(date_str.split('/')[2]) == 2:
                        parts = date_str.split('/')
                        year = '20' + parts[2]  # Assume 2000s
                        date_str = f"{parts[0]}/{parts[1]}/{year}"
                    
                    # Get description
                    description = ""
                    if i < len(descriptions):
                        description = descriptions[i]
                    elif descriptions:
                        # Try to find a reasonable description
                        desc_idx = i % len(descriptions)
                        description = descriptions[desc_idx]
                    
                    # Clean up description
                    if description:
                        # Remove common patterns
                        description = re.sub(r'^(UPI-|NEFT-|IMPS-)', '', description)
                        description = re.sub(r'-\d+$', '', description)  # Remove trailing numbers
                        description = description.strip()
                    
                    # Get amount (prefer withdrawal, then deposit)
                    amount = 0.0
                    transaction_type = "expense"
                    
                    if i < len(withdrawal_amounts) and withdrawal_amounts[i]:
                        amount = self._parse_amount(withdrawal_amounts[i])
                        transaction_type = "expense"
                    elif i < len(deposit_amounts) and deposit_amounts[i]:
                        amount = self._parse_amount(deposit_amounts[i])
                        transaction_type = "income"
                    
                    # Validate transaction
                    if amount > 0 and description and len(description) > 2:
                        transaction_date = self._parse_date(date_str)
                        if transaction_date:
                            transaction = {
                                'date': transaction_date.isoformat(),
                                'description': description,
                                'amount': amount,
                                'transaction_type': transaction_type,
                                'category': self._categorize_transaction(description),
                                'source': 'hdfc_pdf_table_concatenated',
                                'raw_data': {
                                    'table': table_idx, 
                                    'row': row_idx, 
                                    'transaction_index': i,
                                    'raw_date': dates[i % len(dates)] if dates else None,
                                    'raw_description': descriptions[i] if i < len(descriptions) else None,
                                    'raw_amount': withdrawal_amounts[i] if i < len(withdrawal_amounts) and withdrawal_amounts[i] else (deposit_amounts[i] if i < len(deposit_amounts) else None)
                                }
                            }
                            transactions.append(transaction)
                            print(f"DEBUG: Extracted concatenated transaction {i+1}: {date_str} | {amount} | {description[:50]}...")
                
                except Exception as e:
                    print(f"DEBUG: Error processing concatenated transaction {i}: {e}")
                    continue
            
            print(f"DEBUG: Successfully extracted {len(transactions)} transactions from concatenated row")
            
        except Exception as e:
            print(f"DEBUG: Error in _extract_hdfc_concatenated_transactions: {e}")
        
        return transactions
    
    def _extract_single_hdfc_transaction(self, row: List, table_idx: int, row_idx: int) -> Optional[Dict]:
        """Extract a single transaction from HDFC table row"""
        try:
            # Try to identify date, description, and amount columns
            date_str = None
            description = ""
            amount = 0.0
            transaction_type = "expense"
            
            # Look for date in first few columns
            for i, cell in enumerate(row[:3]):
                if cell and re.match(r'\d{2}/\d{2}/\d{2,4}', str(cell).strip()):
                    date_str = str(cell).strip()
                    # Convert DD/MM/YY to DD/MM/YYYY if needed
                    if len(date_str.split('/')[2]) == 2:
                        parts = date_str.split('/')
                        year = '20' + parts[2]  # Assume 2000s
                        date_str = f"{parts[0]}/{parts[1]}/{year}"
                    break
            
            if not date_str:
                return None
                
            # Description is usually in column 1 or 2
            if len(row) > 1 and row[1]:
                description = str(row[1]).strip()
            
            # Amount is usually in withdrawal or deposit columns (last few columns)
            # Check withdrawal amount first (typically column 4), then deposit (column 5)
            if len(row) > 4 and row[4] and str(row[4]).strip():
                try:
                    amount = self._parse_amount(str(row[4]).strip())
                    transaction_type = "expense"
                except:
                    pass
            
            if amount == 0 and len(row) > 5 and row[5] and str(row[5]).strip():
                try:
                    amount = self._parse_amount(str(row[5]).strip())
                    transaction_type = "income"
                except:
                    pass
            
            if amount > 0 and description:
                transaction_date = self._parse_date(date_str)
                if transaction_date:
                    transaction = {
                        'date': transaction_date.isoformat(),
                        'description': description,
                        'amount': amount,
                        'transaction_type': transaction_type,
                        'category': self._categorize_transaction(description),
                        'source': 'hdfc_pdf_table_single',
                        'raw_data': {'table': table_idx, 'row': row_idx, 'data': row}
                    }
                    print(f"DEBUG: Single transaction extracted: {date_str} | {amount} | {description[:50]}...")
                    return transaction
            
        except Exception as e:
            print(f"DEBUG: Error processing single HDFC transaction: {e}")
        
        return None
