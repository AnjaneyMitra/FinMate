import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar,
  FileText,
  CreditCard,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  RefreshCw,
  Settings,
  Bell,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { useFinmate } from '../contexts/FinmateContext';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const UnifiedDashboard = () => {
  const { 
    user, 
    dashboardData, 
    expenses, 
    taxData, 
    insights,
    loading,
    connectionStatus,
    loadDashboardData,
    refreshAllData,
    addNotification,
    apiService
  } = useFinmate();

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showBalances, setShowBalances] = useState(true);
  const [quickActions, setQuickActions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
    loadQuickActions();
    loadRecentActivity();
  }, []);

  const loadQuickActions = () => {
    setQuickActions([
      {
        id: 'add-expense',
        title: 'Add Expense',
        description: 'Record a new expense',
        icon: DollarSign,
        color: 'blue',
        action: () => addNotification({
          type: 'info',
          title: 'Feature Coming Soon',
          message: 'Quick expense addition will be available soon'
        })
      },
      {
        id: 'upload-statement',
        title: 'Upload Statement',
        description: 'Import bank statement',
        icon: Upload,
        color: 'green',
        action: () => addNotification({
          type: 'info',
          title: 'Feature Coming Soon',
          message: 'Bank statement upload will be available soon'
        })
      },
      {
        id: 'tax-filing',
        title: 'File Taxes',
        description: 'Start tax return',
        icon: FileText,
        color: 'purple',
        action: () => window.location.href = '/tax-filing'
      },
      {
        id: 'get-insights',
        title: 'AI Insights',
        description: 'Get personalized advice',
        icon: Zap,
        color: 'yellow',
        action: async () => {
          try {
            const insights = await apiService.getPersonalizedInsights();
            addNotification({
              type: 'success',
              title: 'AI Insights Ready',
              message: 'Check your personalized financial insights'
            });
          } catch (error) {
            addNotification({
              type: 'error',
              title: 'Error',
              message: 'Failed to load AI insights'
            });
          }
        }
      }
    ]);
  };

  const loadRecentActivity = () => {
    // Mock recent activity data
    setRecentActivity([
      {
        id: 1,
        type: 'expense',
        title: 'Grocery Shopping',
        amount: 2500,
        date: new Date(),
        status: 'completed'
      },
      {
        id: 2,
        type: 'tax',
        title: 'ITR-1 Draft Saved',
        date: new Date(Date.now() - 86400000),
        status: 'draft'
      },
      {
        id: 3,
        type: 'statement',
        title: 'HDFC Statement Processed',
        transactions: 45,
        date: new Date(Date.now() - 172800000),
        status: 'completed'
      }
    ]);
  };

  // Calculate summary stats
  const calculateStats = () => {
    const currentMonth = new Date().getMonth();
    const currentMonthExpenses = expenses.filter(expense => 
      new Date(expense.date).getMonth() === currentMonth
    );

    const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avgDaily = totalSpent / new Date().getDate();
    const budgetUtilization = (totalSpent / 50000) * 100; // Assuming 50k budget

    return {
      totalSpent,
      avgDaily,
      budgetUtilization,
      transactionCount: currentMonthExpenses.length
    };
  };

  const stats = calculateStats();

  // Chart data
  const expenseChartData = {
    labels: ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping'],
    datasets: [{
      data: [30, 20, 15, 10, 25],
      backgroundColor: [
        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '#EF4444',
        '#8B5CF6'
      ],
      borderWidth: 0
    }]
  };

  const trendChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Expenses',
      data: [45000, 52000, 48000, 61000, 55000, 67000],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.displayName || 'User'}! 👋
              </h1>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                connectionStatus === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  connectionStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {connectionStatus}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={showBalances ? 'Hide balances' : 'Show balances'}
              >
                {showBalances ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              
              <button
                onClick={refreshAllData}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {showBalances ? `₹${stats.totalSpent.toLocaleString()}` : '••••••'}
                </p>
                <p className="text-sm text-gray-400 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Daily Average</p>
                <p className="text-2xl font-bold text-gray-900">
                  {showBalances ? `₹${Math.round(stats.avgDaily).toLocaleString()}` : '••••••'}
                </p>
                <p className="text-sm text-gray-400 mt-1">Per day</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-sm text-red-600">-5% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Budget Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {showBalances ? `${Math.round(stats.budgetUtilization)}%` : '••%'}
                </p>
                <p className="text-sm text-gray-400 mt-1">Of monthly budget</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stats.budgetUtilization, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.transactionCount}</p>
                <p className="text-sm text-gray-400 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8 new transactions</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Trend Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Expense Trends</h3>
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="quarter">Last 3 months</option>
                  <option value="year">Last 12 months</option>
                </select>
              </div>
              <div className="h-64">
                <Line data={trendChartData} options={chartOptions} />
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48">
                  <Pie data={expenseChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                </div>
                <div className="space-y-3">
                  {expenseChartData.labels.map((label, index) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: expenseChartData.datasets[0].backgroundColor[index] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-500">{label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {expenseChartData.datasets[0].data[index]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                        <IconComponent className={`w-5 h-5 text-${action.color}-600`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-sm text-gray-400">{action.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.status === 'completed' ? 'bg-green-100' :
                      activity.status === 'draft' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {activity.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : activity.status === 'draft' ? (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      {activity.amount && (
                        <p className="text-sm text-gray-500">₹{activity.amount.toLocaleString()}</p>
                      )}
                      {activity.transactions && (
                        <p className="text-sm text-gray-500">{activity.transactions} transactions</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights Preview */}
            {insights && insights.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                </div>
                <div className="space-y-3">
                  {insights.slice(0, 2).map((insight, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-900">{insight.message}</p>
                      {insight.action && (
                        <button className="text-sm text-purple-600 font-medium mt-2 hover:text-purple-800">
                          {insight.action}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
