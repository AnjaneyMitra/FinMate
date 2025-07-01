import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

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

  // --- Dark Mode State ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // --- Dark Mode Toggle Function ---
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('finmate-dark-mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('finmate-dark-mode', 'false');
      }
      return newMode;
    });
  };

  // Sync dark mode state with localStorage changes (for multi-tab)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'finmate-dark-mode') {
        setDarkMode(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // On mount, sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('finmate-dark-mode');
      setDarkMode(stored === 'true');
    }
  }, []);

  return (
    <div className="w-full bg-white dark:bg-black shadow-sm px-6 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 z-30">
      <div className="flex items-center gap-3">
        <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">FinMate</span>
        {/* Breadcrumbs */}
        <nav className="ml-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
          <span className="text-gray-400 dark:text-gray-500">/</span>
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.path} className="flex items-center gap-2">
              {crumb.label}
              {idx < breadcrumbs.length - 1 && <span className="text-gray-400 dark:text-gray-500">/</span>}
            </span>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-full p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
        </button>
        {/* User Info */}
        {user && (
          <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{user.email}</span>
        )}
      </div>
    </div>
  );
}
