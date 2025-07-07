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
import { useTheme } from './contexts/ThemeContext';

function QuickActions() {
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  
  // Safe fallbacks for all theme properties
  const safeBg = bg || {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    card: 'bg-white',
    tertiary: 'bg-gray-100'
  };
  const safeText = text || {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500',
    accent: 'text-teal-600',
    inverse: 'text-white'
  };
  const safeBorder = border || {
    primary: 'border-gray-200',
    accent: 'border-teal-300'
  };
  const safeAccent = accent || {
    primary: 'bg-teal-600',
    secondary: 'text-teal-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    error: 'bg-red-600'
  };
  // Function to create theme-aware specialty card styling
  const createSpecialtyCardStyle = (isNew = false) => ({
    card: `flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-300 border ${safeBorder.accent} shadow-md hover:shadow-lg group`,
    icon: `p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`,
    title: `font-medium ${safeText.primary}`,
    description: `text-sm ${safeText.secondary}`,
    badge: isNew ? `inline-flex items-center px-2 py-1 rounded-full text-xs ${safeBg.tertiary} ${safeText.accent} font-medium` : ''
  });
  
  // Note: styles unused for now but will be useful for future enhancements
  // const styles = useThemeStyles();
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
            <h2 className={`text-3xl font-bold ${safeText.primary} mb-2 flex items-center gap-3`}>
              <div className={`p-2 ${safeAccent.primary} rounded-lg`}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              Quick Actions
            </h2>
            <p className={`${safeText.secondary}`}>
              Access all your financial tools and features in one place.
            </p>
          </div>
          <PinButton pageId="quick-actions" showLabel={true} />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className={`${safeBg.card} rounded-xl shadow-sm border ${safeBorder.primary} p-6`}>
        <h3 className={`text-xl font-semibold ${safeText.primary} mb-6 flex items-center gap-2`}>
          <div className={`p-1.5 ${safeBg.tertiary} rounded-md`}>
            <BarChart className={`w-5 h-5 ${safeText.accent}`} />
          </div>
          All Available Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Link
            to="/dashboard/transactions"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('add-transaction', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>Add Transaction</p>
              <p className={`text-sm ${safeText.secondary}`}>Record new expense</p>
            </div>
          </Link>

          <Link
            to="/dashboard/history"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('view-history', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>View History</p>
              <p className={`text-sm ${safeText.secondary}`}>All transactions</p>
            </div>
          </Link>

          <Link
            to="/dashboard/budget"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('plan-budget', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>Plan Budget</p>
              <p className={`text-sm ${safeText.secondary}`}>Create monthly budget</p>
            </div>
          </Link>

          <Link
            to="/tax-filing"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('file-tax', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>File Tax Returns</p>
              <p className={`text-sm ${safeText.secondary}`}>AI-powered tax filing</p>
            </div>
          </Link>

          <Link
            to="/dashboard/spending"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('spending-analysis', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>Spending Analysis</p>
              <p className={`text-sm ${safeText.secondary}`}>Analyze your expenses</p>
            </div>
          </Link>

          <Link
            to="/dashboard/predictions"
            className={createSpecialtyCardStyle(true).card}
          >
            <div className={createSpecialtyCardStyle().icon}>
              {getActionIcon('ai-predictions', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div className="flex-1">
              <p className={createSpecialtyCardStyle().title}>AI Predictions</p>
              <p className={createSpecialtyCardStyle().description}>Future spending forecasts</p>
            </div>
            <div className="ml-auto">
              <span className={createSpecialtyCardStyle(true).badge}>
                NEW
              </span>
            </div>
          </Link>

          <Link
            to="/dashboard/comparison"
            className={createSpecialtyCardStyle(true).card}
          >
            <div className={createSpecialtyCardStyle().icon}>
              {getActionIcon('month-comparison', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div className="flex-1">
              <p className={createSpecialtyCardStyle().title}>Month Comparison</p>
              <p className={createSpecialtyCardStyle().description}>Compare monthly spending</p>
            </div>
            <div className="ml-auto">
              <span className={createSpecialtyCardStyle(true).badge}>
                NEW
              </span>
            </div>
          </Link>

          <Link
            to="/dashboard/learning"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('learn-investing', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>Learn Investing</p>
              <p className={`text-sm ${safeText.secondary}`}>Investment guides</p>
            </div>
          </Link>

          <Link
            to="/dashboard/simulation"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('simulate-investment', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>Simulate Investment</p>
              <p className={`text-sm ${safeText.secondary}`}>Try returns calculator</p>
            </div>
          </Link>

          <Link
            to="/dashboard/risk"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('risk-profiler', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>Risk Profiler</p>
              <p className={`text-sm ${safeText.secondary}`}>Assess your risk profile</p>
            </div>
          </Link>

          <Link
            to="/dashboard/settings"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('settings', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>Settings</p>
              <p className={`text-sm ${safeText.secondary}`}>Manage data & preferences</p>
            </div>
          </Link>

          <Link
            to="/dashboard/tax"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('tax-breakdown', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>Tax Breakdown</p>
              <p className={`text-sm ${safeText.secondary}`}>View your tax summary</p>
            </div>
          </Link>

          <Link
            to="/dashboard/tax/estimator"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('tax-estimator', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>Tax Estimator</p>
              <p className={`text-sm ${safeText.secondary}`}>Estimate your income tax</p>
            </div>
          </Link>

          <Link
            to="/dashboard/goals"
            className={`flex items-center p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}
          >
            <div className={`p-2 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors mr-3`}>
              {getActionIcon('view-goals', `w-5 h-5 ${safeText.accent}`)}
            </div>
            <div>
              <p className={`font-medium ${safeText.primary}`}>View Goals</p>
              <p className={`text-sm ${safeText.secondary}`}>Check your financial goals</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Categories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className={`${safeBg.card} rounded-xl shadow-sm border ${safeBorder.primary} p-6`}>
          <h4 className={`text-lg font-semibold ${safeText.primary} mb-4 flex items-center gap-3`}>
            <div className={`p-1.5 ${safeBg.tertiary} rounded-md`}>
              {getActionIcon('analytics', `w-5 h-5 ${safeText.accent}`)}
            </div>
            Analytics & Reports
          </h4>
          <div className="space-y-3">
            <Link to="/dashboard/spending" className={`block p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors`}>
                  {getActionIcon('spending-analysis', `w-4 h-4 ${safeText.accent}`)}
                </div>
                <div>
                  <p className={`font-medium ${safeText.primary}`}>Spending Analysis</p>
                  <p className={`text-sm ${safeText.secondary}`}>Detailed expense breakdown</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/predictions" className={`block p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors`}>
                  {getActionIcon('ai-predictions', `w-4 h-4 ${safeText.accent}`)}
                </div>
                <div>
                  <p className={`font-medium ${safeText.primary}`}>AI Predictions</p>
                  <p className={`text-sm ${safeText.secondary}`}>Future spending forecasts</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/comparison" className={`block p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors`}>
                  {getActionIcon('month-comparison', `w-4 h-4 ${safeText.accent}`)}
                </div>
                <div>
                  <p className={`font-medium ${safeText.primary}`}>Month Comparison</p>
                  <p className={`text-sm ${safeText.secondary}`}>Compare spending patterns</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className={`${safeBg.card} rounded-xl shadow-sm border ${safeBorder.primary} p-6`}>
          <h4 className={`text-lg font-semibold ${safeText.primary} mb-4 flex items-center gap-3`}>
            <div className={`p-1.5 ${safeBg.tertiary} rounded-md`}>
              {getActionIcon('financial', `w-5 h-5 ${safeText.accent}`)}
            </div>
            Financial Management
          </h4>
          <div className="space-y-3">
            <Link to="/dashboard/budget" className={`block p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors`}>
                  {getActionIcon('plan-budget', `w-4 h-4 ${safeText.accent}`)}
                </div>
                <div>
                  <p className={`font-medium ${safeText.primary}`}>Budget Planning</p>
                  <p className={`text-sm ${safeText.secondary}`}>Create and manage budgets</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/goals" className={`block p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors`}>
                  {getActionIcon('view-goals', `w-4 h-4 ${safeText.accent}`)}
                </div>
                <div>
                  <p className={`font-medium ${safeText.primary}`}>Financial Goals</p>
                  <p className={`text-sm ${safeText.secondary}`}>Track your progress</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/transactions" className={`block p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors`}>
                  {getActionIcon('add-transaction', `w-4 h-4 ${safeText.accent}`)}
                </div>
                <div>
                  <p className={`font-medium ${safeText.primary}`}>Add Transaction</p>
                  <p className={`text-sm ${safeText.secondary}`}>Record new expenses</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className={`${safeBg.card} rounded-xl shadow-sm border ${safeBorder.primary} p-6`}>
          <h4 className={`text-lg font-semibold ${safeText.primary} mb-4 flex items-center gap-3`}>
            <div className={`p-1.5 ${safeBg.tertiary} rounded-md`}>
              {getActionIcon('investment', `w-5 h-5 ${safeText.accent}`)}
            </div>
            Investment & Tax
          </h4>
          <div className="space-y-3">
            <Link to="/dashboard/learning" className={`block p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors`}>
                  {getActionIcon('learn-investing', `w-4 h-4 ${safeText.accent}`)}
                </div>
                <div>
                  <p className={`font-medium ${safeText.primary}`}>Investment Learning</p>
                  <p className={`text-sm ${safeText.secondary}`}>Educational content</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/simulation" className={`block p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors`}>
                  {getActionIcon('simulate-investment', `w-4 h-4 ${safeText.accent}`)}
                </div>
                <div>
                  <p className={`font-medium ${safeText.primary}`}>Investment Simulation</p>
                  <p className={`text-sm ${safeText.secondary}`}>Test strategies</p>
                </div>
              </div>
            </Link>
            <Link to="/tax-filing" className={`block p-4 ${safeBg.secondary} rounded-lg hover:${safeBg.tertiary} transition-all duration-200 border ${safeBorder.primary} shadow-sm hover:shadow-md group`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 ${safeBg.tertiary} rounded-md group-hover:${safeBg.primary} transition-colors`}>
                  {getActionIcon('file-tax', `w-4 h-4 ${safeText.accent}`)}
                </div>
                <div>
                  <p className={`font-medium ${safeText.primary}`}>Tax Filing</p>
                  <p className={`text-sm ${safeText.secondary}`}>AI-powered filing</p>
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
