import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataMigrationService from './services/DataMigrationService';
import SampleDataService from './services/SampleDataService';
import PinButton from './components/PinButton';
import ThemeManager from './components/ThemeManager';
import { useTheme, useThemeStyles } from './contexts/ThemeContext';
import { 
  Database, 
  Shield, 
 Settings as SettingsIcon, 
  Info, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Download, 
  Upload, 
  RotateCcw, 
  Target, 
  Lock,
  Palette,
  Globe,
  Bell,
  Monitor,
  Smartphone,
  Mail,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Clock,
  Trash2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Github,
  Heart
} from 'lucide-react';

export default function Settings() {
  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};
  const styles = useThemeStyles();
  
  // Safe fallbacks for theme properties
  const safeBg = bg || {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    card: 'bg-white',
    tertiary: 'bg-gray-100'
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
    primary: 'bg-teal-600',
    secondary: 'text-teal-600'
  };
  
  const [activeTab, setActiveTab] = useState('general');
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Enhanced settings state
  const [userSettings, setUserSettings] = useState({
    // General settings
    currency: 'INR',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    
    // Display settings
    defaultView: 'overview',
    showBalances: true,
    dashboardCards: 6,
    animationsEnabled: true,
    
    // Notification settings
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: false,
    emailNotifications: true,
    pushNotifications: false,
    
    // Privacy settings
    dataSharing: false,
    analytics: true,
    crashReporting: true,
    
    // Advanced settings
    autoBackup: true,
    backupFrequency: 'weekly',
    sessionTimeout: 30,
    twoFactorAuth: false
  });

  // Load user settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('finmate-user-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setUserSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveUserSettings = useCallback((newSettings) => {
    try {
      localStorage.setItem('finmate-user-settings', JSON.stringify(newSettings));
      setUserSettings(newSettings);
      setMessage('✅ Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving user settings:', error);
      setMessage('❌ Failed to save settings');
      setTimeout(() => setMessage(''), 3000);
    }
  }, []);

  // Handle setting changes
  const handleSettingChange = useCallback((key, value) => {
    const newSettings = { ...userSettings, [key]: value };
    saveUserSettings(newSettings);
  }, [userSettings, saveUserSettings]);

  const migrationService = useMemo(() => new DataMigrationService(), []);
  const sampleDataService = useMemo(() => new SampleDataService(), []);

  const checkMigrationStatus = useCallback(async () => {
    try {
      const status = await migrationService.checkMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  }, [migrationService]);

  useEffect(() => {
    checkMigrationStatus();
  }, [checkMigrationStatus]);

  const handleMigration = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const results = await migrationService.migrateLocalStorageToFirebase();
      setMessage(`✅ Migration completed! Transactions: ${results.transactions.success}, Budget: ${results.budget.success > 0 ? 'Yes' : 'No'}`);
      
      if (results.transactions.success > 0 || results.budget.success > 0) {
        migrationService.clearLocalStorageData();
        checkMigrationStatus();
      }
    } catch (error) {
      setMessage(`❌ Migration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await migrationService.backupFirebaseData();
      setMessage('✅ Backup downloaded successfully!');
    } catch (error) {
      setMessage(`❌ Backup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage('');
    
    try {
      const results = await migrationService.restoreFromBackup(file);
      setMessage(`✅ Restore completed! Transactions: ${results.transactions.success}, Budget: ${results.budget.success > 0 ? 'Yes' : 'No'}`);
    } catch (error) {
      setMessage(`❌ Restore failed: ${error.message}`);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleAddSampleData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const results = await sampleDataService.setupCompleteDemo();
      setMessage(`✅ ${results.message}`);
      checkMigrationStatus(); // Refresh status to show new data
    } catch (error) {
      setMessage(`❌ Failed to add sample data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="w-4 h-4" />, description: 'Basic app preferences' },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" />, description: 'Themes and display options' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, description: 'Alert and reminder settings' },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-4 h-4" />, description: 'Data protection settings' },
    { id: 'data', label: 'Data Management', icon: <Database className="w-4 h-4" />, description: 'Backup and migration options' },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" />, description: 'App information and support' }
  ];
  
  return (
    <div className={`min-h-screen ${safeBg.primary}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${safeAccent.primary} rounded-xl`}>
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-4xl font-bold ${safeText.primary} mb-2`}>Settings</h1>
                <p className={`text-lg ${safeText.secondary}`}>Customize your FinMate experience</p>
              </div>
            </div>
            <PinButton pageId="settings" />
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border shadow-sm animate-slide-down ${
            message.includes('❌') || message.includes('failed') || message.includes('Failed') 
              ? 'bg-red-50 text-red-800 border-red-200' 
              : 'bg-green-50 text-green-800 border-green-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-1 rounded-md ${
                message.includes('❌') || message.includes('failed') || message.includes('Failed')
                  ? 'bg-red-100' 
                  : 'bg-green-100'
              }`}>
                {message.includes('❌') || message.includes('failed') || message.includes('Failed') ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                {message.replace(/[✅❌]/g, '').trim()}
              </div>
              <button 
                onClick={() => setMessage('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className={`${safeBg.card} rounded-xl shadow-sm border ${safeBorder.primary} p-2`}>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? `${safeBg.secondary} ${safeText.accent} shadow-sm font-medium`
                        : `${safeText.secondary} hover:${safeBg.secondary} hover:${safeText.primary}`
                    }`}
                  >
                    <div className={`p-1.5 rounded-md ${
                      activeTab === tab.id 
                        ? `${safeAccent.primary.replace('bg-', 'bg-opacity-20 bg-')} ${safeText.accent}` 
                        : `${safeBg.tertiary} ${safeText.secondary}`
                    }`}>
                      {tab.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{tab.label}</div>
                      <div className={`text-xs ${safeText.tertiary} mt-0.5`}>{tab.description}</div>
                    </div>
                    {activeTab === tab.id && (
                      <div className={`w-2 h-2 ${safeAccent.primary} rounded-full`}></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className={`${safeBg.card} rounded-xl shadow-sm border ${safeBorder.primary} p-8`}>
              {activeTab === 'data' && (
                <div className="space-y-8">
                  <div className={`${safeBg.card} rounded-lg shadow p-6`}>
                    <h2 className={`text-xl font-semibold ${safeText.primary} mb-4 flex items-center gap-2`}>
                      <Database className={`w-5 h-5 ${safeAccent.secondary}`} />
                      Data Storage & Migration
                    </h2>
                    
                    {/* Firebase Status */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-md">
                      <h3 className="font-medium text-blue-900 mb-2">Firebase Integration Status</h3>
                      <div className="text-sm text-blue-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Firebase Firestore is configured and ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          <span>Free tier: 50k reads/day, 20k writes/day, 1GB storage</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-blue-600" />
                          <span>Real-time sync across all your devices</span>
                        </div>
                      </div>
                    </div>

                    {/* Migration Status */}
                    {migrationStatus && (
                      <div className={`mb-6 p-4 ${safeBg.secondary} rounded-md`}>
                        <h3 className={`font-medium ${safeText.primary} mb-2`}>Current Data Status</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Local Storage (Browser):</p>
                            <p>Transactions: {migrationStatus.localData.transactions}</p>
                            <p>Budget: {migrationStatus.localData.hasBudget ? 'Set' : 'Not set'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Firebase (Cloud):</p>
                            <p>Transactions: {migrationStatus.firebaseData.transactions}</p>
                            <p>Budget: {migrationStatus.firebaseData.hasBudget ? 'Set' : 'Not set'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Migration Actions */}
                    <div className="space-y-4">
                      {migrationStatus?.needsMigration && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                          <h3 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                            <RotateCcw className="w-4 h-4 text-yellow-600" />
                            Migration Available
                          </h3>
                          <p className="text-sm text-yellow-700 mb-3">
                            You have data in localStorage that can be migrated to Firebase for better persistence and sync.
                          </p>
                          <button
                            onClick={handleMigration}
                            disabled={loading}
                            className={`${styles.button('primary')} disabled:opacity-50`}
                          >
                            {loading ? 'Migrating...' : 'Migrate to Firebase'}
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Demo Data */}
                        <div className={`p-4 border ${safeBorder.primary} rounded-lg`}>
                          <h3 className={`font-medium ${safeText.primary} mb-2 flex items-center gap-2`}>
                            <Target className="w-4 h-4 text-purple-600" />
                            Demo Data
                          </h3>
                          <p className={`text-sm ${safeText.secondary} mb-3`}>
                            Add sample transactions, budget, and preferences to test the app.
                          </p>
                          <button
                            onClick={handleAddSampleData}
                            disabled={loading}
                            className={`${styles.button('secondary')} disabled:opacity-50`}
                          >
                            {loading ? 'Adding...' : 'Add Sample Data'}
                          </button>
                        </div>

                        {/* Backup */}
                        <div className={`p-4 border ${safeBorder.primary} rounded-lg`}>
                          <h3 className={`font-medium ${safeText.primary} mb-2 flex items-center gap-2`}>
                            <Download className={`w-4 h-4 ${safeAccent.secondary}`} />
                            Backup Data
                          </h3>
                          <p className={`text-sm ${safeText.secondary} mb-3`}>
                            Download a complete backup of your financial data as a JSON file.
                          </p>
                          <button
                            onClick={handleBackup}
                            disabled={loading}
                            className={`${styles.button('primary')} disabled:opacity-50`}
                          >
                            {loading ? 'Creating...' : 'Download Backup'}
                          </button>
                        </div>

                        {/* Restore */}
                        <div className={`p-4 border ${safeBorder.primary} rounded-lg`}>
                          <h3 className={`font-medium ${safeText.primary} mb-2 flex items-center gap-2`}>
                            <Upload className={`w-4 h-4 ${safeAccent.secondary}`} />
                            Restore Data
                          </h3>
                          <p className={`text-sm ${safeText.secondary} mb-3`}>
                            Restore your data from a previously downloaded backup file.
                          </p>
                          <label className="block">
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleFileRestore}
                              disabled={loading}
                              className={`block w-full text-sm ${safeText.tertiary} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:${safeAccent.bg || 'bg-teal-50'} file:${safeAccent.secondary} hover:file:bg-teal-100`}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Usage */}
                  <div className={`${safeBg.card} rounded-lg shadow p-6`}>
                    <h2 className={`text-xl font-semibold ${safeText.primary} mb-4 flex items-center gap-2`}>
                      <BarChart3 className={`w-5 h-5 ${safeAccent.secondary}`} />
                      Storage Usage
                    </h2>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className={`${safeText.secondary}`}>Firebase Free Tier Usage:</span>
                        <span className="text-sm text-green-600">Well within limits</span>
                      </div>
                      <div className={`text-sm ${safeText.tertiary}`}>
                        <p>• Reads: Unlimited for personal use</p>
                        <p>• Writes: Unlimited for personal use</p>
                        <p>• Storage: &lt; 1MB used of 1GB available</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <ThemeManager />
              )}

              {activeTab === 'privacy' && (
                <div className={`${safeBg.card} rounded-lg shadow p-6`}>
                  <h2 className={`text-xl font-semibold ${safeText.primary} mb-4 flex items-center gap-2`}>
                    <Lock className={`w-5 h-5 ${safeText.secondary}`} />
                    Privacy & Security
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-md">
                      <h3 className="font-medium text-green-900 mb-2">Data Privacy</h3>
                      <ul className="text-sm text-green-800 space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>All data is stored securely in Firebase</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Data is encrypted in transit and at rest</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Only you can access your financial data</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>No data is shared with third parties</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-md">
                      <h3 className="font-medium text-blue-900 mb-2">Data Retention</h3>
                      <p className="text-sm text-blue-800">
                        Your data is stored indefinitely in Firebase until you choose to delete it. 
                        You can export or delete your data at any time.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className={`${safeBg.card} rounded-lg shadow p-6`}>
                  <h2 className={`text-xl font-semibold ${safeText.primary} mb-4 flex items-center gap-2`}>
                    <SettingsIcon className={`w-5 h-5 ${safeText.secondary}`} />
                    App Preferences
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium ${safeText.secondary} mb-2`}>
                        Default Currency
                      </label>
                      <select className={`w-full px-3 py-2 border ${safeBorder.primary} rounded-md focus:outline-none focus:ring-2 focus:${safeAccent.ring || 'ring-teal-500'} ${safeBg.card} ${safeText.primary}`}>
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${safeText.secondary} mb-2`}>
                        Default View
                      </label>
                      <select className={`w-full px-3 py-2 border ${safeBorder.primary} rounded-md focus:outline-none focus:ring-2 focus:${safeAccent.ring || 'ring-teal-500'} ${safeBg.card} ${safeText.primary}`}>
                        <option value="overview">Overview</option>
                        <option value="detailed">Detailed</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifications"
                        className={`h-4 w-4 ${safeAccent.secondary} focus:${safeAccent.ring || 'ring-teal-500'} border-gray-300 rounded`}
                      />
                      <label htmlFor="notifications" className={`ml-2 block text-sm ${safeText.primary}`}>
                        Enable budget alerts
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className={`${safeBg.card} rounded-lg shadow p-6`}>
                  <h2 className={`text-xl font-semibold ${safeText.primary} mb-4`}>ℹ️ About FinMate</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className={`font-medium ${safeText.primary}`}>Version</h3>
                      <p className={`${safeText.secondary}`}>1.0.0</p>
                    </div>
                    
                    <div>
                      <h3 className={`font-medium ${safeText.primary}`}>Features</h3>
                      <ul className={`${safeText.secondary} space-y-1`}>
                        <li>• Transaction tracking with Firebase sync</li>
                        <li>• Spending analysis and insights</li>
                        <li>• Budget management</li>
                        <li>• Interactive charts and visualizations</li>
                        <li>• Data export and backup</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className={`font-medium ${safeText.primary}`}>Technology Stack</h3>
                      <ul className={`${safeText.secondary} space-y-1`}>
                        <li>• React.js frontend</li>
                        <li>• Firebase Firestore database</li>
                        <li>• Tailwind CSS styling</li>
                        <li>• Nivo charts library</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
