from sklearn.cluster import KMeans
import numpy as np

def cluster_users(user_data, n_clusters=3):
    """
    Clusters users based on age, income, and financial goals.
    user_data: list of dicts, each with 'age', 'income', 'goals' (string)
    n_clusters: number of clusters for KMeans
    Returns: list of cluster labels for each user
    """
    # Simple encoding for goals (expand for more sophistication)
    goal_map = {}
    goal_idx = 0
    features = []
    for user in user_data:
        age = user.get('age', 0)
        income = user.get('income', 0)
        goal = user.get('goals', '').lower().strip()
        if goal not in goal_map:
            goal_map[goal] = goal_idx
            goal_idx += 1
        features.append([age, income, goal_map[goal]])
    X = np.array(features)
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X)
    return labels

# Example usage:
# users = [
#   {"age": 28, "income": 80000, "goals": "retirement"},
#   {"age": 35, "income": 120000, "goals": "child education"},
#   ...
# ]
# print(cluster_users(users))
