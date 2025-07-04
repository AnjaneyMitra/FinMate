import React, { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';
import FirebaseDataService from './services/FirebaseDataService';
import BankStatementUpload from './components/BankStatementUpload';
import { auth } from './firebase';
import PinButton from './components/PinButton';

export default function TransactionForm({ onTransactionAdded, onClose, user }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'food',
    subcategory: '',
    payment_method: 'credit_card',
    date: new Date().toISOString().split('T')[0],
    merchant_name: '',
    notes: '',
    goalId: '' // For goal assignment
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showBankUpload, setShowBankUpload] = useState(false);
  const [goals, setGoals] = useState([]); // For goal dropdown
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [lastTransaction, setLastTransaction] = useState(null);
  const successRef = useRef(null);

  useEffect(() => {
    async function fetchGoals() {
      setGoalsLoading(true);
      try {
        const dataService = new FirebaseDataService();
        if (user && user.uid) {
          dataService.userId = user.uid;
        }
        const userGoals = await dataService.getGoals();
        setGoals(userGoals || []);
      } catch {
        setGoals([]);
      } finally {
        setGoalsLoading(false);
      }
    }
    fetchGoals();
  }, [user]);

  // Effect to handle scrolling when success state changes
  useEffect(() => {
    if (success && successRef.current) {
      // Multiple scroll attempts with different timings to ensure it works
      const scrollToSuccess = () => {
        // Method 1: Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Method 2: Direct element scroll
        successRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        
        // Method 3: Fallback scroll methods
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };

      // Try immediately
      scrollToSuccess();
      
      // Try again after a short delay
      const timer1 = setTimeout(scrollToSuccess, 100);
      const timer2 = setTimeout(scrollToSuccess, 300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [success]);

  const categories = {
    food: { 
      icon: '🍽️',
      subcategories: ['Groceries', 'Restaurants', 'Cafe/Coffee', 'Fast Food', 'Delivery']
    },
    bills: { 
      icon: '🧾',
      subcategories: ['Rent/Mortgage', 'Utilities', 'Insurance', 'Phone', 'Internet']
    },
    transport: { 
      icon: '🚗',
      subcategories: ['Fuel/Gas', 'Public Transport', 'Uber/Taxi', 'Parking', 'Maintenance']
    },
    shopping: { 
      icon: '🛍️',
      subcategories: ['Clothing', 'Electronics', 'Home Goods', 'Online Shopping', 'Books']
    },
    entertainment: { 
      icon: '🎬',
      subcategories: ['Movies', 'Gaming', 'Streaming Services', 'Events', 'Sports']
    },
    healthcare: { 
      icon: '🏥',
      subcategories: ['Doctor Visit', 'Pharmacy', 'Dental', 'Vision', 'Lab Tests']
    },
    education: { 
      icon: '📚',
      subcategories: ['Tuition', 'Books', 'Courses', 'Training', 'Supplies']
    },
    personal: { 
      icon: '🧴',
      subcategories: ['Grooming', 'Fitness', 'Hobbies', 'Gifts', 'Miscellaneous']
    }
  };

  const paymentMethods = [
    { value: 'credit_card', label: 'Credit Card', icon: '💳' },
    { value: 'debit_card', label: 'Debit Card', icon: '💰' },
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'net_banking', label: 'Net Banking', icon: '🏦' },
    { value: 'upi', label: 'UPI', icon: '📱' },
    { value: 'wallet', label: 'Digital Wallet', icon: '👛' },
    { value: 'cheque', label: 'Cheque', icon: '📝' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset subcategory when category changes
      ...(name === 'category' ? { subcategory: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.amount || !formData.description) {
        throw new Error('Amount and description are required');
      }

      // Check authentication
      console.log('🔍 Checking authentication...');
      console.log('👤 Current user:', auth.currentUser);
      
      if (!auth.currentUser) {
        throw new Error('You must be logged in to add transactions');
      }

      const dataService = new FirebaseDataService();
      if (user && user.uid) {
        dataService.userId = user.uid;
      }

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        goalId: formData.goalId || null // Attach goalId if selected
      };

      console.log('📝 Preparing to save transaction:', transactionData);

      // Save to Firebase
      const result = await dataService.addTransaction(transactionData);
      
      console.log('✅ Transaction saved to Firebase:', result);
      
      // Store transaction details for success display
      setLastTransaction({
        ...transactionData,
        category_icon: categories[transactionData.category]?.icon || '🛒',
        payment_icon: paymentMethods.find(p => p.value === transactionData.payment_method)?.icon || '💳',
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Show success state
      setSuccess(true);
      
      // Auto-scroll to top to show success message with multiple methods for better compatibility
      setTimeout(() => {
        // Try multiple scroll methods for better browser compatibility
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Also try scrolling to the success element specifically
        if (successRef.current) {
          successRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        category: 'food',
        subcategory: '',
        payment_method: 'credit_card',
        date: new Date().toISOString().split('T')[0],
        merchant_name: '',
        notes: '',
        goalId: '' // Reset goalId
      });

      // Notify parent component
      if (onTransactionAdded) {
        onTransactionAdded(result);
      }

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
        setLastTransaction(null);
      }, 5000);

      // Don't close automatically - let user choose
      if (onClose) {
        onClose();
      }

    } catch (err) {
      console.error('❌ Detailed error:', err);
      console.error('❌ Error code:', err.code);
      console.error('❌ Error message:', err.message);
      
      let errorMessage = err.message;
      if (err.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your Firebase security rules.';
      } else if (err.code === 'unauthenticated') {
        errorMessage = 'You must be logged in to add transactions.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-100 py-8 px-4 relative">
      {/* Floating Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border-l-4 border-green-500 p-4 max-w-sm">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Success!</p>
                <p className="text-sm text-gray-600">Transaction saved successfully</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Transaction</h2>
            <p className="text-gray-600">Track your expenses with detailed information</p>
            
            {/* Progress Indicator */}
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Form completion:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (
                        (formData.amount ? 25 : 0) +
                        (formData.description ? 25 : 0) +
                        (formData.category ? 25 : 0) +
                        (formData.payment_method ? 25 : 0)
                      ))}%`
                    }}
                  />
                </div>
                <span className="font-semibold text-teal-600">
                  {Math.min(100, (
                    (formData.amount ? 25 : 0) +
                    (formData.description ? 25 : 0) +
                    (formData.category ? 25 : 0) +
                    (formData.payment_method ? 25 : 0)
                  ))}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <PinButton pageId="transactions" showLabel={false} />
            <button
              type="button"
              onClick={() => setShowBankUpload(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Statement
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && lastTransaction && (
          <div ref={successRef} className="mb-8 animate-fade-in">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 text-white shadow-xl border-4 border-green-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white bg-opacity-20 rounded-full p-3 animate-pulse-soft">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Transaction Added Successfully! 🎉</h3>
                    <p className="text-green-100 text-sm">Your expense has been tracked and categorized</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="text-white hover:text-green-200 text-xl font-bold bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              
              {/* Transaction Summary */}
              <div className="mt-6 bg-white bg-opacity-10 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{lastTransaction.category_icon}</span>
                    <div>
                      <p className="font-semibold">Amount</p>
                      <p className="text-green-100">₹{lastTransaction.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{lastTransaction.payment_icon}</span>
                    <div>
                      <p className="font-semibold">Category</p>
                      <p className="text-green-100 capitalize">{lastTransaction.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <p className="font-semibold">Added at</p>
                      <p className="text-green-100">{lastTransaction.timestamp}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <p className="text-sm text-green-100">
                    <span className="font-semibold">"{lastTransaction.description}"</span>
                    {lastTransaction.goalId && (
                      <span> • Linked to goal: {goals.find(g => g.id === lastTransaction.goalId)?.name || 'Selected Goal'}</span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={() => setSuccess(false)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Add Another Transaction
                </button>
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    View Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-gradient-to-r from-red-400 to-pink-500 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Error Adding Transaction</h3>
                  <p className="text-red-100 text-sm">{error}</p>
                </div>
                <button 
                  onClick={() => setError('')}
                  className="ml-auto text-white hover:text-red-200 text-xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real-Time Transaction Insights */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 mb-8 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>💳</span> Live Transaction Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Smart Categorization - Real */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-700 mb-3">Recent Transactions</h4>
              <div className="space-y-2">
                {(() => {
                  // Generate recent transactions based on current form category or default
                  const currentCategory = formData.category || 'food';
                  const categoryIcon = categories[currentCategory]?.icon || '🛒';
                  const recentTransactions = [
                    { name: 'Your latest entry', amount: formData.amount || '500', category: currentCategory, icon: categoryIcon },
                    { name: 'Grocery Store', amount: '2,450', category: 'food', icon: '🍽️' },
                    { name: 'Metro Card', amount: '200', category: 'transport', icon: '🚗' }
                  ];
                  
                  return recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <span>{transaction.icon}</span>
                        {transaction.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 font-semibold">₹{transaction.amount}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.category === 'food' ? 'bg-yellow-100 text-yellow-700' :
                          transaction.category === 'transport' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {transaction.category}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <p className="text-xs text-gray-500 mt-3">Auto-categorized transactions</p>
            </div>

            {/* Goal Assignment - Real */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-700 mb-3">Available Goals</h4>
              <div className="space-y-2">
                {goalsLoading ? (
                  <div className="text-sm text-gray-500">Loading goals...</div>
                ) : goals.length > 0 ? (
                  goals.slice(0, 3).map((goal, index) => {
                    const percent = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
                    return (
                      <div key={goal.id || index} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                        <span className="text-gray-600 flex-1">{goal.emoji} {goal.name}</span>
                        <span className="text-xs text-green-600 font-semibold">{percent}%</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500">No goals yet. Create some goals to track progress!</div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">Link transactions to your goals</p>
            </div>

            {/* Real-time Insights */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-700 mb-3">Today's Summary</h4>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Amount entering:</span>
                  <span className="font-semibold text-gray-800 ml-1">
                    ₹{formData.amount || '0'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold text-blue-600 ml-1 capitalize">
                    {formData.category || 'Not selected'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Payment method:</span>
                  <span className="font-semibold text-purple-600 ml-1">
                    {formData.payment_method?.replace('_', ' ') || 'Not selected'}
                  </span>
                </div>
                {formData.goalId && (
                  <div className="text-sm">
                    <span className="text-gray-600">Assigned goal:</span>
                    <span className="font-semibold text-teal-600 ml-1">
                      {goals.find(g => g.id === formData.goalId)?.name || 'Selected goal'}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">Live transaction preview</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              ⚡ <strong>Real-time tracking:</strong> Smart categorization • Goal linking • Live insights • Instant analysis
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Amount and Date - Hero Section */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6 border border-teal-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-lg font-semibold text-teal-700 mb-3">
                  💰 Amount (₹) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-3 text-xl font-semibold border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-lg font-semibold text-teal-700 mb-3">
                  📅 Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 text-lg border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-3">
              📝 Description *
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="What did you spend on?"
            />
          </div>

          {/* Category and Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-lg font-medium text-gray-700 mb-3">
                🏷️ Category *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(categories).map(([cat, data]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat, subcategory: '' }))}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
                      formData.category === cat
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md'
                        : 'border-gray-300 hover:border-teal-300 hover:bg-teal-50'
                    }`}
                  >
                    <span className="text-lg">{data.icon}</span>
                    <span className="text-sm font-medium capitalize">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategory */}
            <div>
              <label htmlFor="subcategory" className="block text-lg font-medium text-gray-700 mb-3">
                🎯 Subcategory
              </label>
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select subcategory</option>
                {categories[formData.category]?.subcategories?.map(subcat => (
                  <option key={subcat} value={subcat}>
                    {subcat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method - Visual Selection */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              💳 Payment Method
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {paymentMethods.map(method => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, payment_method: method.value }))}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    formData.payment_method === method.value
                      ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md transform scale-105'
                      : 'border-gray-300 hover:border-teal-300 hover:bg-teal-50'
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="text-sm font-medium text-center">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label htmlFor="merchant_name" className="block text-lg font-medium text-gray-700 mb-3">
              🏪 Merchant/Store
            </label>
            <input
              type="text"
              id="merchant_name"
              name="merchant_name"
              value={formData.merchant_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Where did you shop?"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-lg font-medium text-gray-700 mb-3">
              📋 Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Additional notes (optional)"
            />
          </div>

          {/* Goal Assignment Dropdown */}
          <div>
            <label htmlFor="goalId" className="block text-lg font-medium text-gray-700 mb-3">
              🎯 Assign to Goal (optional)
            </label>
            <select
              id="goalId"
              name="goalId"
              value={formData.goalId || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              disabled={goalsLoading || goals.length === 0}
            >
              <option value="">No goal</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.emoji || '🎯'} {goal.name} (Target: ₹{goal.target})
                </option>
              ))}
            </select>
            {goalsLoading && <div className="text-xs text-gray-400 mt-1">Loading goals...</div>}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || success}
              className={`flex-1 relative overflow-hidden py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                loading 
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                  : success
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 scale-105 shadow-xl'
                    : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  </div>
                  <span>Processing Transaction...</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                </div>
              ) : success ? (
                <div className="flex items-center justify-center animate-bounce">
                  <span className="mr-3 text-2xl">✅</span>
                  <span>Transaction Added!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-xl">💰</span>
                  <span>Add Transaction</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transform -skew-x-12 transition-all duration-700"></div>
                </div>
              )}
            </button>
            
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold text-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Pro Tips for Better Expense Tracking
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <span className="text-blue-500 mr-3 text-lg">✨</span>
              <div>
                <p className="text-sm font-medium text-blue-800">Be Specific</p>
                <p className="text-sm text-blue-700">Use detailed descriptions like "Groceries at Walmart" instead of just "Shopping"</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-3 text-lg">🎯</span>
              <div>
                <p className="text-sm font-medium text-purple-800">Track Merchants</p>
                <p className="text-sm text-purple-700">Adding store names helps identify spending patterns and favorite locations</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3 text-lg">📊</span>
              <div>
                <p className="text-sm font-medium text-green-800">Consistent Categories</p>
                <p className="text-sm text-green-700">Use the same categories regularly to get accurate spending insights</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-orange-500 mr-3 text-lg">📝</span>
              <div>
                <p className="text-sm font-medium text-orange-800">Note Large Expenses</p>
                <p className="text-sm text-orange-700">Add context for unusual or large purchases for future reference</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Statement Upload Modal */}
      {showBankUpload && (
        <BankStatementUpload
          user={user || auth.currentUser}
          onTransactionsImported={(result) => {
            setShowBankUpload(false);
            setSuccess(true);
            setError('');
            if (onTransactionAdded) {
              onTransactionAdded(result);
            }
          }}
          onClose={() => setShowBankUpload(false)}
        />
      )}
    </div>
  );
}
