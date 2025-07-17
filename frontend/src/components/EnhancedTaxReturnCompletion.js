import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { AlertCircle, FileText, ArrowLeft, ArrowRight, Save, Send, Clock, Loader, User, Wallet, PiggyBank, ClipboardCheck, FolderOpen, CheckCircle } from 'lucide-react';

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

  // Map icon_suggestion from backend to Lucide React components
  const iconMap = {
    personal: User,
    income: Wallet,
    documents: FolderOpen,
    deductions: PiggyBank,
    review: ClipboardCheck,
    submit: CheckCircle,
    // Add more mappings as needed
  };

  // Use local state for selectedForm if not present in context
  const [selectedForm, setSelectedForm] = useState(outletContext?.selectedForm || null);
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [aiHelp, setAiHelp] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // New state for sidebar collapse
  const [formFields, setFormFields] = useState([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [validation, setValidation] = useState({});
  const [aiGuide, setAiGuide] = useState([]); // Always an array
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState('');
  const [selectedFormId, setSelectedFormId] = useState(null);

  // New state for active timeline step and refs for each step
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const stepRefs = useRef([]);

  // Effect to observe steps and update activeStepIndex on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Find the index of the intersecting entry
            const index = stepRefs.current.indexOf(entry.target);
            if (index !== -1) {
              setActiveStepIndex(index);
            }
          }
        });
      },
      { rootMargin: '-50% 0% -50% 0%', threshold: 0 } // Adjust rootMargin to trigger when section is in middle of viewport
    );

    stepRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      stepRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [aiGuide]); // Re-run when aiGuide changes

  // Function to handle smooth scroll to a step
  const scrollToStep = (index) => {
    if (stepRefs.current[index]) {
      stepRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const sections = selectedForm?.sections || ['Personal Information', 'Income Details', 'Deductions', 'Summary'];
  const totalSteps = sections.length;

  // Fetch form details if not present
  useEffect(() => {
    let isMounted = true;
    const rawFormId = localStorage.getItem('selectedTaxFormId');
    const formId = rawFormId ? rawFormId : null; // Removed .toLowerCase()
    setSelectedFormId(formId);
    console.log('[DEBUG] selectedTaxFormId from localStorage:', rawFormId, '| Used:', formId);
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
          console.log('[DEBUG] AI Guide Data Received:', data.guide); // Add this line
          if (!data.guide.length) setAiError('No AI tax filing guide available for this form.');
        } else if (Array.isArray(data.steps)) {
          setAiGuide(data.steps);
          console.log('[DEBUG] AI Guide Data Received (steps):', data.steps); // Add this line
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
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto py-12 px-4 gap-8">
        {/* Sticky Sidebar for Progress/Navigation */}
        <div className={`lg:w-1/4 ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-1/4'} lg:sticky lg:top-12 h-fit p-6 bg-white rounded-xl shadow-lg border border-blue-100 hidden lg:block transition-all duration-300`}> 
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold text-blue-700 ${isSidebarCollapsed ? 'hidden' : ''}`}>Guide Overview</h2>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors bg-red-200" // Added temporary red background
            >
              {isSidebarCollapsed ? <ArrowRight className="w-5 h-5 text-gray-600" /> : <ArrowLeft className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
          <ul className={`space-y-3 ${isSidebarCollapsed ? 'hidden' : ''}`}>
            {aiGuide.map((step, idx) => (
              <li 
                key={idx} 
                className="flex items-center space-x-3 group cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => scrollToStep(idx)} // Add onClick to scroll
              >
                <span className={`w-3 h-3 rounded-full ${idx === activeStepIndex ? 'bg-blue-600' : 'bg-gray-300'} group-hover:bg-blue-400 transition-colors`}></span>
                <span className={`text-gray-700 group-hover:text-blue-600 font-medium transition-colors ${idx === activeStepIndex ? 'text-blue-700 font-semibold' : ''}`}> {/* Apply bold/color for active */} 
                  {step.title || `Step ${idx + 1}`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content Area - Scrollable Guide Steps */}
        <div className={`flex-1 ${isSidebarCollapsed ? 'lg:ml-16' : ''}`}> {/* Adjust margin when sidebar is collapsed */} 
          <h1 className="text-3xl font-bold mb-12 text-blue-700 lg:hidden">Step-by-Step Tax Filing Guide</h1> {/* Hide on large screens, shown in sidebar */}
          <ol className="space-y-16">
            {aiGuide.map((step, idx) => {
              const IconComponent = iconMap[step.icon_suggestion] || FileText; // Default to FileText
              // Define a set of gradients to cycle through for visual variety
              const gradients = [
                'bg-gradient-to-br from-blue-100 to-indigo-100',
                'bg-gradient-to-br from-purple-100 to-pink-100',
                'bg-gradient-to-br from-green-100 to-teal-100',
                'bg-gradient-to-br from-yellow-100 to-orange-100',
                'bg-gradient-to-br from-red-100 to-rose-100',
              ];
              const currentGradient = gradients[idx % gradients.length];
              const isEven = idx % 2 === 0; // Determine if step is even for alternating layout

              return (
                <li 
                  key={idx} 
                  ref={el => stepRefs.current[idx] = el} // Assign ref to each list item
                  className="relative flex items-start mb-12 animate-fade-in-up" 
                  style={{ animationDelay: `${idx * 0.1}s` }} 
                > {/* Increased padding for larger icon and line and added entry animation */}
                  {/* Central Timeline Dot/Icon */}
                  <div className="flex flex-col items-center mr-4 sm:mr-8">
                    <span className={`z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${currentGradient} text-blue-700 flex items-center justify-center font-bold text-lg shadow-xl border-2 border-white transform transition-transform duration-300 hover:scale-110 animate-icon-glow`}> {/* Added glow animation on hover */} 
                      <IconComponent className="w-6 h-6 text-blue-700 animate-pulse-subtle" />
                    </span>
                    {/* Connector Line */}
                    {idx < aiGuide.length - 1 && (
                      <div 
                        className="flex-grow border-l-2 border-blue-200 transform origin-top animate-grow-line"
                        style={{ height: '100%', animationDelay: `${idx * 0.1 + 0.05}s` }}
                      ></div>
                    )}
                  </div>

                  {/* Main Content Card */}
                  <div className={`flex-1 bg-white rounded-xl shadow-2xl p-6 border border-blue-100 transform transition-all duration-300 card-hover-3d relative ${isEven ? '' : 'md:ml-auto md:w-3/4 lg:w-2/3'}`}> {/* Stronger shadow and hover effect */} 
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 text-blue-800">{step.title || `Step ${idx + 1}`}</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">{step.description || step.text || step}</p> {/* Improved line height and margin for readability */} 

                    {step.key_points && step.key_points.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200"> {/* Stronger border for separation */} 
                        <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-2">Key Points:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {step.key_points.map((point, pointIdx) => (
                            <li key={pointIdx} className="flex items-start">
                              <span className="mr-2 text-blue-600">•</span> {point} {/* Custom bullet with accent color */} 
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {step.tips && (
                      <div className="mt-4 text-sm bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-4 flex items-start gap-3 border border-teal-200 shadow-sm"> {/* More vibrant tips box with subtle shadow */} 
                        <span className="text-teal-600 text-lg">💡</span> <p className="flex-1 text-teal-800 font-medium">{step.tips}</p> {/* Larger icon and bolder text for tip */} 
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
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
