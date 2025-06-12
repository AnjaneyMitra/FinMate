import React, { useState, useEffect } from 'react';
import FirebaseDataService from './services/FirebaseDataService';
import { auth } from './firebase';

export default function TransactionForm({ onTransactionAdded, onClose }) {
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
  const [goals, setGoals] = useState([]); // For goal dropdown
  const [goalsLoading, setGoalsLoading] = useState(true);

  const dataService = new FirebaseDataService();

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

  useEffect(() => {
    async function fetchGoals() {
      setGoalsLoading(true);
      try {
        const userGoals = await dataService.getGoals();
        setGoals(userGoals || []);
      } catch {
        setGoals([]);
      } finally {
        setGoalsLoading(false);
      }
    }
    fetchGoals();
  }, [dataService]);

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

      // Show success message
      alert('✅ Transaction added successfully!');
      
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-100 py-8 px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Transaction</h2>
            <p className="text-gray-600">Track your expenses with detailed information</p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-md p-4 mb-8">
            <div className="flex">
              <span className="text-red-400 text-xl mr-3">⚠️</span>
              <div className="text-red-800">{error}</div>
            </div>
          </div>
        )}

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
              disabled={loading}
              className={`flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-teal-700 hover:to-blue-700 transform hover:scale-105 shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-3 text-xl">⏳</span>
                  Saving Transaction...
                </>
              ) : (
                <>
                  <span className="mr-3">💾</span>
                  Add Transaction
                </>
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
    </div>
  );
}
