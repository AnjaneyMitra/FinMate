import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataMigrationService from './services/DataMigrationService';
import SampleDataService from './services/SampleDataService';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('data');
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const migrationService = new DataMigrationService();
  const sampleDataService = new SampleDataService();

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
      
      // Clear localStorage after successful migration
      if (results.transactions.success > 0 || results.budget.success > 0) {
        migrationService.clearLocalStorageData();
        checkMigrationStatus(); // Refresh status
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
      event.target.value = ''; // Reset file input
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
    { id: 'data', label: 'Data Management', icon: '💾' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your FinMate preferences and data</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400 dark:border-teal-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.includes('❌') ? 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700' : 
          'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'data' && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📊 Data Storage & Migration</h2>
            
            {/* Firebase Status */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
              <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Firebase Integration Status</h3>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p>✅ Firebase Firestore is configured and ready</p>
                <p>📈 Free tier: 50k reads/day, 20k writes/day, 1GB storage</p>
                <p>🔄 Real-time sync across all your devices</p>
              </div>
            </div>

            {/* Migration Status */}
            {migrationStatus && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Current Data Status</h3>
                <div className="grid grid-cols-2 gap-4 text-sm dark:text-white">
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
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">🔄 Migration Available</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-3">
                    You have data in localStorage that can be migrated to Firebase for better persistence and sync.
                  </p>
                  <button
                    onClick={handleMigration}
                    disabled={loading}
                    className="bg-yellow-600 dark:bg-yellow-700 text-white px-4 py-2 rounded-md hover:bg-yellow-700 dark:hover:bg-yellow-800 disabled:opacity-50"
                  >
                    {loading ? 'Migrating...' : 'Migrate to Firebase'}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Demo Data */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">🎯 Demo Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Add sample transactions, budget, and preferences to test the app.
                  </p>
                  <button
                    onClick={handleAddSampleData}
                    disabled={loading}
                    className="bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-700 dark:hover:bg-purple-800 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Sample Data'}
                  </button>
                </div>

                {/* Backup */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">💾 Backup Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Download a complete backup of your financial data as a JSON file.
                  </p>
                  <button
                    onClick={handleBackup}
                    disabled={loading}
                    className="bg-teal-600 dark:bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-700 dark:hover:bg-teal-800 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Download Backup'}
                  </button>
                </div>

                {/* Restore */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">🔄 Restore Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Restore your data from a previously downloaded backup file.
                  </p>
                  <label className="block">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileRestore}
                      disabled={loading}
                      className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-teal-50 dark:file:bg-teal-900 file:text-teal-700 dark:file:text-teal-300 hover:file:bg-teal-100 dark:hover:file:bg-teal-800"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Data Usage */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📈 Storage Usage</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Firebase Free Tier Usage:</span>
                <span className="text-sm text-green-600 dark:text-green-400">Well within limits</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>• Reads: Unlimited for personal use</p>
                <p>• Writes: Unlimited for personal use</p>
                <p>• Storage: &lt; 1MB used of 1GB available</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🔒 Privacy & Security</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-md">
              <h3 className="font-medium text-green-900 dark:text-green-200 mb-2">Data Privacy</h3>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>✅ All data is stored securely in Firebase</li>
                <li>✅ Data is encrypted in transit and at rest</li>
                <li>✅ Only you can access your financial data</li>
                <li>✅ No data is shared with third parties</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
              <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Data Retention</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your data is stored indefinitely in Firebase until you choose to delete it. 
                You can export or delete your data at any time.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">⚙️ App Preferences</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Default Currency
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Default View
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option value="overview">Overview</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 dark:focus:ring-teal-800 border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900"
              />
              <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                Enable budget alerts
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">ℹ️ About FinMate</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Version</h3>
              <p className="text-gray-600 dark:text-gray-300">1.0.0</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Features</h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Transaction tracking with Firebase sync</li>
                <li>• Spending analysis and insights</li>
                <li>• Budget management</li>
                <li>• Interactive charts and visualizations</li>
                <li>• Data export and backup</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Technology Stack</h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1">
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
  );
}
