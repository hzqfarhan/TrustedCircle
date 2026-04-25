import pandas as pd
import pickle
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


DATASET_PATH = r"C:\Users\user\Desktop\coding\Finhack\allowance_data.csv"

KMEANS_MODEL_PATH = "kmeans_household_model.pkl"
ANOMALY_MODEL_PATH = "allowance_anomaly_model.pkl"
SCALER_PATH = "feature_scaler.pkl"


# =========================
# 1. Load Dataset
# =========================

df = pd.read_csv(DATASET_PATH)


# =========================
# 2. Validate Columns
# =========================

required_columns = [
    "monthlyAllowance",
    "food",
    "transport",
    "schoolItems",
    "shopping",
    "entertainment",
    "savings",
    "schoolHolidayDays",
    "extraAllowanceRequests"
]

missing_columns = [col for col in required_columns if col not in df.columns]

if missing_columns:
    raise ValueError(f"Missing required columns: {missing_columns}")


# =========================
# 3. Clean Data
# =========================

df = df.fillna(0)

df["monthlyAllowance"] = df["monthlyAllowance"].replace(0, 1)


# =========================
# 4. Create Parent/Lifestyle Baselines
# For dataset training, we estimate category limits from allowance.
# In real app, parent will provide these limits.
# =========================

df["foodLimit"] = df["monthlyAllowance"] * 0.45
df["transportLimit"] = df["monthlyAllowance"] * 0.20
df["educationLimit"] = df["monthlyAllowance"] * 0.15
df["shoppingLimit"] = df["monthlyAllowance"] * 0.20
df["entertainmentLimit"] = df["monthlyAllowance"] * 0.15
df["savingsTarget"] = df["monthlyAllowance"] * 0.10


# =========================
# 5. Ratio-Based Features
# This makes the model flexible for different households.
# =========================

df["food_ratio"] = df["food"] / df["foodLimit"]
df["transport_ratio"] = df["transport"] / df["transportLimit"]
df["education_ratio"] = df["schoolItems"] / df["educationLimit"]
df["shopping_ratio"] = df["shopping"] / df["shoppingLimit"]
df["entertainment_ratio"] = df["entertainment"] / df["entertainmentLimit"]
df["savings_progress"] = df["savings"] / df["savingsTarget"]

ratio_columns = [
    "food_ratio",
    "transport_ratio",
    "education_ratio",
    "shopping_ratio",
    "entertainment_ratio",
    "savings_progress"
]

df[ratio_columns] = df[ratio_columns].replace([float("inf"), -float("inf")], 0)
df[ratio_columns] = df[ratio_columns].fillna(0)


# =========================
# 6. KMeans Clustering
# Groups children/households by allowance lifestyle pattern.
# =========================

cluster_features = df[[
    "monthlyAllowance",
    "food_ratio",
    "transport_ratio",
    "education_ratio",
    "shopping_ratio",
    "entertainment_ratio",
    "savings_progress"
]]

scaler = StandardScaler()
cluster_features_scaled = scaler.fit_transform(cluster_features)

kmeans = KMeans(
    n_clusters=3,
    random_state=42,
    n_init=10
)

df["household_cluster"] = kmeans.fit_predict(cluster_features_scaled)


# =========================
# 7. IsolationForest Anomaly Model
# Uses cluster as an additional feature.
# =========================

anomaly_features = df[[
    "monthlyAllowance",
    "food_ratio",
    "transport_ratio",
    "education_ratio",
    "shopping_ratio",
    "entertainment_ratio",
    "savings_progress",
    "extraAllowanceRequests",
    "schoolHolidayDays",
    "household_cluster"
]]

anomaly_model = IsolationForest(
    n_estimators=150,
    contamination=0.2,
    random_state=42
)

anomaly_model.fit(anomaly_features)


# =========================
# 8. Save Models
# =========================

with open(KMEANS_MODEL_PATH, "wb") as f:
    pickle.dump(kmeans, f)

with open(ANOMALY_MODEL_PATH, "wb") as f:
    pickle.dump(anomaly_model, f)

with open(SCALER_PATH, "wb") as f:
    pickle.dump(scaler, f)


# =========================
# 9. Summary
# =========================

print("Models trained successfully.")
print(f"KMeans model saved as: {KMEANS_MODEL_PATH}")
print(f"IsolationForest model saved as: {ANOMALY_MODEL_PATH}")
print(f"Scaler saved as: {SCALER_PATH}")
print("Cluster distribution:")
print(df["household_cluster"].value_counts())