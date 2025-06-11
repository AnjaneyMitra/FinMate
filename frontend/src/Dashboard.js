import React from 'react';
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

function Dashboard({ user, setUser }) {
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const navigationItems = [
    { path: '/dashboard', name: 'Overview', icon: '🏠' },
    { path: '/dashboard/budget', name: 'Budget Planner', icon: '💰' },
    { path: '/dashboard/transactions', name: 'Add Transaction', icon: '➕' },
    { path: '/dashboard/spending', name: 'Spending Analysis', icon: '📊' },
    { path: '/dashboard/tax', name: 'Tax Calculator', icon: '🧮' },
    { path: '/dashboard/learning', name: 'Investment Learning', icon: '📚' },
    { path: '/dashboard/settings', name: 'Settings', icon: '⚙️' },
    { path: '/dashboard/firebasetest', name: 'Firebase Test', icon: '🔥' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

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
            <Route path="/settings" element={<Settings />} />
            <Route path="/firebasetest" element={<FirebaseTest />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// Dashboard Home/Overview Component
function DashboardHome({ user }) {
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
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Budget</p>
              <p className="text-2xl font-semibold text-gray-900">₹50,000</p>
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
              <p className="text-2xl font-semibold text-gray-900">₹12,500</p>
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
              <p className="text-2xl font-semibold text-gray-900">₹32,750</p>
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
              <p className="text-2xl font-semibold text-gray-900">68%</p>
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
            to="/dashboard/settings"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <div>
              <p className="font-medium text-gray-700">Settings</p>
              <p className="text-sm text-gray-600">Manage data & preferences</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
