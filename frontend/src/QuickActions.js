import React from 'react';
import { Link } from 'react-router-dom';
import PinButton from './components/PinButton';
import { 
  Plus, 
  History, 
  PiggyBank, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Calculator, 
  User, 
  Settings, 
  Receipt, 
  Target,
  Zap,
  BarChart,
  DollarSign,
  TrendingDown,
  PieChart
} from 'lucide-react';

function QuickActions() {
  // Icon mapping consistent with sidebar iconography
  const getActionIcon = (iconKey, className = "w-5 h-5") => {
    const iconMap = {
      'add-transaction': Plus,
      'view-history': History,
      'plan-budget': PiggyBank,
      'file-tax': FileText,
      'spending-analysis': BarChart3,
      'ai-predictions': TrendingUp,
      'month-comparison': Calendar,
      'learn-investing': BookOpen,
      'simulate-investment': Calculator,
      'risk-profiler': User,
      'settings': Settings,
      'tax-breakdown': Receipt,
      'tax-estimator': Calculator,
      'view-goals': Target,
      'analytics': BarChart,
      'financial': DollarSign,
      'investment': TrendingDown,
      'dashboard': PieChart
    };
    
    const IconComponent = iconMap[iconKey];
    return IconComponent ? <IconComponent className={className} /> : <Zap className={className} />;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              Quick Actions
            </h2>
            <p className="text-gray-600">
              Access all your financial tools and features in one place.
            </p>
          </div>
          <PinButton pageId="quick-actions" showLabel={true} />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <div className="p-1.5 bg-teal-100 rounded-md">
            <BarChart className="w-5 h-5 text-teal-600" />
          </div>
          All Available Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Link
            to="/dashboard/transactions"
            className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-200 border border-orange-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-orange-100 rounded-md group-hover:bg-orange-200 transition-colors mr-3">
              {getActionIcon('add-transaction', 'w-5 h-5 text-orange-600')}
            </div>
            <div>
              <p className="font-medium text-orange-700">Add Transaction</p>
              <p className="text-sm text-orange-600">Record new expense</p>
            </div>
          </Link>

          <Link
            to="/dashboard/history"
            className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-blue-100 rounded-md group-hover:bg-blue-200 transition-colors mr-3">
              {getActionIcon('view-history', 'w-5 h-5 text-blue-600')}
            </div>
            <div>
              <p className="font-medium text-blue-700">View History</p>
              <p className="text-sm text-blue-600">All transactions</p>
            </div>
          </Link>

          <Link
            to="/dashboard/budget"
            className="flex items-center p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg hover:from-teal-100 hover:to-teal-200 transition-all duration-200 border border-teal-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-teal-100 rounded-md group-hover:bg-teal-200 transition-colors mr-3">
              {getActionIcon('plan-budget', 'w-5 h-5 text-teal-600')}
            </div>
            <div>
              <p className="font-medium text-teal-700">Plan Budget</p>
              <p className="text-sm text-teal-600">Create monthly budget</p>
            </div>
          </Link>

          <Link
            to="/tax-filing"
            className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-purple-100 rounded-md group-hover:bg-purple-200 transition-colors mr-3">
              {getActionIcon('file-tax', 'w-5 h-5 text-purple-600')}
            </div>
            <div>
              <p className="font-medium text-purple-700">File Tax Returns</p>
              <p className="text-sm text-purple-600">AI-powered tax filing</p>
            </div>
          </Link>

          <Link
            to="/dashboard/spending"
            className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-blue-100 rounded-md group-hover:bg-indigo-200 transition-colors mr-3">
              {getActionIcon('spending-analysis', 'w-5 h-5 text-blue-600')}
            </div>
            <div>
              <p className="font-medium text-blue-700">Spending Analysis</p>
              <p className="text-sm text-blue-600">Analyze your expenses</p>
            </div>
          </Link>

          <Link
            to="/dashboard/predictions"
            className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-all duration-300 border border-purple-200 shadow-md hover:shadow-lg group"
          >
            <div className="p-2 bg-purple-100 rounded-md group-hover:bg-purple-200 transition-colors mr-3">
              {getActionIcon('ai-predictions', 'w-5 h-5 text-purple-600')}
            </div>
            <div className="flex-1">
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
            className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg hover:from-indigo-100 hover:to-blue-100 transition-all duration-300 border border-indigo-200 shadow-md hover:shadow-lg group"
          >
            <div className="p-2 bg-indigo-100 rounded-md group-hover:bg-indigo-200 transition-colors mr-3">
              {getActionIcon('month-comparison', 'w-5 h-5 text-indigo-600')}
            </div>
            <div className="flex-1">
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
            className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-purple-100 rounded-md group-hover:bg-purple-200 transition-colors mr-3">
              {getActionIcon('learn-investing', 'w-5 h-5 text-purple-600')}
            </div>
            <div>
              <p className="font-medium text-purple-700">Learn Investing</p>
              <p className="text-sm text-purple-600">Investment guides</p>
            </div>
          </Link>

          <Link
            to="/dashboard/simulation"
            className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg hover:from-pink-100 hover:to-pink-200 transition-all duration-200 border border-pink-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-pink-100 rounded-md group-hover:bg-pink-200 transition-colors mr-3">
              {getActionIcon('simulate-investment', 'w-5 h-5 text-pink-600')}
            </div>
            <div>
              <p className="font-medium text-pink-700">Simulate Investment</p>
              <p className="text-sm text-pink-600">Try returns calculator</p>
            </div>
          </Link>

          <Link
            to="/dashboard/risk"
            className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 border border-indigo-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-indigo-100 rounded-md group-hover:bg-indigo-200 transition-colors mr-3">
              {getActionIcon('risk-profiler', 'w-5 h-5 text-indigo-600')}
            </div>
            <div>
              <p className="font-medium text-indigo-700">Risk Profiler</p>
              <p className="text-sm text-indigo-600">Assess your risk profile</p>
            </div>
          </Link>

          <Link
            to="/dashboard/settings"
            className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-gray-100 rounded-md group-hover:bg-gray-200 transition-colors mr-3">
              {getActionIcon('settings', 'w-5 h-5 text-gray-600')}
            </div>
            <div>
              <p className="font-medium text-gray-700">Settings</p>
              <p className="text-sm text-gray-600">Manage data & preferences</p>
            </div>
          </Link>

          <Link
            to="/dashboard/tax"
            className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all duration-200 border border-yellow-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-yellow-100 rounded-md group-hover:bg-yellow-200 transition-colors mr-3">
              {getActionIcon('tax-breakdown', 'w-5 h-5 text-yellow-600')}
            </div>
            <div>
              <p className="font-medium text-yellow-700">Tax Breakdown</p>
              <p className="text-sm text-yellow-600">View your tax summary</p>
            </div>
          </Link>

          <Link
            to="/dashboard/tax/estimator"
            className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-200 border border-orange-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-orange-100 rounded-md group-hover:bg-orange-200 transition-colors mr-3">
              {getActionIcon('tax-estimator', 'w-5 h-5 text-orange-600')}
            </div>
            <div>
              <p className="font-medium text-orange-700">Tax Estimator</p>
              <p className="text-sm text-orange-600">Estimate your income tax</p>
            </div>
          </Link>

          <Link
            to="/dashboard/goals"
            className="flex items-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-200 border border-red-200 shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-red-100 rounded-md group-hover:bg-red-200 transition-colors mr-3">
              {getActionIcon('view-goals', 'w-5 h-5 text-red-600')}
            </div>
            <div>
              <p className="font-medium text-red-700">View Goals</p>
              <p className="text-sm text-red-600">Check your financial goals</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Categories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 rounded-md">
              {getActionIcon('analytics', 'w-5 h-5 text-blue-600')}
            </div>
            Analytics & Reports
          </h4>
          <div className="space-y-3">
            <Link to="/dashboard/spending" className="block p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200 shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-100 rounded-md group-hover:bg-blue-200 transition-colors">
                  {getActionIcon('spending-analysis', 'w-4 h-4 text-blue-600')}
                </div>
                <div>
                  <p className="font-medium text-blue-700">Spending Analysis</p>
                  <p className="text-sm text-blue-600">Detailed expense breakdown</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/predictions" className="block p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 rounded-md group-hover:bg-purple-200 transition-colors">
                  {getActionIcon('ai-predictions', 'w-4 h-4 text-purple-600')}
                </div>
                <div>
                  <p className="font-medium text-purple-700">AI Predictions</p>
                  <p className="text-sm text-purple-600">Future spending forecasts</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/comparison" className="block p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 border border-indigo-200 shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-indigo-100 rounded-md group-hover:bg-indigo-200 transition-colors">
                  {getActionIcon('month-comparison', 'w-4 h-4 text-indigo-600')}
                </div>
                <div>
                  <p className="font-medium text-indigo-700">Month Comparison</p>
                  <p className="text-sm text-indigo-600">Compare spending patterns</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
            <div className="p-1.5 bg-teal-100 rounded-md">
              {getActionIcon('financial', 'w-5 h-5 text-teal-600')}
            </div>
            Financial Management
          </h4>
          <div className="space-y-3">
            <Link to="/dashboard/budget" className="block p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg hover:from-teal-100 hover:to-teal-200 transition-all duration-200 border border-teal-200 shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-teal-100 rounded-md group-hover:bg-teal-200 transition-colors">
                  {getActionIcon('plan-budget', 'w-4 h-4 text-teal-600')}
                </div>
                <div>
                  <p className="font-medium text-teal-700">Budget Planning</p>
                  <p className="text-sm text-teal-600">Create and manage budgets</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/goals" className="block p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-200 border border-red-200 shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-red-100 rounded-md group-hover:bg-red-200 transition-colors">
                  {getActionIcon('view-goals', 'w-4 h-4 text-red-600')}
                </div>
                <div>
                  <p className="font-medium text-red-700">Financial Goals</p>
                  <p className="text-sm text-red-600">Track your progress</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/transactions" className="block p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-200 border border-orange-200 shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-orange-100 rounded-md group-hover:bg-orange-200 transition-colors">
                  {getActionIcon('add-transaction', 'w-4 h-4 text-orange-600')}
                </div>
                <div>
                  <p className="font-medium text-orange-700">Add Transaction</p>
                  <p className="text-sm text-orange-600">Record new expenses</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
            <div className="p-1.5 bg-purple-100 rounded-md">
              {getActionIcon('investment', 'w-5 h-5 text-purple-600')}
            </div>
            Investment & Tax
          </h4>
          <div className="space-y-3">
            <Link to="/dashboard/learning" className="block p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 rounded-md group-hover:bg-purple-200 transition-colors">
                  {getActionIcon('learn-investing', 'w-4 h-4 text-purple-600')}
                </div>
                <div>
                  <p className="font-medium text-purple-700">Investment Learning</p>
                  <p className="text-sm text-purple-600">Educational content</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/simulation" className="block p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg hover:from-pink-100 hover:to-pink-200 transition-all duration-200 border border-pink-200 shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-pink-100 rounded-md group-hover:bg-pink-200 transition-colors">
                  {getActionIcon('simulate-investment', 'w-4 h-4 text-pink-600')}
                </div>
                <div>
                  <p className="font-medium text-pink-700">Investment Simulation</p>
                  <p className="text-sm text-pink-600">Test strategies</p>
                </div>
              </div>
            </Link>
            <Link to="/tax-filing" className="block p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 rounded-md group-hover:bg-purple-200 transition-colors">
                  {getActionIcon('file-tax', 'w-4 h-4 text-purple-600')}
                </div>
                <div>
                  <p className="font-medium text-purple-700">Tax Filing</p>
                  <p className="text-sm text-purple-600">AI-powered filing</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickActions;
