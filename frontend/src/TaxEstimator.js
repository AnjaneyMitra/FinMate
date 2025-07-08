import React, { useState, useEffect } from "react";
import { Calculator, DollarSign, Receipt, Save, TrendingUp, Target } from 'lucide-react';
import FirebaseDataService from './services/FirebaseDataService';
import PinButton from './components/PinButton';
import { useTheme } from './contexts/ThemeContext';

// Simple Indian income tax estimator for FY 2024-25 (old regime, for demo)
function estimateTax({ income, deductions }) {
  let taxable = Math.max(0, income - deductions);
  let tax = 0;
  if (taxable <= 250000) tax = 0;
  else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
  else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.2;
  else tax = 112500 + (taxable - 1000000) * 0.3;
  // Add 4% cess
  tax = tax * 1.04;
  return Math.round(tax);
}

export default function TaxEstimator() {
  const [income, setIncome] = useState(800000);
  const [deductions, setDeductions] = useState(150000);
  const [plannedSpending, setPlannedSpending] = useState(0);
  const [tax, setTax] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);

  // Theme integration
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  
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
    primary: 'bg-teal-600'
  };

  // Fetch plannedSpending from Firebase on mount
  useEffect(() => {
    async function fetchPlannedSpending() {
      setLoading(true);
      try {
        const dataService = new FirebaseDataService();
        const prefs = await dataService.getUserPreferences();
        if (prefs && prefs.plannedSpending !== undefined) {
          setPlannedSpending(Number(prefs.plannedSpending));
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchPlannedSpending();
  }, []);

  // Save plannedSpending to Firebase
  const savePlannedSpending = async (value) => {
    setSaveStatus('saving');
    try {
      const dataService = new FirebaseDataService();
      const prefs = await dataService.getUserPreferences();
      await dataService.saveUserPreferences({ ...(prefs || {}), plannedSpending: Number(value) });
      setSaveStatus('success');
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTax(estimateTax({ income: Number(income), deductions: Number(deductions) }));
    // plannedSpending is already saved on change
  };

  // --- Planned Spending by Category ---
  const [categories] = useState([
    'Essentials', 'Savings', 'Discretionary', 'Emergency',
    'Food', 'Bills', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Personal', 'Miscellaneous'
  ]);
  const [selectedCategory, setSelectedCategory] = useState('Essentials');
  const [categoryPlanned, setCategoryPlanned] = useState({});
  const [catSaveStatus, setCatSaveStatus] = useState(null);

  // Fetch planned spending by category on mount
  useEffect(() => {
    async function fetchCategoryPlanned() {
      try {
        const dataService = new FirebaseDataService();
        const prefs = await dataService.getUserPreferences();
        if (prefs && prefs.plannedSpendingByCategory) {
          setCategoryPlanned(prefs.plannedSpendingByCategory);
        }
      } catch {}
    }
    fetchCategoryPlanned();
  }, []);

  // Save planned spending by category
  const saveCategoryPlanned = async (cat, value) => {
    setCatSaveStatus('saving');
    try {
      const dataService = new FirebaseDataService();
      const prefs = await dataService.getUserPreferences();
      const updated = { ...(prefs?.plannedSpendingByCategory || {}), [cat]: Number(value) };
      await dataService.saveUserPreferences({ ...(prefs || {}), plannedSpendingByCategory: updated });
      setCategoryPlanned(updated);
      setCatSaveStatus('success');
    } catch {
      setCatSaveStatus('error');
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${safeBg.card} rounded-xl shadow-sm p-8 mt-8 border ${safeBorder.primary}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-2 ${safeAccent.primary} rounded-lg`}>
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${safeText.primary}`}>Income Tax Estimator (India)</h2>
          <PinButton pageId="tax-estimator" />
        </div>
      </div>
      <form className="grid grid-cols-1 gap-6 mb-6" onSubmit={handleSubmit}>
        <div>
          <label className={`block ${safeText.secondary} font-medium mb-2 flex items-center gap-2`}>
            <DollarSign className={`w-4 h-4 ${safeText.accent || 'text-teal-600'}`} />
            Annual Income (₹)
          </label>
          <input 
            type="number" 
            min="0" 
            value={income} 
            onChange={e => setIncome(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
            required 
          />
        </div>
        <div>
          <label className={`block ${safeText.secondary} font-medium mb-2 flex items-center gap-2`}>
            <Receipt className={`w-4 h-4 ${safeText.accent || 'text-teal-600'}`} />
            Deductions (₹)
          </label>
          <input 
            type="number" 
            min="0" 
            value={deductions} 
            onChange={e => setDeductions(e.target.value)} 
            className={`w-full border ${safeBorder.primary} rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${safeBg.card} ${safeText.primary}`}
            required 
          />
          <div className={`text-xs ${safeText.tertiary} mt-1`}>E.g. 80C, 80D, HRA, etc.</div>
        </div>
        <div>
          <label className={`block ${safeText.secondary} font-medium mb-2 flex items-center gap-2`}>
            <Target className={`w-4 h-4 ${safeText.accent || 'text-teal-600'}`} />
            Planned Spending (₹)
          </label>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <form
              onSubmit={e => {
                e.preventDefault();
                savePlannedSpending(plannedSpending);
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="number"
                min="0"
                value={plannedSpending}
                onChange={e => setPlannedSpending(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter planned annual spending"
              />
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm transition-colors"
                  disabled={loading || saveStatus === 'saving'}
                >
                  <Save className="w-4 h-4" />
                  {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                </button>
                <div className="flex items-center gap-2">
                  {saveStatus === 'success' && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Saved!
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Save failed
                    </span>
                  )}
                </div>
              </div>
            </form>
            <div className="text-xs text-gray-500 mt-2">Enter your planned annual spending for comparison.</div>
          </div>
        </div>
        <button 
          type="submit" 
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors mt-4 flex items-center gap-2 justify-center font-medium"
        >
          <Calculator className="w-5 h-5" />
          Estimate Tax
        </button>
      </form>
      {tax !== null && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Estimated Tax</h3>
              <p className="text-2xl font-bold text-yellow-700">₹{tax.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}
      {plannedSpending > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-xl border border-blue-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Planned Annual Spending</h3>
              <p className="text-2xl font-bold text-blue-700">₹{Number(plannedSpending).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}
      {/* --- Planned Spending by Category --- */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-teal-600" />
          Planned Spending by Category
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              saveCategoryPlanned(selectedCategory, categoryPlanned[selectedCategory] || 0);
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-3 items-center">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 flex-1 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={categoryPlanned[selectedCategory] || ''}
                onChange={e => setCategoryPlanned({ ...categoryPlanned, [selectedCategory]: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-3 w-40 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Amount (₹)"
              />
              <button
                type="submit"
                className="bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 text-sm transition-colors flex items-center gap-2"
                disabled={catSaveStatus === 'saving'}
              >
                <Save className="w-4 h-4" />
                {catSaveStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {catSaveStatus === 'success' && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Saved!
                </span>
              )}
              {catSaveStatus === 'error' && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Save failed
                </span>
              )}
            </div>
          </form>
          <div className="mt-3">
            <table className="min-w-full text-xs text-gray-700">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1">Category</th>
                  <th className="text-left px-2 py-1">Planned (₹)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(categoryPlanned).map(([cat, val]) => (
                  <tr key={cat}>
                    <td className="px-2 py-1">{cat}</td>
                    <td className="px-2 py-1">₹{Number(val).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-500 mt-1">Set your planned spending for each category. Used for analysis and budget tracking.</div>
        </div>
      </div>
      <div className="mt-6 text-gray-500 text-sm">
        <b>Note:</b> This is a simplified estimator for demonstration. For detailed tax planning, consult a tax professional.
      </div>
    </div>
  );
}
