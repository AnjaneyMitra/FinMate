import React, { useState } from "react";
import { ResponsiveLine } from '@nivo/line';
import { TrendingUp, DollarSign, Clock, Calculator, BarChart3, Target, Zap } from 'lucide-react';
import PinButton from './components/PinButton';
import { useTheme } from './contexts/ThemeContext';

// Simple compound interest simulation for demonstration
function calculateReturns(principal, rate, years, frequency) {
  const n = frequency === 'Yearly' ? 1 : frequency === 'Quarterly' ? 4 : 12;
  const r = rate / 100;
  return principal * Math.pow(1 + r / n, n * years);
}

function getProjectionData(principal, rate, years, frequency) {
  const n = frequency === 'Yearly' ? 1 : frequency === 'Quarterly' ? 4 : 12;
  const r = rate / 100;
  let data = [];
  for (let y = 0; y <= years; y++) {
    const value = principal * Math.pow(1 + r / n, n * y);
    data.push({ x: y, y: Math.round(value) });
  }
  return [{ id: 'Investment Value', data }];
}

export default function InvestmentSimulation() {
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

  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(5);
  const [frequency, setFrequency] = useState('Yearly');
  const [result, setResult] = useState(null);

  const handleSimulate = (e) => {
    e.preventDefault();
    const returns = calculateReturns(Number(principal), Number(rate), Number(years), frequency);
    setResult(returns);
  };

  const projectionData = getProjectionData(Number(principal), Number(rate), Number(years), frequency);

  return (
    <div className={`max-w-2xl mx-auto ${safeBg.card} rounded-xl shadow-sm p-8 mt-8 border ${safeBorder.primary}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-2 ${safeAccent.primary} rounded-lg`}>
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${safeText.primary}`}>Investment Simulation</h2>
          <PinButton pageId="simulation" />
        </div>
      </div>
      
      {/* Live Investment Calculator */}
      <div className={`${safeBg.secondary} rounded-xl p-6 mb-6 border ${safeBorder.accent}`}>
        <h3 className={`text-lg font-semibold ${safeText.primary} mb-4 flex items-center gap-2`}>
          <div className={`p-1.5 ${safeAccent.primary} rounded-lg`}>
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          Live Investment Calculator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Real-time Parameter Display */}
          <div className={`${safeBg.card} rounded-xl p-4 shadow-sm border ${safeBorder.primary}`}>
            <h4 className={`font-semibold ${safeText.primary} mb-3 flex items-center gap-2`}>
              <div className={`p-1 ${safeAccent.primary} rounded-md`}>
                <Target className="w-4 h-4 text-white" />
              </div>
              Current Parameters
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Principal Amount
                  </span>
                  <span className="font-semibold">₹{Number(principal).toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(principal / 1000000) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Interest Rate
                  </span>
                  <span className="font-semibold">{rate}% p.a.</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(rate / 20) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Time Period
                  </span>
                  <span className="font-semibold">{years} years</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(years / 20) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Compounding</span>
                  <span className="font-semibold">{frequency}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Adjust sliders below to see live updates</p>
          </div>

          {/* Live Calculation Results */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-teal-500 to-blue-600 rounded-md">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              Live Results
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Initial Investment</span>
                <span className="text-sm font-semibold text-gray-800">₹{Number(principal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Future Value</span>
                <span className="text-sm font-semibold text-green-600">
                  ₹{calculateReturns(Number(principal), Number(rate), Number(years), frequency).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Gains</span>
                <span className="text-sm font-semibold text-teal-600">
                  ₹{(calculateReturns(Number(principal), Number(rate), Number(years), frequency) - Number(principal)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Multiple</span>
                <span className="text-sm font-semibold text-teal-600">
                  {(calculateReturns(Number(principal), Number(rate), Number(years), frequency) / Number(principal)).toFixed(2)}x
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-1">Growth Visualization</div>
                <div className="flex items-end gap-1 h-8">
                  {(() => {
                    const steps = 5;
                    const maxValue = calculateReturns(Number(principal), Number(rate), Number(years), frequency);
                    return Array.from({ length: steps }, (_, i) => {
                      const yearStep = (Number(years) / (steps - 1)) * i;
                      const value = calculateReturns(Number(principal), Number(rate), yearStep, frequency);
                      const height = Math.max(8, (value / maxValue) * 32);
                      const colorIntensity = 300 + (i * 100);
                      return (
                        <div 
                          key={i}
                          className={`bg-teal-${colorIntensity} w-2 rounded-t transition-all duration-500`}
                          style={{ height: `${height}px` }}
                          title={`Year ${Math.round(yearStep)}: ₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                        ></div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Updates in real-time as you adjust parameters</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-teal-500" />
            <strong>Live calculations:</strong> Compound interest • Real-time updates • Interactive charts • Multiple scenarios
          </p>
        </div>
      </div>

      <form className="grid grid-cols-1 gap-6 mb-6" onSubmit={handleSimulate}>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Principal Amount (₹)</label>
          <input 
            type="range" 
            min="1000" 
            max="1000000" 
            step="1000" 
            value={principal} 
            onChange={e => setPrincipal(e.target.value)} 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          />
          <div className="text-sm text-gray-600 mt-1">₹{Number(principal).toLocaleString('en-IN')}</div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Annual Interest Rate (%)</label>
          <input 
            type="range" 
            min="1" 
            max="20" 
            step="0.1" 
            value={rate} 
            onChange={e => setRate(e.target.value)} 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          />
          <div className="text-sm text-gray-600 mt-1">{rate}%</div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Investment Period (Years)</label>
          <input 
            type="range" 
            min="1" 
            max="30" 
            value={years} 
            onChange={e => setYears(e.target.value)} 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          />
          <div className="text-sm text-gray-600 mt-1">{years} year(s)</div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Compounding Frequency</label>
          <select 
            value={frequency} 
            onChange={e => setFrequency(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="Yearly">Yearly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Run Simulation
        </button>
      </form>
      {result !== null && (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 p-4 rounded-xl text-gray-800 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-gradient-to-r from-teal-500 to-blue-600 rounded-md">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">Simulation Result</span>
          </div>
          <div className="text-2xl font-bold text-teal-700">
            Future Value: ₹{result.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>
      )}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          Investment Growth Projection
        </h3>
        <div style={{ height: 300 }}>
          <ResponsiveLine
            data={projectionData}
            margin={{ top: 30, right: 30, bottom: 50, left: 60 }}
            xScale={{ type: 'linear', min: 0, max: years }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            axisBottom={{ 
              legend: 'Years', 
              legendOffset: 36, 
              legendPosition: 'middle', 
              tickSize: 5, 
              tickPadding: 5 
            }}
            axisLeft={{ 
              legend: 'Value (₹)', 
              legendOffset: -50, 
              legendPosition: 'middle', 
              tickSize: 5, 
              tickPadding: 5 
            }}
            colors={['#14b8a6']}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            useMesh={true}
            enableArea={true}
            areaOpacity={0.15}
            curve="monotoneX"
            enableGridX={false}
            enableGridY={true}
            defs={[
              {
                id: 'gradientA',
                type: 'linearGradient',
                colors: [
                  { offset: 0, color: '#14b8a6' },
                  { offset: 100, color: '#0891b2' }
                ]
              }
            ]}
            fill={[{ match: '*', id: 'gradientA' }]}
            tooltip={({ point }) => (
              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm">
                <div className="font-medium text-gray-800">Year {point.data.xFormatted}</div>
                <div className="text-teal-600 font-semibold">₹{point.data.yFormatted}</div>
              </div>
            )}
          />
        </div>
      </div>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <div className="p-1 bg-blue-100 rounded-md mt-0.5">
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">Simulation Note</p>
            <p className="text-sm text-blue-700">
              This is a compound interest simulation for demonstration. For SIPs, stocks, or advanced investment strategies, more complex models will be available soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
