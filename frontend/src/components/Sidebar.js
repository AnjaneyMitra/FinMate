import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useSidebar } from '../contexts/SidebarContext';

export default function Sidebar({ user, setUser }) {
  const location = useLocation();
  const { getPinnedItems, unpinItem, reorderItems } = useSidebar();
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const sidebarItems = getPinnedItems();
  
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
    <aside className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <span className="text-2xl">🧩</span>
          <span className="font-bold text-lg tracking-tight">FinMate</span>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item, index) => (
            <div
              key={item.id}
              className={`relative mx-2 mb-1 ${
                dragOverIndex === index ? 'border-t-2 border-blue-500' : ''
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
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium group ${
                  isActive(item) ? 'bg-gray-100 font-semibold' : ''
                } ${draggedItem?.item.id === item.id ? 'opacity-50' : ''} ${
                  !item.isDefault ? 'cursor-move' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                
                {/* Three dots menu - only show for non-default items */}
                {!item.isDefault && hoveredItem === item.id && (
                  <div className="relative" ref={dropdownRef}>
                    {/* Debug: log item properties */}
                    {console.log(`Sidebar item ${item.id}:`, { isDefault: item.isDefault, isPinned: item.isPinned })}
                    <button
                      onClick={(e) => toggleDropdown(item.id, e)}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    {/* Dropdown menu */}
                    {showDropdown === item.id && (
                      <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <button
                          onClick={(e) => handleUnpin(item.id, e)}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 011.4.9L18 9l.293.707A1 1 0 0117 11H9.293l-4 4a1 1 0 01-1.414-1.414l4-4V3a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Unpin from sidebar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Link>
            </div>
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
