from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from .field_definitions import tax_field_registry, ValidationRule
from .form_registry import FormType, tax_form_registry
import re
from datetime import datetime

@dataclass
class ValidationError:
    """Represents a validation error"""
    field_id: str
    error_message: str
    error_type: str
    suggested_fix: Optional[str] = None

@dataclass
class ValidationResult:
    """Result of form validation"""
    is_valid: bool
    errors: List[ValidationError]
    warnings: List[ValidationError]
    completion_percentage: float
    missing_required_fields: List[str]

class TaxFormValidationEngine:
    """Engine for validating tax form data"""
    
    def __init__(self):
        self.field_registry = tax_field_registry
        self.form_registry = tax_form_registry
    
    def validate_form_data(self, form_type: FormType, form_data: Dict[str, Any]) -> ValidationResult:
        """Validate complete form data"""
        errors = []
        warnings = []
        
        # Get form metadata
        form_metadata = self.form_registry.get_form_by_type(form_type)
        if not form_metadata:
            errors.append(ValidationError(
                field_id="form_type",
                error_message=f"Unknown form type: {form_type}",
                error_type="form_error"
            ))
            return ValidationResult(False, errors, warnings, 0.0, [])
        
        # Validate individual fields
        field_errors, field_warnings = self._validate_fields(form_data)
        errors.extend(field_errors)
        warnings.extend(field_warnings)
        
        # Cross-field validations
        cross_errors, cross_warnings = self._validate_cross_field_rules(form_type, form_data)
        errors.extend(cross_errors)
        warnings.extend(cross_warnings)
        
        # Calculate completion percentage
        completion_percentage = self._calculate_completion_percentage(form_data)
        
        # Find missing required fields
        missing_required = self._find_missing_required_fields(form_data)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            completion_percentage=completion_percentage,
            missing_required_fields=missing_required
        )
    
    def _validate_fields(self, form_data: Dict[str, Any]) -> Tuple[List[ValidationError], List[ValidationError]]:
        """Validate individual field values"""
        errors = []
        warnings = []
        
        for field_id, value in form_data.items():
            field_def = self.field_registry.get_field(field_id)
            if not field_def:
                continue  # Skip unknown fields
            
            is_valid, error_message = self.field_registry.validate_field_value(field_id, value)
            if not is_valid:
                errors.append(ValidationError(
                    field_id=field_id,
                    error_message=error_message,
                    error_type="field_validation",
                    suggested_fix=self._get_field_suggestion(field_id, value)
                ))
        
        return errors, warnings
    
    def _validate_cross_field_rules(self, form_type: FormType, form_data: Dict[str, Any]) -> Tuple[List[ValidationError], List[ValidationError]]:
        """Validate cross-field business rules"""
        errors = []
        warnings = []
        
        # Rule 1: For ITR-1, total income should not exceed 50 lakhs
        if form_type == FormType.ITR1:
            total_income = self._calculate_total_income(form_data)
            if total_income > 5000000:
                errors.append(ValidationError(
                    field_id="total_income",
                    error_message="Total income exceeds ₹50 lakhs. Please use ITR-2 instead of ITR-1",
                    error_type="form_eligibility",
                    suggested_fix="Switch to ITR-2 form for income above ₹50 lakhs"
                ))
        
        # Rule 2: Section 80C deduction cannot exceed investment amount
        section_80c = form_data.get("section_80c_investments", 0)
        if section_80c > 150000:
            errors.append(ValidationError(
                field_id="section_80c_investments",
                error_message="Section 80C deduction cannot exceed ₹1,50,000",
                error_type="deduction_limit",
                suggested_fix="Reduce Section 80C investments to maximum ₹1,50,000"
            ))
        
        # Rule 3: Bank details required if refund is due
        advance_tax = form_data.get("advance_tax_paid", 0)
        tds = form_data.get("tds_salary", 0)
        total_tax_paid = advance_tax + tds
        total_income = self._calculate_total_income(form_data)
        estimated_tax = self._estimate_tax_liability(total_income, form_data)
        
        if total_tax_paid > estimated_tax:  # Refund due
            if not form_data.get("bank_account_number") or not form_data.get("ifsc_code"):
                errors.append(ValidationError(
                    field_id="bank_details",
                    error_message="Bank account details required for tax refund",
                    error_type="refund_processing",
                    suggested_fix="Provide bank account number and IFSC code"
                ))
        
        # Rule 4: Warning for high other income without TDS
        other_income = form_data.get("other_income", 0)
        if other_income > 50000 and not form_data.get("tds_other_income", 0):
            warnings.append(ValidationError(
                field_id="other_income",
                error_message="High other income detected. Ensure TDS compliance",
                error_type="tds_warning",
                suggested_fix="Check if TDS was deducted on interest income above ₹40,000"
            ))
        
        return errors, warnings
    
    def _calculate_completion_percentage(self, form_data: Dict[str, Any]) -> float:
        """Calculate form completion percentage"""
        required_fields = self.field_registry.get_required_fields()
        total_required = len(required_fields)
        
        if total_required == 0:
            return 100.0
        
        completed_required = 0
        for field in required_fields:
            if field.field_id in form_data and form_data[field.field_id] not in [None, "", 0]:
                completed_required += 1
        
        return (completed_required / total_required) * 100.0
    
    def _find_missing_required_fields(self, form_data: Dict[str, Any]) -> List[str]:
        """Find missing required fields"""
        required_fields = self.field_registry.get_required_fields()
        missing = []
        
        for field in required_fields:
            if field.field_id not in form_data or form_data[field.field_id] in [None, ""]:
                missing.append(field.field_id)
        
        return missing
    
    def _calculate_total_income(self, form_data: Dict[str, Any]) -> float:
        """Calculate total income from all sources"""
        salary = form_data.get("salary_income", 0)
        house_property = form_data.get("house_property_income", 0)
        other_income = form_data.get("other_income", 0)
        business_income = form_data.get("business_income", 0)
        capital_gains = form_data.get("capital_gains", 0)
        
        return salary + house_property + other_income + business_income + capital_gains
    
    def _estimate_tax_liability(self, total_income: float, form_data: Dict[str, Any]) -> float:
        """Estimate tax liability (simplified calculation)"""
        # Apply standard deduction for salary income
        taxable_income = total_income
        if form_data.get("salary_income", 0) > 0:
            taxable_income -= 50000  # Standard deduction
        
        # Apply Section 80C deduction
        section_80c = min(form_data.get("section_80c_investments", 0), 150000)
        taxable_income -= section_80c
        
        # Apply Section 80D deduction
        section_80d = min(form_data.get("section_80d_medical", 0), 25000)
        taxable_income -= section_80d
        
        taxable_income = max(taxable_income, 0)
        
        # Calculate tax using new tax regime slabs (simplified)
        tax = 0
        if taxable_income > 300000:
            tax += min(taxable_income - 300000, 300000) * 0.05  # 3L-6L: 5%
        if taxable_income > 600000:
            tax += min(taxable_income - 600000, 300000) * 0.10  # 6L-9L: 10%
        if taxable_income > 900000:
            tax += min(taxable_income - 900000, 300000) * 0.15  # 9L-12L: 15%
        if taxable_income > 1200000:
            tax += min(taxable_income - 1200000, 300000) * 0.20  # 12L-15L: 20%
        if taxable_income > 1500000:
            tax += (taxable_income - 1500000) * 0.30  # 15L+: 30%
        
        # Add cess
        tax_with_cess = tax * 1.04
        
        # Apply rebate for income up to 7L
        if taxable_income <= 700000:
            tax_with_cess = 0
        
        return tax_with_cess
    
    def _get_field_suggestion(self, field_id: str, value: Any) -> str:
        """Get suggestion for field correction"""
        field = self.field_registry.get_field(field_id)
        if not field:
            return "Please check the field format"
        
        if field_id == "pan_number":
            return "PAN should be 10 characters: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)"
        elif field_id == "aadhaar_number":
            return "Aadhaar should be 12 digits (spaces allowed)"
        elif "income" in field_id or "deduction" in field_id:
            return "Please enter a valid positive number"
        else:
            return f"Please check the format for {field.label}"

def validate_form_data(form_id: str, form_data: Dict[str, Any]) -> List[str]:
    """Validate form data and return list of errors"""
    try:
        # Convert form_id to FormType
        form_type = FormType(form_id)
        
        # Create validation engine
        engine = TaxFormValidationEngine()
        
        # Validate form data
        result = engine.validate_form_data(form_type, form_data)
        
        # Return error messages
        return [error.error_message for error in result.errors]
        
    except ValueError:
        return [f"Unknown form type: {form_id}"]
    except Exception as e:
        return [f"Validation error: {str(e)}"]

# Global instance
validation_engine = TaxFormValidationEngine()
