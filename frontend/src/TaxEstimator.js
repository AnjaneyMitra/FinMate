import React, { useState, useEffect } from "react";
import FirebaseDataService from './services/FirebaseDataService';
import PinButton from './components/PinButton';

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

  const handlePlannedSpendingChange = (e) => {
    setPlannedSpending(e.target.value);
    savePlannedSpending(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTax(estimateTax({ income: Number(income), deductions: Number(deductions) }));
    // plannedSpending is already saved on change
  };

  // --- Planned Spending by Category ---
  const [categories, setCategories] = useState([
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
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-teal-700">Income Tax Estimator (India)</h2>
          <PinButton pageId="tax-estimator" />
        </div>
      </div>
      <form className="grid grid-cols-1 gap-4 mb-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Annual Income (₹)</label>
          <input type="number" min="0" value={income} onChange={e => setIncome(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Deductions (₹)</label>
          <input type="number" min="0" value={deductions} onChange={e => setDeductions(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <div className="text-xs text-gray-500 mt-1">E.g. 80C, 80D, HRA, etc.</div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Planned Spending (₹)</label>
          <div className="bg-gray-50 rounded p-3 border">
            <form
              onSubmit={e => {
                e.preventDefault();
                savePlannedSpending(plannedSpending);
              }}
              className="flex flex-col gap-2"
            >
              <input
                type="number"
                min="0"
                value={plannedSpending}
                onChange={e => setPlannedSpending(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter planned annual spending"
              />
              <button
                type="submit"
                className="self-end bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                disabled={loading || saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
              {saveStatus === 'success' && <span className="text-xs text-green-600">Saved!</span>}
              {saveStatus === 'error' && <span className="text-xs text-red-600">Save failed</span>}
            </form>
            <div className="text-xs text-gray-500 mt-1">Enter your planned annual spending for comparison.</div>
          </div>
        </div>
        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition-colors mt-2">Estimate Tax</button>
      </form>
      {tax !== null && (
        <div className="bg-yellow-50 p-4 rounded text-yellow-800 text-lg font-semibold mb-2">
          Estimated Tax: ₹{tax.toLocaleString('en-IN')}
        </div>
      )}
      {plannedSpending > 0 && (
        <div className="bg-blue-50 p-4 rounded text-blue-800 text-base font-medium mb-2">
          Planned Spending: ₹{Number(plannedSpending).toLocaleString('en-IN')}
        </div>
      )}
      {/* --- Planned Spending by Category --- */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-teal-600">Planned Spending by Category</h3>
        <div className="bg-gray-50 rounded p-4 border">
          <form
            onSubmit={e => {
              e.preventDefault();
              saveCategoryPlanned(selectedCategory, categoryPlanned[selectedCategory] || 0);
            }}
            className="flex flex-col gap-2"
          >
            <div className="flex gap-2 items-center">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="border rounded px-3 py-2 w-48"
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
                className="border rounded px-3 py-2 w-40"
                placeholder="Amount (₹)"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                disabled={catSaveStatus === 'saving'}
              >
                {catSaveStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
              {catSaveStatus === 'success' && <span className="text-xs text-green-600 ml-2">Saved!</span>}
              {catSaveStatus === 'error' && <span className="text-xs text-red-600 ml-2">Save failed</span>}
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
