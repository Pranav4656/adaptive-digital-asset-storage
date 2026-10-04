import os
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)

# ============================================================
# AI-BASED HYBRID BLOCKCHAIN STORAGE DECISION SYSTEM
# 50,000-RECORD SYNTHETIC DATASET
# ============================================================

RANDOM_STATE = 42
TOTAL_RECORDS = 50000

np.random.seed(RANDOM_STATE)

# Project directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
AI_DIR = os.path.join(BASE_DIR, "ai")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(AI_DIR, exist_ok=True)


# ============================================================
# 1. GENERATE SYNTHETIC DATASET
# ============================================================

def generate_synthetic_data(n_rows=TOTAL_RECORDS):

    rng = np.random.default_rng(RANDOM_STATE)

    # --------------------------------------------------------
    # Asset size
    # 10 - 1000
    # --------------------------------------------------------

    asset_size = rng.integers(
        10,
        1001,
        size=n_rows
    )

    # --------------------------------------------------------
    # Importance
    # 1 - 10
    # --------------------------------------------------------

    importance = rng.integers(
        1,
        11,
        size=n_rows
    )

    # --------------------------------------------------------
    # Update frequency
    # 1 - 100
    # --------------------------------------------------------

    update_frequency = rng.integers(
        1,
        101,
        size=n_rows
    )

    # --------------------------------------------------------
    # Transaction cost
    # 0.001 - 0.100
    # --------------------------------------------------------

    transaction_cost = np.round(
        rng.uniform(
            0.001,
            0.100,
            size=n_rows
        ),
        3
    )

    # --------------------------------------------------------
    # Ownership requirement
    # 0 = No
    # 1 = Yes
    # --------------------------------------------------------

    ownership_required = rng.binomial(
        1,
        0.50,
        size=n_rows
    )

    # --------------------------------------------------------
    # Calculate normalized scores
    # --------------------------------------------------------

    size_score = (
        (1000 - asset_size) / 1000
    )

    update_score = (
        (100 - update_frequency) / 100
    )

    cost_score = (
        (0.100 - transaction_cost) / 0.099
    )

    importance_score = (
        (importance - 1) / 9
    )

    # --------------------------------------------------------
    # Underlying storage decision score
    #
    # Higher score -> more suitable for ON_CHAIN
    # --------------------------------------------------------

    storage_score = (
        1.45 * importance_score
        + 1.75 * ownership_required
        + 0.85 * size_score
        + 0.65 * update_score
        + 0.55 * cost_score
    )

    # --------------------------------------------------------
    # Add controlled random noise
    # --------------------------------------------------------

    noise = rng.normal(
        0,
        0.45,
        size=n_rows
    )

    final_score = storage_score + noise

    # --------------------------------------------------------
    # Median threshold keeps classes approximately balanced
    # --------------------------------------------------------

    threshold = np.median(final_score)

    storage_decision = np.where(
        final_score >= threshold,
        "ON_CHAIN",
        "OFF_CHAIN"
    )

    # --------------------------------------------------------
    # Create DataFrame
    # --------------------------------------------------------

    dataset = pd.DataFrame({
        "asset_size": asset_size,
        "importance": importance,
        "update_frequency": update_frequency,
        "transaction_cost": transaction_cost,
        "ownership_required": ownership_required,
        "storage_decision": storage_decision
    })

    return dataset


# ============================================================
# 2. CREATE DATASET
# ============================================================

print("=" * 70)
print("AI HYBRID BLOCKCHAIN STORAGE DECISION MODEL")
print("=" * 70)

print("\nGenerating 50,000-record synthetic dataset...")

df = generate_synthetic_data(TOTAL_RECORDS)

dataset_path = os.path.join(
    DATA_DIR,
    "synthetic_storage_dataset.csv"
)

df.to_csv(
    dataset_path,
    index=False
)

print("\nSynthetic dataset created successfully.")

print(
    f"Dataset saved to:\n{dataset_path}"
)

print(
    f"\nTotal records : {len(df):,}"
)

print(
    f"Total columns : {len(df.columns)}"
)


# ============================================================
# 3. DATASET INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("DATASET INFORMATION")
print("=" * 70)

class_distribution = (
    df["storage_decision"]
    .value_counts()
    .sort_index()
)

print("\nClass distribution:")

for label, count in class_distribution.items():

    percentage = (
        count / len(df)
    ) * 100

    print(
        f"{label:10s}: "
        f"{count:,} "
        f"({percentage:.2f}%)"
    )


# ============================================================
# 4. FEATURES AND TARGET
# ============================================================

features = [
    "asset_size",
    "importance",
    "update_frequency",
    "transaction_cost",
    "ownership_required"
]

target = "storage_decision"

X = df[features]
y = df[target]


# ============================================================
# 5. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=RANDOM_STATE,
    stratify=y
)

print("\n" + "=" * 70)
print("DATASET SPLIT")
print("=" * 70)

print(
    f"\nTraining records : {len(X_train):,}"
)

print(
    f"Testing records  : {len(X_test):,}"
)

print(
    f"Total records    : {len(X):,}"
)


# ============================================================
# 6. RANDOM FOREST MODEL
# ============================================================

print("\n" + "=" * 70)
print("TRAINING RANDOM FOREST")
print("=" * 70)

model = RandomForestClassifier(
    n_estimators=150,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=RANDOM_STATE,
    n_jobs=-1
)

model.fit(
    X_train,
    y_train
)

print("\nRandom Forest training completed.")


# ============================================================
# 7. PREDICTIONS
# ============================================================

y_pred = model.predict(X_test)

y_probability = model.predict_proba(X_test)

classes = list(model.classes_)


# ============================================================
# 8. MODEL EVALUATION
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

precision = precision_score(
    y_test,
    y_pred,
    pos_label="ON_CHAIN",
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    pos_label="ON_CHAIN",
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    pos_label="ON_CHAIN",
    zero_division=0
)

cm = confusion_matrix(
    y_test,
    y_pred,
    labels=[
        "OFF_CHAIN",
        "ON_CHAIN"
    ]
)

report = classification_report(
    y_test,
    y_pred,
    labels=[
        "OFF_CHAIN",
        "ON_CHAIN"
    ],
    zero_division=0
)


# ============================================================
# 9. FEATURE IMPORTANCE
# ============================================================

feature_importance = {}

for feature, importance_value in zip(
    features,
    model.feature_importances_
):

    feature_importance[feature] = float(
        importance_value
    )


# ============================================================
# 10. SAVE MODEL
# ============================================================

model_path = os.path.join(
    AI_DIR,
    "random_forest_model.joblib"
)

joblib.dump(
    model,
    model_path
)

print(
    f"\nModel saved to:\n{model_path}"
)


# ============================================================
# 11. SAVE MODEL INFORMATION
# ============================================================

model_info = {

    "project":
        "AI-Based Hybrid Blockchain Storage Decision System",

    "algorithm":
        "Random Forest Classifier",

    "dataset_type":
        "Synthetic",

    "total_records":
        int(len(df)),

    "training_records":
        int(len(X_train)),

    "testing_records":
        int(len(X_test)),

    "random_state":
        RANDOM_STATE,

    "features":
        features,

    "target":
        target,

    "classes":
        {
            "0": "OFF_CHAIN",
            "1": "ON_CHAIN"
        },

    "class_distribution":
        {
            "OFF_CHAIN":
                int(
                    class_distribution.get(
                        "OFF_CHAIN",
                        0
                    )
                ),

            "ON_CHAIN":
                int(
                    class_distribution.get(
                        "ON_CHAIN",
                        0
                    )
                )
        },

    "accuracy":
        float(accuracy),

    "accuracy_percentage":
        round(
            float(accuracy) * 100,
            2
        ),

    "precision":
        float(precision),

    "recall":
        float(recall),

    "f1_score":
        float(f1),

    "confusion_matrix":
        cm.tolist(),

    "feature_importance":
        feature_importance,

    "n_estimators":
        150,

    "max_depth":
        10,

    "min_samples_split":
        5,

    "min_samples_leaf":
        2
}

model_info_path = os.path.join(
    AI_DIR,
    "model_info.json"
)

with open(
    model_info_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        model_info,
        file,
        indent=4
    )

print(
    f"Model information saved to:\n{model_info_path}"
)


# ============================================================
# 12. PRINT MODEL RESULTS
# ============================================================

print("\n" + "=" * 70)
print("MODEL EVALUATION")
print("=" * 70)

print(
    f"\nAccuracy: {accuracy:.4f}"
)

print(
    f"Accuracy percentage: "
    f"{accuracy * 100:.2f}%"
)

print(
    f"\nPrecision (ON_CHAIN): "
    f"{precision:.4f}"
)

print(
    f"Recall (ON_CHAIN): "
    f"{recall:.4f}"
)

print(
    f"F1-score (ON_CHAIN): "
    f"{f1:.4f}"
)

print("\nClassification Report:")
print(report)

print("Confusion Matrix:")
print(cm)

print("\nFeature Importance:")

for feature, importance_value in sorted(
    feature_importance.items(),
    key=lambda item: item[1],
    reverse=True
):

    print(
        f"{feature:25s}: "
        f"{importance_value:.4f}"
    )


# ============================================================
# 13. SAMPLE AI PREDICTIONS
# ============================================================

print("\n" + "=" * 70)
print("SAMPLE AI PREDICTIONS")
print("=" * 70)

sample_data = pd.DataFrame([

    {
        "asset_size": 50,
        "importance": 9,
        "update_frequency": 5,
        "transaction_cost": 0.010,
        "ownership_required": 1
    },

    {
        "asset_size": 900,
        "importance": 2,
        "update_frequency": 90,
        "transaction_cost": 0.080,
        "ownership_required": 0
    },

    {
        "asset_size": 150,
        "importance": 8,
        "update_frequency": 10,
        "transaction_cost": 0.020,
        "ownership_required": 1
    },

    {
        "asset_size": 800,
        "importance": 3,
        "update_frequency": 80,
        "transaction_cost": 0.070,
        "ownership_required": 0
    }
])

sample_predictions = model.predict(
    sample_data[features]
)

sample_probabilities = model.predict_proba(
    sample_data[features]
)

for i, (
    prediction,
    probabilities
) in enumerate(
    zip(
        sample_predictions,
        sample_probabilities
    ),
    start=1
):

    confidence = (
        float(
            np.max(probabilities)
        ) * 100
    )

    print(
        f"Sample {i}: "
        f"{prediction}, "
        f"{confidence:.2f}%"
    )


# ============================================================
# 14. VERIFY DATASET
# ============================================================

print("\n" + "=" * 70)
print("DATASET VERIFICATION")
print("=" * 70)

saved_df = pd.read_csv(
    dataset_path
)

print(
    f"\nVerified CSV records : "
    f"{len(saved_df):,}"
)

print(
    f"Verified CSV columns : "
    f"{len(saved_df.columns)}"
)

if len(saved_df) == 50000:

    print(
        "\nSUCCESS: CSV contains exactly "
        "50,000 records."
    )

else:

    print(
        "\nWARNING: CSV does not contain "
        "50,000 records."
    )


# ============================================================
# 15. FINAL FILE LOCATIONS
# ============================================================

print("\n" + "=" * 70)
print("FILES CREATED")
print("=" * 70)

print(
    f"\nDataset:\n{dataset_path}"
)

print(
    f"\nModel:\n{model_path}"
)

print(
    f"\nModel information:\n{model_info_path}"
)

print("\n" + "=" * 70)
print("AI MODEL TRAINING COMPLETED SUCCESSFULLY.")
print("=" * 70)