import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Video, FileText, MessageCircle, Star, ChevronRight, ExternalLink, ThumbsUp, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const TaxGlossaryHelp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState(null);

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

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = searchTerm === '' || 
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.relatedTerms.some(related => related.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.popularity - a.popularity);


  const TermDetailModal = ({ term, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`${safeBg.card} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className={`p-6 border-b ${safeBorder.primary}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${safeText.primary}`}>{term.term}</h2>
            <button onClick={onClose} className={`${safeText.tertiary} hover:${safeText.primary} text-2xl`}>×</button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className={`text-lg font-semibold ${safeText.primary} mb-2`}>Definition</h3>
            <p className={`${safeText.secondary}`}>{term.definition}</p>
          </div>

          <div>
            <h3 className={`text-lg font-semibold ${safeText.primary} mb-2`}>Detailed Explanation</h3>
            <p className={`${safeText.secondary}`}>{term.detailedExplanation}</p>
          </div>

          {term.examples && term.examples.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold ${safeText.primary} mb-2`}>Examples</h3>
              <ul className={`list-disc list-inside space-y-1 ${safeText.secondary}`}>
                {term.examples.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>
          )}

          {term.commonMistakes && term.commonMistakes.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold ${safeText.primary} mb-2`}>⚠️ Common Mistakes</h3>
              <ul className={`list-disc list-inside space-y-1 text-red-700 ${safeBg.secondary} p-4 rounded-lg`}>
                {term.commonMistakes.map((mistake, index) => (
                  <li key={index}>{mistake}</li>
                ))}
              </ul>
            </div>
          )}

          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold ${safeText.primary} mb-2`}>Related Terms</h3>
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
                    className={`px-3 py-1 ${safeAccent.secondary} bg-opacity-20 ${safeText.accent} rounded-full text-sm hover:bg-opacity-30 transition-colors`}
                  >
                    {relatedTerm}
                  </button>
                ))}
              </div>
            </div>
          )}

          {term.videoUrl && (
            <div>
              <h3 className={`text-lg font-semibold ${safeText.primary} mb-2`}>📹 Video Explanation</h3>
              <a href={term.videoUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 ${safeAccent.error} bg-opacity-20 text-red-800 rounded-lg hover:bg-opacity-30 transition-colors`}>
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
          <div className="relative mb-6">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${safeText.tertiary}`} />
            <input
              type="text"
              placeholder="Search for a tax term..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 ${safeBg.secondary} ${safeText.primary} border ${safeBorder.primary} rounded-lg focus:ring-2 focus:ring-offset-1 focus:${safeBorder.accent} outline-none`}
            />
          </div>

          <div className="space-y-4">
            {filteredTerms.map(term => (
              <div
                key={term.id}
                onClick={() => setSelectedTerm(term)}
                className={`p-5 rounded-lg ${safeBg.card} border ${safeBorder.primary} hover:shadow-lg hover:border-teal-300 cursor-pointer transition-all`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${safeText.accent}`}>{term.term}</h3>
                  <ChevronRight className={`w-5 h-5 ${safeText.tertiary}`} />
                </div>
                <p className={`mt-2 text-sm ${safeText.secondary}`}>{term.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTerm && <TermDetailModal term={selectedTerm} onClose={() => setSelectedTerm(null)} />}
    </div>
  );
};

export default TaxGlossaryHelp;
