// Sample data generator for FinMate application
// Run this in the browser console to add sample transactions

function addSampleTransactions(userId = 'sample-user') {
  const sampleTransactions = [
    {
      id: 'tx-' + Date.now() + '-1',
      amount: 850,
      description: 'Grocery shopping at Whole Foods',
      category: 'food',
      subcategory: 'Groceries',
      paymentMethod: 'credit_card',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: 'Whole Foods Market',
      notes: 'Weekly grocery run'
    },
    {
      id: 'tx-' + Date.now() + '-2',
      amount: 12000,
      description: 'Monthly rent payment',
      category: 'bills',
      subcategory: 'Rent/Mortgage',
      paymentMethod: 'bank_transfer',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: 'Property Management Co',
      notes: 'Monthly rent'
    },
    {
      id: 'tx-' + Date.now() + '-3',
      amount: 450,
      description: 'Gas station fill up',
      category: 'transport',
      subcategory: 'Fuel/Gas',
      paymentMethod: 'debit_card',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: 'Shell Gas Station',
      notes: 'Tank refill'
    },
    {
      id: 'tx-' + Date.now() + '-4',
      amount: 250,
      description: 'Coffee and pastry',
      category: 'food',
      subcategory: 'Cafe/Coffee',
      paymentMethod: 'credit_card',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: 'Starbucks',
      notes: 'Morning coffee'
    },
    {
      id: 'tx-' + Date.now() + '-5',
      amount: 890,
      description: 'Netflix and Spotify subscriptions',
      category: 'entertainment',
      subcategory: 'Streaming Services',
      paymentMethod: 'credit_card',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: 'Various Subscriptions',
      notes: 'Monthly subscriptions'
    },
    {
      id: 'tx-' + Date.now() + '-6',
      amount: 1500,
      description: 'New running shoes',
      category: 'shopping',
      subcategory: 'Clothing',
      paymentMethod: 'credit_card',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: 'Nike Store',
      notes: 'Running gear'
    },
    {
      id: 'tx-' + Date.now() + '-7',
      amount: 750,
      description: 'Doctor consultation',
      category: 'healthcare',
      subcategory: 'Doctor Visit',
      paymentMethod: 'cash',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: 'City Medical Center',
      notes: 'Regular checkup'
    },
    {
      id: 'tx-' + Date.now() + '-8',
      amount: 320,
      description: 'Movie tickets',
      category: 'entertainment',
      subcategory: 'Movies',
      paymentMethod: 'credit_card',
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: 'Cineplex Theater',
      notes: 'Weekend entertainment'
    },
    {
      id: 'tx-' + Date.now() + '-9',
      amount: 2100,
      description: 'Electricity bill',
      category: 'bills',
      subcategory: 'Electricity',
      paymentMethod: 'online_banking',
      date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: 'State Electricity Board',
      notes: 'Monthly utility bill'
    },
    {
      id: 'tx-' + Date.now() + '-10',
      amount: 180,
      description: 'Uber ride to airport',
      category: 'transport',
      subcategory: 'Taxi/Ride Share',
      paymentMethod: 'digital_wallet',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: 'Uber',
      notes: 'Airport transfer'
    }
  ];

  // Store in localStorage for any user
  const userId1 = userId || 'sample-user';
  localStorage.setItem(`transactions_${userId1}`, JSON.stringify(sampleTransactions));
  
  // Also store for default user (if logged in)
  localStorage.setItem('transactions_default-user', JSON.stringify(sampleTransactions));
  
  console.log(`✅ Added ${sampleTransactions.length} sample transactions for user: ${userId1}`);
  console.log('Sample transactions:', sampleTransactions);
  
  // Calculate totals for verification
  const total = sampleTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  console.log(`💰 Total amount: ₹${total.toLocaleString('en-IN')}`);
  
  // Show categories
  const categories = [...new Set(sampleTransactions.map(tx => tx.category))];
  console.log(`📊 Categories: ${categories.join(', ')}`);
  
  // Return the transactions for verification
  return sampleTransactions;
}

// Auto-run the function
console.log('🚀 Adding sample transaction data...');
addSampleTransactions();

// Also create a global function for manual use
window.addSampleTransactions = addSampleTransactions;
