// Test script to compare different transaction fetching methods
import { FirebaseDataService } from './services/FirebaseDataService';

const dataService = new FirebaseDataService();

async function testTransactionFetching() {
  console.log('🧪 Testing Transaction Fetching Methods...\n');
  
  try {
    // Test 1: Transaction History approach (no filters)
    console.log('1️⃣ Testing Transaction History approach (no filters):');
    const allTransactions = await dataService.getTransactions();
    console.log(`   ✅ Found ${allTransactions.length} transactions`);
    const totalAmount1 = allTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    console.log(`   💰 Total amount: $${totalAmount1.toFixed(2)}\n`);
    
    // Test 2: Dashboard approach (with month filter)
    console.log('2️⃣ Testing Dashboard approach (fetchSpendingSummary for month):');
    const summary = await dataService.fetchSpendingSummary('month');
    console.log(`   ✅ Found ${summary.transaction_count} transactions`);
    console.log(`   💰 Total spent: $${summary.total_spent.toFixed(2)}\n`);
    
    // Test 3: Manual date filtering (like Dashboard but explicit)
    console.log('3️⃣ Testing Manual date filtering:');
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthTransactions = await dataService.getTransactions({
      startDate: startOfMonth
    });
    console.log(`   ✅ Found ${monthTransactions.length} transactions since ${startOfMonth.split('T')[0]}`);
    const totalAmount3 = monthTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    console.log(`   💰 Total amount: $${totalAmount3.toFixed(2)}\n`);
    
    // Analysis
    console.log('📊 ANALYSIS:');
    console.log(`   All transactions: ${allTransactions.length} ($${totalAmount1.toFixed(2)})`);
    console.log(`   Dashboard summary: ${summary.transaction_count} ($${summary.total_spent.toFixed(2)})`);
    console.log(`   Manual filtering: ${monthTransactions.length} ($${totalAmount3.toFixed(2)})`);
    
    if (allTransactions.length > summary.transaction_count) {
      console.log('\n❌ ISSUE CONFIRMED: Dashboard is missing transactions!');
      console.log(`   Missing: ${allTransactions.length - summary.transaction_count} transactions`);
      console.log(`   Missing amount: $${(totalAmount1 - summary.total_spent).toFixed(2)}`);
    } else {
      console.log('\n✅ No issues found - all methods return same data');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Run the test
testTransactionFetching();
