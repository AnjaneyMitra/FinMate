import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Upload, Plus } from 'lucide-react';
import { auth } from './firebase';
import BankStatementUpload from './components/BankStatementUpload';

// Transaction categories with icons and subcategories
const TRANSACTION_CATEGORIES = {
  food: {
    label: 'Food & Dining',
    icon: '🍽️',
    subcategories: ['Restaurants', 'Fast Food', 'Groceries', 'Food Delivery', 'Cafe/Coffee', 'Alcohol/Bars']
  },
  transport: {
    label: 'Transportation',
    icon: '🚗',
    subcategories: ['Fuel/Gas', 'Public Transport', 'Taxi/Ride Share', 'Car Maintenance', 'Parking', 'Vehicle Insurance']
  },
  shopping: {
    label: 'Shopping',
    icon: '🛍️',
    subcategories: ['Clothing', 'Electronics', 'Home & Garden', 'Books', 'Gifts', 'Online Shopping']
  },
  entertainment: {
    label: 'Entertainment',
    icon: '🎬',
    subcategories: ['Movies', 'Streaming Services', 'Games', 'Sports', 'Concerts', 'Hobbies']
  },
  bills: {
    label: 'Bills & Utilities',
    icon: '📄',
    subcategories: ['Electricity', 'Water', 'Internet', 'Mobile', 'Insurance', 'Rent/Mortgage']
  },
  healthcare: {
    label: 'Healthcare',
    icon: '🏥',
    subcategories: ['Doctor Visit', 'Pharmacy', 'Hospital', 'Dental', 'Lab Tests', 'Health Insurance']
  },
  education: {
    label: 'Education',
    icon: '🎓',
    subcategories: ['Tuition', 'Books', 'Online Courses', 'Training', 'Certification', 'Supplies']
  },
  travel: {
    label: 'Travel',
    icon: '✈️',
    subcategories: ['Flights', 'Hotels', 'Car Rental', 'Travel Insurance', 'Tours', 'Visa/Passport']
  },
  personal: {
    label: 'Personal Care',
    icon: '💄',
    subcategories: ['Salon/Spa', 'Cosmetics', 'Fitness', 'Gym Membership', 'Personal Training', 'Wellness']
  },
  miscellaneous: {
    label: 'Miscellaneous',
    icon: '📦',
    subcategories: ['Gifts', 'Donations', 'Fees', 'ATM Fees', 'Bank Charges', 'Other']
  }
};

const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'debit_card', label: 'Debit Card', icon: '💳' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'net_banking', label: 'Net Banking', icon: '🏦' },
  { value: 'wallet', label: 'Digital Wallet', icon: '👛' },
  { value: 'other', label: 'Other', icon: '🔄' }
];

export default function TransactionEntry({ userId }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    merchant_name: '',
    category: '',
    subcategory: '',
    payment_method: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    location: '',
    tags: '',
    notes: '',
    is_recurring: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [showBankUpload, setShowBankUpload] = useState(false);

  // Auto-categorize based on description/merchant
  useEffect(() => {
    if (formData.description || formData.merchant_name) {
      suggestCategory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.description, formData.merchant_name]);

  const suggestCategory = async () => {
    if (!formData.description && !formData.merchant_name) return;
    
    try {
      const response = await fetch('/api/spending/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount) || 0,
          merchant: formData.merchant_name
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSuggestedCategory({
          category: result.category,
          confidence: result.confidence,
          suggestions: result.suggestions
        });
      }
    } catch (err) {
      console.log('Auto-categorization unavailable');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear success message when user starts typing
    if (success) setSuccess(false);
    if (error) setError('');
  };

  const handleCategorySelect = (categoryKey) => {
    setFormData(prev => ({
      ...prev,
      category: categoryKey,
      subcategory: '' // Reset subcategory when category changes
    }));
  };

  const applySuggestedCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      category: category
    }));
    setSuggestedCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.amount || !formData.description || !formData.category) {
        throw new Error('Please fill in amount, description, and category');
      }

      // Prepare transaction data
      const transactionData = {
        ...formData,
        user_id: userId,
        amount: parseFloat(formData.amount),
        date: `${formData.date}T${formData.time}:00Z`,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        confidence_score: 1.0 // Manual entry has high confidence
      };

      // For now, store in localStorage (in real app, this would go to backend)
      const existingTransactions = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]');
      const newTransaction = {
        ...transactionData,
        transaction_id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      };
      
      existingTransactions.push(newTransaction);
      localStorage.setItem(`transactions_${userId}`, JSON.stringify(existingTransactions));

      // In a real app, you'd make an API call like this:
      /*
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        throw new Error('Failed to save transaction');
      }
      */

      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          amount: '',
          description: '',
          merchant_name: '',
          category: '',
          subcategory: '',
          payment_method: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm'),
          location: '',
          tags: '',
          notes: '',
          is_recurring: false
        });
        setSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = TRANSACTION_CATEGORIES[formData.category];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Add Transaction</h2>
            <p className="text-gray-600">Record your expenses and income manually with detailed categorization</p>
          </div>
          <button
            type="button"
            onClick={() => setShowBankUpload(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Bank Statement
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-500 text-xl mr-3">✅</span>
            <div>
              <h3 className="text-green-800 font-semibold">Transaction Added Successfully!</h3>
              <p className="text-green-700 text-sm">Your transaction has been recorded and will be included in your spending analysis.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-500 text-xl mr-3">❌</span>
            <div>
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₹</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., Lunch at McDonald's, Uber ride to office"
                required
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Merchant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Merchant/Payee</label>
              <input
                type="text"
                name="merchant_name"
                value={formData.merchant_name}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., McDonald's, Uber, Amazon"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., Mumbai, Delhi, Online"
              />
            </div>
          </div>
        </div>

        {/* AI Suggestion */}
        {suggestedCategory && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-500 text-xl mr-3">🤖</span>
                <div>
                  <h3 className="text-blue-800 font-semibold">AI Suggestion</h3>
                  <p className="text-blue-700 text-sm">
                    Based on your description, this looks like a <strong>{suggestedCategory.category}</strong> transaction 
                    ({Math.round(suggestedCategory.confidence * 100)}% confidence)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => applySuggestedCategory(suggestedCategory.category)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Category Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Category <span className="text-red-500">*</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {Object.entries(TRANSACTION_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCategorySelect(key)}
                className={`p-4 rounded-lg border-2 transition-colors text-center ${
                  formData.category === key
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium">{category.label}</div>
              </button>
            ))}
          </div>

          {/* Subcategory */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select a subcategory</option>
                {selectedCategory.subcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payment_method: method.value }))}
                className={`p-4 rounded-lg border-2 transition-colors text-center ${
                  formData.payment_method === method.value
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-xl mb-2">{method.icon}</div>
                <div className="text-xs font-medium">{method.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Additional Details</h3>
          
          <div className="space-y-6">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., business, vacation, urgent (comma-separated)"
              />
              <p className="text-sm text-gray-500 mt-1">Add tags to organize your transactions (optional)</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Additional notes or details about this transaction"
              />
            </div>

            {/* Recurring Transaction */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_recurring"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={handleInputChange}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-700">
                This is a recurring transaction
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                amount: '',
                description: '',
                merchant_name: '',
                category: '',
                subcategory: '',
                payment_method: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                time: format(new Date(), 'HH:mm'),
                location: '',
                tags: '',
                notes: '',
                is_recurring: false
              });
              setError('');
              setSuccess(false);
            }}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                Add Transaction
              </>
            )}
          </button>
        </div>
      </form>

      {/* Bank Statement Upload Modal */}
      {showBankUpload && (
        <BankStatementUpload
          user={auth.currentUser}
          onTransactionsImported={(result) => {
            setShowBankUpload(false);
            setSuccess(true);
            setError('');
            // Optionally refresh the page or update transactions list
          }}
          onClose={() => setShowBankUpload(false)}
        />
      )}
    </div>
  );
}
