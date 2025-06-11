from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

import models, database
from models import Expense, User
import os
import requests
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from pydantic import BaseModel
from typing import Optional, List
from tax_chatbot import classify_tax_question
from expense_classifier import predict_expense_category
from expense_forecast import forecast_expense_trend
from spending_analysis_service import SpendingAnalysisService

app = FastAPI()

# Create the database tables on startup
@app.on_event("startup")
def startup():
    models.Base.metadata.create_all(bind=database.engine)

# Dependency to get the database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return JSONResponse(content={"status": "ok"})

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "YOUR_FIREBASE_PROJECT_ID")
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY", "YOUR_FIREBASE_API_KEY")
FIREBASE_AUTH_DOMAIN = os.getenv("FIREBASE_AUTH_DOMAIN", "YOUR_FIREBASE_AUTH_DOMAIN")
FIREBASE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"

bearer_scheme = HTTPBearer()

# Cache for public keys
FIREBASE_PUBLIC_KEYS = None
FIREBASE_KEYS_EXP = 0

import time

def get_firebase_public_keys():
    global FIREBASE_PUBLIC_KEYS, FIREBASE_KEYS_EXP
    if FIREBASE_PUBLIC_KEYS and FIREBASE_KEYS_EXP > time.time():
        return FIREBASE_PUBLIC_KEYS
    resp = requests.get(FIREBASE_CERTS_URL)
    FIREBASE_PUBLIC_KEYS = resp.json()
    # Set cache expiration to 1 hour
    FIREBASE_KEYS_EXP = time.time() + 3600
    return FIREBASE_PUBLIC_KEYS

def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    try:
        # Get unverified header to find key id
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header["kid"]
        public_keys = get_firebase_public_keys()
        if kid not in public_keys:
            raise HTTPException(status_code=401, detail="Invalid auth key.")
        public_key = public_keys[kid]
        decoded_token = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=FIREBASE_PROJECT_ID,
            issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}"
        )
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials.")

@app.get("/protected")
def protected_route(user=Depends(verify_firebase_token)):
    return {"message": f"Hello, {user['user_id']}! This is a protected route."}

class SimulationInput(BaseModel):
    type: str  # 'stock', 'sip', or 'mutual_fund'
    amount: float
    duration_years: int
    expected_return: Optional[float] = None

@app.post("/simulate")
def simulate(input: SimulationInput):
    # Dummy simulation logic
    if input.type == "stock":
        result = {
            "type": "stock",
            "final_value": round(input.amount * 1.5, 2),
            "details": "Simulated stock investment with 50% gain."
        }
    elif input.type == "sip":
        result = {
            "type": "sip",
            "final_value": round(input.amount * input.duration_years * 1.2, 2),
            "details": f"Simulated SIP for {input.duration_years} years with 20% total gain."
        }
    elif input.type == "mutual_fund":
        result = {
            "type": "mutual_fund",
            "final_value": round(input.amount * 1.3, 2),
            "details": "Simulated mutual fund investment with 30% gain."
        }
    else:
        result = {"error": "Invalid simulation type."}
    return result

class TaxInput(BaseModel):
    ctc: float

@app.post("/tax-breakdown")
def tax_breakdown(input: TaxInput):
    ctc = input.ctc
    # FY 2024-25 New Regime slabs (no deductions, for individuals <60 years)
    slabs = [
        {"label": "0-3L", "limit": 300000, "rate": 0.0},
        {"label": "3L-6L", "limit": 600000, "rate": 0.05},
        {"label": "6L-9L", "limit": 900000, "rate": 0.10},
        {"label": "9L-12L", "limit": 1200000, "rate": 0.15},
        {"label": "12L-15L", "limit": 1500000, "rate": 0.20},
        {"label": "15L+", "limit": float('inf'), "rate": 0.30},
    ]
    prev_limit = 0
    remaining = ctc
    breakdown = []
    total_tax = 0
    for slab in slabs:
        if remaining <= 0:
            break
        taxable = min(remaining, slab["limit"] - prev_limit)
        tax = taxable * slab["rate"]
        breakdown.append({
            "slab": slab["label"],
            "taxable": taxable,
            "rate": slab["rate"],
            "tax": tax
        })
        total_tax += tax
        remaining -= taxable
        prev_limit = slab["limit"]
    # Rebate under section 87A for income up to 7L
    if ctc <= 700000:
        total_tax = 0
        for b in breakdown:
            b["tax"] = 0
    # Add 4% health & education cess
    cess = total_tax * 0.04
    total_tax_with_cess = total_tax + cess
    return {
        "ctc": ctc,
        "total_tax": round(total_tax, 2),
        "cess": round(cess, 2),
        "total_tax_with_cess": round(total_tax_with_cess, 2),
        "breakdown": [
            {"slab": b["slab"], "taxable": round(b["taxable"], 2), "rate": b["rate"], "tax": round(b["tax"], 2)}
            for b in breakdown
        ]
    }

class ChatbotInput(BaseModel):
    question: str

@app.post("/tax-chatbot")
def tax_chatbot(input: ChatbotInput):
    answer = classify_tax_question(input.question)
    return {"answer": answer}

class BudgetInput(BaseModel):
    income: float
    goals: str
    location: str

@app.post("/budget-suggestion")
def budget_suggestion(input: BudgetInput):
    # Simple heuristic: 50% essentials, 20% savings, 30% discretionary
    essentials_pct = 0.5
    savings_pct = 0.2
    discretionary_pct = 0.3
    # Optionally, tweak based on location or goals
    loc = input.location.lower()
    if "mumbai" in loc or "delhi" in loc or "bangalore" in loc:
        essentials_pct = 0.55  # higher cost of living
        discretionary_pct = 0.25
        savings_pct = 0.2
    if "retire" in input.goals.lower() or "early" in input.goals.lower():
        savings_pct += 0.05
        discretionary_pct -= 0.05
    essentials = round(input.income * essentials_pct)
    savings = round(input.income * savings_pct)
    discretionary = round(input.income * discretionary_pct)
    # Adjust rounding errors
    total = essentials + savings + discretionary
    diff = round(input.income) - total
    essentials += diff  # assign any rounding difference to essentials
    return {
        "essentials": essentials,
        "savings": savings,
        "discretionary": discretionary
    }

class ZMIInput(BaseModel):
    ctc: float

@app.post("/zmi-summary")
def zmi_summary(input: ZMIInput):
    ctc = input.ctc
    # Example ZMI logic (user can adjust as needed):
    zero = 0  # Zero savings scenario
    minimum = round(ctc * 0.10)  # 10% of CTC as minimum savings
    ideal = round(ctc * 0.20)    # 20% of CTC as ideal savings
    return {
        "ctc": ctc,
        "zmi": {
            "zero": zero,
            "minimum": minimum,
            "ideal": ideal
        },
        "links": {
            "tax_breakdown": "/tax-breakdown",
            "budget_suggestion": "/budget-suggestion"
        }
    }

class ExpenseCategoryInput(BaseModel):
    description: str

@app.post("/predict-expense-category")
def predict_expense_category_route(input: ExpenseCategoryInput):
    category = predict_expense_category(input.description)
    return {"category": category}

class ExpenseRecord(BaseModel):
    date: str  # ISO format date
    amount: float
    category: str

class ForecastInput(BaseModel):
    category: str
    expenses: List[ExpenseRecord]

@app.post("/forecast-expenses")
def forecast_expenses(input: ForecastInput):
    # Filter expenses for the requested category
    filtered = [e.dict() for e in input.expenses if e.category.lower() == input.category.lower()]
    if not filtered or len(filtered) < 3:
        return {"error": "Not enough data for forecasting."}
    # Prepare data for Prophet
    import pandas as pd
    from prophet import Prophet
    df = pd.DataFrame(filtered)
    df['date'] = pd.to_datetime(df['date'])
    df = df.groupby(pd.Grouper(key='date', freq='M')).sum().reset_index()
    df = df.rename(columns={'date': 'ds', 'amount': 'y'})
    model = Prophet(yearly_seasonality=False, daily_seasonality=False, weekly_seasonality=False)
    model.fit(df)
    future = model.make_future_dataframe(periods=3, freq='M')
    forecast = model.predict(future)
    # Get only the next 3 months
    next_months = forecast[['ds', 'yhat']].tail(3)
    result = [
        {"month": row['ds'].strftime('%Y-%m'), "predicted_amount": round(row['yhat'], 2)}
        for _, row in next_months.iterrows()
    ]
    return {"category": input.category, "forecast": result}

# Spending Analysis Endpoints
@app.get("/api/spending/summary/{user_id}")
async def get_spending_summary(
    user_id: str, 
    period: str = "month",
    db: Session = Depends(get_db)
):
    """
    Get comprehensive spending summary for a user
    
    Parameters:
    - user_id: User identifier
    - period: Analysis period (week, month, quarter, year)
    """
    try:
        analysis_service = SpendingAnalysisService(db)
        summary = analysis_service.get_spending_summary(user_id, period)
        return {"status": "success", "data": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/spending/insights/{user_id}")
async def get_spending_insights(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Generate personalized spending insights and recommendations
    """
    try:
        analysis_service = SpendingAnalysisService(db)
        insights = analysis_service.generate_insights(user_id)
        return {"status": "success", "insights": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {str(e)}")

@app.get("/api/spending/budget-analysis/{user_id}")
async def get_budget_analysis(
    user_id: str,
    monthly_budget: float,
    db: Session = Depends(get_db)
):
    """
    Analyze spending against budget and provide recommendations
    """
    try:
        analysis_service = SpendingAnalysisService(db)
        budget_analysis = analysis_service.get_budget_analysis(user_id, monthly_budget)
        return {"status": "success", "data": budget_analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Budget analysis failed: {str(e)}")

@app.post("/api/spending/categorize")
async def categorize_expense(
    description: str,
    amount: float,
    merchant: str = None
):
    """
    Automatically categorize an expense based on description and amount
    """
    try:
        from expense_classifier import predict_expense_category
        category = predict_expense_category(description)
        
        # Enhanced categorization logic
        confidence = 0.8  # Base confidence
        
        # Adjust confidence based on amount and patterns
        if amount > 10000:
            category_hints = {
                "rent": ["rent", "housing", "apartment"],
                "medical": ["hospital", "doctor", "pharmacy"],
                "travel": ["flight", "hotel", "booking"]
            }
            
            for cat, keywords in category_hints.items():
                if any(keyword in description.lower() for keyword in keywords):
                    category = cat
                    confidence = 0.95
                    break
        
        return {
            "status": "success",
            "category": category,
            "confidence": confidence,
            "suggestions": get_category_suggestions(description, amount)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Categorization failed: {str(e)}")

def get_category_suggestions(description: str, amount: float) -> List[str]:
    """Get category suggestions based on description and amount patterns"""
    suggestions = []
    desc_lower = description.lower()
    
    # Amount-based suggestions
    if amount < 100:
        suggestions.extend(["food", "transport", "utilities"])
    elif amount < 1000:
        suggestions.extend(["shopping", "entertainment", "groceries"])
    elif amount < 5000:
        suggestions.extend(["electronics", "clothing", "dining"])
    else:
        suggestions.extend(["rent", "travel", "medical", "education"])
    
    # Description-based suggestions
    food_keywords = ["restaurant", "cafe", "food", "zomato", "swiggy"]
    transport_keywords = ["uber", "ola", "taxi", "metro", "bus"]
    shopping_keywords = ["amazon", "flipkart", "mall", "store"]
    
    if any(keyword in desc_lower for keyword in food_keywords):
        suggestions.insert(0, "food")
    elif any(keyword in desc_lower for keyword in transport_keywords):
        suggestions.insert(0, "transport")
    elif any(keyword in desc_lower for keyword in shopping_keywords):
        suggestions.insert(0, "shopping")
    
    return list(dict.fromkeys(suggestions))  # Remove duplicates while preserving order

@app.get("/api/spending/trends/{user_id}")
async def get_spending_trends(
    user_id: str,
    category: str = None,
    time_range: str = "3months",
    db: Session = Depends(get_db)
):
    """
    Get spending trends over time, optionally filtered by category
    """
    try:
        # Time range mapping
        days_map = {
            "1month": 30,
            "3months": 90,
            "6months": 180,
            "1year": 365
        }
        
        days = days_map.get(time_range, 90)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Query expenses
        query = db.query(Expense).filter(
            Expense.user_id == user_id,
            Expense.timestamp >= start_date,
            Expense.timestamp <= end_date
        )
        
        if category:
            query = query.filter(Expense.category == category)
            
        expenses = query.all()
        
        if not expenses:
            return {"status": "success", "trends": [], "summary": {}}
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame([{
            'date': exp.timestamp.date(),
            'amount': exp.amount,
            'category': exp.category or 'uncategorized'
        } for exp in expenses])
        
        # Group by date and calculate daily totals
        daily_totals = df.groupby('date')['amount'].sum().reset_index()
        daily_totals['date'] = daily_totals['date'].astype(str)
        
        # Calculate trend metrics
        amounts = daily_totals['amount'].values
        trend_slope = np.polyfit(range(len(amounts)), amounts, 1)[0] if len(amounts) > 1 else 0
        
        trends_data = daily_totals.to_dict('records')
        
        summary = {
            "total_amount": float(df['amount'].sum()),
            "average_daily": float(df['amount'].sum() / max(1, days)),
            "trend_direction": "increasing" if trend_slope > 0 else "decreasing",
            "trend_strength": abs(float(trend_slope)),
            "peak_day": daily_totals.loc[daily_totals['amount'].idxmax(), 'date'] if len(daily_totals) > 0 else None,
            "lowest_day": daily_totals.loc[daily_totals['amount'].idxmin(), 'date'] if len(daily_totals) > 0 else None
        }
        
        return {
            "status": "success",
            "trends": trends_data,
            "summary": summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trends analysis failed: {str(e)}")
