import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, BarChart3, Calculator } from 'lucide-react';
import { auth } from './firebase';
import PinButton from './components/PinButton';
import TimeSelector from './components/TimeSelector';
import { getPeriodDescription } from './utils/timeUtils';

const MonthComparison = () => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(['2025-05', '2025-06']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('6months'); // New time range filter

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

  const fetchComparison = async () => {
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
  };

  useEffect(() => {
    fetchComparison();
  }, [selectedMonths, selectedCategory, timeRangeFilter]); // Add timeRangeFilter dependency

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

  const handleTimeRangeChange = (range) => {
    setTimeRangeFilter(range);
    
    const endDate = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '1week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        return;
    }
    
    const newSelectedMonths = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const value = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      newSelectedMonths.push(value);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    setSelectedMonths(newSelectedMonths);
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
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-indigo-600" />
                Month-to-Month Comparison
                <Calculator className="w-6 h-6 text-orange-500" />
              </h1>
              <p className="text-gray-700">
                Compare your spending patterns across different months with detailed breakdowns
              </p>
            </div>
            <PinButton pageId="comparison" />
          </div>
          
          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Range Filter */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Available Time Range</h3>
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
              <p className="text-xs text-gray-500 mt-2">
                Showing months from {getPeriodDescription(timeRangeFilter)}
              </p>
            </div>

            {/* Month Selection */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Compare Months</h3>
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
                        className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                      >
                        ✕
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

          {/* Side-by-Side Bar Chart */}
          <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 mb-8">
            <div className="p-6">
              <h2 className="text-gray-900 text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-green-600" />
                Category-wise Comparison
              </h2>
              <ResponsiveContainer width="100%" height={400}>
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
                      color: '#1f2937'
                    }}
                  />
                  {selectedMonths.map((month, index) => (
                    <Bar 
                      key={month}
                      dataKey={`Month${index + 1}`}
                      fill={`hsl(${200 + index * 60}, 70%, 50%)`}
                      radius={[2, 2, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
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
