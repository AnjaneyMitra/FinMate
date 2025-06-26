import React, { createContext, useContext, useReducer, useEffect } from 'react';
import unifiedApiService from '../services/UnifiedApiService';

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  SET_EXPENSES: 'SET_EXPENSES',
  SET_DASHBOARD_DATA: 'SET_DASHBOARD_DATA',
  SET_TAX_DATA: 'SET_TAX_DATA',
  SET_INSIGHTS: 'SET_INSIGHTS',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  ADD_EXPENSE: 'ADD_EXPENSE',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_THEME: 'SET_THEME',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS'
};

// Initial state
const initialState = {
  // User & Auth
  user: null,
  isAuthenticated: false,
  
  // UI State
  loading: false,
  error: null,
  theme: 'light',
  connectionStatus: 'offline',
  
  // Data
  expenses: [],
  dashboardData: null,
  taxData: {
    forms: [],
    drafts: [],
    submissions: []
  },
  insights: [],
  notifications: [],
  
  // Filters & Preferences
  expenseFilters: {
    period: 'month',
    category: 'all',
    sortBy: 'date'
  },
  
  // Cache timestamps
  lastSync: {
    expenses: null,
    tax: null,
    insights: null
  }
};

// Reducer
function finmateReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_USER:
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload 
      };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.SET_EXPENSES:
      return { 
        ...state, 
        expenses: action.payload,
        lastSync: { ...state.lastSync, expenses: new Date().toISOString() }
      };
    
    case ActionTypes.SET_DASHBOARD_DATA:
      return { ...state, dashboardData: action.payload };
    
    case ActionTypes.SET_TAX_DATA:
      return { 
        ...state, 
        taxData: { ...state.taxData, ...action.payload },
        lastSync: { ...state.lastSync, tax: new Date().toISOString() }
      };
    
    case ActionTypes.SET_INSIGHTS:
      return { 
        ...state, 
        insights: action.payload,
        lastSync: { ...state.lastSync, insights: new Date().toISOString() }
      };
    
    case ActionTypes.ADD_EXPENSE:
      return { 
        ...state, 
        expenses: [action.payload, ...state.expenses] 
      };
    
    case ActionTypes.UPDATE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        )
      };
    
    case ActionTypes.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    
    case ActionTypes.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    
    case ActionTypes.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications] 
      };
    
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notification => 
          notification.id !== action.payload
        )
      };
    
    case ActionTypes.SET_THEME:
      return { ...state, theme: action.payload };
    
    case ActionTypes.SET_CONNECTION_STATUS:
      return { ...state, connectionStatus: action.payload };
    
    default:
      return state;
  }
}

// Context
const FinmateContext = createContext();

// Provider component
export function FinmateProvider({ children }) {
  const [state, dispatch] = useReducer(finmateReducer, initialState);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('finmate-theme') || 'light';
    dispatch({ type: ActionTypes.SET_THEME, payload: savedTheme });
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Connection status monitoring
  useEffect(() => {
    const checkConnection = async () => {
      const isOnline = await unifiedApiService.healthCheck();
      dispatch({ 
        type: ActionTypes.SET_CONNECTION_STATUS, 
        payload: isOnline ? 'online' : 'offline' 
      });
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Real-time updates listener
  useEffect(() => {
    const handleRealTimeUpdate = (event) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'expense_added':
          dispatch({ type: ActionTypes.ADD_EXPENSE, payload: data });
          break;
        case 'expense_updated':
          dispatch({ type: ActionTypes.UPDATE_EXPENSE, payload: data });
          break;
        case 'expense_deleted':
          dispatch({ type: ActionTypes.DELETE_EXPENSE, payload: data.id });
          break;
        case 'tax_draft_saved':
          // Refresh tax data
          loadTaxData();
          break;
        default:
          console.log('Unknown real-time update:', type);
      }
    };

    window.addEventListener('finmate-update', handleRealTimeUpdate);
    return () => window.removeEventListener('finmate-update', handleRealTimeUpdate);
  }, []);

  // === ACTION CREATORS ===

  const setLoading = (loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  };

  const setUser = (user) => {
    dispatch({ type: ActionTypes.SET_USER, payload: user });
    if (user) {
      unifiedApiService.setAuthToken(user.accessToken || 'demo-token');
    }
  };

  const setError = (error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const notificationWithId = { 
      ...notification, 
      id, 
      timestamp: new Date().toISOString() 
    };
    
    dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notificationWithId });
    
    // Auto-remove after 5 seconds for info notifications
    if (notification.type === 'info' || notification.type === 'success') {
      setTimeout(() => {
        dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
      }, 5000);
    }
  };

  const removeNotification = (id) => {
    dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
  };

  const setTheme = (theme) => {
    dispatch({ type: ActionTypes.SET_THEME, payload: theme });
    localStorage.setItem('finmate-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  // === DATA LOADING FUNCTIONS ===

  const loadExpenses = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await unifiedApiService.getExpenses(filters);
      dispatch({ type: ActionTypes.SET_EXPENSES, payload: response.expenses || [] });
    } catch (error) {
      setError(error.message);
      addNotification({
        type: 'error',
        title: 'Error Loading Expenses',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await unifiedApiService.getDashboardData();
      dispatch({ type: ActionTypes.SET_DASHBOARD_DATA, payload: data });
    } catch (error) {
      setError(error.message);
      addNotification({
        type: 'error',
        title: 'Error Loading Dashboard',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTaxData = async () => {
    try {
      const [forms, drafts] = await Promise.all([
        unifiedApiService.getTaxForms(),
        unifiedApiService.getTaxDrafts()
      ]);

      dispatch({ 
        type: ActionTypes.SET_TAX_DATA, 
        payload: { 
          forms: forms.forms || [], 
          drafts: drafts.drafts || [] 
        } 
      });
    } catch (error) {
      setError(error.message);
      addNotification({
        type: 'error',
        title: 'Error Loading Tax Data',
        message: error.message
      });
    }
  };

  const loadInsights = async () => {
    try {
      const response = await unifiedApiService.getPersonalizedInsights();
      dispatch({ type: ActionTypes.SET_INSIGHTS, payload: response.insights || [] });
    } catch (error) {
      console.error('Error loading insights:', error);
      // Don't show error notification for insights as it's not critical
    }
  };

  // === EXPENSE ACTIONS ===

  const addExpense = async (expenseData) => {
    try {
      setLoading(true);
      const newExpense = await unifiedApiService.addExpense(expenseData);
      dispatch({ type: ActionTypes.ADD_EXPENSE, payload: newExpense });
      
      addNotification({
        type: 'success',
        title: 'Expense Added',
        message: `${expenseData.description} - ₹${expenseData.amount}`
      });
      
      return newExpense;
    } catch (error) {
      setError(error.message);
      addNotification({
        type: 'error',
        title: 'Error Adding Expense',
        message: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (expenseId, expenseData) => {
    try {
      setLoading(true);
      const updatedExpense = await unifiedApiService.updateExpense(expenseId, expenseData);
      dispatch({ type: ActionTypes.UPDATE_EXPENSE, payload: updatedExpense });
      
      addNotification({
        type: 'success',
        title: 'Expense Updated',
        message: 'Expense has been updated successfully'
      });
      
      return updatedExpense;
    } catch (error) {
      setError(error.message);
      addNotification({
        type: 'error',
        title: 'Error Updating Expense',
        message: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      setLoading(true);
      await unifiedApiService.deleteExpense(expenseId);
      dispatch({ type: ActionTypes.DELETE_EXPENSE, payload: expenseId });
      
      addNotification({
        type: 'success',
        title: 'Expense Deleted',
        message: 'Expense has been deleted successfully'
      });
    } catch (error) {
      setError(error.message);
      addNotification({
        type: 'error',
        title: 'Error Deleting Expense',
        message: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // === UTILITY FUNCTIONS ===

  const refreshAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadDashboardData(),
        loadTaxData(),
        loadInsights()
      ]);
      
      addNotification({
        type: 'success',
        title: 'Data Refreshed',
        message: 'All data has been refreshed successfully'
      });
    } catch (error) {
      setError(error.message);
      addNotification({
        type: 'error',
        title: 'Error Refreshing Data',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: null });
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    setLoading,
    setUser,
    setError,
    clearError,
    addNotification,
    removeNotification,
    setTheme,
    
    // Data loading
    loadExpenses,
    loadDashboardData,
    loadTaxData,
    loadInsights,
    refreshAllData,
    
    // Expense actions
    addExpense,
    updateExpense,
    deleteExpense,
    
    // API service
    apiService: unifiedApiService
  };

  return (
    <FinmateContext.Provider value={value}>
      {children}
    </FinmateContext.Provider>
  );
}

// Custom hook
export function useFinmate() {
  const context = useContext(FinmateContext);
  if (!context) {
    throw new Error('useFinmate must be used within a FinmateProvider');
  }
  return context;
}

export default FinmateContext;
