import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight, Clock, FileText, Users, TrendingUp, Zap, Star, Sparkles, Target, Award, ArrowRight, CheckCircle, Info } from 'lucide-react';

const TaxFormDiscovery = ({ onFormSelected, userProfile = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
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

  const getFormComplexityColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const toggleFilter = (filterId) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Discovering the perfect tax forms for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Your Perfect Tax Form
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Our AI-powered system analyzes your profile and recommends the most suitable tax forms for your unique situation.
        </p>
      </div>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-blue-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI-Powered Recommendations</h2>
              <p className="text-gray-600">Personalized suggestions based on your profile</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-yellow-500" />
                    <span className="font-semibold text-gray-900">{rec.form_id}</span>
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {rec.confidence || 95}% Match
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{rec.reasoning}</p>
                <button
                  onClick={() => onFormSelected && onFormSelected(rec.form_id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Select This Form</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tax forms by name or description..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters:</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3 mt-4">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                selectedFilters.includes(filter.id)
                  ? `bg-${filter.color}-100 border-${filter.color}-300 text-${filter.color}-700`
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{filter.icon}</span>
              <span className="font-medium">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.map((form) => (
          <div key={form.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{form.name}</h3>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold border ${getFormComplexityColor(form.difficulty)}`}>
                    <span>{getDifficultyIcon(form.difficulty)}</span>
                    <span>{form.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-3">{form.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Estimated Time:</span>
                <div className="flex items-center space-x-1 text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>{form.estimated_time || '30-45 minutes'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Complexity:</span>
                <span className="text-gray-700">{form.difficulty}</span>
              </div>
              {form.requirements && (
                <div className="text-sm">
                  <span className="text-gray-500 block mb-1">Required:</span>
                  <div className="flex flex-wrap gap-1">
                    {form.requirements.slice(0, 2).map((req, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {req}
                      </span>
                    ))}
                    {form.requirements.length > 2 && (
                      <span className="text-blue-600 text-xs">+{form.requirements.length - 2} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onFormSelected && onFormSelected(form.id)}
              className="w-full bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 py-3 px-4 rounded-xl font-medium hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 transition-all group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white flex items-center justify-center space-x-2"
            >
              <span>Select Form</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {filteredForms.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No forms found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search terms or filters</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedFilters([]);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help Choosing?</h3>
            <p className="text-gray-600 mb-4">
              Not sure which form is right for you? Our AI assistant can help you make the right choice based on your specific situation.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center space-x-2">
              <span>Get Personalized Help</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxFormDiscovery;
