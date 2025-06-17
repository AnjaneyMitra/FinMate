import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import google.generativeai as genai
from pydantic import BaseModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UserProfile(BaseModel):
    """User profile for personalized content generation"""
    age: Optional[int] = None
    income_range: Optional[str] = None  # "0-3L", "3-5L", "5-10L", "10L+"
    investment_experience: Optional[str] = None  # "beginner", "intermediate", "advanced"
    risk_tolerance: Optional[str] = None  # "conservative", "moderate", "aggressive"
    investment_goals: Optional[List[str]] = []  # ["retirement", "house", "child_education", "wealth_creation"]
    current_investments: Optional[List[str]] = []  # ["fd", "mutual_funds", "stocks", "real_estate"]
    monthly_savings: Optional[float] = None
    investment_timeline: Optional[str] = None  # "short_term", "medium_term", "long_term"
    location: Optional[str] = None  # "metro", "tier1", "tier2", "rural"
    employment_type: Optional[str] = None  # "salaried", "business", "freelancer"

class ContentRequest(BaseModel):
    """Content generation request"""
    level: str  # "beginner", "intermediate", "advanced"
    topic: str
    user_profile: UserProfile
    content_type: str = "comprehensive"  # "comprehensive", "summary", "actionable"

class GeminiContentService:
    """Service for generating personalized investment content using Google Gemini API"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            self.enabled = False
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.enabled = True
            logger.info("Gemini Content Service initialized successfully")
    
    def _build_context_prompt(self, user_profile: UserProfile) -> str:
        """Build context about the user for personalized content"""
        context_parts = ["User Context:"]
        
        if user_profile.age:
            context_parts.append(f"- Age: {user_profile.age} years old")
        
        if user_profile.income_range:
            context_parts.append(f"- Income Range: ₹{user_profile.income_range} annually")
        
        if user_profile.investment_experience:
            context_parts.append(f"- Investment Experience: {user_profile.investment_experience}")
        
        if user_profile.risk_tolerance:
            context_parts.append(f"- Risk Tolerance: {user_profile.risk_tolerance}")
        
        if user_profile.investment_goals:
            goals = ", ".join(user_profile.investment_goals)
            context_parts.append(f"- Investment Goals: {goals}")
        
        if user_profile.current_investments:
            investments = ", ".join(user_profile.current_investments)
            context_parts.append(f"- Current Investments: {investments}")
        
        if user_profile.monthly_savings:
            context_parts.append(f"- Monthly Savings Capacity: ₹{user_profile.monthly_savings:,.0f}")
        
        if user_profile.investment_timeline:
            context_parts.append(f"- Investment Timeline: {user_profile.investment_timeline}")
        
        if user_profile.location:
            context_parts.append(f"- Location Type: {user_profile.location}")
        
        if user_profile.employment_type:
            context_parts.append(f"- Employment: {user_profile.employment_type}")
        
        return "\n".join(context_parts)
    
    def _get_level_specific_guidelines(self, level: str) -> str:
        """Get level-specific content guidelines"""
        guidelines = {
            "beginner": """
            - Use simple, easy-to-understand language
            - Explain basic concepts and terminology
            - Focus on foundational knowledge
            - Include step-by-step guidance
            - Emphasize safety and conservative approaches
            - Provide examples relevant to Indian market
            - Mention specific Indian investment products (SIP, ELSS, PPF, etc.)
            """,
            "intermediate": """
            - Assume basic knowledge of investment concepts
            - Introduce more sophisticated strategies
            - Discuss portfolio construction and asset allocation
            - Cover tax implications and optimization
            - Include market analysis concepts
            - Mention advanced products like ETFs, sector funds
            - Discuss risk management techniques
            """,
            "advanced": """
            - Use professional investment terminology
            - Cover complex strategies and instruments
            - Discuss derivatives, options, futures
            - Include international investment options
            - Cover advanced tax planning strategies
            - Mention alternative investments (REITs, commodities)
            - Focus on portfolio optimization and rebalancing
            """
        }
        return guidelines.get(level, guidelines["beginner"])
    
    async def generate_personalized_content(self, request: ContentRequest) -> Dict[str, Any]:
        """Generate personalized investment content for a specific topic"""
        
        if not self.enabled:
            return self._get_fallback_content(request.level, request.topic)
        
        try:
            # Build the comprehensive prompt
            user_context = self._build_context_prompt(request.user_profile)
            level_guidelines = self._get_level_specific_guidelines(request.level)
            
            prompt = f"""
            You are an expert financial advisor specializing in Indian investment markets. Generate comprehensive, personalized investment educational content.

            {user_context}

            Topic: {request.topic}
            Level: {request.level.title()}
            Content Type: {request.content_type}

            Content Guidelines:
            {level_guidelines}

            Instructions:
            1. Create content specifically tailored to this user's profile
            2. Use Indian context (INR, Indian financial products, regulations)
            3. Make it actionable and practical
            4. Include specific examples and numbers where relevant
            5. Mention risks and disclaimers appropriately
            6. Structure the content with clear headings and bullet points
            7. Include "Next Steps" section with specific actions the user can take

            Please generate content in the following JSON format:
            {{
                "title": "Engaging title for the topic",
                "introduction": "Brief introduction paragraph",
                "main_content": "Detailed educational content with sections",
                "key_takeaways": ["List of 3-5 key points"],
                "specific_recommendations": ["Personalized recommendations based on user profile"],
                "next_steps": ["Actionable steps the user can take"],
                "resources": ["Relevant resources, tools, or further reading"],
                "risk_disclaimers": "Important risk information and disclaimers"
            }}

            Make sure the content is engaging, educational, and specifically relevant to the user's situation.
            """
            
            # Generate content using Gemini
            response = self.model.generate_content(prompt)
            
            # Try to parse JSON from response
            try:
                # Extract JSON from response text
                response_text = response.text
                # Find JSON content (sometimes Gemini adds markdown formatting)
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                json_content = response_text[start_idx:end_idx]
                
                content_data = json.loads(json_content)
                
                # Add metadata
                content_data.update({
                    "generated_at": datetime.now().isoformat(),
                    "personalized": True,
                    "level": request.level,
                    "topic": request.topic,
                    "user_profile_summary": self._get_profile_summary(request.user_profile)
                })
                
                logger.info(f"Successfully generated personalized content for {request.topic}")
                return content_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from Gemini response: {e}")
                # Return structured fallback
                return self._format_raw_content(response.text, request)
                
        except Exception as e:
            logger.error(f"Error generating content with Gemini: {e}")
            return self._get_fallback_content(request.level, request.topic)
    
    def _format_raw_content(self, raw_content: str, request: ContentRequest) -> Dict[str, Any]:
        """Format raw Gemini response into structured content"""
        return {
            "title": f"{request.topic} - {request.level.title()} Level",
            "introduction": "Personalized investment guidance generated for your profile.",
            "main_content": raw_content,
            "key_takeaways": [
                "Content generated based on your profile",
                "Tailored for your experience level",
                "Includes relevant examples and recommendations"
            ],
            "specific_recommendations": ["Review the detailed content for personalized advice"],
            "next_steps": ["Apply the insights to your investment strategy"],
            "resources": ["Consult with a financial advisor for personalized guidance"],
            "risk_disclaimers": "All investments carry risk. Past performance doesn't guarantee future results.",
            "generated_at": datetime.now().isoformat(),
            "personalized": True,
            "level": request.level,
            "topic": request.topic
        }
    
    def _get_profile_summary(self, profile: UserProfile) -> Dict[str, Any]:
        """Get a summary of user profile for metadata"""
        return {
            "age_group": self._get_age_group(profile.age) if profile.age else "unknown",
            "income_range": profile.income_range,
            "experience": profile.investment_experience,
            "risk_tolerance": profile.risk_tolerance,
            "primary_goals": profile.investment_goals[:3] if profile.investment_goals else []
        }
    
    def _get_age_group(self, age: int) -> str:
        """Categorize age into groups"""
        if age < 25:
            return "young_professional"
        elif age < 35:
            return "early_career"
        elif age < 45:
            return "mid_career"
        elif age < 55:
            return "pre_retirement"
        else:
            return "retirement_planning"
    
    def _get_fallback_content(self, level: str, topic: str) -> Dict[str, Any]:
        """Provide fallback content when Gemini is not available"""
        fallback_content = {
            "beginner": {
                "What is investing?": {
                    "title": "Understanding Investment Basics",
                    "introduction": "Investing is the process of putting your money to work to generate returns over time.",
                    "main_content": """
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
                    """,
                    "key_takeaways": [
                        "Start investing early to benefit from compound interest",
                        "Understand the risk-return relationship",
                        "Diversification helps reduce risk",
                        "Regular investing through SIPs is beneficial"
                    ]
                }
            }
        }
        
        content = fallback_content.get(level, {}).get(topic, {
            "title": f"{topic} - {level.title()} Level",
            "introduction": f"Learn about {topic} at the {level} level.",
            "main_content": f"This is general content about {topic}. For personalized content, please ensure Gemini API is configured.",
            "key_takeaways": ["General investment principles apply", "Consult with financial advisors"],
            "specific_recommendations": ["Configure Gemini API for personalized content"],
            "next_steps": ["Continue learning about investments"],
            "resources": ["Financial planning websites", "Investment books"],
            "risk_disclaimers": "All investments carry risk. Please consult with qualified financial advisors."
        })
        
        content.update({
            "generated_at": datetime.now().isoformat(),
            "personalized": False,
            "level": level,
            "topic": topic,
            "fallback": True
        })
        
        return content

# Initialize service instance
gemini_service = GeminiContentService()
