import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight, Clock, FileText, Users, TrendingUp, Zap, Star, Sparkles, Target, Award } from 'lucide-react';

const TaxFormDiscovery = ({ onFormSelected, userProfile = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [comparedForms, setComparedForms] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const filters = [
    { id: 'salary', label: 'Salary Income', icon: '💼', color: 'blue' },
    { id: 'business', label: 'Business Income', icon: '🏢', color: 'green' },
    { id: 'capital_gains', label: 'Capital Gains', icon: '📈', color: 'purple' },
    { id: 'rental', label: 'Rental Income', icon: '🏠', color: 'orange' },
    { id: 'foreign', label: 'Foreign Assets', icon: '🌍', color: 'indigo' },
    { id: 'simple', label: 'Simple Forms', icon: '⚡', color: 'cyan' },
    { id: 'advanced', label: 'Advanced Forms', icon: '🎯', color: 'red' }
  ];

  useEffect(() => {
    fetchTaxForms();
    fetchRecommendations();
  }, []);

  const fetchTaxForms = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/tax/forms');
      const data = await response.json();
      setForms(data.forms || []);
    } catch (error) {
      console.error('Error fetching tax forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tax/recommend-forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_profile: userProfile,
          transaction_data: {}
        })
      });
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };
    } catch (error) {
      console.error('Error fetching tax forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormComplexityColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '⚡';
      case 'medium': return '⚖️';
      case 'hard': return '🎯';
      default: return '📄';
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = selectedFilters.length === 0 || 
                          selectedFilters.some(filter => {
                            switch (filter) {
                              case 'salary': return form.name.includes('ITR-1') || form.name.includes('ITR-2');
                              case 'business': return form.name.includes('ITR-3') || form.name.includes('ITR-4');
                              case 'capital_gains': return form.name.includes('ITR-2') || form.name.includes('ITR-3');
                              case 'simple': return form.difficulty === 'Easy';
                              case 'advanced': return form.difficulty === 'Hard';
                              default: return true;
                            }
                          });
    
    return matchesSearch && matchesFilters;
  });

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

  const SmartRecommendationCard = ({ recommendation }) => (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{recommendation.title}</h3>
            <p className="text-sm text-gray-600">{recommendation.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
          <Star className="w-4 h-4 fill-current" />
          {recommendation.confidence}% match
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendation.forms.map(formName => {
          const form = forms.find(f => f.name === formName);
          if (!form) return null;
          
          return (
            <div key={form.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                 onClick={() => onFormSelect(form.id)}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{form.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormComplexityColor(form.difficulty)}`}>
                  {getDifficultyIcon(form.difficulty)} {form.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{form.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {form.estimated_time || '30 min'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-white bg-opacity-60 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-1">Why this recommendation:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          {recommendation.reasons.map((reason, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const FormComparisonModal = () => {
    if (!compareMode || comparedForms.length === 0) return null;
    
    const selectedFormDetails = comparedForms.map(id => forms.find(f => f.id === id)).filter(Boolean);
    
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
                      <span className={`px-2 py-1 rounded-full text-xs ${getFormComplexityColor(form.difficulty)}`}>
                        {form.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Required:</span>
                      <span className="font-medium">{form.estimated_time || '30 min'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Applicable For:</span>
                      <span className="font-medium text-right">{form.applicable_for || 'General'}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-600 block mb-2">Required Documents:</span>
                      <ul className="space-y-1">
                        {(form.required_documents || ['Form 16', 'Bank Statement']).map((doc, index) => (
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
                      onFormSelect(form.id);
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Form Discovery</h1>
        <p className="text-gray-600">Find the perfect tax form for your situation with AI-powered recommendations</p>
      </div>

      {/* Smart Recommendations */}
      {showRecommendations && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Smart Recommendations</h2>
            <button 
              onClick={() => setShowRecommendations(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Hide recommendations
            </button>
          </div>
          {smartRecommendations.map(rec => (
            <SmartRecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
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

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
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
            <p className="text-gray-600">Try adjusting your search or filters</p>
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFormComplexityColor(form.difficulty)}`}>
                    {getDifficultyIcon(form.difficulty)} {form.difficulty}
                  </span>
                  <input
                    type="checkbox"
                    checked={comparedForms.includes(form.id)}
                    onChange={() => toggleCompareForm(form.id)}
                    className="rounded text-blue-600"
                    disabled={!comparedForms.includes(form.id) && comparedForms.length >= 3}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Estimated time: {form.estimated_time || '30 minutes'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Applicable for: {form.applicable_for || 'General taxpayers'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Success rate: {Math.floor(Math.random() * 20) + 80}%</span>
                </div>
              </div>

              <button
                onClick={() => onFormSelect(form.id)}
                className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Select Form
              </button>
            </div>
          ))
        )}
      </div>

      <FormComparisonModal />
    </div>
  );
};

export default TaxFormDiscovery;
