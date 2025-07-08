import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FileText, Scan, Check, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const TaxDocumentManager = () => {
  const { user } = useOutletContext();
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState({});
  const [previewDocument, setPreviewDocument] = useState(null);
  const [documentCategories, setDocumentCategories] = useState([]);
  const fileInputRef = useRef(null);

  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};

  const safeBg = bg || { primary: 'bg-white', secondary: 'bg-gray-50', card: 'bg-white', tertiary: 'bg-gray-100' };
  const safeText = text || { primary: 'text-gray-900', secondary: 'text-gray-600', accent: 'text-teal-600' };
  const safeBorder = border || { primary: 'border-gray-200', accent: 'border-teal-300' };
  const safeAccent = accent || { primary: 'bg-teal-600', secondary: 'bg-blue-600', success: 'bg-green-600', error: 'bg-red-600' };

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

  useEffect(() => {
    setDocumentCategories(defaultDocumentCategories);
  }, []);

  const handleFileUpload = useCallback(async (files, categoryId) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    // Mock upload
    setTimeout(() => {
      const newDocuments = Array.from(files).map((file, index) => ({
        id: `${categoryId}-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        categoryId,
        uploadedAt: new Date().toISOString(),
        ocrProcessed: false,
        ocrData: null
      }));

      setUploadedDocuments(prev => [...prev, ...newDocuments]);
      setUploading(false);

      newDocuments.forEach(doc => {
        if (doc.type === 'application/pdf' || doc.type.startsWith('image/')) {
          processOCR(doc.id);
        }
      });
    }, 1500);
  }, []);

  const processOCR = async (documentId) => {
    setOcrProcessing(prev => ({ ...prev, [documentId]: true }));
    // Mock OCR processing
    setTimeout(() => {
      setUploadedDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, ocrData: { extracted: 'mock data' }, ocrProcessed: true }
            : doc
        )
      );
      setOcrProcessing(prev => ({ ...prev, [documentId]: false }));
    }, 2000);
  };

  const deleteDocument = (documentId) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
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
    const fileInput = useRef(null);
    
    return (
      <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
        completionStatus === 'complete' ? `border-green-300 ${safeBg.secondary}` :
        completionStatus === 'uploaded' ? `border-blue-300 ${safeBg.secondary}` :
        completionStatus === 'missing' && category.required ? `border-red-300 ${safeBg.secondary}` :
        `${safeBorder.primary} ${safeBg.secondary} hover:border-blue-400`
      }`}>
        <div className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h3 className={`font-semibold ${safeText.primary}`}>{category.name}</h3>
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
          
          <p className={`text-sm ${safeText.secondary} mb-4`}>{category.description}</p>
          
          {documents.length === 0 ? (
            <div>
              <Upload className={`w-8 h-8 ${safeText.tertiary} mx-auto mb-2`} />
              <p className={`text-sm ${safeText.secondary} mb-2`}>
                Drop files here or click to upload
              </p>
              <div className={`text-xs ${safeText.tertiary}`}>
                <p>Accepted: PDF, JPG, PNG (max 10MB each)</p>
                <p className="mt-1">Suggested: {category.documents.join(', ')}</p>
              </div>
              
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e.target.files, category.id)}
                className="hidden"
                ref={fileInput}
              />
              <button
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className={`mt-3 px-4 py-2 ${safeAccent.primary} text-white rounded-lg hover:opacity-90 disabled:opacity-50`}
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
                onClick={() => fileInput.current?.click()}
                className={`text-sm ${safeText.accent} hover:opacity-80 flex items-center gap-1 mx-auto`}
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
                ref={fileInput}
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
      <div className={`flex items-center justify-between p-3 ${safeBg.card} border ${safeBorder.primary} rounded-lg`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 ${safeAccent.secondary} bg-opacity-10 rounded`}>
            <FileText className={`w-4 h-4 ${safeText.accent}`} />
          </div>
          <div>
            <p className={`font-medium ${safeText.primary} text-sm`}>{document.name}</p>
            <p className={`text-xs ${safeText.tertiary}`}>
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
              <div className={`text-xs ${safeText.accent} flex items-center gap-1 mt-1`}>
                <div className={`animate-spin rounded-full h-3 w-3 border-b-2 ${safeBorder.accent}`}></div>
                Processing...
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(document)}
            className={`p-1 ${safeText.tertiary} hover:${safeText.accent}`}
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(document.id)}
            className={`p-1 ${safeText.tertiary} hover:text-red-600`}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${safeText.primary} mb-2`}>Document Manager</h1>
        <p className={`${safeText.secondary}`}>Upload and organize your tax documents securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {documentCategories.map(category => (
          <DocumentUploadZone 
            key={category.id} 
            category={category} 
            documents={getDocumentsByCategory(category.id)} 
          />
        ))}
      </div>

      {previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setPreviewDocument(null)}>
          <div className={`${safeBg.card} p-8 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-2xl font-bold ${safeText.primary} mb-4`}>{previewDocument.name}</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(previewDocument, null, 2)}
              </pre>
            </div>
            <button onClick={() => setPreviewDocument(null)} className={`mt-4 px-4 py-2 ${safeAccent.primary} text-white rounded-lg`}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxDocumentManager;
