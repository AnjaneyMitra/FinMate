import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Video, FileText, MessageCircle, Star, ChevronRight, ExternalLink, ThumbsUp, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const TaxGlossaryHelp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [explanation, setExplanation] = useState(null); // Stores the detailed explanation from Gemini
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all'); // Keep for category buttons, but terms will be dynamic

  const themeContext = useTheme();
  const { bg, text, border, accent } = themeContext || {};

  const safeBg = bg || { primary: 'bg-white', secondary: 'bg-gray-100', card: 'bg-white', tertiary: 'bg-gray-100' };
  const safeText = text || { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-500', accent: 'text-teal-600' };
  const safeBorder = border || { primary: 'border-gray-200', accent: 'border-teal-300' };
  const safeAccent = accent || { primary: 'bg-teal-600', secondary: 'bg-blue-600', success: 'bg-green-600', error: 'bg-red-600' };


  const categories = [
    { id: 'all', label: 'All Terms', icon: '📚' },
    { id: 'income', label: 'Income Types', icon: '💰' },
    { id: 'deductions', label: 'Deductions', icon: '📊' },
    { id: 'forms', label: 'Tax Forms', icon: '📄' },
    { id: 'procedures', label: 'Procedures', icon: '⚙️' },
    { id: 'penalties', label: 'Penalties & Compliance', icon: '⚠️' }
  ];

  // New function to fetch explanation
  const fetchExplanation = async (termToSearch) => {
    if (!termToSearch.trim()) return; // Don't search for empty terms

    setIsLoading(true);
    setError(null);
    setExplanation(null); // Clear previous explanation

    try {
      const response = await fetch(`/api/tax/glossary/explain?term=${encodeURIComponent(termToSearch)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result.success) {
        // Validate the structure of result.data before setting it
        if (result.data && typeof result.data === 'object' && 'term' in result.data && 'explanation' in result.data) {
          setExplanation(result.data);
        } else {
          // Log the unexpected data and set a user-friendly error
          console.error('Received unexpected data format from backend for glossary explanation:', result.data);
          setError('Could not process the explanation. Unexpected data format.');
          setExplanation(null); // Ensure explanation is null if invalid
        }
      } else {
        setError(result.error || `Could not find explanation for "${termToSearch}".`);
      }
    } catch (e) {
      console.error("Error fetching glossary explanation:", e);
      setError(`Failed to fetch explanation: ${e.message}.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExplanation(searchTerm);
  };

  // TermDetailModal is now simpler, directly using the 'explanation' state
  const TermDetailModal = ({ explanationData, onClose }) => {
    if (!explanationData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className={`${safeBg.card} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
          <div className={`p-6 border-b ${safeBorder.primary}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${safeText.primary}`}>{explanationData.term}</h2>
              <button onClick={onClose} className={`${safeText.tertiary} hover:${safeText.primary} text-2xl`}>×</button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h3 className={`text-lg font-semibold ${safeText.primary} mb-2`}>Explanation</h3>
              <p className={`${safeText.secondary} whitespace-pre-line`}>{explanationData.explanation}</p>
            </div>

            {explanationData.examples && explanationData.examples.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold ${safeText.primary} mb-2`}>Examples</h3>
                <ul className={`list-disc list-inside space-y-1 ${safeText.secondary}`}>
                  {explanationData.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}

            {explanationData.related_terms && explanationData.related_terms.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold ${safeText.primary} mb-2`}>Related Terms</h3>
                <div className="flex flex-wrap gap-2">
                  {explanationData.related_terms.map((relatedTerm, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        // When a related term is clicked, fetch its explanation
                        fetchExplanation(relatedTerm);
                        setSearchTerm(relatedTerm); // Update search bar with new term
                      }}
                      className={`px-3 py-1 ${safeAccent.secondary} bg-opacity-20 ${safeText.accent} rounded-full text-sm hover:bg-opacity-30 transition-colors`}
                    >
                      {relatedTerm}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${safeBg.primary} ${safeText.primary}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${safeText.primary} mb-2`}>Glossary & Help</h1>
        <p className={`${safeText.secondary}`}>Your comprehensive guide to Indian tax terminology.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className={`p-4 rounded-lg ${safeBg.secondary} border ${safeBorder.primary}`}>
            <h3 className={`text-lg font-semibold ${safeText.primary} mb-4`}>Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? `${safeBg.card} ${safeText.accent} font-semibold shadow-sm`
                      : `${safeText.secondary} hover:${safeBg.tertiary}`
                  }`}>
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-6">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${safeText.tertiary}`} />
            <input
              type="text"
              placeholder="Search for a tax term..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 ${safeBg.secondary} ${safeText.primary} border ${safeBorder.primary} rounded-lg focus:ring-2 focus:ring-offset-1 focus:${safeBorder.accent} outline-none`}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Search</button>
          </form>

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className={`${safeText.secondary}`}>Fetching explanation...</p>
            </div>
          )}

          {error && (
            <div className={`p-4 rounded-lg bg-red-50 text-red-700 border border-red-200`}>
              <p className="font-medium">Error: {error}</p>
              <p className="text-sm mt-1">Please check the term or try again later.</p>
            </div>
          )}

          {explanation && !isLoading && !error && (
            <div className={`p-5 rounded-lg ${safeBg.card} border ${safeBorder.primary} shadow-lg`}> {/* Display explanation directly */}
              <h3 className={`text-xl font-bold ${safeText.primary} mb-3`}>{explanation.term}</h3>
              {typeof explanation.explanation === 'string' ? (
                <p className={`${safeText.secondary} mb-4 whitespace-pre-line`}>{explanation.explanation}</p>
              ) : (
                <div className={`${safeText.secondary} mb-4`}>
                  <p>Detailed explanation format is unexpected. Showing raw data:</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(explanation.explanation, null, 2)}</pre>
                </div>
              )}

              {explanation.examples && Array.isArray(explanation.examples) && explanation.examples.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className={`text-lg font-semibold ${safeText.primary} mb-2`}>Examples:</h4>
                  <ul className={`list-disc list-inside space-y-1 ${safeText.secondary}`}>
                    {explanation.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}

              {explanation.related_terms && Array.isArray(explanation.related_terms) && explanation.related_terms.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className={`text-lg font-semibold ${safeText.primary} mb-2`}>Related Terms:</h4>
                  <div className="flex flex-wrap gap-2">
                    {explanation.related_terms.map((relatedTerm, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(relatedTerm);
                          fetchExplanation(relatedTerm);
                        }}
                        className={`px-3 py-1 ${safeAccent.secondary} bg-opacity-20 ${safeText.accent} rounded-full text-sm hover:bg-opacity-30 transition-colors`}
                      >
                        {relatedTerm}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* This section is removed as commonMistakes is not in the new API response */}
              {/* {term.commonMistakes && term.commonMistakes.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold ${safeText.primary} mb-2`}>⚠️ Common Mistakes</h3>
                  <ul className={`list-disc list-inside space-y-1 text-red-700 ${safeBg.secondary} p-4 rounded-lg`}>
                    {term.commonMistakes.map((mistake, index) => (
                      <li key={index}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )} */}

              {/* Removed videoUrl as it's not in the new API response */}
              {/* {term.videoUrl && (
                <div>
                  <h3 className={`text-lg font-semibold ${safeText.primary} mb-2`}>📹 Video Explanation</h3>
                  <a href={term.videoUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 ${safeAccent.error} bg-opacity-20 text-red-800 rounded-lg hover:bg-opacity-30 transition-colors`}>
                    <Video className="w-4 h-4" />
                    Watch Video Tutorial
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )} */}
            </div>
          )}

          {/* Removed dynamic term list - now relies on search */}
          {/* <div className="space-y-4">
            {filteredTerms.map(term => (
              <div
                key={term.id}
                onClick={() => setSelectedTerm(term)}
                className={`p-5 rounded-lg ${safeBg.card} border ${safeBorder.primary} hover:shadow-lg hover:border-teal-300 cursor-pointer transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${safeText.primary}`}>{term.term}</h3>
                    <p className={`text-sm ${safeText.secondary}`}>{term.definition}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${safeText.tertiary}`} />
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* Removed old modal usage - now directly using the 'explanation' state to render */}
      {/* {selectedTerm && (
        <TermDetailModal term={selectedTerm} onClose={() => setSelectedTerm(null)} />
      )} */}
    </div>
  );
};

export default TaxGlossaryHelp;
