import React from 'react';
import { useLocation } from 'react-router-dom';

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

export default function Topbar({ user }) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname.replace('/dashboard', ''));
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
      </div>
    </header>
  );
}
