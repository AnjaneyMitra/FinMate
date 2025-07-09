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
  User,
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
      checkMigrationStatus();
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
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <div>
                    <h2 className={`text-2xl font-bold ${safeText.primary} mb-6 flex items-center gap-2`}>
                      <Globe className={`w-6 h-6 ${safeAccent.secondary}`} />
                      General Preferences
                    </h2>
                  </div>

                  {/* Regional Settings */}
                  <div className={`${safeBg.secondary} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold ${safeText.primary} mb-4`}>Regional Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-medium ${safeText.secondary} mb-2`}>
                          <DollarSign className="w-4 h-4 inline mr-2" />
                          Default Currency
                        </label>
                        <select 
                          value={userSettings.currency}
                          onChange={(e) => handleSettingChange('currency', e.target.value)}
                          className={`w-full px-4 py-3 border ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${safeBg.card} ${safeText.primary}`}
                        >
                          <option value="INR">🇮🇳 Indian Rupee (₹)</option>
                          <option value="USD">🇺🇸 US Dollar ($)</option>
                          <option value="EUR">🇪🇺 Euro (€)</option>
                          <option value="GBP">🇬🇧 British Pound (£)</option>
                          <option value="JPY">🇯🇵 Japanese Yen (¥)</option>
                          <option value="CAD">🇨🇦 Canadian Dollar (C$)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${safeText.secondary} mb-2`}>
                          <Globe className="w-4 h-4 inline mr-2" />
                          Language
                        </label>
                        <select 
                          value={userSettings.language}
                          onChange={(e) => handleSettingChange('language', e.target.value)}
                          className={`w-full px-4 py-3 border ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${safeBg.card} ${safeText.primary}`}
                        >
                          <option value="en">English</option>
                          <option value="hi">हिंदी (Hindi)</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${safeText.secondary} mb-2`}>
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Date Format
                        </label>
                        <select 
                          value={userSettings.dateFormat}
                          onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                          className={`w-full px-4 py-3 border ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${safeBg.card} ${safeText.primary}`}
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${safeText.secondary} mb-2`}>
                          <Clock className="w-4 h-4 inline mr-2" />
                          Time Format
                        </label>
                        <select 
                          value={userSettings.timeFormat}
                          onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                          className={`w-full px-4 py-3 border ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${safeBg.card} ${safeText.primary}`}
                        >
                          <option value="12h">12 Hour (AM/PM)</option>
                          <option value="24h">24 Hour</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Display Settings */}
                  <div className={`${safeBg.secondary} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold ${safeText.primary} mb-4`}>Display Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-medium ${safeText.secondary} mb-2`}>
                          <Monitor className="w-4 h-4 inline mr-2" />
                          Default Dashboard View
                        </label>
                        <select 
                          value={userSettings.defaultView}
                          onChange={(e) => handleSettingChange('defaultView', e.target.value)}
                          className={`w-full px-4 py-3 border ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${safeBg.card} ${safeText.primary}`}
                        >
                          <option value="overview">Overview</option>
                          <option value="detailed">Detailed</option>
                          <option value="compact">Compact</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${safeText.secondary} mb-2`}>
                          <BarChart3 className="w-4 h-4 inline mr-2" />
                          Dashboard Cards to Show
                        </label>
                        <select 
                          value={userSettings.dashboardCards}
                          onChange={(e) => handleSettingChange('dashboardCards', parseInt(e.target.value))}
                          className={`w-full px-4 py-3 border ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${safeBg.card} ${safeText.primary}`}
                        >
                          <option value={4}>4 Cards</option>
                          <option value={6}>6 Cards</option>
                          <option value={8}>8 Cards</option>
                          <option value={10}>10 Cards</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <label className={`flex items-center gap-3 cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={userSettings.showBalances}
                          onChange={(e) => handleSettingChange('showBalances', e.target.checked)}
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex items-center gap-2">
                          {userSettings.showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          <span className={`text-sm font-medium ${safeText.primary}`}>Show balance amounts by default</span>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={userSettings.animationsEnabled}
                          onChange={(e) => handleSettingChange('animationsEnabled', e.target.checked)}
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          <span className={`text-sm font-medium ${safeText.primary}`}>Enable animations and transitions</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && <ThemeManager />}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h2 className={`text-2xl font-bold ${safeText.primary} mb-6 flex items-center gap-2`}>
                      <Bell className={`w-6 h-6 ${safeAccent.secondary}`} />
                      Notification Preferences
                    </h2>
                  </div>

                  <div className={`${safeBg.secondary} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold ${safeText.primary} mb-4`}>Alert Settings</h3>
                    <div className="space-y-4">
                      <label className={`flex items-center gap-3 cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={userSettings.budgetAlerts}
                          onChange={(e) => handleSettingChange('budgetAlerts', e.target.checked)}
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${safeText.primary}`}>Budget Alerts</div>
                          <div className={`text-xs ${safeText.tertiary}`}>Get notified when you're approaching your budget limit</div>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={userSettings.goalReminders}
                          onChange={(e) => handleSettingChange('goalReminders', e.target.checked)}
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${safeText.primary}`}>Goal Reminders</div>
                          <div className={`text-xs ${safeText.tertiary}`}>Periodic reminders about your financial goals</div>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={userSettings.weeklyReports}
                          onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${safeText.primary}`}>Weekly Reports</div>
                          <div className={`text-xs ${safeText.tertiary}`}>Receive weekly spending summaries</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className={`${safeBg.secondary} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold ${safeText.primary} mb-4`}>Delivery Methods</h3>
                    <div className="space-y-4">
                      <label className={`flex items-center gap-3 cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={userSettings.emailNotifications}
                          onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className={`text-sm font-medium ${safeText.primary}`}>Email Notifications</span>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={userSettings.pushNotifications}
                          onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          <span className={`text-sm font-medium ${safeText.primary}`}>Push Notifications</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-8">
                  <div>
                    <h2 className={`text-2xl font-bold ${safeText.primary} mb-6 flex items-center gap-2`}>
                      <Lock className={`w-6 h-6 ${safeAccent.secondary}`} />
                      Privacy & Security
                    </h2>
                  </div>

                  {/* Data Privacy */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Data Protection
                    </h3>
                    <ul className="text-sm text-green-800 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>All data is stored securely in Firebase with encryption</span>
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

                  {/* Privacy Settings */}
                  <div className={`${safeBg.secondary} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold ${safeText.primary} mb-4`}>Privacy Controls</h3>
                    <div className="space-y-4">
                      <label className={`flex items-center gap-3 cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={userSettings.analytics}
                          onChange={(e) => handleSettingChange('analytics', e.target.checked)}
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${safeText.primary}`}>Anonymous Analytics</div>
                          <div className={`text-xs ${safeText.tertiary}`}>Help improve FinMate with anonymous usage data</div>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={userSettings.crashReporting}
                          onChange={(e) => handleSettingChange('crashReporting', e.target.checked)}
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${safeText.primary}`}>Crash Reporting</div>
                          <div className={`text-xs ${safeText.tertiary}`}>Automatically send crash reports to help fix bugs</div>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 cursor-pointer opacity-50`}>
                        <input
                          type="checkbox"
                          checked={userSettings.dataSharing}
                          disabled
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${safeText.primary}`}>Data Sharing</div>
                          <div className={`text-xs ${safeText.tertiary}`}>Share data with partners (Currently disabled)</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className={`${safeBg.secondary} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold ${safeText.primary} mb-4`}>Security Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${safeText.secondary} mb-2`}>
                          Session Timeout (minutes)
                        </label>
                        <select 
                          value={userSettings.sessionTimeout}
                          onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                          className={`w-full px-4 py-3 border ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${safeBg.card} ${safeText.primary}`}
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={0}>Never</option>
                        </select>
                      </div>

                      <label className={`flex items-center gap-3 cursor-pointer opacity-50`}>
                        <input
                          type="checkbox"
                          checked={userSettings.twoFactorAuth}
                          disabled
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${safeText.primary}`}>Two-Factor Authentication</div>
                          <div className={`text-xs ${safeText.tertiary}`}>Add an extra layer of security (Coming soon)</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Management Tab */}
              {activeTab === 'data' && (
                <div className="space-y-8">
                  <div>
                    <h2 className={`text-2xl font-bold ${safeText.primary} mb-6 flex items-center gap-2`}>
                      <Database className={`w-6 h-6 ${safeAccent.secondary}`} />
                      Data Management
                    </h2>
                  </div>

                  {/* Firebase Status */}
                  <div className="p-4 bg-blue-50 rounded-lg">
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

                  {/* Auto Backup Settings */}
                  <div className={`${safeBg.secondary} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold ${safeText.primary} mb-4`}>Backup Settings</h3>
                    <div className="space-y-4">
                      <label className={`flex items-center gap-3 cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={userSettings.autoBackup}
                          onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                          className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded`}
                        />
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${safeText.primary}`}>Auto Backup</div>
                          <div className={`text-xs ${safeText.tertiary}`}>Automatically backup your data</div>
                        </div>
                      </label>

                      {userSettings.autoBackup && (
                        <div>
                          <label className={`block text-sm font-medium ${safeText.secondary} mb-2`}>
                            Backup Frequency
                          </label>
                          <select 
                            value={userSettings.backupFrequency}
                            onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                            className={`w-full px-4 py-3 border ${safeBorder.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${safeBg.card} ${safeText.primary}`}
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Migration Status */}
                  {migrationStatus && (
                    <div className={`p-4 ${safeBg.secondary} rounded-lg`}>
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

                  {/* Data Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 border ${safeBorder.primary} rounded-lg`}>
                      <h3 className={`font-medium ${safeText.primary} mb-2 flex items-center gap-2`}>
                        <Target className="w-4 h-4 text-purple-600" />
                        Demo Data
                      </h3>
                      <p className={`text-sm ${safeText.secondary} mb-3`}>
                        Add sample transactions and budget to test the app.
                      </p>
                      <button
                        onClick={handleAddSampleData}
                        disabled={loading}
                        className={`w-full px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors`}
                      >
                        {loading ? 'Adding...' : 'Add Sample Data'}
                      </button>
                    </div>

                    <div className={`p-4 border ${safeBorder.primary} rounded-lg`}>
                      <h3 className={`font-medium ${safeText.primary} mb-2 flex items-center gap-2`}>
                        <Download className={`w-4 h-4 text-teal-600`} />
                        Backup Data
                      </h3>
                      <p className={`text-sm ${safeText.secondary} mb-3`}>
                        Download a complete backup of your data as JSON.
                      </p>
                      <button
                        onClick={handleBackup}
                        disabled={loading}
                        className={`w-full px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors`}
                      >
                        {loading ? 'Creating...' : 'Download Backup'}
                      </button>
                    </div>

                    <div className={`p-4 border ${safeBorder.primary} rounded-lg`}>
                      <h3 className={`font-medium ${safeText.primary} mb-2 flex items-center gap-2`}>
                        <Upload className={`w-4 h-4 text-blue-600`} />
                        Restore Data
                      </h3>
                      <p className={`text-sm ${safeText.secondary} mb-3`}>
                        Restore data from a backup file.
                      </p>
                      <label className="block">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleFileRestore}
                          disabled={loading}
                          className={`w-full text-sm ${safeText.tertiary} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100`}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h3 className={`text-lg font-semibold text-red-900 mb-4 flex items-center gap-2`}>
                      <AlertTriangle className="w-5 h-5" />
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-700 mb-4">
                      These actions cannot be undone. Please be careful.
                    </p>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                      onClick={() => {
                        if (window.confirm('Are you sure? This will delete all your data permanently.')) {
                          // Handle data deletion
                          setMessage('❌ Data deletion is not yet implemented');
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete All Data
                    </button>
                  </div>
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-8">
                  <div>
                    <h2 className={`text-2xl font-bold ${safeText.primary} mb-6 flex items-center gap-2`}>
                      <Info className={`w-6 h-6 ${safeAccent.secondary}`} />
                      About FinMate
                    </h2>
                  </div>

                  <div className={`${safeBg.secondary} rounded-lg p-6`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-3 ${safeAccent.primary} rounded-xl`}>
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${safeText.primary}`}>FinMate v1.0.0</h3>
                        <p className={`${safeText.secondary}`}>Modern Personal Finance Management</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className={`font-semibold ${safeText.primary} mb-2`}>Key Features</h4>
                        <ul className={`${safeText.secondary} space-y-1 text-sm`}>
                          <li>• AI-powered financial insights</li>
                          <li>• Real-time expense tracking</li>
                          <li>• Smart budget management</li>
                          <li>• Goal tracking and planning</li>
                          <li>• Tax filing assistance</li>
                          <li>• Investment learning tools</li>
                          <li>• Comprehensive analytics</li>
                          <li>• Multi-theme support</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className={`font-semibold ${safeText.primary} mb-2`}>Technology Stack</h4>
                        <ul className={`${safeText.secondary} space-y-1 text-sm`}>
                          <li>• React.js 19.1.0</li>
                          <li>• Firebase Firestore</li>
                          <li>• TailwindCSS 4.1.8</li>
                          <li>• Chart.js & Nivo</li>
                          <li>• Google Gemini AI</li>
                          <li>• FastAPI Backend</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`${safeBg.secondary} rounded-lg p-6`}>
                      <h4 className={`font-semibold ${safeText.primary} mb-4 flex items-center gap-2`}>
                        <HelpCircle className="w-5 h-5" />
                        Support & Help
                      </h4>
                      <div className="space-y-3">
                        <button className={`w-full flex items-center justify-between p-3 ${safeBg.card} rounded-lg hover:shadow-sm transition-shadow`}>
                          <span className={`text-sm ${safeText.primary}`}>Documentation</span>
                          <ExternalLink className={`w-4 h-4 ${safeText.secondary}`} />
                        </button>
                        <button className={`w-full flex items-center justify-between p-3 ${safeBg.card} rounded-lg hover:shadow-sm transition-shadow`}>
                          <span className={`text-sm ${safeText.primary}`}>Contact Support</span>
                          <Mail className={`w-4 h-4 ${safeText.secondary}`} />
                        </button>
                        <button className={`w-full flex items-center justify-between p-3 ${safeBg.card} rounded-lg hover:shadow-sm transition-shadow`}>
                          <span className={`text-sm ${safeText.primary}`}>Report a Bug</span>
                          <Github className={`w-4 h-4 ${safeText.secondary}`} />
                        </button>
                      </div>
                    </div>

                    <div className={`${safeBg.secondary} rounded-lg p-6`}>
                      <h4 className={`font-semibold ${safeText.primary} mb-4`}>Legal & Privacy</h4>
                      <div className="space-y-3">
                        <button className={`w-full flex items-center justify-between p-3 ${safeBg.card} rounded-lg hover:shadow-sm transition-shadow`}>
                          <span className={`text-sm ${safeText.primary}`}>Privacy Policy</span>
                          <ExternalLink className={`w-4 h-4 ${safeText.secondary}`} />
                        </button>
                        <button className={`w-full flex items-center justify-between p-3 ${safeBg.card} rounded-lg hover:shadow-sm transition-shadow`}>
                          <span className={`text-sm ${safeText.primary}`}>Terms of Service</span>
                          <ExternalLink className={`w-4 h-4 ${safeText.secondary}`} />
                        </button>
                        <button className={`w-full flex items-center justify-between p-3 ${safeBg.card} rounded-lg hover:shadow-sm transition-shadow`}>
                          <span className={`text-sm ${safeText.primary}`}>Open Source Licenses</span>
                          <ExternalLink className={`w-4 h-4 ${safeText.secondary}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={`text-center p-6 border-t ${safeBorder.primary}`}>
                    <p className={`text-sm ${safeText.tertiary} mb-2`}>
                      Made with ❤️ by the FinMate team
                    </p>
                    <p className={`text-xs ${safeText.tertiary}`}>
                      © 2025 FinMate. All rights reserved.
                    </p>
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
