import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Default sidebar items - these are always available
const DEFAULT_SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home', path: '/dashboard', isPinned: true, isDefault: true },
  { id: 'quick-actions', label: 'Quick Actions', icon: 'zap', path: '/dashboard/quick-actions', isPinned: true, isDefault: true },
  { id: 'budget', label: 'Budget Planner', icon: 'dollar-sign', path: '/dashboard/budget', isPinned: true, isDefault: false },
  { id: 'transactions', label: 'Transactions', icon: 'plus', path: '/dashboard/transactions', isPinned: true, isDefault: false },
  { id: 'history', label: 'History', icon: 'file-text', path: '/dashboard/history', isPinned: false, isDefault: false },
  { id: 'goals', label: 'Goals', icon: 'target', path: '/dashboard/goals', isPinned: true, isDefault: false },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart-3', path: '/dashboard/spending', isPinned: true, isDefault: false },
  { id: 'predictions', label: 'AI Predictions', icon: 'brain', path: '/dashboard/predictions', isPinned: false, isDefault: false },
  { id: 'comparison', label: 'Month Comparison', icon: 'trending-up', path: '/dashboard/comparison', isPinned: false, isDefault: false },
  { id: 'learning', label: 'Investment Learning', icon: 'book-open', path: '/dashboard/learning', isPinned: false, isDefault: false },
  { id: 'simulation', label: 'Investment Simulation', icon: 'calculator', path: '/dashboard/simulation', isPinned: false, isDefault: false },
  { id: 'risk', label: 'Risk Profiler', icon: 'user-check', path: '/dashboard/risk', isPinned: false, isDefault: false },
  { id: 'tax-breakdown', label: 'Tax Breakdown', icon: 'receipt', path: '/dashboard/tax', isPinned: false, isDefault: false },
  { id: 'tax-estimator', label: 'Tax Estimator', icon: 'calculator', path: '/dashboard/tax/estimator', isPinned: false, isDefault: false },
  { id: 'tax-filing', label: 'Tax Filing', icon: 'file-text', path: '/tax-filing', isPinned: false, isDefault: false },
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/dashboard/settings', isPinned: true, isDefault: false },
  { id: 'themes', label: 'Theme Manager', icon: 'palette', path: '/dashboard/themes', isPinned: false, isDefault: false },
];

export const SidebarProvider = ({ children }) => {
  const [sidebarItems, setSidebarItems] = useState(DEFAULT_SIDEBAR_ITEMS);

  // Load sidebar preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('finmate-sidebar-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        // Merge saved preferences with default items to handle new items
        // Always preserve isDefault property from default items
        const mergedItems = DEFAULT_SIDEBAR_ITEMS.map(defaultItem => {
          const savedItem = parsed.find(item => item.id === defaultItem.id);
          return savedItem ? { 
            ...defaultItem, 
            ...savedItem, 
            isDefault: defaultItem.isDefault // Always preserve isDefault from defaults
          } : defaultItem;
        });
        setSidebarItems(mergedItems);
      } catch (error) {
        console.error('Error loading sidebar preferences:', error);
      }
    }
  }, []);

  // Save sidebar preferences to localStorage whenever they change
  const saveSidebarPreferences = (items) => {
    try {
      localStorage.setItem('finmate-sidebar-preferences', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving sidebar preferences:', error);
    }
  };

  // Get pinned items in order
  const getPinnedItems = () => {
    return sidebarItems.filter(item => item.isPinned);
  };

  // Get all available items (for the pin/unpin functionality)
  const getAllItems = () => {
    return sidebarItems;
  };

  // Pin an item to sidebar
  const pinItem = (itemId) => {
    const updatedItems = sidebarItems.map(item =>
      item.id === itemId ? { ...item, isPinned: true } : item
    );
    setSidebarItems(updatedItems);
    saveSidebarPreferences(updatedItems);
  };

  // Unpin an item from sidebar
  const unpinItem = (itemId) => {
    const updatedItems = sidebarItems.map(item =>
      item.id === itemId && !item.isDefault ? { ...item, isPinned: false } : item
    );
    setSidebarItems(updatedItems);
    saveSidebarPreferences(updatedItems);
  };

  // Reorder sidebar items
  const reorderItems = (newOrder) => {
    setSidebarItems(newOrder);
    saveSidebarPreferences(newOrder);
  };

  // Check if an item is pinned
  const isItemPinned = (itemId) => {
    const item = sidebarItems.find(item => item.id === itemId);
    return item ? item.isPinned : false;
  };

  // Get current page info by path
  const getCurrentPageInfo = (path) => {
    return sidebarItems.find(item => {
      if (item.path === '/dashboard' && path === '/dashboard') return true;
      if (item.path !== '/dashboard' && path.startsWith(item.path)) return true;
      return false;
    });
  };

  const value = {
    sidebarItems,
    getPinnedItems,
    getAllItems,
    pinItem,
    unpinItem,
    reorderItems,
    isItemPinned,
    getCurrentPageInfo,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};
