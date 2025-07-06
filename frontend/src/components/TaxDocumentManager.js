import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Scan, Check, AlertCircle, Download, Eye, Trash2 } from 'lucide-react';

const TaxDocumentManager = ({ formId, onDocumentUploaded, requiredDocuments = [] }) => {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState({});
  const [previewDocument, setPreviewDocument] = useState(null);
  const [documentCategories, setDocumentCategories] = useState([]);
  const fileInputRef = useRef(null);

  // Document categories and their requirements
  const defaultDocumentCategories = [
    {
      id: 'income_proof',
      name: 'Income Proof',
      icon: '💰',
      required: true,
      documents: ['Form 16', 'Salary Certificate', 'Bank Statement'],
      description: 'Documents proving your annual income'
    },
    {
      id: 'investment_proof',
      name: 'Investment Proof',
      icon: '📊',
      required: false,
      documents: ['PPF Statement', 'ELSS Certificate', 'Insurance Premium Receipt'],
      description: 'Proof of tax-saving investments under Section 80C'
    },
    {
      id: 'deduction_proof',
      name: 'Deduction Proof',
      icon: '🏥',
      required: false,
      documents: ['Medical Insurance Premium', 'HRA Receipts', 'Home Loan Interest Certificate'],
      description: 'Supporting documents for various deductions'
    },
    {
      id: 'bank_details',
      name: 'Bank Details',
      icon: '🏦',
      required: true,
      documents: ['Bank Account Statement', 'Cancelled Cheque'],
      description: 'Bank account information for refund processing'
    },
    {
      id: 'identity_proof',
      name: 'Identity Proof',
      icon: '🆔',
      required: true,
      documents: ['PAN Card', 'Aadhaar Card'],
      description: 'Government-issued identity documents'
    }
  ];

  React.useEffect(() => {
    // Initialize document categories based on form requirements
    const categories = requiredDocuments.length > 0 
      ? defaultDocumentCategories.filter(cat => 
          requiredDocuments.some(req => cat.documents.includes(req))
        )
      : defaultDocumentCategories;
    setDocumentCategories(categories);
  }, [requiredDocuments, defaultDocumentCategories]);

  const handleFileUpload = useCallback(async (files, categoryId) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach((file, index) => {
      formData.append(`documents`, file);
    });
    
    formData.append('category_id', categoryId);
    formData.append('form_id', formId);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/tax/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const newDocuments = data.documents.map(doc => ({
          ...doc,
          categoryId,
          uploadedAt: new Date().toISOString()
        }));
        
        setUploadedDocuments(prev => [...prev, ...newDocuments]);
        
        // Trigger OCR processing for supported file types
        newDocuments.forEach(doc => {
          if (doc.type === 'pdf' || doc.type.startsWith('image/')) {
            processOCR(doc.id);
          }
        });

        if (onDocumentUploaded) {
          onDocumentUploaded(newDocuments);
        }
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
    } finally {
      setUploading(false);
    }
  }, [formId, onDocumentUploaded]);

  const processOCR = async (documentId) => {
    setOcrProcessing(prev => ({ ...prev, [documentId]: true }));
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/tax/documents/${documentId}/ocr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, ocrData: data.extracted_data, ocrProcessed: true }
              : doc
          )
        );
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
    } finally {
      setOcrProcessing(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/tax/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getDocumentsByCategory = (categoryId) => {
    return uploadedDocuments.filter(doc => doc.categoryId === categoryId);
  };

  const getCategoryCompletionStatus = (category) => {
    const categoryDocs = getDocumentsByCategory(category.id);
    if (!category.required) return 'optional';
    if (categoryDocs.length === 0) return 'missing';
    if (categoryDocs.some(doc => doc.ocrProcessed && doc.ocrData)) return 'complete';
    return 'uploaded';
  };

  const DocumentUploadZone = ({ category, documents }) => {
    const completionStatus = getCategoryCompletionStatus(category);
    
    return (
      <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
        completionStatus === 'complete' ? 'border-green-300 bg-green-50' :
        completionStatus === 'uploaded' ? 'border-blue-300 bg-blue-50' :
        completionStatus === 'missing' && category.required ? 'border-red-300 bg-red-50' :
        'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
      }`}>
        <div className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                {category.required && <span className="text-xs text-red-600 font-medium">Required</span>}
              </div>
            </div>
            {completionStatus === 'complete' && (
              <Check className="w-6 h-6 text-green-600" />
            )}
            {completionStatus === 'missing' && category.required && (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-4">{category.description}</p>
          
          {documents.length === 0 ? (
            <div>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drop files here or click to upload
              </p>
              <div className="text-xs text-gray-500">
                <p>Accepted: PDF, JPG, PNG (max 10MB each)</p>
                <p className="mt-1">Suggested: {category.documents.join(', ')}</p>
              </div>
              
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e.target.files, category.id)}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Choose Files'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map(doc => (
                <DocumentCard key={doc.id} document={doc} onDelete={deleteDocument} onPreview={setPreviewDocument} />
              ))}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
              >
                <Upload className="w-4 h-4" />
                Add more documents
              </button>
              
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e.target.files, category.id)}
                className="hidden"
                ref={fileInputRef}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const DocumentCard = ({ document, onDelete, onPreview }) => {
    const isProcessing = ocrProcessing[document.id];
    
    return (
      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{document.name}</p>
            <p className="text-xs text-gray-500">
              {(document.size / 1024 / 1024).toFixed(1)} MB • 
              {new Date(document.uploadedAt).toLocaleDateString()}
            </p>
            {document.ocrProcessed && document.ocrData && (
              <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <Scan className="w-3 h-3" />
                Data extracted successfully
              </div>
            )}
            {isProcessing && (
              <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                Processing...
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(document)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.open(document.downloadUrl, '_blank')}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(document.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const DocumentPreviewModal = ({ document, onClose }) => {
    if (!document) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{document.name}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {document.type === 'pdf' ? (
              <iframe
                src={document.previewUrl}
                className="w-full h-full"
                title="Document Preview"
              />
            ) : (
              <img
                src={document.previewUrl}
                alt="Document Preview"
                className="w-full h-full object-contain"
              />
            )}
          </div>
          
          {document.ocrData && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2">Extracted Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(document.ocrData).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="ml-2 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getOverallProgress = () => {
    const requiredCategories = documentCategories.filter(cat => cat.required);
    const completedRequired = requiredCategories.filter(cat => 
      getCategoryCompletionStatus(cat) === 'complete'
    ).length;
    
    const totalCategories = documentCategories.length;
    const completedTotal = documentCategories.filter(cat => 
      getCategoryCompletionStatus(cat) === 'complete'
    ).length;
    
    return {
      required: requiredCategories.length > 0 ? (completedRequired / requiredCategories.length) * 100 : 100,
      overall: totalCategories > 0 ? (completedTotal / totalCategories) * 100 : 0
    };
  };

  const progress = getOverallProgress();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Manager</h1>
        <p className="text-gray-600">Upload and manage your tax filing documents with AI-powered data extraction</p>
        
        {/* Progress Indicators */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Required Documents</span>
              <span className="text-sm font-bold text-gray-900">{Math.round(progress.required)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.required}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">All Documents</span>
              <span className="text-sm font-bold text-gray-900">{Math.round(progress.overall)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.overall}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {documentCategories.map(category => {
          const categoryDocuments = getDocumentsByCategory(category.id);
          return (
            <DocumentUploadZone
              key={category.id}
              category={category}
              documents={categoryDocuments}
            />
          );
        })}
      </div>

      {/* Summary */}
      {uploadedDocuments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Document Summary</h2>
            <span className="text-sm text-gray-600">
              {uploadedDocuments.length} document{uploadedDocuments.length !== 1 ? 's' : ''} uploaded
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{uploadedDocuments.length}</div>
              <div className="text-sm text-blue-800">Total Documents</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {uploadedDocuments.filter(doc => doc.ocrProcessed).length}
              </div>
              <div className="text-sm text-green-800">Data Extracted</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {documentCategories.filter(cat => getCategoryCompletionStatus(cat) === 'complete').length}
              </div>
              <div className="text-sm text-purple-800">Categories Complete</div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
};

export default TaxDocumentManager;
