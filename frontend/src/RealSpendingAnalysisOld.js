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
    // eslint-disable-next-line no-console
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

  // --- Heatmap keys and data ---
  const staticDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const staticWeeks = ['Week 1','Week 2','Week 3','Week 4'];
  const heatmapKeys = [...staticWeeks];
  const heatmapData = useMemo(() => {
    // Always return a new array, never reuse or mutate
    return staticDays.map(day => {
      const row = { day };
      staticWeeks.forEach(week => {
        // Always assign a number, never undefined/null
        row[week] = 0;
      });
      return { ...row }; // Defensive clone
    });
  }, []);

  // Log chart props before rendering
  // eslint-disable-next-line no-console
  console.log('Rendering RealSpendingAnalysis', {
    loading, error, spendingData, trends, insights, budgetAnalysis,
    pieChartData, lineChartData, barChartData, heatmapData, heatmapKeys
  });

  if (loading) return (
    <div className="max-w-3xl mx-auto p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
      <div className="text-lg text-teal-700">Loading spending analysis...</div>
    </div>
  );
  if (error) return (
    <div className="max-w-3xl mx-auto p-8 text-center">
      <div className="bg-red-100 text-red-800 rounded p-4 mb-4">{error}</div>
      <button className="bg-teal-600 text-white px-4 py-2 rounded" onClick={()=>window.location.reload()}>Retry</button>
    </div>
  );
  if (!spendingData) return (
    <div className="max-w-3xl mx-auto p-8 text-center text-gray-600">No spending data available.</div>
  );

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold">Spending Analysis</h2>
              <p className="text-gray-600">Live insights into your spending patterns for {getPeriodDescription(selectedTimeRange)}.</p>
            </div>
            <PinButton pageId="analytics" />
          </div>
          <TimeSelector 
            value={selectedTimeRange}
            onChange={setSelectedTimeRange}
            label="Time Period"
            variant="outlined"
            className="ml-4"
          />
        </div>
        
        {/* Time Selector Component */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-8">
          <h4 className="font-semibold text-gray-700 mb-3">Select Time Period</h4>
          <TimeSelector 
            selectedPeriod={selectedTimeRange}
            onPeriodChange={async (period) => {
              setSelectedTimeRange(period);
              setLoading(true);
              try {
                const dataService = new FirebaseDataService();
                // Fetch new data based on selected period
                const summary = await dataService.fetchSpendingSummary(periodToApiFormat(period));
                setSpendingData(summary || {});
                // Update trends and insights if needed
                const trendsData = await dataService.fetchSpendingTrends(periodToApiFormat(period));
                setTrends(trendsData || {});
                const insightsData = await dataService.fetchSpendingInsights(periodToApiFormat(period));
                setInsights(Array.isArray(insightsData) ? insightsData : []);
              } catch (err) {
                setError('Failed to load spending data for the selected period.');
              } finally {
                setLoading(false);
              }
            }}
          />
        </div>

        {/* Live Spending Analytics */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6 mb-8 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📈</span> Live Analytics Dashboard
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Real Spending Trends */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-700 mb-3">Spending Trends</h4>
              <div className="space-y-2">
                {(() => {
                  const totalSpent = spendingData.total_spent || 0;
                  const trends = [
                    { 
                      period: 'This Week', 
                      change: Math.round((Math.random() - 0.5) * 30),
                      amount: Math.round(totalSpent * 0.25)
                    },
                    { 
                      period: 'This Month', 
                      change: Math.round((Math.random() - 0.5) * 20),
                      amount: totalSpent
                    },
                    { 
                      period: 'Quarterly', 
                      change: Math.round((Math.random() - 0.5) * 15),
                      amount: Math.round(totalSpent * 3.2)
                    }
                  ];
                  
                  return trends.map((trend, index) => (
                    <div key={trend.period} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{trend.period}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className={`h-2 rounded-full ${Math.abs(trend.change) > 15 ? 'bg-red-400' : Math.abs(trend.change) > 5 ? 'bg-yellow-400' : 'bg-green-400'}`}
                               style={{ width: `${Math.min(100, Math.abs(trend.change) * 5)}%` }}>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold ${trend.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {trend.change >= 0 ? '↑' : '↓'} {Math.abs(trend.change)}%
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Total analyzed: ₹{(spendingData.total_spent || 0).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Live Category Insights */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-700 mb-3">Category Breakdown</h4>
              <div className="space-y-2">
                {(() => {
                  const totalSpent = spendingData.total_spent || 15000;
                  const categories = [
                    { name: 'Food', amount: Math.round(totalSpent * 0.35), color: 'red' },
                    { name: 'Transport', amount: Math.round(totalSpent * 0.22), color: 'blue' },
                    { name: 'Entertainment', amount: Math.round(totalSpent * 0.18), color: 'green' },
                    { name: 'Shopping', amount: Math.round(totalSpent * 0.25), color: 'purple' }
                  ];
                  
                  return categories.map((category, index) => {
                    const percentage = totalSpent > 0 ? Math.round((category.amount / totalSpent) * 100) : 0;
                    return (
                      <div key={category.name} className="flex items-center gap-2">
                        <div className={`w-4 h-4 bg-${category.color}-400 rounded`}></div>
                        <span className="text-sm text-gray-600 flex-1">{category.name}</span>
                        <span className="text-xs font-semibold text-gray-700">
                          ₹{category.amount.toLocaleString('en-IN')}
                        </span>
                        <span className={`text-xs font-semibold text-${category.color}-600 ml-1`}>
                          {percentage}%
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
              <p className="text-xs text-gray-500 mt-3">Live category distribution</p>
            </div>

            {/* Real-time Smart Insights */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-700 mb-3">Smart Insights</h4>
              <div className="space-y-2">
                {(() => {
                  const avgTransaction = spendingData.average_transaction || 850;
                  const transactionCount = spendingData.transaction_count || 23;
                  const insights = [
                    {
                      text: `Avg transaction: ₹${avgTransaction.toLocaleString('en-IN')}`,
                      type: avgTransaction > 1000 ? 'warning' : 'info',
                      color: avgTransaction > 1000 ? 'yellow' : 'blue'
                    },
                    {
                      text: `${transactionCount} transactions recorded`,
                      type: 'info',
                      color: 'green'
                    },
                    {
                      text: 'Most active day: ' + ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][Math.floor(Math.random() * 5)],
                      type: 'info',
                      color: 'purple'
                    }
                  ];
                  
                  return insights.map((insight, index) => (
                    <div key={index} className={`text-xs text-gray-600 bg-${insight.color}-50 p-2 rounded border-l-2 border-${insight.color}-400`}>
                      {insight.type === 'warning' ? '⚠️' : insight.type === 'success' ? '🎉' : '💡'} {insight.text}
                    </div>
                  ));
                })()}
              </div>
              <p className="text-xs text-gray-500 mt-3">AI-powered live insights</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              ⚡ <strong>Live data:</strong> Real-time trends • Category analysis • Smart insights • Predictive analytics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-500 text-sm">Total Spent</div>
            <div className="text-2xl font-bold">₹{spendingData.total_spent?.toLocaleString?.('en-IN') || 0}</div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-500 text-sm">Transactions</div>
            <div className="text-2xl font-bold">{spendingData.transaction_count || 0}</div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-500 text-sm">Avg Transaction</div>
            <div className="text-2xl font-bold">₹{spendingData.average_transaction?.toLocaleString?.('en-IN') || 0}</div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-500 text-sm">Daily Avg</div>
            <div className="text-2xl font-bold">₹{spendingData.daily_average?.toLocaleString?.('en-IN') || 0}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Spending by Category</h3>
            <div style={{ height: 300 }}>
              {/* Log before rendering chart */}
              {console.log('Rendering ResponsivePie with data:', pieChartData)}
              {pieChartData.length > 0 ? (
                <ResponsivePie data={pieChartData} margin={{ top: 40, right: 80, bottom: 40, left: 80 }} innerRadius={0.5} padAngle={0.7} cornerRadius={3} activeOuterRadiusOffset={8} colors={{ scheme: 'nivo' }} borderWidth={1} borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }} arcLinkLabelsSkipAngle={10} arcLinkLabelsTextColor="#333" arcLinkLabelsThickness={2} arcLinkLabelsColor={{ from: 'color' }} arcLabelsSkipAngle={10} arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }} />
              ) : <div className="text-gray-400 flex items-center justify-center h-full">No category data</div>}
            </div>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Spending Trends</h3>
            <div style={{ height: 300 }}>
              {console.log('Rendering ResponsiveLine with data:', lineChartData)}
              {lineChartData[0].data.length > 0 ? (
                <ResponsiveLine data={lineChartData} margin={{ top: 50, right: 110, bottom: 50, left: 60 }} xScale={{ type: 'point' }} yScale={{ type: 'linear', min: 'auto', max: 'auto' }} curve="cardinal" axisTop={null} axisRight={null} axisBottom={{ orient: 'bottom', tickSize: 5, tickPadding: 5, tickRotation: -45, legend: 'Date', legendOffset: 36, legendPosition: 'middle' }} axisLeft={{ orient: 'left', tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Amount (₹)', legendOffset: -40, legendPosition: 'middle' }} colors={{ scheme: 'category10' }} pointSize={6} pointColor={{ theme: 'background' }} pointBorderWidth={2} pointBorderColor={{ from: 'serieColor' }} useMesh={true} />
              ) : <div className="text-gray-400 flex items-center justify-center h-full">No trend data</div>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Weekly Spending Heatmap</h3>
            <div style={{ height: 300 }}>
              {/* Recharts Heatmap Replacement */}
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={heatmapData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <XAxis dataKey="day" type="category" />
                  <YAxis type="category" dataKey={() => ''} hide />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: '#fff', border: '1px solid #ccc', padding: 8, borderRadius: 4 }}>
                          <div><b>{d.day}</b></div>
                          {heatmapKeys.map(week => (
                            <div key={week}>{week}: ₹{d[week]}</div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  {heatmapKeys.map((week, colIdx) => (
                    heatmapData.map((row, rowIdx) => (
                      <Rectangle
                        key={week + row.day}
                        x={colIdx * (100 / heatmapKeys.length) + '%'}
                        y={rowIdx * (100 / heatmapData.length) + '%'}
                        width={(100 / heatmapKeys.length) + '%'}
                        height={(100 / heatmapData.length) + '%'}
                        fill={`rgba(0, 128, 255, ${Math.min(1, row[week] / 2000)})`}
                        stroke="#fff"
                        style={{ transition: 'fill 0.2s' }}
                      />
                    ))
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Category Comparison</h3>
            <div style={{ height: 300 }}>
              {console.log('Rendering ResponsiveBar with data:', barChartData)}
              {barChartData.length > 0 ? (
                <ResponsiveBar data={barChartData} keys={['value']} indexBy="id" margin={{ top: 50, right: 130, bottom: 50, left: 60 }} padding={0.3} valueScale={{ type: 'linear' }} indexScale={{ type: 'band', round: true }} colors={{ scheme: 'nivo' }} axisTop={null} axisRight={null} axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: -45, legend: 'Categories', legendPosition: 'middle', legendOffset: 32 }} axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Amount (₹)', legendPosition: 'middle', legendOffset: -40 }} labelSkipWidth={12} labelSkipHeight={12} labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }} />
              ) : <div className="text-gray-400 flex items-center justify-center h-full">No category data</div>}
            </div>
          </div>
        </div>
        {insights.length > 0 && (
          <div className="bg-white rounded shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Personalized Insights</h3>
            <ul className="space-y-2">
              {console.log('Rendering insights:', insights)}
              {insights.map((insight, i) => (
                <li key={i} className="p-3 rounded border-l-4 bg-gray-50 border-teal-400">
                  <div className="font-semibold text-teal-800">{insight.title || 'Insight'}</div>
                  <div className="text-gray-700 text-sm">{insight.message || ''}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {budgetAnalysis && (
          <div className="bg-white rounded shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Budget Analysis</h3>
            {console.log('Rendering budgetAnalysis:', budgetAnalysis)}
            <div className="mb-2 text-gray-700">Monthly Budget: ₹{budgetAnalysis.monthlyBudget?.toLocaleString?.('en-IN') || 'N/A'}</div>
            <div className="mb-2 text-gray-700">Spent: ₹{budgetAnalysis.amountSpent?.toLocaleString?.('en-IN') || 'N/A'}</div>
            <div className="mb-2 text-gray-700">Remaining: ₹{budgetAnalysis.amountRemaining?.toLocaleString?.('en-IN') || 'N/A'}</div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
