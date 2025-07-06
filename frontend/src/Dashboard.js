import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import QuickActions from './QuickActions';
import FirestoreTestPanel from './components/FirestoreTestPanel';
import TimeSelector from './components/TimeSelector';
import RadialProgress from './components/RadialProgress';
import GoalsModal from './components/GoalsModal';
import { periodToApiFormat, getPeriodDescription } from './utils/timeUtils';
import { CheckCircle, XCircle, X, Hand, ShoppingCart, TrendingUp, BarChart3, Calendar, Target, Lightbulb, PieChart, Pizza } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Currency formatter for Indian Rupees
const formatCurrency = (amount) => {
  // Handle null, undefined, or non-numeric values
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  
  const numAmount = Number(amount);
  if (numAmount === 0) return '₹0';
  if (numAmount >= 10000000) { // 1 crore
    return `₹${(numAmount / 10000000).toFixed(1)}Cr`;
  }
  if (numAmount >= 100000) { // 1 lakh
    return `₹${(numAmount / 100000).toFixed(1)}L`;
  }
  if (numAmount >= 1000) { // 1 thousand
    return `₹${(numAmount / 1000).toFixed(1)}K`;
  }
  return `₹${numAmount.toLocaleString('en-IN')}`;
};

// Chart.js default options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#ddd',
      borderWidth: 1,
      displayColors: true,
      callbacks: {
        label: function(context) {
          const value = context.parsed?.y || context.raw || 0;
          return `${context.dataset.label}: ${formatCurrency(value)}`;
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Time Period',
        font: {
          size: 12,
          weight: 'bold',
        },
      },
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Amount (₹)',
        font: {
          size: 12,
          weight: 'bold',
        },
      },
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        callback: function(value) {
          return formatCurrency(value);
        },
      },
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart',
  },
};

function Dashboard({ user, setUser }) {
  // --- Dashboard Home Data State ---
  const [dashboardStats, setDashboardStats] = useState({
    monthlyBudget: null,
    savings: null,
    spent: null,
    goalsProgress: null,
    loading: true
  });

  // --- Goals Modal State ---
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [userGoals, setUserGoals] = useState([]);

  // --- Time period state for analytics ---
  const [selectedTimeRange, setSelectedTimeRange] = useState('3months');

  // --- Analytics Data State ---
  const [analyticsData, setAnalyticsData] = useState({
    spendingTrends: [],
    categoryBreakdown: {},
    loading: true
  });

  // --- Import Notification State ---
  const [importNotification, setImportNotification] = useState(null);
  
  // --- Refresh key for components that need to update on transaction changes ---
  const [refreshKey, setRefreshKey] = useState(0);

  // Create reusable function for fetching dashboard stats
  const fetchDashboardStats = useCallback(async (timeRange = selectedTimeRange) => {
    if (!user) return;
    setDashboardStats((s) => ({ ...s, loading: true }));
    const dataService = new FirebaseDataService();
    try {
      // Fetch budget
      const budget = await dataService.getBudget();
      // Fetch goals data
      const goals = await dataService.getGoals();
      console.log('📊 Fetched goals:', goals);
      setUserGoals(goals || []);
      
      // Fetch spending summary for multiple periods to show comprehensive data
      const apiTimeRange = periodToApiFormat(timeRange);
      const currentMonthSummary = await dataService.fetchSpendingSummary('month');
      const selectedPeriodSummary = await dataService.fetchSpendingSummary(apiTimeRange);
      const allTimeSummary = await dataService.getTransactions(); // Get all transactions for comprehensive view
      
      // Calculate total spending from all transactions
      const totalAllTimeSpent = allTimeSummary.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const totalTransactionCount = allTimeSummary.length;
      
      // Use selected period as the primary metric
      const spent = selectedPeriodSummary?.total_spent || 0;
      const monthlyBudget = budget?.monthlyBudget || 0;
      
      // Calculate period-adjusted budget for savings calculation - Fix the period mapping
      const periodDaysMapping = {
        '30days': 30,
        '3months': 90,
        '6months': 180,
        '1year': 365,
        'month': 30,
        'quarter': 90,
        'year': 365
      };
      const apiPeriodDays = periodDaysMapping[apiTimeRange] || 30;
      const monthlyDays = 30;
      const periodBudget = monthlyBudget > 0 ? (monthlyBudget * apiPeriodDays / monthlyDays) : 0;
      const savings = periodBudget > 0 ? Math.max(periodBudget - spent, 0) : null;
      
      // Goals progress based on actual goals data
      let goalsProgress = null;
      let goalsSaved = 0;
      let goalsTarget = 0;
      
      if (goals && goals.length > 0) {
        goalsSaved = goals.reduce((sum, goal) => sum + (Number(goal.saved) || 0), 0);
        goalsTarget = goals.reduce((sum, goal) => sum + (Number(goal.target) || 0), 0);
        goalsProgress = goalsTarget > 0 ? Math.round((goalsSaved / goalsTarget) * 100) : 0;
        
        console.log('📊 Goals Progress Calculation:', {
          goalsCount: goals.length,
          goalsSaved,
          goalsTarget,
          goalsProgress: `${goalsProgress}%`
        });
      } else {
        console.log('📊 No goals found for progress calculation');
      }

      // Calculate category breakdown for selected period - use consistent period calculation
      const categoryBreakdown = {};
      const now = new Date();
      const categoryPeriodDays = periodDaysMapping[timeRange] || 30;
      const periodStartDate = new Date(now.getTime() - categoryPeriodDays * 24 * 60 * 60 * 1000);
      
      allTimeSummary
        .filter(tx => {
          const txDate = new Date(tx.date);
          return txDate >= periodStartDate && txDate <= now;
        })
        .forEach(tx => {
          const category = tx.category || 'Other';
          categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (tx.amount || 0);
        });

      // Get top 3 categories for selected period
      const topCategories = Object.entries(categoryBreakdown)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category, amount]) => ({ category, amount }));

      // Check if selected period is significantly different from total all time
      const shouldShowSelectedPeriod = totalAllTimeSpent > 0 && 
        Math.abs(spent - totalAllTimeSpent) / totalAllTimeSpent > 0.1; // 10% difference threshold
      
      setDashboardStats({
        monthlyBudget,
        savings,
        spent, // Selected period spending
        currentMonthSpent: currentMonthSummary?.total_spent || 0,
        totalAllTimeSpent,
        totalTransactionCount,
        currentMonthTransactions: currentMonthSummary?.transaction_count || 0,
        selectedPeriodTransactions: selectedPeriodSummary?.transaction_count || 0,
        goalsProgress,
        goalsSaved,
        goalsTarget,
        topCategories,
        shouldShowSelectedPeriod,
        loading: false
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setDashboardStats((s) => ({ ...s, loading: false }));
    }
  }, [user, selectedTimeRange, setUserGoals]);

  // Fetch analytics data for charts
  const fetchAnalyticsData = useCallback(async (timeRange = selectedTimeRange) => {
    if (!user) return;
    setAnalyticsData((prev) => ({ ...prev, loading: true }));
    
    try {
      const dataService = new FirebaseDataService();
      const apiTimeRange = periodToApiFormat(timeRange);
      
      // Get spending summary for category breakdown
      const spendingSummary = await dataService.fetchSpendingSummary(apiTimeRange);
      
      // Get all transactions for trend analysis
      const allTransactions = await dataService.getTransactions();
      
      // Generate trend data (last 6 months)
      const trendData = generateTrendData(allTransactions, timeRange);
      
      setAnalyticsData({
        spendingTrends: trendData,
        categoryBreakdown: spendingSummary?.categories || {},
        loading: false
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsData((prev) => ({ ...prev, loading: false }));
    }
  }, [user, selectedTimeRange]);

  // Generate trend data from transactions
  const generateTrendData = (transactions, timeRange) => {
    const now = new Date();
    const periods = timeRange === '30days' ? 30 : timeRange === '3months' ? 90 : 180;
    const startDate = new Date(now.getTime() - periods * 24 * 60 * 60 * 1000);
    
    // Filter transactions within the time range
    const recentTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= now;
    });
    
    // Group by week or month based on time range
    const groupBy = timeRange === '30days' ? 'week' : 'month';
    const trendMap = new Map();
    
    recentTransactions.forEach(tx => {
      const txDate = new Date(tx.date);
      let key;
      
      if (groupBy === 'week') {
        // Group by week
        const weekStart = new Date(txDate);
        weekStart.setDate(txDate.getDate() - txDate.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        // Group by month
        key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!trendMap.has(key)) {
        trendMap.set(key, 0);
      }
      const currentAmount = Number(tx.amount) || 0;
      trendMap.set(key, trendMap.get(key) + currentAmount);
    });
    
    // Convert to array and sort by date
    return Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  };

  // Chart data using useMemo for performance
  const trendChartData = useMemo(() => {
    if (!analyticsData.spendingTrends || analyticsData.spendingTrends.length === 0) {
      return null;
    }
    
    return {
      labels: analyticsData.spendingTrends.map(item => {
        const date = new Date(item.date);
        return selectedTimeRange === '30days' 
          ? date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      }),
      datasets: [
        {
          label: 'Spending',
          data: analyticsData.spendingTrends.map(item => Number(item.amount) || 0),
          borderColor: 'rgb(20, 184, 166)',
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(20, 184, 166)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };
  }, [analyticsData.spendingTrends, selectedTimeRange]);

  const categoryChartData = useMemo(() => {
    const categories = analyticsData.categoryBreakdown;
    if (!categories || Object.keys(categories).length === 0) {
      return null;
    }
    
    const entries = Object.entries(categories)
      .filter(([k, v]) => v && typeof v.total === 'number' && v.total > 0)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 6);

    if (!entries.length) return null;

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40'
    ];

    return {
      labels: entries.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [
        {
          data: entries.map(([, v]) => Number(v.total) || 0),
          backgroundColor: colors.slice(0, entries.length),
          borderColor: colors.slice(0, entries.length).map(color => color + '80'),
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [analyticsData.categoryBreakdown]);

  useEffect(() => {
    fetchDashboardStats();
    fetchAnalyticsData();
  }, [fetchDashboardStats, fetchAnalyticsData]);

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
      selectedPeriodTransactions, 
      goalsProgress,
      goalsSaved,
      goalsTarget,
      topCategories,
      shouldShowSelectedPeriod,
      loading 
    } = dashboardStats;
    const [editMode, setEditMode] = useState(false);
    const [budgetInput, setBudgetInput] = useState(monthlyBudget || '');
    const [saveStatus, setSaveStatus] = useState(null);
    const [showMoreInsights, setShowMoreInsights] = useState(false);

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
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Hand className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user.email?.split('@')[0]}!
                </h2>
              </div>
              <p className="text-gray-600">
                Here's your financial overview for {getPeriodDescription(selectedTimeRange)}.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <TimeSelector 
                value={selectedTimeRange}
                onChange={(newRange) => {
                  setSelectedTimeRange(newRange);
                  fetchDashboardStats(newRange);
                }}
                label="Analytics Period"
                variant="outlined"
                size="sm"
              />
              {loading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm">Updating...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary KPI Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hero KPI 1: Selected Period Spending with Semantic Color Coding */}
          {(() => {
            // Calculate budget utilization based on selected period vs monthly budget
            // For periods longer than a month, we'll calculate a pro-rated budget
            const periodDaysMapping = {
              '30days': 30,
              '3months': 90,
              '6months': 180,
              '1year': 365,
              'month': 30,
              'quarter': 90,
              'year': 365
            };
            const periodDays = periodDaysMapping[selectedTimeRange] || 30;
            const monthlyDays = 30;
            const periodBudget = monthlyBudget > 0 ? (monthlyBudget * periodDays / monthlyDays) : 0;
            const budgetUtilization = periodBudget > 0 && spent ? 
              (spent / periodBudget) * 100 : 0;
            
            // Semantic color coding based on budget utilization
            const getSpendingStatus = () => {
              if (budgetUtilization <= 70) return 'good'; // Green - Under budget
              if (budgetUtilization <= 90) return 'warning'; // Amber - Near limit
              return 'danger'; // Red - Overshoot
            };
            
            const spendingStatus = getSpendingStatus();
            
            const statusConfig = {
              good: {
                bg: 'bg-gradient-to-br from-green-50 to-green-100',
                border: 'border-green-200',
                stripe: 'bg-green-50/50',
                icon: 'bg-green-600',
                badge: 'bg-green-100/80 text-green-700',
                text: 'text-green-700',
                textBold: 'text-green-900',
                progress: 'bg-green-600',
                progressBg: 'bg-green-200',
                dot: 'bg-green-500'
              },
              warning: {
                bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
                border: 'border-amber-200',
                stripe: 'bg-amber-50/50',
                icon: 'bg-amber-600',
                badge: 'bg-amber-100/80 text-amber-700',
                text: 'text-amber-700',
                textBold: 'text-amber-900',
                progress: 'bg-amber-600',
                progressBg: 'bg-amber-200',
                dot: 'bg-amber-500'
              },
              danger: {
                bg: 'bg-gradient-to-br from-red-50 to-red-100',
                border: 'border-red-200',
                stripe: 'bg-red-50/50',
                icon: 'bg-red-600',
                badge: 'bg-red-100/80 text-red-700',
                text: 'text-red-700',
                textBold: 'text-red-900',
                progress: 'bg-red-600',
                progressBg: 'bg-red-200',
                dot: 'bg-red-500'
              }
            };
            
            const config = statusConfig[spendingStatus];
            
            return (
              <div className={`${config.bg} rounded-2xl shadow-xl border-2 ${config.border} p-8 transform transition-all hover:scale-105 relative overflow-hidden`}>
                {/* Background Stripe Pattern */}
                <div className={`absolute inset-0 ${config.stripe} opacity-30`}
                     style={{
                       backgroundImage: `repeating-linear-gradient(
                         45deg,
                         transparent,
                         transparent 10px,
                         rgba(255,255,255,0.1) 10px,
                         rgba(255,255,255,0.1) 20px
                       )`
                     }}
                ></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${config.icon} p-3 rounded-xl`}>
                      <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <div className={`${config.badge} px-3 py-1 rounded-full`}>
                      <span className="text-sm font-medium">
                        {spendingStatus === 'good' ? 'On Track' : 
                         spendingStatus === 'warning' ? 'Near Limit' : 'Over Budget'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-lg font-medium ${config.text} mb-2`}>{getPeriodDescription(selectedTimeRange)} Spent</p>
                    <p className={`text-5xl font-bold ${config.textBold} mb-2`}>
                      {loading ? (
                        <span className={`${config.text} opacity-60`}>Loading...</span>
                      ) : (
                        spent !== null ? `₹${spent.toLocaleString('en-IN')}` : 'N/A'
                      )}
                    </p>
                    {!loading && selectedPeriodTransactions > 0 && (
                      <p className={`text-base ${config.text} flex items-center gap-2`}>
                        <span className={`w-2 h-2 ${config.dot} rounded-full`}></span>
                        {selectedPeriodTransactions} transactions recorded
                      </p>
                    )}
                    
                    {/* Category Breakdown */}
                    {!loading && topCategories && topCategories.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className={`text-sm font-medium ${config.text}`}>Top Categories:</p>
                        {topCategories.map((cat, index) => (
                          <div key={cat.category} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                index === 0 ? config.icon.replace('bg-', 'bg-') : 
                                index === 1 ? config.progress : config.dot
                              }`}></div>
                              <span className={`text-sm font-medium ${config.textBold}`}>{cat.category}</span>
                            </div>
                            <span className={`text-sm font-bold ${config.textBold}`}>
                              ₹{cat.amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Budget Progress Bar with Semantic Colors */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className={`flex-1 ${config.progressBg} rounded-full h-2`}>
                        <div 
                          className={`${config.progress} h-2 rounded-full transition-all duration-300`}
                          style={{ 
                            width: periodBudget > 0 && spent ? 
                              `${Math.min(100, (spent / periodBudget) * 100)}%` : '0%' 
                          }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${config.text}`}>
                        {periodBudget > 0 && spent ? 
                          `${Math.round((spent / periodBudget) * 100)}%` : '0%'} of {getPeriodDescription(selectedTimeRange).toLowerCase()} budget
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Hero KPI 2: Savings with Semantic Color Coding */}
          {(() => {
            // Calculate period budget for savings calculation
            const periodDays = selectedTimeRange === '30days' ? 30 : selectedTimeRange === '3months' ? 90 : selectedTimeRange === '6months' ? 180 : selectedTimeRange === '1year' ? 365 : 30;
            const monthlyDays = 30;
            const periodBudget = monthlyBudget > 0 ? (monthlyBudget * periodDays / monthlyDays) : 0;
            const savingsRate = periodBudget > 0 && savings !== null ? 
              (savings / periodBudget) * 100 : 0;
            
            // Semantic color coding for savings
            const getSavingsStatus = () => {
              if (savings === null || monthlyBudget === 0) return 'neutral';
              if (savings <= 0) return 'danger'; // Red - No savings or overspent
              if (savingsRate >= 20) return 'excellent'; // Dark green - Excellent savings
              if (savingsRate >= 10) return 'good'; // Green - Good savings
              return 'fair'; // Light green - Fair savings
            };
            
            const savingsStatus = getSavingsStatus();
            
            const savingsConfig = {
              excellent: {
                bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
                border: 'border-emerald-200',
                stripe: 'bg-emerald-50/50',
                icon: 'bg-emerald-600',
                badge: 'bg-emerald-100/80 text-emerald-700',
                text: 'text-emerald-700',
                textBold: 'text-emerald-900',
                budgetBg: 'bg-white/70',
                budgetBorder: 'border-emerald-200',
                budgetFocus: 'focus:ring-emerald-400',
                budgetHover: 'hover:border-emerald-300',
                dot: 'bg-emerald-500'
              },
              good: {
                bg: 'bg-gradient-to-br from-green-50 to-green-100',
                border: 'border-green-200',
                stripe: 'bg-green-50/50',
                icon: 'bg-green-600',
                badge: 'bg-green-100/80 text-green-700',
                text: 'text-green-700',
                textBold: 'text-green-900',
                budgetBg: 'bg-white/70',
                budgetBorder: 'border-green-200',
                budgetFocus: 'focus:ring-green-400',
                budgetHover: 'hover:border-green-300',
                dot: 'bg-green-500'
              },
              fair: {
                bg: 'bg-gradient-to-br from-lime-50 to-lime-100',
                border: 'border-lime-200',
                stripe: 'bg-lime-50/50',
                icon: 'bg-lime-600',
                badge: 'bg-lime-100/80 text-lime-700',
                text: 'text-lime-700',
                textBold: 'text-lime-900',
                budgetBg: 'bg-white/70',
                budgetBorder: 'border-lime-200',
                budgetFocus: 'focus:ring-lime-400',
                budgetHover: 'hover:border-lime-300',
                dot: 'bg-lime-500'
              },
              danger: {
                bg: 'bg-gradient-to-br from-red-50 to-red-100',
                border: 'border-red-200',
                stripe: 'bg-red-50/50',
                icon: 'bg-red-600',
                badge: 'bg-red-100/80 text-red-700',
                text: 'text-red-700',
                textBold: 'text-red-900',
                budgetBg: 'bg-white/70',
                budgetBorder: 'border-red-200',
                budgetFocus: 'focus:ring-red-400',
                budgetHover: 'hover:border-red-300',
                dot: 'bg-red-500'
              },
              neutral: {
                bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
                border: 'border-gray-200',
                stripe: 'bg-gray-50/50',
                icon: 'bg-gray-600',
                badge: 'bg-gray-100/80 text-gray-700',
                text: 'text-gray-700',
                textBold: 'text-gray-900',
                budgetBg: 'bg-white/70',
                budgetBorder: 'border-gray-200',
                budgetFocus: 'focus:ring-gray-400',
                budgetHover: 'hover:border-gray-300',
                dot: 'bg-gray-500'
              }
            };
            
            const config = savingsConfig[savingsStatus];
            
            const getSavingsStatusText = () => {
              switch (savingsStatus) {
                case 'excellent': return 'Excellent';
                case 'good': return 'Good Savings';
                case 'fair': return 'Fair Savings';
                case 'danger': return 'No Savings';
                default: return 'Set Budget';
              }
            };
            
            return (
              <div className={`${config.bg} rounded-2xl shadow-xl border-2 ${config.border} p-8 transform transition-all hover:scale-105 relative overflow-hidden`}>
                {/* Background Stripe Pattern */}
                <div className={`absolute inset-0 ${config.stripe} opacity-30`}
                     style={{
                       backgroundImage: `repeating-linear-gradient(
                         45deg,
                         transparent,
                         transparent 10px,
                         rgba(255,255,255,0.1) 10px,
                         rgba(255,255,255,0.1) 20px
                       )`
                     }}
                ></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${config.icon} p-3 rounded-xl`}>
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div className={`${config.badge} px-3 py-1 rounded-full`}>
                      <span className="text-sm font-medium">{getSavingsStatusText()}</span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-lg font-medium ${config.text} mb-2`}>{getPeriodDescription(selectedTimeRange)} Savings</p>
                    <p className={`text-5xl font-bold ${config.textBold} mb-2`}>
                      {loading ? (
                        <span className={`${config.text} opacity-60`}>Loading...</span>
                      ) : (
                        savings !== null ? `₹${savings.toLocaleString('en-IN')}` : 'N/A'
                      )}
                    </p>
                    <div className={`flex items-center gap-2 text-base ${config.text}`}>
                      <span className={`w-2 h-2 ${config.dot} rounded-full`}></span>
                      {savings !== null && periodBudget > 0 ? (
                        savings > 0 ? 
                          `Saved ${Math.round((savings / periodBudget) * 100)}% of ${getPeriodDescription(selectedTimeRange).toLowerCase()} budget` :
                          `Budget exceeded for ${getPeriodDescription(selectedTimeRange).toLowerCase()}`
                      ) : 'Set budget to track savings'}
                    </div>
                    
                    {/* Budget Editor Inline */}
                    <div className={`mt-4 p-3 ${config.budgetBg} rounded-lg`}>
                      <p className={`text-sm font-medium ${config.text} mb-2`}>Monthly Budget</p>
                      {editMode ? (
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
                            className={`border ${config.budgetBorder} rounded-lg px-3 py-1 text-lg font-semibold ${config.budgetFocus} outline-none transition-all bg-white`}
                            value={budgetInput}
                            onChange={e => setBudgetInput(e.target.value)}
                            autoFocus
                            aria-label="Monthly Budget"
                          />
                          <button
                            type="submit"
                            className={`${config.text} hover:opacity-80 p-2 rounded-full focus:outline-none disabled:opacity-60 bg-white shadow-sm`}
                            disabled={saveStatus === 'saving' || budgetInput === ''}
                            aria-label="Save budget"
                          >
                            {saveStatus === 'saving' ? (
                              <span className={`animate-spin inline-block w-5 h-5 border-2 ${config.textBold.replace('text-', 'border-')} border-t-transparent rounded-full`}></span>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            )}
                          </button>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-600 p-2 rounded-full focus:outline-none bg-white shadow-sm"
                            onClick={() => setEditMode(false)}
                            disabled={saveStatus === 'saving'}
                            aria-label="Cancel edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          {saveStatus === 'success' && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className={`${config.text} text-sm`}>Saved</span>
                            </div>
                          )}
                          {saveStatus === 'error' && <span className="text-red-600 text-sm ml-1">Error</span>}
                        </form>
                      ) : (
                        <button
                          className={`flex items-center gap-2 group bg-white/80 hover:bg-white rounded-lg px-3 py-2 transition-all border ${config.budgetBorder} ${config.budgetHover}`}
                          onClick={handleBudgetEdit}
                          aria-label="Edit budget"
                        >
                          <span className={`text-lg font-semibold ${config.textBold}`}>
                            {monthlyBudget !== null ? `₹${monthlyBudget.toLocaleString('en-IN')}` : 'Set Budget'}
                          </span>
                          <svg className={`w-4 h-4 ${config.text} group-hover:opacity-80`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Secondary Metrics - Collapsible */}
        <div className="mb-8">
          <button
            onClick={() => setShowMoreInsights(!showMoreInsights)}
            className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-4 border border-gray-200 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-600 p-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">More Insights</h3>
                  <p className="text-sm text-gray-600">Additional spending metrics and analytics</p>
                </div>
              </div>
              <div className={`transform transition-transform duration-200 ${showMoreInsights ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>
          
          {showMoreInsights && (
            <div className="mt-4 space-y-4 animate-fade-in">
              {/* Rationalized Secondary KPIs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Only show Selected Period if it's significantly different from current month */}
                {shouldShowSelectedPeriod && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg shadow-sm border border-amber-200 p-4 hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* Subtle stripe background */}
                    <div className="absolute inset-0 bg-amber-50/30 opacity-50"
                         style={{
                           backgroundImage: `repeating-linear-gradient(
                             45deg,
                             transparent,
                             transparent 8px,
                             rgba(255,255,255,0.2) 8px,
                             rgba(255,255,255,0.2) 16px
                           )`
                         }}
                    ></div>
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-800">{getPeriodDescription(selectedTimeRange)} Total</p>
                        <p className="text-xl font-bold text-amber-900">
                          {loading ? (
                            <span className="text-amber-500">Loading...</span>
                          ) : (
                            spent !== null ? `₹${spent.toLocaleString('en-IN')}` : 'N/A'
                          )}
                        </p>
                        {!loading && selectedPeriodTransactions > 0 && (
                          <p className="text-xs text-amber-600">
                            {selectedPeriodTransactions} transactions
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Historical Context - Only show if user has significant transaction history */}
                {totalTransactionCount > 50 && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-sm border border-purple-200 p-4 hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* Subtle stripe background */}
                    <div className="absolute inset-0 bg-purple-50/30 opacity-50"
                         style={{
                           backgroundImage: `repeating-linear-gradient(
                             45deg,
                             transparent,
                             transparent 8px,
                             rgba(255,255,255,0.2) 8px,
                             rgba(255,255,255,0.2) 16px
                           )`
                         }}
                    ></div>
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">Historical Average</p>
                        <p className="text-xl font-bold text-purple-900">
                          {loading ? (
                            <span className="text-purple-500">Loading...</span>
                          ) : (
                            totalAllTimeSpent && totalTransactionCount > 0 ? 
                              `₹${Math.round(totalAllTimeSpent / (totalTransactionCount / 30)).toLocaleString('en-IN')}/month` : 'N/A'
                          )}
                        </p>
                        {!loading && totalTransactionCount > 0 && (
                          <p className="text-xs text-purple-600">
                            Based on {totalTransactionCount} transactions
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Goals Progress - Enhanced with Radial Progress */}
                {(goalsProgress !== null || userGoals.length > 0 || true) && ( // Always show to encourage goal setting
                  <div className={`rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer ${
                    userGoals.length === 0 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200' :
                    goalsProgress > 100 ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' :
                    goalsProgress > 80 ? 'bg-gradient-to-r from-yellow-50 to-amber-100 border-amber-200' :
                    'bg-gradient-to-r from-teal-50 to-blue-100 border-teal-200'
                  }`}
                  onClick={() => userGoals.length > 0 ? setShowGoalsModal(true) : window.location.href = '/dashboard/goals'}
                  >
                    {/* Semantic stripe background */}
                    <div className={`absolute inset-0 opacity-40 ${
                      userGoals.length === 0 ? 'bg-gray-50/30' :
                      goalsProgress > 100 ? 'bg-red-50/30' :
                      goalsProgress > 80 ? 'bg-amber-50/30' :
                      'bg-teal-50/30'
                    }`}
                         style={{
                           backgroundImage: `repeating-linear-gradient(
                             45deg,
                             transparent,
                             transparent 8px,
                             rgba(255,255,255,0.2) 8px,
                             rgba(255,255,255,0.2) 16px
                           )`
                         }}
                    ></div>
                    <div className="relative z-10 flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        userGoals.length === 0 ? 'bg-gray-100' :
                        goalsProgress > 100 ? 'bg-red-100' :
                        goalsProgress > 80 ? 'bg-amber-100' :
                        'bg-teal-100'
                      }`}>
                        <Target className="w-5 h-5 text-current" />
                      </div>
                      
                      {/* Content and Radial Progress */}
                      <div className="flex-1 flex items-center justify-between pr-16">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            userGoals.length === 0 ? 'text-gray-800' :
                            goalsProgress > 100 ? 'text-red-800' :
                            goalsProgress > 80 ? 'text-amber-800' :
                            'text-teal-800'
                          }`}>Goals Progress</p>
                          <p className={`text-lg font-bold ${
                            userGoals.length === 0 ? 'text-gray-900' :
                            goalsProgress > 100 ? 'text-red-900' :
                            goalsProgress > 80 ? 'text-amber-900' :
                            'text-teal-900'
                          }`}>
                            {userGoals.length > 0 ? 
                              `${userGoals.length} Active Goal${userGoals.length !== 1 ? 's' : ''}` : 
                              'Set Your First Goal'
                            }
                          </p>
                          {goalsSaved !== undefined && goalsTarget !== undefined && goalsTarget > 0 ? (
                            <p className={`text-xs ${
                              goalsProgress > 100 ? 'text-red-600' :
                              goalsProgress > 80 ? 'text-amber-600' :
                              'text-teal-600'
                            } mt-1 break-all`}>
                              {formatCurrency(goalsSaved)} of {formatCurrency(goalsTarget)} saved
                            </p>
                          ) : userGoals.length > 0 ? (
                            <p className="text-xs text-gray-600 mt-1">
                              Click to view goal details
                            </p>
                          ) : (
                            <p className="text-xs text-gray-600 mt-1">
                              Start tracking your financial goals
                            </p>
                          )}
                        </div>
                        
                        {(goalsProgress !== null && userGoals.length > 0) ? (
                          <div className="flex-shrink-0 ml-4">
                            <RadialProgress
                              percentage={goalsProgress}
                              size={80}
                              strokeWidth={6}
                              color={
                                goalsProgress > 100 ? 'red' :
                                goalsProgress > 80 ? 'amber' :
                                'teal'
                              }
                              saved={goalsSaved || 0}
                              target={goalsTarget || 100}
                              onClick={() => userGoals.length > 0 ? setShowGoalsModal(true) : window.location.href = '/dashboard/goals'}
                            />
                          </div>
                        ) : (
                          <div className={`w-20 h-20 rounded-full border-4 border-dashed flex items-center justify-center flex-shrink-0 ml-4 ${
                            userGoals.length === 0 ? 'border-gray-300 text-gray-400' : 'border-teal-300 text-teal-500'
                          }`}>
                            <span className="text-2xl">+</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Click hint */}
                    <div className="absolute top-2 right-2">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        userGoals.length === 0 ? 'bg-gray-200 text-gray-700' :
                        goalsProgress > 100 ? 'bg-red-200 text-red-700' :
                        goalsProgress > 80 ? 'bg-amber-200 text-amber-700' :
                        'bg-teal-200 text-teal-700'
                      }`}>
                        Click to {userGoals.length > 0 ? 'view' : 'add goals'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Smart Insights - Enhanced with better semantic coding */}
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg shadow-sm border border-teal-200 p-4 hover:shadow-md transition-shadow relative overflow-hidden">
                  {/* Subtle stripe background */}
                  <div className="absolute inset-0 bg-teal-50/30 opacity-50"
                       style={{
                         backgroundImage: `repeating-linear-gradient(
                           45deg,
                           transparent,
                           transparent 8px,
                           rgba(255,255,255,0.2) 8px,
                           rgba(255,255,255,0.2) 16px
                         )`
                       }}
                  ></div>
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-teal-100 p-2 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-teal-700">Smart Insight</p>
                      <p className="text-sm font-semibold text-teal-900">
                        {loading ? (
                          <span className="text-teal-500">Loading...</span>
                        ) : (
                          spent !== null && monthlyBudget > 0 ? (
                            (() => {
                              const periodDays = selectedTimeRange === '30days' ? 30 : selectedTimeRange === '3months' ? 90 : selectedTimeRange === '6months' ? 180 : selectedTimeRange === '1year' ? 365 : 30;
                              const monthlyDays = 30;
                              const periodBudget = monthlyBudget * periodDays / monthlyDays;
                              return spent > periodBudget ? 
                                `₹${(spent - periodBudget).toLocaleString('en-IN')} over ${getPeriodDescription(selectedTimeRange).toLowerCase()} budget` :
                                `₹${(periodBudget - spent).toLocaleString('en-IN')} left to spend for ${getPeriodDescription(selectedTimeRange).toLowerCase()}`;
                            })()
                          ) : (
                            'Set a budget to get insights'
                          )
                        )}
                      </p>
                      {!loading && spent !== null && monthlyBudget > 0 && (
                        <p className="text-xs text-teal-600 mt-1">
                          {(() => {
                            const periodDays = selectedTimeRange === '30days' ? 30 : selectedTimeRange === '3months' ? 90 : selectedTimeRange === '6months' ? 180 : selectedTimeRange === '1year' ? 365 : 30;
                            const monthlyDays = 30;
                            const periodBudget = monthlyBudget * periodDays / monthlyDays;
                            const remainingDays = Math.max(1, periodDays - (selectedPeriodTransactions > 0 ? Math.round(periodDays / 4) : 0));
                            
                            return spent > periodBudget ? 
                              'Consider reviewing your spending patterns' :
                              `Daily avg: ₹${Math.round((periodBudget - spent) / remainingDays).toLocaleString('en-IN')} for remaining ${getPeriodDescription(selectedTimeRange).toLowerCase()}`;
                          })()
                        }</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Dashboard Analytics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              Real-Time Analytics
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Period:</span>
              <TimeSelector 
                value={selectedTimeRange} 
                onChange={setSelectedTimeRange}
                showLabel={false}
                size="sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Trend Chart */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Spending Trends</h4>
              <div className="h-64">
                {analyticsData.loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : trendChartData ? (
                  <Line data={trendChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg inline-block mb-2">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm mt-2">No data available</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {analyticsData.loading ? 'Loading...' : `${getPeriodDescription(selectedTimeRange)} spending trends`}
              </p>
            </div>

            {/* Category Breakdown Chart */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Category Breakdown</h4>
              <div className="h-64">
                {analyticsData.loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : categoryChartData ? (
                  <Doughnut data={categoryChartData} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 10,
                          font: {
                            size: 10,
                          },
                        },
                      },
                    },
                  }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg inline-block mb-2">
                        <Pizza className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm mt-2">No category data</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                {analyticsData.loading ? 'Loading categories...' : 'Live category breakdown from your transactions'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } // End of DashboardHome function

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} setUser={setUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} setUser={setUser} />
        
        {/* Import Success Notification */}
        {importNotification && (
          <div className={`mx-8 mt-4 p-4 rounded-xl border animate-slide-down shadow-sm ${
            importNotification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-md ${
                  importNotification.type === 'success' 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  {importNotification.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{importNotification.message}</h4>
                  {importNotification.description && (
                    <p className="text-sm mt-1 opacity-75">{importNotification.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setImportNotification(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Routes>
              <Route path="/" element={<DashboardHome user={user} />} />
              <Route path="/quick-actions" element={<QuickActions />} />
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

      {/* Goals Modal */}
      <GoalsModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        goals={userGoals}
      />
    </div>
  );
}

export default Dashboard;
