#!/usr/bin/env python3

from firestore_service import FirestoreService
import asyncio

async def check_transactions():
    service = FirestoreService()
    user_id = 'ilk3jt72kzcJHiCGmThzume6EVx1'
    print(f'Checking transactions for user: {user_id}')
    
    try:
        transactions = await service.get_transactions_by_user_id(user_id, limit=5)
        print(f'Found {len(transactions)} transactions')
        
        if transactions:
            for i, transaction in enumerate(transactions, 1):
                print(f'{i}. {transaction.get("description", "No description")} - ${transaction.get("amount", 0)} - {transaction.get("date", "No date")}')
        else:
            print('No transactions found for this user')
            
    except Exception as e:
        print(f'Error fetching transactions: {e}')

if __name__ == "__main__":
    asyncio.run(check_transactions())
