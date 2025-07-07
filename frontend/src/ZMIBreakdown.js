import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from './contexts/ThemeContext';

// ZMI = Zero-based Money Index: Salary breakdown into Essentials, Optional, Savings
const DEFAULT_SPLIT = { essentials: 50, optional: 30, savings: 20 };
const ZMI_CATEGORIES = [
  { key: "essentials", label: "Essentials", color: "blue", description: "Rent, groceries, utilities, transport, etc." },
  { key: "optional", label: "Optional", color: "purple", description: "Dining out, shopping, entertainment, travel, etc." },
  { key: "savings", label: "Savings", color: "green", description: "Investments, emergency fund, long-term savings." }
];

export default function ZMIBreakdown({ salary = 0, breakdown = null }) {
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  
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
    accent: 'text-teal-600'
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

  // Advanced: Allow user to customize split and persist in localStorage
  const [customSplit, setCustomSplit] = useState(() => {
    const saved = localStorage.getItem('zmiCustomSplit');
    return saved ? JSON.parse(saved) : DEFAULT_SPLIT;
  });
  const [editMode, setEditMode] = useState(false);
  const [tempSplit, setTempSplit] = useState(customSplit);
  const [saveStatus, setSaveStatus] = useState(null);

  // Calculate breakdown
  const total = salary;
  const data = ZMI_CATEGORIES.map(cat => {
    const percent = customSplit[cat.key] || DEFAULT_SPLIT[cat.key];
    const amount = Math.round((total * percent) / 100);
    return { ...cat, amount, percent };
  });
  const sumPercent = data.reduce((sum, d) => sum + d.percent, 0);

  // Save custom split
  const handleSave = () => {
    if (Object.values(tempSplit).reduce((a, b) => a + Number(b), 0) !== 100) {
      setSaveStatus('error');
      return;
    }
    setCustomSplit(tempSplit);
    localStorage.setItem('zmiCustomSplit', JSON.stringify(tempSplit));
    setEditMode(false);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(null), 1500);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-teal-700">ZMI Breakdown</h2>
      <p className="mb-4 text-gray-600">Zero-based Money Index (ZMI) helps you visualize your salary split into three core buckets for optimal financial health.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {data.map(cat => (
          <div key={cat.key} className={`rounded-lg p-4 bg-${cat.color}-50 text-center`}>
            <div className={`text-${cat.color}-700 text-lg font-semibold mb-1`}>{cat.label}</div>
            <div className="text-2xl font-bold mb-1">₹{cat.amount.toLocaleString('en-IN')}</div>
            <div className={`text-${cat.color}-600 text-sm mb-2`}>{cat.percent}%</div>
            <div className="text-xs text-gray-500">{cat.description}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-3 justify-center mt-4">
        <Link to="/budget" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-center">Go to Budget Planner</Link>
        <Link to="/tax-estimator" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">Go to Tax Estimator</Link>
      </div>
      <div className="mt-6 text-xs text-gray-400">ZMI is a simple framework to help you allocate your income for essentials, optional spending, and savings. Adjust the split below for your needs.</div>
      <div className="mt-6">
        {!editMode ? (
          <button className="bg-gray-100 text-gray-700 px-4 py-1 rounded hover:bg-gray-200 text-sm" onClick={() => { setTempSplit(customSplit); setEditMode(true); }}>Customize Split</button>
        ) : (
          <div className="bg-gray-50 p-4 rounded mt-2">
            <div className="flex flex-col gap-2 mb-2">
              {ZMI_CATEGORIES.map(cat => (
                <div key={cat.key} className="flex items-center gap-2">
                  <label className="w-24 text-sm text-gray-700">{cat.label}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={tempSplit[cat.key]}
                    onChange={e => setTempSplit({ ...tempSplit, [cat.key]: Number(e.target.value) })}
                    className="border rounded px-2 py-1 w-20"
                  />
                  <span className="text-xs text-gray-500">%</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mb-2">Total: {Object.values(tempSplit).reduce((a, b) => a + Number(b), 0)}%</div>
            <button className="bg-teal-600 text-white px-4 py-1 rounded hover:bg-teal-700 text-sm mr-2" onClick={handleSave}>Save</button>
            <button className="bg-gray-200 text-gray-700 px-4 py-1 rounded hover:bg-gray-300 text-sm" onClick={() => setEditMode(false)}>Cancel</button>
            {saveStatus === 'error' && <div className="text-red-600 text-xs mt-2">Total must be 100%.</div>}
            {saveStatus === 'success' && <div className="text-green-600 text-xs mt-2">Saved!</div>}
          </div>
        )}
      </div>
    </div>
  );
}
