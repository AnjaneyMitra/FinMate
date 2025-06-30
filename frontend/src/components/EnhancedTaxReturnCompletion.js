import React, { useState, useEffect } from 'react';
import { AlertCircle, FileText, ArrowLeft, ArrowRight, Save, Send, Clock, Loader } from 'lucide-react';

// Props: selectedForm (metadata), onBack, onComplete
const EnhancedTaxReturnCompletion = ({ selectedForm, onBack, onComplete }) => {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [aiHelp, setAiHelp] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [validation, setValidation] = useState({});

  // Simulate dynamic sections/fields from selectedForm
  const sections = selectedForm?.sections || ['Personal Information', 'Income Details', 'Deductions', 'Summary'];
  const totalSteps = sections.length;

  // Fetch dynamic field definitions from backend when selectedForm changes
  useEffect(() => {
    if (selectedForm?.id) {
      fetchFormFields();
    }
    setError(null);
    setSuccess(false);
    setAiHelp(null);
  }, [selectedForm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFormFields = async () => {
    try {
      setIsLoadingFields(true);
      const response = await fetch(`http://localhost:8000/api/tax/forms/${selectedForm.id}`);
      const data = await response.json();
      
      if (data.form_details?.fields) {
        setFormFields(data.form_details.fields);
      } else {
        setFormFields([]);
      }
    } catch (e) {
      setFormFields([]);
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else if (onBack) onBack();
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const response = await fetch('http://localhost:8000/api/tax/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_id: selectedForm?.id,
          form_data: formData,
          current_step: currentStep
        })
      });
      
      if (response.ok) {
        setAiHelp('Draft saved successfully!');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setError('Failed to save draft. Please try again.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('http://localhost:8000/api/tax/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_id: selectedForm?.id,
          form_data: formData
        })
      });
      
      if (response.ok) {
        setSuccess(true);
        if (onComplete) onComplete();
      } else {
        setError('Failed to submit return. Please check your data and try again.');
      }
    } catch (error) {
      console.error('Error submitting return:', error);
      setError('Failed to submit return. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get fields for current section
  const getCurrentSectionFields = () => {
    const currentSection = sections[currentStep];
    return formFields.filter(field => field.section === currentSection);
  };

  // Render dynamic field based on type
  const renderField = (field) => {
    const fieldValue = formData[field.id] || '';
    
    switch (field.field_type) {
      case 'text':
      case 'number':
        return (
          <input
            key={field.id}
            className={`w-full border rounded-lg px-3 py-2 mb-2 ${
              validation[field.id] ? 'border-red-400 bg-red-50 dark:bg-red-900' : 'border-gray-300 dark:border-gray-700 dark:bg-neutral-900 dark:text-gray-100'
            }`}
            placeholder={field.placeholder || field.label}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            disabled={loading}
          />
        );
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">{field.label}</label>
            <select
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:text-gray-100"
              disabled={loading}
            >
              <option value="">Select an option</option>
              {field.options?.map((option, idx) => (
                <option key={idx} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        );
      default:
        return (
          <input
            key={field.id}
            className={`w-full border rounded-lg px-3 py-2 mb-2 ${
              validation[field.id] ? 'border-red-400 bg-red-50 dark:bg-red-900' : 'border-gray-300 dark:border-gray-700 dark:bg-neutral-900 dark:text-gray-100'
            }`}
            placeholder={field.placeholder || field.label}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            disabled={loading}
          />
        );
    }
  };

  // Placeholder for AI help
  const handleAiHelp = async () => {
    try {
      const currentSection = sections[currentStep];
      const response = await fetch('http://localhost:8000/api/tax/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form_id: selectedForm?.id,
          field_id: currentSection,
          user_query: `Help me understand ${currentSection}`,
          form_data: formData
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiHelp(data.assistance || 'AI assistance is available for this section.');
      } else {
        setAiHelp('AI-powered help and suggestions will appear here.');
      }
    } catch (error) {
      console.error('Error getting AI help:', error);
      setAiHelp('AI-powered help and suggestions will appear here.');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-800 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center">
        <button onClick={onBack} className="mr-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-300" />
          {selectedForm?.name || 'Tax Return'}
        </h2>
      </div>
      {/* Alerts */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded-lg p-4 flex items-center mb-4">
          <AlertCircle className="w-5 h-5 mr-2 text-red-500 dark:text-red-300" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-lg p-4 flex items-center mb-4">
          <AlertCircle className="w-5 h-5 mr-2 text-green-500 dark:text-green-300" />
          <span>Return submitted successfully!</span>
        </div>
      )}
      {/* Form fields and navigation (simplified for brevity) */}
      <form onSubmit={e => { e.preventDefault(); /* handle submit */ }}>
        {formFields.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">No fields to display.</div>
        )}
        {formFields.map((field, idx) => (
          <div key={field.name || idx} className="mb-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{field.label}</label>
            {/* Render field with dark mode support */}
            {(() => {
              const fieldValue = formData[field.id] || '';
              switch (field.field_type) {
                case 'text':
                case 'number':
                  return (
                    <input
                      key={field.id}
                      className={`w-full border rounded-lg px-3 py-2 mb-2 ${
                        validation[field.id] ? 'border-red-400 bg-red-50 dark:bg-red-900' : 'border-gray-300 dark:border-gray-700 dark:bg-neutral-900 dark:text-gray-100'
                      }`}
                      placeholder={field.placeholder || field.label}
                      value={fieldValue}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      disabled={loading}
                    />
                  );
                case 'select':
                  return (
                    <div key={field.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">{field.label}</label>
                      <select
                        value={fieldValue}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:text-gray-100"
                        disabled={loading}
                      >
                        <option value="">Select an option</option>
                        {field.options?.map((option, idx) => (
                          <option key={idx} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                default:
                  return (
                    <input
                      key={field.id}
                      className={`w-full border rounded-lg px-3 py-2 mb-2 ${
                        validation[field.id] ? 'border-red-400 bg-red-50 dark:bg-red-900' : 'border-gray-300 dark:border-gray-700 dark:bg-neutral-900 dark:text-gray-100'
                      }`}
                      placeholder={field.placeholder || field.label}
                      value={fieldValue}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      disabled={loading}
                    />
                  );
              }
            })()}
          </div>
        ))}
        <div className="flex space-x-2 mt-6">
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            {savingDraft ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-medium bg-blue-600 dark:bg-blue-800 text-white hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Return'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedTaxReturnCompletion;
