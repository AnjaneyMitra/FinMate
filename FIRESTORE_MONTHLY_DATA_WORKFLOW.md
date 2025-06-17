# Firestore Monthly Data Storage Workflow

## Overview
This workflow sets up Firestore database rules and data structure for storing and retrieving monthly categorized transaction data for the FinMate application.

## 1. Firestore Database Structure

### Collections Structure:
```
users/{userId}/
├── profile/
│   ├── email
│   ├── displayName
│   ├── createdAt
│   └── lastActive
├── transactions/{transactionId}/
│   ├── amount (number)
│   ├── description (string)
│   ├── category (string)
│   ├── date (timestamp)
│   ├── type (string: "income" | "expense")
│   ├── createdAt (timestamp)
│   └── month (string: "YYYY-MM")
├── monthlyData/{monthKey}/  # monthKey format: "YYYY-MM"
│   ├── totalIncome (number)
│   ├── totalExpenses (number)
│   ├── categoryBreakdown (map)
│   ├── transactionCount (number)
│   └── lastUpdated (timestamp)
└── settings/
    ├── budget (number)
    ├── categories (array)
    └── preferences (map)
```

## 2. Firestore Security Rules

### Purpose:
- Ensure users can only access their own data
- Allow authenticated users to read/write their transactions
- Enable monthly data aggregation
- Prevent unauthorized access

### Rules Structure:
- User authentication required for all operations
- Users can only access their own data paths
- Proper validation for data types and required fields

## 3. Implementation Steps

### Step 1: Create Firestore Security Rules
### Step 2: Update FirestoreService for Monthly Data
### Step 3: Create Data Migration Service
### Step 4: Test Data Structure

## 4. Monthly Data Aggregation

### Automatic Aggregation:
- Trigger on transaction creation/update/deletion
- Update monthly summaries in real-time
- Maintain category breakdowns

### Benefits:
- Fast monthly comparisons
- Efficient querying
- Pre-calculated statistics
