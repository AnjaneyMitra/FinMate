import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Home, 
  Zap, 
  PiggyBank, 
  Target, 
  Plus, 
  History, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Calculator, 
  User, 
  Receipt, 
  FileText, 
  Settings, 
  Database,
  ChevronDown,
  MoreVertical,
  PinOff,
  Grip,
  Palette
} from 'lucide-react';

export default function Sidebar({ user, setUser }) {
  const location = useLocation();
  const { getPinnedItems, unpinItem, reorderItems } = useSidebar();
  
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
    accent: 'text-teal-600'
  };
  const safeBorder = border || {
    primary: 'border-gray-200',
    secondary: 'border-gray-100'
  };
  const safeAccent = accent || {
    primary: 'bg-teal-600'
  };
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({
    planning: true,
    analytics: true,
    investments: false,
    taxes: false,
  });
  const dropdownRef = useRef(null);

  // Icon mapping for consistent iconography
  const iconMap = {
    'dashboard': Home,
    'quick-actions': Zap,
    'budget': PiggyBank,
    'goals': Target,
    'transactions': Plus,
    'history': History,
    'analytics': BarChart3,
    'predictions': TrendingUp,
    'comparison': Calendar,
    'learning': BookOpen,
    'simulation': Calculator,
    'risk': User,
    'tax-breakdown': Receipt,
    'tax-estimator': Calculator,
    'tax-filing': FileText,
    'settings': Settings,
    'themes': Palette,
    'firestore-test': Database,
  };

  // Group navigation items
  const navigationGroups = [
    {
      id: 'core',
      name: 'Core',
      items: ['dashboard', 'quick-actions'],
      alwaysExpanded: true,
    },
    {
      id: 'planning',
      name: 'Financial Planning',
      items: ['budget', 'goals', 'transactions'],
      alwaysExpanded: false,
    },
    {
      id: 'analytics',
      name: 'Analytics & Insights',
      items: ['analytics', 'history', 'predictions', 'comparison'],
      alwaysExpanded: false,
    },
    {
      id: 'investments',
      name: 'Investments',
      items: ['learning', 'simulation', 'risk'],
      alwaysExpanded: false,
    },
    {
      id: 'taxes',
      name: 'Tax Management',
      items: ['tax-breakdown', 'tax-estimator', 'tax-filing'],
      alwaysExpanded: false,
    },
    {
      id: 'system',
      name: 'System',
      items: ['settings', 'themes', 'firestore-test'],
      alwaysExpanded: true,
    },
  ];

  const sidebarItems = getPinnedItems();

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const getGroupItems = (groupItems) => {
    return sidebarItems.filter(item => groupItems.includes(item.id));
  };

  const renderIcon = (iconKey, className = "w-5 h-5") => {
    const IconComponent = iconMap[iconKey];
    return IconComponent ? <IconComponent className={className} /> : <Home className={className} />;
  };
  
  const handleDragStart = (e, item, index) => {
    if (item.isDefault) return; // Don't allow dragging default items
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem && draggedItem.index !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.index === dropIndex) return;

    const newItems = [...sidebarItems];
    const [movedItem] = newItems.splice(draggedItem.index, 1);
    newItems.splice(dropIndex, 0, movedItem);
    
    reorderItems(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleUnpin = (itemId, e) => {
    e.preventDefault();
    e.stopPropagation();
    unpinItem(itemId);
    setShowDropdown(null);
  };

  const toggleDropdown = (itemId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(showDropdown === itemId ? null : itemId);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (item) => {
    if (item.path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside className={`h-screen w-64 ${safeBg.card} border-r ${safeBorder.primary} flex flex-col shadow-sm`}>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center gap-3 px-6 py-5 border-b ${safeBorder.secondary} ${safeBg.secondary}`}>
          <div className={`w-8 h-8 ${safeAccent.primary} rounded-lg flex items-center justify-center`}>
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className={`font-bold text-xl tracking-tight ${safeText.primary}`}>FinMate</span>
        </div>

        {/* Navigation Groups */}
        <nav className="py-4 space-y-1">
          {navigationGroups.map((group) => {
            const groupItems = getGroupItems(group.items);
            if (groupItems.length === 0) return null;

            const isExpanded = group.alwaysExpanded || expandedGroups[group.id];

            return (
              <div key={group.id} className="px-3">
                {/* Group Header */}
                {!group.alwaysExpanded && (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold ${safeText.secondary} uppercase tracking-wider hover:${safeText.primary} transition-colors sidebar-group-transition`}
                  >
                    <span>{group.name}</span>
                    <div className={`sidebar-item-transition ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                )}

                {/* Group Items */}
                {isExpanded && (
                  <div className="space-y-1 animate-slide-down">
                    {groupItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`relative sidebar-item-transition ${
                          dragOverIndex === index ? 'border-t-2 border-teal-500' : ''
                        }`}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => {
                          setHoveredItem(null);
                          if (showDropdown !== item.id) setShowDropdown(null);
                        }}
                      >
                        <Link
                          to={item.path}
                          draggable={!item.isDefault}
                          onDragStart={(e) => handleDragStart(e, item, index)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg ${safeText.primary} hover:${safeBg.secondary} hover:${safeText.primary} transition-all duration-200 font-medium group relative ${
                            isActive(item) 
                              ? `${safeBg.secondary} ${safeText.accent} font-semibold border-l-4 ${safeBorder.primary} shadow-sm` 
                              : `hover:border-l-4 hover:${safeBorder.secondary}`
                          } ${draggedItem?.item.id === item.id ? 'opacity-50' : ''} ${
                            !item.isDefault ? 'cursor-move' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {!item.isDefault && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Grip className={`w-3 h-3 ${safeText.secondary}`} />
                              </div>
                            )}
                            <div className={`p-1.5 rounded-md sidebar-item-transition ${
                              isActive(item) 
                                ? `${safeBg.secondary} ${safeText.accent}` 
                                : `${safeText.secondary} group-hover:${safeText.primary}`
                            }`}>
                              {renderIcon(item.id, "w-4 h-4")}
                            </div>
                            <span className="text-sm">{item.label}</span>
                          </div>
                          
                          {/* Active indicator */}
                          {isActive(item) && (
                            <div className={`w-2 h-2 ${safeAccent.primary} rounded-full animate-pulse-soft`}></div>
                          )}
                          
                          {/* Three dots menu - only show for non-default items */}
                          {!item.isDefault && hoveredItem === item.id && (
                            <div className="relative" ref={dropdownRef}>
                              <button
                                onClick={(e) => toggleDropdown(item.id, e)}
                                className={`p-1.5 rounded-md hover:${safeBg.secondary} transition-colors opacity-0 group-hover:opacity-100`}
                              >
                                <MoreVertical className={`w-4 h-4 ${safeText.secondary}`} />
                              </button>
                              
                              {/* Dropdown menu */}
                              {showDropdown === item.id && (
                                <div className={`absolute right-0 top-8 w-44 ${safeBg.card} border ${safeBorder.primary} rounded-lg shadow-lg z-50 py-1 animate-fade-in`}>
                                  <button
                                    onClick={(e) => handleUnpin(item.id, e)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors`}
                                  >
                                    <PinOff className="w-4 h-4" />
                                    Unpin from sidebar
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
