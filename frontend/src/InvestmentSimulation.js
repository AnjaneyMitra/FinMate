import React, { useState } from "react";
import { ResponsiveLine } from '@nivo/line';

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
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-teal-700">Investment Simulation Zone</h2>
      
      {/* Live Investment Calculator */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl p-6 mb-6 border border-teal-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>📊</span> Live Investment Calculator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Real-time Parameter Display */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-700 mb-3">Current Parameters</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Principal Amount</span>
                  <span className="font-semibold">₹{Number(principal).toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(principal / 1000000) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Interest Rate</span>
                  <span className="font-semibold">{rate}% p.a.</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(rate / 20) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time Period</span>
                  <span className="font-semibold">{years} years</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(years / 20) * 100}%` }}></div>
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
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-700 mb-3">Live Results</h4>
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
                <span className="text-sm font-semibold text-purple-600">
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
          <p className="text-sm text-gray-600">
            ⚡ <strong>Live calculations:</strong> Compound interest • Real-time updates • Interactive charts • Multiple scenarios
          </p>
        </div>
      </div>

      <form className="grid grid-cols-1 gap-4 mb-6" onSubmit={handleSimulate}>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Principal (₹)</label>
          <input type="range" min="1000" max="1000000" step="1000" value={principal} onChange={e => setPrincipal(e.target.value)} className="w-full" />
          <div className="text-sm text-gray-500">₹{Number(principal).toLocaleString('en-IN')}</div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Annual Interest Rate (%)</label>
          <input type="range" min="1" max="20" step="0.1" value={rate} onChange={e => setRate(e.target.value)} className="w-full" />
          <div className="text-sm text-gray-500">{rate}%</div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Years</label>
          <input type="range" min="1" max="30" value={years} onChange={e => setYears(e.target.value)} className="w-full" />
          <div className="text-sm text-gray-500">{years} year(s)</div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Compounding Frequency</label>
          <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="Yearly">Yearly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition-colors mt-2">Simulate</button>
      </form>
      {result !== null && (
        <div className="bg-teal-50 p-4 rounded text-teal-800 text-lg font-semibold mb-6">
          Future Value: ₹{result.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>
      )}
      <div className="bg-gray-50 rounded p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Projection Chart</h3>
        <div style={{ height: 300 }}>
          <ResponsiveLine
            data={projectionData}
            margin={{ top: 30, right: 30, bottom: 50, left: 60 }}
            xScale={{ type: 'linear', min: 0, max: years }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            axisBottom={{ legend: 'Years', legendOffset: 36, legendPosition: 'middle', tickSize: 5, tickPadding: 5 }}
            axisLeft={{ legend: 'Value (₹)', legendOffset: -50, legendPosition: 'middle', tickSize: 5, tickPadding: 5 }}
            colors={{ scheme: 'category10' }}
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
            tooltip={({ point }) => (
              <div className="bg-white p-2 rounded shadow text-xs text-gray-800">
                Year: {point.data.xFormatted}<br />Value: ₹{point.data.yFormatted}
              </div>
            )}
          />
        </div>
      </div>
      <div className="mt-6 text-gray-500 text-sm">
        <b>Note:</b> This is a simple compound interest simulation. For SIPs, stocks, or advanced strategies, more complex models will be added soon!
      </div>
    </div>
  );
}
