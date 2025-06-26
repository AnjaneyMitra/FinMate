import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Clock, FileText, TrendingUp } from 'lucide-react';

const FormBrowser = ({ onFormSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [activeTab, setActiveTab] = useState('all_forms');
  const [categorizedForms, setCategorizedForms] = useState({});
  const [loadingCategories, setLoadingCategories] = useState({});
  const [comparedForms, setComparedForms] = useState([]);
  const [compareMode, setCompareMode] = useState(false);

  const filters = [
    { id: 'salary', label: 'Salary Income', icon: '💼', color: 'blue' },
    { id: 'business', label: 'Business Income', icon: '🏢', color: 'green' },
    { id: 'capital_gains', label: 'Capital Gains', icon: '📈', color: 'purple' },
    { id: 'rental', label: 'Rental Income', icon: '🏠', color: 'orange' },
    { id: 'foreign', label: 'Foreign Assets', icon: '🌍', color: 'indigo' },
    { id: 'simple', label: 'Simple Forms', icon: '⚡', color: 'cyan' },
    { id: 'advanced', label: 'Advanced Forms', icon: '🎯', color: 'red' }
  ];

  // Form categories for tabs
  const formCategories = [
    { 
      id: 'all_forms', 
      label: 'All Forms', 
      icon: '📋', 
      description: 'Complete catalog of all available tax forms'
    },
    { 
      id: 'income_tax_returns', 
      label: 'Income Tax Returns', 
      icon: '💼', 
      description: 'ITR forms for filing annual income tax returns'
    },
    { 
      id: 'tds_returns', 
      label: 'TDS Returns', 
      icon: '📊', 
      description: 'Forms for Tax Deducted at Source returns'
    },
    { 
      id: 'certificate_forms', 
      label: 'Certificates', 
      icon: '📜', 
      description: 'Certificate and declaration forms'
    },
    { 
      id: 'advance_tax', 
      label: 'Advance Tax', 
      icon: '⏰', 
      description: 'Forms for advance tax payments'
    },
    { 
      id: 'pan_forms', 
      label: 'PAN Forms', 
      icon: '🆔', 
      description: 'PAN application and related forms'
    }
  ];

  useEffect(() => {
    fetchFormsByCategory('all_forms'); // Load default tab
  }, []);

  const fetchFormsByCategory = async (category) => {
    try {
      setLoadingCategories(prev => ({ ...prev, [category]: true }));
      const response = await fetch(`http://localhost:8000/api/tax/forms/category/${category}`);
      const data = await response.json();
      setCategorizedForms(prev => ({ 
        ...prev, 
        [category]: data.forms || [] 
      }));
    } catch (error) {
      console.error(`Error fetching forms for category ${category}:`, error);
    } finally {
      setLoadingCategories(prev => ({ ...prev, [category]: false }));
    }
  };

  const handleTabChange = (categoryId) => {
    setActiveTab(categoryId);
    if (!categorizedForms[categoryId]) {
      fetchFormsByCategory(categoryId);
    }
  };

  const getFormComplexityColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
      case 'easy': 
        return 'text-green-600 bg-green-50';
      case 'intermediate':
      case 'medium': 
        return 'text-yellow-600 bg-yellow-50';
      case 'advanced':
      case 'hard': 
        return 'text-red-600 bg-red-50';
      default: 
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
      case 'easy': 
        return '⚡';
      case 'intermediate':
      case 'medium': 
        return '⚖️';
      case 'advanced':
      case 'hard': 
        return '🎯';
      default: 
        return '📄';
    }
  };

  const toggleFilter = (filterId) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const toggleCompareForm = (formId) => {
    setComparedForms(prev => 
      prev.includes(formId)
        ? prev.filter(id => id !== formId)
        : prev.length < 3 ? [...prev, formId] : prev
    );
  };

  // Filter forms based on search term and selected filters
  const getFilteredForms = () => {
    const currentForms = categorizedForms[activeTab] || [];
    
    return currentForms.filter(form => {
      const matchesSearch = !searchTerm || 
        form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilters = selectedFilters.length === 0 || 
        selectedFilters.some(filter => {
          switch (filter) {
            case 'salary': 
              return form.name.includes('ITR-1') || form.name.includes('ITR-2');
            case 'business': 
              return form.name.includes('ITR-3') || form.name.includes('ITR-4');
            case 'capital_gains': 
              return form.name.includes('ITR-2') || form.name.includes('ITR-3');
            case 'simple': 
              return form.difficulty_level === 'beginner';
            case 'advanced': 
              return form.difficulty_level === 'advanced';
            default: 
              return true;
          }
        });
      
      return matchesSearch && matchesFilters;
    });
  };

  const FormComparisonModal = () => {
    if (!compareMode || comparedForms.length === 0) return null;
    
    const selectedFormDetails = comparedForms.map(id => 
      (categorizedForms[activeTab] || []).find(f => f.id === id)
    ).filter(Boolean);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Form Comparison</h2>
              <button onClick={() => setCompareMode(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedFormDetails.map(form => (
                <div key={form.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-900">{form.name}</h3>
                    <p className="text-sm text-gray-600">{form.description}</p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getFormComplexityColor(form.difficulty_level)}`}>
                        {form.difficulty_level}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Required:</span>
                      <span className="font-medium">{form.estimated_time || 30} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Filing Deadline:</span>
                      <span className="font-medium text-right">{form.filing_deadline || 'N/A'}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-600 block mb-2">Required Documents:</span>
                      <ul className="space-y-1">
                        {(form.required_documents || []).slice(0, 3).map((doc, index) => (
                          <li key={index} className="flex items-center gap-2 text-xs">
                            <FileText className="w-3 h-3 text-blue-500" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      onFormSelected(form.id);
                      setCompareMode(false);
                    }}
                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Select This Form
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredForms = getFilteredForms();

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tax forms by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilters.includes(filter.id)
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {comparedForms.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900">
                {comparedForms.length} form{comparedForms.length !== 1 ? 's' : ''} selected for comparison
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCompareMode(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Compare Forms
              </button>
              <button
                onClick={() => setComparedForms([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Categories Tabs */}
      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {formCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleTabChange(category.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.label}</span>
                  {categorizedForms[category.id] && (
                    <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                      {categorizedForms[category.id].length}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Category Description */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {formCategories.find(cat => cat.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingCategories[activeTab] ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))
        ) : filteredForms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
            <p className="text-gray-600">Try selecting a different category or adjusting your search</p>
          </div>
        ) : (
          filteredForms.map(form => (
            <div
              key={form.id}
              className={`border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer ${
                comparedForms.includes(form.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{form.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{form.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFormComplexityColor(form.difficulty_level)}`}>
                    {getDifficultyIcon(form.difficulty_level)} {form.difficulty_level}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Estimated time: {form.estimated_time || 30} minutes</span>
                </div>
                {form.filing_deadline && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 text-center">📅</span>
                    <span>Filing deadline: {form.filing_deadline}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Assessment Year: {form.applicable_assessment_year || '2025-26'}</span>
                </div>
              </div>

              {/* Official Government Links */}
              <div className="border-t pt-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Official Government Links:</h4>
                <div className="space-y-2">
                  {form.official_pdf_link && (
                    <a
                      href={form.official_pdf_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span className="text-base">📄</span>
                      <span>Download PDF Form</span>
                      <span className="text-xs text-gray-500">↗</span>
                    </a>
                  )}
                  {form.online_filing_link && (
                    <a
                      href={form.online_filing_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 transition-colors"
                    >
                      <span className="text-base">💻</span>
                      <span>Online Filing Portal</span>
                      <span className="text-xs text-gray-500">↗</span>
                    </a>
                  )}
                  {form.help_guide_link && (
                    <a
                      href={form.help_guide_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      <span className="text-base">📚</span>
                      <span>Help Guide</span>
                      <span className="text-xs text-gray-500">↗</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onFormSelected(form.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Select Form
                </button>
                <button
                  onClick={() => toggleCompareForm(form.id)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    comparedForms.includes(form.id)
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={!comparedForms.includes(form.id) && comparedForms.length >= 3}
                >
                  {comparedForms.includes(form.id) ? '✓' : '+'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compare Button */}
      {comparedForms.length > 1 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setCompareMode(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>Compare {comparedForms.length} Forms</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {FormComparisonModal()}
    </div>
  );
};

export default FormBrowser;
