import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const FirestoreTestPanel = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const addTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const addSampleTransactions = async () => {
    if (!user) {
      addTestResult('Please sign in first', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:8000/api/transactions/add-sample', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult(`✅ Added ${data.transactions.length} sample transactions`, 'success');
        loadTransactions(); // Refresh the list
      } else {
        const error = await response.json();
        addTestResult(`❌ Failed to add sample transactions: ${error.detail}`, 'error');
      }
    } catch (error) {
      addTestResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!user) {
      addTestResult('Please sign in first', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:8000/api/transactions/list/${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        addTestResult(`✅ Loaded ${data.count} transactions`, 'success');
      } else {
        const error = await response.json();
        addTestResult(`❌ Failed to load transactions: ${error.detail}`, 'error');
      }
    } catch (error) {
      addTestResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testForecastAPI = async () => {
    if (!user) {
      addTestResult('Please sign in first', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:8000/forecast-expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeframe: 3,
          category: 'all'
        })
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult(`✅ Forecast generated using ${data.data_source} data`, 'success');
        addTestResult(`📊 Model accuracy: ${(data.model_accuracy * 100).toFixed(1)}%`, 'info');
      } else {
        const error = await response.json();
        addTestResult(`❌ Forecast failed: ${error.detail}`, 'error');
      }
    } catch (error) {
      addTestResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testComparisonAPI = async () => {
    if (!user) {
      addTestResult('Please sign in first', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);

      const response = await fetch('http://localhost:8000/compare-months-expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          months: [lastMonth, currentMonth]
        })
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult(`✅ Month comparison completed using ${data.data_source} data`, 'success');
        addTestResult(`📈 Found ${data.all_categories.length} spending categories`, 'info');
      } else {
        const error = await response.json();
        addTestResult(`❌ Comparison failed: ${error.detail}`, 'error');
      }
    } catch (error) {
      addTestResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomTransaction = async () => {
    if (!user) {
      addTestResult('Please sign in first', 'error');
      return;
    }

    const customTransaction = {
      amount: 75.50,
      description: 'Custom test transaction',
      category: 'test',
      date: new Date().toISOString(),
      type: 'expense'
    };

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:8000/api/transactions/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customTransaction)
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult(`✅ Custom transaction added with ID: ${data.transaction_id}`, 'success');
        loadTransactions(); // Refresh the list
      } else {
        const error = await response.json();
        addTestResult(`❌ Failed to add transaction: ${error.detail}`, 'error');
      }
    } catch (error) {
      addTestResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>🔥 Firestore Test Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-lg text-gray-600 mb-4">Please sign in to test Firestore integration</p>
            <p className="text-sm text-gray-500">This panel helps you test and verify Firestore data operations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔥 Firestore Test Panel</CardTitle>
          <p className="text-sm text-gray-600">
            Signed in as: {user.email} | User ID: {user.uid}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={addSampleTransactions}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Add Sample Transactions
            </button>
            <button
              onClick={loadTransactions}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Load Transactions
            </button>
            <button
              onClick={testForecastAPI}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Test Forecast API
            </button>
            <button
              onClick={testComparisonAPI}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Test Comparison API
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={addCustomTransaction}
              disabled={isLoading}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Add Custom Transaction
            </button>
            <button
              onClick={clearResults}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Clear Test Results
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Processing...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className={`mb-2 ${getResultColor(result.type)}`}>
                  <span className="text-xs text-gray-500">[{result.timestamp}]</span>{' '}
                  {result.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💰 Your Transactions ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((transaction, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{transaction.description}</td>
                      <td className="px-4 py-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing 10 of {transactions.length} transactions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FirestoreTestPanel;
