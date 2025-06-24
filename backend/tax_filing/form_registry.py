from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

# Import after class definitions to avoid circular imports
def _get_field_registry():
    from .field_definitions import tax_field_registry, ValidationRule
    return tax_field_registry, ValidationRule

class FormType(Enum):
    ITR1 = "ITR-1"
    ITR2 = "ITR-2" 
    ITR3 = "ITR-3"
    ITR4 = "ITR-4"
    ITR5 = "ITR-5"
    ITR6 = "ITR-6"
    ITR7 = "ITR-7"

class IncomeSource(Enum):
    SALARY = "salary"
    HOUSE_PROPERTY = "house_property"
    BUSINESS = "business"
    CAPITAL_GAINS = "capital_gains"
    OTHER_SOURCES = "other_sources"

@dataclass
class FormEligibility:
    """Defines eligibility criteria for tax forms"""
    income_sources: List[IncomeSource]
    max_income: Optional[float] = None
    min_income: Optional[float] = None
    additional_conditions: List[str] = None
    excluded_conditions: List[str] = None

@dataclass
class FormMetadata:
    """Metadata for tax forms"""
    form_type: FormType
    name: str
    description: str
    difficulty_level: str  # "beginner", "intermediate", "advanced"
    estimated_time: int  # in minutes
    eligibility: FormEligibility
    sections: List[str]
    required_documents: List[str]
    common_deductions: List[str]
    is_popular: bool = False

class TaxFormRegistry:
    """Registry for all Indian tax forms and their properties"""
    
    def __init__(self):
        self.forms = self._initialize_forms()
    
    def _initialize_forms(self) -> Dict[FormType, FormMetadata]:
        """Initialize all tax forms with their metadata"""
        return {
            FormType.ITR1: FormMetadata(
                form_type=FormType.ITR1,
                name="ITR-1 (Sahaj)",
                description="For individuals with salary income, one house property, and other sources up to ₹50 lakhs",
                difficulty_level="beginner",
                estimated_time=20,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.SALARY, IncomeSource.OTHER_SOURCES],
                    max_income=5000000,  # 50 lakhs
                    additional_conditions=[
                        "Only one house property (self-occupied)",
                        "Income from other sources up to ₹5,000",
                        "No business income",
                        "No capital gains"
                    ],
                    excluded_conditions=[
                        "Multiple house properties",
                        "Business income",
                        "Capital gains",
                        "Foreign assets"
                    ]
                ),
                sections=[
                    "Personal Information",
                    "Income Details", 
                    "Deductions",
                    "Tax Computation",
                    "Taxes Paid",
                    "Refund/Tax Payable"
                ],
                required_documents=[
                    "Form 16 from employer",
                    "Bank interest certificate",
                    "Investment proofs (80C, 80D etc.)",
                    "PAN Card",
                    "Aadhaar Card"
                ],
                common_deductions=[
                    "Section 80C - ₹1.5 lakhs",
                    "Section 80D - Health insurance",
                    "Section 87A - Rebate up to ₹12,500"
                ],
                is_popular=True
            ),
            
            FormType.ITR2: FormMetadata(
                form_type=FormType.ITR2,
                name="ITR-2",
                description="For individuals and HUFs with capital gains, multiple house properties, or foreign assets",
                difficulty_level="intermediate",
                estimated_time=45,
                eligibility=FormEligibility(
                    income_sources=[
                        IncomeSource.SALARY, 
                        IncomeSource.HOUSE_PROPERTY,
                        IncomeSource.CAPITAL_GAINS,
                        IncomeSource.OTHER_SOURCES
                    ],
                    additional_conditions=[
                        "Multiple house properties",
                        "Capital gains income",
                        "Foreign assets/income",
                        "Income above ₹50 lakhs"
                    ]
                ),
                sections=[
                    "Personal Information",
                    "Income from Salary",
                    "Income from House Property",
                    "Capital Gains",
                    "Income from Other Sources",
                    "Deductions",
                    "Foreign Assets",
                    "Tax Computation"
                ],
                required_documents=[
                    "Form 16",
                    "Capital gains statements",
                    "Property documents",
                    "Foreign asset details",
                    "Investment certificates"
                ],
                common_deductions=[
                    "Section 80C - ₹1.5 lakhs",
                    "Section 80D - Health insurance",
                    "Section 24 - Home loan interest"
                ],
                is_popular=True
            ),
            
            FormType.ITR3: FormMetadata(
                form_type=FormType.ITR3,
                name="ITR-3",
                description="For individuals with business/professional income",
                difficulty_level="advanced",
                estimated_time=90,
                eligibility=FormEligibility(
                    income_sources=[
                        IncomeSource.BUSINESS,
                        IncomeSource.SALARY,
                        IncomeSource.HOUSE_PROPERTY,
                        IncomeSource.CAPITAL_GAINS,
                        IncomeSource.OTHER_SOURCES
                    ],
                    additional_conditions=[
                        "Business/professional income",
                        "Partnership firm income",
                        "Presumptive taxation under 44AD/44ADA"
                    ]
                ),
                sections=[
                    "Personal Information",
                    "Income from Business/Profession",
                    "Profit & Loss Account",
                    "Balance Sheet",
                    "Income from Other Sources",
                    "Deductions",
                    "Tax Computation"
                ],
                required_documents=[
                    "Audited financial statements",
                    "Profit & Loss statement",
                    "Balance sheet",
                    "Business registration documents",
                    "TDS certificates"
                ],
                common_deductions=[
                    "Business expenses",
                    "Depreciation",
                    "Section 80C deductions",
                    "Professional tax"
                ]
            ),
            
            FormType.ITR4: FormMetadata(
                form_type=FormType.ITR4,
                name="ITR-4 (Sugam)",
                description="For presumptive income from business and profession",
                difficulty_level="intermediate",
                estimated_time=30,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.BUSINESS],
                    max_income=20000000,  # 2 crores for 44AD
                    additional_conditions=[
                        "Presumptive taxation under Section 44AD",
                        "Presumptive taxation under Section 44ADA",
                        "Business turnover up to ₹2 crores"
                    ]
                ),
                sections=[
                    "Personal Information",
                    "Presumptive Income from Business",
                    "Income from Other Sources",
                    "Deductions",
                    "Tax Computation"
                ],
                required_documents=[
                    "Business turnover details",
                    "Bank statements",
                    "Investment proofs"
                ],
                common_deductions=[
                    "Section 80C deductions",
                    "Standard deduction (if applicable)"
                ]
            )
        }
    
    def get_form_by_type(self, form_type: FormType) -> Optional[FormMetadata]:
        """Get form metadata by type"""
        return self.forms.get(form_type)
    
    def get_all_forms(self) -> List[FormMetadata]:
        """Get all available forms"""
        return list(self.forms.values())
    
    def get_popular_forms(self) -> List[FormMetadata]:
        """Get popular forms for quick access"""
        return [form for form in self.forms.values() if form.is_popular]
    
    def recommend_forms(self, user_profile: Dict[str, Any]) -> List[tuple[FormMetadata, float]]:
        """Recommend forms based on user profile with compatibility score"""
        recommendations = []
        
        for form in self.forms.values():
            score = self._calculate_compatibility_score(form, user_profile)
            if score > 0:
                recommendations.append((form, score))
        
        # Sort by compatibility score (highest first)
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations
    
    def _calculate_compatibility_score(self, form: FormMetadata, user_profile: Dict[str, Any]) -> float:
        """Calculate compatibility score between form and user profile"""
        score = 0.0
        max_score = 100.0
        
        # Income sources matching (40% weight)
        user_income_sources = set(user_profile.get('income_sources', []))
        form_income_sources = set([source.value for source in form.eligibility.income_sources])
        
        if user_income_sources.issubset(form_income_sources):
            score += 40.0
        elif user_income_sources.intersection(form_income_sources):
            score += 20.0
        
        # Income limits (30% weight)
        user_income = user_profile.get('annual_income', 0)
        if form.eligibility.max_income:
            if user_income <= form.eligibility.max_income:
                score += 30.0
            else:
                return 0  # Disqualified
        else:
            score += 30.0  # No upper limit
        
        # Additional conditions (20% weight)
        user_conditions = set(user_profile.get('conditions', []))
        if form.eligibility.additional_conditions:
            form_conditions = set(form.eligibility.additional_conditions)
            if user_conditions.intersection(form_conditions):
                score += 20.0
        else:
            score += 20.0
        
        # Excluded conditions (10% weight - penalty)
        if form.eligibility.excluded_conditions:
            excluded_conditions = set(form.eligibility.excluded_conditions)
            if user_conditions.intersection(excluded_conditions):
                return 0  # Disqualified
        
        score += 10.0  # No exclusions
        
        return min(score, max_score)
    
    def search_forms(self, query: str) -> List[FormMetadata]:
        """Search forms by name, description, or keywords"""
        query = query.lower()
        results = []
        
        for form in self.forms.values():
            if (query in form.name.lower() or 
                query in form.description.lower() or
                any(query in section.lower() for section in form.sections)):
                results.append(form)
        
        return results

# Global instance
tax_form_registry = TaxFormRegistry()

def get_all_forms():
    """Get all available tax forms (API compatibility function)"""
    return [
        {
            "form_id": form.form_type.value,
            "name": form.name,
            "description": form.description,
            "difficulty_level": form.difficulty_level,
            "estimated_time": form.estimated_time,
            "is_popular": form.is_popular,
            "sections": form.sections
        }
        for form in tax_form_registry.get_all_forms()
    ]

def get_form_details(form_id: str):
    """Get detailed form structure (API compatibility function)"""
    try:
        form_type = FormType(form_id)
        form_metadata = tax_form_registry.get_form_by_type(form_type)
        
        if not form_metadata:
            return None
        
        # Import here to avoid circular imports
        from .field_definitions import tax_field_registry, ValidationRule
        
        # Get fields for this form (simplified - in real implementation, 
        # you'd have form-specific field mappings)
        form_fields = []
        
        # Get all fields grouped by section
        for section in form_metadata.sections:
            section_key = section.lower().replace(" ", "_").replace("/", "_")
            fields = tax_field_registry.get_fields_by_section(section_key)
            
            for field in fields:
                form_fields.append({
                    "field_id": field.field_id,
                    "label": field.label,
                    "field_type": field.field_type.value,
                    "description": field.description,
                    "help_text": field.help_text,
                    "section": field.section,
                    "subsection": field.subsection,
                    "required": ValidationRule.REQUIRED in field.validation.rules,
                    "placeholder": field.placeholder,
                    "options": field.options
                })
        
        return {
            "form_id": form_id,
            "name": form_metadata.name,
            "description": form_metadata.description,
            "difficulty_level": form_metadata.difficulty_level,
            "estimated_time": form_metadata.estimated_time,
            "sections": form_metadata.sections,
            "required_documents": form_metadata.required_documents,
            "common_deductions": form_metadata.common_deductions,
            "eligibility": {
                "income_sources": [source.value for source in form_metadata.eligibility.income_sources],
                "max_income": form_metadata.eligibility.max_income,
                "additional_conditions": form_metadata.eligibility.additional_conditions,
                "excluded_conditions": form_metadata.eligibility.excluded_conditions
            },
            "fields": form_fields
        }
        
    except ValueError:
        return None