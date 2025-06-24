#!/bin/bash

# Deploy Firestore indexes script
echo "🔥 Deploying Firestore indexes..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase login --reauth

# Set the project
echo "📡 Setting Firebase project to finmate-aad4a..."
firebase use finmate-aad4a

# Deploy indexes
echo "📚 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

# Deploy rules as well
echo "🔒 Deploying Firestore rules..."
firebase deploy --only firestore:rules

echo "✅ Firestore deployment complete!"
echo ""
echo "🔍 You can view your indexes at:"
echo "https://console.firebase.google.com/project/finmate-aad4a/firestore/indexes"
echo ""
echo "📋 Note: Index creation may take a few minutes to complete."
