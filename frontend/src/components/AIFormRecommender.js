import React, { useState } from 'react';
import { Bot, Lightbulb, ArrowRight, Loader, Target, Star } from 'lucide-react';

const AIFormRecommender = ({ onFormSelected, userProfile = {} }) => {
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState(null);
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);

  // AI search suggestions for better user experience
  const aiSearchSuggestions = [
    "I have salary income and want to claim deductions",
    "I own rental property and have capital gains", 
    "I'm a freelancer with business income",
    "I have foreign assets and investments",
    "I need the simplest form for first-time filing",
    "I want to compare ITR-1 and ITR-2",
    "Which form supports maximum tax deductions?"
  ];

  const handleAiSearch = async () => {
    if (!naturalLanguageQuery.trim()) return;
    
    try {
      setAiSearchLoading(true);
      const response = await fetch('http://localhost:8000/api/tax/search-forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: naturalLanguageQuery,
          user_context: userProfile,
          search_type: "natural_language"
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAiSearchResults(data);
        setShowAiSuggestions(false);
      }
    } catch (error) {
      console.error('Error in AI search:', error);
    } finally {
      setAiSearchLoading(false);
    }
  };

  const handleSituationDiscovery = async (description) => {
    try {
      setAiSearchLoading(true);
      const response = await fetch('http://localhost:8000/api/tax/discover-forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_description: description,
          user_profile: userProfile
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAiSearchResults(data);
        setNaturalLanguageQuery(description);
        setShowAiSuggestions(false);
      }
    } catch (error) {
      console.error('Error in situation discovery:', error);
    } finally {
      setAiSearchLoading(false);
    }
  };

  const clearAiSearch = () => {
    setAiSearchResults(null);
    setNaturalLanguageQuery('');
    setShowAiSuggestions(true);
  };

  // AI search results component
  const AISearchResults = ({ results }) => {
    if (!results || !results.search_results) return null;

    return (
      <div className="space-y-4">
        {results.search_interpretation && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 mb-1">How I understood your query:</h5>
                <p className="text-blue-800 text-sm">{results.search_interpretation}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.search_results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h5 className="font-semibold text-gray-900">{result.form_name}</h5>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-gray-600">{Math.round(result.confidence_score * 100)}%</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{result.reasoning}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Match Type:</span>
                  <span className={`px-2 py-1 rounded-full ${
                    result.match_type === 'exact' ? 'bg-green-100 text-green-800' :
                    result.match_type === 'contextual' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {result.match_type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Estimated Time:</span>
                  <span className="text-gray-700">{result.estimated_time} minutes</span>
                </div>
              </div>

              {result.key_features && result.key_features.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Key Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.key_features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => onFormSelected && onFormSelected(result.form_id)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium"
              >
                Select This Form
              </button>
            </div>
          ))}
        </div>

        {results.additional_suggestions && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-gray-900 mb-1">Additional Suggestions:</h5>
                <p className="text-gray-700 text-sm">{results.additional_suggestions}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Form Search</h3>
          <p className="text-sm text-gray-600">Describe your tax situation in natural language</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Describe your tax situation... e.g., 'I have salary income and rental property'"
            value={naturalLanguageQuery}
            onChange={(e) => setNaturalLanguageQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAiSearch()}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAiSearch}
            disabled={aiSearchLoading || !naturalLanguageQuery.trim()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            {aiSearchLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {showAiSuggestions && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Try these examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {aiSearchSuggestions.slice(0, 4).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSituationDiscovery(suggestion)}
                  className="px-3 py-1 bg-white text-blue-700 text-sm rounded-full border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {aiSearchResults && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">AI Search Results</h4>
              <button
                onClick={clearAiSearch}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Results
              </button>
            </div>
            <AISearchResults results={aiSearchResults} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFormRecommender;
