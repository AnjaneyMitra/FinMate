import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, BarChart3, Calculator, X, LineChart as LineChartIcon, AreaChart as AreaChartIcon, PieChart as PieChartIcon, Target, Activity } from 'lucide-react';
import { auth } from './firebase';
import PinButton from './components/PinButton';
import TimeSelector from './components/TimeSelector';
import { getPeriodDescription } from './utils/timeUtils';
import { useTheme } from './contexts/ThemeContext';

// Enhanced color palettes for different chart types
const colorPalettes = {
  primary: [
    '#14b8a6',   // Teal
    '#3b82f6',   // Blue
    '#f59e0b',   // Amber
    '#ef4444',   // Red
    '#8b5cf6',   // Purple
    '#22c55e',   // Green
    '#ec4899',   // Pink
    '#9ca3af',   // Gray
  ],
  gradients: [
    'hsl(173, 80%, 40%)',  // Teal
    'hsl(217, 91%, 60%)',  // Blue
    'hsl(38, 92%, 50%)',   // Amber
    'hsl(0, 84%, 60%)',    // Red
    'hsl(251, 91%, 68%)',  // Purple
    'hsl(142, 76%, 47%)',  // Green
    'hsl(329, 81%, 61%)',  // Pink
    'hsl(218, 11%, 65%)',  // Gray
  ],
};

const MonthComparison = () => {
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

  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(['2025-05', '2025-06']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('6months'); // New time range filter
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'area', 'pie', 'stacked'

  // Generate month options based on selected time range
  const monthOptions = useMemo(() => {
    const options = [];
    const currentDate = new Date();
    
    // Determine how many months to show based on time range
    const monthsToShow = timeRangeFilter === 'lastMonth' ? 2 :
                       timeRangeFilter === '3months' ? 4 :
                       timeRangeFilter === '6months' ? 7 :
                       timeRangeFilter === 'currentYear' ? 12 :
                       timeRangeFilter === 'allTime' ? 24 : 12;
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, [timeRangeFilter]);

  const fetchComparison = useCallback(async () => {
    if (selectedMonths.length < 2) return;
    
    setLoading(true);
    setError(null);
    
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

      const response = await fetch('http://localhost:8000/compare-months-expenses', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          months: selectedMonths,
          category: selectedCategory === 'all' ? null : selectedCategory
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error('Failed to fetch comparison data');
      }
      
      const data = await response.json();
      console.log('Month Comparison API Response:', data); // Debug log
      setComparisonData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMonths, selectedCategory]);

  useEffect(() => {
    fetchComparison();
  }, [selectedMonths, selectedCategory, timeRangeFilter, fetchComparison]); // Add fetchComparison dependency

  // Prepare chart data for side-by-side comparison
  const chartData = useMemo(() => {
    if (!comparisonData?.comparison) return [];
    
    const categories = comparisonData.all_categories || [];
    const months = selectedMonths;
    
    console.log('Processing chart data:', { categories, months, comparisonData }); // Debug log
    
    return categories.map(category => {
      const dataPoint = { category: category.charAt(0).toUpperCase() + category.slice(1) };
      
      months.forEach((month, index) => {
        const monthData = comparisonData.comparison[month];
        const amount = monthData?.by_category?.[category] || 0;
        dataPoint[`Month${index + 1}`] = amount;
        dataPoint[`Month${index + 1}Name`] = monthData?.month_name || month;
      });
      
      return dataPoint;
    });
  }, [comparisonData, selectedMonths]);

  // Prepare pie chart data for total comparison
  const pieChartData = useMemo(() => {
    if (!comparisonData?.comparison || selectedMonths.length < 2) return [];
    
    return selectedMonths.map((month, index) => {
      const monthData = comparisonData.comparison[month];
      return {
        name: monthData?.month_name || month,
        value: monthData?.total || 0,
        fill: colorPalettes.primary[index % colorPalettes.primary.length],
      };
    });
  }, [comparisonData, selectedMonths]);

  const handleMonthChange = (index, value) => {
    const newMonths = [...selectedMonths];
    newMonths[index] = value;
    setSelectedMonths(newMonths);
  };

  const addMonth = () => {
    if (selectedMonths.length < 4) {
      setSelectedMonths([...selectedMonths, monthOptions[0].value]);
    }
  };

  const removeMonth = (index) => {
    if (selectedMonths.length > 2) {
      const newMonths = selectedMonths.filter((_, i) => i !== index);
      setSelectedMonths(newMonths);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-900 text-lg font-medium">Loading comparison data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-8 border-l-4 border-red-500">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-gray-900 text-xl font-bold mb-2">Comparison Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchComparison}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 ${safeBg.secondary} min-h-screen`}>
      {/* Header */}
      <div className="mb-8">
        <div className={`${safeBg.card} rounded-xl p-6 border ${safeBorder.accent}`}>
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className={`text-3xl font-bold ${safeText.primary} mb-2 flex items-center gap-3`}>
                <div className={`${safeAccent.primary} p-2 rounded-lg`}>
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                Month-to-Month Comparison
                <Calculator className={`w-6 h-6 ${safeText.accent}`} />
              </h1>
              <p className={`${safeText.secondary}`}>
                Compare your spending patterns across different months with detailed breakdowns
              </p>
            </div>
            <PinButton pageId="comparison" />
          </div>
          
          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Range Filter */}
            <div className={`${safeBg.card} rounded-lg p-4 border ${safeBorder.primary}`}>
              <h3 className={`text-sm font-medium ${safeText.primary} mb-3`}>Available Time Range</h3>
              <TimeSelector 
                value={timeRangeFilter}
                onChange={(newRange) => {
                  setTimeRangeFilter(newRange);
                  // Reset selected months when time range changes
                  const newOptions = monthOptions;
                  if (newOptions.length >= 2) {
                    setSelectedMonths([newOptions[newOptions.length - 2].value, newOptions[newOptions.length - 1].value]);
                  }
                }}
                label="Show months from"
                variant="default"
                size="sm"
              />
              <p className={`text-xs ${safeText.secondary} mt-2`}>
                Showing months from {getPeriodDescription(timeRangeFilter)}
              </p>
            </div>

            {/* Month Selection */}
            <div className={`${safeBg.card} rounded-lg p-4 border ${safeBorder.primary}`}>
              <h3 className={`text-sm font-medium ${safeText.primary} mb-3`}>Compare Months</h3>
              <div className="flex flex-wrap gap-4 items-center">
                {selectedMonths.map((month, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Month {index + 1}:
                    </label>
                    <select
                      value={month}
                      onChange={(e) => handleMonthChange(index, e.target.value)}
                      className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                      {monthOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {selectedMonths.length > 2 && (
                      <button
                        onClick={() => removeMonth(index)}
                        className="text-red-500 hover:text-red-700 px-2 py-1 rounded flex items-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                {selectedMonths.length < 4 && (
                  <button
                    onClick={addMonth}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                  >
                    + Add Month
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                <option value="all">All Categories</option>
                <option value="food">Food & Dining</option>
                <option value="transportation">Transportation</option>
                <option value="entertainment">Entertainment</option>
                <option value="shopping">Shopping</option>
                <option value="bills">Bills & Utilities</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="travel">Travel</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {comparisonData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {selectedMonths.map((month, index) => {
              const monthData = comparisonData.comparison[month];
              if (!monthData) return null;
              
              return (
                <div key={month} className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      <h3 className="text-gray-900 font-semibold">{monthData.month_name}</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">₹{monthData.total.toLocaleString('en-IN')}</p>
                    <p className="text-gray-600 text-sm">{monthData.transaction_count} transactions</p>
                    
                    {comparisonData.insights?.total_change && index === 1 && (
                      <div className={`flex items-center gap-1 mt-2 text-sm ${
                        comparisonData.insights.total_change.direction === 'increase' 
                          ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {comparisonData.insights.total_change.direction === 'increase' ? 
                          <ArrowUpRight className="w-4 h-4" /> : 
                          <ArrowDownRight className="w-4 h-4" />
                        }
                        {Math.abs(comparisonData.insights.total_change.percentage)}% vs prev month
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side-by-Side Chart with Type Selector */}
          <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 mb-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900 text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  Category-wise Comparison
                </h2>
                
                {/* Chart Type Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Chart Type:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        chartType === 'bar' 
                          ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 mr-2 inline" />
                      Bar
                    </button>
                    <button
                      onClick={() => setChartType('line')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        chartType === 'line' 
                          ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <LineChartIcon className="w-4 h-4 mr-2 inline" />
                      Line
                    </button>
                    <button
                      onClick={() => setChartType('area')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        chartType === 'area' 
                          ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <AreaChartIcon className="w-4 h-4 mr-2 inline" />
                      Area
                    </button>
                    <button
                      onClick={() => setChartType('pie')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        chartType === 'pie' 
                          ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <PieChartIcon className="w-4 h-4 mr-2 inline" />
                      Pie
                    </button>
                    <button
                      onClick={() => setChartType('stacked')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        chartType === 'stacked' 
                          ? 'bg-teal-600 text-white shadow-sm transform scale-105' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Activity className="w-4 h-4 mr-2 inline" />
                      Stacked
                    </button>
                  </div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={400}>
                {chartType === 'bar' && (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `₹${value.toLocaleString('en-IN')}`, 
                        chartData[0]?.[`${name}Name`] || name
                      ]}
                      labelFormatter={(label) => `Category: ${label}`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        color: '#1f2937',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    {selectedMonths.map((month, index) => (
                      <Bar 
                        key={month}
                        dataKey={`Month${index + 1}`}
                        fill={colorPalettes.primary[index % colorPalettes.primary.length]}
                        radius={[4, 4, 0, 0]}
                        name={comparisonData.comparison[month]?.month_name || month}
                      />
                    ))}
                  </BarChart>
                )}
                
                {chartType === 'line' && (
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `₹${value.toLocaleString('en-IN')}`, 
                        chartData[0]?.[`${name}Name`] || name
                      ]}
                      labelFormatter={(label) => `Category: ${label}`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        color: '#1f2937',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    {selectedMonths.map((month, index) => (
                      <Line 
                        key={month}
                        type="monotone"
                        dataKey={`Month${index + 1}`}
                        stroke={colorPalettes.primary[index % colorPalettes.primary.length]}
                        strokeWidth={3}
                        dot={{ r: 5, strokeWidth: 2 }}
                        activeDot={{ r: 7, strokeWidth: 2 }}
                        name={comparisonData.comparison[month]?.month_name || month}
                      />
                    ))}
                  </LineChart>
                )}
                
                {chartType === 'area' && (
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `₹${value.toLocaleString('en-IN')}`, 
                        chartData[0]?.[`${name}Name`] || name
                      ]}
                      labelFormatter={(label) => `Category: ${label}`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        color: '#1f2937',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    {selectedMonths.map((month, index) => (
                      <Area 
                        key={month}
                        type="monotone"
                        dataKey={`Month${index + 1}`}
                        stackId="1"
                        stroke={colorPalettes.primary[index % colorPalettes.primary.length]}
                        fill={colorPalettes.primary[index % colorPalettes.primary.length]}
                        fillOpacity={0.6}
                        strokeWidth={2}
                        name={comparisonData.comparison[month]?.month_name || month}
                      />
                    ))}
                  </AreaChart>
                )}
                
                {chartType === 'pie' && (
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={3}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Total Spending']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        color: '#1f2937',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                )}
                
                {chartType === 'stacked' && (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `₹${value.toLocaleString('en-IN')}`, 
                        chartData[0]?.[`${name}Name`] || name
                      ]}
                      labelFormatter={(label) => `Category: ${label}`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        color: '#1f2937',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    {selectedMonths.map((month, index) => (
                      <Bar 
                        key={month}
                        dataKey={`Month${index + 1}`}
                        stackId="months"
                        fill={colorPalettes.primary[index % colorPalettes.primary.length]}
                        name={comparisonData.comparison[month]?.month_name || month}
                      />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
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
                  <span className="text-sm text-gray-600">Chart Type</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{chartType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Months Compared</span>
                  <span className="text-sm font-medium text-gray-900">{selectedMonths.length}</span>
                </div>
                {chartData && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Categories</span>
                    <span className="text-sm font-medium text-gray-900">{chartData.length}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Filter</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                  </span>
                </div>
              </div>
            </div>

            {/* Chart Type Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Best Practices
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <span className="font-medium text-green-600">Bar charts</span> compare amounts across categories
                  </p>
                  <p className="mb-2">
                    <span className="font-medium text-blue-600">Line charts</span> show trends and patterns
                  </p>
                  <p className="mb-2">
                    <span className="font-medium text-purple-600">Area charts</span> emphasize volume differences
                  </p>
                  <p className="mb-2">
                    <span className="font-medium text-orange-600">Pie charts</span> show total spending distribution
                  </p>
                  <p>
                    <span className="font-medium text-teal-600">Stacked</span> reveals cumulative spending
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Theme Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-orange-600" />
                Color Palette
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-3">Month comparison colors:</div>
                <div className="flex flex-wrap gap-2">
                  {colorPalettes.primary.slice(0, Math.min(6, selectedMonths.length)).map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                      title={`Month ${index + 1} Color`}
                    />
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Enhanced with gradients and improved contrast
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="p-6">
              <h2 className="text-gray-900 text-xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-purple-600" />
                Detailed Breakdown
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      {selectedMonths.map(month => {
                        const monthData = comparisonData.comparison[month];
                        return (
                          <th key={month} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {monthData?.month_name}
                          </th>
                        );
                      })}
                      {comparisonData.insights?.category_changes && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comparisonData.all_categories?.map(category => (
                      <tr key={category} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </td>
                        {selectedMonths.map(month => {
                          const amount = comparisonData.comparison[month]?.by_category[category] || 0;
                          return (
                            <td key={month} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{amount.toLocaleString('en-IN')}
                            </td>
                          );
                        })}
                        {comparisonData.insights?.category_changes?.[category] && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`flex items-center gap-1 ${
                              comparisonData.insights.category_changes[category].direction === 'increase'
                                ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {comparisonData.insights.category_changes[category].direction === 'increase' ? 
                                <TrendingUp className="w-4 h-4" /> : 
                                <TrendingDown className="w-4 h-4" />
                              }
                              {Math.abs(comparisonData.insights.category_changes[category].percentage)}%
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          {comparisonData.insights?.total_change && (
            <div className="mt-8 bg-white rounded-lg shadow-md border-l-4 border-yellow-500">
              <div className="p-6">
                <h2 className="text-gray-900 text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                  Key Insights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Overall Spending</h3>
                    <p className="text-gray-700">
                      Your spending {comparisonData.insights.total_change.direction}d by{' '}
                      <span className={`font-bold ${
                        comparisonData.insights.total_change.direction === 'increase' 
                          ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ₹{Math.abs(comparisonData.insights.total_change.absolute).toLocaleString('en-IN')}
                      </span>{' '}
                      ({Math.abs(comparisonData.insights.total_change.percentage)}%) compared to the previous month.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Biggest Changes</h3>
                    <div className="space-y-1">
                      {Object.entries(comparisonData.insights.category_changes || {})
                        .sort((a, b) => Math.abs(b[1].percentage) - Math.abs(a[1].percentage))
                        .slice(0, 3)
                        .map(([category, change]) => (
                          <p key={category} className="text-sm text-gray-700">
                            <span className="font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}</span>: {' '}
                            <span className={change.direction === 'increase' ? 'text-red-600' : 'text-green-600'}>
                              {change.direction === 'increase' ? '+' : ''}{change.percentage}%
                            </span>
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MonthComparison;
