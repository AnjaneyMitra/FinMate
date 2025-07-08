import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Target, 
  PiggyBank, 
  TrendingDown, 
  Lightbulb,
  Shield,
  Plane,
  Laptop
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// Mock data that simulates real user data
const mockDashboardData = {
  spending: [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 55000 },
    { month: 'May', amount: 49000 },
    { month: 'Jun', amount: 53000 },
  ],
  categories: [
    { name: 'Food & Dining', amount: 18000, percentage: 34, color: 'bg-teal-500' },
    { name: 'Transportation', amount: 12000, percentage: 23, color: 'bg-blue-500' },
    { name: 'Shopping', amount: 9500, percentage: 18, color: 'bg-purple-500' },
    { name: 'Bills & Utilities', amount: 8000, percentage: 15, color: 'bg-yellow-500' },
    { name: 'Entertainment', amount: 5500, percentage: 10, color: 'bg-pink-500' },
  ]
};

const mockGoalsData = [
  { name: 'Emergency Fund', target: 100000, saved: 65000, icon: Shield, color: 'bg-green-500' },
  { name: 'Vacation', target: 50000, saved: 32000, icon: Plane, color: 'bg-blue-500' },
  { name: 'New Laptop', target: 80000, saved: 48000, icon: Laptop, color: 'bg-purple-500' },
];

const mockBudgetData = {
  income: 70000,
  spent: 52000,
  remaining: 18000,
  categories: [
    { name: 'Essentials', budgeted: 28000, spent: 26000, color: 'bg-teal-500' },
    { name: 'Savings', budgeted: 14000, spent: 12000, color: 'bg-green-500' },
    { name: 'Discretionary', budgeted: 21000, spent: 14000, color: 'bg-blue-500' },
    { name: 'Emergency', budgeted: 7000, spent: 0, color: 'bg-yellow-500' },
  ]
};

// Dashboard Preview Component
export function DashboardPreview() {
  const [animatedSpending, setAnimatedSpending] = useState(0);
  const [animatedCategories, setAnimatedCategories] = useState([]);

  // Theme integration
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  
  // Safe fallbacks for theme properties
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
    accent: 'text-teal-600'
  };
  const safeBorder = border || {
    primary: 'border-gray-200',
    accent: 'border-teal-300'
  };
  const safeAccent = accent || {
    primary: 'bg-teal-600',
    secondary: 'bg-blue-600',
    success: 'bg-green-600'
  };

  useEffect(() => {
    // Animate spending number
    const timer = setTimeout(() => {
      setAnimatedSpending(52000);
    }, 500);

    // Animate category bars
    const categoryTimer = setTimeout(() => {
      setAnimatedCategories(mockDashboardData.categories);
    }, 800);

    return () => {
      clearTimeout(timer);
      clearTimeout(categoryTimer);
    };
  }, []);

  return (
    <div className={`${safeBg.card} rounded-2xl shadow-xl p-4 md:p-6 h-full w-full overflow-hidden flex flex-col border ${safeBorder.primary}`}>
      <div className="flex items-center gap-3 mb-4 md:mb-6 flex-shrink-0">
        <div className={`p-2 ${safeAccent.primary} rounded-lg`}>
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <h3 className={`text-lg md:text-xl font-bold ${safeText.primary}`}>Live Spending Analytics</h3>
      </div>

      {/* Current Month Spending */}
      <div className="mb-4 md:mb-6 flex-shrink-0">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-2xl md:text-3xl font-bold ${safeText.accent} transition-all duration-1000`}>
            ₹{animatedSpending.toLocaleString()}
          </span>
          <span className={`${safeText.tertiary} text-sm`}>this month</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <TrendingDown className={`w-4 h-4 ${safeText.accent}`} />
            <span className={`${safeText.accent} font-semibold`}>8%</span>
          </div>
          <span className={safeText.tertiary}>vs last month</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="flex-1 min-h-0">
        <h4 className={`font-semibold ${safeText.secondary} text-sm mb-3`}>Spending by Category</h4>
        <div className="space-y-3 mb-4">
          {mockDashboardData.categories.slice(0, 5).map((category, index) => {
            const isVisible = animatedCategories.length > index;
            return (
              <div key={category.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${safeText.primary} truncate`}>{category.name}</span>
                    <span className={`text-sm ${safeText.tertiary} ml-2 flex-shrink-0`}>₹{category.amount.toLocaleString()}</span>
                  </div>
                  <div className={`w-full ${safeBg.tertiary} rounded-full h-2`}>
                    <div 
                      className={`${category.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ 
                        width: isVisible ? `${category.percentage}%` : '0%' 
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Chart */}
      <div className={`pt-4 border-t ${safeBorder.primary} flex-shrink-0`}>
        <div className="flex items-end justify-between h-12 md:h-16 gap-1">
          {mockDashboardData.spending.map((month, index) => (
            <div key={month.month} className="flex flex-col items-center flex-1">
              <div 
                className={`${safeAccent.primary} bg-opacity-30 rounded-t transition-all duration-1000 ease-out delay-300 w-full`}
                style={{ 
                  height: animatedSpending > 0 ? `${(month.amount / 60000) * 100}%` : '0%' 
                }}
              />
              <span className={`text-xs ${safeText.tertiary} mt-1`}>{month.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Goals Preview Component
export function GoalsPreview() {
  const [animatedGoals, setAnimatedGoals] = useState([]);

  // Theme integration
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  
  // Safe fallbacks for theme properties
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
    accent: 'text-teal-600'
  };
  const safeBorder = border || {
    primary: 'border-gray-200',
    accent: 'border-teal-300'
  };
  const safeAccent = accent || {
    primary: 'bg-teal-600',
    secondary: 'bg-blue-600',
    success: 'bg-green-600',
    error: 'bg-red-600'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedGoals(mockGoalsData);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${safeBg.card} rounded-2xl shadow-xl p-4 md:p-6 h-full w-full overflow-hidden flex flex-col border ${safeBorder.primary}`}>
      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 flex-shrink-0">
        <div className={`p-2 ${safeAccent.error} rounded-lg`}>
          <Target className="w-5 h-5 text-white" />
        </div>
        <h3 className={`text-base md:text-xl font-bold ${safeText.primary}`}>Goal Progress Tracking</h3>
      </div>

      {/* Goals Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4 flex-shrink-0">
        <div className="text-center">
          <div className={`text-lg md:text-2xl font-bold ${safeText.accent}`}>3</div>
          <div className={`text-xs ${safeText.tertiary}`}>Active Goals</div>
        </div>
        <div className="text-center">
          <div className={`text-lg md:text-2xl font-bold ${safeText.accent}`}>67%</div>
          <div className={`text-xs ${safeText.tertiary}`}>Avg Progress</div>
        </div>
        <div className="text-center">
          <div className={`text-lg md:text-2xl font-bold ${safeText.accent}`}>₹1.45L</div>
          <div className={`text-xs ${safeText.tertiary}`}>Total Saved</div>
        </div>
      </div>

      {/* Individual Goals */}
      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
        {mockGoalsData.map((goal, index) => {
          const progress = (goal.saved / goal.target) * 100;
          const isVisible = animatedGoals.length > index;
          
          return (
            <div key={goal.name} className={`${safeBg.secondary} rounded-lg p-2 md:p-3 flex-shrink-0 border ${safeBorder.primary} hover:shadow-md transition-all duration-200`}>
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <div className="flex items-center gap-1 md:gap-2">
                  <div className={`p-1 ${safeBg.card} rounded-md shadow-sm`}>
                    <goal.icon className={`w-3 h-3 md:w-4 md:h-4 ${safeText.secondary}`} />
                  </div>
                  <span className={`font-semibold ${safeText.primary} text-xs md:text-sm`}>{goal.name}</span>
                </div>
                <span className={`text-xs md:text-sm ${safeText.secondary}`}>
                  ₹{(goal.saved/1000).toFixed(0)}K/₹{(goal.target/1000).toFixed(0)}K
                </span>
              </div>
              
              <div className={`w-full ${safeBg.tertiary} rounded-full h-2 md:h-3 mb-1 md:mb-2`}>
                <div 
                  className={`${goal.color} h-2 md:h-3 rounded-full transition-all duration-1500 ease-out relative overflow-hidden`}
                  style={{ 
                    width: isVisible ? `${progress}%` : '0%' 
                  }}
                >
                  {isVisible && (
                    <div className="absolute inset-0 bg-white opacity-30 animate-shimmer" />
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`text-xs ${safeText.tertiary}`}>{Math.round(progress)}% complete</span>
                <span className={`text-xs font-semibold ${safeText.accent}`}>
                  ₹{((goal.target - goal.saved)/1000).toFixed(0)}K to go
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Budget Preview Component
export function BudgetPreview() {
  const [animatedBudget, setAnimatedBudget] = useState(false);

  // Theme integration
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  
  // Safe fallbacks for theme properties
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
    accent: 'text-teal-600'
  };
  const safeBorder = border || {
    primary: 'border-gray-200',
    accent: 'border-teal-300'
  };
  const safeAccent = accent || {
    primary: 'bg-teal-600',
    secondary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    error: 'bg-red-600'
  };

  // Convert theme colors to CSS values for SVG
  const getStrokeColor = (colorClass) => {
    if (colorClass.includes('teal-600')) return '#0d9488';
    if (colorClass.includes('blue-600')) return '#2563eb';
    if (colorClass.includes('green-600')) return '#16a34a';
    if (colorClass.includes('red-600')) return '#dc2626';
    if (colorClass.includes('gray-200')) return '#e5e7eb';
    if (colorClass.includes('gray-300')) return '#d1d5db';
    return '#0d9488'; // fallback
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedBudget(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const spentPercentage = (mockBudgetData.spent / mockBudgetData.income) * 100;

  return (
    <div className={`${safeBg.card} rounded-2xl shadow-xl p-4 md:p-6 h-full w-full overflow-hidden flex flex-col border ${safeBorder.primary}`}>
      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 flex-shrink-0">
        <div className={`p-2 ${safeAccent.success} rounded-lg`}>
          <PiggyBank className="w-5 h-5 text-white" />
        </div>
        <h3 className={`text-base md:text-xl font-bold ${safeText.primary}`}>Smart Budget Insights</h3>
      </div>

      {/* Budget Overview */}
      <div className="text-center mb-3 md:mb-4 flex-shrink-0">
        <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-2 md:mb-3">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              fill="none" 
              stroke={getStrokeColor(safeBorder.primary)} 
              strokeWidth="8"
            />
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              fill="none" 
              stroke={getStrokeColor(safeAccent.primary)} 
              strokeWidth="8"
              strokeDasharray={`${animatedBudget ? spentPercentage * 3.14 : 0} 314`}
              className="transition-all duration-2000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xs md:text-sm font-bold ${safeText.primary}`}>
              {Math.round(spentPercentage)}%
            </span>
            <span className={`text-xs ${safeText.tertiary}`}>spent</span>
          </div>
        </div>
        
        <div className="space-y-1 text-xs md:text-sm">
          <div className="flex justify-between">
            <span className={safeText.secondary}>Income:</span>
            <span className={`font-semibold ${safeText.primary}`}>₹{(mockBudgetData.income/1000).toFixed(0)}K</span>
          </div>
          <div className="flex justify-between">
            <span className={safeText.secondary}>Spent:</span>
            <span className={`font-semibold ${safeText.accent}`}>₹{(mockBudgetData.spent/1000).toFixed(0)}K</span>
          </div>
          <div className="flex justify-between">
            <span className={safeText.secondary}>Remaining:</span>
            <span className={`font-semibold ${safeText.accent}`}>₹{(mockBudgetData.remaining/1000).toFixed(0)}K</span>
          </div>
        </div>
      </div>

      {/* Category Budget vs Actual */}
      <div className="flex-1 min-h-0 overflow-y-auto mb-2 md:mb-3">
        <h4 className={`font-semibold ${safeText.secondary} text-xs md:text-sm mb-2`}>Budget vs Actual</h4>
        <div className="space-y-2">
          {mockBudgetData.categories.map((category, index) => {
            const utilization = (category.spent / category.budgeted) * 100;
            
            return (
              <div key={category.name} className="flex-shrink-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-medium ${safeText.primary} truncate`}>{category.name}</span>
                  <span className={`text-xs ${safeText.tertiary} ml-2 flex-shrink-0`}>
                    ₹{(category.spent/1000).toFixed(0)}K/₹{(category.budgeted/1000).toFixed(0)}K
                  </span>
                </div>
                <div className={`w-full ${safeBg.tertiary} rounded-full h-1.5`}>
                  <div 
                    className={`${category.color} h-1.5 rounded-full transition-all duration-1000 ease-out`}
                    style={{ 
                      width: animatedBudget ? `${Math.min(utilization, 100)}%` : '0%',
                      opacity: utilization > 100 ? 0.7 : 1
                    }}
                  />
                  {utilization > 100 && animatedBudget && (
                    <div className={`${safeAccent.error} h-1.5 rounded-full -mt-1.5 transition-all duration-1000 ease-out`}
                         style={{ width: `${Math.min(utilization - 100, 20)}%` }} />
                  )}
                </div>
                {utilization > 100 && (
                  <div className={`text-xs ${safeText.accent} mt-1`}>
                    {Math.round(utilization - 100)}% over budget
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Insight */}
      <div className={`pt-2 md:pt-3 border-t ${safeBorder.primary} flex-shrink-0`}>
        <div className={`${safeBg.secondary} rounded-lg p-2 border ${safeBorder.accent}`}>
          <div className="flex items-start gap-2">
            <div className={`p-1 ${safeBg.tertiary} rounded-md`}>
              <Lightbulb className={`w-3 h-3 ${safeText.accent}`} />
            </div>
            <div>
              <p className={`text-xs font-semibold ${safeText.primary}`}>Smart Insight</p>
              <p className={`text-xs ${safeText.secondary}`}>
                You're 26% under budget! Consider moving ₹7K to your emergency fund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
