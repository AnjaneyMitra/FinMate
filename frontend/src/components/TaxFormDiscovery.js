import React, { useState } from 'react';
import AIFormRecommender from './AIFormRecommender';
import FormBrowser from './FormBrowser';
import { Bot, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useOutletContext, useNavigate } from 'react-router-dom';

const TaxFormDiscovery = () => {
  const [activeView, setActiveView] = useState('browse'); // 'browse' or 'ai'
  const { user } = useOutletContext();
  const themeContext = useTheme();
  const { bg, text } = themeContext || {};
  const navigate = useNavigate();

  // Safe fallbacks
  const safeBg = bg || { primary: 'bg-white', secondary: 'bg-gray-100', card: 'bg-white' };
  const safeText = text || { primary: 'text-gray-900', secondary: 'text-gray-600' };

  // Handler for form selection
  const handleFormSelected = (formId) => {
    // Store selected form in localStorage for retrieval in filing page
    localStorage.setItem('selectedTaxFormId', formId);
    navigate('/tax-filing/filing');
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${safeBg.primary} ${safeText.primary}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${safeText.primary} mb-2`}>Tax Form Discovery</h1>
        <p className={`${safeText.secondary}`}>Find the perfect tax form for your situation</p>
      </div>

      {/* View Toggle */}
      <div className="mb-6">
        <div className={`flex ${safeBg.secondary} rounded-lg p-1 max-w-md`}>
          <button
            onClick={() => setActiveView('browse')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeView === 'browse'
                ? `${safeBg.card} ${safeText.primary} shadow-sm`
                : `${safeText.secondary} hover:${safeText.primary}`
            }`}
          >
            <Search className="w-4 h-4" />
            Browse Forms
          </button>
          <button
            onClick={() => setActiveView('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeView === 'ai'
                ? `${safeBg.card} ${safeText.primary} shadow-sm`
                : `${safeText.secondary} hover:${safeText.primary}`
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Recommendations
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'ai' ? (
        <AIFormRecommender 
          userProfile={user}
          onFormSelected={handleFormSelected}
        />
      ) : (
        <FormBrowser onFormSelected={handleFormSelected} />
      )}
    </div>
  );
};

export default TaxFormDiscovery;
