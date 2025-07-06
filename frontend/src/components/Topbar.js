import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Search, Command, ChevronDown, LogOut, User } from 'lucide-react';

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
    <header className="flex items-center justify-between px-4 lg:px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
      {/* Left Side: Search Icon/Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        {!searchExpanded ? (
          /* Search Icon */
          <button
            onClick={handleSearchIconClick}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200"
            title="Search (Cmd+K)"
          >
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Search</span>
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 ml-2">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
        ) : (
          /* Expanded Search Bar */
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <div className="relative animate-slide-in">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-teal-500" />
              </div>
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={handleSearchBlur}
                placeholder="Search transactions, categories..."
                className="w-full pl-10 pr-12 py-2.5 text-sm bg-white border border-teal-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-100 shadow-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setSearchExpanded(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
        <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500">
          <span className="font-bold text-gray-700">🏠 Home</span>
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.path} className="flex items-center gap-2">
              <span className="mx-1 text-gray-300">/</span>
              <span className={`transition-colors ${
                idx === breadcrumbs.length - 1 
                  ? 'text-gray-900 font-semibold' 
                  : 'hover:text-gray-700'
              }`}>
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right Side: User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          
          {/* User Info - Hidden on mobile */}
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-gray-700">
              {user?.email?.split('@')[0]}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-32">
              {user?.email}
            </div>
          </div>
          
          {/* Dropdown Arrow */}
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-slide-down">
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
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
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                View Profile
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
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
