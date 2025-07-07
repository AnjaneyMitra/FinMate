import React, { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Calculator } from 'lucide-react';
import PinButton from './components/PinButton';
import { useTheme, useThemeStyles } from './contexts/ThemeContext';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function calculateTaxBreakdown(salary) {
  // Indian tax slabs for FY 2024-25
  const slabs = [
    { label: "0-2.5L", limit: 250000, rate: 0 },
    { label: "2.5L-5L", limit: 500000, rate: 0.05 },
    { label: "5L-10L", limit: 1000000, rate: 0.2 },
    { label: "10L+", limit: Infinity, rate: 0.3 },
  ];
  let remaining = salary;
  let prevLimit = 0;
  const breakdown = [];
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, slab.limit - prevLimit);
    const tax = taxable * slab.rate;
    breakdown.push({ label: slab.label, tax, taxable });
    remaining -= taxable;
    prevLimit = slab.limit;
  }
  return breakdown;
}

export default function TaxBreakdown() {
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  const styles = useThemeStyles();
  
  // Safe fallbacks for theme properties
  const safeBg = bg || {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    card: 'bg-white'
  };
  const safeText = text || {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500'
  };
  const safeBorder = border || {
    primary: 'border-gray-200'
  };
  const safeAccent = accent || {
    primary: 'bg-teal-600',
    secondary: 'text-teal-600'
  };
  
  const [salary, setSalary] = useState(0);
  const breakdown = calculateTaxBreakdown(Number(salary));
  const totalTax = breakdown.reduce((sum, b) => sum + b.tax, 0);
  const netSalary = Number(salary) - totalTax;

  const barData = {
    labels: breakdown.map((b) => b.label),
    datasets: [
      {
        label: "Tax Paid (₹)",
        data: breakdown.map((b) => b.tax),
        backgroundColor: [
          "#14b8a6",
          "#0ea5e9",
          "#f59e0b",
          "#ef4444"
        ],
        borderColor: [
          "#0f766e",
          "#0284c7",
          "#d97706",
          "#dc2626"
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ["Net Salary", "Total Tax"],
    datasets: [
      {
        data: [netSalary, totalTax],
        backgroundColor: ["#10b981", "#ef4444"],
        borderColor: ["#059669", "#dc2626"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': ₹' + context.parsed.toLocaleString('en-IN');
          }
        }
      }
    },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className={`text-3xl font-bold ${safeText.primary} mb-2`}>Tax Calculator</h2>
            <p className={`${safeText.secondary}`}>Calculate your income tax based on current Indian tax slabs</p>
          </div>
          <PinButton pageId="tax-breakdown" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className={`${safeBg.card} p-6 rounded-lg shadow-md`}>
          <h3 className={`text-xl font-semibold ${safeAccent.secondary} mb-4`}>Annual Salary</h3>
          <div className="space-y-4">
            <div>
              <label className={`block mb-2 font-medium ${safeText.secondary}`}>
                Enter your annual salary (₹)
              </label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className={`w-full border ${safeBorder.primary} px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-${safeAccent.primary.replace('bg-', '')} focus:border-transparent ${safeBg.card} ${safeText.primary}`}
                placeholder="e.g., 1200000"
              />
            </div>
            
            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSalary(500000)}
                className={`px-3 py-2 text-sm ${safeBg.secondary} hover:${safeBg.tertiary || 'bg-gray-200'} rounded-md transition-colors ${safeText.primary}`}
              >
                ₹5L
              </button>
              <button
                onClick={() => setSalary(1000000)}
                className={`px-3 py-2 text-sm ${safeBg.secondary} hover:${safeBg.tertiary || 'bg-gray-200'} rounded-md transition-colors ${safeText.primary}`}
              >
                ₹10L
              </button>
              <button
                onClick={() => setSalary(1500000)}
                className={`px-3 py-2 text-sm ${safeBg.secondary} hover:${safeBg.tertiary || 'bg-gray-200'} rounded-md transition-colors ${safeText.primary}`}
              >
                ₹15L
              </button>
              <button
                onClick={() => setSalary(2000000)}
                className={`px-3 py-2 text-sm ${safeBg.secondary} hover:${safeBg.tertiary || 'bg-gray-200'} rounded-md transition-colors ${safeText.primary}`}
              >
                ₹20L
              </button>
            </div>
          </div>

          {/* Tax Summary */}
          {salary > 0 && (
            <div className="mt-6 space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Gross Salary</p>
                <p className="text-xl font-bold text-blue-700">₹{Number(salary).toLocaleString('en-IN')}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Total Tax</p>
                <p className="text-xl font-bold text-red-700">₹{totalTax.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Net Salary</p>
                <p className="text-xl font-bold text-green-700">₹{netSalary.toLocaleString('en-IN')}</p>
              </div>
              
              <div className={`${safeBg.secondary} p-4 rounded-lg`}>
                <p className={`text-sm ${safeText.secondary} font-medium`}>Effective Tax Rate</p>
                <p className={`text-xl font-bold ${safeText.primary}`}>{((totalTax / Number(salary)) * 100).toFixed(2)}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {salary > 0 && (
            <>
              {/* Tax Breakdown Chart */}
              <div className={`${safeBg.card} p-6 rounded-lg shadow-md`}>
                <h3 className={`text-xl font-semibold ${safeText.primary} mb-4`}>Tax Breakdown by Slab</h3>
                <div style={{ height: '300px' }}>
                  <Bar data={barData} options={chartOptions} />
                </div>
              </div>

              {/* Pie Chart */}
              <div className={`${safeBg.card} p-6 rounded-lg shadow-md`}>
                <h3 className={`text-xl font-semibold ${safeText.primary} mb-4`}>Net vs Tax Distribution</h3>
                <div style={{ height: '300px' }}>
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>
            </>
          )}

          {salary === 0 && (
            <div className={`${safeBg.card} p-6 rounded-lg shadow-md`}>
              <div className="text-center py-12">
                <div className={`p-4 bg-gradient-to-r from-${safeAccent.primary.replace('bg-', '')} to-blue-600 rounded-2xl inline-block mb-4`}>
                  <Calculator className="w-12 h-12 text-white" />
                </div>
                <h3 className={`text-xl font-semibold ${safeText.primary} mb-2`}>Tax Calculator</h3>
                <p className={`${safeText.secondary}`}>Enter your annual salary to see the tax breakdown</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tax Slab Information */}
      <div className={`mt-8 ${safeBg.card} rounded-lg shadow-md p-6`}>
        <h3 className={`text-xl font-semibold ${safeText.primary} mb-4`}>Current Tax Slabs (2024-25)</h3>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${safeBorder.primary}`}>
            <thead className={`${safeBg.secondary}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${safeText.tertiary} uppercase tracking-wider`}>Income Range</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${safeText.tertiary} uppercase tracking-wider`}>Tax Rate</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${safeText.tertiary} uppercase tracking-wider`}>Your Tax</th>
              </tr>
            </thead>
            <tbody className={`${safeBg.card} divide-y ${safeBorder.primary}`}>
              {breakdown.map((slab, index) => (
                <tr key={index} className={slab.tax > 0 ? 'bg-yellow-50' : ''}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${safeText.primary}`}>
                    {slab.label}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${safeText.primary}`}>
                    {slab.label === "0-2.5L" ? "0%" : 
                     slab.label === "2.5L-5L" ? "5%" : 
                     slab.label === "5L-10L" ? "20%" : "30%"}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${safeText.primary}`}>
                    ₹{slab.tax.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
