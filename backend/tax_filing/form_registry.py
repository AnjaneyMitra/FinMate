from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

# Import after class definitions to avoid circular imports
def _get_field_registry():
    from .field_definitions import tax_field_registry, ValidationRule
    return tax_field_registry, ValidationRule

class FormType(Enum):
    # Income Tax Return Forms
    ITR1 = "ITR-1"
    ITR2 = "ITR-2" 
    ITR3 = "ITR-3"
    ITR4 = "ITR-4"
    ITR5 = "ITR-5"
    ITR6 = "ITR-6"
    ITR7 = "ITR-7"
    
    # TDS Return Forms
    TDS_24Q = "24Q"
    TDS_26Q = "26Q"
    TDS_27Q = "27Q"
    TDS_27EQ = "27EQ"
    
    # Advance Tax Forms
    CHALLAN_280 = "CHALLAN-280"
    
    # PAN Forms
    PAN_49A = "49A"
    PAN_49AA = "49AA"
    
    # Other Important Forms
    FORM_15G = "15G"
    FORM_15H = "15H"
    FORM_16 = "16"
    FORM_16A = "16A"

class FormCategory(Enum):
    INCOME_TAX_RETURNS = "income_tax_returns"
    TDS_RETURNS = "tds_returns" 
    ADVANCE_TAX = "advance_tax"
    PAN_FORMS = "pan_forms"
    CERTIFICATE_FORMS = "certificate_forms"
    ALL_FORMS = "all_forms"

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
    category: FormCategory
    difficulty_level: str  # "beginner", "intermediate", "advanced"
    estimated_time: int  # in minutes
    eligibility: FormEligibility
    sections: List[str]
    required_documents: List[str]
    common_deductions: List[str]
    official_pdf_link: str  # Official government PDF download link
    online_filing_link: str  # Official online filing portal link
    help_guide_link: Optional[str] = None  # Official help/instruction link
    is_popular: bool = False
    filing_deadline: Optional[str] = None  # Filing deadline information
    applicable_assessment_year: str = "2025-26"  # Current assessment year

class TaxFormRegistry:
    """Registry for all Indian tax forms and their properties"""
    
    def __init__(self):
        self.forms = self._initialize_forms()
    
    def _initialize_forms(self) -> Dict[FormType, FormMetadata]:
        """Initialize all tax forms with their metadata"""
        return {
            # Income Tax Return Forms
            FormType.ITR1: FormMetadata(
                form_type=FormType.ITR1,
                name="ITR-1 (Sahaj)",
                description="For individuals with salary income, one house property, and other sources up to ₹50 lakhs",
                category=FormCategory.INCOME_TAX_RETURNS,
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
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-05/ITR1_AY_25-26_V1.0.zip",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/login",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/individual/itr-1-sahaj",
                filing_deadline="September 15, 2025",
                is_popular=True
            ),
            
            FormType.ITR2: FormMetadata(
                form_type=FormType.ITR2,
                name="ITR-2",
                description="For individuals and HUFs with capital gains, multiple house properties, or foreign assets",
                category=FormCategory.INCOME_TAX_RETURNS,
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
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-05/ITR-2_AY_2025-26.pdf",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/login",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/individual/itr-2",
                filing_deadline="September 15, 2025",
                is_popular=True
            ),
            
            FormType.ITR3: FormMetadata(
                form_type=FormType.ITR3,
                name="ITR-3",
                description="For individuals with business/professional income",
                category=FormCategory.INCOME_TAX_RETURNS,
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
                ],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/ITR-3_AY_2024-25.pdf",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/login",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/individual/itr-3",
                filing_deadline="September 15, 2025"
            ),
            
            FormType.ITR4: FormMetadata(
                form_type=FormType.ITR4,
                name="ITR-4 (Sugam)",
                description="For presumptive income from business and profession",
                category=FormCategory.INCOME_TAX_RETURNS,
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
                ],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-05/ITR4_AY_25-26_V1.0_0.zip",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/login",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/individual/itr-4-sugam",
                filing_deadline="September 15, 2025"
            ),
            
            # Additional ITR Forms
            FormType.ITR5: FormMetadata(
                form_type=FormType.ITR5,
                name="ITR-5",
                description="For partnership firms, LLPs, AOPs, and BOIs",
                category=FormCategory.INCOME_TAX_RETURNS,
                difficulty_level="advanced",
                estimated_time=120,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.BUSINESS],
                    additional_conditions=[
                        "Partnership firms",
                        "Limited Liability Partnerships",
                        "Association of Persons",
                        "Body of Individuals"
                    ]
                ),
                sections=[
                    "Entity Information",
                    "Income Details",
                    "Business Income",
                    "Deductions",
                    "Tax Computation"
                ],
                required_documents=[
                    "Partnership deed",
                    "Audited accounts",
                    "Registration documents"
                ],
                common_deductions=[
                    "Business expenses",
                    "Depreciation"
                ],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/ITR-5_AY_2024-25.pdf",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/login",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/business/itr-5",
                filing_deadline="September 15, 2025"
            ),
            
            FormType.ITR6: FormMetadata(
                form_type=FormType.ITR6,
                name="ITR-6",
                description="For companies other than companies claiming exemption under section 11",
                category=FormCategory.INCOME_TAX_RETURNS,
                difficulty_level="advanced",
                estimated_time=180,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.BUSINESS],
                    additional_conditions=[
                        "Companies (except those under section 11)",
                        "Corporate entities"
                    ]
                ),
                sections=[
                    "Company Information",
                    "Income Details",
                    "Business Income",
                    "Deductions",
                    "Tax Computation"
                ],
                required_documents=[
                    "Audited financial statements",
                    "Board resolutions",
                    "Company registration documents"
                ],
                common_deductions=[
                    "Business expenses",
                    "Depreciation",
                    "Corporate tax deductions"
                ],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/ITR-6_AY_2024-25.pdf",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/login",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/business/itr-6",
                filing_deadline="September 15, 2025"
            ),
            
            FormType.ITR7: FormMetadata(
                form_type=FormType.ITR7,
                name="ITR-7",
                description="For entities including charitable trusts, political parties, etc.",
                category=FormCategory.INCOME_TAX_RETURNS,
                difficulty_level="advanced",
                estimated_time=150,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.OTHER_SOURCES],
                    additional_conditions=[
                        "Charitable trusts",
                        "Political parties",
                        "Institutions eligible for exemption"
                    ]
                ),
                sections=[
                    "Entity Information",
                    "Exempt Income",
                    "Other Income",
                    "Deductions",
                    "Tax Computation"
                ],
                required_documents=[
                    "Trust deed",
                    "Registration certificates",
                    "Audit reports"
                ],
                common_deductions=[
                    "Charitable deductions",
                    "Administrative expenses"
                ],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/ITR-7_AY_2024-25.pdf",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/login",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/trust/itr-7",
                filing_deadline="September 15, 2025"
            ),
            
            # TDS Return Forms
            FormType.TDS_24Q: FormMetadata(
                form_type=FormType.TDS_24Q,
                name="Form 24Q",
                description="TDS return for tax deducted on salary payments",
                category=FormCategory.TDS_RETURNS,
                difficulty_level="intermediate",
                estimated_time=60,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.SALARY],
                    additional_conditions=[
                        "Employers deducting TDS on salary",
                        "Companies with employees"
                    ]
                ),
                sections=[
                    "Deductor Information",
                    "Employee Details",
                    "TDS Details",
                    "Challan Information"
                ],
                required_documents=[
                    "Salary registers",
                    "TDS challans",
                    "Employee PAN details"
                ],
                common_deductions=[],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/Form_24Q.pdf",
                online_filing_link="https://onlineservices.tin.egov-nsdl.com/etaxnew/tdsnontds.jsp",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/tds/form-24q",
                filing_deadline="Quarterly"
            ),
            
            FormType.TDS_26Q: FormMetadata(
                form_type=FormType.TDS_26Q,
                name="Form 26Q",
                description="TDS return for tax deducted on non-salary payments",
                category=FormCategory.TDS_RETURNS,
                difficulty_level="intermediate",
                estimated_time=60,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.OTHER_SOURCES],
                    additional_conditions=[
                        "TDS on professional fees",
                        "TDS on rent",
                        "TDS on interest"
                    ]
                ),
                sections=[
                    "Deductor Information",
                    "Deductee Details",
                    "TDS Details",
                    "Challan Information"
                ],
                required_documents=[
                    "Payment vouchers",
                    "TDS challans",
                    "Deductee PAN details"
                ],
                common_deductions=[],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/Form_26Q.pdf",
                online_filing_link="https://onlineservices.tin.egov-nsdl.com/etaxnew/tdsnontds.jsp",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/tds/form-26q",
                filing_deadline="Quarterly"
            ),
            
            # Certificate Forms
            FormType.FORM_15G: FormMetadata(
                form_type=FormType.FORM_15G,
                name="Form 15G",
                description="Declaration for non-deduction of TDS (for individuals below 60 years)",
                category=FormCategory.CERTIFICATE_FORMS,
                difficulty_level="beginner",
                estimated_time=15,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.OTHER_SOURCES],
                    additional_conditions=[
                        "Age below 60 years",
                        "Income below taxable limit",
                        "To avoid TDS deduction"
                    ]
                ),
                sections=[
                    "Personal Information",
                    "Income Declaration",
                    "Tax Computation"
                ],
                required_documents=[
                    "PAN Card",
                    "Income proof"
                ],
                common_deductions=[],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/Form_15G.pdf",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/pre-login/form15G",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/individual/form-15g",
                filing_deadline="As required"
            ),
            
            FormType.FORM_15H: FormMetadata(
                form_type=FormType.FORM_15H,
                name="Form 15H",
                description="Declaration for non-deduction of TDS (for individuals above 60 years)",
                category=FormCategory.CERTIFICATE_FORMS,
                difficulty_level="beginner",
                estimated_time=15,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.OTHER_SOURCES],
                    additional_conditions=[
                        "Age above 60 years",
                        "Income below taxable limit",
                        "To avoid TDS deduction"
                    ]
                ),
                sections=[
                    "Personal Information",
                    "Income Declaration",
                    "Tax Computation"
                ],
                required_documents=[
                    "PAN Card",
                    "Age proof",
                    "Income proof"
                ],
                common_deductions=[],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/Form_15H.pdf",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/pre-login/form15H",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/individual/form-15h",
                filing_deadline="As required"
            ),

            # Additional TDS Forms
            FormType.TDS_27Q: FormMetadata(
                form_type=FormType.TDS_27Q,
                name="Form 27Q",
                description="TDS return for tax deducted on payments to non-residents",
                category=FormCategory.TDS_RETURNS,
                difficulty_level="advanced",
                estimated_time=90,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.OTHER_SOURCES],
                    additional_conditions=[
                        "Payments to non-residents",
                        "Foreign remittances",
                        "Export/import business"
                    ]
                ),
                sections=[
                    "Deductor Information",
                    "Non-resident Details",
                    "TDS Details",
                    "Challan Information",
                    "Foreign Tax Credit"
                ],
                required_documents=[
                    "Non-resident certificates",
                    "Payment vouchers",
                    "TDS challans",
                    "DTAA certificates"
                ],
                common_deductions=[],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/Form_27Q.pdf",
                online_filing_link="https://onlineservices.tin.egov-nsdl.com/etaxnew/tdsnontds.jsp",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/tds/form-27q",
                filing_deadline="Quarterly"
            ),

            FormType.TDS_27EQ: FormMetadata(
                form_type=FormType.TDS_27EQ,
                name="Form 27EQ",
                description="TCS (Tax Collected at Source) return for tax collected at source",
                category=FormCategory.TDS_RETURNS,
                difficulty_level="intermediate",
                estimated_time=60,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.BUSINESS],
                    additional_conditions=[
                        "Collection of tax at source",
                        "Sale of goods/services",
                        "Export business"
                    ]
                ),
                sections=[
                    "Collector Information",
                    "Collectee Details",
                    "TCS Details",
                    "Challan Information"
                ],
                required_documents=[
                    "Sale invoices",
                    "TCS challans",
                    "Collectee details"
                ],
                common_deductions=[],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/Form_27EQ.pdf",
                online_filing_link="https://onlineservices.tin.egov-nsdl.com/etaxnew/tdsnontds.jsp",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/tds/form-27eq",
                filing_deadline="Quarterly"
            ),

            # PAN Forms
            FormType.PAN_49A: FormMetadata(
                form_type=FormType.PAN_49A,
                name="Form 49A",
                description="Application for allotment of Permanent Account Number (PAN) - Indian citizens",
                category=FormCategory.PAN_FORMS,
                difficulty_level="beginner",
                estimated_time=25,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.OTHER_SOURCES],
                    additional_conditions=[
                        "Indian citizens",
                        "First-time PAN application",
                        "Individual applicants"
                    ]
                ),
                sections=[
                    "Personal Details",
                    "Identity Information",
                    "Address Details",
                    "Contact Information"
                ],
                required_documents=[
                    "Identity proof",
                    "Address proof",
                    "Date of birth proof",
                    "Passport size photograph"
                ],
                common_deductions=[],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/Form_49A.pdf",
                online_filing_link="https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/pan/form-49a",
                filing_deadline="As required"
            ),

            FormType.PAN_49AA: FormMetadata(
                form_type=FormType.PAN_49AA,
                name="Form 49AA",
                description="Application for allotment of PAN - Foreign citizens and entities",
                category=FormCategory.PAN_FORMS,
                difficulty_level="intermediate",
                estimated_time=35,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.OTHER_SOURCES],
                    additional_conditions=[
                        "Foreign citizens",
                        "Foreign entities",
                        "Non-resident Indians"
                    ]
                ),
                sections=[
                    "Personal/Entity Details",
                    "Identity Information",
                    "Address Details",
                    "Representative Details"
                ],
                required_documents=[
                    "Passport copy",
                    "Overseas address proof",
                    "Representative authorization",
                    "Entity registration documents"
                ],
                common_deductions=[],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/Form_49AA.pdf",
                online_filing_link="https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/pan/form-49aa",
                filing_deadline="As required"
            ),

            # Certificate Forms
            FormType.FORM_16: FormMetadata(
                form_type=FormType.FORM_16,
                name="Form 16",
                description="Certificate of deduction of tax at source on salary",
                category=FormCategory.CERTIFICATE_FORMS,
                difficulty_level="beginner",
                estimated_time=10,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.SALARY],
                    additional_conditions=[
                        "Salary earners",
                        "TDS deducted on salary",
                        "Employer provided certificate"
                    ]
                ),
                sections=[
                    "Employer Details",
                    "Employee Details",
                    "Salary Breakup",
                    "TDS Details"
                ],
                required_documents=[
                    "Salary slips",
                    "Investment declarations",
                    "Employee PAN"
                ],
                common_deductions=[],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/Form_16.pdf",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/login",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/tds/form-16",
                filing_deadline="By June 15"
            ),

            FormType.FORM_16A: FormMetadata(
                form_type=FormType.FORM_16A,
                name="Form 16A",
                description="Certificate of deduction of tax at source on non-salary payments",
                category=FormCategory.CERTIFICATE_FORMS,
                difficulty_level="beginner",
                estimated_time=10,
                eligibility=FormEligibility(
                    income_sources=[IncomeSource.OTHER_SOURCES],
                    additional_conditions=[
                        "Non-salary income",
                        "TDS deducted on payments",
                        "Professional fees, rent, etc."
                    ]
                ),
                sections=[
                    "Deductor Details",
                    "Deductee Details",
                    "Payment Details",
                    "TDS Details"
                ],
                required_documents=[
                    "Payment receipts",
                    "Service bills/invoices",
                    "Deductee PAN"
                ],
                common_deductions=[],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/Form_16A.pdf",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/login",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/tds/form-16a",
                filing_deadline="By June 15"
            ),

            # Advance Tax
            FormType.CHALLAN_280: FormMetadata(
                form_type=FormType.CHALLAN_280,
                name="Challan 280",
                description="Challan for payment of advance tax and self-assessment tax",
                category=FormCategory.ADVANCE_TAX,
                difficulty_level="intermediate",
                estimated_time=20,
                eligibility=FormEligibility(
                    income_sources=[
                        IncomeSource.BUSINESS,
                        IncomeSource.CAPITAL_GAINS,
                        IncomeSource.OTHER_SOURCES
                    ],
                    additional_conditions=[
                        "Advance tax liability",
                        "Self-assessment tax",
                        "Income not subject to TDS"
                    ]
                ),
                sections=[
                    "Taxpayer Details",
                    "Tax Calculation",
                    "Payment Details",
                    "Bank Information"
                ],
                required_documents=[
                    "PAN Card",
                    "Income computation",
                    "Bank account details"
                ],
                common_deductions=[],
                official_pdf_link="https://www.incometax.gov.in/iec/foportal/sites/default/files/2024-04/Challan_280.pdf",
                online_filing_link="https://eportal.incometax.gov.in/iec/foservices/#/e-pay-tax-prelogin/user-details",
                help_guide_link="https://www.incometax.gov.in/iec/foportal/help/advance-tax/challan-280",
                filing_deadline="Quarterly installments"
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