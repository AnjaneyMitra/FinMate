import React, { useState } from 'react';
import AIFormRecommender from './AIFormRecommender';
import FormBrowser from './FormBrowser';
import { Bot, Search } from 'lucide-react';

const TaxFormDiscovery = ({ onFormSelected, userProfile = {} }) => {
  const [activeView, setActiveView] = useState('browse'); // 'browse' or 'ai'

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Form Discovery</h1>
        <p className="text-gray-600">Find the perfect tax form for your situation</p>
      </div>

      {/* View Toggle */}
      <div className="mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1 max-w-md">
          <button
            onClick={() => setActiveView('browse')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeView === 'browse'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="w-4 h-4" />
            Browse Forms
          </button>
          <button
            onClick={() => setActiveView('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeView === 'ai'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
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
          onFormSelected={onFormSelected}
          userProfile={userProfile}
        />
      ) : (
        <FormBrowser 
          onFormSelected={onFormSelected}
        />
      )}
    </div>
  );
};

export default TaxFormDiscovery;
