// Utility functions for content processing
export const calculateReadingTime = (text) => {
  const wordsPerMinute = 200; // Average reading speed
  const words = text.split(' ').length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

export const formatGenerationTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const getContentComplexity = (level) => {
  const complexityMap = {
    'beginner': { level: 'Basic', color: 'green' },
    'intermediate': { level: 'Intermediate', color: 'yellow' },
    'advanced': { level: 'Advanced', color: 'red' }
  };
  return complexityMap[level] || { level: 'Unknown', color: 'gray' };
};

export const extractKeywords = (content) => {
  // Simple keyword extraction from content
  const keywords = [];
  const text = content.toLowerCase();
  
  // Investment-related keywords
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
  
  return keywords.slice(0, 5); // Return top 5 keywords
};
