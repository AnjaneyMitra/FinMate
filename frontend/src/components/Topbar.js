import React from 'react';
import { useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function getBreadcrumbs(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = [];
  let path = '';
  for (let i = 0; i < parts.length; i++) {
    path += '/' + parts[i];
    crumbs.push({ label: parts[i][0].toUpperCase() + parts[i].slice(1), path });
  }
  return crumbs;
}

export default function Topbar({ user, setUser }) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname.replace('/dashboard', ''));
  
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
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-bold text-gray-700">🏠 Home</span>
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.path} className="flex items-center gap-2">
            <span className="mx-1">/</span>
            <span className={idx === breadcrumbs.length - 1 ? 'text-gray-900 font-semibold' : ''}>{crumb.label}</span>
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
        <button className="bg-teal-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-teal-700 transition-colors">New</button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600 px-2 py-1 rounded text-sm transition-colors"
            title="Logout"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </header>
  );
}
