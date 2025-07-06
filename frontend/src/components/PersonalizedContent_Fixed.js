import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Target, CheckCircle, Loader, BookOpen, User, Clock, Tag, X, AlertTriangle } from 'lucide-react';
import './LearningContent.css';
import ContentActions from './ContentActions';

// Utility functions for content processing
const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.split(' ').length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

const formatGenerationTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const getContentComplexity = (level) => {
  const complexityMap = {
    'beginner': { level: 'Basic', color: 'green' },
    'intermediate': { level: 'Intermediate', color: 'yellow' },
    'advanced': { level: 'Advanced', color: 'red' }
  };
  return complexityMap[level] || { level: 'Unknown', color: 'gray' };
};

const extractKeywords = (content) => {
  const keywords = [];
  const text = content.toLowerCase();
  
  const investmentKeywords = [
    'sip', 'mutual funds', 'etf', 'stocks', 'bonds', 'ppf', 'elss',
    'diversification', 'risk', 'return', 'portfolio', 'asset allocation',
    'equity', 'debt', 'tax', 'inflation', 'compounding'
  ];
  
  investmentKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  return keywords.slice(0, 5);
};

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

  // Calculate content metrics
  const readingTime = calculateReadingTime(content.main_content || '');
  const complexity = getContentComplexity(content.level || 'beginner');
  const keywords = extractKeywords(content.main_content || '');

  return (
    <div className="space-y-6 learning-container">
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
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Enhanced Title with metadata */}
      {content.title && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{content.title}</h3>
          
          {/* Content metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              complexity.color === 'green' ? 'bg-green-100 text-green-800' :
              complexity.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              complexity.color === 'red' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {complexity.level}
            </div>
            {content.generated_at && (
              <div className="text-xs text-gray-500">
                Generated: {formatGenerationTime(content.generated_at)}
              </div>
            )}
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="mt-3 flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Introduction */}
      {content.introduction && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center text-lg">
            <Target className="w-4 h-4 mr-2" />
            Introduction
          </h4>
          <div className="text-blue-800 leading-relaxed">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                em: ({children}) => <em className="italic">{children}</em>,
                code: ({children}) => <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded text-sm">{children}</code>,
              }}
            >
              {content.introduction}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="learning-content prose prose-lg max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">{children}</h1>,
            h2: ({children}) => <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{children}</h2>,
            h3: ({children}) => <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">{children}</h3>,
            p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
            ul: ({children}) => <ul className="space-y-2 mb-4 ml-4">{children}</ul>,
            ol: ({children}) => <ol className="space-y-2 mb-4 list-decimal list-inside">{children}</ol>,
            li: ({children}) => <li className="text-gray-700 leading-relaxed">{children}</li>,
            strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
            em: ({children}) => <em className="italic text-gray-800">{children}</em>,
            code: ({children}) => <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
            blockquote: ({children}) => (
              <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-blue-800">
                {children}
              </blockquote>
            ),
          }}
        >
          {content.main_content}
        </ReactMarkdown>
      </div>

      {/* Key takeaways */}
      {content.key_takeaways && content.key_takeaways.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-4 flex items-center text-lg">
            <Target className="w-5 h-5 mr-2" />
            Key Takeaways
          </h4>
          <div className="space-y-3">
            {content.key_takeaways.map((takeaway, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="text-green-800 leading-relaxed">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({children}) => <span className="inline">{children}</span>,
                      strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      code: ({children}) => <code className="bg-green-100 text-green-900 px-1 py-0.5 rounded text-sm">{children}</code>,
                    }}
                  >
                    {takeaway}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specific Recommendations */}
      {content.specific_recommendations && content.specific_recommendations.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-4 flex items-center text-lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Personalized Recommendations
          </h4>
          <div className="space-y-3">
            {content.specific_recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="text-blue-800 leading-relaxed">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({children}) => <span className="inline">{children}</span>,
                      strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      code: ({children}) => <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded text-sm">{children}</code>,
                    }}
                  >
                    {recommendation}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {content.next_steps && content.next_steps.length > 0 && (
        <div className="bg-purple-50 border-l-4 border-purple-400 p-6 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-4 flex items-center text-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            Next Steps
          </h4>
          <div className="space-y-3">
            {content.next_steps.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="text-purple-800 leading-relaxed">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({children}) => <span className="inline">{children}</span>,
                      strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      code: ({children}) => <code className="bg-purple-100 text-purple-900 px-1 py-0.5 rounded text-sm">{children}</code>,
                    }}
                  >
                    {step}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Disclaimers */}
      {content.risk_disclaimers && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="p-1 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-md mr-2 mt-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-yellow-800 text-sm leading-relaxed">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({children}) => <span className="inline">{children}</span>,
                  strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                }}
              >
                {content.risk_disclaimers}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Content Actions */}
      <ContentActions 
        content={content}
        topic={content.title || 'Investment Learning Content'}
      />

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
