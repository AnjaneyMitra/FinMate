import React, { useState } from "react";

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

  const toggleTopicCompletion = (levelIndex, topicIndex) => {
    const topicKey = `${levelIndex}-${topicIndex}`;
    const newCompleted = new Set(completedTopics);
    
    if (newCompleted.has(topicKey)) {
      newCompleted.delete(topicKey);
    } else {
      newCompleted.add(topicKey);
    }
    
    setCompletedTopics(newCompleted);
  };

  const getCompletionPercentage = (levelIndex) => {
    const level = levels[levelIndex];
    const completedCount = level.topics.filter((_, topicIndex) => 
      completedTopics.has(`${levelIndex}-${topicIndex}`)
    ).length;
    return Math.round((completedCount / level.topics.length) * 100);
  };

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
            {levels[selectedLevel].topics.map((topic, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
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
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">{levels[selectedLevel].icon}</span>
            <h3 className="text-2xl font-semibold text-gray-900">
              {levels[selectedLevel].name} Level
            </h3>
          </div>
          
          <div className="prose max-w-none">
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {levels[selectedLevel].content}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            <button className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors">
              Start Learning
            </button>
            <button className="border border-teal-600 text-teal-600 px-6 py-2 rounded-md hover:bg-teal-50 transition-colors">
              Download PDF
            </button>
          </div>
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
