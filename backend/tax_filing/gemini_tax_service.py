import os
import json
from typing import Dict, List, Optional, Any
import google.generativeai as genai
from pydantic import BaseModel
import logging
from .field_definitions import tax_field_registry
from .form_registry import tax_form_registry, FormType
from datetime import datetime

logger = logging.getLogger(__name__)

class TaxQueryType(BaseModel):
    """Types of tax queries"""
    field_explanation: str = "field_explanation"
    error_resolution: str = "error_resolution"
    deduction_optimization: str = "deduction_optimization"
    form_guidance: str = "form_guidance"
    general_question: str = "general_question"

class GeminiTaxService:
    """Gemini AI service specifically for tax-related queries and assistance"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found for tax service")
            self.enabled = False
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('models/gemini-2.5-pro-preview-06-05')
            self.enabled = True
            logger.info("Gemini Tax Service initialized successfully")
    
    def get_field_assistance(self, form_id: str, field_id: str, user_query: str, current_form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Provide detailed explanation for a specific tax form field"""
        if not self.enabled:
            return self._get_fallback_field_explanation(field_id)
        
        field_def = tax_field_registry.get_field(field_id)
        if not field_def:
            return {"error": f"Unknown field: {field_id}"}
        
        
        prompt = f"""
        You are an expert Indian tax advisor. A user is asking for help with a field on a tax form.

        Form: {form_id}
        Field: "{field_def.label}" ({field_id})
        User's Question: "{user_query}"

        Field Information:
        - Description: {field_def.description}
        - Help Text: {field_def.help_text}
        - Gemini Context: {field_def.gemini_context}

        User's Current Form Data (for context):
        {json.dumps(current_form_data, indent=2)}

        Based on all this information, provide a helpful and clear answer to the user's question.
        The response should be in JSON format with the following structure:
        {{
          "field_id": "{field_id}",
          "explanation": "A clear explanation of the field, addressing the user's query.",
          "actionable_advice": "Specific advice on what the user should do or enter.",
          "examples": [
            "Example 1 relevant to the user's situation.",
            "Example 2 if applicable."
          ],
          "common_mistakes_to_avoid": [
            "A common mistake related to this field.",
            "Another common mistake."
          ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Parse JSON from response
            response_text = response.text
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            json_content = response_text[start_idx:end_idx]
            
            explanation = json.loads(json_content)
            explanation['source'] = 'ai_generated'
            
            return explanation
            
        except Exception as e:
            logger.error(f"Error generating field explanation: {e}")
            return self._get_fallback_field_explanation(field_id)
    
    def _get_fallback_field_explanation(self, field_id: str) -> Dict[str, Any]:
        """Fallback explanation when AI is not available"""
        field_def = tax_field_registry.get_field(field_id)
        if not field_def:
            return {"error": "Field not found"}
        
        return {
            "field_id": field_id,
            "explanation": field_def.description,
            "actionable_advice": field_def.help_text,
            "examples": ["Please refer to the official documentation for examples."],
            "common_mistakes_to_avoid": ["Ensure the value is in the correct format."],
            "source": "fallback"
        }

# Global instance
gemini_tax_service = GeminiTaxService()
