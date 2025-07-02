import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const sidebarItems = [
  { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
  { label: 'Budget Planner', icon: '💰', path: '/dashboard/budget' },
  { label: 'Transactions', icon: '➕', path: '/dashboard/transactions' },
  { label: 'Goals', icon: '🎯', path: '/dashboard/goals' },
  { label: 'Analytics', icon: '📊', path: '/dashboard/spending' },
  { label: 'AI Predictions', icon: '🔮', path: '/dashboard/predictions' },
  { label: 'Month Comparison', icon: '📈', path: '/dashboard/comparison' },
  { label: 'Tax Filing', icon: '📋', path: '/tax-filing' },
  { label: 'Settings', icon: '⚙️', path: '/dashboard/settings' },
];

export default function Sidebar({ user, setUser }) {
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (setUser) {
        setUser(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <span className="text-2xl">🧩</span>
          <span className="font-bold text-lg tracking-tight">FinMate</span>
        </div>
        <nav className="mt-4">
          {sidebarItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg mx-2 mb-1 text-gray-700 hover:bg-gray-100 transition-colors font-medium ${location.pathname.startsWith(item.path) ? 'bg-gray-100 font-semibold' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800">{user?.email?.split('@')[0]}</div>
            <div className="text-xs text-gray-400">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
