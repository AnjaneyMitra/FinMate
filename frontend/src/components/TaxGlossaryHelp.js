import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Video, FileText, MessageCircle, Star, ChevronRight, ExternalLink, ThumbsUp, Eye } from 'lucide-react';

const TaxGlossaryHelp = ({ searchTerm: externalSearchTerm, onTermSelect }) => {
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const categories = [
    { id: 'all', label: 'All Terms', icon: '📚' },
    { id: 'income', label: 'Income Types', icon: '💰' },
    { id: 'deductions', label: 'Deductions', icon: '📊' },
    { id: 'forms', label: 'Tax Forms', icon: '📄' },
    { id: 'procedures', label: 'Procedures', icon: '⚙️' },
    { id: 'penalties', label: 'Penalties & Compliance', icon: '⚠️' }
  ];

  const glossaryTerms = [
    {
      id: 'pan',
      term: 'PAN (Permanent Account Number)',
      category: 'procedures',
      definition: 'A unique 10-character alphanumeric identifier assigned by the Income Tax Department to track financial transactions and tax compliance.',
      detailedExplanation: 'PAN is mandatory for various financial transactions including opening bank accounts, purchasing assets above certain limits, and filing income tax returns. The format is ABCDE1234F where the first 5 characters are letters, followed by 4 digits and ending with a letter.',
      examples: ['ABCDE1234F', 'PQRST5678K'],
      relatedTerms: ['ITR', 'TDS', 'Aadhaar'],
      commonMistakes: ['Using incorrect format', 'Not linking with Aadhaar', 'Multiple PAN applications'],
      videoUrl: null,
      popularity: 95
    },
    {
      id: 'section_80c',
      term: 'Section 80C Deductions',
      category: 'deductions',
      definition: 'Tax deduction available up to ₹1.5 lakh per year for investments in specified instruments like EPF, PPF, ELSS, and life insurance premiums.',
      detailedExplanation: 'Section 80C is one of the most popular tax-saving provisions that allows taxpayers to reduce their taxable income by investing in qualifying instruments. The deduction is available under the old tax regime.',
      examples: [
        'EPF contribution: ₹50,000',
        'PPF investment: ₹1,00,000',
        'Life insurance premium: ₹25,000',
        'ELSS mutual funds: ₹50,000'
      ],
      relatedTerms: ['Section 80D', 'ELSS', 'PPF', 'EPF'],
      commonMistakes: ['Exceeding ₹1.5 lakh limit', 'Not claiming employer EPF contribution', 'Double counting EPF'],
      videoUrl: 'https://example.com/80c-explained',
      popularity: 88
    },
    {
      id: 'itr1',
      term: 'ITR-1 (Sahaj)',
      category: 'forms',
      definition: 'Income Tax Return form for individuals with salary income, one house property, and other income up to ₹50 lakhs.',
      detailedExplanation: 'ITR-1 is the simplest tax return form designed for salaried individuals. It cannot be used if you have business income, capital gains, or income from multiple house properties.',
      examples: ['Salaried employee with ₹8 lakh annual income', 'Person with salary + savings account interest'],
      relatedTerms: ['ITR-2', 'Form 16', 'TDS'],
      commonMistakes: ['Using when having capital gains', 'Not reporting all income sources', 'Filing without Form 16'],
      videoUrl: 'https://example.com/itr1-filing',
      popularity: 92
    },
    {
      id: 'tds',
      term: 'TDS (Tax Deducted at Source)',
      category: 'procedures',
      definition: 'Tax collected by the payer at the time of making payment to the payee, which is then deposited with the government.',
      detailedExplanation: 'TDS is a mechanism to collect tax at the source of income generation. Employers deduct TDS from salary, banks deduct from interest, and so on. You can claim credit for TDS while filing returns.',
      examples: ['TDS on salary by employer', 'TDS on bank interest', 'TDS on professional fees'],
      relatedTerms: ['Form 16', 'Form 16A', 'TCS'],
      commonMistakes: ['Not claiming TDS credit', 'Mismatched TDS details', 'Not downloading Form 16'],
      videoUrl: 'https://example.com/tds-explained',
      popularity: 85
    },
    {
      id: 'capital_gains',
      term: 'Capital Gains',
      category: 'income',
      definition: 'Profit earned from the sale of capital assets like stocks, real estate, or mutual funds.',
      detailedExplanation: 'Capital gains are classified as short-term (held for less than specified period) or long-term (held for more than specified period). Tax rates vary based on the type and holding period.',
      examples: ['Selling shares after 2 years', 'Selling house property', 'Mutual fund redemption'],
      relatedTerms: ['STCG', 'LTCG', 'Indexation', 'Section 54'],
      commonMistakes: ['Not calculating indexed cost', 'Wrong classification of gains', 'Not considering exemptions'],
      videoUrl: 'https://example.com/capital-gains',
      popularity: 75
    },
    {
      id: 'hra',
      term: 'HRA (House Rent Allowance)',
      category: 'deductions',
      definition: 'Allowance paid by employer to employees for accommodation expenses, which is partially or fully exempt from tax.',
      detailedExplanation: 'HRA exemption is calculated as the minimum of: actual HRA received, 50% of basic salary (40% for non-metro cities), or actual rent paid minus 10% of basic salary.',
      examples: ['Monthly HRA of ₹20,000 in Delhi', 'HRA exemption calculation for ₹50,000 basic salary'],
      relatedTerms: ['Section 80GG', 'Metro cities', 'Basic salary'],
      commonMistakes: ['Not providing rent receipts', 'Wrong calculation method', 'Not claiming when eligible'],
      videoUrl: 'https://example.com/hra-calculation',
      popularity: 80
    }
  ];

  const featuredVideos = [
    {
      id: 'v1',
      title: 'ITR Filing Complete Guide 2024',
      duration: '15:30',
      views: '2.5M',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop',
      description: 'Step-by-step guide to file your income tax return online'
    },
    {
      id: 'v2',
      title: 'Tax Saving Under Section 80C',
      duration: '12:45',
      views: '1.8M',
      thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=200&fit=crop',
      description: 'Complete list of 80C investments and tax calculations'
    },
    {
      id: 'v3',
      title: 'Common ITR Filing Mistakes to Avoid',
      duration: '10:20',
      views: '950K',
      thumbnail: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=300&h=200&fit=crop',
      description: 'Top mistakes taxpayers make and how to avoid them'
    }
  ];

  useEffect(() => {
    if (externalSearchTerm) {
      setSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = searchTerm === '' || 
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.relatedTerms.some(related => related.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.popularity - a.popularity);

  const handleAskAI = async () => {
    if (!userQuestion.trim()) return;

    const newMessage = { type: 'user', text: userQuestion };
    setChatMessages(prev => [...prev, newMessage]);
    setLoadingAnswer(true);
    setUserQuestion('');

    try {
      const response = await fetch('/api/tax/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          form_id: 'general',
          field_id: 'chatbot',
          user_query: userQuestion,
          form_data: {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = { 
          type: 'ai', 
          text: data.assistance?.explanation || 'I apologize, but I cannot provide an answer right now. Please try again later.',
          actionableAdvice: data.assistance?.actionable_advice
        };
        setChatMessages(prev => [...prev, aiResponse]);
      } else {
        setChatMessages(prev => [...prev, { 
          type: 'ai', 
          text: 'Sorry, I encountered an error. Please try asking your question again.' 
        }]);
      }
    } catch (error) {
      console.error('Error asking AI:', error);
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        text: 'I am currently unavailable. Please refer to the glossary terms or try again later.' 
      }]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const TermDetailModal = ({ term, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{term.term}</h2>
            <button onClick={onClose} className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 text-2xl">×</button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Definition</h3>
            <p className="text-gray-700 dark:text-gray-300">{term.definition}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Detailed Explanation</h3>
            <p className="text-gray-700 dark:text-gray-300">{term.detailedExplanation}</p>
          </div>
          {term.examples && term.examples.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Examples</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {term.examples.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>
          )}
          {term.commonMistakes && term.commonMistakes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">⚠️ Common Mistakes</h3>
              <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                {term.commonMistakes.map((mistake, index) => (
                  <li key={index}>{mistake}</li>
                ))}
              </ul>
            </div>
          )}
          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Related Terms</h3>
              <div className="flex flex-wrap gap-2">
                {term.relatedTerms.map((relatedTerm, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const related = glossaryTerms.find(t => t.term.toLowerCase().includes(relatedTerm.toLowerCase()));
                      if (related) {
                        setSelectedTerm(related);
                      }
                    }}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    {relatedTerm}
                  </button>
                ))}
              </div>
            </div>
          )}
          {term.videoUrl && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📹 Video Explanation</h3>
              <a href={term.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                <Video className="w-4 h-4" />
                Watch Video Tutorial
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ChatbotModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-2xl w-full h-[600px] flex flex-col border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">🤖 Tax Assistant</h2>
            <button onClick={() => setShowChatbot(false)} className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 text-xl">×</button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ask me anything about Indian tax laws and procedures</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Start a conversation by asking a tax-related question!</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Try asking:</p>
                <div className="space-y-1 text-sm">
                  <button 
                    onClick={() => setUserQuestion("What is the difference between ITR-1 and ITR-2?")}
                    className="block mx-auto px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    "What is the difference between ITR-1 and ITR-2?"
                  </button>
                  <button 
                    onClick={() => setUserQuestion("How do I calculate HRA exemption?")}
                    className="block mx-auto px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    "How do I calculate HRA exemption?"
                  </button>
                </div>
              </div>
            </div>
          )}
          {chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100'
              }`}>
                <p>{message.text}</p>
                {message.actionableAdvice && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900 rounded border-l-4 border-blue-400 dark:border-blue-600">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">💡 Actionable Advice:</p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">{message.actionableAdvice}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loadingAnswer && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ask your tax question..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
              onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
            />
            <button
              onClick={handleAskAI}
              disabled={!userQuestion.trim() || loadingAnswer}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow border border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tax Glossary & Help Center</h1>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive explanations of tax terms, procedures, and interactive AI assistance</p>
      </div>
      {/* Search and Tools */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tax terms, definitions, or ask a question..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-blue-300 dark:border-blue-700'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowChatbot(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Ask AI Assistant
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Glossary Terms */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Tax Terms {filteredTerms.length > 0 && `(${filteredTerms.length})`}
            </h2>
            <select 
              className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
              onChange={(e) => {
                const sortBy = e.target.value;
                // Add sorting logic here if needed
              }}
            >
              <option value="popularity">Most Popular</option>
              <option value="alphabetical">A-Z</option>
              <option value="category">By Category</option>
            </select>
          </div>
          <div className="space-y-4">
            {filteredTerms.map(term => (
              <div
                key={term.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-neutral-900"
                onClick={() => setSelectedTerm(term)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{term.term}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{term.popularity}%</span>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{term.definition}</p>
                    <div className="flex flex-wrap gap-2">
                      {term.relatedTerms.slice(0, 3).map((related, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 text-xs rounded">
                          {related}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-4 flex-shrink-0" />
                </div>
              </div>
            ))}
            {filteredTerms.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No terms found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or browse by category</p>
              </div>
            )}
          </div>
        </div>
        {/* Video Tutorials Sidebar */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">📹 Video Tutorials</h2>
          <div className="space-y-4">
            {featuredVideos.map(video => (
              <div key={video.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-neutral-900">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">{video.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{video.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {video.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>95%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Quick Links */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🔗 Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 p-2 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 rounded">
                <FileText className="w-4 h-4" />
                Income Tax Act
              </a>
              <a href="#" className="flex items-center gap-2 p-2 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 rounded">
                <ExternalLink className="w-4 h-4" />
                Official IT Portal
              </a>
              <a href="#" className="flex items-center gap-2 p-2 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 rounded">
                <BookOpen className="w-4 h-4" />
                Tax Calendar 2024
              </a>
              <a href="#" className="flex items-center gap-2 p-2 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 rounded">
                <FileText className="w-4 h-4" />
                Form Downloads
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      {selectedTerm && (
        <TermDetailModal term={selectedTerm} onClose={() => setSelectedTerm(null)} />
      )}
      {showChatbot && <ChatbotModal />}
    </div>
  );
};

export default TaxGlossaryHelp;
