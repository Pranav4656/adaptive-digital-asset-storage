# 🌍 AI + Blockchain Virtual World

## Overview

This project implements an **AI-Based Hybrid Blockchain Storage Decision System** within a virtual world environment.

The system uses a **Random Forest Classifier** to automatically determine whether a digital asset should be stored **ON\_CHAIN** on a blockchain or **OFF\_CHAIN** using backend storage.

The project combines:

* 🌍 3D Virtual World
* 🤖 Artificial Intelligence
* ⛓️ Blockchain
* 🦊 MetaMask Wallet
* 💾 Off-chain Storage
* 📊 Experimental Analysis

\---

## 🎯 Project Objective

The main objective of this project is to develop an intelligent storage decision system that selects an appropriate storage location for digital assets based on their characteristics.

The AI system analyzes five asset features:

1. Asset Size
2. Importance
3. Update Frequency
4. Transaction Cost
5. Ownership Required

Based on these characteristics, the Random Forest model predicts:

```text
ON\_CHAIN
```

or

```text
OFF\_CHAIN
```

The selected storage method is then demonstrated through the virtual-world application.

\---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │   3D Virtual World  │
                    │    React + Three.js │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Digital Asset     │
                    │     Generation      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      AI Model       │
                    │ Random Forest       │
                    │    Classifier       │
                    └──────────┬──────────┘
                               │
                     ┌─────────┴─────────┐
                     │                   │
                     ▼                   ▼
               ┌───────────┐       ┌───────────┐
               │ ON\_CHAIN  │       │ OFF\_CHAIN │
               └─────┬─────┘       └─────┬─────┘
                     │                   │
                     ▼                   ▼
              ┌────────────┐       ┌────────────┐
              │ Blockchain │       │   Flask    │
              │  Network   │       │  Backend   │
              └────────────┘       └────────────┘
```

\---

## 🤖 AI Model

The project uses a **Random Forest Classifier** for storage decision prediction.

### Model Configuration

|Parameter|Value|
|-|-:|
|Algorithm|Random Forest Classifier|
|Number of Estimators|150|
|Maximum Depth|10|
|Minimum Samples Split|5|
|Minimum Samples Leaf|2|
|Random State|42|

\---

## 📊 Dataset

The model was trained using a **synthetic dataset containing 50,000 records**.

### Dataset Split

|Dataset|Records|
|-|-:|
|Total|50,000|
|Training|40,000|
|Testing|10,000|

The dataset contains two target classes:

```text
OFF\_CHAIN = 25,000
ON\_CHAIN  = 25,000
```

### Features

```text
asset\_size
importance
update\_frequency
transaction\_cost
ownership\_required
```

### Target

```text
storage\_decision
```

Possible target values:

```text
ON\_CHAIN
OFF\_CHAIN
```

\---

## 📈 AI Model Evaluation

The trained model achieved the following results on the test dataset:

|Metric|Result|
|-|-:|
|Accuracy|90.01%|
|Precision|90.08%|
|Recall|89.92%|
|F1-Score|90.00%|

### Confusion Matrix

|Actual / Predicted|OFF\_CHAIN|ON\_CHAIN|
|-|-:|-:|
|OFF\_CHAIN|4505|495|
|ON\_CHAIN|504|4496|

\---

## ⭐ Feature Importance

The Random Forest model produced the following feature importance values:

|Feature|Importance|
|-|-:|
|Ownership Required|76.05%|
|Importance|10.07%|
|Asset Size|6.00%|
|Update Frequency|4.16%|
|Transaction Cost|3.72%|

These values indicate the relative contribution of each input feature to the model's decision process.

\---

## ⛓️ Blockchain

The blockchain component uses a **Hardhat local network**.

### Network

```text
Network: Hardhat Local Network
Chain ID: 31337
RPC: http://127.0.0.1:8545
```

### Smart Contract Functions

The smart contract provides functionality for:

* Claiming virtual land
* Checking land ownership
* Transferring land
* Storing digital asset references
* Retrieving stored digital assets

### Current Contract Address

```text
0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

\---

## 🦊 MetaMask

MetaMask is used to connect the user's wallet to the local blockchain network.

The application supports:

1. Connecting the wallet
2. Claiming virtual land
3. Verifying blockchain ownership
4. Confirming ON\_CHAIN asset transactions

\---

## 💾 OFF\_CHAIN Storage

Assets classified as `OFF\_CHAIN` are stored through the Flask backend.

The backend maintains the records in:

```text
ai/offchain\_assets.json
```

The application can retrieve these records and verify the number of stored OFF\_CHAIN assets.

\---

## 🔄 Application Workflow

### Step 1 — Connect Wallet

The user connects MetaMask to the application.

### Step 2 — Claim Land

The user claims Virtual Land #1 through the blockchain.

### Step 3 — Generate Digital Asset

The user creates a digital asset inside the virtual world.

### Step 4 — Generate Asset Characteristics

The system generates characteristics including:

```text
Asset Size
Importance
Update Frequency
Transaction Cost
Ownership Required
```

### Step 5 — AI Prediction

The characteristics are sent to the Flask AI API.

The Random Forest model predicts:

```text
ON\_CHAIN
```

or

```text
OFF\_CHAIN
```

and returns a confidence value.

### Step 6 — Storage

If the prediction is:

```text
ON\_CHAIN
```

the asset reference is stored through the blockchain smart contract.

If the prediction is:

```text
OFF\_CHAIN
```

the asset reference is stored through the Flask backend.

### Step 7 — Verification

The application can verify:

* Blockchain asset records
* OFF\_CHAIN backend records
* Land ownership
* Transaction information

\---

## 🧪 Research Experiment

The application includes a research experiment feature that allows multiple assets to be tested through the AI storage decision system.

The experiment supports:

```text
10 Assets
50 Assets
100 Assets
```

The experiment records:

* Number of assets tested
* ON\_CHAIN decisions
* OFF\_CHAIN decisions
* Average confidence
* Blockchain transactions
* Individual asset results

\---

## 📊 Current Demonstration Results

During the current application demonstration:

```text
Assets Tested: 14

ON\_CHAIN: 6
OFF\_CHAIN: 8

Blockchain Transactions: 6

Average Confidence: 99.98%
```

The application also provides accumulated storage verification information from the blockchain and OFF\_CHAIN backend.

\---

## 🖥️ Technologies Used

### Frontend

```text
React
Vite
Three.js
React Three Fiber
React Three Drei
JavaScript
CSS
```

### Backend

```text
Python
Flask
Flask-CORS
```

### Artificial Intelligence

```text
Python
Pandas
NumPy
Scikit-learn
Joblib
Random Forest
```

### Blockchain

```text
Solidity
Hardhat
Ethers.js
MetaMask
```

### Storage

```text
Blockchain
JSON-based OFF\_CHAIN storage
Browser LocalStorage
```

\---

## 📁 Project Structure

```text
adaptive-digital-asset-storage/
│
├── ai/
│   ├── api.py
│   ├── train\_model.py
│   ├── model\_info.json
│   ├── random\_forest\_model.joblib
│   └── offchain\_assets.json
│
├── data/
│   └── synthetic\_storage\_dataset.csv
│
├── src/
│   ├── blockchain/
│   │   └── contract.js
│   │
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── contracts/
│   └── ...
│
├── scripts/
│   └── deploy.ts
│
├── package.json
├── package-lock.json
├── hardhat.config.ts
└── README.md
```

\---

## ⚙️ Installation

### 1\. Clone or open the project

Open the project folder in VS Code.

```text
virtual-world-blockchain
```

### 2\. Install frontend dependencies

Open the VS Code terminal:

```powershell
npm install
```

### 3\. Create Python virtual environment

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\\.venv\\Scripts\\Activate.ps1
```

### 4\. Install Python dependencies

```powershell
pip install -r requirements.txt
```

\---

# 🚀 Running the Project

The project requires the blockchain, AI API, and React frontend to be running.

## Terminal 1 — Start Hardhat Blockchain

```powershell
npx hardhat node
```

The local blockchain runs on:

```text
http://127.0.0.1:8545
```

If you receive:

```text
EADDRINUSE: address already in use
```

a Hardhat node is already running.

\---

## Terminal 2 — Start AI API

Activate the virtual environment:

```powershell
.\\.venv\\Scripts\\Activate.ps1
```

Then run:

```powershell
python ai\\api.py
```

The AI API runs on:

```text
http://127.0.0.1:5000
```

The model information endpoint is:

```text
http://127.0.0.1:5000/model-info
```

\---

## Terminal 3 — Start React Application

Run:

```powershell
npm run dev
```

Vite will provide a local URL such as:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

\---

# 🔗 Deploying the Smart Contract Locally

If the contract needs to be deployed again:

```powershell
npx hardhat run scripts/deploy.ts --network localhost
```

After deployment, update the contract address in:

```text
src/blockchain/contract.js
```

\---

# 🧪 How to Use the Application

1. Start the Hardhat blockchain.
2. Start the Flask AI API.
3. Start the React application.
4. Open the Vite URL.
5. Connect MetaMask.
6. Switch MetaMask to the Hardhat Local Network.
7. Claim Land #1.
8. Verify ownership.
9. Click a ground block in the virtual world.
10. The system generates an asset.
11. The AI model analyzes the asset.
12. The AI selects ON\_CHAIN or OFF\_CHAIN.
13. The asset is stored using the selected method.
14. Review the result in the Research Results section.
15. Use Storage Verification to verify backend/blockchain records.
16. Export experimental records using the Research CSV button.

\---

# 📥 Research Data Export

The application provides a CSV export containing experimental information such as:

```text
Asset ID
Scenario
AI Decision
Confidence
Storage Location
Asset Size
Importance
Update Frequency
Transaction Cost
Ownership Required
Owner
Asset Reference
Transaction Hash
Timestamp
```

The exported file is:

```text
virtual\_world\_research\_results.csv
```

\---

# 📌 Research Limitations

This implementation has several limitations:

* The machine-learning dataset is synthetic.
* The generated application asset characteristics are simulated.
* The blockchain demonstration uses a local Hardhat network.
* OFF\_CHAIN storage is implemented using backend JSON storage.
* The system has not been evaluated using a production blockchain.
* The model results should not be interpreted as real-world production performance.

Therefore, the reported model metrics represent the performance of the implemented model on the synthetic dataset used in this project.

\---

# 🔮 Future Work

Possible future improvements include:

* Testing with larger and real-world datasets.
* Integration with a public blockchain network.
* Decentralized off-chain storage such as IPFS.
* More advanced machine-learning models.
* Dynamic gas-cost monitoring.
* Real-time storage-cost optimization.
* Security and smart-contract auditing.
* Large-scale performance benchmarking.
* Automated blockchain transaction management.

\---

# 📜 Research Summary

This project demonstrates a hybrid storage architecture in which artificial intelligence determines whether digital assets should be stored on-chain or off-chain.

The Random Forest model achieved:

```text
Accuracy  : 90.01%
Precision : 90.08%
Recall    : 89.92%
F1-Score  : 90.00%
```

The integrated application demonstrates the complete workflow from digital asset generation and AI-based classification to blockchain or backend storage and verification.

\---

## 👨‍💻 Project

**AI-Based Hybrid Blockchain Storage Decision System**

**Environment:**

```text
React + Three.js
        +
Flask + Random Forest
        +
Hardhat + Solidity
        +
MetaMask
        +
Hybrid Storage



