import React, { useState } from 'react';
import AIFormRecommender from './AIFormRecommender';
import FormBrowser from './FormBrowser';
import { Bot, Search } from 'lucide-react';

const TaxFormDiscovery = ({ onFormSelected, userProfile = {} }) => {
  const [activeView, setActiveView] = useState('browse'); // 'browse' or 'ai'

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow border border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tax Form Discovery</h1>
        <p className="text-gray-600 dark:text-gray-400">Find the perfect tax form for your situation</p>
      </div>

      {/* View Toggle */}
      <div className="mb-6">
        <div className="flex bg-gray-100 dark:bg-neutral-800 rounded-lg p-1 max-w-md">
          <button
            onClick={() => setActiveView('browse')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeView === 'browse'
                ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Search className="w-4 h-4" />
            Browse Forms
          </button>
          <button
            onClick={() => setActiveView('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeView === 'ai'
                ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
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
