#!/usr/bin/env python3
"""
Database migration script to add the category column to existing expense records.
This script will:
1. Add the category column if it doesn't exist
2. Categorize existing expenses using the expense classifier
3. Update all uncategorized expenses
"""

import sqlite3
import os
from expense_classifier import predict_expense_category

def migrate_database():
    db_path = 'finmate.db'
    
    if not os.path.exists(db_path):
        print("Database not found. Creating new database with updated schema.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if category column exists
        cursor.execute("PRAGMA table_info(expenses)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'category' not in columns:
            print("Adding category column to expenses table...")
            cursor.execute("ALTER TABLE expenses ADD COLUMN category VARCHAR(50) DEFAULT 'uncategorized'")
            conn.commit()
            print("Category column added successfully.")
        else:
            print("Category column already exists.")
        
        # Update existing expenses without categories
        cursor.execute("SELECT id, description FROM expenses WHERE category IS NULL OR category = '' OR category = 'uncategorized'")
        uncategorized_expenses = cursor.fetchall()
        
        if uncategorized_expenses:
            print(f"Found {len(uncategorized_expenses)} expenses to categorize...")
            
            for expense_id, description in uncategorized_expenses:
                if description:
                    try:
                        # Use the expense classifier to predict category
                        predicted_category = predict_expense_category(description)
                        cursor.execute("UPDATE expenses SET category = ? WHERE id = ?", (predicted_category, expense_id))
                        print(f"Categorized expense {expense_id}: '{description}' -> '{predicted_category}'")
                    except Exception as e:
                        print(f"Error categorizing expense {expense_id}: {e}")
                        cursor.execute("UPDATE expenses SET category = ? WHERE id = ?", ('uncategorized', expense_id))
                else:
                    # Set to uncategorized if no description
                    cursor.execute("UPDATE expenses SET category = ? WHERE id = ?", ('uncategorized', expense_id))
            
            conn.commit()
            print("All expenses have been categorized.")
        else:
            print("All expenses already have categories.")
    
    except Exception as e:
        print(f"Migration error: {e}")
        conn.rollback()
    finally:
        conn.close()
        print("Migration completed.")

def add_sample_expenses():
    """Add some sample expenses for testing if the database is empty"""
    conn = sqlite3.connect('finmate.db')
    cursor = conn.cursor()
    
    try:
        # Check if we have any expenses
        cursor.execute("SELECT COUNT(*) FROM expenses")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("Adding sample expenses for testing...")
            
            sample_expenses = [
                (1250.00, "Grocery shopping at BigBazar", "food", "2025-05-15 10:30:00", 1),
                (850.00, "Uber ride to office", "transportation", "2025-05-16 09:15:00", 1),
                (2500.00, "Movie tickets and popcorn", "entertainment", "2025-05-17 19:00:00", 1),
                (15000.00, "Electricity bill payment", "bills", "2025-05-18 14:20:00", 1),
                (3200.00, "Dinner at restaurant", "food", "2025-05-19 20:30:00", 1),
                (1800.00, "Medical checkup", "healthcare", "2025-05-20 11:00:00", 1),
                (4500.00, "Online shopping - clothes", "shopping", "2025-05-21 16:45:00", 1),
                (800.00, "Coffee and snacks", "food", "2025-05-22 08:30:00", 1),
                (1200.00, "Bus ticket booking", "transportation", "2025-05-23 12:00:00", 1),
                (2800.00, "Gym membership", "healthcare", "2025-05-24 10:15:00", 1),
                # June 2025 expenses
                (1400.00, "Breakfast at cafe", "food", "2025-06-01 09:00:00", 1),
                (950.00, "Auto rickshaw", "transportation", "2025-06-02 18:30:00", 1),
                (3500.00, "Shopping mall purchases", "shopping", "2025-06-03 15:20:00", 1),
                (12000.00, "Internet bill", "bills", "2025-06-04 11:45:00", 1),
                (2200.00, "Lunch with friends", "food", "2025-06-05 13:30:00", 1),
                (1600.00, "Pharmacy medicines", "healthcare", "2025-06-06 10:00:00", 1),
                (5200.00, "Electronics purchase", "shopping", "2025-06-07 17:15:00", 1),
                (750.00, "Street food", "food", "2025-06-08 19:45:00", 1),
                (1100.00, "Metro card recharge", "transportation", "2025-06-09 08:00:00", 1),
                (2900.00, "Concert tickets", "entertainment", "2025-06-10 14:30:00", 1),
            ]
            
            for amount, description, category, timestamp, user_id in sample_expenses:
                cursor.execute(
                    "INSERT INTO expenses (amount, description, category, timestamp, user_id) VALUES (?, ?, ?, ?, ?)",
                    (amount, description, category, timestamp, user_id)
                )
            
            conn.commit()
            print(f"Added {len(sample_expenses)} sample expenses.")
        else:
            print(f"Database already has {count} expenses.")
    
    except Exception as e:
        print(f"Error adding sample expenses: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting database migration...")
    migrate_database()
    add_sample_expenses()
    print("Migration completed successfully!")
