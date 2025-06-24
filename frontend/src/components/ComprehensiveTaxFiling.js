import React, { useState, useEffect } from 'react';
import TaxFormDiscovery from './TaxFormDiscovery';
import TaxFilingWizard from './TaxFilingWizard';
import TaxGlossaryHelp from './TaxGlossaryHelp';
import TaxDocumentManager from './TaxDocumentManager';
import { FileText, Compass, HelpCircle, FolderOpen, ArrowLeft, CheckCircle } from 'lucide-react';

const ComprehensiveTaxFiling = ({ user }) => {
  const [currentView, setCurrentView] = useState('discovery');
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [formDetails, setFormDetails] = useState(null);
  const [userProfile, setUserProfile] = useState({});
  const [completedSubmissions, setCompletedSubmissions] = useState([]);

  const views = [
    {
      id: 'discovery',
      name: 'Form Discovery',
      icon: Compass,
      description: 'Find the right tax form'
    },
    {
      id: 'documents',
      name: 'Document Manager',
      icon: FolderOpen,
      description: 'Upload and organize documents'
    },
    {
      id: 'glossary',
      name: 'Glossary & Help',
      icon: HelpCircle,
      description: 'Get help and explanations'
    },
    {
      id: 'filing',
      name: 'Tax Filing',
      icon: FileText,
      description: 'Complete your tax return'
    }
  ];

  useEffect(() => {
    // Load user profile and transaction data for smart recommendations
    loadUserProfile();
    loadCompletedSubmissions();
  }, [user]);

  const loadUserProfile = async () => {
    try {
      // This would integrate with your existing user data
      const profile = {
        hasBusinessIncome: false,
        hasCapitalGains: false,
        hasRentalIncome: false,
        hasForeignAssets: false,
        estimatedIncome: 800000,
        preferredComplexity: 'simple',
        previouslyFiledForm: 'ITR-1'
      };
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadCompletedSubmissions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/tax/submissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompletedSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const handleFormSelect = async (formId) => {
    setSelectedFormId(formId);
    
    // Fetch form details
    try {
      const response = await fetch(`/api/tax/forms/${formId}`);
      const data = await response.json();
      setFormDetails(data.form_details);
      setCurrentView('filing');
    } catch (error) {
      console.error('Error fetching form details:', error);
    }
  };

  const handleFilingComplete = (result) => {
    if (result.success) {
      setCompletedSubmissions(prev => [...prev, {
        id: Date.now(),
        form_id: selectedFormId,
        form_name: formDetails?.name,
        acknowledgment_number: result.acknowledgment_number,
        submitted_at: new Date().toISOString(),
        status: 'submitted'
      }]);
      
      // Show success and navigate back
      alert(`Success! Your tax return has been submitted. Acknowledgment Number: ${result.acknowledgment_number}`);
      setCurrentView('discovery');
      setSelectedFormId(null);
      setFormDetails(null);
    }
  };

  const handleBackToDiscovery = () => {
    setCurrentView('discovery');
    setSelectedFormId(null);
    setFormDetails(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'discovery':
        return (
          <TaxFormDiscovery
            onFormSelect={handleFormSelect}
            userProfile={userProfile}
          />
        );
      
      case 'documents':
        return (
          <TaxDocumentManager
            formId={selectedFormId}
            requiredDocuments={formDetails?.required_documents || []}
            onDocumentUploaded={(documents) => {
              console.log('Documents uploaded:', documents);
            }}
          />
        );
      
      case 'glossary':
        return (
          <TaxGlossaryHelp
            searchTerm=""
            onTermSelect={(term) => {
              console.log('Term selected:', term);
            }}
          />
        );
      
      case 'filing':
        if (!selectedFormId) {
          return (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Form Selected</h3>
              <p className="text-gray-600 mb-4">Please select a tax form to continue with filing</p>
              <button
                onClick={() => setCurrentView('discovery')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Form Discovery
              </button>
            </div>
          );
        }
        
        return (
          <TaxFilingWizard
            formId={selectedFormId}
            onComplete={handleFilingComplete}
            onCancel={handleBackToDiscovery}
          />
        );
      
      default:
        return <TaxFormDiscovery onFormSelect={handleFormSelect} userProfile={userProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentView === 'filing' && selectedFormId && (
                <button
                  onClick={handleBackToDiscovery}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Discovery
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tax Filing Center</h1>
                <p className="text-gray-600">Complete tax return filing with AI assistance</p>
              </div>
            </div>
            
            {completedSubmissions.length > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {completedSubmissions.length} submission{completedSubmissions.length !== 1 ? 's' : ''} completed
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = currentView === view.id;
              const isDisabled = view.id === 'filing' && !selectedFormId;
              
              return (
                <button
                  key={view.id}
                  onClick={() => !isDisabled && setCurrentView(view.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : isDisabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{view.name}</span>
                  {view.id === 'filing' && selectedFormId && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {formDetails?.name}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentView !== 'filing' && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {views.find(v => v.id === currentView)?.name}
              </h2>
              <p className="text-gray-700">
                {views.find(v => v.id === currentView)?.description}
              </p>
              
              {currentView === 'discovery' && completedSubmissions.length > 0 && (
                <div className="mt-4 p-4 bg-white bg-opacity-60 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Recent Submissions</h3>
                  <div className="space-y-2">
                    {completedSubmissions.slice(0, 3).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{submission.form_name}</span>
                        <span className="text-green-600 font-medium">
                          Submitted • {submission.acknowledgment_number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {renderCurrentView()}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Tax Filing Help</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Filing Guidelines</a></li>
                <li><a href="#" className="hover:text-blue-600">Common Mistakes</a></li>
                <li><a href="#" className="hover:text-blue-600">Tax Calendar</a></li>
                <li><a href="#" className="hover:text-blue-600">Forms Download</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Video Tutorials</a></li>
                <li><a href="#" className="hover:text-blue-600">Tax Calculator</a></li>
                <li><a href="#" className="hover:text-blue-600">Glossary</a></li>
                <li><a href="#" className="hover:text-blue-600">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Contact Support</a></li>
                <li><a href="#" className="hover:text-blue-600">Live Chat</a></li>
                <li><a href="#" className="hover:text-blue-600">Email Help</a></li>
                <li><a href="#" className="hover:text-blue-600">Schedule Call</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600">Security</a></li>
                <li><a href="#" className="hover:text-blue-600">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>© 2024 FinMate Tax Filing. All rights reserved. | Powered by AI • Secured by encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveTaxFiling;
