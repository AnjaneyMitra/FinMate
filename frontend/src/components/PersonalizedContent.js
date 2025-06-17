import React from 'react';
import { Sparkles, Target, CheckCircle, Loader, BookOpen, User } from 'lucide-react';

const PersonalizedContent = ({ 
  content, 
  isLoading, 
  userProfile, 
  onMarkComplete, 
  onRegenerate, 
  onClose 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Generating personalized content...</p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a few seconds as we customize content for your profile
          </p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Click on a topic to get personalized learning content</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content header with source indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {content.source === 'gemini' && userProfile && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Personalized for you</span>
            </div>
          )}
          {content.source === 'fallback' && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs flex items-center space-x-1">
              <BookOpen className="w-3 h-3" />
              <span>General content</span>
            </div>
          )}
          {content.source === 'error' && (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs">
              <span>Error occurred</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close content"
        >
          ✕
        </button>
      </div>

      {/* Title */}
      {content.title && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-2xl font-bold text-gray-900">{content.title}</h3>
        </div>
      )}

      {/* Introduction */}
      {content.introduction && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Introduction
          </h4>
          <p className="text-blue-800 leading-relaxed">{content.introduction}</p>
        </div>
      )}

      {/* Main content */}
      <div className="prose max-w-none">
        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
          {content.main_content}
        </div>
      </div>

      {/* Key takeaways */}
      {content.key_takeaways && content.key_takeaways.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Key Takeaways
          </h4>
          <ul className="space-y-2">
            {content.key_takeaways.map((takeaway, index) => (
              <li key={index} className="text-green-800 flex items-start">
                <span className="text-green-600 mr-2 mt-1">•</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Personalization indicator */}
      {userProfile && content.source === 'gemini' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Personalized for your profile:</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Experience: {userProfile.experience_level}</div>
            <div>Risk Tolerance: {userProfile.risk_tolerance}</div>
            <div>Primary Goal: {userProfile.primary_goal}</div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {userProfile && content.source !== 'error' && (
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
          <button 
            onClick={onMarkComplete}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark as Complete</span>
          </button>
          <button 
            onClick={onRegenerate}
            disabled={isLoading}
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Regenerate Content</span>
          </button>
        </div>
      )}

      {/* No profile warning */}
      {!userProfile && content.source !== 'error' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Setup your profile for personalized content</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Create a learning profile to get content tailored to your experience level, goals, and risk tolerance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedContent;
