// Debug script to test fetchSpendingSummary specifically
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, getDocs } = require('firebase/firestore');

// Firebase config (you'll need to update this with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
};

async function debugFetchSpendingSummary() {
  try {
    console.log('🔥 Initializing Firebase...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const userId = "ilk3jt72kzcJHiCGmThzume6EVx1";
    
    console.log('📊 Step 1: Fetching ALL transactions (like Transaction History)...');
    
    // Step 1: Get all transactions (like Transaction History does)
    let q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    let allTransactions = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allTransactions.push({
        id: doc.id,
        ...data,
        date: data.date?.toDate?.()?.toISOString() || data.date,
      });
    });
    
    console.log(`   ✅ Found ${allTransactions.length} total transactions`);
    const totalAll = allTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    console.log(`   💰 Total amount: $${totalAll.toFixed(2)}`);
    
    // Step 2: Apply month filter in memory (like our updated getTransactions should do)
    console.log('\n📊 Step 2: Applying month filter in memory...');
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    console.log(`   📅 Start of month: ${startOfMonth.toISOString()}`);
    
    const monthTransactions = allTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= startOfMonth;
    });
    
    console.log(`   ✅ Found ${monthTransactions.length} transactions this month`);
    const totalMonth = monthTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    console.log(`   💰 Total this month: $${totalMonth.toFixed(2)}`);
    
    // Step 3: Show recent transactions for debugging
    console.log('\n📝 Recent transactions:');
    monthTransactions.slice(0, 5).forEach((tx, i) => {
      console.log(`   ${i+1}. ${tx.description?.substring(0, 30) || 'No description'} | $${tx.amount?.toFixed(2) || '0.00'} | ${tx.date?.split('T')[0] || 'No date'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugFetchSpendingSummary();
