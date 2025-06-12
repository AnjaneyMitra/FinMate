import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import BudgetForm from './BudgetForm';
import InvestmentLearningPath from './InvestmentLearningPath';
import TaxBreakdown from './TaxBreakdown';
import RealSpendingAnalysis from './RealSpendingAnalysis';
import TransactionForm from './TransactionForm';
import Settings from './Settings';
import FirebaseTest from './FirebaseTest';
import InvestmentSimulation from './InvestmentSimulation';
import RiskProfiler from './RiskProfiler';
import TaxEstimator from './TaxEstimator';
import FirebaseDataService from './services/FirebaseDataService';

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

  useEffect(() => {
    async function fetchDashboardStats() {
      if (!user) return;
      setDashboardStats((s) => ({ ...s, loading: true }));
      const dataService = new FirebaseDataService();
      try {
        // Fetch budget
        const budget = await dataService.getBudget();
        // Fetch user preferences (for goals)
        const prefs = await dataService.getUserPreferences();
        // Fetch spending summary
        const summary = await dataService.fetchSpendingSummary('month');
        // Calculate savings (budget - spent)
        const monthlyBudget = budget?.monthlyBudget || 0;
        const spent = summary?.total_spent || 0;
        const savings = monthlyBudget > 0 ? Math.max(monthlyBudget - spent, 0) : null;
        // Goals progress (mock: if prefs.goalsProgress exists, else percent of budget used)
        let goalsProgress = null;
        if (prefs && typeof prefs.goalsProgress === 'number') {
          goalsProgress = prefs.goalsProgress;
        } else if (monthlyBudget > 0) {
          goalsProgress = Math.round((spent / monthlyBudget) * 100);
        }
        setDashboardStats({
          monthlyBudget,
          savings,
          spent,
          goalsProgress,
          loading: false
        });
      } catch (err) {
        setDashboardStats((s) => ({ ...s, loading: false }));
      }
    }
    fetchDashboardStats();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const navigationItems = [
    { path: '/dashboard', name: 'Overview', icon: '🏠' },
    { path: '/dashboard/budget', name: 'Budget Planner', icon: '💰' },
    { path: '/dashboard/transactions', name: 'Add Transaction', icon: '➕' },
    { path: '/dashboard/spending', name: 'Spending Analysis', icon: '📊' },
    { path: '/dashboard/tax', name: 'Tax Breakdown', icon: '🧾' },
    { path: '/dashboard/learning', name: 'Investment Learning', icon: '📚' },
    { path: '/dashboard/simulation', name: 'Investment Simulation', icon: '🧮' },
    { path: '/dashboard/risk', name: 'Risk Profiler', icon: '🧑‍💼' },
    { path: '/dashboard/settings', name: 'Settings', icon: '⚙️' },
    { path: '/dashboard/firebasetest', name: 'Firebase Test', icon: '🔥' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Replace DashboardHome with injected stats
  function DashboardHome({ user }) {
    const { monthlyBudget, savings, spent, goalsProgress, loading } = dashboardStats;
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email?.split('@')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Here's your financial overview for today.
          </p>
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
                <p className="text-sm font-medium text-gray-500">This Month Spent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? <span className="text-gray-400">Loading...</span> :
                    spent !== null ? `₹${spent.toLocaleString('en-IN')}` : 'N/A'}
                </p>
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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b border-teal-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-teal-700">FinMate</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-teal-100 text-teal-700 border-r-4 border-teal-500'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<DashboardHome user={user} />} />
            <Route path="/budget" element={<BudgetForm />} />
            <Route path="/transactions" element={<TransactionForm />} />
            <Route path="/spending" element={<RealSpendingAnalysis userId={user?.uid} />} />
            <Route path="/tax" element={<TaxBreakdown />} />
            <Route path="/learning" element={<InvestmentLearningPath />} />
            <Route path="/simulation" element={<InvestmentSimulation />} />
            <Route path="/risk" element={<RiskProfiler />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/firebasetest" element={<FirebaseTest />} />
            <Route path="/tax/estimator" element={<TaxEstimator />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
