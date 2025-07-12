import os
import json
import logging
from typing import Dict, List, Any, Optional

import google.generativeai as genai

from .form_registry import get_form_details, FormType, tax_form_registry

logger = logging.getLogger(__name__)

class GeminiTaxGuideService:
    """Service for generating AI-powered tax filing guides using Google Gemini API."""

    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found for tax guide service. AI guide generation will be disabled.")
            self.enabled = False
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.enabled = True
            logger.info("Gemini Tax Guide Service initialized successfully.")

    def generate_filing_guide(self, form_id: str) -> Dict[str, Any]:
        """
        Generate a step-by-step AI-powered tax filing guide for the given form_id.
        Returns: { guide: [ ...steps... ] }
        """
        try:
            # Get form details for context (optional, fallback if not found)
            form_details = get_form_details(form_id)
            form_name = form_details["name"] if form_details and "name" in form_details else form_id
            sections = form_details["sections"] if form_details and "sections" in form_details else ["Personal Information", "Income Details", "Deductions", "Summary"]
            official_pdf_link = form_details.get("official_pdf_link") if form_details else None
            help_guide_link = form_details.get("help_guide_link") if form_details else None

            # Compose prompt for Gemini
            prompt = f"""
            You are an expert Indian tax advisor. Generate a comprehensive, clear, step-by-step filing guide for the tax form '{form_name}' (form_id: {form_id}).
            The guide should be highly detailed, actionable, and tailored for a typical Indian taxpayer, focusing on specific components and fields within each section.

            Reference Information (simulate online lookup):
            - Form Name: {form_name}
            - Form ID: {form_id}
            - Official PDF Link: {official_pdf_link if official_pdf_link else "N/A"}
            - Official Help Guide Link: {help_guide_link if help_guide_link else "N/A"}
            - Key Sections: {', '.join(sections)}

            Based on the above reference information (as if you looked up the form online), provide a detailed guide.
            
            Structure the response as a JSON array called 'guide', where each element is an object with:
            - 'step': Step number (integer)
            - 'title': Short title for the step
            - 'description': A detailed explanation (3-5 sentences) of what to do in this step, including common fields/components.
            - 'section': (optional) The form section this step relates to
            - 'icon_suggestion': (optional) A short, descriptive keyword for an icon (e.g., "personal", "income", "documents", "deductions", "review", "submit")
            - 'key_points': (optional) A JSON array of 2-4 concise bullet points for key takeaways, focusing on important details or common scenarios.
            - 'tips': (optional) A concise tip or warning related to the step, focusing on avoiding common mistakes or optimizing.
            
            Example format:
            [
              {{"step": 1, "title": "Enter Personal Details", "description": "This initial section requires you to fill in fundamental personal information. This includes your Permanent Account Number (PAN), which is crucial for all tax-related transactions, your Aadhaar number, and up-to-date contact details like your mobile number and email address. Ensure all these details match your official records.", "section": "Personal Information", "icon_suggestion": "personal", "key_points": ["Double-check PAN and Aadhaar for accuracy.", "Update contact information if it has changed.", "Ensure name matches official documents."], "tips": "Any mismatch in personal details can lead to processing delays or rejection."}},
              {{"step": 2, "title": "Report Income Details", "description": "In this critical section, you must declare all your sources of income for the financial year. This typically includes income from salary (as per Form 16), income from house property (if you own rented property), and income from other sources like interest from savings accounts, fixed deposits, dividends, or casual income. Be meticulous in reporting every source of income to avoid discrepancies.", "section": "Income Details", "icon_suggestion": "income", "key_points": ["Consolidate all Form 16s if you changed jobs.", "Include all interest income, even small amounts.", "Declare rental income accurately if applicable."], "tips": "Under-reporting income can lead to penalties and legal issues."}},
              ...
            ]
            
            The guide should cover all major sections: {sections}.
            Ensure the JSON is well-formed and directly parsable.
            """

            if self.enabled:
                response = self.model.generate_content(prompt)
                response_text = response.text
                # Extract JSON array from response
                start_idx = response_text.find('[')
                end_idx = response_text.rfind(']') + 1
                if start_idx != -1 and end_idx > start_idx:
                    try:
                        guide = json.loads(response_text[start_idx:end_idx])
                        # Validate if guide is a list of dicts as expected
                        if not isinstance(guide, list) or not all(isinstance(item, dict) for item in guide):
                            raise ValueError("Gemini response is not a list of dictionaries.")
                        return {"guide": guide, "source": "ai_generated"}
                    except Exception as e:
                        logger.error(f"Failed to parse or validate Gemini guide JSON: {e}")
                # Fallback to raw text if JSON parse fails or is invalid
                return {"guide": [], "raw": response_text, "source": "ai_generated", "error": "Failed to parse JSON or invalid format"}
            else:
                logger.warning("Gemini not enabled, using fallback guide.")
        except Exception as e:
            logger.error(f"Error generating AI filing guide: {e}")
            form_name = form_id
            sections = ["Personal Information", "Income Details", "Deductions", "Summary"]

        # Fallback static guide (same as before) - make it detailed too for consistency
        fallback_guide = [
            {"step": 1, "title": "Enter Personal Details", "description": "This initial section requires you to fill in fundamental personal information. This includes your Permanent Account Number (PAN), which is crucial for all tax-related transactions, your Aadhaar number, and up-to-date contact details like your mobile number and email address. Ensure all these details match your official records.", "section": "Personal Information", "icon_suggestion": "personal", "key_points": ["Double-check PAN and Aadhaar for accuracy.", "Update contact information if it has changed.", "Ensure name matches official documents."], "tips": "Any mismatch in personal details can lead to processing delays or rejection."},
            {"step": 2, "title": "Report Income Details", "description": "In this critical section, you must declare all your sources of income for the financial year. This typically includes income from salary (as per Form 16), income from house property (if you own rented property), and income from other sources like interest from savings accounts, fixed deposits, dividends, or casual income. Be meticulous in reporting every source of income to avoid discrepancies.", "section": "Income Details", "icon_suggestion": "income", "key_points": ["Consolidate all Form 16s if you changed jobs.", "Include all interest income, even small amounts.", "Declare rental income accurately if applicable."], "tips": "Under-reporting income can lead to penalties and legal issues."},
            {"step": 3, "title": "Claim Deductions", "description": "This section allows you to reduce your taxable income by claiming eligible deductions under various sections of the Income Tax Act. Common deductions include investments made under Section 80C (e.g., PPF, ELSS, life insurance premiums), health insurance premiums under Section 80D, and interest on education loans under Section 80E. Always keep proofs for all claimed deductions.", "section": "Deductions", "icon_suggestion": "deductions", "key_points": ["Maximize your savings by utilizing all eligible deductions.", "Understand the limits for each deduction section (e.g., 80C limit).", "Retain all investment and payment proofs for verification."], "tips": "Claiming deductions without valid proofs can lead to scrutiny and penalties."},
            {"step": 4, "title": "Review and Validate", "description": "Before final submission, it's crucial to meticulously review all the information you have entered. This includes cross-verifying income figures with your Form 26AS, confirming deductions against proofs, and ensuring all personal and financial details are accurate. The validation step helps identify any errors or omissions that could lead to issues later.", "section": "Summary", "icon_suggestion": "review", "key_points": ["Cross-verify with Form 26AS and AIS/TIS for income matching.", "Check for any calculation errors, especially in tax liability.", "Ensure all required fields are filled correctly."], "tips": "A thorough review can prevent notices from the tax department."},
            {"step": 5, "title": "Submit Return", "description": "Once you are confident that all information is accurate and validated, proceed to submit your tax return electronically. After successful submission, download the ITR-V acknowledgment form. This form needs to be e-verified (e.g., via Aadhaar OTP, Net Banking, or Demat account) within 30 days of filing. Keep all your records safe for future reference.", "section": "Summary", "icon_suggestion": "submit", "key_points": ["Ensure successful e-verification of your ITR-V within the deadline.", "Keep a copy of your submitted return and acknowledgment for records.", "Track the status of your refund if applicable."], "tips": "Failure to e-verify renders your return invalid."}
        ]
        return {"guide": fallback_guide, "source": "fallback"}

gemini_tax_guide_service = GeminiTaxGuideService() 