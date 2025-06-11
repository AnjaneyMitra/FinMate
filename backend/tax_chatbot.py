import re
from typing import List

# Simple keyword-based sentence classification for Indian tax topics
TAX_CLASSES = {
    "slabs": ["tax slab", "income tax slab", "slab rate", "current slab"],
    "rebate": ["section 87a", "rebate", "tax rebate"],
    "deduction": ["deduction", "80c", "80d", "can i claim"],
    "filing": ["file return", "filing date", "due date", "ITR"],
    "old_vs_new": ["old regime", "new regime", "difference", "which regime"],
    "cess": ["cess", "education cess", "health cess"],
    "pan": ["pan card", "what is pan", "need pan"],
}

CLASS_ANSWERS = {
    "slabs": "For FY 2024-25 (new regime):\n0-3L: 0%\n3-6L: 5%\n6-9L: 10%\n9-12L: 15%\n12-15L: 20%\n15L+: 30%. 4% health & education cess applies.",
    "rebate": "Section 87A rebate: If your total income is up to ₹7 lakh, you pay zero tax after rebate.",
    "deduction": "Under the new regime, most deductions (like 80C, HRA) are not allowed. Only a few (like NPS employer contribution) are permitted.",
    "filing": "The usual due date for filing ITR is July 31st for individuals (unless extended by the government).",
    "old_vs_new": "The old regime allows deductions (like 80C, HRA), but the new regime has lower rates and no deductions. Most people now benefit from the new regime.",
    "cess": "Cess is an extra 4% tax on your calculated income tax, used for health and education.",
    "pan": "A PAN card is a Permanent Account Number, required for filing taxes and many financial transactions in India."
}

FAQS = [
    {
        "patterns": [r"how.*calculate.*tax", r"tax calculation", r"how much tax.*pay"],
        "answer": "You can calculate your tax using the new regime slabs. Add up tax for each slab, then add 4% cess. Use our /tax-breakdown API for details."
    },
    {
        "patterns": [r"when.*file.*return", r"due date.*filing", r"last date.*ITR"],
        "answer": "The usual due date for filing ITR is July 31st for individuals (unless extended by the government)."
    },
    # ...add more as needed...
]

def classify_tax_question(question: str) -> str:
    q = question.lower()
    for cls, keywords in TAX_CLASSES.items():
        for kw in keywords:
            if kw in q:
                return CLASS_ANSWERS[cls]
    # Fallback to FAQ pattern matching
    for faq in FAQS:
        for pat in faq["patterns"]:
            if re.search(pat, q):
                return faq["answer"]
    return "Sorry, I don't know the answer to that. Please ask about Indian income tax slabs, rebates, deductions, or related topics."

# Example usage:
# print(classify_tax_question("What are the current tax slabs?"))
