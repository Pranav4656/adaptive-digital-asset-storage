from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import json
from datetime import datetime, timezone


app = Flask(__name__)
CORS(app)


# ==========================================
# PATHS
# ==========================================

BASE_DIR = os.path.dirname(__file__)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "random_forest_model.joblib"
)

STORAGE_FILE = os.path.join(
    BASE_DIR,
    "offchain_assets.json"
)

MODEL_INFO_FILE = os.path.join(
    BASE_DIR,
    "model_info.json"
)


# ==========================================
# LOAD AI MODEL
# ==========================================

model = joblib.load(
    MODEL_PATH
)


# ==========================================
# INITIALIZE OFF-CHAIN STORAGE
# ==========================================

if not os.path.exists(STORAGE_FILE):

    with open(
        STORAGE_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            [],
            file,
            indent=4
        )


# ==========================================
# HEALTH CHECK
# ==========================================

@app.route(
    "/health",
    methods=["GET"]
)
def health():

    return jsonify({
        "success": True,
        "service": "AI Storage Decision API",
        "status": "running",
        "model": "Random Forest Classifier"
    })


# ==========================================
# MODEL INFORMATION
# ==========================================
#
# Reads the exact saved model information
# from ai/model_info.json.
# ==========================================

@app.route(
    "/model-info",
    methods=["GET"]
)
def model_info():

    try:

        with open(
            MODEL_INFO_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            information = json.load(file)

        return jsonify({
            "success": True,
            "model": information
        })

    except FileNotFoundError:

        return jsonify({
            "success": False,
            "error": "model_info.json not found."
        }), 404

    except json.JSONDecodeError:

        return jsonify({
            "success": False,
            "error": "model_info.json is invalid."
        }), 500


# ==========================================
# AI STORAGE DECISION
# ==========================================

@app.route(
    "/predict",
    methods=["POST"]
)
def predict():

    data = request.json or {}


    # ======================================
    # READ INPUT FEATURES
    # ======================================

    try:

        asset_size = float(
            data.get(
                "asset_size",
                100
            )
        )

        importance = float(
            data.get(
                "importance",
                5
            )
        )

        update_frequency = float(
            data.get(
                "update_frequency",
                10
            )
        )

        transaction_cost = float(
            data.get(
                "transaction_cost",
                0.02
            )
        )

        ownership_required = int(
            data.get(
                "ownership_required",
                1
            )
        )

    except (TypeError, ValueError):

        return jsonify({
            "success": False,
            "error": "Invalid input feature values."
        }), 400


    # ======================================
    # CREATE FEATURE ARRAY
    # ======================================

    features = features = pd.DataFrame([{
    "asset_size": asset_size,
    "importance": importance,
    "update_frequency": update_frequency,
    "transaction_cost": transaction_cost,
    "ownership_required": ownership_required
}])


    # ======================================
    # RANDOM FOREST PREDICTION
    # ======================================
    #
    # IMPORTANT:
    # The trained model returns string labels:
    #
    # ON_CHAIN
    # OFF_CHAIN
    #
    # Therefore we must NOT use int()
    # on model.predict().
    # ======================================

    prediction = model.predict(
        features
    )[0]

    prediction = str(
        prediction
    )


    # ======================================
    # PREDICTION PROBABILITIES
    # ======================================

    probabilities = model.predict_proba(
        features
    )[0]


    # Find the probability belonging to
    # the predicted class.

    try:

        class_index = list(
            model.classes_
        ).index(
            prediction
        )

        confidence = float(
            probabilities[class_index]
        )

    except ValueError:

        return jsonify({
            "success": False,
            "error":
                "Predicted class was not found in model classes."
        }), 500


    # ======================================
    # STORAGE DECISION
    # ======================================

    decision = prediction


    # ======================================
    # RETURN RESULT
    # ======================================

    return jsonify({

        "success": True,

        "decision":
            decision,

        "confidence":
            round(
                confidence * 100,
                2
            ),

        "asset_size":
            asset_size,

        "importance":
            importance,

        "update_frequency":
            update_frequency,

        "transaction_cost":
            transaction_cost,

        "ownership_required":
            ownership_required

    })


# ==========================================
# STORE OFF-CHAIN ASSET
# ==========================================

@app.route(
    "/store-offchain",
    methods=["POST"]
)
def store_offchain():

    data = request.json or {}


    asset_id = data.get(
        "asset_id"
    )

    land_id = data.get(
        "land_id"
    )

    owner = data.get(
        "owner"
    )

    asset_reference = data.get(
        "asset_reference"
    )


    # ======================================
    # VALIDATION
    # ======================================

    if asset_id is None:

        return jsonify({
            "success": False,
            "error":
                "asset_id is required"
        }), 400


    if land_id is None:

        return jsonify({
            "success": False,
            "error":
                "land_id is required"
        }), 400


    if not owner:

        return jsonify({
            "success": False,
            "error":
                "owner is required"
        }), 400


    if not asset_reference:

        return jsonify({
            "success": False,
            "error":
                "asset_reference is required"
        }), 400


    # ======================================
    # LOAD EXISTING ASSETS
    # ======================================

    try:

        with open(
            STORAGE_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            assets = json.load(
                file
            )

    except (
        FileNotFoundError,
        json.JSONDecodeError
    ):

        assets = []


    # ======================================
    # CREATE OFF-CHAIN ASSET
    # ======================================

    asset = {

        "asset_id":
            asset_id,

        "land_id":
            land_id,

        "owner":
            owner,

        "asset_reference":
            asset_reference,

        "storage_location":
            "OFF_CHAIN",

        "stored_at":
            datetime.now(
                timezone.utc
            ).isoformat()

    }


    # ======================================
    # SAVE ASSET
    # ======================================

    assets.append(
        asset
    )


    with open(
        STORAGE_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            assets,
            file,
            indent=4
        )


    # ======================================
    # RESPONSE
    # ======================================

    return jsonify({

        "success": True,

        "message":
            "Asset stored off-chain successfully.",

        "asset":
            asset

    })


# ==========================================
# GET OFF-CHAIN ASSETS
# ==========================================

@app.route(
    "/offchain-assets",
    methods=["GET"]
)
def get_offchain_assets():

    try:

        with open(
            STORAGE_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            assets = json.load(
                file
            )

    except (
        FileNotFoundError,
        json.JSONDecodeError
    ):

        assets = []


    return jsonify({

        "success": True,

        "count":
            len(assets),

        "assets":
            assets

    })


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    print(
        "AI Storage Decision API running..."
    )

    print(
        "http://127.0.0.1:5000"
    )

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )