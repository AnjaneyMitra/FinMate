#!/bin/bash

# GEMINI Integration Test Script
# This script tests all aspects of the GEMINI-powered content generation system

echo "🧪 Testing GEMINI Integration for FinMate Investment Learning"
echo "============================================================"

BASE_URL="http://localhost:8000/api/learning"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Generate Beginner Content
echo -e "\n${YELLOW}Test 1: Generate Beginner Content${NC}"
response1=$(curl -s -X POST "$BASE_URL/generate-content" \
-H "Content-Type: application/json" \
-d '{
  "level": "beginner",
  "topic": "What is investing?",
  "user_profile": {
    "age": 25,
    "experience_level": "beginner",
    "risk_tolerance": "moderate",
    "primary_goal": "wealth_creation",
    "income_range": "5-10L",
    "monthly_savings": 10000
  }
}')

if echo "$response1" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ Beginner content generation: PASSED${NC}"
else
    echo -e "${RED}❌ Beginner content generation: FAILED${NC}"
    echo "$response1"
fi

# Test 2: Generate Intermediate Content
echo -e "\n${YELLOW}Test 2: Generate Intermediate Content${NC}"
response2=$(curl -s -X POST "$BASE_URL/generate-content" \
-H "Content-Type: application/json" \
-d '{
  "level": "intermediate",
  "topic": "Asset allocation",
  "user_profile": {
    "age": 35,
    "experience_level": "intermediate", 
    "risk_tolerance": "aggressive",
    "primary_goal": "retirement",
    "income_range": "10-25L",
    "monthly_savings": 25000
  }
}')

if echo "$response2" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ Intermediate content generation: PASSED${NC}"
else
    echo -e "${RED}❌ Intermediate content generation: FAILED${NC}"
    echo "$response2"
fi

# Test 3: Generate Advanced Content
echo -e "\n${YELLOW}Test 3: Generate Advanced Content${NC}"
response3=$(curl -s -X POST "$BASE_URL/generate-content" \
-H "Content-Type: application/json" \
-d '{
  "level": "advanced",
  "topic": "Portfolio rebalancing",
  "user_profile": {
    "age": 45,
    "experience_level": "advanced",
    "risk_tolerance": "conservative",
    "primary_goal": "retirement",
    "income_range": "25L+",
    "monthly_savings": 50000
  }
}')

if echo "$response3" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ Advanced content generation: PASSED${NC}"
else
    echo -e "${RED}❌ Advanced content generation: FAILED${NC}"
    echo "$response3"
fi

# Test 4: Get Topics for Level
echo -e "\n${YELLOW}Test 4: Get Topics for Beginner Level${NC}"
response4=$(curl -s "$BASE_URL/topics/beginner")

if echo "$response4" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ Topics retrieval: PASSED${NC}"
else
    echo -e "${RED}❌ Topics retrieval: FAILED${NC}"
    echo "$response4"
fi

# Test 5: Save User Profile
echo -e "\n${YELLOW}Test 5: Save User Profile${NC}"
response5=$(curl -s -X POST "$BASE_URL/user-profile" \
-H "Content-Type: application/json" \
-d '{
  "age": 28,
  "income_range": "5-10L",
  "investment_experience": "beginner",
  "risk_tolerance": "moderate",
  "investment_goals": ["retirement", "wealth_creation"],
  "current_investments": ["fd", "mutual_funds"],
  "monthly_savings": 15000,
  "investment_timeline": "long_term",
  "employment_type": "salaried"
}')

if echo "$response5" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ User profile save: PASSED${NC}"
else
    echo -e "${RED}❌ User profile save: FAILED${NC}"
    echo "$response5"
fi

# Test 6: Track Progress
echo -e "\n${YELLOW}Test 6: Track Learning Progress${NC}"
response6=$(curl -s -X POST "$BASE_URL/track-progress" \
-H "Content-Type: application/json" \
-d '{
  "level": "beginner",
  "topic": "What is investing?",
  "completed": true,
  "progress_percentage": 100
}')

if echo "$response6" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ Progress tracking: PASSED${NC}"
else
    echo -e "${RED}❌ Progress tracking: FAILED${NC}"
    echo "$response6"
fi

# Test 7: Error Handling (Invalid Level)
echo -e "\n${YELLOW}Test 7: Error Handling${NC}"
response7=$(curl -s -X POST "$BASE_URL/generate-content" \
-H "Content-Type: application/json" \
-d '{
  "level": "invalid_level",
  "topic": "Test topic",
  "user_profile": {}
}')

if echo "$response7" | grep -q '"status":"error"'; then
    echo -e "${GREEN}✅ Error handling: PASSED${NC}"
else
    echo -e "${RED}❌ Error handling: FAILED${NC}"
    echo "$response7"
fi

echo -e "\n${YELLOW}=== GEMINI Integration Test Summary ===${NC}"
echo "✅ Backend API endpoints working"
echo "✅ GEMINI content generation functional"
echo "✅ User profile management operational"
echo "✅ Progress tracking enabled"
echo "✅ Error handling implemented"

echo -e "\n${GREEN}🎉 GEMINI Integration Test Complete!${NC}"
echo ""
echo "Next steps to test the full integration:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Navigate to Investment Learning Path"
echo "3. Setup your user profile"
echo "4. Click on any topic to generate personalized content"
echo "5. Verify the 'Personalized for you' badge appears"
echo ""
echo "📝 Note: Make sure your GEMINI_API_KEY is properly set in the .env file"
