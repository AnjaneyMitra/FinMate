import os
import json
from typing import Dict, List, Optional, Any, Union
import google.generativeai as genai
from pydantic import BaseModel
import logging
from .form_registry import tax_form_registry, FormType, FormMetadata
from .field_definitions import tax_field_registry
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class FormSearchQuery(BaseModel):
    """Structured search query for tax forms"""
    query: str
    user_context: Optional[Dict[str, Any]] = {}
    search_type: str = "natural_language"  # "natural_language", "specific_feature", "comparison"

class FormSearchResult(BaseModel):
    """Result of a form search operation"""
    form_id: str
    form_name: str
    confidence_score: float
    reasoning: str
    match_type: str  # "exact", "partial", "contextual", "recommended"
    key_features: List[str]
    eligibility_match: bool
    estimated_time: int

class GeminiFormSearchService:
    """Dedicated Gemini AI service for intelligent tax form search and discovery"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found for form search service")
            self.enabled = False
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('models/gemini-2.5-pro-preview-06-05')
            self.enabled = True
            logger.info("Gemini Form Search Service initialized successfully")
        
        # Pre-built form knowledge base
        self.form_knowledge_base = self._build_form_knowledge_base()
        
        # Search prompt templates
        self.search_prompts = {
            "natural_language": self._get_natural_language_search_prompt(),
            "specific_feature": self._get_feature_search_prompt(),
            "comparison": self._get_comparison_search_prompt()
        }
    
    def _build_form_knowledge_base(self) -> str:
        """Build a comprehensive knowledge base about all available tax forms"""
        forms = tax_form_registry.get_all_forms()
        knowledge_base = []
        
        for form in forms:
            form_info = {
                "form_id": form.form_type.value,
                "name": form.name,
                "description": form.description,
                "difficulty": form.difficulty_level,
                "estimated_time": form.estimated_time,
                "income_sources": [source.value for source in form.eligibility.income_sources],
                "max_income": form.eligibility.max_income,
                "additional_conditions": form.eligibility.additional_conditions or [],
                "excluded_conditions": form.eligibility.excluded_conditions or [],
                "sections": form.sections,
                "required_documents": form.required_documents,
                "common_deductions": form.common_deductions,
                "is_popular": form.is_popular
            }
            knowledge_base.append(form_info)
        
        return json.dumps(knowledge_base, indent=2)
    
    def _get_natural_language_search_prompt(self) -> str:
        """Get the prompt template for natural language form search"""
        return """
You are an expert Indian tax advisor with deep knowledge of tax forms. A user is searching for tax forms using natural language.

Available Tax Forms Knowledge Base:
{knowledge_base}

User Search Query: "{search_query}"

User Context (if provided):
{user_context}

Your task is to:
1. Understand the user's intent from their natural language query
2. Match their requirements to the most suitable tax forms
3. Provide confidence scores based on how well each form matches their needs
4. Explain the reasoning behind each recommendation

Respond in JSON format with this structure:
{{
  "search_results": [
    {{
      "form_id": "ITR-X",
      "form_name": "Form full name",
      "confidence_score": 0.95,
      "reasoning": "Detailed explanation of why this form matches the user's query",
      "match_type": "exact|partial|contextual|recommended",
      "key_features": ["Feature 1", "Feature 2", "Feature 3"],
      "eligibility_match": true,
      "estimated_time": 30
    }}
  ],
  "search_interpretation": "How you understood the user's query",
  "additional_suggestions": "Any additional advice or clarifications needed"
}}

Consider these search scenarios:
- Income type queries: "I have salary income", "I own rental property", "I have business income"
- Complexity queries: "I need a simple form", "I have complex finances", "I'm a first-time filer"
- Specific requirements: "I have foreign assets", "I have capital gains", "I need to claim deductions"
- Time constraints: "I need something quick", "I have limited time"
- Comparative queries: "What's the difference between ITR-1 and ITR-2"

Sort results by confidence_score in descending order.
"""

    def _get_feature_search_prompt(self) -> str:
        """Get the prompt template for feature-specific form search"""
        return """
You are an expert Indian tax advisor. A user is searching for tax forms based on specific features or requirements.

Available Tax Forms Knowledge Base:
{knowledge_base}

User Feature Query: "{search_query}"

User Context:
{user_context}

Focus on matching the specific features, requirements, or capabilities the user is looking for.

Common feature searches:
- "Forms that support business income"
- "Forms for capital gains reporting"
- "Forms with foreign asset disclosure"
- "Simplest forms for salary earners"
- "Forms that allow maximum deductions"

Respond in the same JSON format as natural language search, but prioritize exact feature matches.
"""

    def _get_comparison_search_prompt(self) -> str:
        """Get the prompt template for form comparison queries"""
        return """
You are an expert Indian tax advisor. A user wants to compare different tax forms.

Available Tax Forms Knowledge Base:
{knowledge_base}

Comparison Query: "{search_query}"

User Context:
{user_context}

Provide a detailed comparison highlighting:
- Key differences between forms
- When to use each form
- Pros and cons of each option
- Specific scenarios where one is better than another

Respond in JSON format:
{{
  "comparison_results": [
    {{
      "form_id": "ITR-X",
      "form_name": "Form name",
      "best_for": ["Scenario 1", "Scenario 2"],
      "advantages": ["Advantage 1", "Advantage 2"],
      "disadvantages": ["Limitation 1", "Limitation 2"],
      "when_to_choose": "Clear guidance on when to select this form"
    }}
  ],
  "recommendation": "Overall recommendation based on user context",
  "decision_factors": ["Factor 1", "Factor 2", "Factor 3"]
}}
"""

    def search_forms(self, query: str, user_context: Dict[str, Any] = None, search_type: str = "natural_language") -> Dict[str, Any]:
        """
        Search tax forms using Gemini AI based on natural language query
        
        Args:
            query: User's search query in natural language
            user_context: Additional context about the user (income, situation, etc.)
            search_type: Type of search ("natural_language", "specific_feature", "comparison")
        
        Returns:
            Structured search results with confidence scores and explanations
        """
        if not self.enabled:
            return self._get_fallback_search_results(query)
        
        try:
            # Select the appropriate prompt template
            prompt_template = self.search_prompts.get(search_type, self.search_prompts["natural_language"])
            
            # Format the prompt with user data
            formatted_prompt = prompt_template.format(
                knowledge_base=self.form_knowledge_base,
                search_query=query,
                user_context=json.dumps(user_context or {}, indent=2)
            )
            
            # Generate response using Gemini
            response = self.model.generate_content(formatted_prompt)

            # --- Robust Gemini response text extraction patch ---
            response_text = None
            if hasattr(response, 'text') and isinstance(response.text, str):
                response_text = response.text
            elif hasattr(response, 'candidates') and response.candidates:
                # Gemini 2.5 Flash: candidates[0].content.parts[0].text
                try:
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                        part = candidate.content.parts[0]
                        if isinstance(part, dict) and 'text' in part:
                            response_text = part['text']
                        elif hasattr(part, 'text'):
                            response_text = part.text
                except Exception as extract_err:
                    logger.error(f"Error extracting text from Gemini candidates: {extract_err}")
            if not response_text:
                # Fallback: try str(response)
                response_text = str(response)
                logger.warning(f"Gemini response text extraction fallback. Raw response: {response}")
            # --- End patch ---

            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_content = json_match.group()
                search_results = json.loads(json_content)
                
                # Add metadata
                search_results['query'] = query
                search_results['search_type'] = search_type
                search_results['timestamp'] = datetime.now().isoformat()
                search_results['source'] = 'ai_generated'
                
                return search_results
            else:
                logger.error("No valid JSON found in Gemini response")
                return self._get_fallback_search_results(query)
                
        except Exception as e:
            logger.error(f"Error in Gemini form search: {e}")
            return self._get_fallback_search_results(query)
    
    def semantic_form_discovery(self, user_description: str, user_profile: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Discover forms based on user's description of their tax situation
        
        Args:
            user_description: User's natural description of their tax situation
            user_profile: Structured user profile data
        
        Returns:
            Personalized form recommendations with detailed explanations
        """
        discovery_prompt = f"""
You are an expert Indian tax advisor. A user has described their tax situation, and you need to recommend the most suitable tax forms.

Available Tax Forms Knowledge Base:
{self.form_knowledge_base}

User's Tax Situation Description:
"{user_description}"

User Profile Data:
{json.dumps(user_profile or {}, indent=2)}

Based on the user's description and profile, provide personalized form recommendations.

Respond in JSON format:
{{
  "recommended_forms": [
    {{
      "form_id": "ITR-X",
      "form_name": "Form name",
      "suitability_score": 0.95,
      "why_recommended": "Detailed explanation of why this form is perfect for the user",
      "key_benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "potential_concerns": ["Concern 1 if any"],
      "preparation_tips": ["Tip 1", "Tip 2"],
      "estimated_completion_time": 30
    }}
  ],
  "situation_analysis": "Your analysis of the user's tax situation",
  "next_steps": ["Step 1", "Step 2", "Step 3"],
  "additional_considerations": "Any other important points to consider"
}}

Consider factors like:
- Income complexity and sources
- Time constraints and user experience level
- Specific deductions and exemptions applicable
- Compliance requirements and deadlines
- Potential tax optimization opportunities
"""
        
        return self.search_forms(user_description, user_profile, "natural_language")
    
    def find_forms_by_features(self, required_features: List[str], user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Find forms that support specific features or capabilities
        
        Args:
            required_features: List of required features (e.g., ["capital_gains", "foreign_assets"])
            user_context: Additional user context
        
        Returns:
            Forms that support the required features
        """
        features_query = f"I need tax forms that support: {', '.join(required_features)}"
        return self.search_forms(features_query, user_context, "specific_feature")
    
    def compare_forms(self, form_ids: List[str], comparison_context: str = "") -> Dict[str, Any]:
        """
        Compare specific tax forms using AI analysis
        
        Args:
            form_ids: List of form IDs to compare
            comparison_context: Additional context for comparison
        
        Returns:
            Detailed comparison of the specified forms
        """
        comparison_query = f"Compare these tax forms: {', '.join(form_ids)}. {comparison_context}"
        return self.search_forms(comparison_query, {}, "comparison")
    
    def _get_fallback_search_results(self, query: str) -> Dict[str, Any]:
        """
        Fallback search results when AI is not available
        Uses basic keyword matching and form registry
        """
        logger.info(f"Using fallback search for query: {query}")
        
        # Basic keyword matching
        query_lower = query.lower()
        all_forms = tax_form_registry.get_all_forms()
        results = []
        
        for form in all_forms:
            score = 0.0
            match_reasons = []
            
            # Check name and description matches
            if any(keyword in form.name.lower() for keyword in query_lower.split()):
                score += 0.3
                match_reasons.append("Name match")
            
            if any(keyword in form.description.lower() for keyword in query_lower.split()):
                score += 0.4
                match_reasons.append("Description match")
            
            # Check section matches
            for section in form.sections:
                if any(keyword in section.lower() for keyword in query_lower.split()):
                    score += 0.1
                    match_reasons.append("Section relevance")
                    break
            
            # Popularity boost
            if form.is_popular:
                score += 0.1
                match_reasons.append("Popular form")
            
            if score > 0:
                results.append({
                    "form_id": form.form_type.value,
                    "form_name": form.name,
                    "confidence_score": min(score, 1.0),
                    "reasoning": f"Matched based on: {', '.join(match_reasons)}",
                    "match_type": "keyword_match",
                    "key_features": form.sections[:3],
                    "eligibility_match": True,
                    "estimated_time": form.estimated_time
                })
        
        # Sort by confidence score
        results.sort(key=lambda x: x['confidence_score'], reverse=True)
        
        return {
            "search_results": results[:5],  # Top 5 results
            "search_interpretation": f"Keyword search for: {query}",
            "additional_suggestions": "AI search is currently unavailable. Results based on keyword matching.",
            "query": query,
            "search_type": "fallback",
            "timestamp": datetime.now().isoformat(),
            "source": "fallback"
        }

# Global instance
gemini_form_search_service = GeminiFormSearchService()
