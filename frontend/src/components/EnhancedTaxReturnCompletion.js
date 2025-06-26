import React, { useState, useEffect } from 'react';
import { ThemedCard, ThemedButton, ThemedInput, ThemedAlert } from '../contexts/ThemeContext';
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
      }
    } catch (error) {
      console.error('Error fetching form fields:', error);
      setError('Failed to load form fields. Please try again.');
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
          <ThemedInput
            key={field.id}
            label={field.label}
            type={field.field_type}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            error={validation[field.id]}
          />
        );
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium">{field.label}</label>
            <select
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required={field.required}
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
          <ThemedInput
            key={field.id}
            label={field.label}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
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
    <ThemedCard variant="elevated" className="max-w-4xl mx-auto mt-8 p-6">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{selectedForm?.name || 'Tax Return'}</h2>
            <p className="text-sm text-secondary">{selectedForm?.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted">
              {selectedForm?.estimated_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedForm.estimated_time} minutes
                </span>
              )}
              {selectedForm?.difficulty_level && (
                <span className="flex items-center gap-1">
                  📊 {selectedForm.difficulty_level}
                </span>
              )}
              {selectedForm?.filing_deadline && (
                <span className="flex items-center gap-1">
                  📅 Due: {selectedForm.filing_deadline}
                </span>
              )}
            </div>
          </div>
        </div>
        {selectedForm?.official_pdf_link && (
          <ThemedButton
            variant="outline"
            onClick={() => window.open(selectedForm.official_pdf_link, '_blank')}
            size="sm"
          >
            📄 View Official Form
          </ThemedButton>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {sections.map((section, idx) => (
          <div key={section} className={`flex-1 h-2 rounded-full ${idx <= currentStep ? 'bg-accent' : 'bg-muted'}`}></div>
        ))}
        <span className="ml-2 text-xs text-muted">Step {currentStep + 1} of {totalSteps}</span>
      </div>

      {/* Section Title */}
      <h3 className="text-lg font-semibold mb-2">{sections[currentStep]}</h3>

      {/* Dynamic Fields Placeholder */}
      <div className="space-y-4 mb-6">
        {isLoadingFields ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading form fields...</span>
          </div>
        ) : getCurrentSectionFields().length > 0 ? (
          getCurrentSectionFields().map(field => renderField(field))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No fields defined for this section yet.</p>
            <p className="text-sm">This form is still being configured.</p>
          </div>
        )}
      </div>

      {/* AI Help & Validation */}
      <div className="mb-4 flex items-center gap-2">
        <ThemedButton variant="ghost" onClick={handleAiHelp} size="sm">
          <AlertCircle className="w-4 h-4 mr-1" /> Get AI Help
        </ThemedButton>
        {aiHelp && <span className="text-xs text-info">{aiHelp}</span>}
      </div>

      {/* Error/Success Alerts */}
      {error && <ThemedAlert type="error" className="mb-4">{error}</ThemedAlert>}
      {success && <ThemedAlert type="success" className="mb-4">Return submitted successfully!</ThemedAlert>}

      {/* Navigation & Actions */}
      <div className="flex items-center justify-between mt-6 gap-2">
        <ThemedButton variant="secondary" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </ThemedButton>
        <div className="flex gap-2">
          <ThemedButton variant="ghost" onClick={handleSaveDraft} disabled={savingDraft}>
            <Save className="w-4 h-4 mr-1" /> {savingDraft ? 'Saving...' : 'Save Draft'}
          </ThemedButton>
          {currentStep < totalSteps - 1 ? (
            <ThemedButton variant="primary" onClick={handleNext}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </ThemedButton>
          ) : (
            <ThemedButton variant="primary" onClick={handleSubmit} loading={loading}>
              <Send className="w-4 h-4 mr-1" /> {loading ? 'Submitting...' : 'Submit Return'}
            </ThemedButton>
          )}
        </div>
      </div>
    </ThemedCard>
  );
};

export default EnhancedTaxReturnCompletion;
