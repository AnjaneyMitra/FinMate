import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { FirebaseDataService } from '../services/FirebaseDataService';
import { format, parseISO } from 'date-fns';
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Tag,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Edit modal
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const categories = [
    'all', 'food', 'transport', 'shopping', 'entertainment', 
    'bills', 'healthcare', 'education', 'investment', 'personal',
    'miscellaneous', 'transfer', 'atm'
  ];

  const dataService = new FirebaseDataService();

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, selectedCategory, selectedMonth, selectedYear, sortBy, sortOrder]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!auth.currentUser) {
        setError('Please sign in to view transactions');
        return;
      }

      const userTransactions = await dataService.getTransactions();
      setTransactions(userTransactions);
      
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.description?.toLowerCase().includes(term) ||
        tx.merchant_name?.toLowerCase().includes(term) ||
        tx.notes?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tx => tx.category === selectedCategory);
    }

    // Month filter
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(tx => {
        const date = parseISO(tx.date);
        return date.getMonth() + 1 === parseInt(selectedMonth);
      });
    }

    // Year filter
    if (selectedYear !== 'all') {
      filtered = filtered.filter(tx => {
        const date = parseISO(tx.date);
        return date.getFullYear() === parseInt(selectedYear);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = parseISO(a.date);
          bValue = parseISO(b.date);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'description':
          aValue = a.description?.toLowerCase() || '';
          bValue = b.description?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleEdit = (transaction) => {
    setEditingTransaction({ ...transaction });
    setShowEditModal(true);
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await dataService.deleteTransaction(transactionId);
      await loadTransactions(); // Reload transactions
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction. Please try again.');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const { id, ...updateData } = editingTransaction;
      await dataService.updateTransaction(id, updateData);
      setShowEditModal(false);
      setEditingTransaction(null);
      await loadTransactions(); // Reload transactions
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('Failed to update transaction. Please try again.');
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Merchant', 'Notes'],
      ...filteredTransactions.map(tx => [
        format(parseISO(tx.date), 'yyyy-MM-dd'),
        tx.description || '',
        tx.category || '',
        tx.amount || 0,
        tx.payment_method || '',
        tx.merchant_name || '',
        tx.notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique years from transactions
  const availableYears = [...new Set(transactions.map(tx => 
    parseISO(tx.date).getFullYear()
  ))].sort((a, b) => b - a);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍽️',
      transport: '🚗',
      shopping: '🛍️',
      entertainment: '🎬',
      bills: '📄',
      healthcare: '🏥',
      education: '📚',
      investment: '📈',
      personal: '👤',
      miscellaneous: '📝',
      transfer: '↔️',
      atm: '🏧'
    };
    return icons[category] || '💰';
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      credit_card: '💳',
      debit_card: '💳',
      cash: '💵',
      bank_transfer: '🏦',
      digital_wallet: '📱',
      upi: '📱'
    };
    return icons[method] || '💳';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-1">
              View and manage all your transactions ({filteredTransactions.length} total)
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={loadTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-xl font-semibold">{filteredTransactions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-semibold">
                  ₹{filteredTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-xl font-semibold">
                  {new Set(filteredTransactions.map(tx => tx.category)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date Range</p>
                <p className="text-sm font-semibold">
                  {filteredTransactions.length > 0 ? (
                    `${format(parseISO(filteredTransactions[filteredTransactions.length - 1]?.date), 'MMM yyyy')} - ${format(parseISO(filteredTransactions[0]?.date), 'MMM yyyy')}`
                  ) : 'No data'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 className="text-lg font-semibold mb-4">Filters & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {format(new Date(2024, i), 'MMMM')}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="description">Description</option>
                  <option value="category">Category</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">
                      {transaction.description || 'No description'}
                    </div>
                    {transaction.merchant_name && (
                      <div className="text-sm text-gray-500">
                        at {transaction.merchant_name}
                      </div>
                    )}
                    {transaction.notes && (
                      <div className="text-xs text-gray-400 mt-1">
                        {transaction.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {transaction.category || 'Uncategorized'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{(transaction.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getPaymentMethodIcon(transaction.payment_method)}</span>
                      <span className="text-sm text-gray-600 capitalize">
                        {transaction.payment_method?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Edit transaction"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredTransactions.length)}</span> of{' '}
                  <span className="font-medium">{filteredTransactions.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Transaction</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingTransaction.description || ''}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    description: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={editingTransaction.amount || ''}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    amount: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editingTransaction.category || ''}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    category: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.filter(cat => cat !== 'all').map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editingTransaction.notes || ''}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    notes: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-600 mb-4">
            {transactions.length === 0 
              ? "You haven't added any transactions yet."
              : "No transactions match your current filters."
            }
          </p>
          {transactions.length === 0 && (
            <button
              onClick={() => window.location.href = '/dashboard/transactions'}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Your First Transaction
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
