import React, { useState, useEffect, useMemo } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Rectangle } from 'recharts';
import FirebaseDataService from './services/FirebaseDataService';

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

  const safeObj = obj => (obj && typeof obj === 'object' ? obj : {});
  const safeArr = arr => (Array.isArray(arr) ? arr : []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const dataService = new FirebaseDataService();
        const [summary, trendsData, insightsData] = await Promise.all([
          dataService.fetchSpendingSummary(),
          dataService.fetchSpendingTrends(),
          dataService.fetchSpendingInsights(),
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
  }, [userId]);

  // Logging before every map/filter/forEach
  const pieChartData = useMemo(() => {
    const cats = safeObj(spendingData?.categories);
    // eslint-disable-next-line no-console
    console.log('pieChartData: categories', cats);
    const entries = Object.entries(cats);
    // eslint-disable-next-line no-console
    console.log('pieChartData: entries', entries);
    return entries
      .filter(([k, v]) => v && typeof v.total === 'number' && v.total > 0)
      .map(([k, v], i) => ({
        id: k,
        label: k.charAt(0).toUpperCase() + k.slice(1),
        value: v.total,
        color: `hsl(${i * 50},70%,50%)`,
      }));
  }, [spendingData]);

  const lineChartData = useMemo(() => {
    const arr = safeArr(trends?.trends);
    // eslint-disable-next-line no-console
    console.log('lineChartData: trends', arr);
    const filtered = arr.filter(d => d && d.date && typeof d.amount === 'number');
    // eslint-disable-next-line no-console
    console.log('lineChartData: filtered', filtered);
    return [{
      id: 'spending',
      data: filtered.map(d => ({ x: d.date, y: d.amount })),
    }];
  }, [trends]);

  const barChartData = useMemo(() => {
    // eslint-disable-next-line no-console
    console.log('barChartData: pieChartData', pieChartData);
    return pieChartData;
  }, [pieChartData]);

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
        <h2 className="text-3xl font-bold mb-2">Spending Analysis</h2>
        <p className="text-gray-600 mb-6">Interactive insights into your spending patterns.</p>
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
