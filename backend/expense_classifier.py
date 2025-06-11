from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import pickle

# Example training data (expand for real use)
TRAIN_DESCRIPTIONS = [
    "Starbucks coffee", "Uber ride", "Electricity bill", "Domino's pizza", "Flight to Delhi", "Grocery store", "Movie tickets", "Mobile recharge", "Restaurant dinner", "Train ticket"
]
TRAIN_LABELS = [
    "food", "travel", "bills", "food", "travel", "food", "discretionary", "bills", "food", "travel"
]

# Train a simple pipeline
model = make_pipeline(TfidfVectorizer(), MultinomialNB())
model.fit(TRAIN_DESCRIPTIONS, TRAIN_LABELS)

def predict_expense_category(description: str) -> str:
    return model.predict([description])[0]

# Optional: Save model for reuse
with open("expense_classifier.pkl", "wb") as f:
    pickle.dump(model, f)

# Example usage:
# print(predict_expense_category("Dinner at McDonald's"))
