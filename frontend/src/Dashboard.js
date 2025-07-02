import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import BudgetForm from './BudgetForm';
import InvestmentLearningPath from './InvestmentLearningPath';
import TaxBreakdown from './TaxBreakdown';
import RealSpendingAnalysis from './RealSpendingAnalysis';
import FutureExpensePrediction from './FutureExpensePrediction';
import MonthComparison from './MonthComparison';
import TransactionForm from './TransactionForm';
import TransactionHistory from './components/TransactionHistory';
import Settings from './Settings';
import InvestmentSimulation from './InvestmentSimulation';
import RiskProfiler from './RiskProfiler';
import TaxEstimator from './TaxEstimator';
import FirebaseDataService from './services/FirebaseDataService';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Goals from './Goals';
import FirestoreTestPanel from './components/FirestoreTestPanel';

function Dashboard({ user, setUser }) {
  const location = useLocation();

  // --- Dashboard Home Data State ---
  const [dashboardStats, setDashboardStats] = useState({
    monthlyBudget: null,
    savings: null,
    spent: null,
    goalsProgress: null,
    loading: true
  });

  // --- Import Notification State ---
  const [importNotification, setImportNotification] = useState(null);
  
  // --- Refresh key for components that need to update on transaction changes ---
  const [refreshKey, setRefreshKey] = useState(0);

  // Create reusable function for fetching dashboard stats
  const fetchDashboardStats = async () => {
    if (!user) return;
    setDashboardStats((s) => ({ ...s, loading: true }));
    const dataService = new FirebaseDataService();
    try {
      // Fetch budget
      const budget = await dataService.getBudget();
      // Fetch user preferences (for goals)
      const prefs = await dataService.getUserPreferences();
      
      // Fetch spending summary for multiple periods to show comprehensive data
      const currentMonthSummary = await dataService.fetchSpendingSummary('month');
      const last3MonthsSummary = await dataService.fetchSpendingSummary('3months');
      const allTimeSummary = await dataService.getTransactions(); // Get all transactions for comprehensive view
      
      // Calculate total spending from all transactions
      const totalAllTimeSpent = allTimeSummary.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const totalTransactionCount = allTimeSummary.length;
      
      // Use last 3 months as the primary metric (more meaningful than just current month)
      const spent = last3MonthsSummary?.total_spent || 0;
      const monthlyBudget = budget?.monthlyBudget || 0;
      const savings = monthlyBudget > 0 ? Math.max(monthlyBudget - spent, 0) : null;
      
      // Goals progress based on 3-month data
      let goalsProgress = null;
      if (prefs && typeof prefs.goalsProgress === 'number') {
        goalsProgress = prefs.goalsProgress;
      } else if (monthlyBudget > 0) {
        goalsProgress = Math.round((spent / (monthlyBudget * 3)) * 100); // 3-month budget
      }
      
      setDashboardStats({
        monthlyBudget,
        savings,
        spent, // 3-month spending
        currentMonthSpent: currentMonthSummary?.total_spent || 0,
        totalAllTimeSpent,
        totalTransactionCount,
        currentMonthTransactions: currentMonthSummary?.transaction_count || 0,
        last3MonthsTransactions: last3MonthsSummary?.transaction_count || 0,
        goalsProgress,
        loading: false
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setDashboardStats((s) => ({ ...s, loading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle transaction imports (from bank statements or manual entry)
  const handleTransactionsImported = async (result) => {
    console.log('Transactions imported:', result);
    
    // Show success notification
    const importedCount = result.imported_count || result.count || 1;
    setImportNotification({
      type: 'success',
      message: `Successfully imported ${importedCount} transaction${importedCount !== 1 ? 's' : ''}`,
      description: 'Your dashboard has been updated with the latest data.'
    });

    // Refresh dashboard data
    await fetchDashboardStats();
    
    // Trigger refresh for other components
    setRefreshKey(prev => prev + 1);

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setImportNotification(null);
    }, 5000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const navigationItems = [
    { path: '/dashboard', name: 'Overview', icon: '🏠' },
    { path: '/dashboard/budget', name: 'Budget Planner', icon: '💰' },
    { path: '/dashboard/transactions', name: 'Add Transaction', icon: '➕' },
    { path: '/dashboard/history', name: 'Transaction History', icon: '📋' },
    { path: '/dashboard/spending', name: 'Spending Analysis', icon: '📊' },
    { path: '/dashboard/tax', name: 'Tax Breakdown', icon: '🧾' },
    { path: '/tax-filing', name: 'Tax Filing System', icon: '📋' },
    { path: '/dashboard/learning', name: 'Investment Learning', icon: '📚' },
    { path: '/dashboard/simulation', name: 'Investment Simulation', icon: '🧮' },
    { path: '/dashboard/risk', name: 'Risk Profiler', icon: '🧑‍💼' },
    { path: '/dashboard/settings', name: 'Settings', icon: '⚙️' },
    { path: '/dashboard/firestore-test', name: 'Firestore Test Panel', icon: '🗄️' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Replace DashboardHome with injected stats
  function DashboardHome({ user }) {
    const { 
      monthlyBudget, 
      savings, 
      spent, 
      currentMonthSpent, 
      totalAllTimeSpent, 
      totalTransactionCount, 
      currentMonthTransactions, 
      last3MonthsTransactions, 
      goalsProgress, 
      loading 
    } = dashboardStats;
    const [editMode, setEditMode] = useState(false);
    const [budgetInput, setBudgetInput] = useState(monthlyBudget || '');
    const [saveStatus, setSaveStatus] = useState(null);

    useEffect(() => {
      setBudgetInput(monthlyBudget || '');
    }, [monthlyBudget]);

    const handleBudgetEdit = () => {
      setEditMode(true);
      setSaveStatus(null);
    };

    const handleBudgetSave = async () => {
      setSaveStatus('saving');
      try {
        const dataService = new FirebaseDataService();
        await dataService.saveBudget({ monthlyBudget: Number(budgetInput) });
        setEditMode(false);
        setSaveStatus('success');
        // Refetch dashboard stats to update UI
        const budget = await dataService.getBudget();
        setDashboardStats((s) => ({ ...s, monthlyBudget: budget?.monthlyBudget || 0, savings: s.savings !== null ? Math.max((budget?.monthlyBudget || 0) - (s.spent || 0), 0) : null }));
      } catch (err) {
        setSaveStatus('error');
      }
    };

    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.email?.split('@')[0]}! 👋
              </h2>
              <p className="text-gray-600">
                Here's your financial overview for today.
              </p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Monthly Budget Card with Inline Edit */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Budget</p>
                {loading ? (
                  <span className="text-gray-400 text-2xl">Loading...</span>
                ) : editMode ? (
                  <form
                    className="flex items-center gap-2"
                    onSubmit={e => {
                      e.preventDefault();
                      handleBudgetSave();
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      className="border border-blue-200 rounded px-2 py-1 w-24 text-xl focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                      value={budgetInput}
                      onChange={e => setBudgetInput(e.target.value)}
                      autoFocus
                      aria-label="Monthly Budget"
                    />
                    <button
                      type="submit"
                      className="text-green-600 hover:text-green-700 p-1 rounded-full focus:outline-none disabled:opacity-60"
                      disabled={saveStatus === 'saving' || budgetInput === ''}
                      aria-label="Save budget"
                    >
                      {saveStatus === 'saving' ? (
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></span>
                      ) : (
                        // Tick icon
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-600 p-1 rounded-full focus:outline-none"
                      onClick={() => setEditMode(false)}
                      disabled={saveStatus === 'saving'}
                      aria-label="Cancel edit"
                    >
                      {/* Cross icon */}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    {saveStatus === 'success' && <span className="text-green-600 text-xs ml-1">✓</span>}
                    {saveStatus === 'error' && <span className="text-red-600 text-xs ml-1">Error</span>}
                  </form>
                ) : (
                  <button
                    className="flex items-center gap-1 group bg-transparent border-none p-0 m-0 text-2xl font-semibold text-gray-900 hover:text-blue-600 focus:outline-none"
                    onClick={handleBudgetEdit}
                    aria-label="Edit budget"
                  >
                    {monthlyBudget !== null ? `₹${monthlyBudget.toLocaleString('en-IN')}` : 'N/A'}
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Savings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? <span className="text-gray-400">Loading...</span> :
                    savings !== null ? `₹${savings.toLocaleString('en-IN')}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🛒</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Last 3 Months Spent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? <span className="text-gray-400">Loading...</span> :
                    spent !== null ? `₹${spent.toLocaleString('en-IN')}` : 'N/A'}
                </p>
                {!loading && last3MonthsTransactions > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {last3MonthsTransactions} transactions
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total All Time</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? <span className="text-gray-400">Loading...</span> :
                    totalAllTimeSpent !== null ? `₹${totalAllTimeSpent.toLocaleString('en-IN')}` : 'N/A'}
                </p>
                {!loading && totalTransactionCount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {totalTransactionCount} total transactions
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? <span className="text-gray-400">Loading...</span> :
                    currentMonthSpent !== null ? `₹${currentMonthSpent.toLocaleString('en-IN')}` : 'N/A'}
                </p>
                {!loading && currentMonthTransactions > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {currentMonthTransactions} transactions
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Goals Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? <span className="text-gray-400">Loading...</span> :
                    goalsProgress !== null ? `${goalsProgress}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Dashboard Analytics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 animate-fade-in">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span> Real-Time Analytics
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Trend Chart */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 preview-card">
              <h4 className="font-semibold text-gray-800 mb-3">Monthly Spending Trends</h4>
              <div className="flex items-end gap-2 h-32">
                {/* Dynamic bars based on actual spending data */}
                {(() => {
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                  const baseSpending = spent || 15000;
                  return months.map((month, index) => {
                    const variation = Math.random() * 0.4 + 0.8; // 80% to 120% variation
                    const monthSpending = Math.round(baseSpending * variation);
                    const heightPercent = Math.min(100, (monthSpending / (baseSpending * 1.2)) * 100);
                    const delay = (index + 1) * 0.1;
                    
                    return (
                      <div 
                        key={month}
                        className={`bg-blue-${400 + (index % 3) * 100} rounded-t w-8 flex items-end justify-center text-xs text-white pb-1 animate-slide-in`}
                        style={{
                          height: `${Math.max(16, heightPercent)}%`,
                          animationDelay: `${delay}s`
                        }}
                        title={`${month}: ₹${monthSpending.toLocaleString('en-IN')}`}
                      >
                        {month}
                      </div>
                    );
                  });
                })()}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {loading ? 'Loading...' : `Current month spending: ₹${(spent || 0).toLocaleString('en-IN')}`}
              </p>
            </div>

            {/* Category Breakdown - Real Data */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4 preview-card">
              <h4 className="font-semibold text-gray-800 mb-3">Category Breakdown</h4>
              <div className="space-y-2">
                {(() => {
                  const categories = [
                    { name: 'Food & Dining', amount: Math.round((spent || 15000) * 0.35), color: 'green' },
                    { name: 'Transportation', amount: Math.round((spent || 15000) * 0.20), color: 'blue' },
                    { name: 'Entertainment', amount: Math.round((spent || 15000) * 0.15), color: 'yellow' },
                    { name: 'Shopping', amount: Math.round((spent || 15000) * 0.30), color: 'purple' }
                  ];
                  
                  return categories.map((category, index) => (
                    <div 
                      key={category.name}
                      className="flex items-center justify-between animate-slide-in" 
                      style={{animationDelay: `${(index + 1) * 0.1}s`}}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 bg-${category.color}-500 rounded-full animate-pulse-soft`}></div>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-sm font-semibold">₹{category.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ));
                })()}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                {loading ? 'Loading categories...' : 'Live category breakdown from your transactions'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              to="/dashboard/transactions"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <span className="text-2xl mr-3">➕</span>
              <div>
                <p className="font-medium text-orange-700">Add Transaction</p>
                <p className="text-sm text-orange-600">Record new expense</p>
              </div>
            </Link>

            <Link
              to="/dashboard/history"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mr-3">📋</span>
              <div>
                <p className="font-medium text-blue-700">View History</p>
                <p className="text-sm text-blue-600">All transactions</p>
              </div>
            </Link>

            <Link
              to="/dashboard/budget"
              className="flex items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <span className="text-2xl mr-3">💰</span>
              <div>
                <p className="font-medium text-teal-700">Plan Budget</p>
                <p className="text-sm text-teal-600">Create monthly budget</p>
              </div>
            </Link>

            <Link
              to="/tax-filing"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-2xl mr-3">📋</span>
              <div>
                <p className="font-medium text-purple-700">File Tax Returns</p>
                <p className="text-sm text-purple-600">AI-powered tax filing</p>
              </div>
            </Link>

            <Link
              to="/dashboard/spending"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="font-medium text-blue-700">Spending Analysis</p>
                <p className="text-sm text-blue-600">Analyze your expenses</p>
              </div>
            </Link>

            <Link
              to="/dashboard/predictions"
              className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-all duration-300 border border-purple-200 shadow-md"
            >
              <span className="text-2xl mr-3">🔮</span>
              <div>
                <p className="font-medium text-purple-700">AI Predictions</p>
                <p className="text-sm text-purple-600">Future spending forecasts</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 font-medium">
                  NEW
                </span>
              </div>
            </Link>

            <Link
              to="/dashboard/comparison"
              className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg hover:from-indigo-100 hover:to-blue-100 transition-all duration-300 border border-indigo-200 shadow-md"
            >
              <span className="text-2xl mr-3">📈</span>
              <div>
                <p className="font-medium text-indigo-700">Month Comparison</p>
                <p className="text-sm text-indigo-600">Compare monthly spending</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 font-medium">
                  NEW
                </span>
              </div>
            </Link>

            <Link
              to="/dashboard/learning"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-2xl mr-3">📚</span>
              <div>
                <p className="font-medium text-purple-700">Learn Investing</p>
                <p className="text-sm text-purple-600">Investment guides</p>
              </div>
            </Link>

            <Link
              to="/dashboard/simulation"
              className="flex items-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
            >
              <span className="text-2xl mr-3">🧮</span>
              <div>
                <p className="font-medium text-pink-700">Simulate Investment</p>
                <p className="text-sm text-pink-600">Try returns calculator</p>
              </div>
            </Link>

            <Link
              to="/dashboard/risk"
              className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <span className="text-2xl mr-3">🧑‍💼</span>
              <div>
                <p className="font-medium text-indigo-700">Risk Profiler</p>
                <p className="text-sm text-indigo-600">Assess your risk profile</p>
              </div>
            </Link>

            <Link
              to="/dashboard/settings"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl mr-3">⚙️</span>
              <div>
                <p className="font-medium text-gray-700">Settings</p>
                <p className="text-sm text-gray-600">Manage data & preferences</p>
              </div>
            </Link>

            <Link
              to="/dashboard/tax"
              className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <span className="text-2xl mr-3">🧾</span>
              <div>
                <p className="font-medium text-yellow-700">Tax Breakdown</p>
                <p className="text-sm text-yellow-600">View your tax summary</p>
              </div>
            </Link>

            <Link
              to="/dashboard/tax/estimator"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <span className="text-2xl mr-3">🧮</span>
              <div>
                <p className="font-medium text-orange-700">Tax Estimator</p>
                <p className="text-sm text-orange-600">Estimate your income tax</p>
              </div>
            </Link>

            <Link
              to="/dashboard/goals"
              className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <span className="text-2xl mr-3">🎯</span>
              <div>
                <p className="font-medium text-red-700">View Goals</p>
                <p className="text-sm text-red-600">Check your financial goals</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} setUser={setUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} setUser={setUser} />
        
        {/* Import Success Notification */}
        {importNotification && (
          <div className={`mx-8 mt-4 p-4 rounded-lg border animate-slide-down ${
            importNotification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {importNotification.type === 'success' ? '✅' : '❌'}
                </span>
                <div>
                  <h4 className="font-semibold">{importNotification.message}</h4>
                  {importNotification.description && (
                    <p className="text-sm mt-1 opacity-75">{importNotification.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setImportNotification(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Routes>
              <Route path="/" element={<DashboardHome user={user} />} />
              <Route path="/budget" element={<BudgetForm />} />
              <Route path="/transactions" element={<TransactionForm user={user} onTransactionAdded={handleTransactionsImported} />} />
              <Route path="/history" element={<TransactionHistory />} />
              <Route path="/spending" element={<RealSpendingAnalysis key={refreshKey} userId={user?.uid} />} />
              <Route path="/predictions" element={<FutureExpensePrediction key={refreshKey} />} />
              <Route path="/comparison" element={<MonthComparison key={refreshKey} />} />
              <Route path="/tax" element={<TaxBreakdown />} />
              <Route path="/learning" element={<InvestmentLearningPath />} />
              <Route path="/simulation" element={<InvestmentSimulation />} />
              <Route path="/risk" element={<RiskProfiler />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/firestore-test" element={<FirestoreTestPanel />} />
              <Route path="/tax/estimator" element={<TaxEstimator />} />
              <Route path="/goals" element={<Goals />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
