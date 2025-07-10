import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { AlertCircle, FileText, ArrowLeft, ArrowRight, Save, Send, Clock, Loader } from 'lucide-react';

// Mock data for demonstration
const mockFields = {
  'itr-1': [
    { id: 'pan', section: 'Personal Information', label: 'PAN', field_type: 'text', placeholder: 'Enter your PAN', required: true },
    { id: 'aadhaar', section: 'Personal Information', label: 'Aadhaar Number', field_type: 'text', placeholder: 'Enter your Aadhaar number', required: true },
    { id: 'income_salary', section: 'Income Details', label: 'Income from Salary', field_type: 'number', placeholder: 'Enter total salary', required: true },
    { id: 'income_other', section: 'Income Details', label: 'Income from Other Sources', field_type: 'number', placeholder: 'e.g., interest, dividends', required: false },
    { id: 'ded_80c', section: 'Deductions', label: '80C Deductions', field_type: 'number', placeholder: 'e.g., PPF, ELSS', required: false },
    { id: 'ded_80d', section: 'Deductions', label: '80D Deductions (Medical)', field_type: 'number', placeholder: 'Medical insurance premium', required: false },
  ],
  'itr-2': [
    // ... more complex fields for ITR-2
  ],
};

const EnhancedTaxReturnCompletion = () => {
  const outletContext = useOutletContext();
  const { theme } = useTheme();

  // Use local state for selectedForm if not present in context
  const [selectedForm, setSelectedForm] = useState(outletContext?.selectedForm || null);
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [aiHelp, setAiHelp] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [validation, setValidation] = useState({});
  const [aiGuide, setAiGuide] = useState([]); // Always an array
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState('');
  const [selectedFormId, setSelectedFormId] = useState(null);

  const sections = selectedForm?.sections || ['Personal Information', 'Income Details', 'Deductions', 'Summary'];
  const totalSteps = sections.length;

  // Fetch form details if not present
  useEffect(() => {
    let isMounted = true;
    const rawFormId = localStorage.getItem('selectedTaxFormId');
    const formId = rawFormId ? rawFormId.toLowerCase() : null;
    setSelectedFormId(formId);
    console.log('[DEBUG] selectedTaxFormId from localStorage:', rawFormId, '| Normalized:', formId);
    if (!selectedForm && formId) {
      console.log('[DEBUG] Fetching form details for formId:', formId);
      fetch(`/api/tax/forms/${formId}`)
        .then(async res => {
          const contentType = res.headers.get('content-type');
          if (!res.ok) {
            if (contentType && contentType.includes('application/json')) {
              const data = await res.json();
              throw new Error(JSON.stringify(data));
            } else {
              const text = await res.text();
              console.error('[DEBUG] Non-JSON error response:', text);
              throw new Error('Received non-JSON error from backend.');
            }
          }
          if (contentType && contentType.includes('application/json')) {
            return res.json();
          } else {
            const text = await res.text();
            console.error('[DEBUG] Unexpected non-JSON response:', text);
            throw new Error('Received non-JSON response from backend.');
          }
        })
        .then(data => {
          console.log('[DEBUG] Backend /api/tax/forms response:', data);
          if (isMounted && data.form_details) setSelectedForm(data.form_details);
        })
        .catch(err => {
          setError('Could not load form details. Please try again or contact support.');
          console.error('[DEBUG] Exception fetching form details:', err);
        });
    }
    if (formId) {
      fetchAIGuide(formId);
    } else {
      setAiError('No tax form selected. Please select a form in discovery.');
      setAiLoading(false);
    }
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (selectedForm?.id) {
      fetchFormFields();
    }
    setError(null);
    setSuccess(false);
    setAiHelp(null);
  }, [selectedForm]);

  const fetchFormFields = () => {
    setIsLoadingFields(true);
    // Mock fetching fields
    setTimeout(() => {
      setFormFields(mockFields[selectedForm.id] || []);
      setIsLoadingFields(false);
    }, 500);
  };

  const fetchAIGuide = async (formId) => {
    setAiLoading(true);
    setAiError('');
    try {
      console.log('[DEBUG] Fetching AI guide for formId:', formId);
      const res = await fetch(`/api/tax/ai-filing-guide?form_id=${encodeURIComponent(formId)}`);
      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          throw new Error(JSON.stringify(data));
        } else {
          const text = await res.text();
          console.error('[DEBUG] Non-JSON error response (AI guide):', text);
          throw new Error('Received non-JSON error from backend (AI guide).');
        }
      }
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        console.log('[DEBUG] AI Filing Guide API response:', data, 'Selected Form ID:', formId);
        // Always set aiGuide to an array (even if empty)
        if (Array.isArray(data.guide)) {
          setAiGuide(data.guide);
          if (!data.guide.length) setAiError('No AI tax filing guide available for this form.');
        } else if (Array.isArray(data.steps)) {
          setAiGuide(data.steps);
          if (!data.steps.length) setAiError('No AI tax filing guide available for this form.');
        } else {
          setAiGuide([]);
          setAiError('No AI tax filing guide available for this form.');
        }
      } else {
        const text = await res.text();
        console.error('[DEBUG] Unexpected non-JSON response (AI guide):', text);
        throw new Error('Received non-JSON response from backend (AI guide).');
      }
    } catch (e) {
      setAiError('Could not load AI tax filing guide.');
      setAiGuide([]);
      console.error('[DEBUG] Exception in fetchAIGuide:', e);
    } finally {
      setAiLoading(false);
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
  };

  const handleSaveDraft = () => {
    setSavingDraft(true);
    setTimeout(() => {
      setAiHelp('Draft saved successfully!');
      setSavingDraft(false);
    }, 1000);
  };

  const handleSubmit = () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1500);
  };

  const getCurrentSectionFields = () => {
    const currentSection = sections[currentStep];
    return formFields.filter(field => field.section === currentSection);
  };

  const renderField = (field) => {
    const fieldValue = formData[field.id] || '';
    const inputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 ${theme.border.primary} ${theme.bg.card} ${theme.text.primary} focus:ring-${theme.accent.primary.replace('bg-','')}`;

    switch (field.field_type) {
      case 'text':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <label className={`block text-sm font-medium ${theme.text.secondary}`}>{field.label}</label>
            <input
              type={field.field_type}
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={inputClasses}
            />
          </div>
        );
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className={`block text-sm font-medium ${theme.text.secondary}`}>{field.label}</label>
            <select
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={inputClasses}
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
            <div key={field.id} className="space-y-2">
                <label className={`block text-sm font-medium ${theme.text.secondary}`}>{field.label}</label>
                <input
                type="text"
                value={fieldValue}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className={inputClasses}
                />
            </div>
        );
    }
  };

  const handleAiHelp = () => {
    setAiHelp('AI-powered help and suggestions will appear here.');
  };

  // Render AI guide if available
  if (aiLoading) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh] text-lg"><Loader className="animate-spin w-10 h-10 mb-4 text-blue-500" />Loading your personalized tax filing guide...</div>;
  }
  if (aiError) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500 text-lg">{aiError}</div>;
  }
  if (aiGuide && aiGuide.length > 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Step-by-Step Tax Filing Guide</h1>
        <ol className="space-y-8">
          {aiGuide.map((step, idx) => (
            <li key={idx} className="relative pl-10">
              <span className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 text-white flex items-center justify-center font-bold text-lg shadow">{idx + 1}</span>
              <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
                <h2 className="text-xl font-semibold mb-2 text-blue-700">{step.title || `Step ${idx + 1}`}</h2>
                <p className="text-gray-700 whitespace-pre-line">{step.description || step.text || step}</p>
                {step.tips && <div className="mt-3 text-sm text-teal-700 bg-teal-50 rounded p-3">💡 {step.tips}</div>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (!selectedForm) {
    return (
        <div className={`p-8 rounded-lg ${theme.bg.card} ${theme.text.primary} text-center`}>
            <h3 className="text-lg font-semibold">No Form Selected</h3>
            <p className={`${theme.text.secondary} mt-2`}>Please go back to the discovery page and select a tax form to begin.</p>
        </div>
    )
  }

  return (
    <div className={`p-6 rounded-xl ${theme.bg.card} ${theme.border.primary} border`}>
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${theme.accent.primary} rounded-xl flex items-center justify-center`}>
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${theme.text.primary}`}>{selectedForm?.name || 'Tax Return'}</h2>
            <p className={`text-sm ${theme.text.secondary}`}>{selectedForm?.description}</p>
            <div className={`flex items-center gap-4 mt-2 text-xs ${theme.text.tertiary}`}>
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
          <button
            onClick={() => window.open(selectedForm.official_pdf_link, '_blank')}
            className={`px-3 py-1.5 text-sm border rounded-lg ${theme.border.primary} ${theme.text.secondary} hover:${theme.bg.secondary}`}
          >
            📄 View Official Form
          </button>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {sections.map((section, idx) => (
          <div key={section} className={`flex-1 h-2 rounded-full ${idx <= currentStep ? theme.accent.primary : theme.bg.secondary}`}></div>
        ))}
        <span className={`ml-2 text-xs ${theme.text.tertiary}`}>Step {currentStep + 1} of {totalSteps}</span>
      </div>

      {/* Section Title */}
      <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>{sections[currentStep]}</h3>

      {/* Dynamic Fields Placeholder */}
      <div className="space-y-4 mb-6">
        {isLoadingFields ? (
          <div className="flex items-center justify-center py-8">
            <Loader className={`w-6 h-6 animate-spin ${theme.text.accent}`} />
            <span className={`ml-2 ${theme.text.secondary}`}>Loading form fields...</span>
          </div>
        ) : getCurrentSectionFields().length > 0 ? (
          getCurrentSectionFields().map(field => renderField(field))
        ) : (
          <div className={`text-center py-8 ${theme.text.secondary}`}>
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No fields defined for this section yet.</p>
            <p className="text-sm">This form is still being configured.</p>
          </div>
        )}
      </div>

      {/* AI Help & Validation */}
      <div className="mb-4 flex items-center gap-2">
        <button onClick={handleAiHelp} className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${theme.bg.secondary} ${theme.text.secondary}`}>
          <AlertCircle className="w-4 h-4" /> Get AI Help
        </button>
        {aiHelp && <span className={`text-xs ${theme.text.accent}`}>{aiHelp}</span>}
      </div>

      {/* Error/Success Alerts */}
      {error && <div className={`p-3 rounded-lg text-sm mb-4 bg-red-100 text-red-700`}>{error}</div>}
      {success && <div className={`p-3 rounded-lg text-sm mb-4 bg-green-100 text-green-700`}>Return submitted successfully!</div>}

      {/* Navigation & Actions */}
      <div className="flex items-center justify-between mt-6 gap-2">
        <button onClick={handleBack} className={`px-4 py-2 rounded-lg flex items-center gap-1 ${theme.bg.secondary} ${theme.text.primary}`}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={handleSaveDraft} disabled={savingDraft} className={`px-4 py-2 rounded-lg flex items-center gap-1 ${theme.bg.secondary} ${theme.text.primary}`}>
            <Save className="w-4 h-4" /> {savingDraft ? 'Saving...' : 'Save Draft'}
          </button>
          {currentStep < totalSteps - 1 ? (
            <button onClick={handleNext} className={`px-4 py-2 rounded-lg flex items-center gap-1 ${theme.accent.primary} text-white`}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className={`px-4 py-2 rounded-lg flex items-center gap-1 ${theme.accent.primary} text-white`}>
              <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Return'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTaxReturnCompletion;
