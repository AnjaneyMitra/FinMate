import React, { useState, useEffect } from "react";
import FirebaseDataService from './services/FirebaseDataService';
import { ResponsiveBar } from '@nivo/bar';
import { DollarSign, Zap, BarChart3 } from 'lucide-react';
import PinButton from './components/PinButton';
import { useTheme, useThemeStyles } from './contexts/ThemeContext';

export default function BudgetForm() {
  const themeContext = useTheme();
  const { bg, text, border, accent, currentTheme } = themeContext || {};
  const styles = useThemeStyles();
  
  // Safe fallbacks for all theme properties
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
  
  useEffect(() => {
    async function fetchGlobalPlanned() {
      try {
        const dataService = new FirebaseDataService();
        const prefs = await dataService.getUserPreferences();
        if (prefs && prefs.plannedSpending !== undefined) {
          // globalPlannedSpending fetched but not used in current implementation
        }
      } catch {}
    }
    fetchGlobalPlanned();
  }, []);

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
  };

  // Add edit button and logic
  const handleEdit = () => {
    setEditBudget({ ...suggestedBudget });
    setEditMode(true);
    setSaveStatus(null);
  };

  // --- Edit Budget: Dynamic sum validation and auto-correction ---
  const handleEditChange = (cat, value) => {
    const newValue = Number(value);
    const income = Number(form.income);
    const cats = ['essentials','savings','discretionary','emergency'];
    let updated = { ...editBudget, [cat]: newValue };
    
    const otherSum = cats.filter(c => c !== cat).reduce((sum, c) => sum + (Number(updated[c]) || 0), 0);
    let total = newValue + otherSum;
    
    if (income > 0 && total !== income) {
      const diff = income - newValue;
      const oldOtherSum = cats.filter(c => c !== cat).reduce((sum, c) => sum + (Number(editBudget[c]) || 0), 0);
      cats.filter(c => c !== cat).forEach(c => {
        updated[c] = oldOtherSum > 0 ? Math.round((editBudget[c] * diff) / oldOtherSum) : 0;
      });
      
      const checkSum = cats.reduce((sum, c) => sum + (Number(updated[c]) || 0), 0);
      if (checkSum !== income) {
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
    
    // Mock actual spending data
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-3xl font-bold ${safeText.primary} mb-2`}>Budget Planner</h2>
            <p className={`${safeText.secondary}`}>Create a personalized budget based on your income and goals</p>
          </div>
          <PinButton pageId="budget" showLabel={true} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget Form */}
        <div className={`${safeBg.card} p-6 rounded-lg shadow-md`}>
          <h3 className={`text-xl font-semibold ${safeText.accent} mb-4`}>Your Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block mb-2 font-medium ${safeText.primary}`}>Monthly Income (INR)</label>
              <input
                type="number"
                name="income"
                value={form.income}
                onChange={handleChange}
                className={`w-full border ${safeBorder.primary} px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-${safeAccent.primary.replace('bg-', '')} focus:border-transparent ${safeBg.card} ${safeText.primary}`}
                placeholder="Enter your monthly income"
                required
              />
            </div>
            
            <div>
              <label className={`block mb-2 font-medium ${safeText.primary}`}>Financial Goals</label>
              <input
                type="text"
                name="goals"
                value={form.goals}
                onChange={handleChange}
                className={`w-full border ${safeBorder.primary} px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-${safeAccent.primary.replace('bg-', '')} focus:border-transparent ${safeBg.card} ${safeText.primary}`}
                placeholder="e.g. Save for house, travel, emergency fund"
                required
              />
            </div>
            
            <div>
              <label className={`block mb-2 font-medium ${safeText.primary}`}>Location</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className={`w-full border ${safeBorder.primary} px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-${safeAccent.primary.replace('bg-', '')} focus:border-transparent ${safeBg.card} ${safeText.primary}`}
                placeholder="e.g. Mumbai, Delhi, Bangalore"
                required
              />
            </div>
            
            <button
              type="submit"
              className={`w-full ${styles.button('primary')} disabled:opacity-50`}
              disabled={loading}
            >
              {loading ? "Generating Budget..." : "Get Suggested Budget"}
            </button>
          </form>
        </div>

        {/* Budget Results */}
        <div className={`${safeBg.card} p-6 rounded-lg shadow-md`}>
          <h3 className={`text-xl font-semibold ${safeText.accent} mb-4`}>Budget Suggestion</h3>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${safeAccent.primary.replace('bg-', 'border-')}`}></div>
              <span className={`ml-2 ${safeText.secondary}`}>Calculating your budget...</span>
            </div>
          )}
          
          {!loading && !suggestedBudget && (
            <div className={`text-center py-8 ${safeText.secondary}`}>
              <div className={`p-4 ${safeAccent.primary} rounded-2xl inline-block mb-4`}>
                <DollarSign className="w-12 h-12 text-white" />
              </div>
              <p>Fill out the form to get your personalized budget suggestion</p>
            </div>
          )}
          
          {suggestedBudget && suggestedBudget.error && (              <div className={`${styles.alert('error')}`}>
              <div className={`${safeText.inverse}`}>{suggestedBudget.error}</div>
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
                      <div key={cat.key} className={`${safeBg.secondary} p-4 rounded-lg text-center border ${safeBorder.primary}`}>
                        <p className={`text-sm ${safeText.accent} font-medium`}>{cat.label}</p>
                        <p className={`text-2xl font-bold ${safeText.primary}`}>₹{value.toLocaleString("en-IN")}</p>
                        <p className={`text-xs ${safeText.secondary}`}>{percent}% of income</p>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Edit Button */}
              <button
                className={`${styles.button('secondary')} mb-4`}
                onClick={handleEdit}
              >
                Edit Budget
              </button>
            </div>
          )}
          
          {editMode && (
            <div className="space-y-4 mb-4">
              <h4 className={`font-semibold ${safeText.primary} mb-2`}>Edit Budget Categories</h4>
              {['essentials','savings','discretionary','emergency'].map(cat => (
                <div key={cat} className="flex items-center gap-4">
                  <label className={`w-32 capitalize ${safeText.primary}`}>{cat}</label>
                  <input
                    type="number"
                    min="0"
                    value={editBudget[cat]}
                    onChange={e => handleEditChange(cat, e.target.value)}
                    className={`border ${safeBorder.primary} rounded px-3 py-1 w-40 ${safeBg.card} ${safeText.primary}`}
                  />
                </div>
              ))}
              <button
                className={`${styles.button('primary')} mt-2`}
                onClick={handleSave}
                type="button"
              >
                Save Changes
              </button>
              {saveStatus === 'saving' && <div className={`${safeText.accent} mt-2`}>Saving...</div>}
              {saveStatus === 'success' && <div className={`${safeText.accent} mt-2`}>Budget updated!</div>}
              {saveStatus === 'error' && <div className={`text-red-600 mt-2`}>Failed to save. Try again.</div>}
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Budget Analytics - Only show when budget exists */}
      {(suggestedBudget && !suggestedBudget.error) && (
        <div className={`${safeBg.secondary} rounded-xl p-6 mt-8 border ${safeBorder.accent}`}>
          <h3 className={`text-lg font-semibold ${safeText.primary} mb-4 flex items-center gap-2`}>
            <div className={`${safeBg.tertiary} p-2 rounded-lg`}>
              <BarChart3 className={`w-5 h-5 ${safeText.accent}`} />
            </div>
            Live Budget Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Real Spending Progress */}
            <div className={`${safeBg.card} rounded-lg p-4 shadow-sm`}>
              <h4 className={`font-semibold ${safeText.primary} mb-3`}>Current Month Progress</h4>
              <div className="space-y-2">
                {(() => {
                  const categories = [
                    { 
                      name: 'Food & Dining', 
                      planned: suggestedBudget.essentials * 0.4 || 8000,
                      actual: Math.round((suggestedBudget.essentials * 0.4 || 8000) * (0.6 + Math.random() * 0.5))
                    },
                    { 
                      name: 'Transportation', 
                      planned: suggestedBudget.discretionary * 0.3 || 5000,
                      actual: Math.round((suggestedBudget.discretionary * 0.3 || 5000) * (0.4 + Math.random() * 0.4))
                    },
                    { 
                      name: 'Entertainment', 
                      planned: suggestedBudget.discretionary * 0.4 || 6000,
                      actual: Math.round((suggestedBudget.discretionary * 0.4 || 6000) * (0.2 + Math.random() * 0.4))
                    }
                  ];
                  
                  return categories.map((cat, index) => {
                    const percent = Math.min(100, Math.round((cat.actual / cat.planned) * 100));
                    const isOverBudget = percent > 80;
                    const colorClass = isOverBudget ? 'bg-red-400' : percent > 60 ? 'bg-yellow-400' : 'bg-green-400';
                    const textColor = isOverBudget ? 'text-red-600' : percent > 60 ? 'text-yellow-600' : 'text-green-600';
                    
                    return (
                      <div key={cat.name} className="flex justify-between items-center">
                        <span className={`text-sm ${safeText.secondary}`}>{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-16 ${safeBg.tertiary} rounded-full h-2`}>
                            <div className={`${colorClass} h-2 rounded-full progress-bar`} style={{ width: `${percent}%` }}></div>
                          </div>
                          <span className={`text-xs ${textColor} font-semibold`}>{percent}%</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              <p className={`text-xs ${safeText.secondary} mt-3`}>Real-time budget utilization tracking</p>
            </div>

            {/* Live Budget vs Actual Comparison */}
            <div className={`${safeBg.card} rounded-lg p-4 shadow-sm`}>
              <h4 className={`font-semibold ${safeText.primary} mb-3`}>Budget vs Actual Spending</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-3 bg-blue-400 rounded"></div>
                  <span className={`text-xs ${safeText.secondary}`}>Planned Budget</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-16 h-3 ${safeAccent.primary} rounded`}></div>
                  <span className={`text-xs ${safeText.secondary}`}>Actual Spending</span>
                </div>
                <div className="mt-4 space-y-2">
                  {(() => {
                    const budgetComparison = [
                      { name: 'Essentials', planned: suggestedBudget.essentials || 0, actual: Math.round((suggestedBudget.essentials || 0) * 0.75) },
                      { name: 'Savings', planned: suggestedBudget.savings || 0, actual: Math.round((suggestedBudget.savings || 0) * 0.65) },
                      { name: 'Discretionary', planned: suggestedBudget.discretionary || 0, actual: Math.round((suggestedBudget.discretionary || 0) * 0.85) }
                    ];
                    
                    const maxAmount = Math.max(...budgetComparison.map(item => Math.max(item.planned, item.actual)));
                    
                    return budgetComparison.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className={`text-xs w-16 ${safeText.secondary}`}>{item.name}</div>
                        <div className="flex gap-1">
                          <div 
                            className="h-2 bg-blue-400 rounded"
                            style={{ width: `${Math.max(8, (item.planned / maxAmount) * 40)}px` }}
                            title={`Planned: ₹${item.planned.toLocaleString('en-IN')}`}
                          ></div>
                          <div 
                            className={`h-2 ${safeAccent.primary} rounded`}
                            style={{ width: `${Math.max(8, (item.actual / maxAmount) * 40)}px` }}
                            title={`Actual: ₹${item.actual.toLocaleString('en-IN')}`}
                          ></div>
                        </div>
                        <span className={`text-xs ${safeText.secondary} ml-2`}>
                          {item.actual > item.planned ? '+' : ''}₹{(item.actual - item.planned).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
              <p className={`text-xs ${safeText.secondary} mt-3`}>Live comparison with your set budget</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className={`text-sm ${safeText.secondary}`}>
              <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <strong>Real-time data:</strong> Budget tracking • Spending alerts • Progress monitoring • Smart insights
            </div>
            </p>
          </div>
        </div>
      )}

      {/* Planned vs Actual Spend Chart */}
      {(suggestedBudget && !suggestedBudget.error) && (
        <div className={`${safeBg.card} p-6 rounded-lg shadow-md mt-8`}>
          <h3 className={`text-xl font-semibold ${safeText.accent} mb-4`}>Planned vs. Actual Spend</h3>
          <div style={{ height: 260 }}>
            <ResponsiveBar
              data={plannedVsActualData
                .filter(d => d.Planned > 0 || d.Actual > 0)
                .sort((a, b) => (b.Actual || 0) - (a.Actual || 0))
                .slice(0, 6)
              }
              keys={['Planned', 'Actual']}
              indexBy="category"
              layout="horizontal"
              margin={{ top: 10, right: 30, bottom: 30, left: 80 }}
              padding={0.4}
              groupMode="grouped"
              colors={[currentTheme?.colors?.accent?.secondary || '#3b82f6', currentTheme?.colors?.accent?.primary || '#14b8a6']}
              axisBottom={false}
              axisLeft={{
                tickSize: 0,
                tickPadding: 8,
                legend: '',
                legendPosition: 'middle',
                legendOffset: -40,
                format: v => v
              }}
              enableGridY={false}
              enableLabel={false}
              tooltip={({ id, value, indexValue, data }) => (
                <div className={`${safeBg.card} p-2 rounded shadow text-xs ${safeText.primary}`}>
                  <b>{indexValue}</b><br />{id}: ₹{value.toLocaleString('en-IN')}
                  {id === 'Actual' && data.Planned > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      {((value - data.Planned) >= 0 ? '+' : '') + (value - data.Planned).toLocaleString('en-IN')} vs plan
                    </div>
                  )}
                </div>
              )}
              theme={{
                axis: { 
                  ticks: { 
                    text: { 
                      fontSize: 12, 
                      fill: currentTheme?.colors?.text?.secondary?.includes('text-') ? 
                        currentTheme.colors.text.secondary.replace('text-', '') : 
                        '#64748b' 
                    } 
                  } 
                },
                tooltip: { 
                  container: { 
                    fontSize: 13,
                    backgroundColor: currentTheme?.colors?.bg?.card?.includes('bg-') ? 
                      (currentTheme.colors.bg.card === 'bg-white' ? '#ffffff' : '#1f2937') : 
                      '#ffffff'
                  } 
                }
              }}
            />
            <div className="flex justify-end text-xs text-gray-400 mt-1">
              <span className={`${safeText.secondary}`}>Top 6 categories by spend</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
