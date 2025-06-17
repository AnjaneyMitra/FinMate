#!/bin/bash

# FinMate Firebase Setup and Configuration Script
# This script helps set up Firebase credentials and deploy Firestore infrastructure

echo "🚀 FinMate Firebase Configuration Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        print_warning "Firebase CLI is not installed."
        echo "Installing Firebase CLI..."
        npm install -g firebase-tools
        if [ $? -ne 0 ]; then
            print_error "Failed to install Firebase CLI"
            exit 1
        fi
    fi
    
    print_status "Prerequisites check complete"
}

# Setup Firebase credentials
setup_firebase_credentials() {
    print_info "Setting up Firebase credentials..."
    
    # Check if user is logged in
    if ! firebase projects:list &> /dev/null; then
        print_warning "Not logged in to Firebase"
        echo "Please log in to Firebase:"
        firebase login
        if [ $? -ne 0 ]; then
            print_error "Firebase login failed"
            exit 1
        fi
    fi
    
    # List available projects
    echo ""
    print_info "Available Firebase projects:"
    firebase projects:list
    
    echo ""
    read -p "Enter your Firebase Project ID: " PROJECT_ID
    
    if [ -z "$PROJECT_ID" ]; then
        print_error "Project ID cannot be empty"
        exit 1
    fi
    
    # Initialize Firebase in the project (if not already done)
    if [ ! -f ".firebaserc" ]; then
        print_info "Initializing Firebase project..."
        firebase use "$PROJECT_ID"
    fi
    
    print_status "Firebase credentials configured"
}

# Setup environment files
setup_environment_files() {
    print_info "Setting up environment configuration..."
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        print_info "Creating frontend environment file..."
        
        echo "Please enter your Firebase configuration values:"
        echo "(You can find these in Firebase Console > Project Settings > General > Your apps)"
        echo ""
        
        read -p "API Key: " API_KEY
        read -p "Auth Domain (${PROJECT_ID}.firebaseapp.com): " AUTH_DOMAIN
        AUTH_DOMAIN=${AUTH_DOMAIN:-"${PROJECT_ID}.firebaseapp.com"}
        read -p "Storage Bucket (${PROJECT_ID}.appspot.com): " STORAGE_BUCKET
        STORAGE_BUCKET=${STORAGE_BUCKET:-"${PROJECT_ID}.appspot.com"}
        read -p "Messaging Sender ID: " MESSAGING_SENDER_ID
        read -p "App ID: " APP_ID
        read -p "Measurement ID (optional): " MEASUREMENT_ID
        
        cat > frontend/.env << EOF
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=${API_KEY}
REACT_APP_FIREBASE_AUTH_DOMAIN=${AUTH_DOMAIN}
REACT_APP_FIREBASE_PROJECT_ID=${PROJECT_ID}
REACT_APP_FIREBASE_STORAGE_BUCKET=${STORAGE_BUCKET}
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${MESSAGING_SENDER_ID}
REACT_APP_FIREBASE_APP_ID=${APP_ID}
REACT_APP_FIREBASE_MEASUREMENT_ID=${MEASUREMENT_ID}

# Backend API URL
REACT_APP_API_URL=http://localhost:8000
EOF
        
        print_status "Frontend environment file created"
    else
        print_warning "Frontend .env file already exists"
    fi
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        print_info "Creating backend environment file..."
        
        echo ""
        echo "For the backend, you'll need a Firebase service account key."
        echo "1. Go to Firebase Console > Project Settings > Service Accounts"
        echo "2. Click 'Generate new private key'"
        echo "3. Save the JSON file to backend/service-account-key.json"
        echo ""
        read -p "Press Enter when you've downloaded the service account key..."
        
        cat > backend/.env << EOF
# Firebase Service Account
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
FIREBASE_PROJECT_ID=${PROJECT_ID}

# Development settings
DEBUG=true
ENVIRONMENT=development

# API Configuration
API_HOST=localhost
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Database
DATABASE_URL=sqlite:///./finmate.db

# Security
JWT_SECRET_KEY=your-secret-key-here-$(date +%s)
EOF
        
        print_status "Backend environment file created"
    else
        print_warning "Backend .env file already exists"
    fi
}

# Deploy Firestore rules and indexes
deploy_firestore() {
    print_info "Deploying Firestore rules and indexes..."
    
    # Deploy Firestore rules
    firebase deploy --only firestore:rules
    if [ $? -eq 0 ]; then
        print_status "Firestore security rules deployed"
    else
        print_error "Failed to deploy Firestore rules"
        exit 1
    fi
    
    # Deploy Firestore indexes
    firebase deploy --only firestore:indexes
    if [ $? -eq 0 ]; then
        print_status "Firestore indexes deployed"
    else
        print_warning "Firestore indexes deployment failed (this is sometimes expected)"
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing project dependencies..."
    
    # Backend dependencies
    if [ -f "backend/requirements.txt" ]; then
        print_info "Installing Python dependencies..."
        cd backend
        
        # Check if virtual environment exists
        if [ ! -d "venv" ]; then
            print_info "Creating Python virtual environment..."
            python3 -m venv venv
        fi
        
        source venv/bin/activate
        pip install -r requirements.txt
        cd ..
        print_status "Python dependencies installed"
    fi
    
    # Frontend dependencies
    if [ -f "frontend/package.json" ]; then
        print_info "Installing Node.js dependencies..."
        cd frontend
        npm install
        cd ..
        print_status "Node.js dependencies installed"
    fi
}

# Test Firebase connection
test_firebase_connection() {
    print_info "Testing Firebase connection..."
    
    # Test Firestore rules
    firebase firestore:rules get &> /dev/null
    if [ $? -eq 0 ]; then
        print_status "Firestore connection successful"
    else
        print_error "Firestore connection failed"
    fi
}

# Main execution
main() {
    echo ""
    print_info "Starting FinMate Firebase setup..."
    echo ""
    
    check_prerequisites
    setup_firebase_credentials
    setup_environment_files
    deploy_firestore
    install_dependencies
    test_firebase_connection
    
    echo ""
    echo "🎉 Firebase setup complete!"
    echo ""
    print_info "Next steps:"
    echo "1. Start the backend: cd backend && source venv/bin/activate && python main.py"
    echo "2. Start the frontend: cd frontend && npm start"
    echo "3. Open http://localhost:3000 in your browser"
    echo ""
    print_info "To verify Firestore data storage:"
    echo "1. Create a test transaction in the app"
    echo "2. Check Firebase Console > Firestore Database"
    echo "3. Look for data in users/{userId}/transactions/"
    echo ""
}

# Run the main function
main
