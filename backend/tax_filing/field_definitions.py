from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum

class FieldType(Enum):
    TEXT = "text"
    NUMBER = "number"
    DATE = "date"
    SELECT = "select"
    MULTI_SELECT = "multi_select"
    BOOLEAN = "boolean"
    FILE_UPLOAD = "file_upload"
    CURRENCY = "currency"
    PAN = "pan"
    AADHAAR = "aadhaar"

class ValidationRule(Enum):
    REQUIRED = "required"
    PAN_FORMAT = "pan_format"
    AADHAAR_FORMAT = "aadhaar_format"
    POSITIVE_NUMBER = "positive_number"
    DATE_RANGE = "date_range"
    MIN_VALUE = "min_value"
    MAX_VALUE = "max_value"
    CONDITIONAL = "conditional"

@dataclass
class FieldValidation:
    """Validation rules for form fields"""
    rules: List[ValidationRule]
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    date_range: Optional[tuple] = None
    conditional_logic: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

@dataclass
class FieldDefinition:
    """Complete definition of a tax form field"""
    field_id: str
    label: str
    field_type: FieldType
    description: str
    help_text: str
    gemini_context: str  # Context for AI explanations
    validation: FieldValidation
    options: Optional[List[Dict[str, str]]] = None  # For select fields
    placeholder: Optional[str] = None
    default_value: Optional[Any] = None
    section: str = "general"
    subsection: Optional[str] = None
    depends_on: Optional[List[str]] = None  # Field dependencies
    auto_populate_from: Optional[str] = None  # Source for auto-population
    
class TaxFieldRegistry:
    """Registry for all tax form field definitions"""
    
    def __init__(self):
        self.fields = self._initialize_fields()
    
    def _initialize_fields(self) -> Dict[str, FieldDefinition]:
        """Initialize all field definitions"""
        return {
            # Personal Information Fields
            "pan_number": FieldDefinition(
                field_id="pan_number",
                label="PAN Number",
                field_type=FieldType.PAN,
                description="Permanent Account Number issued by Income Tax Department",
                help_text="Your 10-character PAN in format ABCDE1234F",
                gemini_context="PAN is a unique identifier for taxpayers in India. Required for all tax filings.",
                validation=FieldValidation(
                    rules=[ValidationRule.REQUIRED, ValidationRule.PAN_FORMAT],
                    error_message="Please enter a valid PAN number"
                ),
                placeholder="ABCDE1234F",
                section="personal_info"
            ),
            
            "name_as_per_pan": FieldDefinition(
                field_id="name_as_per_pan",
                label="Name as per PAN",
                field_type=FieldType.TEXT,
                description="Full name exactly as mentioned in PAN card",
                help_text="Enter your name exactly as it appears on your PAN card",
                gemini_context="Name must match PAN records for successful e-filing and processing",
                validation=FieldValidation(
                    rules=[ValidationRule.REQUIRED],
                    error_message="Name as per PAN is required"
                ),
                section="personal_info"
            ),
            
            "date_of_birth": FieldDefinition(
                field_id="date_of_birth",
                label="Date of Birth",
                field_type=FieldType.DATE,
                description="Date of birth as per official records",
                help_text="Enter your date of birth as mentioned in PAN/Aadhaar",
                gemini_context="Date of birth is used for identity verification and age-related tax benefits",
                validation=FieldValidation(
                    rules=[ValidationRule.REQUIRED, ValidationRule.DATE_RANGE],
                    date_range=("1900-01-01", "2010-12-31"),
                    error_message="Please enter a valid date of birth"
                ),
                section="personal_info"
            ),
            
            "aadhaar_number": FieldDefinition(
                field_id="aadhaar_number",
                label="Aadhaar Number",
                field_type=FieldType.AADHAAR,
                description="12-digit Aadhaar number for identity verification",
                help_text="Enter your 12-digit Aadhaar number (optional but recommended)",
                gemini_context="Aadhaar linking helps in faster processing and reduces manual verification",
                validation=FieldValidation(
                    rules=[ValidationRule.AADHAAR_FORMAT],
                    error_message="Please enter a valid 12-digit Aadhaar number"
                ),
                placeholder="1234 5678 9012",
                section="personal_info"
            ),
            
            # Income Fields
            "salary_income": FieldDefinition(
                field_id="salary_income",
                label="Gross Salary Income",
                field_type=FieldType.CURRENCY,
                description="Total salary income as per Form 16",
                help_text="Enter the gross salary amount from your Form 16",
                gemini_context="Salary income includes basic pay, allowances, perquisites, and other benefits",
                validation=FieldValidation(
                    rules=[ValidationRule.POSITIVE_NUMBER],
                    min_value=0,
                    max_value=50000000,  # 5 crores reasonable limit
                    error_message="Please enter a valid salary amount"
                ),
                auto_populate_from="form16_data",
                section="income",
                subsection="salary"
            ),
            
            "house_property_income": FieldDefinition(
                field_id="house_property_income",
                label="Annual Rental Income",
                field_type=FieldType.CURRENCY,
                description="Annual rental income from house property",
                help_text="Enter the total rental income received during the year",
                gemini_context="Include actual rent received minus municipal taxes and standard deduction",
                validation=FieldValidation(
                    rules=[ValidationRule.POSITIVE_NUMBER],
                    min_value=0,
                    error_message="Please enter a valid rental income amount"
                ),
                section="income",
                subsection="house_property"
            ),
            
            "other_income": FieldDefinition(
                field_id="other_income",
                label="Income from Other Sources",
                field_type=FieldType.CURRENCY,
                description="Interest from banks, dividends, and other miscellaneous income",
                help_text="Include bank interest, FD interest, dividends (above ₹10 per share)",
                gemini_context="Other sources include interest income, dividends, lottery winnings, gifts above ₹50,000",
                validation=FieldValidation(
                    rules=[ValidationRule.POSITIVE_NUMBER],
                    min_value=0,
                    error_message="Please enter a valid amount for other income"
                ),
                section="income",
                subsection="other_sources"
            ),
            
            # Deduction Fields
            "section_80c_investments": FieldDefinition(
                field_id="section_80c_investments",
                label="Section 80C Investments",
                field_type=FieldType.CURRENCY,
                description="Tax-saving investments under Section 80C",
                help_text="PPF, ELSS, NSC, Tax-saving FD, Life Insurance premiums (max ₹1.5 lakhs)",
                gemini_context="Section 80C allows deduction up to ₹1.5 lakhs for specified investments",
                validation=FieldValidation(
                    rules=[ValidationRule.POSITIVE_NUMBER],
                    min_value=0,
                    max_value=150000,
                    error_message="80C deduction cannot exceed ₹1,50,000"
                ),
                section="deductions",
                subsection="chapter_vi_a"
            ),
            
            "section_80d_medical": FieldDefinition(
                field_id="section_80d_medical",
                label="Section 80D - Health Insurance",
                field_type=FieldType.CURRENCY,
                description="Health insurance premiums paid",
                help_text="Health insurance for self, family, and parents (separate limits apply)",
                gemini_context="Section 80D allows deduction for health insurance premiums with age-based limits",
                validation=FieldValidation(
                    rules=[ValidationRule.POSITIVE_NUMBER],
                    min_value=0,
                    max_value=100000,
                    error_message="Please enter a valid health insurance premium amount"
                ),
                section="deductions",
                subsection="chapter_vi_a"
            ),
            
            # Tax Computation Fields
            "advance_tax_paid": FieldDefinition(
                field_id="advance_tax_paid",
                label="Advance Tax Paid",
                field_type=FieldType.CURRENCY,
                description="Advance tax paid during the financial year",
                help_text="Total advance tax paid in installments during the year",
                gemini_context="Advance tax is paid quarterly if tax liability exceeds ₹10,000",
                validation=FieldValidation(
                    rules=[ValidationRule.POSITIVE_NUMBER],
                    min_value=0,
                    error_message="Please enter a valid advance tax amount"
                ),
                section="tax_computation",
                subsection="taxes_paid"
            ),
            
            "tds_salary": FieldDefinition(
                field_id="tds_salary",
                label="TDS on Salary",
                field_type=FieldType.CURRENCY,
                description="Tax deducted at source from salary",
                help_text="TDS amount as shown in Form 16",
                gemini_context="TDS on salary is deducted by employer based on projected annual income",
                validation=FieldValidation(
                    rules=[ValidationRule.POSITIVE_NUMBER],
                    min_value=0,
                    error_message="Please enter a valid TDS amount"
                ),
                auto_populate_from="form16_data",
                section="tax_computation",
                subsection="taxes_paid"
            ),
            
            # Bank Account Details
            "bank_account_number": FieldDefinition(
                field_id="bank_account_number",
                label="Bank Account Number",
                field_type=FieldType.TEXT,
                description="Bank account number for refund processing",
                help_text="Enter your bank account number for tax refund (if applicable)",
                gemini_context="Bank account details are required for direct refund transfer",
                validation=FieldValidation(
                    rules=[ValidationRule.REQUIRED],
                    error_message="Bank account number is required for refund processing"
                ),
                section="bank_details"
            ),
            
            "ifsc_code": FieldDefinition(
                field_id="ifsc_code",
                label="IFSC Code",
                field_type=FieldType.TEXT,
                description="Bank's IFSC code",
                help_text="11-character IFSC code of your bank branch",
                gemini_context="IFSC code identifies the specific bank branch for fund transfer",
                validation=FieldValidation(
                    rules=[ValidationRule.REQUIRED],
                    error_message="Please enter a valid IFSC code"
                ),
                placeholder="ABCD0123456",
                section="bank_details"
            )
        }
    
    def get_field(self, field_id: str) -> Optional[FieldDefinition]:
        """Get field definition by ID"""
        return self.fields.get(field_id)
    
    def get_fields_by_section(self, section: str) -> List[FieldDefinition]:
        """Get all fields for a specific section"""
        return [field for field in self.fields.values() if field.section == section]
    
    def get_required_fields(self) -> List[FieldDefinition]:
        """Get all required fields"""
        return [
            field for field in self.fields.values() 
            if ValidationRule.REQUIRED in field.validation.rules
        ]
    
    def validate_field_value(self, field_id: str, value: Any) -> tuple[bool, Optional[str]]:
        """Validate a field value against its validation rules"""
        field = self.get_field(field_id)
        if not field:
            return False, f"Unknown field: {field_id}"
        
        # Check required fields
        if ValidationRule.REQUIRED in field.validation.rules:
            if value is None or value == "":
                return False, field.validation.error_message or f"{field.label} is required"
        
        # Skip other validations if field is empty and not required
        if value is None or value == "":
            return True, None
        
        # PAN format validation
        if ValidationRule.PAN_FORMAT in field.validation.rules:
            if not self._validate_pan(str(value)):
                return False, "Invalid PAN format. Use ABCDE1234F format"
        
        # Aadhaar format validation
        if ValidationRule.AADHAAR_FORMAT in field.validation.rules:
            if not self._validate_aadhaar(str(value)):
                return False, "Invalid Aadhaar format. Use 12-digit number"
        
        # Numeric validations
        if ValidationRule.POSITIVE_NUMBER in field.validation.rules:
            try:
                num_value = float(value)
                if num_value < 0:
                    return False, f"{field.label} must be positive"
            except (ValueError, TypeError):
                return False, f"{field.label} must be a valid number"
        
        # Min/Max value validations
        if field.validation.min_value is not None:
            try:
                if float(value) < field.validation.min_value:
                    return False, f"{field.label} must be at least {field.validation.min_value}"
            except (ValueError, TypeError):
                pass
        
        if field.validation.max_value is not None:
            try:
                if float(value) > field.validation.max_value:
                    return False, f"{field.label} cannot exceed {field.validation.max_value}"
            except (ValueError, TypeError):
                pass
        
        return True, None
    
    def _validate_pan(self, pan: str) -> bool:
        """Validate PAN format"""
        import re
        pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
        return bool(re.match(pattern, pan.upper().replace(" ", "")))
    
    def _validate_aadhaar(self, aadhaar: str) -> bool:
        """Validate Aadhaar format"""
        import re
        # Remove spaces and check if it's 12 digits
        clean_aadhaar = re.sub(r'\s', '', aadhaar)
        return len(clean_aadhaar) == 12 and clean_aadhaar.isdigit()

# Global instance
tax_field_registry = TaxFieldRegistry()