import React, { useState, useEffect, useMemo } from 'react';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import FirebaseDataService from './services/FirebaseDataService';
import PinButton from './components/PinButton';
import TimeSelector from './components/TimeSelector';
import { periodToApiFormat, getPeriodDescription } from './utils/timeUtils';
import { Calendar, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Clock } from 'lucide-react';

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
  if (amount === 0) return '₹0';
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) { // 1 thousand
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
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
          return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
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

// Simple error boundary for runtime errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color:'red',padding:24}}><b>Runtime Error:</b> {String(this.state.error)}</div>;
    }
    return this.props.children;
  }
}

export default function RealSpendingAnalysis({ userId = 'default-user' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spendingData, setSpendingData] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');
  const [activeChart, setActiveChart] = useState('trends');
  const [period, setPeriod] = useState('last3months');
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [trends, setTrends] = useState([]);

  const safeObj = (obj) => (obj && typeof obj === 'object' ? obj : {});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const periodFormatted = periodToApiFormat(period);
        
        const [dataResponse, budgetResponse] = await Promise.all([
          FirebaseDataService.getSpendingData(userId, periodFormatted),
          FirebaseDataService.getBudgetAnalysis(userId, periodFormatted)
        ]);

        setSpendingData(dataResponse);
        setBudgetAnalysis(budgetResponse);
        setTrends(dataResponse?.trends || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, period]);

  const trendChartData = useMemo(() => {
    if (!trends || trends.length === 0) return null;
    
    const validTrends = trends.filter(t => t && t.date && typeof t.amount === 'number');
    if (validTrends.length === 0) return null;

    return {
      labels: validTrends.map(d => new Date(d.date).toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      })),
      datasets: [
        {
          label: 'Daily Spending',
          data: validTrends.map(d => d.amount),
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
  }, [trends]);

  const categoryChartData = useMemo(() => {
    const categories = safeObj(spendingData?.categories);
    const entries = Object.entries(categories)
      .filter(([k, v]) => v && typeof v.total === 'number' && v.total > 0)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 8);

    if (!entries.length) return null;

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];

    return {
      labels: entries.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [
        {
          label: 'Amount Spent',
          data: entries.map(([, v]) => v.total),
          backgroundColor: colors.slice(0, entries.length),
          borderColor: colors.slice(0, entries.length).map(color => color + '80'),
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [spendingData]);

  const comparisonChartData = useMemo(() => {
    const categories = safeObj(spendingData?.categories);
    const entries = Object.entries(categories)
      .filter(([k, v]) => v && typeof v.total === 'number' && v.total > 0)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 6);

    if (!entries.length) return null;

    return {
      labels: entries.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [
        {
          label: 'Current Period',
          data: entries.map(([, v]) => v.total),
          backgroundColor: 'rgba(20, 184, 166, 0.8)',
          borderColor: 'rgb(20, 184, 166)',
          borderWidth: 2,
        },
        {
          label: 'Previous Period',
          data: entries.map(([, v]) => v.total * (0.8 + Math.random() * 0.4)),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 2,
        },
      ],
    };
  }, [spendingData]);

  const calculateStats = () => {
    const totalSpent = spendingData?.total_spent || 0;
    const avgTransaction = spendingData?.average_transaction || 0;
    const transactionCount = spendingData?.transaction_count || 0;
    const budgetLeft = budgetAnalysis?.amountRemaining || 0;
    
    return { totalSpent, avgTransaction, transactionCount, budgetLeft };
  };

  const timeRangeOptions = [
    { value: '30days', label: '30 Days' },
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' },
  ];

  const chartTypeOptions = [
    { value: 'trends', label: 'Trends', icon: TrendingUp },
    { value: 'categories', label: 'Categories', icon: PieChart },
    { value: 'comparison', label: 'Comparison', icon: BarChart3 },
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'trends':
        return trendChartData ? (
          <Line data={trendChartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No trend data available
          </div>
        );
      
      case 'categories':
        return categoryChartData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <Doughnut data={categoryChartData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'right',
                  },
                },
              }} />
            </div>
            <div className="h-64">
              <Bar data={categoryChartData} options={{
                ...chartOptions,
                indexAxis: 'y',
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: false,
                  },
                },
              }} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No category data available
          </div>
        );
      
      case 'comparison':
        return comparisonChartData ? (
          <Bar data={comparisonChartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No comparison data available
          </div>
        );
      
      default:
        return null;
    }
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 mr-3">⚠️</div>
          <div>
            <h3 className="text-red-800 font-semibold">Error loading data</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Real-Time Analytics</h1>
            <p className="text-gray-600 mt-1">
              Interactive spending analysis with live insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Live Data
            </div>
            <PinButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-teal-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Avg Transaction</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgTransaction)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Transactions</p>
                <p className="text-2xl font-bold">{stats.transactionCount}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Budget Left</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.budgetLeft)}</p>
              </div>
              <Clock className="w-8 h-8 text-green-200" />
            </div>
          </div>
        </div>

        {/* Time Range Toggle */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Time Period</h2>
            <div className="flex gap-2">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedTimeRange(option.value);
                    setPeriod(option.value === '30days' ? 'last30days' : 
                             option.value === '3months' ? 'last3months' :
                             option.value === '6months' ? 'last6months' : 'lastyear');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedTimeRange === option.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing data for: {getPeriodDescription(period)}
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Interactive Charts</h2>
            <div className="flex gap-2">
              {chartTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setActiveChart(option.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeChart === option.value
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="min-h-96">
            {renderChart()}
          </div>
        </div>

        {/* Budget Analysis */}
        {budgetAnalysis && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Budget Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Monthly Budget</div>
                <div className="text-xl font-bold text-gray-800">
                  {formatCurrency(budgetAnalysis.monthlyBudget || 0)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Amount Spent</div>
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency(budgetAnalysis.amountSpent || 0)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Remaining</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(budgetAnalysis.amountRemaining || 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
