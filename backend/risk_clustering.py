from sklearn.cluster import KMeans
import numpy as np

def assign_risk_profile(answers, n_clusters=3):
    """
    answers: List of lists, where each sublist is a user's risk-related answers (numerical).
    n_clusters: Number of risk profiles (e.g., 3 for low, medium, high).
    Returns: List of cluster labels (risk profiles) for each user.
    """
    X = np.array(answers)
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X)
    return labels

# Example usage:
# answers = [[3, 5, 2], [7, 8, 6], [1, 2, 1], ...]
# profiles = assign_risk_profile(answers)
# print(profiles)  # [1, 0, 2, ...]
