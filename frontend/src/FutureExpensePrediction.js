import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, AlertTriangle, Target, Brain, Zap, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { auth } from './firebase';
import PinButton from './components/PinButton';
import TimeSelector from './components/TimeSelector';
import { getPeriodDescription } from './utils/timeUtils';
import { useTheme } from './contexts/ThemeContext';

const FutureExpensePrediction = () => {
  const themeContext = useTheme();
  const { bg, text, border, accent, currentTheme } = themeContext || {};
  
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

  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('3');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [dataLoadTimestamp, setDataLoadTimestamp] = useState(null);
  const [basePeriod, setBasePeriod] = useState('3months'); // Base period for historical data

  // Only run animation once when component first loads
  useEffect(() => {
    if (predictions && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
      setDataLoadTimestamp(new Date().toLocaleTimeString());
    }
  }, [predictions, hasInitiallyLoaded]);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    try {
      // Get Firebase auth token from current user
      let authToken = null;
      if (auth.currentUser) {
        authToken = await auth.currentUser.getIdToken();
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('http://localhost:8000/forecast-expenses', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          timeframe: parseInt(selectedTimeframe),
          category: selectedCategory === 'all' ? null : selectedCategory
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error('Failed to fetch predictions');
      }
      
      const data = await response.json();
      console.log('Forecast API Response:', data); // Debug log
      setPredictions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe, selectedCategory]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // Generate enhanced visualization data
  const chartData = useMemo(() => {
    if (!predictions || !predictions.forecast) return [];
    
    const processedData = predictions.forecast.map((item, index) => ({
      ...item,
      month: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      }),
      confidence: item.confidence || Math.max(0.7, 1 - (index * 0.05)), // Use provided confidence or calculate
      trend: index > 0 ? (item.predicted_amount > predictions.forecast[index-1].predicted_amount ? 'up' : 'down') : 'neutral'
    }));
    
    console.log('Processed chart data:', processedData); // Debug log
    return processedData;
  }, [predictions]);

  const categoryBreakdown = useMemo(() => {
    if (!predictions?.category_breakdown) return [];
    
    const processedCategories = Object.entries(predictions.category_breakdown).map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount: parseFloat(amount) || 0,
      color: `hsl(${Math.abs(category.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360}, 70%, 60%)`
    }));
    
    console.log('Processed category breakdown:', processedCategories); // Debug log
    return processedCategories;
  }, [predictions]);

  const insights = useMemo(() => {
    if (!predictions || !chartData.length) return [];
    
    const totalForecast = chartData.reduce((sum, item) => sum + (item.predicted_amount || 0), 0);
    const avgMonthly = totalForecast / chartData.length;
    const trend = chartData.length > 1 ? 
      (chartData[chartData.length - 1].predicted_amount > chartData[0].predicted_amount ? 'increasing' : 'decreasing') : 'stable';
    
    // Ensure model_accuracy exists and is a valid number
    const modelAccuracy = predictions.model_accuracy || 0.8;
    
    return [
      {
        icon: <Brain className="w-6 h-6" />,
        title: "AI Prediction Confidence",
        value: `${Math.round(modelAccuracy * 100)}%`,
        color: "text-teal-500",
        description: "Based on historical patterns"
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        title: "Spending Trend",
        value: trend.charAt(0).toUpperCase() + trend.slice(1),
        color: trend === 'increasing' ? "text-red-500" : "text-green-500",
        description: `${selectedTimeframe}-month outlook`
      },
      {
        icon: <span className="w-6 h-6 flex items-center justify-center font-bold text-xl">₹</span>,
        title: "Avg Monthly Forecast",
        value: `₹${avgMonthly.toFixed(0)}`,
        color: "text-blue-500",
        description: "Predicted average"
      },
      {
        icon: <Target className="w-6 h-6" />,
        title: "Peak Month",
        value: chartData.length > 0 ? chartData.reduce((max, item) => 
          (item.predicted_amount || 0) > (max.predicted_amount || 0) ? item : max
        ).month : 'N/A',
        color: "text-orange-500",
        description: "Highest spending period"
      }
    ];
  }, [predictions, chartData, selectedTimeframe]);

  const PredictionCard = ({ children, className = "", borderColor = "blue" }) => (
    <div className={`
      bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 
      ${className}
    `}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xl">
          <p className="text-gray-900 font-semibold">{label}</p>
          <p className="text-teal-600">
            Predicted: ₹{payload[0]?.value?.toFixed(2)}
          </p>
          {payload[0]?.payload?.confidence && (
            <p className="text-green-600 text-sm">
              Confidence: {(payload[0].payload.confidence * 100).toFixed(0)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-teal-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-teal-500 rounded-full animate-pulse"></div>
            </div>
            <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-teal-500 animate-pulse" />
          </div>
          <p className="text-gray-900 mt-4 text-lg font-medium">AI is analyzing your spending patterns...</p>
          <p className="text-gray-600 mt-2">Generating future predictions</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-red-200">
          <div className="text-center">
            <div className="p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-gray-900 text-xl font-bold mb-2">Prediction Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchPredictions}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  AI Expense Predictions
                  <div className="p-1 bg-yellow-100 rounded-full">
                    <Zap className="w-6 h-6 text-yellow-600" />
                  </div>
                </h1>
                <p className="text-gray-700">
                  Advanced machine learning insights for your future spending patterns
                  {dataLoadTimestamp && (
                    <span className="text-sm text-gray-600 ml-2">
                      • Updated at {dataLoadTimestamp}
                    </span>
                  )}
                </p>
              </div>
              <PinButton pageId="predictions" />
            </div>
            
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Base Period for Analysis */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <label className="block text-xs font-medium text-gray-600 mb-1">Base Analysis Period</label>
                <TimeSelector 
                  value={basePeriod}
                  onChange={setBasePeriod}
                  showLabel={false}
                  variant="default"
                  size="sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Historical data from {getPeriodDescription(basePeriod)}
                </p>
              </div>

              {/* Prediction Timeframe */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <label className="block text-xs font-medium text-gray-600 mb-1">Forecast Period</label>
                <select 
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm text-sm"
                >
                  <option value="3">Next 3 Months</option>
                  <option value="6">Next 6 Months</option>
                  <option value="12">Next 12 Months</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <label className="block text-xs font-medium text-gray-600 mb-1">Category Focus</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 shadow-sm text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="food">Food & Dining</option>
                  <option value="transportation">Transportation</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills & Utilities</option>
                </select>
              </div>
            </div>
          </div>

          {/* Key Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {insights.map((insight, index) => (
              <PredictionCard key={insight.title} borderColor={index % 2 === 0 ? "blue" : "purple"}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={insight.color}>
                    {insight.icon}
                  </div>
                  <h3 className="text-gray-900 font-semibold">{insight.title}</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</p>
                <p className="text-gray-600 text-sm">{insight.description}</p>
              </PredictionCard>
            ))}
          </div>
        </div>

        {/* Main Prediction Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <PredictionCard className="lg:col-span-2" borderColor="blue">
            <h2 className="text-gray-900 text-xl font-bold mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              Spending Forecast Timeline
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis 
                  stroke="#6b7280" 
                  tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="predicted_amount" 
                  stroke="#14b8a6" 
                  fillOpacity={1}
                  fill="url(#predictionGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#14b8a6', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Total Forecast</p>
                <p className="text-teal-600 font-bold text-lg">
                  ₹{chartData.reduce((sum, d) => sum + (d.predicted_amount || 0), 0).toFixed(0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Trend Direction</p>
                <p className={`font-bold text-lg flex items-center justify-center gap-1 ${
                  chartData.length > 1 && (chartData[chartData.length - 1].predicted_amount || 0) > (chartData[0].predicted_amount || 0)
                    ? 'text-red-600' : 'text-green-600'
                }`}>
                  {chartData.length > 1 && (chartData[chartData.length - 1].predicted_amount || 0) > (chartData[0].predicted_amount || 0)
                    ? <><TrendingUp className="w-4 h-4" />Increasing</> 
                    : <><TrendingDown className="w-4 h-4" />Decreasing</>
                  }
                </p>
              </div>
            </div>
          </PredictionCard>

          {/* Category Breakdown */}
          <PredictionCard borderColor="purple">
            <h2 className="text-gray-900 text-xl font-bold mb-4 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <PieChartIcon className="w-6 h-6 text-white" />
              </div>
              Category Breakdown
            </h2>
            {categoryBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={120}
                      paddingAngle={3}
                      dataKey="amount"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload;
                          const percentage = ((data.amount / categoryBreakdown.reduce((sum, item) => sum + item.amount, 0)) * 100).toFixed(1);
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: data.color }}
                                />
                                <p className="font-semibold text-gray-900">{data.category}</p>
                              </div>
                              <p className="text-purple-600 font-bold">₹{data.amount.toFixed(0)}</p>
                              <p className="text-gray-600 text-sm">{percentage}% of total</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Enhanced Category Legend */}
                <div className="mt-6 space-y-3 max-h-48 overflow-y-auto">
                  {categoryBreakdown
                    .sort((a, b) => b.amount - a.amount)
                    .map((category, index) => {
                      const totalAmount = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);
                      const percentage = ((category.amount / totalAmount) * 100).toFixed(1);
                      return (
                        <div key={category.category} className="group">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full shadow-sm" 
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="text-gray-700 font-medium">{category.category}</span>
                              </div>
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                                #{index + 1}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-900 font-bold">₹{category.amount.toFixed(0)}</div>
                              <div className="text-xs text-gray-500">{percentage}%</div>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-500 ease-out"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: category.color,
                                boxShadow: `0 0 4px ${category.color}50`
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {/* Summary Stats */}
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-purple-600 font-semibold">Total Categories</div>
                      <div className="text-gray-900 font-bold text-lg">{categoryBreakdown.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-600 font-semibold">Top Category</div>
                      <div className="text-gray-900 font-bold text-lg">
                        {categoryBreakdown.length > 0 
                          ? categoryBreakdown.reduce((max, item) => item.amount > max.amount ? item : max).category
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="p-3 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No category data available</p>
                <p className="text-gray-400 text-sm mt-1">Add some transactions to see category breakdown</p>
              </div>
            )}
          </PredictionCard>
        </div>

        {/* Monthly Amount Breakdown */}
        <PredictionCard borderColor="green">
          <h2 className="text-gray-900 text-xl font-bold mb-4 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            Monthly Spending Forecast
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`₹${value.toFixed(2)}`, 'Predicted Amount']}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#1f2937'
                }}
              />
              <Bar dataKey="predicted_amount" fill="#14b8a6" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${160 + index * 20}, 70%, 50%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Monthly Forecast Range</span>
              <span className="text-gray-900">
                ₹{Math.min(...chartData.map(d => d.predicted_amount || 0)).toFixed(0)} - 
                ₹{Math.max(...chartData.map(d => d.predicted_amount || 0)).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-600">Average Monthly</span>
              <span className="text-green-600">
                ₹{chartData.length > 0 ? (chartData.reduce((sum, d) => sum + (d.predicted_amount || 0), 0) / chartData.length).toFixed(0) : '0'}
              </span>
            </div>
          </div>
        </PredictionCard>

        {/* AI Model Info */}
        <PredictionCard className="mt-6" borderColor="purple">
          <div className="text-center">
            <div className="p-3 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-gray-900 text-lg font-bold mb-2">Powered by Advanced AI</h3>
            <p className="text-md text-gray-700 mb-4 text-center max-w-2xl mx-auto">
              Our advanced AI prediction engine analyzes your unique spending patterns using a custom-trained machine learning model, generating accurate future expense predictions. It's designed to adapt to your financial behavior over time.
            </p>
            <div className="flex justify-center space-x-6 text-sm font-semibold text-purple-700">
              <span className="flex items-center space-x-2">
                <i className="fas fa-brain text-purple-500"></i>
                <span>Custom ML Model</span>
              </span>
              <span className="flex items-center space-x-2">
                <i className="fas fa-chart-line text-green-500"></i>
                <span>Adaptive Learning</span>
              </span>
              <span className="flex items-center space-x-2">
                <i className="fas fa-magic text-blue-500"></i>
                <span>Pattern Recognition</span>
              </span>
            </div>
          </div>
        </PredictionCard>
      </div>
    </div>
  );
};

export default FutureExpensePrediction;
