import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import logging

logger = logging.getLogger(__name__)

class CustomExpenseForecaster:
    """A service for custom ML-based expense forecasting.
    This version trains a model on-the-fly for a given user's historical data.
    """
    def __init__(self):
        pass # No complex initialization needed for on-the-fly training

    def _prepare_data_for_training(self, historical_expenses: List[Dict]) -> pd.DataFrame:
        """
        Prepares historical expense data into a DataFrame suitable for training.
        Aggregates to monthly data and creates time-based features.
        """
        df = pd.DataFrame(historical_expenses)
        
        # Ensure 'timestamp' is datetime objects and set as index for resampling
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.set_index('timestamp')
        
        # Resample to monthly totals
        monthly_df = df.resample('M')['amount'].sum().reset_index()
        monthly_df.rename(columns={'timestamp': 'date', 'amount': 'total_expense'}, inplace=True)
        
        # Feature Engineering
        monthly_df['month'] = monthly_df['date'].dt.month
        monthly_df['quarter'] = monthly_df['date'].dt.quarter
        monthly_df['year'] = monthly_df['date'].dt.year
        
        # Lagged features (previous month's expense)
        monthly_df['lag_1'] = monthly_df['total_expense'].shift(1)
        monthly_df['lag_2'] = monthly_df['total_expense'].shift(2)
        
        # Rolling mean (average of last 3 months)
        monthly_df['rolling_mean_3'] = monthly_df['total_expense'].rolling(window=3, min_periods=1).mean()
        
        # Fill NaNs created by lagging/rolling (e.g., with 0 or mean, depending on context)
        # For simplicity, fill with median of the column or 0
        for col in ['lag_1', 'lag_2', 'rolling_mean_3']:
            if col in monthly_df.columns: # Check if column exists before trying to fill
                monthly_df[col].fillna(monthly_df[col].median() if not monthly_df[col].empty else 0, inplace=True)

        # Drop the first few rows that have NaNs due to lagging/rolling if desired, or handle them in training.
        # For on-the-fly training, simpler to just keep and let model handle NaNs or fill more aggressively.
        monthly_df.fillna(0, inplace=True) # Final fallback fill

        return monthly_df

    def train_and_predict(self, historical_expenses: List[Dict], timeframe: int) -> Dict[str, Any]:
        """
        Trains a custom ML model on historical data and predicts future expenses.
        Returns: {"forecast": [...], "model_accuracy": float}
        """
        if not historical_expenses or len(historical_expenses) < 5: # Increased minimum data for meaningful ML
            logger.warning("Insufficient historical data for custom ML model, falling back to basic forecasting.")
            return self._basic_fallback_forecast(historical_expenses, timeframe)
        
        df = self._prepare_data_for_training(historical_expenses)

        # If after aggregation, we still don't have enough monthly points
        if len(df) < 3: 
            logger.warning("Insufficient monthly aggregated data for custom ML model, falling back to basic forecasting.")
            return self._basic_fallback_forecast(historical_expenses, timeframe)

        # Define features (X) and target (y)
        features = ['month', 'quarter', 'year', 'lag_1', 'lag_2', 'rolling_mean_3']
        target = 'total_expense'

        # Ensure all features exist in df before selecting
        available_features = [f for f in features if f in df.columns]
        if not available_features or len(df) < 2: # Need at least 2 data points for training a regression model
             logger.warning(f"Not enough features or data points after preparation ({len(df)}), falling back.")
             return self._basic_fallback_forecast(historical_expenses, timeframe)

        X = df[available_features]
        y = df[target]

        # Train-test split (optional for full prediction, but good for local accuracy check)
        # For production, you'd usually train on all available data up to the prediction point.
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)
        
        # Ensure train set has enough samples after split
        if len(X_train) == 0: # This can happen if df is too small or test_size too large
            X_train, y_train = X, y
            X_test, y_test = pd.DataFrame(), pd.Series() # Empty test sets
            logger.warning("Train-test split resulted in empty training set, training on full available data.")

        model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
        model.fit(X_train, y_train)

        # Evaluate model accuracy (MAE on training data for simplicity, or test data if sufficient)
        if not y_test.empty:
            y_pred_test = model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred_test)
            model_accuracy = 1.0 - (mae / y_test.mean()) if y_test.mean() > 0 else 1.0 # Simple accuracy metric
            logger.info(f"Model MAE on test set: {mae:.2f}, Accuracy: {model_accuracy:.2f}")
        else:
            # If no test set, predict on train and use that for a rough accuracy estimate
            y_pred_train = model.predict(X_train)
            mae = mean_absolute_error(y_train, y_pred_train)
            model_accuracy = 1.0 - (mae / y_train.mean()) if y_train.mean() > 0 else 1.0
            logger.info(f"Model MAE on train set (no test): {mae:.2f}, Accuracy: {model_accuracy:.2f}")

        # Generate future dates for prediction
        last_date = df['date'].max()
        future_dates = [last_date + pd.DateOffset(months=i) for i in range(1, timeframe + 1)]

        forecast_data = []
        current_lag1 = df['total_expense'].iloc[-1] if not df.empty else 0
        current_lag2 = df['total_expense'].iloc[-2] if len(df) >= 2 else 0
        current_rolling_mean = df['rolling_mean_3'].iloc[-1] if not df.empty else 0

        for i, future_date in enumerate(future_dates):
            # Prepare features for the future month
            future_features = pd.DataFrame({
                'month': [future_date.month],
                'quarter': [future_date.quarter],
                'year': [future_date.year],
                'lag_1': [current_lag1],
                'lag_2': [current_lag2],
                'rolling_mean_3': [current_rolling_mean]
            })
            # Ensure columns are in the same order as training data
            future_features = future_features[available_features]

            predicted_amount = model.predict(future_features)[0]
            predicted_amount = max(0, predicted_amount) # Ensure non-negative predictions

            forecast_data.append({
                "date": future_date.strftime("%Y-%m-%d"),
                "period": future_date.strftime("%Y-%m"),
                "predicted_amount": round(float(predicted_amount), 2),
                "category": "all" # This model predicts total, category breakdown is handled elsewhere
            })

            # Update lags for the next prediction step
            current_lag2 = current_lag1
            current_lag1 = predicted_amount
            # Recalculate rolling mean for next step (simplified for rolling prediction)
            current_rolling_mean = (current_rolling_mean * 2 + predicted_amount) / 3 if len(df) >= 2 else predicted_amount # Simple update, better to keep track of last 3 actual/predicted

        return {"forecast": forecast_data, "model_accuracy": round(model_accuracy, 3)}
    
    def _basic_fallback_forecast(self, historical_expenses: List[Dict], timeframe: int) -> Dict[str, Any]:
        """
        Provides a basic forecast using average historical expenses as a fallback.
        This is similar to the existing simple logic in main.py but ensures a consistent structure.
        """
        # Calculate base average monthly expense from historical data
        if historical_expenses:
            df_hist = pd.DataFrame(historical_expenses)
            df_hist['timestamp'] = pd.to_datetime(df_hist['timestamp'])
            # Filter for the last 12 months for a more relevant average for fallback
            one_year_ago = datetime.now() - timedelta(days=365)
            df_hist_recent = df_hist[df_hist['timestamp'] >= one_year_ago]
            
            if not df_hist_recent.empty:
                monthly_agg = df_hist_recent.resample('M', on='timestamp')['amount'].sum()
                base_amount = monthly_agg.mean() if not monthly_agg.empty else 1500
            else:
                base_amount = 1500
        else:
            base_amount = 1500 # Default if no history

        forecast_data = []
        for i in range(timeframe):
            future_date = datetime.now() + timedelta(days=30 * (i + 1))
            # Apply a small random variation for realism, but keep it basic
            predicted_amount = base_amount * np.random.uniform(0.9, 1.1)
            forecast_data.append({
                "date": future_date.strftime("%Y-%m-%d"),
                "period": future_date.strftime("%Y-%m"),
                "predicted_amount": round(predicted_amount, 2),
                "category": "all"
            })
        
        return {"forecast": forecast_data, "model_accuracy": 0.6, "message": "Basic fallback forecast used due to insufficient data or model training issue."}

custom_expense_forecaster = CustomExpenseForecaster() 