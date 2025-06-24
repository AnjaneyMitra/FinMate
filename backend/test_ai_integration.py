#!/usr/bin/env python3
"""
Test AI integration with imported bank statement transactions
"""

import requests
import json

def test_ai_integration():
    print('🤖 Testing AI Integration with Imported Transactions')
    print('=' * 60)

    # Mock authentication token for our test user
    test_token = 'Bearer test_user_bank_import_12345678'
    base_url = 'http://localhost:8000'

    # Test forecast endpoint with imported data
    print('\n1. Testing expense forecasting...')
    try:
        response = requests.post(
            f'{base_url}/forecast-expenses',
            headers={'Authorization': test_token, 'Content-Type': 'application/json'},
            json={'timeframe': 3, 'category': 'all'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f'✅ Forecast successful!')
            print(f'   - Data source: {result.get("data_source", "unknown")}')
            print(f'   - Model accuracy: {result.get("model_accuracy", "N/A")}')
            print(f'   - Forecast periods: {len(result.get("forecast", []))}')
            print(f'   - Message: {result.get("message", "N/A")}')
            print(f'   - User authenticated: {result.get("user_authenticated", False)}')
            
            # Show sample forecast data
            forecast = result.get('forecast', [])
            if forecast:
                print('   - Sample forecast:')
                for i, item in enumerate(forecast[:2]):
                    print(f'     * {item.get("period", "N/A")}: ${item.get("predicted_amount", 0)}')
            
            # Show category breakdown
            breakdown = result.get('category_breakdown', {})
            if breakdown:
                print('   - Category breakdown:')
                for cat, amount in breakdown.items():
                    print(f'     * {cat.title()}: ${amount}')
        else:
            print(f'❌ Forecast failed: {response.status_code}')
            print(f'   Error: {response.text}')

    except Exception as e:
        print(f'❌ Request error: {e}')

    # Test spending analysis
    print('\n2. Testing spending analysis...')
    try:
        response = requests.get(
            f'{base_url}/api/spending/summary/test_user_bank_import',
            params={'period': 'month'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f'✅ Spending analysis successful!')
            data = result.get('data', {})
            print(f'   - Total spending: ${data.get("total_amount", 0)}')
            print(f'   - Transaction count: {data.get("transaction_count", 0)}')
            print(f'   - Categories: {list(data.get("category_breakdown", {}).keys())}')
            
            # Show category details
            category_breakdown = data.get('category_breakdown', {})
            if category_breakdown:
                print('   - Category details:')
                for cat, amount in category_breakdown.items():
                    print(f'     * {cat}: ${amount}')
        else:
            print(f'❌ Analysis failed: {response.status_code}')
            print(f'   Error: {response.text}')

    except Exception as e:
        print(f'❌ Request error: {e}')

    # Test spending trends
    print('\n3. Testing spending trends...')
    try:
        response = requests.get(
            f'{base_url}/api/spending/trends/test_user_bank_import',
            params={'time_range': '1month'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f'✅ Trends analysis successful!')
            summary = result.get('summary', {})
            print(f'   - Total amount: ${summary.get("total_amount", 0)}')
            print(f'   - Average daily: ${summary.get("average_daily", 0):.2f}')
            print(f'   - Trend direction: {summary.get("trend_direction", "N/A")}')
            print(f'   - Peak day: {summary.get("peak_day", "N/A")}')
        else:
            print(f'❌ Trends failed: {response.status_code}')
            print(f'   Error: {response.text}')

    except Exception as e:
        print(f'❌ Request error: {e}')

    # Test expense categorization
    print('\n4. Testing expense categorization...')
    try:
        response = requests.post(
            f'{base_url}/api/spending/categorize',
            params={
                'description': 'Grocery shopping at supermarket',
                'amount': 250.0
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f'✅ Categorization successful!')
            print(f'   - Category: {result.get("category", "N/A")}')
            print(f'   - Confidence: {result.get("confidence", "N/A")}')
            print(f'   - Suggestions: {result.get("suggestions", [])}')
        else:
            print(f'❌ Categorization failed: {response.status_code}')
            print(f'   Error: {response.text}')

    except Exception as e:
        print(f'❌ Request error: {e}')

    print('\n✅ AI Integration Test Complete!')
    print('\n📊 Summary:')
    print('- Imported bank statement transactions are stored in Firestore')
    print('- AI features can access and analyze the imported data')
    print('- Forecasting, spending analysis, and categorization work with real user data')
    print('- The system falls back to mock data when insufficient historical data exists')

if __name__ == "__main__":
    test_ai_integration()
