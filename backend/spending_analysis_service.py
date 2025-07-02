from typing import List, Dict, Optional
from datetime import datetime, timedelta
import pandas as pd
from sqlalchemy.orm import Session
from models import Expense, User
import numpy as np
from collections import defaultdict
from firestore_service import FirestoreService

class SpendingAnalysisService:
    """
    Comprehensive spending analysis service that provides insights
    into user financial behavior and patterns.
    """
    
    def __init__(self, db: Session, firestore_service: FirestoreService = None):
        self.db = db
        self.firestore_service = firestore_service
        
    def get_spending_summary(self, user_id: str, period: str = "month") -> Dict:
        """
        Get comprehensive spending summary for a user, using Firestore as the primary data source.
        """
        end_date = datetime.now()
        
        if period == "week":
            start_date = end_date - timedelta(days=7)
        elif period == "month":
            start_date = end_date - timedelta(days=30)
        elif period == "quarter":
            start_date = end_date - timedelta(days=90)
        else:  # year
            start_date = end_date - timedelta(days=365)

        expenses = []
        if self.firestore_service and self.firestore_service.db:
            # Use simplified Firestore query to avoid date comparison issues
            try:
                simple_query = self.firestore_service.db.collection('transactions').where('userId', '==', user_id).limit(1000)
                docs = simple_query.stream()
                
                expenses = []
                for doc in docs:
                    data = doc.to_dict()
                    # Parse date for filtering
                    date_str = data.get('date', '')
                    try:
                        if date_str:
                            if 'T' in date_str:
                                doc_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                            else:
                                doc_date = datetime.fromisoformat(date_str)
                        else:
                            continue
                    except:
                        continue
                    
                    # Apply date filter in memory
                    if doc_date < start_date or doc_date > end_date:
                        continue
                    
                    expenses.append({
                        'amount': data.get('amount', 0),
                        'category': data.get('category', 'uncategorized'),
                        'date': date_str,
                        'timestamp': doc_date,
                        'description': data.get('description', ''),
                        'type': data.get('type', 'expense')
                    })
                
                print(f"✅ SpendingAnalysisService: Found {len(expenses)} expenses in date range")
                
            except Exception as e:
                print(f"Error in spending analysis Firestore query: {e}")
                expenses = []
        else:
            # Fallback to legacy database if Firestore is not available
            db_expenses = self.db.query(Expense).filter(
                Expense.user_id == user_id,
                Expense.timestamp >= start_date,
                Expense.timestamp <= end_date
            ).all()
            # Convert to dictionary format to match Firestore's output
            for exp in db_expenses:
                expenses.append({
                    'amount': exp.amount,
                    'category': exp.category,
                    'date': exp.timestamp.isoformat(),
                    'description': exp.description,
                    'timestamp': exp.timestamp
                })
        
        if not expenses:
            # Return full structure with safe defaults
            return {
                "total_spent": 0.0,
                "transaction_count": 0,
                "average_transaction": 0.0,
                "categories": {},
                "daily_average": 0.0,
                "trends": {},
                "top_merchants": [],
                "spending_patterns": {}
            }
            
        # The data from Firestore is a list of dicts, which is what we need.
        # The fallback logic now also produces a list of dicts.
        df = pd.DataFrame([{
            'amount': exp.get('amount', 0),
            'category': exp.get('category', 'uncategorized'),
            'date': exp.get('timestamp', datetime.fromisoformat(exp.get('date').replace('Z', '+00:00')) if isinstance(exp.get('date'), str) else datetime.now()),
            'description': exp.get('description', '')
        } for exp in expenses])
        
        return {
            "total_spent": float(df['amount'].sum()),
            "transaction_count": len(expenses),
            "average_transaction": float(df['amount'].mean()),
            "categories": self._analyze_categories(df),
            "daily_average": float(df['amount'].sum() / max(1, (end_date - start_date).days)),
            "trends": self._analyze_trends(df),
            "top_merchants": self._get_top_merchants(df),
            "spending_patterns": self._analyze_patterns(df)
        }
    
    def _analyze_categories(self, df: pd.DataFrame) -> Dict:
        """Analyze spending by categories"""
        category_summary = df.groupby('category')['amount'].agg([
            'sum', 'count', 'mean', 'std'
        ]).round(2)
        
        total_spent = df['amount'].sum()
        result = {}
        
        for category, data in category_summary.iterrows():
            result[category] = {
                "total": float(data['sum']),
                "percentage": round((data['sum'] / total_spent) * 100, 1),
                "transaction_count": int(data['count']),
                "average_amount": float(data['mean']),
                "volatility": float(data['std']) if not pd.isna(data['std']) else 0
            }
            
        return dict(sorted(result.items(), key=lambda x: x[1]['total'], reverse=True))
    
    def _analyze_trends(self, df: pd.DataFrame) -> Dict:
        """Analyze spending trends over time"""
        df['date_only'] = df['date'].dt.date
        daily_spending = df.groupby('date_only')['amount'].sum()
        
        if len(daily_spending) < 2:
            return {"trend": "insufficient_data"}
            
        # Calculate moving average
        if len(daily_spending) >= 7:
            moving_avg = daily_spending.rolling(window=7).mean()
            recent_trend = moving_avg.iloc[-3:].mean() - moving_avg.iloc[-7:-4].mean()
        else:
            recent_trend = daily_spending.iloc[-1] - daily_spending.iloc[0]
            
        # Day of week analysis
        df['day_of_week'] = df['date'].dt.day_name()
        dow_spending = df.groupby('day_of_week')['amount'].sum()
        
        return {
            "trend_direction": "increasing" if recent_trend > 0 else "decreasing",
            "trend_magnitude": abs(float(recent_trend)),
            "highest_spending_day": dow_spending.idxmax(),
            "weekend_vs_weekday": self._weekend_weekday_comparison(df),
            "monthly_pattern": self._monthly_pattern(df)
        }
    
    def _get_top_merchants(self, df: pd.DataFrame) -> List[Dict]:
        """Get top merchants by spending"""
        # Extract merchant from description (simplified)
        df['merchant'] = df['description'].str.split(' - ').str[0]
        merchant_spending = df.groupby('merchant')['amount'].agg([
            'sum', 'count'
        ]).round(2)
        
        top_merchants = merchant_spending.nlargest(5, 'sum')
        
        result = []
        for merchant, data in top_merchants.iterrows():
            result.append({
                "name": merchant,
                "total_spent": float(data['sum']),
                "transaction_count": int(data['count']),
                "average_amount": float(data['sum'] / data['count'])
            })
            
        return result
    
    def _analyze_patterns(self, df: pd.DataFrame) -> Dict:
        """Analyze spending patterns and behaviors"""
        # Time-based patterns
        df['hour'] = df['date'].dt.hour
        hour_distribution = df.groupby('hour')['amount'].sum()
        
        # Amount patterns
        small_transactions = df[df['amount'] < 500]['amount'].sum()
        medium_transactions = df[(df['amount'] >= 500) & (df['amount'] < 2000)]['amount'].sum()
        large_transactions = df[df['amount'] >= 2000]['amount'].sum()
        
        total = df['amount'].sum()
        
        return {
            "peak_spending_hour": int(hour_distribution.idxmax()),
            "transaction_size_distribution": {
                "small_transactions_pct": round((small_transactions / total) * 100, 1),
                "medium_transactions_pct": round((medium_transactions / total) * 100, 1),
                "large_transactions_pct": round((large_transactions / total) * 100, 1)
            },
            "spending_consistency": float(df['amount'].std()),
            "impulse_indicator": self._calculate_impulse_score(df)
        }
    
    def _weekend_weekday_comparison(self, df: pd.DataFrame) -> Dict:
        """Compare weekend vs weekday spending"""
        df['is_weekend'] = df['date'].dt.dayofweek >= 5
        comparison = df.groupby('is_weekend')['amount'].agg(['sum', 'mean', 'count'])
        
        if len(comparison) < 2:
            return {"insufficient_data": True}
            
        weekday_total = float(comparison.loc[False, 'sum']) if False in comparison.index else 0
        weekend_total = float(comparison.loc[True, 'sum']) if True in comparison.index else 0
        
        return {
            "weekday_total": weekday_total,
            "weekend_total": weekend_total,
            "weekend_premium": round(((weekend_total / 2) / (weekday_total / 5) - 1) * 100, 1) if weekday_total > 0 else 0
        }
    
    def _monthly_pattern(self, df: pd.DataFrame) -> Dict:
        """Analyze monthly spending patterns"""
        df['day_of_month'] = df['date'].dt.day
        
        # Beginning, middle, end of month
        beginning = df[df['day_of_month'] <= 10]['amount'].sum()
        middle = df[(df['day_of_month'] > 10) & (df['day_of_month'] <= 20)]['amount'].sum()
        end = df[df['day_of_month'] > 20]['amount'].sum()
        
        total = beginning + middle + end
        
        if total == 0:
            return {"insufficient_data": True}
            
        return {
            "beginning_of_month_pct": round((beginning / total) * 100, 1),
            "middle_of_month_pct": round((middle / total) * 100, 1),
            "end_of_month_pct": round((end / total) * 100, 1)
        }
    
    def _calculate_impulse_score(self, df: pd.DataFrame) -> float:
        """
        Calculate impulse buying score based on transaction patterns
        Higher score indicates more impulse buying
        """
        if len(df) < 5:
            return 0.0
            
        # Factors that indicate impulse buying:
        # 1. High variance in transaction amounts
        amount_cv = df['amount'].std() / df['amount'].mean()
        
        # 2. Weekend/evening transactions
        df['hour'] = df['date'].dt.hour
        evening_pct = len(df[df['hour'] >= 18]) / len(df)
        weekend_pct = len(df[df['date'].dt.dayofweek >= 5]) / len(df)
        
        # 3. Frequency of small transactions
        small_tx_pct = len(df[df['amount'] < df['amount'].median()]) / len(df)
        
        # Weighted score (0-100)
        impulse_score = min(100, (
            amount_cv * 30 +
            evening_pct * 25 +
            weekend_pct * 25 +
            small_tx_pct * 20
        ))
        
        return round(impulse_score, 1)
    
    def generate_insights(self, user_id: str) -> List[Dict]:
        """
        Generate personalized insights based on spending analysis
        """
        summary = self.get_spending_summary(user_id, "month")
        insights = []
        
        # Budget variance insights
        if summary.get('categories'):
            top_category = max(summary['categories'].items(), key=lambda x: x[1]['total'])
            if top_category[1]['percentage'] > 40:
                insights.append({
                    "type": "warning",
                    "title": "High Category Concentration",
                    "message": f"You're spending {top_category[1]['percentage']}% of your budget on {top_category[0]}. Consider diversifying your expenses.",
                    "priority": "medium"
                })
        
        # Trend insights
        trends = summary.get('trends', {})
        if trends.get('trend_direction') == 'increasing':
            insights.append({
                "type": "alert",
                "title": "Increasing Spending Trend",
                "message": f"Your spending has increased by ₹{trends['trend_magnitude']:.0f} recently. Monitor your expenses closely.",
                "priority": "high"
            })
        
        # Weekend spending insights
        weekend_data = trends.get('weekend_vs_weekday', {})
        if weekend_data.get('weekend_premium', 0) > 50:
            insights.append({
                "type": "tip",
                "title": "Weekend Spending Alert",
                "message": f"You spend {weekend_data['weekend_premium']:.0f}% more on weekends. Consider setting a weekend budget.",
                "priority": "low"
            })
        
        # Impulse buying insights
        patterns = summary.get('spending_patterns', {})
        impulse_score = patterns.get('impulse_indicator', 0)
        if impulse_score > 60:
            insights.append({
                "type": "recommendation",
                "title": "Impulse Buying Detected",
                "message": "Your spending pattern suggests frequent impulse purchases. Try the 24-hour rule before buying.",
                "priority": "medium"
            })
        
        return insights
    
    def get_budget_analysis(self, user_id: str, monthly_budget: float) -> Dict:
        """
        Analyze spending against budget and provide recommendations
        """
        summary = self.get_spending_summary(user_id, "month")
        total_spent = summary['total_spent']
        
        budget_utilization = (total_spent / monthly_budget) * 100 if monthly_budget > 0 else 0
        remaining_budget = monthly_budget - total_spent
        days_left = (datetime.now().replace(day=28) + timedelta(days=4) - datetime.now()).days
        daily_budget_remaining = remaining_budget / max(1, days_left)
        
        return {
            "budget_utilization_pct": round(budget_utilization, 1),
            "amount_spent": total_spent,
            "amount_remaining": remaining_budget,
            "days_remaining": days_left,
            "suggested_daily_limit": max(0, daily_budget_remaining),
            "status": self._get_budget_status(budget_utilization),
            "recommendations": self._get_budget_recommendations(budget_utilization, summary)
        }
    
    def _get_budget_status(self, utilization_pct: float) -> str:
        """Get budget status based on utilization percentage"""
        if utilization_pct < 70:
            return "on_track"
        elif utilization_pct < 90:
            return "watch"
        elif utilization_pct < 110:
            return "over_budget"
        else:
            return "significantly_over"
    
    def _get_budget_recommendations(self, utilization_pct: float, summary: Dict) -> List[str]:
        """Generate budget recommendations"""
        recommendations = []
        
        if utilization_pct > 90:
            recommendations.append("Consider reducing discretionary spending for the rest of the month")
            
            # Find highest spending category
            if summary.get('categories'):
                top_category = max(summary['categories'].items(), key=lambda x: x[1]['total'])
                recommendations.append(f"Focus on reducing {top_category[0]} expenses - your highest spending category")
        
        elif utilization_pct < 70:
            recommendations.append("Great job staying within budget! Consider increasing your savings rate")
            recommendations.append("You might have room for some planned purchases or investments")
        
        return recommendations
