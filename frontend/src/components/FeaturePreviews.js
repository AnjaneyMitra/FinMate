import React, { useState, useEffect } from 'react';

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
  { name: 'Emergency Fund', target: 100000, saved: 65000, emoji: '🛡️', color: 'bg-green-500' },
  { name: 'Vacation', target: 50000, saved: 32000, emoji: '✈️', color: 'bg-blue-500' },
  { name: 'New Laptop', target: 80000, saved: 48000, emoji: '💻', color: 'bg-purple-500' },
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
export function DashboardPreview({ theme }) {
  const [animatedSpending, setAnimatedSpending] = useState(0);
  const [animatedCategories, setAnimatedCategories] = useState([]);

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
    <div className={`rounded-2xl shadow-xl p-6 h-full border-2 ${theme === 'cyberpunk' ? 'bg-black border-pink-500 text-pink-400' : theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📊</span>
        <h3 className={`text-xl font-bold ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Live Spending Analytics</h3>
      </div>

      {/* Current Month Spending */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-bold transition-all duration-1000 ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>₹{animatedSpending.toLocaleString()}</span>
          <span className={`text-sm ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>this month</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={theme === 'cyberpunk' ? 'text-cyan-400 font-semibold' : theme === 'dark' ? 'text-green-400 font-semibold' : 'text-green-600 font-semibold'}>↓ 8%</span>
          <span className={theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>vs last month</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h4 className={`font-semibold text-sm ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Spending by Category</h4>
        {mockDashboardData.categories.map((category, index) => {
          const isVisible = animatedCategories.length > index;
          return (
            <div key={category.name} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{category.name}</span>
                  <span className={`text-sm ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>₹{category.amount.toLocaleString()}</span>
                </div>
                <div className={theme === 'cyberpunk' ? 'w-full bg-gray-800 rounded-full h-2' : theme === 'dark' ? 'w-full bg-gray-800 rounded-full h-2' : 'w-full bg-gray-200 rounded-full h-2'}>
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

      {/* Mini Chart */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: theme === 'cyberpunk' ? '#f500f5' : theme === 'dark' ? '#374151' : '#f3f4f6' }}>
        <div className="flex items-end justify-between h-16 gap-1">
          {mockDashboardData.spending.map((month, index) => (
            <div key={month.month} className="flex flex-col items-center flex-1">
              <div 
                className={theme === 'cyberpunk' ? 'bg-pink-400 rounded-t transition-all duration-1000 ease-out delay-300 w-full' : theme === 'dark' ? 'bg-teal-400 rounded-t transition-all duration-1000 ease-out delay-300 w-full' : 'bg-teal-200 rounded-t transition-all duration-1000 ease-out delay-300 w-full'}
                style={{ 
                  height: animatedSpending > 0 ? `${(month.amount / 60000) * 100}%` : '0%'
                }}
              />
              <span className={`text-xs ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mt-1`}>{month.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Goals Preview Component
export function GoalsPreview({ theme }) {
  const [animatedGoals, setAnimatedGoals] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedGoals(mockGoalsData);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`rounded-2xl shadow-xl p-6 h-full border-2 ${theme === 'cyberpunk' ? 'bg-black border-pink-500 text-pink-400' : theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🎯</span>
        <h3 className={`text-xl font-bold ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Goal Progress Tracking</h3>
      </div>
      {/* Goals Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className={`text-2xl font-bold ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>3</div>
          <div className={`text-xs ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Active Goals</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${theme === 'cyberpunk' ? 'text-cyan-400' : theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>67%</div>
          <div className={`text-xs ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Avg Progress</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${theme === 'cyberpunk' ? 'text-cyan-400' : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>₹1.45L</div>
          <div className={`text-xs ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Saved</div>
        </div>
      </div>
      {/* Individual Goals */}
      <div className="space-y-4">
        {mockGoalsData.map((goal, index) => {
          const progress = (goal.saved / goal.target) * 100;
          const isVisible = animatedGoals.length > index;
          return (
            <div key={goal.name} className={theme === 'cyberpunk' ? 'bg-gray-900 rounded-lg p-4' : theme === 'dark' ? 'bg-gray-800 rounded-lg p-4' : 'bg-gray-50 rounded-lg p-4'}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{goal.emoji}</span>
                  <span className={`font-semibold text-sm ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{goal.name}</span>
                </div>
                <span className={`text-sm ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>₹{goal.saved.toLocaleString()}/₹{goal.target.toLocaleString()}</span>
              </div>
              <div className={theme === 'cyberpunk' ? 'w-full bg-gray-800 rounded-full h-3 mb-2' : theme === 'dark' ? 'w-full bg-gray-700 rounded-full h-3 mb-2' : 'w-full bg-gray-200 rounded-full h-3 mb-2'}>
                <div 
                  className={`${goal.color} h-3 rounded-full transition-all duration-1500 ease-out relative overflow-hidden`}
                  style={{ width: isVisible ? `${progress}%` : '0%' }}
                >
                  {isVisible && (
                    <div className={theme === 'cyberpunk' ? 'absolute inset-0 bg-pink-400 opacity-20 animate-shimmer' : 'absolute inset-0 bg-white opacity-30 animate-shimmer'} />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{Math.round(progress)}% complete</span>
                <span className={`text-xs font-semibold ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>₹{(goal.target - goal.saved).toLocaleString()} to go</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Budget Preview Component
export function BudgetPreview({ theme }) {
  const [animatedBudget, setAnimatedBudget] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedBudget(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const spentPercentage = (mockBudgetData.spent / mockBudgetData.income) * 100;

  return (
    <div className={`rounded-2xl shadow-xl p-6 h-full border-2 ${theme === 'cyberpunk' ? 'bg-black border-pink-500 text-pink-400' : theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">💰</span>
        <h3 className={`text-xl font-bold ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Smart Budget Insights</h3>
      </div>
      {/* Budget Overview */}
      <div className="text-center mb-6">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              fill="none" 
              stroke={theme === 'cyberpunk' ? '#f500f5' : theme === 'dark' ? '#374151' : '#e5e7eb'}
              strokeWidth="8"
            />
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              fill="none" 
              stroke={theme === 'cyberpunk' ? '#ff0080' : theme === 'dark' ? '#14b8a6' : '#14b8a6'}
              strokeWidth="8"
              strokeDasharray={`${animatedBudget ? spentPercentage * 3.14 : 0} 314`}
              className="transition-all duration-2000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-bold ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{Math.round(spentPercentage)}%</span>
            <span className={`text-xs ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>spent</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className={theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Income:</span>
            <span className="font-semibold">₹{mockBudgetData.income.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Spent:</span>
            <span className={`font-semibold ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>₹{mockBudgetData.spent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Remaining:</span>
            <span className={`font-semibold ${theme === 'cyberpunk' ? 'text-cyan-400' : theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>₹{mockBudgetData.remaining.toLocaleString()}</span>
          </div>
        </div>
      </div>
      {/* Category Budget vs Actual */}
      <div className="space-y-3">
        <h4 className={`font-semibold text-sm ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Budget vs Actual</h4>
        {mockBudgetData.categories.map((category, index) => {
          const utilization = (category.spent / category.budgeted) * 100;
          return (
            <div key={category.name}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{category.name}</span>
                <span className={`text-xs ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>₹{category.spent.toLocaleString()}/₹{category.budgeted.toLocaleString()}</span>
              </div>
              <div className={theme === 'cyberpunk' ? 'w-full bg-gray-800 rounded-full h-2' : theme === 'dark' ? 'w-full bg-gray-800 rounded-full h-2' : 'w-full bg-gray-200 rounded-full h-2'}>
                <div 
                  className={`${category.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: animatedBudget ? `${Math.min(utilization, 100)}%` : '0%',
                    opacity: utilization > 100 ? 0.7 : 1
                  }}
                />
                {utilization > 100 && animatedBudget && (
                  <div className={theme === 'cyberpunk' ? 'bg-pink-400 h-2 rounded-full -mt-2 transition-all duration-1000 ease-out' : theme === 'dark' ? 'bg-orange-400 h-2 rounded-full -mt-2 transition-all duration-1000 ease-out' : 'bg-red-500 h-2 rounded-full -mt-2 transition-all duration-1000 ease-out'}
                       style={{ width: `${Math.min(utilization - 100, 20)}%` }} />
                )}
              </div>
              {utilization > 100 && (
                <div className={`text-xs mt-1 ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-orange-400' : 'text-red-600'}`}>
                  {Math.round(utilization - 100)}% over budget
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Smart Insight */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: theme === 'cyberpunk' ? '#f500f5' : theme === 'dark' ? '#374151' : '#f3f4f6' }}>
        <div className={theme === 'cyberpunk' ? 'bg-black rounded-lg p-3 border border-pink-500' : theme === 'dark' ? 'bg-gray-800 rounded-lg p-3 border border-gray-700' : 'bg-teal-50 rounded-lg p-3'}>
          <div className="flex items-start gap-2">
            <span className="text-sm">💡</span>
            <div>
              <p className={`text-xs font-semibold ${theme === 'cyberpunk' ? 'text-pink-400' : theme === 'dark' ? 'text-teal-400' : 'text-teal-800'}`}>Smart Insight</p>
              <p className={`text-xs ${theme === 'cyberpunk' ? 'text-cyan-300' : theme === 'dark' ? 'text-teal-400' : 'text-teal-700'}`}>You're 26% under budget! Consider moving ₹7,000 to your emergency fund.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
