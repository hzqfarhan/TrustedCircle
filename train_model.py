import pandas as pd
import pickle
from sklearn.ensemble import IsolationForest


# =========================
# 1. Load Dataset
# =========================

datasetPath = "allowance_data.csv"
modelPath = "allowance_anomaly_model.pkl"

df = pd.read_csv(r"C:\Users\user\Desktop\coding\Finhack\allowance_data.csv")


# =========================
# 2. Basic Validation
# =========================

requiredColumns = [
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

missingColumns = [col for col in requiredColumns if col not in df.columns]

if missingColumns:
    raise ValueError(f"Missing required columns: {missingColumns}")


# =========================
# 3. Data Cleaning
# =========================

# Fill missing values with 0 for MVP simplicity
df = df.fillna(0)

# Avoid division by zero
df["monthlyAllowance"] = df["monthlyAllowance"].replace(0, 1)


# =========================
# 4. Feature Engineering
# =========================

df["savingsRatio"] = df["savings"] / df["monthlyAllowance"]

# Cap savingsRatio between 0 and 1
df["savingsRatio"] = df["savingsRatio"].clip(lower=0, upper=1)


# =========================
# 5. Select Training Features
# IMPORTANT: This order must match index.py
# =========================

featureColumns = [
    "monthlyAllowance",
    "food",
    "transport",
    "schoolItems",
    "shopping",
    "entertainment",
    "savingsRatio",
    "extraAllowanceRequests",
    "schoolHolidayDays"
]

trainingData = df[featureColumns]


# =========================
# 6. Train IsolationForest Model
# =========================

model = IsolationForest(
    n_estimators=100,
    contamination=0.2,
    random_state=42
)

model.fit(trainingData)


# =========================
# 7. Save Model
# =========================

with open(modelPath, "wb") as file:
    pickle.dump(model, file)


# =========================
# 8. Output Summary
# =========================

print("Model trained successfully using allowance_data.csv")
print(f"Rows used for training: {len(trainingData)}")
print(f"Features used: {featureColumns}")
print(f"Model saved as: {modelPath}")