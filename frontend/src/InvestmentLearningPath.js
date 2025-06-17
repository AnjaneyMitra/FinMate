import React, { useState, useEffect, useCallback, useMemo } from "react";
import { User, BookOpen, Sparkles, CheckCircle, Loader } from 'lucide-react';
import InvestmentLearningService from './services/InvestmentLearningService';
import UserProfileSetup from './components/UserProfileSetup';
import PersonalizedContent from './components/PersonalizedContent';

const levels = [
  {
    name: "Beginner",
    icon: "🌱",
    description: "Start your investment journey with the basics",
    topics: [
      "What is investing?",
      "Risk vs Return",
      "Types of investments",
      "Emergency fund importance",
      "SIP (Systematic Investment Plan)"
    ],
    content: `
      Welcome to investing! As a beginner, it's important to understand that investing is about putting your money to work to generate returns over time. 
      
      Key principles:
      • Start early to benefit from compound interest
      • Diversify your investments to reduce risk
      • Invest regularly through SIPs
      • Build an emergency fund first (6 months expenses)
      • Don't invest money you need in the short term
    `
  },
  {
    name: "Intermediate",
    icon: "🌿",
    description: "Explore different investment vehicles and strategies",
    topics: [
      "Mutual Funds vs ETFs",
      "Asset allocation",
      "Tax-saving investments (ELSS)",
      "Reading financial statements",
      "Market cycles and timing"
    ],
    content: `
      Now that you understand the basics, let's explore different investment options:
      
      Asset Classes:
      • Equity (Stocks) - Higher risk, higher potential returns
      • Debt (Bonds) - Lower risk, steady returns
      • Hybrid - Mix of equity and debt
      • Gold - Hedge against inflation
      
      Remember: Asset allocation should match your risk tolerance and investment timeline.
    `
  },
  {
    name: "Advanced",
    icon: "🌳",
    description: "Master complex strategies and portfolio management",
    topics: [
      "Portfolio rebalancing",
      "Direct equity investing",
      "Options and derivatives",
      "International investing",
      "Tax optimization strategies"
    ],
    content: `
      Advanced investing requires deeper knowledge and careful risk management:
      
      Advanced Strategies:
      • Value investing principles
      • Growth vs Value stocks
      • Sector rotation strategies
      • International diversification
      • Alternative investments (REITs, Commodities)
      
      Important: Higher complexity means higher risk. Always do thorough research.
    `
  }
];

export default function InvestmentLearningPath() {
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicContent, setTopicContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [availableTopics, setAvailableTopics] = useState({});

  const learningService = useMemo(() => new InvestmentLearningService(), []);

  // Load user profile and topics on component mount
  const loadUserProfile = useCallback(async () => {
    try {
      const result = await learningService.getUserProfile();
      if (result.status === 'success' && result.profile) {
        setUserProfile(result.profile);
      }
    } catch (error) {
      console.log('No saved profile found:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [learningService]);

  const loadTopicsForAllLevels = useCallback(async () => {
    try {
      const levelNames = ['beginner', 'intermediate', 'advanced'];
      const topicsData = {};
      
      for (const level of levelNames) {
        const result = await learningService.getTopicsForLevel(level);
        if (result.status === 'success') {
          topicsData[level] = result.topics;
        }
      }
      
      setAvailableTopics(topicsData);
    } catch (error) {
      console.error('Error loading topics:', error);
      // Fallback to default topics from levels array
      const fallbackTopics = {};
      levels.forEach((level, index) => {
        const levelName = ['beginner', 'intermediate', 'advanced'][index];
        fallbackTopics[levelName] = level.topics;
      });
      setAvailableTopics(fallbackTopics);
    }
  }, [learningService]);

  useEffect(() => {
    loadUserProfile();
    loadTopicsForAllLevels();
  }, [loadUserProfile, loadTopicsForAllLevels]);

  const handleProfileSave = async (profile) => {
    try {
      await learningService.saveUserProfile(profile);
      setUserProfile(profile);
      setShowProfileSetup(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      // Still set the profile for session use
      setUserProfile(profile);
      setShowProfileSetup(false);
    }
  };

  const generatePersonalizedContent = async (level, topic) => {
    setContentLoading(true);
    setSelectedTopic(topic);
    
    try {
      const levelName = ['beginner', 'intermediate', 'advanced'][level];
      const profileToUse = userProfile || learningService.createDefaultProfile();
      
      const content = await learningService.getContentWithFallback(
        levelName, 
        topic, 
        profileToUse
      );
      
      setTopicContent(content);
      
      // Track that user accessed this topic
      if (userProfile) {
        learningService.trackProgress(levelName, topic, false, 0);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setTopicContent({
        title: `${topic}`,
        introduction: "Error loading content. Please try again.",
        main_content: "We're having trouble generating personalized content right now. Please check your connection and try again.",
        key_takeaways: ["Please try again later"],
        source: 'error'
      });
    } finally {
      setContentLoading(false);
    }
  };

  const toggleTopicCompletion = async (levelIndex, topicIndex) => {
    const levelName = ['beginner', 'intermediate', 'advanced'][levelIndex];
    const currentTopics = availableTopics[levelName] || levels[levelIndex].topics;
    const topic = currentTopics[topicIndex];
    const topicKey = `${levelIndex}-${topicIndex}`;
    const newCompleted = new Set(completedTopics);
    
    const isCompleting = !newCompleted.has(topicKey);
    
    if (isCompleting) {
      newCompleted.add(topicKey);
    } else {
      newCompleted.delete(topicKey);
    }
    
    setCompletedTopics(newCompleted);
    
    // Track progress if user is logged in
    if (userProfile) {
      try {
        await learningService.trackProgress(levelName, topic, isCompleting, 0);
      } catch (error) {
        console.error('Error tracking progress:', error);
      }
    }
  };

  const getCompletionPercentage = (levelIndex) => {
    const levelName = ['beginner', 'intermediate', 'advanced'][levelIndex];
    const currentTopics = availableTopics[levelName] || levels[levelIndex].topics;
    const completedCount = currentTopics.filter((_, topicIndex) => 
      completedTopics.has(`${levelIndex}-${topicIndex}`)
    ).length;
    return Math.round((completedCount / currentTopics.length) * 100);
  };

  // Show profile setup if no profile exists
  if (profileLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <Loader className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your learning profile...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <UserProfileSetup 
          onSave={handleProfileSave}
          initialProfile={userProfile}
          onSkip={() => setShowProfileSetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Investment Learning Path</h2>
        <p className="text-gray-600">Master investing with our structured learning modules</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {levels.map((level, index) => (
          <div 
            key={level.name} 
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 ${
              selectedLevel === index 
                ? 'ring-2 ring-teal-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedLevel(index)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{level.icon}</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">
                  {getCompletionPercentage(index)}%
                </div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{level.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{level.description}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage(index)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Topics Checklist */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {levels[selectedLevel].name} Topics
          </h3>
          <div className="space-y-3">
            {(() => {
              const levelName = ['beginner', 'intermediate', 'advanced'][selectedLevel];
              const currentTopics = availableTopics[levelName] || levels[selectedLevel].topics;
              return currentTopics.map((topic, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                >
                  <div 
                    className="flex items-center space-x-3 flex-1"
                    onClick={() => toggleTopicCompletion(selectedLevel, index)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      completedTopics.has(`${selectedLevel}-${index}`)
                        ? 'bg-teal-500 border-teal-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {completedTopics.has(`${selectedLevel}-${index}`) && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${
                      completedTopics.has(`${selectedLevel}-${index}`)
                        ? 'line-through text-gray-500'
                        : 'text-gray-700'
                    }`}>
                      {topic}
                    </span>
                  </div>
                  <button
                    onClick={() => generatePersonalizedContent(selectedLevel, topic)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center space-x-1"
                    disabled={contentLoading && selectedTopic === topic}
                  >
                    {contentLoading && selectedTopic === topic ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Learn</span>
                      </>
                    )}
                  </button>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-3">{levels[selectedLevel].icon}</span>
              <h3 className="text-2xl font-semibold text-gray-900">
                {selectedTopic ? selectedTopic : `${levels[selectedLevel].name} Level`}
              </h3>
            </div>
            {!topicContent && (
              <button
                onClick={() => setShowProfileSetup(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>{userProfile ? "Edit Profile" : "Setup Profile"}</span>
              </button>
            )}
          </div>
          
          {/* Display personalized content or default content */}
          {topicContent || contentLoading || selectedTopic ? (
            <PersonalizedContent
              content={topicContent}
              isLoading={contentLoading}
              userProfile={userProfile}
              onMarkComplete={() => {
                const levelName = ['beginner', 'intermediate', 'advanced'][selectedLevel];
                if (userProfile) {
                  learningService.trackProgress(levelName, selectedTopic, true, 100);
                }
                const currentTopics = availableTopics[levelName] || levels[selectedLevel].topics;
                const topicIndex = currentTopics.indexOf(selectedTopic);
                toggleTopicCompletion(selectedLevel, topicIndex);
              }}
              onRegenerate={() => generatePersonalizedContent(selectedLevel, selectedTopic)}
              onClose={() => {
                setTopicContent(null);
                setSelectedTopic(null);
              }}
            />
          ) : (
            <div className="space-y-6">
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {levels[selectedLevel].content}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => {
                    // Always start with first topic, regardless of profile status
                    const levelName = ['beginner', 'intermediate', 'advanced'][selectedLevel];
                    const firstTopic = (availableTopics[levelName] || levels[selectedLevel].topics)[0];
                    generatePersonalizedContent(selectedLevel, firstTopic);
                  }}
                  className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start Learning</span>
                </button>
                {!userProfile ? (
                  <button 
                    onClick={() => setShowProfileSetup(true)}
                    className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Get Personalized Content</span>
                  </button>
                ) : (
                  <div className="bg-green-100 text-green-800 px-6 py-2 rounded-md flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Profile Ready - Click topics for personalized content!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Quick Investment Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-gray-800 mb-1">Set Clear Goals</h4>
            <p className="text-sm text-gray-600">Define your investment objectives and timeline</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl mb-2">📈</div>
            <h4 className="font-semibold text-gray-800 mb-1">Start Small</h4>
            <p className="text-sm text-gray-600">Begin with SIPs as low as ₹500 per month</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-semibold text-gray-800 mb-1">Stay Consistent</h4>
            <p className="text-sm text-gray-600">Regular investing beats trying to time the market</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl mb-2">📚</div>
            <h4 className="font-semibold text-gray-800 mb-1">Keep Learning</h4>
            <p className="text-sm text-gray-600">Financial education is a lifelong journey</p>
          </div>
        </div>
      </div>
    </div>
  );
}
