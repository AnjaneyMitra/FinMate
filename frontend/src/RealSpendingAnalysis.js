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
import { Calendar, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Clock, LineChart, AreaChart, Target } from 'lucide-react';

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

// Chart.js default options with enhanced styling
const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2.5,
  layout: {
    padding: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        boxWidth: 12,
        boxHeight: 12,
        font: {
          size: 12,
          family: 'Inter, sans-serif',
          weight: '500',
        },
        color: '#374151',
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#14b8a6',
      borderWidth: 2,
      displayColors: true,
      cornerRadius: 8,
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 12,
      },
      padding: 12,
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
          size: 14,
          weight: 'bold',
          family: 'Inter, sans-serif',
        },
        color: '#374151',
      },
      grid: {
        display: true,
        color: 'rgba(20, 184, 166, 0.1)',
        drawOnChartArea: true,
        drawTicks: true,
        tickLength: 8,
        offset: false,
      },
      ticks: {
        maxTicksLimit: 10,
        padding: 10,
        font: {
          size: 11,
          family: 'Inter, sans-serif',
        },
        color: '#6b7280',
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Amount (₹)',
        font: {
          size: 14,
          weight: 'bold',
          family: 'Inter, sans-serif',
        },
        color: '#374151',
      },
      grid: {
        display: true,
        color: 'rgba(20, 184, 166, 0.1)',
        drawOnChartArea: true,
        drawTicks: true,
        tickLength: 8,
        offset: false,
      },
      ticks: {
        maxTicksLimit: 8,
        padding: 10,
        font: {
          size: 11,
          family: 'Inter, sans-serif',
        },
        color: '#6b7280',
        callback: function(value) {
          return formatCurrency(value);
        },
      },
      beginAtZero: true,
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  },
  animation: {
    duration: 1500,
    easing: 'easeInOutQuart',
  },
  elements: {
    point: {
      radius: 5,
      hoverRadius: 8,
      borderWidth: 2,
      hoverBorderWidth: 3,
    },
    line: {
      tension: 0.4,
      borderWidth: 3,
    },
    bar: {
      borderRadius: 6,
      borderSkipped: false,
    },
  },
};

// Enhanced color palettes for different chart types
const colorPalettes = {
  primary: [
    'rgba(20, 184, 166, 0.8)',   // Teal
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(245, 158, 11, 0.8)',   // Amber
    'rgba(239, 68, 68, 0.8)',    // Red
    'rgba(139, 92, 246, 0.8)',   // Purple
    'rgba(34, 197, 94, 0.8)',    // Green
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(156, 163, 175, 0.8)',  // Gray
  ],
  borders: [
    'rgb(20, 184, 166)',   // Teal
    'rgb(59, 130, 246)',   // Blue
    'rgb(245, 158, 11)',   // Amber
    'rgb(239, 68, 68)',    // Red
    'rgb(139, 92, 246)',   // Purple
    'rgb(34, 197, 94)',    // Green
    'rgb(236, 72, 153)',   // Pink
    'rgb(156, 163, 175)',  // Gray
  ],
  gradients: [
    'linear-gradient(180deg, rgba(20, 184, 166, 0.8) 0%, rgba(20, 184, 166, 0.2) 100%)',
    'linear-gradient(180deg, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.2) 100%)',
    'linear-gradient(180deg, rgba(245, 158, 11, 0.8) 0%, rgba(245, 158, 11, 0.2) 100%)',
    'linear-gradient(180deg, rgba(239, 68, 68, 0.8) 0%, rgba(239, 68, 68, 0.2) 100%)',
    'linear-gradient(180deg, rgba(139, 92, 246, 0.8) 0%, rgba(139, 92, 246, 0.2) 100%)',
    'linear-gradient(180deg, rgba(34, 197, 94, 0.8) 0%, rgba(34, 197, 94, 0.2) 100%)',
  ],
};

// Helper function to create gradient backgrounds
const createGradient = (ctx, color1, color2) => {
  if (!ctx) return color1;
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
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
  const [chartType, setChartType] = useState({
    trends: 'line',
    categories: 'doughnut',
    comparison: 'bar'
  }); // Chart type for each section

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
          borderColor: colorPalettes.borders[0], // Teal
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: colorPalettes.borders[0],
          pointBorderColor: '#ffffff',
          pointBorderWidth: 3,
          pointHoverBorderWidth: 4,
          borderWidth: 3,
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

    return {
      labels: entries.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [
        {
          label: 'Spending by Category',
          data: entries.map(([, v]) => v.total),
          backgroundColor: colorPalettes.primary.slice(0, entries.length),
          borderColor: colorPalettes.borders.slice(0, entries.length),
          borderWidth: 2,
          hoverOffset: 4,
          hoverBorderWidth: 3,
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
          backgroundColor: colorPalettes.primary[0], // Teal
          borderColor: colorPalettes.borders[0],
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Previous Period',
          data: entries.map(([, v]) => v.total * (0.8 + Math.random() * 0.4)), // Mock previous period data
          backgroundColor: colorPalettes.primary[1], // Blue
          borderColor: colorPalettes.borders[1],
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
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
          <div className="flex items-center space-x-4">
            {/* Chart Section Selector */}
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
        </div>

        {/* Chart Type Selectors */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Visualization Type:</span>
          </div>
          <div className="flex items-center space-x-4">
            {activeChart === 'trends' && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartType({...chartType, trends: 'line'})}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    chartType.trends === 'line' 
                      ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <LineChart className="w-4 h-4 mr-2 inline" />
                  Line
                </button>
                <button
                  onClick={() => setChartType({...chartType, trends: 'area'})}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    chartType.trends === 'area' 
                      ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <AreaChart className="w-4 h-4 mr-2 inline" />
                  Area
                </button>
                <button
                  onClick={() => setChartType({...chartType, trends: 'bar'})}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    chartType.trends === 'bar' 
                      ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2 inline" />
                  Bar
                </button>
              </div>
            )}
            {activeChart === 'categories' && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartType({...chartType, categories: 'doughnut'})}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    chartType.categories === 'doughnut' 
                      ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <PieChart className="w-4 h-4 mr-2 inline" />
                  Doughnut
                </button>
                <button
                  onClick={() => setChartType({...chartType, categories: 'pie'})}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    chartType.categories === 'pie' 
                      ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Target className="w-4 h-4 mr-2 inline" />
                  Pie
                </button>
                <button
                  onClick={() => setChartType({...chartType, categories: 'bar'})}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    chartType.categories === 'bar' 
                      ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2 inline" />
                  Bar
                </button>
              </div>
            )}
            {activeChart === 'comparison' && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartType({...chartType, comparison: 'bar'})}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    chartType.comparison === 'bar' 
                      ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2 inline" />
                  Bar
                </button>
                <button
                  onClick={() => setChartType({...chartType, comparison: 'line'})}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    chartType.comparison === 'line' 
                      ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <LineChart className="w-4 h-4 mr-2 inline" />
                  Line
                </button>
                <button
                  onClick={() => setChartType({...chartType, comparison: 'stacked'})}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    chartType.comparison === 'stacked' 
                      ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Activity className="w-4 h-4 mr-2 inline" />
                  Stacked
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="h-96 relative">
          {activeChart === 'trends' && trendChartWithBudget && (
            <div className="h-full">
              <h4 className="text-lg font-medium text-gray-800 mb-4">
                Spending Trends Over Time
                {budgetAnalysis?.monthlyBudget && (
                  <span className="text-sm text-gray-600 ml-2">
                    (with daily budget line at {formatCurrency(budgetAnalysis.monthlyBudget / 30)})
                  </span>
                )}
              </h4>
              <div className="h-80">
                {chartType.trends === 'line' && <Line data={trendChartWithBudget} options={chartOptions} />}
                {chartType.trends === 'area' && <Line data={{
                  ...trendChartWithBudget,
                  datasets: trendChartWithBudget.datasets.map((dataset, index) => ({
                    ...dataset,
                    fill: index === 0 ? 'origin' : false,
                    backgroundColor: index === 0 ? 'rgba(20, 184, 166, 0.3)' : dataset.backgroundColor,
                    borderColor: index === 0 ? 'rgb(20, 184, 166)' : dataset.borderColor,
                  }))
                }} options={chartOptions} />}
                {chartType.trends === 'bar' && <Bar data={{
                  ...trendChartWithBudget,
                  datasets: trendChartWithBudget.datasets.map((dataset, index) => ({
                    ...dataset,
                    backgroundColor: index === 0 
                      ? 'linear-gradient(180deg, rgba(20, 184, 166, 0.8) 0%, rgba(20, 184, 166, 0.4) 100%)'
                      : dataset.backgroundColor,
                    borderColor: index === 0 ? 'rgb(20, 184, 166)' : dataset.borderColor,
                  }))
                }} options={chartOptions} />}
              </div>
            </div>
          )}

          {activeChart === 'categories' && categoryChartData && (
            <div className="h-full">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Category Distribution</h4>
              <div className="h-80">
                {chartType.categories === 'doughnut' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    <div className="h-full">
                      <Doughnut 
                        data={{
                          ...categoryChartData,
                          datasets: [{
                            ...categoryChartData.datasets[0],
                            backgroundColor: colorPalettes.primary.slice(0, categoryChartData.labels.length),
                            borderColor: colorPalettes.borders.slice(0, categoryChartData.labels.length),
                            borderWidth: 3,
                            hoverOffset: 8,
                          }]
                        }} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              position: 'right',
                              labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: {
                                  size: 12,
                                  family: 'Inter, sans-serif',
                                  weight: '500',
                                },
                              },
                            },
                          },
                        }} 
                      />
                    </div>
                    <div className="h-full">
                      <Bar 
                        data={{
                          ...categoryChartData,
                          datasets: [{
                            ...categoryChartData.datasets[0],
                            backgroundColor: colorPalettes.primary.slice(0, categoryChartData.labels.length),
                            borderColor: colorPalettes.borders.slice(0, categoryChartData.labels.length),
                            borderRadius: 8,
                            borderSkipped: false,
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
                {chartType.categories === 'pie' && (
                  <Pie 
                    data={{
                      ...categoryChartData,
                      datasets: [{
                        ...categoryChartData.datasets[0],
                        backgroundColor: colorPalettes.primary.slice(0, categoryChartData.labels.length).map(color => color.replace('0.8', '0.9')),
                        borderColor: '#ffffff',
                        borderWidth: 4,
                        hoverOffset: 6,
                      }]
                    }} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                              size: 12,
                              family: 'Inter, sans-serif',
                              weight: '500',
                            },
                          },
                        },
                      },
                    }} 
                  />
                )}
                {chartType.categories === 'bar' && (
                  <Bar 
                    data={{
                      ...categoryChartData,
                      datasets: [{
                        ...categoryChartData.datasets[0],
                        backgroundColor: colorPalettes.primary.slice(0, categoryChartData.labels.length),
                        borderColor: colorPalettes.borders.slice(0, categoryChartData.labels.length),
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                      }]
                    }} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false,
                        },
                      },
                    }} 
                  />
                )}
              </div>
            </div>
          )}

          {activeChart === 'comparison' && comparisonChartData && (
            <div className="h-full">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Period Comparison</h4>
              <div className="h-80">
                {chartType.comparison === 'bar' && (
                  <Bar 
                    data={{
                      ...comparisonChartData,
                      datasets: comparisonChartData.datasets.map((dataset, index) => ({
                        ...dataset,
                        backgroundColor: index === 0 
                          ? 'rgba(20, 184, 166, 0.8)' 
                          : 'rgba(99, 102, 241, 0.8)',
                        borderColor: index === 0 
                          ? 'rgb(20, 184, 166)' 
                          : 'rgb(99, 102, 241)',
                        borderRadius: 6,
                        borderSkipped: false,
                      }))
                    }} 
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
                )}
                {chartType.comparison === 'line' && (
                  <Line 
                    data={{
                      ...comparisonChartData,
                      datasets: comparisonChartData.datasets.map((dataset, index) => ({
                        ...dataset,
                        borderColor: index === 0 
                          ? 'rgb(20, 184, 166)' 
                          : 'rgb(99, 102, 241)',
                        backgroundColor: index === 0 
                          ? 'rgba(20, 184, 166, 0.1)' 
                          : 'rgba(99, 102, 241, 0.1)',
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: index === 0 
                          ? 'rgb(20, 184, 166)' 
                          : 'rgb(99, 102, 241)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                      }))
                    }} 
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
                )}
                {chartType.comparison === 'stacked' && (
                  <Bar 
                    data={{
                      ...comparisonChartData,
                      datasets: comparisonChartData.datasets.map((dataset, index) => ({
                        ...dataset,
                        backgroundColor: index === 0 
                          ? 'rgba(20, 184, 166, 0.8)' 
                          : 'rgba(99, 102, 241, 0.8)',
                        borderColor: index === 0 
                          ? 'rgb(20, 184, 166)' 
                          : 'rgb(99, 102, 241)',
                        borderRadius: {
                          topLeft: index === 1 ? 6 : 0,
                          topRight: index === 1 ? 6 : 0,
                          bottomLeft: index === 0 ? 6 : 0,
                          bottomRight: index === 0 ? 6 : 0,
                        },
                        borderSkipped: false,
                      }))
                    }} 
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        x: {
                          ...chartOptions.scales.x,
                          stacked: true,
                        },
                        y: {
                          ...chartOptions.scales.y,
                          stacked: true,
                        },
                      },
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          position: 'top',
                        },
                      },
                    }} 
                  />
                )}
              </div>
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

      {/* Chart Statistics and Visual Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Chart Performance Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Chart Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Chart</span>
              <span className="text-sm font-medium text-gray-900 capitalize">{activeChart}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Chart Type</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {chartType[activeChart]}
              </span>
            </div>
            {activeChart === 'categories' && categoryChartData && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Categories</span>
                <span className="text-sm font-medium text-gray-900">
                  {categoryChartData.labels.length}
                </span>
              </div>
            )}
            {activeChart === 'trends' && trendChartData && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Data Points</span>
                <span className="text-sm font-medium text-gray-900">
                  {trendChartData.labels.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chart Type Recommendations */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {activeChart === 'trends' && (
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <span className="font-medium text-teal-600">Line charts</span> show trends over time
                </p>
                <p className="mb-2">
                  <span className="font-medium text-purple-600">Area charts</span> emphasize volume
                </p>
                <p>
                  <span className="font-medium text-blue-600">Bar charts</span> compare discrete periods
                </p>
              </div>
            )}
            {activeChart === 'categories' && (
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <span className="font-medium text-teal-600">Doughnut</span> shows proportions with center space
                </p>
                <p className="mb-2">
                  <span className="font-medium text-purple-600">Pie charts</span> display part-to-whole relationships
                </p>
                <p>
                  <span className="font-medium text-blue-600">Bar charts</span> compare exact values
                </p>
              </div>
            )}
            {activeChart === 'comparison' && (
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <span className="font-medium text-teal-600">Bar charts</span> compare side-by-side
                </p>
                <p className="mb-2">
                  <span className="font-medium text-purple-600">Line charts</span> show trends across periods
                </p>
                <p>
                  <span className="font-medium text-blue-600">Stacked</span> shows cumulative totals
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Visual Theme Preview */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-orange-600" />
            Color Palette
          </h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-3">Current theme colors:</div>
            <div className="flex flex-wrap gap-2">
              {colorPalettes.primary.slice(0, 6).map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                  title={`Color ${index + 1}`}
                />
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Enhanced with gradients and hover effects
            </div>
          </div>
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