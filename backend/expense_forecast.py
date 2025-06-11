import pandas as pd
from datetime import datetime
try:
    from prophet import Prophet
except ImportError:
    Prophet = None
from statsmodels.tsa.arima.model import ARIMA

# Example function: forecast next month's spending per category
def forecast_expense_trend(expense_data, method="prophet"):
    """
    expense_data: list of dicts with keys ['date', 'amount', 'category']
    method: 'prophet' or 'arima'
    Returns: dict {category: predicted_amount}
    """
    df = pd.DataFrame(expense_data)
    df['date'] = pd.to_datetime(df['date'])
    results = {}
    for cat in df['category'].unique():
        cat_df = df[df['category'] == cat].copy()
        cat_df = cat_df.groupby(pd.Grouper(key='date', freq='M')).sum().reset_index()
        cat_df = cat_df.rename(columns={'date': 'ds', 'amount': 'y'})
        if len(cat_df) < 3:
            results[cat] = None  # Not enough data
            continue
        if method == "prophet" and Prophet is not None:
            model = Prophet(yearly_seasonality=False, daily_seasonality=False, weekly_seasonality=False)
            model.fit(cat_df)
            future = model.make_future_dataframe(periods=1, freq='M')
            forecast = model.predict(future)
            next_month = forecast.iloc[-1]['yhat']
            results[cat] = round(next_month, 2)
        else:
            # ARIMA fallback
            try:
                model = ARIMA(cat_df['y'], order=(1,1,1))
                fit = model.fit()
                pred = fit.forecast(steps=1)
                results[cat] = round(float(pred.iloc[0]), 2)
            except Exception:
                results[cat] = None
    return results

# Example usage:
# expense_data = [
#     {"date": "2024-01-15", "amount": 500, "category": "food"},
#     {"date": "2024-02-10", "amount": 600, "category": "food"},
#     ...
# ]
# print(forecast_expense_trend(expense_data))
