import React, { useState, useEffect } from 'react';
import ComprehensiveTaxFiling from './ComprehensiveTaxFiling';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Save, Send, HelpCircle, Sparkles } from 'lucide-react';

const TaxFilingForm = ({ user }) => {
  const [useEnhancedMode, setUseEnhancedMode] = useState(true);
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formDetails, setFormDetails] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [drafts, setDrafts] = useState([]);
  
  // Enhanced mode toggle and feature detection
  useEffect(() => {
    const hasEnhancedFeatures = localStorage.getItem('taxFilingEnhancedMode');
    setUseEnhancedMode(hasEnhancedFeatures !== 'false');
  }, []);

  const toggleEnhancedMode = () => {
    const newMode = !useEnhancedMode;
    setUseEnhancedMode(newMode);
    localStorage.setItem('taxFilingEnhancedMode', newMode.toString());
  };

  // If enhanced mode is enabled, use the comprehensive filing system
  if (useEnhancedMode) {
    return (
      <div>
        {/* Mode Toggle */}
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Enhanced Tax Filing Experience</h3>
                <p className="text-sm text-gray-600">AI-powered form discovery, step-by-step wizard, and document management</p>
              </div>
            </div>
            <button
              onClick={toggleEnhancedMode}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Switch to Basic Mode
            </button>
          </div>
        </div>
        
        <ComprehensiveTaxFiling user={user} />
      </div>
    );
  }

  // Fallback to basic mode (original implementation)
  useEffect(() => {
    fetchTaxForms();
    fetchUserDrafts();
  }, []);

  const fetchTaxForms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tax/forms');
      const data = await response.json();
      setForms(data.forms || []);
    } catch (error) {
      console.error('Error fetching tax forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormDetails = async (formId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tax/forms/${formId}`);
      const data = await response.json();
      setFormDetails(data.form_details);
      setFormData({}); // Reset form data
      setValidationErrors([]);
    } catch (error) {
      console.error('Error fetching form details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDrafts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/tax/drafts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDrafts(data.drafts || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    }
  };

  const handleFormSelect = (formId) => {
    setSelectedForm(formId);
    fetchFormDetails(formId);
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear validation error for this field
    setValidationErrors(prev => prev.filter(error => error.field_id !== fieldId));
  };

  const saveDraft = async () => {
    if (!selectedForm) return;

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
          form_id: selectedForm,
          form_data: formData
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Draft saved successfully!');
        fetchUserDrafts();
      } else {
        alert(`Error saving draft: ${data.detail}`);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const submitForm = async () => {
    if (!selectedForm) return;

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
          form_id: selectedForm,
          form_data: formData
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Form submitted successfully!');
        setFormData({});
        setValidationErrors([]);
      } else {
        if (data.detail && data.detail.errors) {
          setValidationErrors(data.detail.errors.map(error => ({ field_id: 'general', message: error })));
        } else {
          alert(`Error submitting form: ${data.detail}`);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const getFieldAssistance = async (fieldId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/tax/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          form_id: selectedForm,
          field_id: fieldId,
          user_query: `Please explain this field: ${fieldId}`,
          form_data: formData
        })
      });

      const data = await response.json();
      
      if (response.ok && data.assistance) {
        alert(`AI Assistance:\n\n${data.assistance.explanation}\n\nActionable Advice:\n${data.assistance.actionable_advice}`);
      } else {
        alert('AI assistance not available at the moment');
      }
    } catch (error) {
      console.error('Error getting field assistance:', error);
      alert('Failed to get AI assistance');
    }
  };

  const renderField = (field) => {
    const value = formData[field.field_id] || '';
    const hasError = validationErrors.some(error => error.field_id === field.field_id);

    return (
      <div key={field.field_id} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.field_id} className={hasError ? 'text-red-600' : ''}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => getFieldAssistance(field.field_id)}
            className="p-1 h-6 w-6"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        
        {field.field_type === 'text' || field.field_type === 'pan' || field.field_type === 'aadhaar' ? (
          <Input
            id={field.field_id}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        ) : field.field_type === 'currency' || field.field_type === 'number' ? (
          <Input
            id={field.field_id}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        ) : field.field_type === 'date' ? (
          <Input
            id={field.field_id}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            className={hasError ? 'border-red-500' : ''}
          />
        ) : field.field_type === 'select' ? (
          <Select value={value} onValueChange={(value) => handleFieldChange(field.field_id, value)}>
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options && field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={field.field_id}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        )}
        
        {field.help_text && (
          <p className="text-sm text-gray-600">{field.help_text}</p>
        )}
        
        {hasError && (
          <p className="text-sm text-red-600">
            {validationErrors.find(error => error.field_id === field.field_id)?.message}
          </p>
        )}
      </div>
    );
  };

  if (loading && !formDetails) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tax forms...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Indian Tax Return Filing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Form Selection */}
            <div>
              <Label htmlFor="form-select">Select Tax Form</Label>
              <Select value={selectedForm || ''} onValueChange={handleFormSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tax form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((form) => (
                    <SelectItem key={form.form_id} value={form.form_id}>
                      {form.name} - {form.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Form Details */}
            {formDetails && (
              <div className="space-y-6">
                <Alert>
                  <AlertDescription>
                    <strong>{formDetails.name}</strong><br />
                    {formDetails.description}<br />
                    Estimated completion time: {formDetails.estimated_time} minutes<br />
                    Difficulty: {formDetails.difficulty_level}
                  </AlertDescription>
                </Alert>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription>
                      <strong>Please fix the following errors:</strong>
                      <ul className="list-disc list-inside mt-2">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="text-red-600">{error.message}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formDetails.fields && formDetails.fields.map(renderField)}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6 border-t">
                  <Button 
                    onClick={saveDraft} 
                    disabled={saving || loading}
                    variant="outline"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={submitForm} 
                    disabled={loading || saving}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Form
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* User Drafts */}
            {drafts.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Your Saved Drafts</h3>
                <div className="space-y-2">
                  {drafts.map((draft) => (
                    <Card key={draft.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{draft.form_id}</p>
                          <p className="text-sm text-gray-600">
                            Last updated: {new Date(draft.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedForm(draft.form_id);
                            setFormData(draft.form_data);
                            fetchFormDetails(draft.form_id);
                          }}
                        >
                          Continue
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxFilingForm;
