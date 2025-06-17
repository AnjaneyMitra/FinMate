// Investment Learning Service for GEMINI-powered content generation
class InvestmentLearningService {
  constructor() {
    this.baseURL = 'http://localhost:8000/api/learning';
  }

  // Get user's authentication token
  async getAuthToken() {
    try {
      // Try to get Firebase auth if available
      if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
        return await window.firebase.auth().currentUser.getIdToken();
      }
    } catch (error) {
      console.log('No authentication available:', error);
    }
    return null;
  }

  // Get authentication headers
  async getAuthHeaders() {
    const token = await this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Generate personalized content for a topic
  async generatePersonalizedContent(level, topic, userProfile) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/generate-content`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          level,
          topic,
          user_profile: userProfile,
          content_type: 'comprehensive'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate content: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating personalized content:', error);
      throw error;
    }
  }

  // Get available topics for a level
  async getTopicsForLevel(level) {
    try {
      const response = await fetch(`${this.baseURL}/topics/${level}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  }

  // Save user's learning profile
  async saveUserProfile(userProfile) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/user-profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userProfile)
      });

      if (!response.ok) {
        throw new Error(`Failed to save profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  // Get user's saved learning profile
  async getUserProfile() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/user-profile`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { status: 'error', message: 'Authentication required' };
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Track learning progress
  async trackProgress(level, topic, completed, sessionDuration = 0) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/track-progress`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          level,
          topic,
          completed,
          session_duration: sessionDuration
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to track progress: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error tracking progress:', error);
      throw error;
    }
  }

  // Create a default user profile based on basic information
  createDefaultProfile(basicInfo = {}) {
    return {
      age: basicInfo.age || null,
      income_range: basicInfo.incomeRange || null,
      investment_experience: basicInfo.experience || 'beginner',
      risk_tolerance: basicInfo.riskTolerance || 'moderate',
      investment_goals: basicInfo.goals || ['wealth_creation'],
      current_investments: basicInfo.currentInvestments || [],
      monthly_savings: basicInfo.monthlySavings || null,
      investment_timeline: basicInfo.timeline || 'long_term',
      location: basicInfo.location || null,
      employment_type: basicInfo.employmentType || 'salaried'
    };
  }

  // Get content with fallback if API fails
  async getContentWithFallback(level, topic, userProfile) {
    try {
      // Try to get personalized content first
      const result = await this.generatePersonalizedContent(level, topic, userProfile);
      
      if (result.status === 'success' && result.content) {
        return {
          ...result.content,
          source: 'ai_generated',
          personalized: result.personalized || false
        };
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.warn('Failed to get AI-generated content, using fallback:', error);
      return this.getFallbackContent(level, topic);
    }
  }

  // Fallback content for when API is not available
  getFallbackContent(level, topic) {
    const fallbackData = {
      beginner: {
        "What is investing?": {
          title: "Understanding Investment Basics",
          introduction: "Investing is the process of putting your money to work to generate returns over time.",
          main_content: `
            Investment is essentially about making your money grow by purchasing assets that have the potential to increase in value or generate income.

            Key Concepts:
            • Principal: The initial amount you invest
            • Returns: The profit or income generated from investments
            • Compound Interest: Earning returns on your returns
            • Risk: The possibility of losing money
            • Diversification: Spreading investments across different assets

            In India, popular investment options include:
            • Mutual Funds through SIP (Systematic Investment Plan)
            • Fixed Deposits (FD) and Recurring Deposits (RD)
            • Public Provident Fund (PPF)
            • Equity Linked Savings Scheme (ELSS)
            • Direct Equity (Stocks)
          `,
          key_takeaways: [
            "Start investing early to benefit from compound interest",
            "Understand the risk-return relationship",
            "Diversification helps reduce risk",
            "Regular investing through SIPs is beneficial"
          ],
          specific_recommendations: [
            "Start with SIP in diversified mutual funds",
            "Build an emergency fund before investing",
            "Educate yourself about different investment options"
          ],
          next_steps: [
            "Open a mutual fund account",
            "Start a SIP with ₹1000 per month",
            "Learn about different fund categories"
          ],
          resources: [
            "Mutual fund comparison websites",
            "Financial planning books",
            "Investment apps and platforms"
          ],
          risk_disclaimers: "All investments carry risk. Past performance doesn't guarantee future results. Please consult with qualified financial advisors."
        }
      },
      intermediate: {
        "Asset allocation strategies": {
          title: "Smart Asset Allocation for Your Portfolio",
          introduction: "Asset allocation is the foundation of successful investing, determining how you spread your investments across different asset classes.",
          main_content: `
            Asset allocation involves dividing your investment portfolio among different asset categories such as stocks, bonds, and cash. The right allocation depends on your age, risk tolerance, and investment timeline.

            Common Asset Classes:
            • Equity: Stocks and equity mutual funds (higher risk, higher returns)
            • Debt: Bonds, FDs, debt mutual funds (lower risk, steady returns)
            • Hybrid: Balanced funds combining equity and debt
            • Gold: Precious metals and gold ETFs (inflation hedge)
            • Real Estate: Direct property or REITs

            Age-Based Allocation Rules:
            • 20s-30s: 70-80% equity, 20-30% debt
            • 40s: 60-70% equity, 30-40% debt
            • 50s+: 40-60% equity, 40-60% debt

            Indian-Specific Considerations:
            • Tax-saving investments (ELSS, PPF, NSC)
            • EPF and employer contributions
            • Real estate as traditional wealth store
          `,
          key_takeaways: [
            "Asset allocation determines 90% of portfolio returns",
            "Age and risk tolerance guide allocation decisions",
            "Rebalance portfolio annually",
            "Don't neglect debt instruments"
          ]
        }
      },
      advanced: {
        "Portfolio rebalancing": {
          title: "Advanced Portfolio Rebalancing Strategies",
          introduction: "Portfolio rebalancing is the discipline of buying and selling assets to maintain your target asset allocation over time.",
          main_content: `
            Rebalancing ensures your portfolio doesn't drift from your intended risk level as market movements change asset values.

            Rebalancing Methods:
            • Time-based: Quarterly, semi-annually, or annually
            • Threshold-based: When allocation drifts by 5-10%
            • Combination approach: Time + threshold triggers

            Advanced Strategies:
            • Tax-efficient rebalancing using new money
            • Using dividends and interest for rebalancing
            • Asset location optimization (tax-advantaged accounts)
            • Core-satellite approach with index funds + active picks

            Indian Context:
            • Use SIP to gradually rebalance
            • Tax implications of selling equity (STCG vs LTCG)
            • Utilize ELSS for tax-efficient equity exposure
            • Consider debt mutual funds over FDs for better tax treatment
          `,
          key_takeaways: [
            "Rebalancing forces you to buy low and sell high",
            "Use new money for rebalancing when possible",
            "Consider tax implications before selling",
            "Automate the process where possible"
          ]
        }
      }
    };

    const content = fallbackData[level]?.[topic] || {
      title: `${topic} - ${level.charAt(0).toUpperCase() + level.slice(1)} Level`,
      introduction: `Learn about ${topic} at the ${level} level.`,
      main_content: `This topic covers important concepts about ${topic}. For personalized content, please configure the AI service.`,
      key_takeaways: ["Understanding the fundamentals is important", "Practice makes perfect", "Seek professional advice when needed"],
      specific_recommendations: ["Continue learning", "Practice with small amounts", "Join investment communities"],
      next_steps: ["Read more about the topic", "Start implementing gradually", "Track your progress"],
      resources: ["Investment books", "Online courses", "Financial advisors"],
      risk_disclaimers: "All investments carry risk. Please do your own research and consult with qualified professionals."
    };

    return {
      ...content,
      source: 'fallback',
      personalized: false,
      generated_at: new Date().toISOString(),
      level,
      topic
    };
  }
}

export default InvestmentLearningService;
