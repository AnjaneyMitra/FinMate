from fastapi import FastAPI, Depends, Header, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from contextlib import asynccontextmanager
from dotenv import load_dotenv

import models, database
from models import Expense, User, BankStatementUploadResponse, TransactionImportRequest, TransactionImportResponse, SupportedBankInfo
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
from firestore_service import FirestoreService
from gemini_content_service import gemini_service, UserProfile, ContentRequest
from bank_statement_parser import BankStatementParser
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize services
try:
    firestore_service = FirestoreService()
    print("✅ Firestore service initialized successfully")
except Exception as e:
    print(f"⚠️  Firestore service initialization failed: {e}")
    print("📝 The app will use mock data for AI features")
    firestore_service = None

# Initialize bank statement parser
try:
    bank_parser = BankStatementParser()
    print("✅ Bank statement parser initialized successfully")
except Exception as e:
    print(f"⚠️  Bank statement parser initialization failed: {e}")
    bank_parser = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create the database tables
    models.Base.metadata.create_all(bind=database.engine)
    
    # Test Firestore connection on startup
    if firestore_service and firestore_service.db:
        try:
            # Simple test query to verify connection
            test_doc = firestore_service.db.collection('test').limit(1).get()
            print("✅ Firestore connection verified")
        except Exception as e:
            print(f"⚠️  Firestore connection test failed: {e}")
    
    yield
    # Shutdown: Add any cleanup code here if needed
    pass

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

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
            print(f"[Auth] Invalid key id: {kid}")
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
        print(f"[Auth] Token verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials.")

def optional_firebase_token(authorization: str = Header(None)):
    """Optional authentication - returns user info if token is provided and valid, None otherwise"""
    if not authorization or not authorization.startswith("Bearer "):
        print("[Auth] No authorization header provided")
        return None
    
    try:
        token = authorization.split(" ")[1]
        print(f"[Auth] Received token: {token[:20]}...")
        
        # For development/demo purposes, if Firebase env vars are not configured,
        # we'll use a simplified token validation
        if FIREBASE_PROJECT_ID == "YOUR_FIREBASE_PROJECT_ID":
            print("[Auth] Firebase not configured, using simplified validation")
            # Simple token validation for demo - in production, use proper Firebase validation
            if len(token) > 20:  # Basic token format check
                return {
                    'user_id': 'demo_user_' + token[-8:],  # Extract last 8 chars as user ID
                    'email': 'demo@example.com'
                }
            else:
                return None
        
        # Proper Firebase token verification when configured
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header["kid"]
        public_keys = get_firebase_public_keys()
        if kid not in public_keys:
            print(f"[Auth] Invalid key id: {kid}")
            return None
        public_key = public_keys[kid]
        decoded_token = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=FIREBASE_PROJECT_ID,
            issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}"
        )
        print(f"[Auth] Successfully verified token for user: {decoded_token.get('user_id', 'unknown')}")
        return decoded_token
    except Exception as e:
        print(f"[Auth] Optional token verification failed: {e}")
        return None

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

@app.post("/forecast-expenses-with-data")
def forecast_expenses_with_data(input: ForecastInput):
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

# New Forecast Input Model for frontend compatibility
class ForecastRequestInput(BaseModel):
    timeframe: int  # Number of months to forecast
    category: Optional[str] = None  # Specific category or None for all

@app.post("/forecast-expenses")
def forecast_expenses_new(input: ForecastRequestInput, user=Depends(optional_firebase_token)):
    """
    Generate expense forecasts for the specified timeframe and category using actual user data from Firestore.
    Falls back to mock data if insufficient historical data is available.
    """
    try:
        # Try to use Firestore data for authenticated users
        if user and firestore_service and firestore_service.db:
            try:
                user_id = user['user_id']
                print(f"[Forecast] Attempting to use Firestore data for user: {user_id}")
                
                # Get historical data from Firestore
                end_date = datetime.now()
                start_date = end_date - timedelta(days=365)  # Get last year of data
                
                historical_expenses = firestore_service.get_user_expenses(
                    user_id=user_id,
                    start_date=start_date,
                    end_date=end_date,
                    category=input.category if input.category != "all" else None
                )
                
                # Check if we have sufficient data for forecasting
                if len(historical_expenses) >= 10:  # Minimum data requirement
                    print(f"[Forecast] Using {len(historical_expenses)} historical transactions")
                    
                    # Process historical data for forecasting
                    monthly_data = {}
                    for expense in historical_expenses:
                        month_key = expense.get('month', expense.get('date', '').split('-')[:2])
                        if isinstance(month_key, list):
                            month_key = '-'.join(month_key)
                        
                        if month_key not in monthly_data:
                            monthly_data[month_key] = 0
                        monthly_data[month_key] += expense.get('amount', 0)
                    
                    # Calculate forecast based on historical trends
                    monthly_amounts = list(monthly_data.values())
                    avg_monthly = sum(monthly_amounts) / len(monthly_amounts) if monthly_amounts else 1500
                    
                    # Add some trend analysis
                    if len(monthly_amounts) >= 3:
                        recent_avg = sum(monthly_amounts[-3:]) / 3
                        trend_factor = recent_avg / avg_monthly if avg_monthly > 0 else 1.0
                    else:
                        trend_factor = 1.0
                    
                    # Generate forecast
                    forecast_data = []
                    for i in range(input.timeframe):
                        # Apply trend and seasonal variation
                        seasonal_factor = 1.0 + 0.1 * np.sin(2 * np.pi * i / 12)  # Seasonal pattern
                        predicted_amount = avg_monthly * trend_factor * seasonal_factor
                        
                        future_date = datetime.now() + timedelta(days=30 * (i + 1))
                        forecast_data.append({
                            "date": future_date.strftime("%Y-%m-%d"),
                            "period": future_date.strftime("%Y-%m"),
                            "predicted_amount": round(predicted_amount, 2),
                            "category": input.category if input.category != "all" else "all",
                            "confidence": round(min(0.95, 0.7 + (len(monthly_amounts) / 24)), 2)
                        })
                    
                    # Generate category breakdown from historical data
                    category_breakdown = {}
                    if input.category == "all" or input.category is None:
                        category_totals = {}
                        for expense in historical_expenses:
                            cat = expense.get('category', 'other').lower()
                            category_totals[cat] = category_totals.get(cat, 0) + expense.get('amount', 0)
                        
                        # Scale to predicted monthly amounts
                        total_historical = sum(category_totals.values())
                        avg_predicted = sum(item["predicted_amount"] for item in forecast_data) / len(forecast_data)
                        
                        for cat, total in category_totals.items():
                            if total_historical > 0:
                                category_breakdown[cat] = round((total / total_historical) * avg_predicted, 2)
                    else:
                        category_breakdown[input.category] = sum(item["predicted_amount"] for item in forecast_data)
                    
                    return {
                        "forecast": forecast_data,
                        "category_breakdown": category_breakdown,
                        "model_accuracy": round(min(0.95, 0.75 + (len(historical_expenses) / 100)), 3),
                        "data_source": "firestore",
                        "message": f"Forecast based on {len(historical_expenses)} historical transactions",
                        "user_authenticated": True
                    }
                else:
                    print(f"[Forecast] Insufficient Firestore data ({len(historical_expenses)} transactions), using enhanced mock data")
                    
            except Exception as e:
                print(f"[Forecast] Firestore error: {e}, falling back to mock data")
        
        # Generate mock forecast data for non-authenticated users or when Firestore fails
        import random
        forecast_data = []
        base_amount = 1500  # Base monthly amount
        
        # Add some user-specific variation if authenticated
        if user:
            user_id_hash = hash(user['user_id']) % 1000
            base_amount += user_id_hash  # Vary base amount by user
            data_source = "personalized_mock"
            message = f"Personalized forecast using sample data patterns. Add more transactions for data-driven predictions."
        else:
            data_source = "mock_data"
            message = "Forecast generated using sample data. Sign in to get personalized predictions based on your spending history."
        
        for i in range(input.timeframe):
            # Add some random variation to simulate realistic forecasting
            variation = random.uniform(0.8, 1.2)
            amount = base_amount * variation
            
            future_date = datetime.now() + timedelta(days=30 * (i + 1))
            forecast_data.append({
                "date": future_date.strftime("%Y-%m-%d"),  # Full date format
                "period": future_date.strftime("%Y-%m"),    # Month format
                "predicted_amount": round(amount, 2),
                "category": input.category if input.category != "all" else "all",
                "confidence": round(random.uniform(0.75, 0.95), 2)
            })
        
        # Generate category breakdown
        categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare"]
        category_breakdown = {}
        if input.category == "all" or input.category is None:
            total_monthly = sum(item["predicted_amount"] for item in forecast_data) / len(forecast_data)
            remaining = total_monthly
            for i, category in enumerate(categories[:-1]):
                # Distribute amounts across categories
                percent = random.uniform(0.1, 0.3)
                amount = remaining * percent
                category_breakdown[category.lower()] = round(amount, 2)
                remaining -= amount
            category_breakdown[categories[-1].lower()] = round(remaining, 2)
        else:
            category_breakdown[input.category] = sum(item["predicted_amount"] for item in forecast_data)
        
        return {
            "forecast": forecast_data,
            "category_breakdown": category_breakdown,
            "model_accuracy": round(random.uniform(0.75, 0.95), 3),
            "data_source": data_source,
            "message": message,
            "user_authenticated": user is not None
        }
        
    except Exception as e:
        print(f"[Forecast] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")

from fastapi import Query

class MonthComparisonInput(BaseModel):
    months: List[str]  # e.g., ["2025-05", "2025-06"]
    user_id: Optional[str] = None  # For future use, if needed
    category: Optional[str] = None  # If filtering by category

@app.post("/compare-months-expenses")
def compare_months_expenses(input: MonthComparisonInput, user=Depends(optional_firebase_token)):
    """
    Compare expenses for any two (or more) selected months, side by side.
    Returns total and category-wise breakdown for each month using actual user data from Firestore.
    """
    try:
        from calendar import month_name
        import random
        
        # If user is not authenticated, use mock data
        if not user:
            print("[Compare] No authenticated user, using mock data")
            # Generate mock comparison data
            comparison_data = {}
            
            for month_year in input.months:
                try:
                    # Parse month_year (e.g., "2024-12" or "Dec 2024")
                    if "-" in month_year:
                        year, month = month_year.split("-")
                        month_num = int(month)
                    else:
                        # Handle "Dec 2024" format
                        parts = month_year.split(" ")
                        month_name_str = parts[0]
                        year = parts[1]
                        month_num = list(month_name).index(month_name_str[:3].title())
                    
                    # Generate mock data for this month
                    base_total = random.uniform(1200, 2500)
                    categories = {
                        "Food": random.uniform(300, 600),
                        "Transport": random.uniform(100, 300),
                        "Entertainment": random.uniform(50, 200),
                        "Shopping": random.uniform(200, 500),
                        "Bills": random.uniform(400, 800)
                    }
                    
                    # Normalize to match base total
                    category_total = sum(categories.values())
                    factor = base_total / category_total
                    categories = {k: round(v * factor, 2) for k, v in categories.items()}
                    
                    comparison_data[month_year] = {
                        "total": round(base_total, 2),
                        "by_category": categories,  # Changed from "categories" to "by_category"
                        "month_name": month_name[month_num] if "-" in month_year else month_year.split()[0],
                        "transaction_count": random.randint(15, 35)
                    }
                except Exception as e:
                    print(f"Error processing month {month_year}: {e}")
                    comparison_data[month_year] = {
                        "total": 0,
                        "by_category": {},  # Changed from "categories" to "by_category"
                        "month_name": "Unknown",
                        "transaction_count": 0
                    }
            
            # Extract all categories for frontend
            all_categories = set()
            for month_data in comparison_data.values():
                all_categories.update(month_data.get("by_category", {}).keys())
            
            return {
                "comparison": comparison_data,
                "all_categories": sorted(list(all_categories)),
                "data_source": "mock_data",
                "message": "Comparison generated using sample data. Sign in to compare your actual spending history."
            }
        
        # Try to use Firestore for authenticated users, but fall back to mock data if not available
        if user and firestore_service and firestore_service.db:
            try:
                user_id = user['user_id']
                print(f"[Compare] Attempting to fetch Firestore data for user: {user_id}")
                
                results = {}
                all_categories = set()
                data_found = False
                
                for month in input.months:
                    year, mon = map(int, month.split("-"))
                    month_name_str = month_name[mon]
                    
                    # Try to get monthly summary first (optimized)
                    monthly_summary = firestore_service.get_monthly_summary(user_id, month)
                    
                    if monthly_summary and monthly_summary.get('transactionCount', 0) > 0:
                        # Use aggregated data
                        by_category = monthly_summary.get('categoryBreakdown', {})
                        total = monthly_summary.get('totalExpenses', 0)
                        
                        for category in by_category.keys():
                            all_categories.add(category)
                        
                        results[month] = {
                            "total": round(total, 2),
                            "by_category": {k: round(v, 2) for k, v in by_category.items()},
                            "month_name": month_name_str,
                            "transaction_count": monthly_summary.get('transactionCount', 0)
                        }
                        data_found = True
                    else:
                        # Fall back to individual transaction queries
                        expenses = firestore_service.get_monthly_expenses(user_id, year, mon, input.category)
                        
                        # Aggregate data by category
                        by_category = {}
                        total = 0
                        for expense in expenses:
                            category = expense.get('category', 'uncategorized')
                            all_categories.add(category)
                            if category not in by_category:
                                by_category[category] = 0
                            by_category[category] += expense.get('amount', 0)
                            total += expense.get('amount', 0)
                        
                        # Round amounts for better display
                        by_category = {k: round(v, 2) for k, v in by_category.items()}
                        results[month] = {
                            "total": round(total, 2),
                            "by_category": by_category,
                            "month_name": month_name_str,
                            "transaction_count": len(expenses)
                        }
                        if total > 0:
                            data_found = True
                
                # If we found real data, return it
                if data_found:
                    # Generate insights if comparing exactly 2 months
                    insights = []
                    if len(input.months) == 2:
                        month1, month2 = input.months
                        total1, total2 = results[month1]["total"], results[month2]["total"]
                        if total1 > 0 and total2 > 0:
                            change_percent = ((total2 - total1) / total1) * 100
                            if abs(change_percent) > 5:
                                direction = "increased" if change_percent > 0 else "decreased"
                                insights.append(f"Total spending {direction} by {abs(change_percent):.1f}% from {results[month1]['month_name']} to {results[month2]['month_name']}")
                    
                    return {
                        "comparison": results,
                        "all_categories": sorted(list(all_categories)),
                        "insights": insights,
                        "data_source": "firestore",
                        "message": f"Comparison based on actual transaction data",
                        "user_authenticated": True
                    }
                else:
                    print("[Compare] No Firestore data found, falling back to mock data")
                    
            except Exception as e:
                print(f"[Compare] Firestore error: {e}, using mock data for authenticated user")
        
        # Generate mock data for authenticated users (when Firestore fails) or enhance mock data
        import random
        from calendar import month_name
        comparison_data = {}
        
        for month_year in input.months:
            try:
                # Parse month_year (e.g., "2024-12")
                year, month = month_year.split("-")
                month_num = int(month)
                month_name_str = month_name[month_num]
                
                # Generate more realistic mock data for authenticated users
                if user:
                    user_id_hash = hash(user['user_id']) % 1000
                    base_total = 1500 + user_id_hash + random.uniform(500, 1500)  # User-specific variation
                else:
                    base_total = random.uniform(1200, 2500)
                
                categories = {
                    "food": random.uniform(300, 600),
                    "transport": random.uniform(100, 300),
                    "entertainment": random.uniform(50, 200),
                    "shopping": random.uniform(200, 500),
                    "bills": random.uniform(400, 800),
                    "healthcare": random.uniform(50, 200)
                }
                
                # Normalize to match base total
                category_total = sum(categories.values())
                factor = base_total / category_total
                categories = {k: round(v * factor, 2) for k, v in categories.items()}
                
                comparison_data[month_year] = {
                    "total": round(base_total, 2),
                    "by_category": categories,  # Changed from "categories" to "by_category" for consistency
                    "month_name": month_name_str,
                    "transaction_count": random.randint(15, 35)
                }
            except Exception as e:
                print(f"Error processing month {month_year}: {e}")
                comparison_data[month_year] = {
                    "total": 0,
                    "by_category": {},
                    "month_name": "Unknown",
                    "transaction_count": 0
                }
        
        # Generate insights for mock data
        insights = []
        if len(input.months) == 2:
            month1, month2 = input.months
            total1 = comparison_data[month1]["total"]
            total2 = comparison_data[month2]["total"]
            if total1 > 0 and total2 > 0:
                change_percent = ((total2 - total1) / total1) * 100
                if abs(change_percent) > 5:
                    direction = "increased" if change_percent > 0 else "decreased"
                    insights.append(f"Total spending {direction} by {abs(change_percent):.1f}% from {comparison_data[month1]['month_name']} to {comparison_data[month2]['month_name']}")
        
        # Extract all categories for frontend
        all_categories = set()
        for month_data in comparison_data.values():
            all_categories.update(month_data.get("by_category", {}).keys())
        
        data_source = "personalized_mock" if user else "mock_data"
        message = f"Comparison using sample data patterns {('for user ' + user.get('email', 'N/A')) if user else ''}. Sign in to compare your actual spending history." if not user else "Personalized comparison using sample data patterns."
        
        return {
            "comparison": comparison_data,
            "all_categories": sorted(list(all_categories)),  # Add all_categories for frontend compatibility
            "insights": insights,
            "data_source": data_source,
            "message": message,
            "user_authenticated": user is not None
        }
        
    except Exception as e:
        print(f"[Compare] Error in month comparison: {e}")
        raise HTTPException(status_code=500, detail=f"Month comparison failed: {str(e)}")

# Investment Learning Content Generation Endpoints

@app.post("/api/learning/generate-content")
async def generate_learning_content(
    request: ContentRequest,
    user=Depends(optional_firebase_token)
):
    """
    Generate personalized investment learning content using Gemini AI
    """
    try:
        # If user is authenticated, we could enhance profile with their data
        if user:
            # Optionally fetch user's investment data to enhance profile
            user_id = user.get('user_id')
            # You could fetch user's transaction history, preferences, etc.
            # and update the request.user_profile accordingly
        
        # Generate personalized content
        content = await gemini_service.generate_personalized_content(request)
        
        return {
            "status": "success",
            "content": content,
            "personalized": content.get("personalized", False),
            "generated_at": content.get("generated_at"),
            "message": "Content generated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error generating learning content: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate content: {str(e)}"
        )

@app.get("/api/learning/topics/{level}")
async def get_learning_topics(level: str):
    """
    Get available learning topics for a specific level
    """
    topics_by_level = {
        "beginner": [
            "What is investing?",
            "Risk vs Return",
            "Types of investments",
            "Emergency fund importance",
            "SIP (Systematic Investment Plan)",
            "Understanding Mutual Funds",
            "Tax-saving investments basics",
            "Setting financial goals"
        ],
        "intermediate": [
            "Mutual Funds vs ETFs",
            "Asset allocation strategies",
            "Tax-saving investments (ELSS)",
            "Reading financial statements",
            "Market cycles and timing",
            "Portfolio diversification",
            "Understanding market indices",
            "Sector-wise investing"
        ],
        "advanced": [
            "Portfolio rebalancing",
            "Direct equity investing",
            "Options and derivatives",
            "International investing",
            "Tax optimization strategies",
            "Alternative investments",
            "Value vs Growth investing",
            "Quantitative analysis"
        ]
    }
    
    if level not in topics_by_level:
        raise HTTPException(status_code=400, detail="Invalid level")
    
    return {
        "status": "success",
        "level": level,
        "topics": topics_by_level[level],
        "count": len(topics_by_level[level])
    }

@app.post("/api/learning/user-profile")
async def save_user_learning_profile(
    profile: UserProfile,
    user=Depends(optional_firebase_token)
):
    """
    Save user's learning profile for personalized content generation
    """
    try:
        if user and firestore_service:
            user_id = user['user_id']
            
            # Save profile to Firestore
            profile_data = profile.dict()
            profile_data['updated_at'] = datetime.now()
            profile_data['user_id'] = user_id
            
            # Save to Firestore
            firestore_service.db.collection('user_learning_profiles').document(user_id).set(profile_data)
            
            return {
                "status": "success",
                "message": "Learning profile saved successfully",
                "profile": profile_data
            }
        else:
            # For non-authenticated users, return the profile for temporary use
            return {
                "status": "success",
                "message": "Profile received (not saved - please log in to save)",
                "profile": profile.dict()
            }
            
    except Exception as e:
        logger.error(f"Error saving learning profile: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save profile: {str(e)}"
        )

@app.get("/api/learning/user-profile")
async def get_user_learning_profile(user=Depends(optional_firebase_token)):
    """
    Get user's saved learning profile
    """
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        user_id = user['user_id']
        
        if firestore_service:
            # Get profile from Firestore
            doc = firestore_service.db.collection('user_learning_profiles').document(user_id).get()
            
            if doc.exists:
                profile_data = doc.to_dict()
                return {
                    "status": "success",
                    "profile": profile_data,
                    "message": "Profile retrieved successfully"
                }
            else:
                return {
                    "status": "success",
                    "profile": None,
                    "message": "No saved profile found"
                }
        else:
            raise HTTPException(status_code=500, detail="Firestore not available")
            
    except Exception as e:
        logger.error(f"Error retrieving learning profile: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve profile: {str(e)}"
        )

@app.post("/api/learning/track-progress")
async def track_learning_progress(
    data: dict,  # {"level": "beginner", "topic": "What is investing?", "completed": true}
    user=Depends(optional_firebase_token)
):
    """
    Track user's learning progress
    """
    try:
        if user and firestore_service:
            user_id = user['user_id']
            
            progress_data = {
                "user_id": user_id,
                "level": data.get("level"),
                "topic": data.get("topic"),
                "completed": data.get("completed", False),
                "timestamp": datetime.now(),
                "session_duration": data.get("session_duration", 0)
            }
            
            # Save progress to Firestore
            firestore_service.db.collection('learning_progress').add(progress_data)
            
            return {
                "status": "success",
                "message": "Progress tracked successfully"
            }
        else:
            return {
                "status": "success",
                "message": "Progress received (not saved - please log in to track progress)"
            }
            
    except Exception as e:
        logger.error(f"Error tracking progress: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to track progress: {str(e)}"
        )

# Sample data creation endpoints for testing
class TransactionInput(BaseModel):
    amount: float
    description: str
    category: str
    date: str
    type: str = "expense"

@app.post("/api/transactions/add-sample")
def add_sample_transactions(user=Depends(optional_firebase_token)):
    """
    Add sample transactions for testing Firestore integration
    """
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not firestore_service or not firestore_service.db:
        raise HTTPException(status_code=503, detail="Firestore service not available")
    
    try:
        user_id = user['user_id']
        sample_transactions = [
            {
                "amount": 45.50,
                "description": "Grocery shopping at Walmart",
                "category": "food",
                "date": (datetime.now() - timedelta(days=5)).isoformat(),
                "type": "expense"
            },
            {
                "amount": 25.00,
                "description": "Gas station fill-up",
                "category": "transport",
                "date": (datetime.now() - timedelta(days=3)).isoformat(),
                "type": "expense"
            },
            {
                "amount": 120.00,
                "description": "Electricity bill",
                "category": "bills",
                "date": (datetime.now() - timedelta(days=30)).isoformat(),
                "type": "expense"
            },
            {
                "amount": 80.00,
                "description": "Dinner at restaurant",
                "category": "entertainment",
                "date": (datetime.now() - timedelta(days=7)).isoformat(),
                "type": "expense"
            },
            {
                "amount": 200.00,
                "description": "Online shopping",
                "category": "shopping",
                "date": (datetime.now() - timedelta(days=15)).isoformat(),
                "type": "expense"
            },
            {
                "amount": 3000.00,
                "description": "Monthly salary",
                "category": "salary",
                "date": (datetime.now() - timedelta(days=1)).isoformat(),
                "type": "income"
            }
        ]
        
        added_transactions = []
        for transaction in sample_transactions:
            transaction_id = firestore_service.add_transaction(user_id, transaction)
            added_transactions.append({
                "id": transaction_id,
                **transaction
            })
        
        return {
            "message": f"Successfully added {len(added_transactions)} sample transactions",
            "transactions": added_transactions,
            "user_id": user_id
        }
        
    except Exception as e:
        print(f"Error adding sample transactions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add sample transactions: {str(e)}")

@app.post("/api/transactions/add")
def add_transaction(transaction: TransactionInput, user=Depends(optional_firebase_token)):
    """
    Add a new transaction to Firestore
    """
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not firestore_service or not firestore_service.db:
        raise HTTPException(status_code=503, detail="Firestore service not available")
    
    try:
        user_id = user['user_id']
        transaction_data = transaction.dict()
        
        transaction_id = firestore_service.add_transaction(user_id, transaction_data)
        
        return {
            "message": "Transaction added successfully",
            "transaction_id": transaction_id,
            "transaction": transaction_data
        }
        
    except Exception as e:
        print(f"Error adding transaction: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add transaction: {str(e)}")

@app.get("/api/transactions/list/{user_id}")
def list_user_transactions(user_id: str, user=Depends(optional_firebase_token)):
    """
    List all transactions for a user
    """
    if not user or user['user_id'] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not firestore_service or not firestore_service.db:
        raise HTTPException(status_code=503, detail="Firestore service not available")
    
    try:
        transactions = firestore_service.get_user_expenses(user_id)
        
        return {
            "transactions": transactions,
            "count": len(transactions),
            "user_id": user_id
        }
        
    except Exception as e:
        print(f"Error listing transactions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list transactions: {str(e)}")

# For debugging - you can remove this later
@app.get("/expenses/{user_id}")
def list_user_expenses(user_id: str, db: Session = Depends(get_db)):
    """
    Debug endpoint to list user's expenses
    """
    expenses = db.query(Expense).filter(Expense.user_id == user_id).limit(10).all()
    return {
        "expenses": [
            {
                "id": exp.id,
                "amount": exp.amount,
                "description": exp.description,
                "category": exp.category,
                "timestamp": exp.timestamp.isoformat()
            }
            for exp in expenses
        ]
    }

# Bank Statement Upload Endpoints

@app.post("/api/transactions/upload-statement", response_model=BankStatementUploadResponse)
async def upload_bank_statement(file: UploadFile = File(...)):
    """
    Upload and parse bank statement (CSV or PDF)
    Returns parsed transactions for review before import
    """
    if not bank_parser:
        raise HTTPException(status_code=503, detail="Bank statement parser not available")
    
    try:
        # Validate file format
        file_extension = os.path.splitext(file.filename.lower())[1]
        if file_extension not in bank_parser.supported_formats:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format. Supported formats: {', '.join(bank_parser.supported_formats)}"
            )
        
        # Read file content
        content = await file.read()
        
        # Reset file pointer and read again if content is empty
        if len(content) == 0:
            await file.seek(0)
            content = await file.read()
        
        # Parse the bank statement
        parsed_result = bank_parser.parse_file(content, file.filename, "user")
        
        return BankStatementUploadResponse(
            success=True,
            message=f"Successfully parsed {len(parsed_result['transactions'])} transactions",
            transactions=parsed_result['transactions'],
            total_transactions=len(parsed_result['transactions']),
            bank_detected=parsed_result.get('bank_detected'),
            file_format=file_extension,
            parsing_errors=parsed_result.get('errors', [])
        )
        
    except Exception as e:
        logger.error(f"Error parsing bank statement: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse bank statement: {str(e)}")

@app.post("/api/transactions/import-parsed", response_model=TransactionImportResponse)
async def import_parsed_transactions(request: TransactionImportRequest):
    """
    Import validated transactions to Firestore
    """
    if not firestore_service:
        raise HTTPException(status_code=503, detail="Firestore service not available")
    
    try:
        imported_count = 0
        failed_count = 0
        errors = []
        
        for transaction_data in request.transactions:
            try:
                # Convert transaction data to proper format
                transaction = {
                    'amount': float(transaction_data['amount']),
                    'description': transaction_data['description'],
                    'category': transaction_data.get('category', 'other'),
                    'subcategory': transaction_data.get('subcategory', ''),
                    'payment_method': transaction_data.get('payment_method', 'bank_transfer'),
                    'date': transaction_data['date'],
                    'merchant_name': transaction_data.get('merchant_name', ''),
                    'notes': f"Imported from bank statement - {transaction_data.get('transaction_type', 'transaction')}",
                    'goalId': None,
                    'userId': request.user_id,
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat()
                }
                
                # Add transaction to Firestore
                firestore_service.add_transaction(request.user_id, transaction)
                imported_count += 1
                
            except Exception as e:
                failed_count += 1
                errors.append(f"Failed to import transaction '{transaction_data.get('description', 'Unknown')}': {str(e)}")
                logger.error(f"Error importing transaction: {e}")
        
        return TransactionImportResponse(
            success=True,
            message=f"Successfully imported {imported_count} transactions",
            imported_count=imported_count,
            failed_count=failed_count,
            errors=errors
        )
        
    except Exception as e:
        logger.error(f"Error importing transactions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to import transactions: {str(e)}")

@app.get("/api/transactions/supported-banks")
async def get_supported_banks():
    """
    Get list of supported banks and their features
    """
    if not bank_parser:
        raise HTTPException(status_code=503, detail="Bank statement parser not available")
    
    return {
        "banks": [
            SupportedBankInfo(
                name="State Bank of India",
                code="sbi",
                supported_formats=[".csv", ".pdf"],
                features=["CSV parsing", "PDF parsing", "Auto-categorization"]
            ),
            SupportedBankInfo(
                name="ICICI Bank",
                code="icici",
                supported_formats=[".csv", ".pdf"],
                features=["CSV parsing", "PDF parsing", "Auto-categorization"]
            ),
            SupportedBankInfo(
                name="HDFC Bank",
                code="hdfc",
                supported_formats=[".csv", ".pdf"],
                features=["CSV parsing", "PDF parsing", "Auto-categorization"]
            ),
            SupportedBankInfo(
                name="Axis Bank",
                code="axis",
                supported_formats=[".csv", ".pdf"],
                features=["CSV parsing", "PDF parsing", "Auto-categorization"]
            ),
            SupportedBankInfo(
                name="Generic Bank",
                code="generic",
                supported_formats=[".csv"],
                features=["CSV parsing", "Auto-categorization"]
            )
        ]
    }
