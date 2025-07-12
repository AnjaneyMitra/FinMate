import os
import json
import logging
from typing import Dict, List, Any, Optional

import google.generativeai as genai

logger = logging.getLogger(__name__)

class GeminiGlossaryService:
    """Service for generating detailed explanations for tax glossary terms using Google Gemini API."""

    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found for glossary service. AI explanations will be disabled.")
            self.enabled = False
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.enabled = True
            logger.info("Gemini Glossary Service initialized successfully.")

    def get_explanation(self, term: str) -> Dict[str, Any]:
        """
        Generate a detailed and easy-to-understand explanation for a given tax term.
        Returns: { term: str, explanation: str, examples: List[str], related_terms: List[str] }
        """
        try:
            prompt = f"""
            You are an expert Indian tax advisor. Provide a detailed but easy-to-understand explanation for the Indian tax term: "{term}".
            
            The explanation should be comprehensive, actionable, and suitable for a general audience, including beginners.
            Include practical examples relevant to the Indian context where appropriate.

            Structure the response as a JSON object with the following fields:
            - 'term': The original term being explained.
            - 'explanation': A detailed explanation of the term (3-7 sentences).
            - 'examples': A JSON array of 1-3 simple, practical examples demonstrating the term.
            - 'related_terms': A JSON array of 2-4 related tax terms that the user might find useful.
            
            Example format for 'PAN':
            {{
              "term": "PAN",
              "explanation": "Permanent Account Number (PAN) is a ten-digit alphanumeric number, issued in the form of a laminated card by the Indian Income Tax Department. It is mandatory for almost all financial transactions, including filing income tax returns, opening a bank account, or making high-value transactions. It serves as a unique identification number for tax purposes.",
              "examples": [
                "You need a PAN to file your income tax return.",
                "Banks require your PAN when you open a new account.",
                "It's essential for any investment in mutual funds or stocks."
              ],
              "related_terms": ["Aadhaar", "Form 26AS", "TDS"]
            }}
            
            Ensure the JSON is well-formed and directly parsable.
            """

            if self.enabled:
                response = self.model.generate_content(prompt)
                response_text = response.text
                # Extract JSON object from response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                if start_idx != -1 and end_idx > start_idx:
                    try:
                        explanation_data = json.loads(response_text[start_idx:end_idx])
                        # Basic validation
                        if not all(k in explanation_data for k in ["term", "explanation"]):
                             raise ValueError("Missing essential fields in Gemini response.")
                        return {"success": True, "data": explanation_data, "source": "ai_generated"}
                    except Exception as e:
                        logger.error(f"Failed to parse or validate Gemini glossary JSON: {e}")
                # Fallback if JSON parse fails or is invalid
                return {"success": False, "error": "Failed to get AI explanation or invalid format", "source": "ai_generated"}
            else:
                logger.warning("Gemini not enabled, using fallback explanation.")
        except Exception as e:
            logger.error(f"Error generating glossary explanation: {e}")
        
        # Fallback static explanation
        return {
            "success": False,
            "data": {
                "term": term,
                "explanation": f"A detailed explanation for '{term}' is not available at the moment. Please try another term or check your internet connection.",
                "examples": [],
                "related_terms": []
            },
            "source": "fallback"
        }

gemini_glossary_service = GeminiGlossaryService() 