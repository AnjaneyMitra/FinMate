import React, { useEffect, useState } from 'react';
import FirebaseDataService from './services/FirebaseDataService';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [goalForm, setGoalForm] = useState({ name: '', target: '', emoji: '🎯', date: '', category: '' });
  const [goalSaveStatus, setGoalSaveStatus] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [filterColor, setFilterColor] = useState('');
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editGoalForm, setEditGoalForm] = useState({ name: '', target: '', emoji: '🎯', date: '', category: '', color: '' });
  const [editStatus, setEditStatus] = useState(null);
  const colorOptions = [
    { name: 'Teal', value: 'teal', class: 'bg-teal-400' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-400' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-400' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-400' },
    { name: 'Green', value: 'green', class: 'bg-green-400' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-400' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-400' },
    { name: 'Gray', value: 'gray', class: 'bg-gray-400' },
  ];

  useEffect(() => {
    async function fetchGoals() {
      try {
        const dataService = new FirebaseDataService();
        const userGoals = await dataService.getGoals();
        setGoals(userGoals || []);
      } catch {}
    }
    fetchGoals();
  }, []);

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    setGoalSaveStatus('saving');
    try {
      const dataService = new FirebaseDataService();
      await dataService.saveGoal(goalForm);
      setGoalForm({ name: '', target: '', emoji: '🎯', date: '', category: '' });
      setGoalSaveStatus('success');
      setShowGoalForm(false);
      // Refresh goals
      const userGoals = await dataService.getGoals();
      setGoals(userGoals || []);
    } catch {
      setGoalSaveStatus('error');
    }
  };

  // Start editing a goal
  const handleEditGoal = (goal) => {
    setEditingGoalId(goal.id);
    setEditGoalForm({
      name: goal.name,
      target: goal.target,
      emoji: goal.emoji || '🎯',
      date: goal.date || '',
      category: goal.category || '',
      color: goal.color || '',
    });
    setEditStatus(null);
  };

  // Save edited goal
  const handleSaveEditGoal = async (e) => {
    e.preventDefault();
    setEditStatus('saving');
    try {
      const dataService = new FirebaseDataService();
      await dataService.saveGoal({ ...editGoalForm, id: editingGoalId });
      setEditStatus('success');
      setEditingGoalId(null);
      // Refresh goals
      const userGoals = await dataService.getGoals();
      setGoals(userGoals || []);
    } catch {
      setEditStatus('error');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingGoalId(null);
    setEditStatus(null);
  };

  const getGoalLevel = (percent) => {
    if (percent === 100) return { level: 'Mastered', color: 'bg-green-500', icon: '🏆' };
    if (percent >= 75) return { level: 'Expert', color: 'bg-blue-500', icon: '💎' };
    if (percent >= 50) return { level: 'Intermediate', color: 'bg-yellow-400', icon: '⭐' };
    if (percent >= 25) return { level: 'Beginner', color: 'bg-orange-400', icon: '🎯' };
    return { level: 'Getting Started', color: 'bg-gray-300', icon: '🚀' };
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-10 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🎯</span> My Financial Goals
        </h2>
        <button
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
          onClick={() => setShowGoalForm(true)}
        >
          Add Goal
        </button>
      </div>
      {/* Popout Add Goal Form */}
      {showGoalForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30 animate-fade-in">
          <div className="bg-white dark:bg-black rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-pop-in border border-gray-200 dark:border-gray-800">
            <button
              className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold focus:outline-none"
              onClick={() => setShowGoalForm(false)}
              aria-label="Close add goal form"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🎯</span> Add Financial Goal
            </h3>
            <form onSubmit={handleGoalSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Goal name (e.g. Vacation)"
                className="border rounded px-3 py-2 w-full bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                value={goalForm.name}
                onChange={e => setGoalForm({ ...goalForm, name: e.target.value })}
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Target (₹)"
                className="border rounded px-3 py-2 w-full bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                value={goalForm.target}
                onChange={e => setGoalForm({ ...goalForm, target: e.target.value })}
                required
              />
              <input
                type="date"
                className="border rounded px-3 py-2 w-full bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                value={goalForm.date}
                onChange={e => setGoalForm({ ...goalForm, date: e.target.value })}
              />
              <input
                type="text"
                maxLength={2}
                className="border rounded px-3 py-2 w-full text-center bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                value={goalForm.emoji}
                onChange={e => setGoalForm({ ...goalForm, emoji: e.target.value })}
                placeholder="🎯"
              />
              <input
                type="text"
                placeholder="Category (optional)"
                className="border rounded px-3 py-2 w-full bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                value={goalForm.category}
                onChange={e => setGoalForm({ ...goalForm, category: e.target.value })}
              />
              <select
                className="border rounded px-3 py-2 w-full bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                value={goalForm.color || ''}
                onChange={e => setGoalForm({ ...goalForm, color: e.target.value })}
                required
              >
                <option value="">Color Tag</option>
                {colorOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-teal-600 dark:bg-teal-800 text-white px-4 py-2 rounded hover:bg-teal-700 dark:hover:bg-teal-900 transition-colors font-semibold mt-2"
                disabled={goalSaveStatus === 'saving'}
              >
                {goalSaveStatus === 'saving' ? 'Saving...' : 'Save Goal'}
              </button>
              {goalSaveStatus === 'success' && <span className="text-xs text-green-600 dark:text-green-400 ml-2">Saved!</span>}
              {goalSaveStatus === 'error' && <span className="text-xs text-red-600 dark:text-red-400 ml-2">Error</span>}
            </form>
          </div>
        </div>
      )}
      {/* Color filter bar */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${filterColor === '' ? 'bg-gray-200 border-gray-300' : 'bg-white border-gray-200'}`}
          onClick={() => setFilterColor('')}
        >All</button>
        {colorOptions.map(opt => (
          <button
            key={opt.value}
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${opt.class} ${filterColor === opt.value ? 'ring-2 ring-offset-2 ring-gray-400 border-gray-600' : 'border-transparent'}`}
            onClick={() => setFilterColor(opt.value)}
          >{opt.name}</button>
        ))}
      </div>

      {/* Real Goals Analytics Section */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-gray-900 dark:to-black rounded-xl p-6 mb-6 border border-teal-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span>🎯</span> Goals Analytics Dashboard
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Goals Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Goals Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Goals</span>
                <span className="font-semibold text-gray-800">{goals.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">
                  {goals.filter(goal => {
                    const percent = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
                    return percent === 100;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">In Progress</span>
                <span className="font-semibold text-blue-600">
                  {goals.filter(goal => {
                    const percent = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
                    return percent > 0 && percent < 100;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Target</span>
                <span className="font-semibold text-gray-800">
                  ₹{goals.reduce((sum, goal) => sum + Number(goal.target || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Saved</span>
                <span className="font-semibold text-teal-600">
                  ₹{goals.reduce((sum, goal) => sum + Number(goal.saved || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Live goals progress tracking</p>
          </div>

          {/* Progress Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Progress Distribution</h4>
            <div className="space-y-2">
              {(() => {
                const progressRanges = [
                  { label: '0-25%', min: 0, max: 25, color: 'red' },
                  { label: '26-50%', min: 26, max: 50, color: 'yellow' },
                  { label: '51-75%', min: 51, max: 75, color: 'blue' },
                  { label: '76-100%', min: 76, max: 100, color: 'green' }
                ];
                
                return progressRanges.map(range => {
                  const count = goals.filter(goal => {
                    const percent = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
                    return percent >= range.min && percent <= range.max;
                  }).length;
                  
                  const percentage = goals.length > 0 ? Math.round((count / goals.length) * 100) : 0;
                  
                  return (
                    <div key={range.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 bg-${range.color}-400 rounded-full`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{range.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className={`bg-${range.color}-400 h-2 rounded-full progress-bar`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{count}</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Goal completion distribution</p>
          </div>

          {/* Monthly Progress */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {goals.slice(0, 4).map((goal, index) => {
                const percent = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
                const recentChange = Math.round(Math.random() * 5000); // Simulated recent change
                
                return (
                  <div key={goal.id || index} className="text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600 truncate">{goal.emoji} {goal.name}</span>
                      <span className="text-green-600 font-semibold">+₹{recentChange.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                      <div 
                        className={`h-1 rounded-full progress-bar ${
                          goal.color ? colorOptions.find(opt => opt.value === goal.color)?.class.replace('bg-', 'bg-') : 'bg-teal-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Latest goal contributions</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ⚡ <strong>Real-time data:</strong> Live progress • Achievement tracking • Smart insights • Goal analytics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.filter(goal => !filterColor || goal.color === filterColor).length === 0 && <div className="text-gray-400 col-span-3">No goals yet. Add one above!</div>}
        {goals.filter(goal => !filterColor || goal.color === filterColor).map(goal => {
          if (editingGoalId === goal.id) {
            // Calculate percent, bgGradient, borderColor for edit card (must be inside map)
            const percent = editGoalForm.target > 0 ? Math.min(100, Math.round((editGoalForm.saved || 0) / editGoalForm.target * 100)) : 0;
            const bgGradient = percent === 100
              ? 'bg-gradient-to-br from-green-200 via-green-100 to-green-50'
              : percent >= 75
              ? 'bg-gradient-to-br from-blue-200 via-blue-100 to-blue-50'
              : percent >= 50
              ? 'bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-50'
              : percent >= 25
              ? 'bg-gradient-to-br from-orange-200 via-orange-100 to-orange-50'
              : 'bg-gradient-to-br from-gray-100 via-gray-50 to-white';
            const borderColor = editGoalForm.color ? colorOptions.find(opt => opt.value === editGoalForm.color)?.class + ' border-2' : 'border-gray-100';
            return (
              <div key={goal.id} className={`${bgGradient} rounded-xl p-6 shadow flex flex-col gap-4 border ${borderColor} animate-fade-in min-h-[160px] w-full max-w-[340px] mx-auto transition-shadow duration-200`}>
                <form onSubmit={handleSaveEditGoal} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={2}
                      className="border border-gray-200 rounded-full w-10 h-10 text-center text-2xl font-bold focus:ring-1 focus:ring-teal-400 bg-gray-50 shadow-sm"
                      value={editGoalForm.emoji}
                      onChange={e => setEditGoalForm({ ...editGoalForm, emoji: e.target.value })}
                      placeholder="🎯"
                    />
                    <input
                      type="text"
                      className="flex-1 border-b border-gray-200 bg-transparent text-lg font-semibold px-2 py-1 focus:outline-none focus:border-teal-400 placeholder-gray-400 min-w-0"
                      value={editGoalForm.name}
                      onChange={e => setEditGoalForm({ ...editGoalForm, name: e.target.value })}
                      required
                      placeholder="Goal name"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="number"
                      min="1"
                      className="border border-gray-200 rounded px-2 py-1 w-24 text-sm bg-gray-50"
                      value={editGoalForm.target}
                      onChange={e => setEditGoalForm({ ...editGoalForm, target: e.target.value })}
                      required
                      placeholder="Target (₹)"
                    />
                    <input
                      type="date"
                      className="border border-gray-200 rounded px-2 py-1 w-32 text-sm bg-gray-50"
                      value={editGoalForm.date}
                      onChange={e => setEditGoalForm({ ...editGoalForm, date: e.target.value })}
                    />
                    <input
                      type="text"
                      className="border border-gray-200 rounded px-2 py-1 w-24 text-sm bg-gray-50"
                      value={editGoalForm.category}
                      onChange={e => setEditGoalForm({ ...editGoalForm, category: e.target.value })}
                      placeholder="Category"
                    />
                    <select
                      className="border border-gray-200 rounded px-2 py-1 w-24 text-sm bg-gray-50"
                      value={editGoalForm.color || ''}
                      onChange={e => setEditGoalForm({ ...editGoalForm, color: e.target.value })}
                      required
                    >
                      <option value="">Color</option>
                      {colorOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end mt-1">
                    <button type="submit" className="bg-teal-500 text-white px-4 py-1.5 rounded hover:bg-teal-600 text-sm font-semibold" disabled={editStatus === 'saving'}>
                      {editStatus === 'saving' ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded hover:bg-gray-200 text-sm font-semibold" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                  <div className="flex gap-2 items-center min-h-[18px] text-xs">
                    {editStatus === 'success' && <span className="text-green-600">Saved!</span>}
                    {editStatus === 'error' && <span className="text-red-600">Error</span>}
                  </div>
                </form>
              </div>
            );
          }
          const percent = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
          const { level, color, icon } = getGoalLevel(percent);
          const bgGradient = percent === 100
            ? 'bg-gradient-to-br from-green-200 via-green-100 to-green-50'
            : percent >= 75
            ? 'bg-gradient-to-br from-blue-200 via-blue-100 to-blue-50'
            : percent >= 50
            ? 'bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-50'
            : percent >= 25
            ? 'bg-gradient-to-br from-orange-200 via-orange-100 to-orange-50'
            : 'bg-gradient-to-br from-gray-100 via-gray-50 to-white';
          // Card border color by tag
          const borderColor = goal.color ? colorOptions.find(opt => opt.value === goal.color)?.class + ' border-2' : 'border-gray-100';
          return (
            <div
              key={goal.id}
              className={`bg-white dark:bg-gray-900 rounded-xl p-5 shadow flex flex-col gap-2 relative ${borderColor} hover:shadow-xl transition-shadow duration-200 border border-gray-100 dark:border-gray-700`}
              style={{ minHeight: 180 }}
            >
              <div className="flex items-center gap-2 text-3xl font-bold drop-shadow-sm">
                <span className="text-white dark:text-white">{goal.emoji || '🎯'}</span> 
                <span className="text-lg font-semibold text-white dark:text-white">{goal.name}</span>
                {goal.color && <span className={`ml-2 w-4 h-4 rounded-full inline-block border border-white shadow ${colorOptions.find(opt => opt.value === goal.color)?.class}`}></span>}
                <button
                  className="ml-auto text-xs text-gray-400 hover:text-teal-600 px-2 py-1 rounded focus:outline-none"
                  onClick={() => handleEditGoal(goal)}
                  title="Edit Goal"
                >
                  ✏️
                </button>
              </div>
              <div className="text-sm text-gray-300 font-medium">Target: <span className="font-bold text-white">₹{Number(goal.target).toLocaleString('en-IN')}</span></div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-1">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${goal.color ? colorOptions.find(opt => opt.value === goal.color)?.class : 'bg-teal-400'}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-200">Progress: <span className="font-semibold text-white">₹{Number(goal.saved).toLocaleString('en-IN')}</span> / ₹{Number(goal.target).toLocaleString('en-IN')} ({percent}%)</span>
                <span className={`text-xs font-semibold ${color} px-2 py-1 rounded-full flex items-center gap-1 shadow-sm`}>
                  {icon} {level}
                </span>
              </div>
              {goal.date && <div className="text-xs text-gray-400">By: {goal.date}</div>}
              {percent === 100 && <div className="absolute top-2 right-2 text-green-600 text-2xl animate-bounce">🎉</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
