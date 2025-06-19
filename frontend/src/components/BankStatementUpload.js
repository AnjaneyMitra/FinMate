import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Check, X, AlertCircle, Loader } from 'lucide-react';

const BankStatementUpload = ({ user, onTransactionsImported, onClose }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('upload'); // 'upload', 'review', 'importing', 'complete'
  const fileInputRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const supportedFormats = ['.csv', '.pdf'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (selectedFile) => {
    setError('');
    setSuccess('');
    
    if (!selectedFile) return;

    // Validate file type
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!supportedFormats.includes(fileExtension)) {
      setError(`Unsupported file format. Please upload ${supportedFormats.join(' or ')} files.`);
      return;
    }

    // Validate file size
    if (selectedFile.size > maxFileSize) {
      setError('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const uploadAndParseStatement = async () => {
    if (!file || !user) return;

    setUploading(true);
    setParsing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/transactions/upload-statement`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to parse bank statement');
      }

      if (result.success && result.transactions.length > 0) {
        setParsedTransactions(result.transactions);
        // Select all transactions by default
        setSelectedTransactions(new Set(result.transactions.map((_, index) => index)));
        setStep('review');
        setSuccess(`Successfully parsed ${result.transactions.length} transactions from your bank statement.`);
      } else {
        setError('No transactions found in the uploaded file. Please check the file format.');
      }
    } catch (err) {
      console.error('Error uploading bank statement:', err);
      setError(err.message || 'Failed to parse bank statement. Please try again.');
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const toggleTransactionSelection = (index) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTransactions(newSelected);
  };

  const selectAllTransactions = () => {
    setSelectedTransactions(new Set(parsedTransactions.map((_, index) => index)));
  };

  const deselectAllTransactions = () => {
    setSelectedTransactions(new Set());
  };

  const importSelectedTransactions = async () => {
    if (selectedTransactions.size === 0) {
      setError('Please select at least one transaction to import.');
      return;
    }

    setImporting(true);
    setError('');
    setStep('importing');

    try {
      const transactionsToImport = Array.from(selectedTransactions).map(index => 
        parsedTransactions[index]
      );

      const response = await fetch(`${API_BASE_URL}/api/transactions/import-parsed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: transactionsToImport,
          user_id: user.uid
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Failed to import transactions');
      }

      setStep('complete');
      setSuccess(`Successfully imported ${result.imported_count} transactions to your account.`);
      
      // Notify parent component
      if (onTransactionsImported) {
        onTransactionsImported(result);
      }

    } catch (err) {
      console.error('Error importing transactions:', err);
      setError(err.message || 'Failed to import transactions. Please try again.');
      setStep('review');
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['Date', 'Description', 'Amount', 'Type'],
      ['2024-06-15', 'Grocery Store Purchase', '250.00', 'debit'],
      ['2024-06-14', 'ATM Withdrawal', '500.00', 'debit'],
      ['2024-06-13', 'Online Transfer', '1000.00', 'credit'],
      ['2024-06-12', 'Restaurant Bill', '450.00', 'debit']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'sample_bank_statement.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const resetUpload = () => {
    setFile(null);
    setParsedTransactions([]);
    setSelectedTransactions(new Set());
    setError('');
    setSuccess('');
    setStep('upload');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Bank Statement Upload</h2>
                <p className="text-blue-100">Import transactions from your bank statement</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Success</p>
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Step 1: File Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  file 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {file ? (
                  <div className="space-y-4">
                    <FileText className="w-16 h-16 text-green-500 mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-green-800">{file.name}</p>
                      <p className="text-sm text-green-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={uploadAndParseStatement}
                        disabled={uploading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            {parsing ? 'Parsing...' : 'Uploading...'}
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Parse Statement
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setFile(null)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-xl font-semibold text-gray-700 mb-2">
                        Drop your bank statement here
                      </p>
                      <p className="text-gray-500 mb-4">
                        or click to browse files
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.pdf"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              {/* Supported Formats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Supported Formats & Banks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">File Formats:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• CSV files (.csv)</li>
                      <li>• PDF statements (.pdf)</li>
                      <li>• Maximum size: 10MB</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Supported Banks:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• State Bank of India (SBI)</li>
                      <li>• ICICI Bank</li>
                      <li>• HDFC Bank</li>
                      <li>• Axis Bank</li>
                      <li>• Generic CSV format</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={downloadSampleCSV}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download sample CSV format
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review Transactions */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  Review Transactions ({parsedTransactions.length} found)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllTransactions}
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllTransactions}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>{selectedTransactions.size}</strong> transactions selected for import.
                  Review and uncheck any transactions you don't want to import.
                </p>
              </div>

              {/* Transactions List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {parsedTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedTransactions.has(index)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(index)}
                        onChange={() => toggleTransactionSelection(index)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Date</p>
                          <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-700">Description</p>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                          {transaction.category && (
                            <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                              {transaction.category}
                            </span>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end justify-center">
                          <p className="text-sm font-medium text-gray-700">Amount</p>
                          <span className="inline-flex items-center text-sm font-semibold">
                            {transaction.transaction_type === 'income' ? (
                              <span className="text-green-600 mr-1" title="Deposit">+{/* plus icon */}</span>
                            ) : (
                              <span className="text-red-600 mr-1" title="Withdrawal">-{/* minus icon */}</span>
                            )}
                            <span className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(transaction.amount)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={importSelectedTransactions}
                  disabled={selectedTransactions.size === 0 || importing}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Import {selectedTransactions.size} Transaction{selectedTransactions.size !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
                <button
                  onClick={resetUpload}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Importing */}
          {step === 'importing' && (
            <div className="text-center py-12">
              <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Importing Transactions</h3>
              <p className="text-gray-600">Please wait while we import your transactions...</p>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Import Complete!</h3>
              <p className="text-gray-600 mb-6">Your transactions have been successfully imported.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Dashboard
                </button>
                <button
                  onClick={resetUpload}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Import More
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankStatementUpload;