#!/bin/bash

# Firestore Setup and Deployment Script
# This script helps deploy Firestore rules and set up the database structure

echo "🔥 FinMate Firestore Setup Script"
echo "=================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "Please install it using: npm install -g firebase-tools"
    echo "Then run: firebase login"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ You are not logged in to Firebase."
    echo "Please run: firebase login"
    exit 1
fi

echo "✅ Firebase CLI is installed and you are logged in."

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "📋 Creating firebase.json configuration..."
    cat > firebase.json << EOF
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
EOF
    echo "✅ Created firebase.json"
fi

# Create firestore indexes file if it doesn't exist
if [ ! -f "firestore.indexes.json" ]; then
    echo "📋 Creating firestore.indexes.json..."
    cat > firestore.indexes.json << EOF
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "month",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "category",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "month",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF
    echo "✅ Created firestore.indexes.json"
fi

# Show current project
CURRENT_PROJECT=$(firebase use --json 2>/dev/null | jq -r '.result.current // "none"')
if [ "$CURRENT_PROJECT" != "none" ]; then
    echo "📋 Current Firebase project: $CURRENT_PROJECT"
else
    echo "❌ No Firebase project selected."
    echo "Please run: firebase use --add"
    echo "Or: firebase init"
    exit 1
fi

# Deploy Firestore rules
echo "🚀 Deploying Firestore security rules..."
if firebase deploy --only firestore:rules; then
    echo "✅ Firestore rules deployed successfully!"
else
    echo "❌ Failed to deploy Firestore rules."
    exit 1
fi

# Deploy Firestore indexes
echo "🚀 Deploying Firestore indexes..."
if firebase deploy --only firestore:indexes; then
    echo "✅ Firestore indexes deployed successfully!"
else
    echo "❌ Failed to deploy Firestore indexes."
    echo "Note: You can manually create indexes in the Firebase Console if needed."
fi

echo ""
echo "🎉 Firestore setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Set up Firebase service account credentials for your backend"
echo "2. Update your .env file with Firebase configuration"
echo "3. Test the connection using the migration script"
echo ""
echo "Environment variables needed in backend/.env:"
echo "GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json"
echo "FIREBASE_PROJECT_ID=your-project-id"
echo ""
echo "For more information, see: FIRESTORE_MONTHLY_DATA_WORKFLOW.md"
