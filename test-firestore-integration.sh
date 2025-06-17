#!/bin/bash

# FinMate Firestore Integration End-to-End Testing Script
# This script tests the complete Firestore workflow from setup to AI features

echo "🚀 FinMate Firestore Integration E2E Testing"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# Configuration
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"
PROJECT_ROOT="/Applications/Vscode/FinMate"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to increment test counters
test_passed() {
    ((TOTAL_TESTS++))
    ((PASSED_TESTS++))
    print_status "$1"
}

test_failed() {
    ((TOTAL_TESTS++))
    ((FAILED_TESTS++))
    print_error "$1"
}

# Function to check if a process is running on a port
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_step "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_status "$service_name is ready"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    print_error "$service_name failed to start within timeout"
    return 1
}

# Step 1: Environment Check
check_environment() {
    print_step "Step 1: Checking environment setup"
    
    # Check if we're in the right directory
    if [ ! -d "$PROJECT_ROOT" ]; then
        test_failed "Project directory not found: $PROJECT_ROOT"
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
    
    # Check for required files
    if [ -f "backend/.env" ]; then
        test_passed "Backend environment file exists"
    else
        test_failed "Backend .env file not found"
    fi
    
    if [ -f "frontend/.env" ]; then
        test_passed "Frontend environment file exists"
    else
        test_failed "Frontend .env file not found"
    fi
    
    if [ -f "firestore.rules" ]; then
        test_passed "Firestore rules file exists"
    else
        test_failed "Firestore rules file not found"
    fi
    
    # Check Firebase CLI
    if command -v firebase &> /dev/null; then
        test_passed "Firebase CLI is installed"
    else
        test_failed "Firebase CLI not found"
    fi
}

# Step 2: Backend Dependencies
check_backend_dependencies() {
    print_step "Step 2: Checking backend dependencies"
    
    cd "$PROJECT_ROOT/backend"
    
    # Check if virtual environment exists
    if [ -d "venv" ]; then
        print_status "Virtual environment found"
        source venv/bin/activate
    else
        print_warning "Creating virtual environment..."
        python3 -m venv venv
        source venv/bin/activate
    fi
    
    # Install requirements
    print_info "Installing Python dependencies..."
    pip install -r requirements.txt > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        test_passed "Python dependencies installed"
    else
        test_failed "Failed to install Python dependencies"
    fi
}

# Step 3: Frontend Dependencies
check_frontend_dependencies() {
    print_step "Step 3: Checking frontend dependencies"
    
    cd "$PROJECT_ROOT/frontend"
    
    if [ -d "node_modules" ]; then
        test_passed "Node modules found"
    else
        print_info "Installing Node.js dependencies..."
        npm install > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            test_passed "Node.js dependencies installed"
        else
            test_failed "Failed to install Node.js dependencies"
        fi
    fi
}

# Step 4: Test Firestore Connection
test_firestore_connection() {
    print_step "Step 4: Testing Firestore connection"
    
    cd "$PROJECT_ROOT/backend"
    source venv/bin/activate
    
    # Run the Firestore test script
    python test_firestore.py > firestore_test_output.log 2>&1
    
    if grep -q "All tests passed" firestore_test_output.log; then
        test_passed "Firestore connection tests passed"
    else
        test_failed "Firestore connection tests failed"
        print_info "Check firestore_test_output.log for details"
    fi
}

# Step 5: Start Backend Server
start_backend() {
    print_step "Step 5: Starting backend server"
    
    cd "$PROJECT_ROOT/backend"
    source venv/bin/activate
    
    # Check if backend is already running
    if check_port 8000; then
        print_status "Backend server already running"
        return 0
    fi
    
    # Start backend in background
    print_info "Starting backend server..."
    nohup python main.py > backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to be ready
    if wait_for_service "$BACKEND_URL/health" "Backend server"; then
        test_passed "Backend server started successfully"
        echo $BACKEND_PID > backend.pid
        return 0
    else
        test_failed "Backend server failed to start"
        return 1
    fi
}

# Step 6: Start Frontend Server
start_frontend() {
    print_step "Step 6: Starting frontend server"
    
    cd "$PROJECT_ROOT/frontend"
    
    # Check if frontend is already running
    if check_port 3000; then
        print_status "Frontend server already running"
        return 0
    fi
    
    # Start frontend in background
    print_info "Starting frontend server..."
    nohup npm start > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    if wait_for_service "$FRONTEND_URL" "Frontend server"; then
        test_passed "Frontend server started successfully"
        echo $FRONTEND_PID > frontend.pid
        return 0
    else
        test_failed "Frontend server failed to start"
        return 1
    fi
}

# Step 7: Test API Endpoints
test_api_endpoints() {
    print_step "Step 7: Testing API endpoints"
    
    # Test health endpoint
    if curl -s "$BACKEND_URL/health" | grep -q "healthy"; then
        test_passed "Health endpoint working"
    else
        test_failed "Health endpoint not responding"
    fi
    
    # Test forecast endpoint (without auth - should work with mock data)
    forecast_response=$(curl -s -X POST "$BACKEND_URL/forecast-expenses" \
        -H "Content-Type: application/json" \
        -d '{"timeframe": 3, "category": "all"}')
    
    if echo "$forecast_response" | grep -q "forecast"; then
        test_passed "Forecast endpoint working"
    else
        test_failed "Forecast endpoint not working"
    fi
    
    # Test comparison endpoint (without auth - should work with mock data)
    comparison_response=$(curl -s -X POST "$BACKEND_URL/compare-months-expenses" \
        -H "Content-Type: application/json" \
        -d '{"months": ["2025-05", "2025-06"]}')
    
    if echo "$comparison_response" | grep -q "comparison"; then
        test_passed "Comparison endpoint working"
    else
        test_failed "Comparison endpoint not working"
    fi
}

# Step 8: Test Frontend Integration
test_frontend_integration() {
    print_step "Step 8: Testing frontend integration"
    
    # Check if frontend is serving the app
    if curl -s "$FRONTEND_URL" | grep -q "FinMate"; then
        test_passed "Frontend serving FinMate app"
    else
        test_failed "Frontend not serving FinMate app"
    fi
    
    # Check if Firebase config is loaded
    if curl -s "$FRONTEND_URL/static/js/main"*.js | grep -q "firebase"; then
        test_passed "Firebase integration detected in frontend"
    else
        test_warning "Firebase integration not detected (this may be normal)"
    fi
}

# Step 9: Test Firestore Rules Deployment
test_firestore_rules() {
    print_step "Step 9: Testing Firestore rules deployment"
    
    cd "$PROJECT_ROOT"
    
    # Test if rules can be deployed (dry run)
    if firebase firestore:rules get > /dev/null 2>&1; then
        test_passed "Firestore rules accessible"
    else
        test_failed "Firestore rules not accessible"
        print_info "Run 'firebase deploy --only firestore:rules' to deploy rules"
    fi
}

# Step 10: Integration Test Summary
test_summary() {
    print_step "Step 10: Test Summary"
    
    echo ""
    echo "🧪 Test Results Summary"
    echo "======================="
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        print_status "All tests passed! 🎉"
        echo ""
        echo "🎯 Next Steps:"
        echo "1. Open $FRONTEND_URL in your browser"
        echo "2. Sign in or create an account"
        echo "3. Navigate to 'Firestore Test Panel' to test data operations"
        echo "4. Try 'AI Predictions' and 'Month Comparison' features"
        echo "5. Add some transactions and see real-time analytics"
        echo ""
        echo "📊 Monitoring:"
        echo "- Backend logs: $PROJECT_ROOT/backend/backend.log"
        echo "- Frontend logs: $PROJECT_ROOT/frontend/frontend.log"
        echo "- Firestore test: $PROJECT_ROOT/backend/firestore_test_output.log"
    else
        print_error "Some tests failed. Please check the logs and fix issues."
        echo ""
        echo "🔧 Troubleshooting:"
        echo "1. Check environment variables in .env files"
        echo "2. Ensure Firebase project is set up correctly"
        echo "3. Verify service account key is downloaded"
        echo "4. Deploy Firestore rules: firebase deploy --only firestore:rules"
        echo "5. Check server logs for detailed error messages"
    fi
}

# Cleanup function
cleanup() {
    print_step "Cleaning up..."
    
    cd "$PROJECT_ROOT"
    
    # Kill backend if we started it
    if [ -f "backend/backend.pid" ]; then
        BACKEND_PID=$(cat backend/backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            print_info "Stopping backend server (PID: $BACKEND_PID)"
            kill $BACKEND_PID
        fi
        rm -f backend/backend.pid
    fi
    
    # Kill frontend if we started it
    if [ -f "frontend/frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend/frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            print_info "Stopping frontend server (PID: $FRONTEND_PID)"
            kill $FRONTEND_PID
        fi
        rm -f frontend/frontend.pid
    fi
}

# Trap cleanup on script exit
trap cleanup EXIT

# Main execution
main() {
    echo ""
    print_info "Starting FinMate Firestore Integration E2E Testing..."
    echo ""
    
    check_environment
    check_backend_dependencies
    check_frontend_dependencies
    test_firestore_connection
    start_backend
    start_frontend
    test_api_endpoints
    test_frontend_integration
    test_firestore_rules
    test_summary
    
    echo ""
    print_info "Testing complete. Servers will continue running for manual testing."
    print_info "Press Ctrl+C to stop all services and exit."
    
    # Keep script running to maintain servers
    while true; do
        sleep 10
        
        # Check if servers are still running
        if ! check_port 8000; then
            print_warning "Backend server stopped unexpectedly"
            break
        fi
        
        if ! check_port 3000; then
            print_warning "Frontend server stopped unexpectedly"
            break
        fi
    done
}

# Handle command line arguments
case "${1:-}" in
    "--help"|"-h")
        echo "FinMate Firestore Integration E2E Testing Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --cleanup      Stop all services and clean up"
        echo "  --test-only    Run tests without starting servers"
        echo ""
        echo "This script tests the complete Firestore integration including:"
        echo "- Environment setup"
        echo "- Dependencies installation"
        echo "- Firestore connection"
        echo "- Backend and frontend servers"
        echo "- API endpoints"
        echo "- Integration components"
        exit 0
        ;;
    "--cleanup")
        cleanup
        exit 0
        ;;
    "--test-only")
        check_environment
        test_firestore_connection
        test_api_endpoints
        test_summary
        exit 0
        ;;
    *)
        main
        ;;
esac
