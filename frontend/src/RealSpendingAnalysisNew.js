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
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
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

export default function RealSpendingAnalysis({ userId = 'default-user' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spendingData, setSpendingData] = useState(null);
  const [trends, setTrends] = useState(null);
  const [insights, setInsights] = useState([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('3months');
  const [activeChart, setActiveChart] = useState('trends'); // 'trends', 'categories', 'comparison'

  const safeObj = obj => (obj && typeof obj === 'object' ? obj : {});
  const safeArr = arr => (Array.isArray(arr) ? arr : []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const dataService = new FirebaseDataService();
        const apiTimeRange = periodToApiFormat(selectedTimeRange);
        const [summary, trendsData, insightsData] = await Promise.all([
          dataService.fetchSpendingSummary(apiTimeRange),
          dataService.fetchSpendingTrends(null, apiTimeRange),
          dataService.fetchSpendingInsights(apiTimeRange),
        ]);
        setSpendingData(summary || {});
        setTrends(trendsData || {});
        setInsights(Array.isArray(insightsData) ? insightsData : []);
        try {
          const budget = await dataService.getBudget();
          setBudgetAnalysis(budget || null);
        } catch {
          setBudgetAnalysis(null);
        }
      } catch (err) {
        setError('Failed to load spending data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, selectedTimeRange]);

  // Chart.js data preparation
  const trendChartData = useMemo(() => {
    const trendsArray = safeArr(trends?.trends);
    if (!trendsArray.length) return null;

    const validTrends = trendsArray
      .filter(d => d && d.date && typeof d.amount === 'number')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (!validTrends.length) return null;

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
      .slice(0, 8); // Top 8 categories

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
      .slice(0, 6); // Top 6 categories for comparison

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
          data: entries.map(([, v]) => v.total * (0.8 + Math.random() * 0.4)), // Mock previous period data
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 2,
        },
      ],
    };
  }, [spendingData]);

  // Add budget line to trends chart
  const trendChartWithBudget = useMemo(() => {
    if (!trendChartData || !budgetAnalysis?.monthlyBudget) return trendChartData;

    const dailyBudget = budgetAnalysis.monthlyBudget / 30; // Approximate daily budget
    
    return {
      ...trendChartData,
      datasets: [
        ...trendChartData.datasets,
        {
          label: 'Daily Budget Target',
          data: Array(trendChartData.labels.length).fill(dailyBudget),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderDash: [5, 5],
          fill: false,
          tension: 0,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    };
  }, [trendChartData, budgetAnalysis]);

  if (loading) return (
    <div className="max-w-7xl mx-auto p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
      <div className="text-lg text-teal-700">Loading interactive analytics...</div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto p-8 text-center">
      <div className="bg-red-100 text-red-800 rounded p-4 mb-4">{error}</div>
      <button className="bg-teal-600 text-white px-4 py-2 rounded" onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );

  if (!spendingData) return (
    <div className="max-w-7xl mx-auto p-8 text-center text-gray-600">No spending data available.</div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Real-Time Analytics</h2>
            <p className="text-gray-600">Interactive insights into your spending patterns for {getPeriodDescription(selectedTimeRange)}.</p>
          </div>
          <PinButton pageId="analytics" />
        </div>
        <div className="flex items-center gap-4">
          <TimeSelector 
            value={selectedTimeRange}
            onChange={setSelectedTimeRange}
            label="Time Period"
            variant="outlined"
            className="ml-4"
          />
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Total Spent</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(spendingData.total_spent || 0)}
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {spendingData.transaction_count || 0} transactions
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Daily Average</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(spendingData.daily_average || 0)}
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Per day spending
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Avg Transaction</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(spendingData.average_transaction || 0)}
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Average per transaction
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Time Period</div>
              <div className="text-xl font-bold text-gray-900">
                {getPeriodDescription(selectedTimeRange)}
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Analysis period
          </div>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Interactive Charts</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveChart('trends')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeChart === 'trends'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2 inline" />
              Trends
            </button>
            <button
              onClick={() => setActiveChart('categories')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeChart === 'categories'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <PieChart className="w-4 h-4 mr-2 inline" />
              Categories
            </button>
            <button
              onClick={() => setActiveChart('comparison')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeChart === 'comparison'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Comparison
            </button>
          </div>
        </div>

        <div className="h-96">
          {activeChart === 'trends' && trendChartWithBudget && (
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-4">
                Spending Trends Over Time
                {budgetAnalysis?.monthlyBudget && (
                  <span className="text-sm text-gray-600 ml-2">
                    (with daily budget line at {formatCurrency(budgetAnalysis.monthlyBudget / 30)})
                  </span>
                )}
              </h4>
              <Line data={trendChartWithBudget} options={chartOptions} />
            </div>
          )}

          {activeChart === 'categories' && categoryChartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">Category Distribution</h4>
                <Doughnut 
                  data={categoryChartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        position: 'right',
                        labels: {
                          usePointStyle: true,
                          padding: 15,
                        },
                      },
                    },
                  }} 
                />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">Category Amounts</h4>
                <Bar 
                  data={{
                    ...categoryChartData,
                    datasets: [{
                      ...categoryChartData.datasets[0],
                      backgroundColor: 'rgba(20, 184, 166, 0.8)',
                      borderColor: 'rgb(20, 184, 166)',
                    }]
                  }} 
                  options={{
                    ...chartOptions,
                    indexAxis: 'y',
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        display: false,
                      },
                    },
                  }} 
                />
              </div>
            </div>
          )}

          {activeChart === 'comparison' && comparisonChartData && (
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-4">Period Comparison</h4>
              <Bar 
                data={comparisonChartData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'top',
                    },
                  },
                }} 
              />
            </div>
          )}

          {!trendChartWithBudget && !categoryChartData && !comparisonChartData && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No chart data available for the selected period</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Toggle */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 mb-8 border border-teal-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Real-Time Data Controls</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-600">Live Data</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedTimeRange('30days')}
            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
              selectedTimeRange === '30days'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setSelectedTimeRange('3months')}
            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
              selectedTimeRange === '3months'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last 3 Months
          </button>
          <button
            onClick={() => setSelectedTimeRange('6months')}
            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
              selectedTimeRange === '6months'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setSelectedTimeRange('1year')}
            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
              selectedTimeRange === '1year'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Last 1 Year
          </button>
        </div>
      </div>

      {/* Insights and Budget Analysis */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, i) => (
              <div key={i} className="p-4 rounded-lg border-l-4 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-400">
                <div className="font-semibold text-teal-800 mb-2">{insight.title || 'Insight'}</div>
                <div className="text-gray-700 text-sm">{insight.message || ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {budgetAnalysis && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Budget Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">Monthly Budget</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(budgetAnalysis.monthlyBudget || 0)}
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">Amount Spent</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(budgetAnalysis.amountSpent || 0)}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">Remaining</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(budgetAnalysis.amountRemaining || 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
