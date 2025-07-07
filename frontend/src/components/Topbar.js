import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Command, ChevronDown, LogOut, User } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

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
  
  // Add theme context
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  
  // Safe fallbacks for theme properties
  const safeBg = bg || {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    card: 'bg-white'
  };
  const safeText = text || {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500'
  };
  const safeBorder = border || {
    primary: 'border-gray-200'
  };
  const safeAccent = accent || {
    primary: 'text-teal-600',
    secondary: 'text-teal-500',
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    ring: 'ring-teal-500'
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
  };

  const handleSearchIconClick = () => {
    setSearchExpanded(true);
    // Focus the input after the animation starts
    setTimeout(() => {
      document.getElementById('search-input')?.focus();
    }, 100);
  };

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      setSearchExpanded(false);
    }
  };

  return (
    <header className={`flex items-center justify-between px-4 lg:px-8 py-4 border-b ${safeBorder.primary} ${safeBg.card} sticky top-0 z-20 shadow-sm`}>
      {/* Left Side: Search Icon/Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        {!searchExpanded ? (
          /* Search Icon */
          <button
            onClick={handleSearchIconClick}
            className={`flex items-center gap-2 px-3 py-2 ${safeText.secondary} hover:${safeAccent.primary} hover:${safeAccent.bg} rounded-lg transition-all duration-200`}
            title="Search (Cmd+K)"
          >
            <Search className="w-5 h-5" />
            <span className={`hidden sm:inline text-sm`}>Search</span>
            <div className={`hidden sm:flex items-center gap-1 text-xs ${safeText.tertiary} ml-2`}>
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
        ) : (
          /* Expanded Search Bar */
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <div className="relative animate-slide-in">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`w-4 h-4 ${safeAccent.secondary}`} />
              </div>
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={handleSearchBlur}
                placeholder="Search transactions, categories..."
                className={`w-full pl-10 pr-12 py-2.5 text-sm ${safeBg.card} border ${safeAccent.border} rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:${safeAccent.ring} shadow-sm ${safeText.primary}`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setSearchExpanded(false);
                    setSearchQuery('');
                  }}
                  className={`${safeText.tertiary} hover:${safeText.secondary} transition-colors`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        )}
        
        {/* Breadcrumbs */}
        <nav className={`hidden md:flex items-center gap-2 text-sm ${safeText.tertiary}`}>
          <span className={`font-bold ${safeText.secondary}`}>🏠 Home</span>
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.path} className="flex items-center gap-2">
              <span className={`mx-1 ${safeText.tertiary}`}>/</span>
              <span className={`transition-colors ${
                idx === breadcrumbs.length - 1 
                  ? `${safeText.primary} font-semibold` 
                  : `hover:${safeText.secondary}`
              }`}>
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Theme Switcher */}
      <ThemeSwitcher />

      {/* Right Side: User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`flex items-center gap-3 p-2 rounded-lg hover:${safeBg.secondary} transition-colors focus:outline-none focus:ring-2 focus:${safeAccent.ring} focus:ring-offset-2`}
        >
          {/* User Avatar */}
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-${safeAccent.primary.replace('text-', '')} to-blue-500 flex items-center justify-center text-white font-bold text-sm`}>
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          
          {/* User Info - Hidden on mobile */}
          <div className="hidden sm:block text-left">
            <div className={`text-sm font-medium ${safeText.secondary}`}>
              {user?.email?.split('@')[0]}
            </div>
            <div className={`text-xs ${safeText.tertiary} truncate max-w-32`}>
              {user?.email}
            </div>
          </div>
          
          {/* Dropdown Arrow */}
          <ChevronDown className={`w-4 h-4 ${safeText.tertiary} transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className={`absolute right-0 mt-2 w-64 ${safeBg.card} rounded-lg shadow-lg border ${safeBorder.primary} py-2 z-50 animate-slide-down`}>
            {/* User Info Section */}
            <div className={`px-4 py-3 border-b ${safeBorder.primary}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${safeAccent.primary.replace('text-', '')} to-blue-500 flex items-center justify-center text-white font-bold text-lg`}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${safeText.primary} truncate`}>
                    {user?.email?.split('@')[0]}
                  </div>
                  <div className={`text-xs ${safeText.tertiary} truncate`}>
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  // TODO: Add profile/settings navigation
                  console.log('Navigate to profile');
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${safeText.secondary} hover:${safeBg.secondary} transition-colors`}
              >
                <User className="w-4 h-4" />
                View Profile
              </button>
              
              <div className={`border-t ${safeBorder.primary} my-1`}></div>
              
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
