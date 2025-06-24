import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle, FileText, HelpCircle, Save, Send } from 'lucide-react';

const TaxFilingWizard = ({ formId, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [formDetails, setFormDetails] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldHelp, setFieldHelp] = useState({});
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Step configuration for different form types
  const getStepConfiguration = (formType) => {
    const baseSteps = [
      {
        id: 'personal_info',
        title: 'Personal Information',
        description: 'Basic taxpayer details',
        icon: '👤',
        fields: ['pan', 'aadhaar', 'name', 'dob', 'address']
      },
      {
        id: 'income_details',
        title: 'Income Details',
        description: 'All sources of income',
        icon: '💰',
        fields: ['salary_income', 'house_property_income', 'other_sources_income']
      },
      {
        id: 'deductions',
        title: 'Deductions & Exemptions',
        description: 'Tax-saving investments and deductions',
        icon: '📊',
        fields: ['section_80c', 'section_80d', 'hra_exemption']
      },
      {
        id: 'tax_computation',
        title: 'Tax Computation',
        description: 'Calculate your tax liability',
        icon: '🧮',
        fields: ['advance_tax', 'tds_salary', 'self_assessment_tax']
      },
      {
        id: 'bank_details',
        title: 'Bank Details',
        description: 'Account information for refunds',
        icon: '🏦',
        fields: ['bank_account', 'ifsc_code']
      },
      {
        id: 'review_submit',
        title: 'Review & Submit',
        description: 'Final review before submission',
        icon: '✅',
        fields: []
      }
    ];

    // Customize steps based on form type
    if (formType === 'ITR-1') {
      return baseSteps.filter(step => 
        ['personal_info', 'income_details', 'deductions', 'tax_computation', 'bank_details', 'review_submit'].includes(step.id)
      );
    } else if (formType === 'ITR-3') {
      return [
        ...baseSteps.slice(0, 2),
        {
          id: 'business_income',
          title: 'Business/Professional Income',
          description: 'Details of business or professional income',
          icon: '🏢',
          fields: ['business_income', 'business_expenses', 'depreciation']
        },
        ...baseSteps.slice(2)
      ];
    }

    return baseSteps;
  };

  const [steps, setSteps] = useState([]);

  useEffect(() => {
    if (formId) {
      fetchFormDetails();
    }
  }, [formId]);

  useEffect(() => {
    // Auto-save functionality
    if (autoSaveEnabled && Object.keys(formData).length > 0) {
      const autoSaveTimer = setTimeout(() => {
        saveDraft();
      }, 5000); // Auto-save every 5 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [formData, autoSaveEnabled]);

  const fetchFormDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tax/forms/${formId}`);
      const data = await response.json();
      setFormDetails(data.form_details);
      
      // Set up steps based on form type
      const formSteps = getStepConfiguration(data.form_details.name);
      setSteps(formSteps);
      
      // Load existing draft if available
      await loadExistingDraft();
    } catch (error) {
      console.error('Error fetching form details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingDraft = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/tax/drafts?form_id=${formId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.drafts && data.drafts.length > 0) {
          const latestDraft = data.drafts[0];
          setFormData(latestDraft.form_data || {});
          // Determine which steps are completed based on form data
          updateCompletedSteps(latestDraft.form_data || {});
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const updateCompletedSteps = (data) => {
    const completed = new Set();
    steps.forEach((step, index) => {
      const stepFields = step.fields;
      const hasAllRequiredFields = stepFields.every(field => {
        const fieldDef = formDetails?.fields?.find(f => f.field_id === field);
        return !fieldDef?.required || (data[field] && data[field].toString().trim() !== '');
      });
      
      if (hasAllRequiredFields) {
        completed.add(index);
      }
    });
    setCompletedSteps(completed);
  };

  const saveDraft = async () => {
    if (!formId || Object.keys(formData).length === 0) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/tax/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          form_id: formId,
          form_data: formData
        })
      });

      if (!response.ok) {
        console.error('Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const validateCurrentStep = () => {
    const currentStepData = steps[currentStep];
    const errors = {};
    
    currentStepData.fields.forEach(fieldId => {
      const fieldDef = formDetails?.fields?.find(f => f.field_id === fieldId);
      if (fieldDef?.required && (!formData[fieldId] || formData[fieldId].toString().trim() === '')) {
        errors[fieldId] = 'This field is required';
      }
      
      // Add specific validation rules
      if (fieldId === 'pan' && formData[fieldId]) {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(formData[fieldId])) {
          errors[fieldId] = 'Invalid PAN format (e.g., ABCDE1234F)';
        }
      }
      
      if (fieldId === 'aadhaar' && formData[fieldId]) {
        const aadhaarRegex = /^[0-9]{12}$/;
        if (!aadhaarRegex.test(formData[fieldId])) {
          errors[fieldId] = 'Invalid Aadhaar number (12 digits)';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const getFieldAssistance = async (fieldId) => {
    if (fieldHelp[fieldId]) {
      // Show cached help
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/tax/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          form_id: formId,
          field_id: fieldId,
          user_query: `Please explain this field: ${fieldId}`,
          form_data: formData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFieldHelp(prev => ({
          ...prev,
          [fieldId]: data.assistance
        }));
      }
    } catch (error) {
      console.error('Error getting field assistance:', error);
    }
  };

  const submitForm = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/tax/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          form_id: formId,
          form_data: formData
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        onComplete({
          success: true,
          acknowledgment_number: data.acknowledgment_number,
          message: 'Form submitted successfully!'
        });
      } else {
        setValidationErrors({ general: data.detail });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setValidationErrors({ general: 'Failed to submit form. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (fieldId) => {
    const fieldDef = formDetails?.fields?.find(f => f.field_id === fieldId);
    if (!fieldDef) return null;

    const value = formData[fieldId] || '';
    const hasError = validationErrors[fieldId];
    const hasHelp = fieldHelp[fieldId];

    return (
      <div key={fieldId} className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor={fieldId} className={`block text-sm font-medium ${hasError ? 'text-red-600' : 'text-gray-700'}`}>
            {fieldDef.label}
            {fieldDef.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <button
            type="button"
            onClick={() => getFieldAssistance(fieldId)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Get help for this field"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {fieldDef.field_type === 'select' ? (
          <select
            id={fieldId}
            value={value}
            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select...</option>
            {fieldDef.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={fieldDef.field_type === 'number' ? 'number' : 'text'}
            id={fieldId}
            value={value}
            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
            placeholder={fieldDef.placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        )}

        {hasError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {hasError}
          </p>
        )}

        {hasHelp && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-blue-900 mb-1">AI Assistant:</p>
            <p className="text-blue-800">{hasHelp.explanation}</p>
            {hasHelp.actionable_advice && (
              <p className="text-blue-700 mt-2 font-medium">💡 {hasHelp.actionable_advice}</p>
            )}
          </div>
        )}

        {fieldDef.description && (
          <p className="text-xs text-gray-500">{fieldDef.description}</p>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading form details...</span>
        </div>
      );
    }

    const currentStepData = steps[currentStep];
    if (!currentStepData) return null;

    if (currentStepData.id === 'review_submit') {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Review Your Information</h3>
            <p className="text-gray-600">Please review all information before submitting your tax return.</p>
          </div>

          {steps.slice(0, -1).map((step, index) => (
            <div key={step.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <span>{step.icon}</span>
                  {step.title}
                </h4>
                <button
                  onClick={() => setCurrentStep(index)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {step.fields.map(fieldId => {
                  const fieldDef = formDetails?.fields?.find(f => f.field_id === fieldId);
                  const value = formData[fieldId];
                  if (!value || !fieldDef) return null;
                  
                  return (
                    <div key={fieldId} className="flex justify-between">
                      <span className="text-gray-600">{fieldDef.label}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {validationErrors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {validationErrors.general}
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-2xl">{currentStepData.icon}</span>
            {currentStepData.title}
          </h3>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentStepData.fields.map(fieldId => renderField(fieldId))}
        </div>
      </div>
    );
  };

  if (!formDetails) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{formDetails.name} - Tax Filing Wizard</h1>
            <p className="text-gray-600">{formDetails.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm">Auto-saving...</span>
              </div>
            )}
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                index === currentStep
                  ? 'bg-blue-600 text-white'
                  : completedSteps.has(index)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {completedSteps.has(index) ? (
                  <CheckCircle className="w-5 h-5" />
                ) : index === currentStep ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs text-gray-600 text-center max-w-20">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
            currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={saveDraft}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={submitForm}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              Submit Return
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxFilingWizard;
