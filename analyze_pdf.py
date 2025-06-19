#!/usr/bin/env python3
"""
Script to analyze the HDFC bank statement PDF structure
"""

import pdfplumber
import sys
import json

def analyze_pdf(pdf_path):
    """Analyze PDF structure and content"""
    
    print(f"📄 Analyzing PDF: {pdf_path}")
    print("=" * 60)
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"📊 Total pages: {len(pdf.pages)}")
            print()
            
            for page_num, page in enumerate(pdf.pages):
                print(f"📄 PAGE {page_num + 1}")
                print("-" * 30)
                
                # Extract text
                text = page.extract_text()
                if text:
                    lines = text.split('\n')
                    print(f"📝 Text lines: {len(lines)}")
                    
                    # Show first 20 lines for structure analysis
                    print("\n🔍 FIRST 20 LINES:")
                    for i, line in enumerate(lines[:20]):
                        print(f"{i+1:2d}: {line}")
                    
                    print(f"\n🔍 LINES WITH DATES (DD/MM/YYYY pattern):")
                    import re
                    date_pattern = r'\d{2}/\d{2}/\d{4}'
                    for i, line in enumerate(lines):
                        if re.search(date_pattern, line):
                            print(f"{i+1:3d}: {line}")
                    
                    print(f"\n🔍 LINES WITH AMOUNTS (number patterns):")
                    amount_pattern = r'\d{1,3}(?:,\d{3})*(?:\.\d{2})?'
                    for i, line in enumerate(lines):
                        amounts = re.findall(amount_pattern, line)
                        if amounts and any(float(amt.replace(',', '')) > 10 for amt in amounts):
                            print(f"{i+1:3d}: {line}")
                            print(f"     Amounts found: {amounts}")
                
                # Extract tables
                tables = page.extract_tables()
                if tables:
                    print(f"\n📊 Tables found: {len(tables)}")
                    
                    for table_idx, table in enumerate(tables):
                        print(f"\n📋 TABLE {table_idx + 1}:")
                        print(f"   Rows: {len(table)}")
                        if table:
                            print(f"   Columns: {len(table[0]) if table[0] else 0}")
                            
                            # Show first few rows
                            print("   SAMPLE ROWS:")
                            for row_idx, row in enumerate(table[:5]):
                                print(f"   Row {row_idx + 1}: {row}")
                
                print("\n" + "=" * 60)
    
    except Exception as e:
        print(f"❌ Error analyzing PDF: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    pdf_path = "/Applications/Vscode/FinMate/frontend/public/Acct Statement_XX5015_18062025.pdf"
    analyze_pdf(pdf_path)
