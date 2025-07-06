import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, X, PiggyBank, Receipt, Target, TrendingUp } from 'lucide-react';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const quickActions = [
    {
      id: 'transaction',
      label: 'Add Transaction',
      icon: Receipt,
      path: '/dashboard/transactions',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Record new expense',
    },
    {
      id: 'budget',
      label: 'Set Budget',
      icon: PiggyBank,
      path: '/dashboard/budget',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Plan your spending',
    },
    {
      id: 'goal',
      label: 'Create Goal',
      icon: Target,
      path: '/dashboard/goals',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Set financial target',
    },
    {
      id: 'analysis',
      label: 'Quick Analysis',
      icon: TrendingUp,
      path: '/dashboard/spending',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'View insights',
    },
  ];

  const handleActionClick = (action) => {
    navigate(action.path);
    setIsOpen(false);
  };

  // Don't show FAB on mobile if user is already on a form page
  const isOnFormPage = ['/dashboard/transactions', '/dashboard/budget', '/dashboard/goals'].includes(location.pathname);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-slide-in">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={action.id}
                className="flex items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Action Label */}
                <div className="hidden sm:flex flex-col items-end">
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg">
                    <div className="text-sm font-medium">{action.label}</div>
                    <div className="text-xs text-gray-300">{action.description}</div>
                  </div>
                  {/* Arrow pointing to button */}
                  <div className="w-0 h-0 border-l-8 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent ml-auto mr-3 -mt-1"></div>
                </div>
                
                {/* Action Button */}
                <button
                  onClick={() => handleActionClick(action)}
                  className={`w-12 h-12 rounded-full ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center group`}
                  title={action.label}
                >
                  <IconComponent className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'
        } ${isOnFormPage ? 'sm:hidden' : ''}`}
        title={isOpen ? 'Close' : 'Quick Actions'}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200" />
        ) : (
          <Plus className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
        )}
      </button>

      {/* Mobile quick action hint */}
      {!isOpen && (
        <div className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none sm:hidden">
          Quick Actions
        </div>
      )}
    </div>
  );
};

export default FloatingActionButton;
