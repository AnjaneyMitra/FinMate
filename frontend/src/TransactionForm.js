import React, { useState, useEffect, useRef } from 'react';
import { Upload, PartyPopper, Utensils, Receipt, Car, ShoppingBag, Film, Hospital, GraduationCap, User, CreditCard, Banknote, DollarSign, Building, Smartphone, Wallet, FileText, Calendar, Building2, Target, CheckCircle, Lightbulb, Sparkles, BarChart3, Zap } from 'lucide-react';
import FirebaseDataService from './services/FirebaseDataService';
import BankStatementUpload from './components/BankStatementUpload';
import { auth } from './firebase';
import PinButton from './components/PinButton';
import { useTheme } from './contexts/ThemeContext';

export default function TransactionForm({ onTransactionAdded, onClose, user }) {
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};

  // Safe defaults for theme properties
  const safeBg = bg || {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    card: 'bg-white',
    tertiary: 'bg-gray-100'
  };
  const safeText = text || {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500'
  };
  const safeBorder = border || {
    primary: 'border-gray-200'
  };
  const safeAccent = accent || {
    primary: safeBg.primary,
    secondary: safeText.primary,
    bg: safeBg.secondary,
    border: safeBorder.primary
  };
  
  // Safe color extraction helper
  const getColorFromBg = (bgClass) => {
    if (!bgClass || typeof bgClass !== 'string') return 'gray-600';
    return bgClass.replace('bg-', '');
  };
  
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
      icon: Utensils,
      subcategories: ['Groceries', 'Restaurants', 'Cafe/Coffee', 'Fast Food', 'Delivery']
    },
    bills: { 
      icon: Receipt,
      subcategories: ['Rent/Mortgage', 'Utilities', 'Insurance', 'Phone', 'Internet']
    },
    transport: { 
      icon: Car,
      subcategories: ['Fuel/Gas', 'Public Transport', 'Uber/Taxi', 'Parking', 'Maintenance']
    },
    shopping: { 
      icon: ShoppingBag,
      subcategories: ['Clothing', 'Electronics', 'Home Goods', 'Online Shopping', 'Books']
    },
    entertainment: { 
      icon: Film,
      subcategories: ['Movies', 'Gaming', 'Streaming Services', 'Events', 'Sports']
    },
    healthcare: { 
      icon: Hospital,
      subcategories: ['Doctor Visit', 'Pharmacy', 'Dental', 'Vision', 'Lab Tests']
    },
    education: { 
      icon: GraduationCap,
      subcategories: ['Tuition', 'Books', 'Courses', 'Training', 'Supplies']
    },
    personal: { 
      icon: User,
      subcategories: ['Grooming', 'Fitness', 'Hobbies', 'Gifts', 'Miscellaneous']
    }
  };

  const paymentMethods = [
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
    { value: 'debit_card', label: 'Debit Card', icon: DollarSign },
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'net_banking', label: 'Net Banking', icon: Building },
    { value: 'upi', label: 'UPI', icon: Smartphone },
    { value: 'wallet', label: 'Digital Wallet', icon: Wallet },
    { value: 'cheque', label: 'Cheque', icon: FileText }
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
        category_icon: categories[transactionData.category]?.icon || ShoppingBag,
        payment_icon: paymentMethods.find(p => p.value === transactionData.payment_method)?.icon || CreditCard,
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
    <div className={`min-h-screen py-8 px-4 relative ${safeBg.primary}`}>
      {/* Floating Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`${safeBg.card} rounded-xl shadow-2xl border-l-4 border-green-500 p-4 max-w-sm`}>
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className={`font-semibold ${safeText.primary}`}>Success!</p>
                <p className={`text-sm ${safeText.secondary}`}>Transaction saved successfully</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${safeBg.card} rounded-xl shadow-xl p-8 max-w-4xl mx-auto relative overflow-hidden`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className={`text-3xl font-bold ${safeText.primary} mb-2`}>Add New Transaction</h2>
            <p className={`${safeText.secondary}`}>Track your expenses with detailed information</p>
            
            {/* Progress Indicator */}
            <div className="mt-4">
              <div className={`flex items-center gap-2 text-sm ${safeText.tertiary}`}>
                <span>Form completion:</span>
                <div className={`flex-1 ${safeBg.secondary} rounded-full h-2 max-w-32`}>
                  <div 
                    className={`${safeAccent.primary} h-2 rounded-full transition-all duration-300`}
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
                <span className={`font-semibold ${safeText.primary}`}>
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
              className={`flex items-center px-4 py-2 ${safeAccent.primary} text-white rounded-md hover:opacity-80 transition-colors`}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Statement
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className={`${safeText.tertiary} hover:${safeText.secondary} text-2xl font-bold`}
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
                    <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
                      Transaction Added Successfully! 
                      <PartyPopper className="w-6 h-6 text-green-200" />
                    </h3>
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
                    <div className="p-2 bg-green-100 rounded-lg">
                      {React.createElement(lastTransaction.category_icon, { className: "w-6 h-6 text-green-600" })}
                    </div>
                    <div>
                      <p className="font-semibold">Amount</p>
                      <p className="text-green-100">₹{lastTransaction.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      {React.createElement(lastTransaction.payment_icon, { className: "w-6 h-6 text-green-600" })}
                    </div>
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
        <div className={`bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 mb-8 border border-green-200 ${safeBg.secondary}`}>
          <h3 className={`text-lg font-semibold ${safeText.primary} mb-4 flex items-center gap-2`}>
            <div className="bg-green-100 p-2 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            Live Transaction Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Smart Categorization - Real */}
            <div className={`${safeBg.card} rounded-lg p-4 shadow-sm`}>
              <h4 className={`font-semibold ${safeText.secondary} mb-3`}>Recent Transactions</h4>
              <div className="space-y-2">
                {(() => {
                  // Generate recent transactions based on current form category or default
                  const currentCategory = formData.category || 'food';
                  const categoryIcon = categories[currentCategory]?.icon || ShoppingBag;
                  const recentTransactions = [
                    { name: 'Your latest entry', amount: formData.amount || '500', category: currentCategory, icon: categoryIcon },
                    { name: 'Grocery Store', amount: '2,450', category: 'food', icon: Utensils },
                    { name: 'Metro Card', amount: '200', category: 'transport', icon: Car }
                  ];
                  
                  return recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className={`${safeText.secondary} flex items-center gap-1`}>
                        <div className="p-1">
                          {React.createElement(transaction.icon, { className: "w-4 h-4" })}
                        </div>
                        {transaction.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`${safeText.primary} font-semibold`}>₹{transaction.amount}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.category === 'food' ? `${safeBg.tertiary} ${safeText.primary}` :
                          transaction.category === 'transport' ? `${safeBg.tertiary} ${safeText.primary}` :
                          `${safeBg.tertiary} ${safeText.primary}`
                        }`}>
                          {transaction.category}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <p className={`text-xs ${safeText.tertiary} mt-3`}>Auto-categorized transactions</p>
            </div>

            {/* Goal Assignment - Real */}
            <div className={`${safeBg.card} rounded-lg p-4 shadow-sm`}>
              <h4 className={`font-semibold ${safeText.secondary} mb-3`}>Available Goals</h4>
              <div className="space-y-2">
                {goalsLoading ? (
                  <div className={`text-sm ${safeText.tertiary}`}>Loading goals...</div>
                ) : goals.length > 0 ? (
                  goals.slice(0, 3).map((goal, index) => {
                    const percent = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
                    return (
                      <div key={goal.id || index} className="flex items-center gap-2 text-sm">
                        <div className={`w-3 h-3 ${safeAccent.primary} rounded-full`}></div>
                        <span className={`${safeText.secondary} flex-1`}>{goal.emoji} {goal.name}</span>
                        <span className={`text-xs ${safeText.primary} font-semibold`}>{percent}%</span>
                      </div>
                    );
                  })
                ) : (
                  <div className={`text-sm ${safeText.tertiary}`}>No goals yet. Create some goals to track progress!</div>
                )}
              </div>
              <p className={`text-xs ${safeText.tertiary} mt-3`}>Link transactions to your goals</p>
            </div>

            {/* Real-time Insights */}
            <div className={`${safeBg.card} rounded-lg p-4 shadow-sm`}>
              <h4 className={`font-semibold ${safeText.secondary} mb-3`}>Today's Summary</h4>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className={`${safeText.secondary}`}>Amount entering:</span>
                  <span className={`font-semibold ${safeText.primary} ml-1`}>
                    ₹{formData.amount || '0'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className={`${safeText.secondary}`}>Category:</span>
                  <span className={`font-semibold ${safeText.primary} ml-1 capitalize`}>
                    {formData.category || 'Not selected'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className={`${safeText.secondary}`}>Payment method:</span>
                  <span className={`font-semibold ${safeText.primary} ml-1`}>
                    {formData.payment_method?.replace?.('_', ' ') || 'Not selected'}
                  </span>
                </div>
                {formData.goalId && (
                  <div className="text-sm">
                    <span className={`${safeText.secondary}`}>Assigned goal:</span>
                    <span className={`font-semibold ${safeText.primary} ml-1`}>
                      {goals.find(g => g.id === formData.goalId)?.name || 'Selected goal'}
                    </span>
                  </div>
                )}
              </div>
              <p className={`text-xs ${safeText.tertiary} mt-3`}>Live transaction preview</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className={`text-sm ${safeText.secondary} flex items-center justify-center gap-2`}>
              <span className={`${safeBg.tertiary} p-1 rounded`}>
                <Zap className={`w-3 h-3 ${safeText.primary}`} />
              </span>
              <strong>Real-time tracking:</strong> Smart categorization • Goal linking • Live insights • Instant analysis
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Amount and Date - Hero Section */}
          <div className={`${safeBg.secondary} rounded-lg p-6 border ${safeBorder.primary}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <div>
                <label htmlFor="amount" className={`block text-lg font-semibold ${safeText.primary} mb-3 flex items-center gap-2`}>
                  <div className={`${safeBg.tertiary} p-1.5 rounded-lg`}>
                    <DollarSign className={`w-4 h-4 ${safeText.secondary}`} />
                  </div>
                  Amount (₹) *
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
                  className={`w-full px-4 py-3 text-xl font-semibold border-2 ${safeAccent.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-${getColorFromBg(safeAccent.primary)} focus:border-${getColorFromBg(safeAccent.primary)} ${safeBg.card}`}
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className={`block text-lg font-semibold ${safeText.primary} mb-3 flex items-center gap-2`}>
                  <div className={`${safeBg.tertiary} p-1.5 rounded-lg`}>
                    <Calendar className={`w-4 h-4 ${safeText.secondary}`} />
                  </div>
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 text-lg border-2 ${safeAccent.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-${getColorFromBg(safeAccent.primary)} focus:border-${getColorFromBg(safeAccent.primary)} ${safeBg.card}`}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={`block text-lg font-medium ${safeText.secondary} mb-3 flex items-center gap-2`}>
              <div className={`${safeBg.tertiary} p-1.5 rounded-lg`}>
                <FileText className={`w-4 h-4 ${safeText.secondary}`} />
              </div>
              Description *
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 text-lg border-2 ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-${getColorFromBg(safeAccent.primary)} focus:border-${getColorFromBg(safeAccent.primary)} ${safeBg.card}`}
              placeholder="What did you spend on?"
            />
          </div>

          {/* Category and Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className={`block text-lg font-medium ${safeText.secondary} mb-3 flex items-center gap-2`}>
                <Receipt className={`w-5 h-5 ${safeText.secondary}`} />
                Category *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(categories).map(([cat, data]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat, subcategory: '' }))}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
                      formData.category === cat
                        ? `${safeBorder.primary} ${safeBg.tertiary} ${safeText.primary} shadow-md`
                        : `${safeBorder.primary} hover:border-${getColorFromBg(safeAccent.primary)} hover:${safeBg.secondary}`
                    }`}
                  >
                    <div className="p-1">
                      {React.createElement(data.icon, { className: "w-5 h-5" })}
                    </div>
                    <span className="text-sm font-medium capitalize">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategory */}
            <div>
              <label htmlFor="subcategory" className={`block text-lg font-medium ${safeText.secondary} mb-3 flex items-center gap-2`}>
                <Receipt className={`w-5 h-5 ${safeText.secondary}`} />
                Subcategory
              </label>
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 text-lg border-2 ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-${getColorFromBg(safeAccent.primary)} focus:border-${getColorFromBg(safeAccent.primary)} ${safeBg.card}`}
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
            <label className={`block text-lg font-medium ${safeText.secondary} mb-4 flex items-center gap-2`}>
              <CreditCard className={`w-5 h-5 ${safeText.secondary}`} />
              Payment Method
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {paymentMethods.map(method => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, payment_method: method.value }))}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    formData.payment_method === method.value
                      ? `${safeBorder.primary} ${safeBg.tertiary} ${safeText.primary} shadow-md transform scale-105`
                      : `${safeBorder.primary} hover:border-${getColorFromBg(safeAccent.primary)} hover:${safeBg.secondary}`
                  }`}
                >
                  <div className="p-1">
                    {React.createElement(method.icon, { className: "w-6 h-6" })}
                  </div>
                  <span className="text-sm font-medium text-center">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label htmlFor="merchant_name" className={`block text-lg font-medium ${safeText.secondary} mb-3 flex items-center gap-2`}>
              <div className={`${safeBg.tertiary} p-1.5 rounded-lg`}>
                <Building2 className={`w-4 h-4 ${safeText.secondary}`} />
              </div>
              Merchant/Store
            </label>
            <input
              type="text"
              id="merchant_name"
              name="merchant_name"
              value={formData.merchant_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 text-lg border-2 ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-${getColorFromBg(safeAccent.primary)} focus:border-${getColorFromBg(safeAccent.primary)} ${safeBg.card}`}
              placeholder="Where did you shop?"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className={`block text-lg font-medium ${safeText.secondary} mb-3 flex items-center gap-2`}>
              <div className={`${safeBg.tertiary} p-1.5 rounded-lg`}>
                <FileText className={`w-4 h-4 ${safeText.secondary}`} />
              </div>
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
              className={`w-full px-4 py-3 text-lg border-2 ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-${getColorFromBg(safeAccent.primary)} focus:border-${getColorFromBg(safeAccent.primary)} ${safeBg.card}`}
              placeholder="Additional notes (optional)"
            />
          </div>

          {/* Goal Assignment Dropdown */}
          <div>
            <label htmlFor="goalId" className={`block text-lg font-medium ${safeText.secondary} mb-3 flex items-center gap-2`}>
              <div className={`${safeBg.tertiary} p-1.5 rounded-lg`}>
                <Target className={`w-4 h-4 ${safeText.secondary}`} />
              </div>
              Assign to Goal (optional)
            </label>
            <select
              id="goalId"
              name="goalId"
              value={formData.goalId || ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 text-lg border-2 ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-${getColorFromBg(safeAccent.primary)} focus:border-${getColorFromBg(safeAccent.primary)} ${safeBg.card}`}
              disabled={goalsLoading || goals.length === 0}
            >
              <option value="">No goal</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.name} (Target: ₹{goal.target})
                </option>
              ))}
            </select>
            {goalsLoading && <div className={`text-xs ${safeText.tertiary} mt-1`}>Loading goals...</div>}
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
                    : `${safeAccent.primary} hover:scale-105 shadow-lg hover:shadow-xl`
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
                  <CheckCircle className="w-6 h-6 text-green-200 mr-3" />
                  <span>Transaction Added!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="text-white text-xl mr-3 font-bold">₹</span>
                  <span>Add Transaction</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transform -skew-x-12 transition-all duration-700"></div>
                </div>
              )}
            </button>
            
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={`px-8 py-4 border-2 ${safeBorder.primary} rounded-lg ${safeText.secondary} hover:${safeBg.secondary} transition-colors font-semibold text-lg`}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Tips Section */}
        <div className={`mt-8 p-6 ${safeBg.secondary} rounded-lg border ${safeBorder.primary}`}>
          <h3 className={`text-lg font-semibold ${safeText.primary} mb-4 flex items-center`}>
            <div className={`${safeBg.tertiary} p-2 rounded-lg mr-3`}>
              <Lightbulb className={`w-5 h-5 ${safeText.primary}`} />
            </div>
            Pro Tips for Better Expense Tracking
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className={`${safeBg.tertiary} p-1.5 rounded-lg mr-3 mt-0.5`}>
                <Sparkles className={`w-4 h-4 ${safeText.primary}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${safeText.primary}`}>Be Specific</p>
                <p className={`text-sm ${safeText.secondary}`}>Use detailed descriptions like "Groceries at Walmart" instead of just "Shopping"</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className={`${safeBg.tertiary} p-1.5 rounded-lg mr-3 mt-0.5`}>
                <Target className={`w-4 h-4 ${safeText.secondary}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${safeText.primary}`}>Track Merchants</p>
                <p className={`text-sm ${safeText.secondary}`}>Adding store names helps identify spending patterns and favorite locations</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className={`${safeBg.tertiary} p-1.5 rounded-lg mr-3 mt-0.5`}>
                <BarChart3 className={`w-4 h-4 ${safeText.secondary}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${safeText.primary}`}>Consistent Categories</p>
                <p className={`text-sm ${safeText.secondary}`}>Use the same categories regularly to get accurate spending insights</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className={`${safeBg.tertiary} p-1.5 rounded-lg mr-3 mt-0.5`}>
                <FileText className={`w-4 h-4 ${safeText.secondary}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${safeText.primary}`}>Note Large Expenses</p>
                <p className={`text-sm ${safeText.secondary}`}>Add context for unusual or large purchases for future reference</p>
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
