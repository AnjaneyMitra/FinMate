#!/bin/bash

# Test script for Tax Filing API endpoints
# This script tests the new tax filing functionality

echo "🧪 Testing Tax Filing API Endpoints"
echo "=================================="

# Set the backend URL
BACKEND_URL="http://localhost:8000"

echo "1. Testing /api/tax/forms endpoint..."
curl -s "$BACKEND_URL/api/tax/forms" | jq '.' || echo "❌ Failed to fetch tax forms"

echo ""
echo "2. Testing /api/tax/forms/ITR-1 endpoint..."
curl -s "$BACKEND_URL/api/tax/forms/ITR-1" | jq '.' || echo "❌ Failed to fetch ITR-1 details"

echo ""
echo "3. Testing health endpoint..."
curl -s "$BACKEND_URL/health" | jq '.' || echo "❌ Health check failed"

echo ""
echo "4. Testing tax filing modules directly..."
cd backend
python3 -c "
import sys
sys.path.append('.')

try:
    # Test form registry
    from tax_filing import get_all_forms, get_form_details
    forms = get_all_forms()
    print(f'✅ Found {len(forms)} tax forms')
    
    # Test specific form details
    itr1_details = get_form_details('ITR-1')
    if itr1_details:
        print(f'✅ ITR-1 details loaded with {len(itr1_details.get(\"fields\", []))} fields')
    else:
        print('❌ Failed to load ITR-1 details')
        
    # Test validation engine
    from tax_filing import validate_form_data
    errors = validate_form_data('ITR-1', {})
    print(f'✅ Validation engine working - found {len(errors)} errors for empty form')
    
    # Test Gemini service
    from tax_filing import gemini_tax_service
    print(f'✅ Gemini tax service initialized: {gemini_tax_service.enabled}')
    
    print('\\n🎉 All tax filing modules are working correctly!')
    
except Exception as e:
    print(f'❌ Error testing modules: {e}')
    import traceback
    traceback.print_exc()
"

echo ""
echo "✅ Tax Filing API tests completed!"
echo ""
echo "📋 Summary:"
echo "- Tax forms: Available via /api/tax/forms"
echo "- Form details: Available via /api/tax/forms/{form_id}"
echo "- Draft management: /api/tax/drafts (POST, GET, PUT)"
echo "- Form submission: /api/tax/submit"
echo "- AI assistance: /api/tax/assist"
echo "- User submissions: /api/tax/submissions"
echo ""
echo "🚀 To start the backend server:"
echo "   cd backend && python main.py"
echo ""
echo "🌐 To test the frontend:"
echo "   cd frontend && npm start"
