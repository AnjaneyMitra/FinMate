# filepath: /Applications/Vscode/FinMate/backend/tax_filing/__init__.py
"""
Tax Filing Module for Indian Tax Return Processing

This module provides comprehensive tax filing capabilities including:
- Form definitions and metadata (ITR-1, ITR-2, ITR-3, ITR-4)
- Field validation and business rules
- AI-powered assistance via Gemini
- Draft saving and submission tracking
"""

from .form_registry import (
    TaxFormRegistry,
    FormType,
    FormMetadata,
    tax_form_registry,
    get_all_forms,
    get_form_details
)

from .field_definitions import (
    TaxFieldRegistry,
    FieldDefinition,
    FieldType,
    ValidationRule,
    tax_field_registry
)

from .validation_engine import (
    TaxFormValidationEngine,
    ValidationResult,
    ValidationError,
    validation_engine,
    validate_form_data
)

from .gemini_tax_service import (
    GeminiTaxService,
    TaxQueryType,
    gemini_tax_service
)

from .gemini_form_search_service import (
    GeminiFormSearchService,
    FormSearchQuery,
    FormSearchResult,
    gemini_form_search_service
)

__all__ = [
    # Form Registry
    'TaxFormRegistry',
    'FormType', 
    'FormMetadata',
    'tax_form_registry',
    'get_all_forms',
    'get_form_details',
    
    # Field Definitions
    'TaxFieldRegistry',
    'FieldDefinition',
    'FieldType',
    'ValidationRule',
    'tax_field_registry',
    
    # Validation Engine
    'TaxFormValidationEngine',
    'ValidationResult',
    'ValidationError',
    'validation_engine',
    'validate_form_data',
    
    # Gemini Tax Service
    'GeminiTaxService',
    'TaxQueryType',
    'gemini_tax_service',
    
    # Gemini Form Search Service
    'GeminiFormSearchService',
    'FormSearchQuery',
    'FormSearchResult',
    'gemini_form_search_service'
]