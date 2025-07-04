import React from 'react';
import { Link } from 'react-router-dom';
import PinButton from './components/PinButton';

function QuickActions() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Quick Actions ⚡
            </h2>
            <p className="text-gray-600">
              Access all your financial tools and features in one place.
            </p>
          </div>
          <PinButton pageId="quick-actions" showLabel={true} />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">All Available Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

      {/* Categories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span> Analytics & Reports
          </h4>
          <div className="space-y-3">
            <Link to="/dashboard/spending" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <p className="font-medium text-blue-700">Spending Analysis</p>
              <p className="text-sm text-blue-600">Detailed expense breakdown</p>
            </Link>
            <Link to="/dashboard/predictions" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <p className="font-medium text-purple-700">AI Predictions</p>
              <p className="text-sm text-purple-600">Future spending forecasts</p>
            </Link>
            <Link to="/dashboard/comparison" className="block p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <p className="font-medium text-indigo-700">Month Comparison</p>
              <p className="text-sm text-indigo-600">Compare spending patterns</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>💰</span> Financial Management
          </h4>
          <div className="space-y-3">
            <Link to="/dashboard/budget" className="block p-3 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
              <p className="font-medium text-teal-700">Budget Planning</p>
              <p className="text-sm text-teal-600">Create and manage budgets</p>
            </Link>
            <Link to="/dashboard/goals" className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <p className="font-medium text-red-700">Financial Goals</p>
              <p className="text-sm text-red-600">Track your progress</p>
            </Link>
            <Link to="/dashboard/transactions" className="block p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <p className="font-medium text-orange-700">Add Transaction</p>
              <p className="text-sm text-orange-600">Record new expenses</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🚀</span> Investment & Tax
          </h4>
          <div className="space-y-3">
            <Link to="/dashboard/learning" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <p className="font-medium text-purple-700">Investment Learning</p>
              <p className="text-sm text-purple-600">Educational content</p>
            </Link>
            <Link to="/dashboard/simulation" className="block p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
              <p className="font-medium text-pink-700">Investment Simulation</p>
              <p className="text-sm text-pink-600">Test strategies</p>
            </Link>
            <Link to="/tax-filing" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <p className="font-medium text-purple-700">Tax Filing</p>
              <p className="text-sm text-purple-600">AI-powered filing</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickActions;
