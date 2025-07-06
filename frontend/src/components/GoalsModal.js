import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Target, Calendar, CheckCircle, Trophy, Target as TargetIcon, TrendingUp, Rocket, Star } from 'lucide-react';
import RadialProgress from './RadialProgress';

const GoalsModal = ({ isOpen, onClose, goals = [] }) => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [animatedGoals, setAnimatedGoals] = useState([]);

  useEffect(() => {
    if (isOpen && goals.length > 0) {
      // Animate goals appearance
      const timer = setTimeout(() => {
        setAnimatedGoals(goals);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, goals]);

  const getGoalStatus = (percentage) => {
    if (percentage >= 100) return { status: 'completed', color: 'green', icon: <Trophy className="w-4 h-4" /> };
    if (percentage >= 75) return { status: 'almost-there', color: 'amber', icon: <TargetIcon className="w-4 h-4" /> };
    if (percentage >= 50) return { status: 'on-track', color: 'blue', icon: <TrendingUp className="w-4 h-4" /> };
    if (percentage >= 25) return { status: 'getting-started', color: 'purple', icon: <Rocket className="w-4 h-4" /> };
    return { status: 'just-started', color: 'teal', icon: <Star className="w-4 h-4" /> };
  };

  // Format numbers with proper Indian currency format
  const formatCurrency = (amount) => {
    if (amount === 0) return '₹0';
    if (amount >= 10000000) { // 1 crore
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }
    if (amount >= 100000) { // 1 lakh
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) { // 1 thousand
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-amber-600' };
    if (diffDays <= 7) return { text: `${diffDays} days left`, color: 'text-orange-600' };
    if (diffDays <= 30) return { text: `${diffDays} days left`, color: 'text-yellow-600' };
    return { text: `${diffDays} days left`, color: 'text-gray-600' };
  };

  const totalSaved = goals.reduce((sum, goal) => sum + (goal.saved || 0), 0);
  const totalTarget = goals.reduce((sum, goal) => sum + (goal.target || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-teal-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Goals Overview</h2>
                <p className="text-sm text-gray-600">
                  {goals.length} active goal{goals.length !== 1 ? 's' : ''} • {formatCurrency(totalSaved)} saved of {formatCurrency(totalTarget)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Overall Progress */}
          <div className="mb-6 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center min-w-0">
                    <div className="text-2xl font-bold text-teal-600">{goals.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Active Goals</div>
                  </div>
                  <div className="text-center min-w-0">
                    <div className="text-2xl font-bold text-green-600">
                      {goals.filter(g => {
                        const percent = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
                        return percent >= 100;
                      }).length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Completed</div>
                  </div>
                  <div className="text-center min-w-0">
                    <div className="text-sm font-bold text-blue-600 break-all px-1">{formatCurrency(totalSaved)}</div>
                    <div className="text-xs text-gray-500 mt-1">Total Saved</div>
                  </div>
                  <div className="text-center min-w-0">
                    <div className="text-sm font-bold text-purple-600 break-all px-1">{formatCurrency(totalTarget)}</div>
                    <div className="text-xs text-gray-500 mt-1">Total Target</div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="flex flex-col items-center">
                  <RadialProgress
                    percentage={overallProgress}
                    size={120}
                    strokeWidth={8}
                    color="teal"
                    saved={totalSaved}
                    target={totalTarget}
                    showPercentage={true}
                    showAmounts={false}
                  />
                  <div className="text-xs text-gray-600 mt-2 text-center max-w-[120px]">
                    Overall Progress
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animatedGoals.map((goal, index) => {
              const percentage = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
              const { status, color, icon } = getGoalStatus(percentage);
              const deadline = formatDeadline(goal.date);
              const remaining = Math.max(0, goal.target - goal.saved);

              return (
                <div
                  key={goal.id}
                  className={`bg-white rounded-xl border-2 p-4 transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-in min-h-[300px] ${
                    selectedGoal?.id === goal.id ? 'ring-2 ring-teal-500 border-teal-300' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)}
                >
                  {/* Header with title and status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{goal.emoji || '🎯'}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 break-words">
                          {goal.name}
                        </h4>
                        {goal.category && (
                          <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1">
                            {goal.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <div className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                        status === 'completed' ? 'bg-green-100 text-green-800' :
                        status === 'almost-there' ? 'bg-amber-100 text-amber-800' :
                        status === 'on-track' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {icon} {percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Progress and Amount Section */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <RadialProgress
                        percentage={percentage}
                        size={70}
                        strokeWidth={5}
                        color={color}
                        saved={goal.saved}
                        target={goal.target}
                        showPercentage={true}
                        showAmounts={false}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 mb-1 break-all">
                        {formatCurrency(goal.saved)}
                      </div>
                      <div className="text-xs text-gray-500 mb-2 break-all">
                        of {formatCurrency(goal.target)}
                      </div>
                      {remaining > 0 && (
                        <div className="text-xs text-orange-600 font-medium break-all">
                          {formatCurrency(remaining)} remaining
                        </div>
                      )}
                      {percentage >= 100 && (
                        <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Goal Achieved!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deadline */}
                  {deadline && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                      <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className={`text-xs font-medium ${deadline.color}`}>
                        {deadline.text}
                      </span>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {selectedGoal?.id === goal.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress Rate</span>
                            <span className="font-medium text-gray-900">
                              {Math.round((goal.saved / goal.target) * 100)}% complete
                            </span>
                          </div>
                          {goal.date && (
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600">Target Date</span>
                              <span className="font-medium text-gray-900">
                                {new Date(goal.date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Monthly Need</span>
                            <span className="font-medium text-gray-900 break-all">
                              {goal.date ? 
                                formatCurrency(Math.round(remaining / Math.max(1, Math.ceil((new Date(goal.date) - new Date()) / (1000 * 60 * 60 * 24 * 30))))) : 
                                'N/A'
                              }
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          Click again to collapse details
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {goals.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Yet</h3>
              <p className="text-gray-600 mb-4">Start by setting your first financial goal!</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard/goals');
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Your First Goal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalsModal;
