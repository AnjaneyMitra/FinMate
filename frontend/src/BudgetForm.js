import React, { useState, useEffect } from "react";
import FirebaseDataService from './services/FirebaseDataService';
import { ResponsiveBar } from '@nivo/bar';

export default function BudgetForm() {
  const [form, setForm] = useState({
    income: "",
    goals: "",
    location: "",
  });
  const [suggestedBudget, setSuggestedBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [plannedCategories, setPlannedCategories] = useState({});
  const [plannedInputMode, setPlannedInputMode] = useState(false);

  // Add missing state for editing planned category
  const [editingCat, setEditingCat] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // --- Planned Spending (Global) ---
  const [globalPlannedSpending, setGlobalPlannedSpending] = useState(0);
  const [globalPlannedStatus, setGlobalPlannedStatus] = useState(null);
  useEffect(() => {
    async function fetchGlobalPlanned() {
      try {
        const dataService = new FirebaseDataService();
        const prefs = await dataService.getUserPreferences();
        if (prefs && prefs.plannedSpending !== undefined) {
          setGlobalPlannedSpending(Number(prefs.plannedSpending));
        }
      } catch {}
    }
    fetchGlobalPlanned();
  }, []);
  const saveGlobalPlannedSpending = async (value) => {
    setGlobalPlannedStatus('saving');
    try {
      const dataService = new FirebaseDataService();
      const prefs = await dataService.getUserPreferences();
      await dataService.saveUserPreferences({ ...(prefs || {}), plannedSpending: Number(value) });
      setGlobalPlannedStatus('success');
    } catch {
      setGlobalPlannedStatus('error');
    }
  };

  // --- Planned Spending by Category (Global, for Budget Planner) ---
  const [categories, setCategories] = useState([
    'Essentials', 'Savings', 'Discretionary', 'Emergency',
    'Food', 'Bills', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Personal', 'Miscellaneous'
  ]);
  const [selectedCategory, setSelectedCategory] = useState('Essentials');
  const [categoryPlanned, setCategoryPlanned] = useState({});
  const [catSaveStatus, setCatSaveStatus] = useState(null);
  // Now using its own Firestore collection
  useEffect(() => {
    async function fetchCategoryPlanned() {
      try {
        const dataService = new FirebaseDataService();
        const plannedDoc = await dataService.getPlannedSpendingByCategory();
        if (plannedDoc && plannedDoc.categories) {
          setCategoryPlanned(plannedDoc.categories);
        }
      } catch {}
    }
    fetchCategoryPlanned();
  }, []);

  const saveCategoryPlanned = async (cat, value) => {
    setCatSaveStatus('saving');
    try {
      const dataService = new FirebaseDataService();
      // Fetch current doc
      let plannedDoc = await dataService.getPlannedSpendingByCategory();
      let categories = plannedDoc?.categories || {};
      categories = { ...categories, [cat]: Number(value) };
      await dataService.savePlannedSpendingByCategory(categories);
      setCategoryPlanned(categories);
      setCatSaveStatus('success');
    } catch {
      setCatSaveStatus('error');
    }
  };

  // Load user's saved budget and planned categories on mount
  useEffect(() => {
    async function loadBudget() {
      const dataService = new FirebaseDataService();
      try {
        const saved = await dataService.getBudget();
        if (saved && Object.keys(saved).length > 0) {
          setSuggestedBudget(saved);
          if (saved.categories) setPlannedCategories(saved.categories);
        }
      } catch (err) {}
    }
    loadBudget();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuggestedBudget(null);
    
    // Simulate API call with mock data
    try {
      // Replace with your actual API endpoint
      // const res = await fetch("/api/budget-suggestion", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });
      // const data = await res.json();
      
      // Mock data for demonstration
      setTimeout(() => {
        const income = parseInt(form.income);
        const mockBudget = {
          essentials: Math.round(income * 0.5),
          savings: Math.round(income * 0.2),
          discretionary: Math.round(income * 0.3),
          emergency: Math.round(income * 0.1),
        };
        setSuggestedBudget(mockBudget);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setSuggestedBudget({ error: "Failed to fetch budget suggestion." });
      setLoading(false);
    }
  };

  // Add edit button and logic
  const handleEdit = () => {
    setEditBudget({ ...suggestedBudget });
    setEditMode(true);
    setSaveStatus(null);
  };

  // --- Edit Budget: Dynamic sum validation and auto-correction ---
  const handleEditChange = (cat, value) => {
    // Parse new value and get current editBudget
    const newValue = Number(value);
    const income = Number(form.income);
    const cats = ['essentials','savings','discretionary','emergency'];
    let updated = { ...editBudget, [cat]: newValue };
    // Calculate sum of all except the edited one
    const otherSum = cats.filter(c => c !== cat).reduce((sum, c) => sum + (Number(updated[c]) || 0), 0);
    // If sum exceeds income, proportionally reduce others
    let total = newValue + otherSum;
    if (income > 0 && total !== income) {
      // Adjust others proportionally
      const diff = income - newValue;
      const oldOtherSum = cats.filter(c => c !== cat).reduce((sum, c) => sum + (Number(editBudget[c]) || 0), 0);
      cats.filter(c => c !== cat).forEach(c => {
        updated[c] = oldOtherSum > 0 ? Math.round((editBudget[c] * diff) / oldOtherSum) : 0;
      });
      // Final correction for rounding
      const checkSum = cats.reduce((sum, c) => sum + (Number(updated[c]) || 0), 0);
      if (checkSum !== income) {
        // Assign rounding diff to essentials
        updated['essentials'] += (income - checkSum);
      }
    }
    setEditBudget(updated);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const dataService = new FirebaseDataService();
      await dataService.saveBudget(editBudget);
      // Fetch updated budget from backend (ensure categories are also updated)
      const updated = await dataService.getBudget();
      setSuggestedBudget(updated || { ...editBudget });
      if (updated?.categories) setPlannedCategories(updated.categories);
      setEditMode(false);
      setSaveStatus('success');
    } catch (err) {
      setSaveStatus('error');
    }
  };

  // Compute planned vs actual data for chart
  const plannedVsActualData = React.useMemo(() => {
    let planned = plannedCategories;
    if (!planned || Object.keys(planned).length === 0) {
      if (suggestedBudget && suggestedBudget.categories) planned = suggestedBudget.categories;
      else if (suggestedBudget) planned = {
        essentials: suggestedBudget.essentials,
        savings: suggestedBudget.savings,
        discretionary: suggestedBudget.discretionary,
        emergency: suggestedBudget.emergency
      };
    }
    // For demo, use mock actuals (replace with real data if available)
    const actual = {
      essentials: 26000,
      savings: 9000,
      discretionary: 12000,
      emergency: 4000,
      food: 9000,
      bills: 14000,
      transport: 3500,
      shopping: 6000,
      entertainment: 2500,
      healthcare: 1200,
      education: 1800,
      personal: 1100,
      miscellaneous: 12000
    };
    const allCats = Array.from(new Set([...Object.keys(planned), ...Object.keys(actual)]));
    return allCats.map(cat => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      Planned: planned[cat] || 0,
      Actual: actual[cat] || 0
    }));
  }, [plannedCategories, suggestedBudget]);

  // --- Financial Goals State ---
  const [goals, setGoals] = useState([]); // [{id, name, target, saved, emoji, date, category}]
  const [goalForm, setGoalForm] = useState({ name: '', target: '', emoji: '🎯', date: '', category: '' });
  const [goalSaveStatus, setGoalSaveStatus] = useState(null);

  // Load goals from Firestore on mount
  useEffect(() => {
    async function fetchGoals() {
      try {
        const dataService = new FirebaseDataService();
        const userGoals = await dataService.getGoals(); // implement getGoals in service
        setGoals(userGoals || []);
      } catch {}
    }
    fetchGoals();
  }, []);

  // Add or update a goal
  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    setGoalSaveStatus('saving');
    try {
      const dataService = new FirebaseDataService();
      await dataService.saveGoal(goalForm); // implement saveGoal in service
      setGoalForm({ name: '', target: '', emoji: '🎯', date: '', category: '' });
      setGoalSaveStatus('success');
      // Refresh goals
      const userGoals = await dataService.getGoals();
      setGoals(userGoals || []);
    } catch {
      setGoalSaveStatus('error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Budget Planner</h2>
        <p className="text-gray-600">Create a personalized budget based on your income and goals</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-teal-700 mb-4">Your Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Monthly Income (INR)</label>
              <input
                type="number"
                name="income"
                value={form.income}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                placeholder="Enter your monthly income"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">Financial Goals</label>
              <input
                type="text"
                name="goals"
                value={form.goals}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                placeholder="e.g. Save for house, travel, emergency fund"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                placeholder="e.g. Mumbai, Delhi, Bangalore"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Generating Budget..." : "Get Suggested Budget"}
            </button>
          </form>
        </div>

        {/* Budget Results */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-teal-700 mb-4">Budget Suggestion</h3>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span className="ml-2 text-gray-600">Calculating your budget...</span>
            </div>
          )}
          
          {!loading && !suggestedBudget && (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">💰</span>
              <p>Fill out the form to get your personalized budget suggestion</p>
            </div>
          )}
          
          {suggestedBudget && suggestedBudget.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-600">{suggestedBudget.error}</div>
            </div>
          )}
          
          {suggestedBudget && !suggestedBudget.error && !editMode && (
            <div className="space-y-6">
              {/* Budget Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                {(() => {
                  const income = Number(form.income) || 1;
                  const cats = [
                    { key: 'essentials', label: 'Essentials', color: 'blue' },
                    { key: 'savings', label: 'Savings', color: 'green' },
                    { key: 'discretionary', label: 'Discretionary', color: 'purple' },
                    { key: 'emergency', label: 'Emergency', color: 'orange' }
                  ];
                  return cats.map(cat => {
                    const value = suggestedBudget[cat.key] || 0;
                    const percent = Math.round((value / income) * 100);
                    return (
                      <div key={cat.key} className={`bg-${cat.color}-50 p-4 rounded-lg text-center`}>
                        <p className={`text-sm text-${cat.color}-600 font-medium`}>{cat.label}</p>
                        <p className={`text-2xl font-bold text-${cat.color}-700`}>₹{value.toLocaleString("en-IN")}</p>
                        <p className={`text-xs text-${cat.color}-600`}>{percent}% of income</p>
                      </div>
                    );
                  });
                })()}
              </div>
              
              {/* Detailed Table */}
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount (₹)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Essentials</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{suggestedBudget.essentials?.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">50%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Savings</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{suggestedBudget.savings?.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">20%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Discretionary</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{suggestedBudget.discretionary?.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">30%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Emergency Fund</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{suggestedBudget.emergency?.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">10%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Edit Button */}
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors mb-4"
                onClick={handleEdit}
              >
                Edit Budget
              </button>
            </div>
          )}
          
          {editMode && (
            <div className="space-y-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Edit Budget Categories</h4>
              {['essentials','savings','discretionary','emergency'].map(cat => (
                <div key={cat} className="flex items-center gap-4">
                  <label className="w-32 capitalize">{cat}</label>
                  <input
                    type="number"
                    min="0"
                    value={editBudget[cat]}
                    onChange={e => handleEditChange(cat, e.target.value)}
                    className="border rounded px-3 py-1 w-40"
                  />
                </div>
              ))}
              <button
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors mt-2"
                onClick={handleSave}
                type="button"
              >
                Save Changes
              </button>
              {saveStatus === 'saving' && <div className="text-teal-600 mt-2">Saving...</div>}
              {saveStatus === 'success' && <div className="text-green-600 mt-2">Budget updated!</div>}
              {saveStatus === 'error' && <div className="text-red-600 mt-2">Failed to save. Try again.</div>}
            </div>
          )}

          {/* Planned Categories Input */}
          {/* Removed non-global planned spending input as requested */}
          
          {/* Planned vs Actual Spend Chart */}
          {(suggestedBudget && (suggestedBudget.categories || suggestedBudget.essentials)) && (
            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
              <h3 className="text-xl font-semibold text-teal-700 mb-4">Planned vs. Actual Spend</h3>
              <div style={{ height: 320 }}>
                <ResponsiveBar
                  data={plannedVsActualData}
                  keys={['Planned', 'Actual']}
                  indexBy="category"
                  margin={{ top: 30, right: 30, bottom: 60, left: 60 }}
                  padding={0.3}
                  groupMode="grouped"
                  colors={{ scheme: 'nivo' }}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -30,
                    legend: 'Category',
                    legendPosition: 'middle',
                    legendOffset: 40
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    legend: 'Amount (₹)',
                    legendPosition: 'middle',
                    legendOffset: -50
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  tooltip={({ id, value, indexValue }) => (
                    <div className="bg-white p-2 rounded shadow text-xs text-gray-800">
                      <b>{indexValue}</b><br />{id}: ₹{value.toLocaleString('en-IN')}
                    </div>
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Planned Spending by Category (Global) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-teal-700 mb-2 flex items-center">Planned Spending by Category
          <span className="ml-2 text-xs text-gray-500">(Global)</span>
        </h3>
        <form
          onSubmit={e => {
            e.preventDefault();
            saveCategoryPlanned(selectedCategory, categoryPlanned[selectedCategory] || 0);
          }}
          className="flex flex-col sm:flex-row gap-2 items-center"
        >
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
        </form>
        {/* Structured Table with Edit functionality */}
        <div className="mt-3">
          <table className="min-w-full text-xs text-gray-700 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Category</th>
                <th className="text-left px-4 py-2 font-semibold">Planned (₹)</th>
                <th className="text-left px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryPlanned).length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-4">No planned categories yet.</td>
                </tr>
              )}
              {Object.entries(categoryPlanned).map(([cat, val], idx) => (
                <tr key={cat} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 capitalize font-medium flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-teal-400"></span>
                    {cat}
                  </td>
                  <td className="px-4 py-2">
                    {editingCat === cat ? (
                      <input
                        type="number"
                        min="0"
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        className="border border-teal-300 rounded px-2 py-1 w-24 focus:ring-2 focus:ring-teal-400 outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-gray-800">₹{Number(val).toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingCat === cat ? (
                      <div className="flex gap-2">
                        <button
                          className="bg-teal-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-teal-700 transition-colors"
                          onClick={async () => {
                            await saveCategoryPlanned(cat, editingValue);
                            setEditingCat(null);
                          }}
                        >Save</button>
                        <button
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-300 transition-colors"
                          onClick={() => setEditingCat(null)}
                        >Cancel</button>
                      </div>
                    ) : (
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-yellow-600 transition-colors"
                        onClick={() => {
                          setEditingCat(cat);
                          setEditingValue(val);
                        }}
                      >Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-gray-500 mt-1">Set your planned spending for each category. Used for analysis and budget tracking.</div>
      </div>

      {/* --- Financial Goals Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-teal-700 mb-2 flex items-center">
          My Financial Goals <span className="ml-2 text-xs text-gray-500">(Track & Celebrate!)</span>
        </h3>
        <form onSubmit={handleGoalSubmit} className="flex flex-col sm:flex-row gap-2 items-center mb-4">
          <input
            type="text"
            placeholder="Goal name (e.g. Vacation)"
            className="border rounded px-3 py-2 w-48"
            value={goalForm.name}
            onChange={e => setGoalForm({ ...goalForm, name: e.target.value })}
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Target (₹)"
            className="border rounded px-3 py-2 w-32"
            value={goalForm.target}
            onChange={e => setGoalForm({ ...goalForm, target: e.target.value })}
            required
          />
          <input
            type="date"
            className="border rounded px-3 py-2 w-40"
            value={goalForm.date}
            onChange={e => setGoalForm({ ...goalForm, date: e.target.value })}
          />
          <input
            type="text"
            maxLength={2}
            className="border rounded px-3 py-2 w-16 text-center"
            value={goalForm.emoji}
            onChange={e => setGoalForm({ ...goalForm, emoji: e.target.value })}
            placeholder="🎯"
          />
          <input
            type="text"
            placeholder="Category (optional)"
            className="border rounded px-3 py-2 w-32"
            value={goalForm.category}
            onChange={e => setGoalForm({ ...goalForm, category: e.target.value })}
          />
          <button
            type="submit"
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors"
            disabled={goalSaveStatus === 'saving'}
          >
            {goalSaveStatus === 'saving' ? 'Saving...' : 'Add Goal'}
          </button>
          {goalSaveStatus === 'success' && <span className="text-xs text-green-600 ml-2">Saved!</span>}
          {goalSaveStatus === 'error' && <span className="text-xs text-red-600 ml-2">Error</span>}
        </form>
        {/* Goals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.length === 0 && <div className="text-gray-400 col-span-3">No goals yet. Add one above!</div>}
          {goals.map(goal => {
            const percent = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
            return (
              <div key={goal.id} className="bg-gray-50 rounded-lg p-4 shadow flex flex-col gap-2 relative">
                <div className="flex items-center gap-2 text-2xl font-bold">{goal.emoji || '🎯'} <span className="text-lg font-semibold text-gray-800">{goal.name}</span></div>
                <div className="text-sm text-gray-600">Target: ₹{Number(goal.target).toLocaleString('en-IN')}</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                  <div className={`bg-teal-500 h-3 rounded-full transition-all`} style={{ width: `${percent}%` }}></div>
                </div>
                <div className="text-xs text-gray-700 mt-1">Progress: ₹{Number(goal.saved).toLocaleString('en-IN')} / ₹{Number(goal.target).toLocaleString('en-IN')} ({percent}%)</div>
                {goal.date && <div className="text-xs text-gray-400">By: {goal.date}</div>}
                {percent === 100 && <div className="absolute top-2 right-2 text-green-600 text-xl animate-bounce">🎉</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
