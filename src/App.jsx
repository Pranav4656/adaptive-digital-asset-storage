import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import {
  connectWallet,
  claimLand as claimLandBlockchain,
  getLandOwner,
  storeAssetOnChain,
  getAllOnChainAssets,
} from "./blockchain/contract";

import "./App.css";

const ASSET_HISTORY_KEY = "virtual_world_asset_history";
const OFFCHAIN_API = "http://127.0.0.1:5000";

/* ==========================================
   VIRTUAL WORLD CITY GENERATION
========================================== */

const VIRTUAL_CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Ahmedabad",
];

const generateVirtualCity = () => {
  const index = Math.floor(
    Math.random() * VIRTUAL_CITIES.length
  );

  return VIRTUAL_CITIES[index];
};

/* ==========================================
   VIRTUAL WORLD TIME GENERATION
========================================== */

const generateVirtualTime = () => {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);

  const formattedHour = String(hour).padStart(2, "0");
  const formattedMinute = String(minute).padStart(2, "0");

  return `${formattedHour}:${formattedMinute}`;
};

/* ==========================================
   BLOCK
========================================== */

function Block({
  position,
  color = "#8B4513",
  onClick,
}) {
  return (
    <mesh
      position={position}
      onClick={(event) => {
        event.stopPropagation();

        if (onClick) {
          onClick(position);
        }
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/* ==========================================
   WORLD
========================================== */

function World({
  landClaimed,
  blocks,
  onBlockClick,
}) {
  const groundBlocks = [];

  for (let x = -8; x <= 8; x += 1) {
    for (let z = -8; z <= 8; z += 1) {
      groundBlocks.push(
        <Block
          key={`ground-${x}-${z}`}
          position={[x, -0.5, z]}
          color={
            landClaimed
              ? "#4caf50"
              : "#777777"
          }
          onClick={onBlockClick}
        />
      );
    }
  }

  return (
    <>
      <ambientLight intensity={1.2} />

      <directionalLight
        position={[10, 15, 10]}
        intensity={2}
      />

      {groundBlocks}

      {blocks.map((block) => (
        <Block
          key={block.id}
          position={block.position}
          color={
            block.storageLocation ===
            "BLOCKCHAIN"
              ? "#8B4513"
              : block.storageLocation ===
                "OFF_CHAIN"
              ? "#4169E1"
              : "#777777"
          }
        />
      ))}

      <OrbitControls />
    </>
  );
}

/* ==========================================
   APP
========================================== */

function App() {
  const [blocks, setBlocks] = useState([]);

  const [landClaimed, setLandClaimed] =
    useState(false);

  const [walletAddress, setWalletAddress] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [blockchainStatus, setBlockchainStatus] =
    useState("");

  const [verification, setVerification] =
    useState({
      blockchain: 0,
      offchain: 0,
      status: "",
    });

  const [modelInfo, setModelInfo] =
    useState(null);

  const [modelInfoLoading, setModelInfoLoading] =
    useState(true);

  const [modelInfoError, setModelInfoError] =
    useState("");

  const [experimentSize, setExperimentSize] =
    useState(10);

  const [experimentRunning, setExperimentRunning] =
    useState(false);

  const [experimentProgress, setExperimentProgress] =
    useState(0);

  /* ==========================================
     LOAD AI MODEL INFORMATION
  ========================================== */

  useEffect(() => {
    const loadModelInfo = async () => {
      try {
        setModelInfoLoading(true);
        setModelInfoError("");

        const response = await fetch(
          `${OFFCHAIN_API}/model-info`
        );

        if (!response.ok) {
          throw new Error(
            `Model information API returned HTTP ${response.status}`
          );
        }

        const result =
          await response.json();

        if (!result.success) {
          throw new Error(
            "Model information could not be loaded."
          );
        }

        setModelInfo(result.model);
      } catch (error) {
        console.error(
          "Model information error:",
          error
        );

        setModelInfoError(
          error?.message ||
            "Unable to load AI model information."
        );
      } finally {
        setModelInfoLoading(false);
      }
    };

    loadModelInfo();
  }, []);

  /* ==========================================
     LOAD HISTORY
  ========================================== */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          ASSET_HISTORY_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setBlocks(parsed);
        }
      }
    } catch (error) {
      console.error(
        "History load error:",
        error
      );
    }
  }, []);

  /* ==========================================
     SAVE HISTORY
  ========================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        ASSET_HISTORY_KEY,
        JSON.stringify(blocks)
      );
    } catch (error) {
      console.error(
        "History save error:",
        error
      );
    }
  }, [blocks]);

  /* ==========================================
     LATEST ASSET
  ========================================== */

  const latestAsset =
    blocks.length > 0
      ? blocks[blocks.length - 1]
      : null;

  /* ==========================================
     RESEARCH METRICS
  ========================================== */

  const totalAssets = blocks.length;

  const onChainAssets =
    blocks.filter(
      (block) =>
        block.storageLocation ===
        "BLOCKCHAIN"
    ).length;

  const offChainAssets =
    blocks.filter(
      (block) =>
        block.storageLocation ===
        "OFF_CHAIN"
    ).length;

  const failedAssets =
    blocks.filter(
      (block) =>
        block.storageLocation ===
        "ON_CHAIN_FAILED"
    ).length;

  const successfullyStoredAssets =
    onChainAssets +
    offChainAssets;

  const blockchainTransactions =
    blocks.filter(
      (block) =>
        Boolean(
          block.transactionHash
        )
    ).length;

  const onChainPercentage =
    successfullyStoredAssets > 0
      ? (onChainAssets /
          successfullyStoredAssets) *
        100
      : 0;

  const offChainPercentage =
    successfullyStoredAssets > 0
      ? (offChainAssets /
          successfullyStoredAssets) *
        100
      : 0;

  const averageConfidence =
    totalAssets > 0
      ? (
          blocks.reduce(
            (sum, block) =>
              sum +
              Number(
                block.confidence || 0
              ),
            0
          ) / totalAssets
        ).toFixed(2)
      : "0.00";

  /* ==========================================
     CONNECT WALLET
  ========================================== */

  const handleConnectWallet =
    async () => {
      try {
        setLoading(true);

        setMessage(
          "Connecting wallet..."
        );

        const result =
          await connectWallet();

        setWalletAddress(
          result.address
        );

        setBlockchainStatus(
          `Wallet connected: ${result.address}`
        );

        setMessage(
          "Wallet connected successfully."
        );
      } catch (error) {
        console.error(error);

        setBlockchainStatus(
          error?.message ||
            "Failed to connect wallet."
        );

        setMessage(
          error?.message ||
            "Failed to connect wallet."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ==========================================
     CLAIM LAND
  ========================================== */

  const handleClaimLand =
    async () => {
      if (!walletAddress) {
        setMessage(
          "Please connect your wallet first."
        );

        return;
      }

      try {
        setLoading(true);

        setBlockchainStatus(
          "Waiting for blockchain transaction..."
        );

        setMessage(
          "Waiting for blockchain transaction..."
        );

        await claimLandBlockchain(1);

        setLandClaimed(true);

        setBlockchainStatus(
          "Land #1 claimed successfully on blockchain."
        );

        setMessage(
          "Land #1 claimed successfully on blockchain."
        );
      } catch (error) {
        console.error(error);

        setBlockchainStatus(
          error?.reason ||
            error?.message ||
            "Land claim failed."
        );

        setMessage(
          error?.reason ||
            error?.message ||
            "Land claim failed."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ==========================================
     CREATE BLOCK
  ========================================== */

  const createBlock = (
    position,
    assetId,
    decision,
    confidence,
    assetReference,
    storageLocation,
    transactionHash,
    features,
    scenario,
    city,
    virtualTime
  ) => {
    const newBlock = {
      id: assetId,

      position: [
        position[0],
        position[1] + 1,
        position[2],
      ],

      storageDecision: decision,

      confidence,

      assetReference,

      storageLocation,

      transactionHash,

      owner: walletAddress,

      scenario,

      features,

      city,

      virtualTime,

      timestamp:
        new Date().toISOString(),
    };

    setBlocks((previous) => [
      ...previous,
      newBlock,
    ]);

    return newBlock;
  };

  /* ==========================================
     GENERATE ASSET PROFILE
     
     NOTE:
     City and Time are virtual-world context.
     They are NOT sent to the existing RF model.
  ========================================== */

  const generateAssetFeatures =
    () => {
      const offChainScenario =
        Math.random() < 0.5;

      const city =
        generateVirtualCity();

      const virtualTime =
        generateVirtualTime();

      if (offChainScenario) {
        return {
          features: {
            asset_size:
              Math.floor(
                Math.random() * 301
              ) + 700,

            importance:
              Math.floor(
                Math.random() * 5
              ) + 1,

            update_frequency:
              Math.floor(
                Math.random() * 31
              ) + 70,

            transaction_cost:
              Number(
                (
                  Math.random() *
                    0.04 +
                  0.06
                ).toFixed(3)
              ),

            ownership_required: 0,
          },

          scenario:
            "Data-Heavy / Frequently Updated",

          city,

          virtualTime,
        };
      }

      return {
        features: {
          asset_size:
            Math.floor(
              Math.random() * 181
            ) + 20,

          importance:
            Math.floor(
              Math.random() * 4
            ) + 7,

          update_frequency:
            Math.floor(
              Math.random() * 20
            ) + 1,

          transaction_cost:
            Number(
              (
                Math.random() *
                  0.029 +
                0.001
              ).toFixed(3)
            ),

          ownership_required: 1,
        },

        scenario:
          "Secure / Important Asset",

        city,

        virtualTime,
      };
    };

  /* ==========================================
     PROCESS ONE RESEARCH ASSET
  ========================================== */

  const processResearchAsset = async (
    position,
    index
  ) => {
    const generated = generateAssetFeatures();
    const aiInput = generated.features;

    console.log(`Research Asset ${index + 1}:`, {
      city: generated.city,
      virtualTime: generated.virtualTime,
      features: aiInput,
    });

    const response = await fetch(
      `${OFFCHAIN_API}/predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aiInput),
      }
    );

    if (!response.ok) {
      throw new Error(
        `AI API returned HTTP ${response.status}`
      );
    }

    const result = await response.json();

    if (
      !result.success ||
      !result.decision ||
      result.confidence === undefined
    ) {
      throw new Error(
        "AI API returned an invalid prediction."
      );
    }

    const assetId =
      Date.now() +
      index +
      Math.floor(Math.random() * 1000);

    const assetReference =
      `VirtualWorldAsset-${assetId}`;

    /* ==============================
       ON-CHAIN
    ============================== */

    if (result.decision === "ON_CHAIN") {
      setMessage(
        `Asset ${index + 1}/${experimentSize}: ON_CHAIN selected | ${generated.city} | ${generated.virtualTime}`
      );

      try {
        setMessage(
          `Asset ${index + 1}/${experimentSize}: Confirm ON_CHAIN transaction in MetaMask...`
        );

        const transaction =
          await storeAssetOnChain(
            assetId,
            1,
            assetReference
          );

        return {
          id: assetId,
          position: [
            position[0],
            position[1] + 1,
            position[2],
          ],
          storageDecision: result.decision,
          confidence: result.confidence,
          assetReference,
          storageLocation: "BLOCKCHAIN",
          transactionHash: transaction.hash,
          owner: walletAddress,
          scenario: generated.scenario,
          features: aiInput,
          city: generated.city,
          virtualTime: generated.virtualTime,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error(
          `ON_CHAIN asset ${index + 1} failed:`,
          error
        );

        return {
          id: assetId,
          position: [
            position[0],
            position[1] + 1,
            position[2],
          ],
          storageDecision: result.decision,
          confidence: result.confidence,
          assetReference,
          storageLocation: "ON_CHAIN_FAILED",
          transactionHash: null,
          owner: walletAddress,
          scenario: generated.scenario,
          features: aiInput,
          city: generated.city,
          virtualTime: generated.virtualTime,
          error:
            error?.reason ||
            error?.message ||
            "Blockchain transaction rejected or failed.",
          timestamp: new Date().toISOString(),
        };
      }
    }

    /* ==============================
       OFF-CHAIN
    ============================== */

    setMessage(
      `Asset ${index + 1}/${experimentSize}: OFF_CHAIN selected | ${generated.city} | ${generated.virtualTime}`
    );

    const offChainReference =
      `OffChainAsset-${assetId}`;

    const storageResponse =
      await fetch(
        `${OFFCHAIN_API}/store-offchain`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            asset_id: assetId,
            land_id: 1,
            owner: walletAddress,
            asset_reference:
              offChainReference,
          }),
        }
      );

    if (!storageResponse.ok) {
      throw new Error(
        `Off-chain storage failed with HTTP ${storageResponse.status}`
      );
    }

    const storageResult =
      await storageResponse.json();

    if (!storageResult.success) {
      throw new Error(
        "Off-chain storage failed."
      );
    }

    return {
      id: assetId,
      position: [
        position[0],
        position[1] + 1,
        position[2],
      ],
      storageDecision: result.decision,
      confidence: result.confidence,
      assetReference: offChainReference,
      storageLocation: "OFF_CHAIN",
      transactionHash: null,
      owner: walletAddress,
      scenario: generated.scenario,
      features: aiInput,
      city: generated.city,
      virtualTime: generated.virtualTime,
      timestamp: new Date().toISOString(),
    };
  };

  /* ==========================================
     RUN RESEARCH EXPERIMENT
  ========================================== */

  const handleRunResearchExperiment =
    async () => {
      console.log(
        "Research experiment button clicked"
      );

      if (!walletAddress) {
        setMessage(
          "Please connect your wallet first."
        );
        return;
      }

      if (!landClaimed) {
        setMessage(
          "Claim and verify Land #1 before running the research experiment."
        );
        return;
      }

      if (experimentRunning) {
        return;
      }

      const confirmed = window.confirm(
        `Run a ${experimentSize}-asset research experiment?\n\n` +
          "Each asset will receive a virtual city and virtual time.\n\n" +
          "The five existing Random Forest features remain unchanged.\n\n" +
          "OFF_CHAIN assets are stored automatically.\n" +
          "ON_CHAIN assets require MetaMask confirmation.\n\n" +
          "Continue?"
      );

      if (!confirmed) {
        return;
      }

      setExperimentRunning(true);
      setExperimentProgress(0);
      setMessage(
        `Starting ${experimentSize}-asset research experiment...`
      );

      try {
        for (
          let i = 0;
          i < experimentSize;
          i++
        ) {
          const gridIndex = i % 225;
          const x =
            -7 + (gridIndex % 15);
          const z =
            -7 + Math.floor(gridIndex / 15);

          const position = [
            x,
            -0.5,
            z,
          ];

          try {
            const newBlock =
              await processResearchAsset(
                position,
                i
              );

            if (newBlock) {
              setBlocks(
                (previous) => [
                  ...previous,
                  newBlock,
                ]
              );
            }
          } catch (assetError) {
            console.error(
              `Research asset ${i + 1} failed:`,
              assetError
            );

            setMessage(
              `Asset ${i + 1}/${experimentSize} failed: ${assetError?.message || "Unknown error"}. Continuing...`
            );
          }

          setExperimentProgress(
            i + 1
          );

          await new Promise(
            (resolve) =>
              setTimeout(resolve, 100)
          );
        }

        setMessage(
          `${experimentSize}-asset research experiment completed successfully.`
        );
      } catch (error) {
        console.error(
          "Research experiment error:",
          error
        );

        setMessage(
          error?.message ||
            "Research experiment could not be completed."
        );
      } finally {
        setExperimentRunning(false);
      }
    };

  /* ==========================================
     NORMAL ASSET CREATION
  ========================================== */

  const handleBlockClick =
    async (position) => {
      if (!landClaimed) {
        setMessage(
          "Claim Land #1 before creating blocks."
        );

        return;
      }

      if (!walletAddress) {
        setMessage(
          "Please connect your wallet first."
        );

        return;
      }

      if (loading) {
        return;
      }

      try {
        setLoading(true);

        setMessage(
          "Generating asset, virtual city, virtual time and analyzing it with AI..."
        );

        const generated =
          generateAssetFeatures();

        const aiInput =
          generated.features;

        const response =
          await fetch(
            `${OFFCHAIN_API}/predict`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                aiInput
              ),
            }
          );

        if (!response.ok) {
          throw new Error(
            `AI API returned HTTP ${response.status}`
          );
        }

        const result =
          await response.json();

        if (
          !result.decision ||
          result.confidence ===
            undefined
        ) {
          throw new Error(
            "AI API returned an invalid prediction."
          );
        }

        const assetId =
          Date.now() +
          Math.floor(
            Math.random() * 1000
          );

        const assetReference =
          `VirtualWorldAsset-${assetId}`;

        /* ==============================
           ON-CHAIN
        ============================== */

        if (
          result.decision ===
          "ON_CHAIN"
        ) {
          setMessage(
            `AI selected ON_CHAIN for ${generated.city} at ${generated.virtualTime}. Waiting for blockchain transaction...`
          );

          const transaction =
            await storeAssetOnChain(
              assetId,
              1,
              assetReference
            );

          createBlock(
            position,
            assetId,
            result.decision,
            result.confidence,
            assetReference,
            "BLOCKCHAIN",
            transaction.hash,
            aiInput,
            generated.scenario,
            generated.city,
            generated.virtualTime
          );

          setMessage(
            `Asset stored ON_CHAIN. City: ${generated.city} | Time: ${generated.virtualTime} | Transaction: ${transaction.hash.slice(
              0,
              10
            )}...`
          );
        }

        /* ==============================
           OFF-CHAIN
        ============================== */

        else {
          setMessage(
            `AI selected OFF_CHAIN for ${generated.city} at ${generated.virtualTime}. Saving asset...`
          );

          const offChainReference =
            `OffChainAsset-${assetId}`;

          const storageResponse =
            await fetch(
              `${OFFCHAIN_API}/store-offchain`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  asset_id: assetId,

                  land_id: 1,

                  owner:
                    walletAddress,

                  asset_reference:
                    offChainReference,
                }),
              }
            );

          if (
            !storageResponse.ok
          ) {
            throw new Error(
              `Off-chain storage failed with HTTP ${storageResponse.status}`
            );
          }

          const storageResult =
            await storageResponse.json();

          if (
            !storageResult.success
          ) {
            throw new Error(
              "Off-chain storage failed."
            );
          }

          createBlock(
            position,
            assetId,
            result.decision,
            result.confidence,
            offChainReference,
            "OFF_CHAIN",
            null,
            aiInput,
            generated.scenario,
            generated.city,
            generated.virtualTime
          );

          setMessage(
            `Asset stored OFF_CHAIN successfully. City: ${generated.city} | Time: ${generated.virtualTime}`
          );
        }
      } catch (error) {
        console.error(
          "Asset storage error:",
          error
        );

        setMessage(
          error?.message ||
            "Unable to store digital asset."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ==========================================
     VERIFY OWNERSHIP
  ========================================== */

  const handleVerifyOwnership =
    async () => {
      try {
        setLoading(true);

        setBlockchainStatus(
          "Checking blockchain ownership..."
        );

        setMessage(
          "Checking blockchain ownership..."
        );

        const owner =
          await getLandOwner(1);

        const zeroAddress =
          "0x0000000000000000000000000000000000000000";

        if (
          owner.toLowerCase() ===
          zeroAddress.toLowerCase()
        ) {
          setLandClaimed(false);

          setBlockchainStatus(
            "Land #1 is not currently claimed."
          );

          setMessage(
            "Land #1 is not currently claimed."
          );
        } else {
          setLandClaimed(true);

          const normalizedOwner =
            owner.toLowerCase();

          const connectedWallet =
            walletAddress.toLowerCase();

          if (normalizedOwner === connectedWallet) {
            setBlockchainStatus(
              `Ownership verified. Land #1 owner: ${owner}`
            );
          } else {
            setBlockchainStatus(
              `Land #1 is owned by ${owner}. Connected wallet is not the owner.`
            );
          }

          setMessage(
            `Land #1 owner: ${owner}`
          );
        }
      } catch (error) {
        console.error(error);

        setBlockchainStatus(
          error?.message ||
            "Unable to verify ownership."
        );

        setMessage(
          error?.message ||
            "Unable to verify ownership."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ==========================================
     VERIFY REAL STORAGE
  ========================================== */

  const handleVerifyStorage =
    async () => {
      try {
        setLoading(true);

        setVerification({
          blockchain: 0,
          offchain: 0,
          status:
            "Verifying...",
        });

        const [
          onChainRecords,
          offChainResponse,
        ] = await Promise.all([
          getAllOnChainAssets(),

          fetch(
            `${OFFCHAIN_API}/offchain-assets`
          ),
        ]);

        if (
          !offChainResponse.ok
        ) {
          throw new Error(
            `OFF_CHAIN API returned HTTP ${offChainResponse.status}`
          );
        }

        const offChainResult =
          await offChainResponse.json();

        const offChainRecords =
          offChainResult.assets ||
          [];

        setVerification({
          blockchain:
            onChainRecords.length,

          offchain:
            offChainRecords.length,

          status:
            "Storage verification completed successfully.",
        });

        setMessage(
          `Verified ${onChainRecords.length} blockchain records and ${offChainRecords.length} OFF_CHAIN records.`
        );
      } catch (error) {
        console.error(
          "Storage verification error:",
          error
        );

        setVerification(
          (previous) => ({
            ...previous,
            status:
              "Verification failed.",
          })
        );

        setMessage(
          error?.message ||
            "Unable to verify storage."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ==========================================
     EXPORT CSV
  ========================================== */

  const handleExportCSV =
    () => {
      if (blocks.length === 0) {
        setMessage(
          "No experimental records available for export."
        );

        return;
      }

      const headers = [
        "Asset_ID",
        "Scenario",
        "Virtual_City",
        "Virtual_Time",
        "AI_Decision",
        "Confidence",
        "Storage_Location",
        "Asset_Size",
        "Importance",
        "Update_Frequency",
        "Transaction_Cost",
        "Ownership_Required",
        "Owner",
        "Asset_Reference",
        "Transaction_Hash",
        "Timestamp",
      ];

      const rows =
        blocks.map(
          (block) => [
            block.id,

            block.scenario || "",

            block.city || "",

            block.virtualTime || "",

            block.storageDecision ||
              "",

            block.confidence ?? "",

            block.storageLocation ||
              "",

            block.features
              ?.asset_size ?? "",

            block.features
              ?.importance ?? "",

            block.features
              ?.update_frequency ??
              "",

            block.features
              ?.transaction_cost ??
              "",

            block.features
              ?.ownership_required ??
              "",

            block.owner || "",

            block.assetReference ||
              "",

            block.transactionHash ||
              "",

            block.timestamp || "",
          ]
        );

      const csv = [
        headers,
        ...rows,
      ]
        .map((row) =>
          row
            .map((value) => {
              const text =
                String(
                  value ?? ""
                );

              return `"${text.replace(
                /"/g,
                '""'
              )}"`;
            })
            .join(",")
        )
        .join("\n");

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "virtual_world_research_results.csv";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );

      setMessage(
        "Research CSV exported successfully with virtual city and time data."
      );
    };

  /* ==========================================
     CLEAR HISTORY
  ========================================== */

  const handleClearHistory =
    () => {
      const confirmed =
        window.confirm(
          "Clear browser asset history?"
        );

      if (!confirmed) {
        return;
      }

      setBlocks([]);

      localStorage.removeItem(
        ASSET_HISTORY_KEY
      );

      setMessage(
        "Browser asset history cleared."
      );
    };

  /* ==========================================
     FEATURE IMPORTANCE
  ========================================== */

  const featureImportanceEntries =
    modelInfo?.feature_importance
      ? Object.entries(
          modelInfo.feature_importance
        ).sort(
          ([, a], [, b]) =>
            Number(b) -
            Number(a)
        )
      : [];

  const formatFeatureName =
    (name) =>
      name
        .replaceAll("_", " ")
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );

  /* ==========================================
     METRIC FORMATTER
  ========================================== */

  const formatMetric =
    (value) => {
      if (
        value ===
          undefined ||
        value === null
      ) {
        return "—";
      }

      return (
        Number(value) *
          100
      ).toFixed(2) + "%";
    };

  /* ==========================================
     GRAPHICAL ANALYSIS DATA
  ========================================== */

  const performanceMetrics =
    modelInfo
      ? [
          {
            label:
              "Accuracy",

            value: Number(
              modelInfo.accuracy ||
                0
            ),
          },

          {
            label:
              "Precision",

            value: Number(
              modelInfo.precision ||
                0
            ),
          },

          {
            label: "Recall",

            value: Number(
              modelInfo.recall ||
                0
            ),
          },

          {
            label:
              "F1-Score",

            value: Number(
              modelInfo.f1_score ||
                0
            ),
          },
        ]
      : [];

  const confusionMatrix =
    modelInfo?.confusion_matrix ||
    [
      [0, 0],
      [0, 0],
    ];

  /* ==========================================
     UI
  ========================================== */

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>
            🌍 Virtual World
          </h1>

          <p>
            AI + Blockchain Virtual
            World
          </p>
        </div>

        <button
          className="wallet"
          onClick={
            handleConnectWallet
          }
          disabled={loading}
        >
          {walletAddress
            ? `🔗 ${walletAddress.slice(
                0,
                6
              )}...${walletAddress.slice(
                -4
              )}`
            : "🔗 Connect Wallet"}
        </button>
      </header>

      <div className="main">
        {/* WORLD */}

        <div className="world">
          <Canvas
            camera={{
              position: [
                12,
                12,
                12,
              ],
              fov: 50,
            }}
          >
            <World
              landClaimed={
                landClaimed
              }
              blocks={blocks}
              onBlockClick={
                handleBlockClick
              }
            />
          </Canvas>
        </div>

        {/* PANEL */}

        <div className="panel">
          {/* PLAYER */}

          <div className="card">
            <h2>
              👤 Player
            </h2>

            <p>
              <strong>
                Status
              </strong>
              <br />
              Online
            </p>

            <p>
              <strong>
                Wallet
              </strong>
              <br />
              {walletAddress
                ? `${walletAddress.slice(
                    0,
                    6
                  )}...${walletAddress.slice(
                    -4
                  )}`
                : "Not connected"}
            </p>

            <p>
              <strong>
                Virtual Land
              </strong>
              <br />
              {landClaimed
                ? "✅ Claimed"
                : "❌ Not Claimed"}
            </p>

            <p>
              <strong>
                Ownership
              </strong>
              <br />
              {landClaimed
                ? "🔗 Blockchain Verified"
                : "⏳ Not Verified"}
            </p>
          </div>

          {/* LAND */}

          <div className="card">
            <button
              className="claim"
              onClick={
                handleClaimLand
              }
              disabled={
                loading ||
                !walletAddress ||
                landClaimed
              }
            >
              🏞️ Claim Land #1
            </button>

            <button
              className="wallet"
              onClick={
                handleVerifyOwnership
              }
              disabled={
                loading
              }
            >
              🔍 Verify Ownership
            </button>
          </div>

          {/* STATUS */}

          <div className="card">
            <h2>
              Blockchain Status
            </h2>

            <p>
              {blockchainStatus ||
                "Connect your wallet to begin."}
            </p>
          </div>

          {/* AI */}

          <div className="card">
            <h2>
              🤖 AI Storage Decision
            </h2>

            <p>
              <strong>
                Decision
              </strong>
              <br />
              {latestAsset
                ? latestAsset.storageDecision
                : "Waiting for asset"}
            </p>

            <p>
              <strong>
                Confidence
              </strong>
              <br />
              {latestAsset
                ? `${latestAsset.confidence}%`
                : "—"}
            </p>

            <p>
              <strong>
                AI Model
              </strong>
              <br />
              {modelInfo?.algorithm ||
                "Random Forest"}
            </p>
          </div>

          {/* VIRTUAL WORLD CONTEXT */}

          <div className="card">
            <h2>
              🌆 Virtual World Context
            </h2>

            <p>
              Time and city are
              generated for each
              digital asset to
              represent its virtual
              world environment.
            </p>

            <p>
              <strong>
                Current Asset City
              </strong>
              <br />
              {latestAsset?.city ||
                "Waiting for asset"}
            </p>

            <p>
              <strong>
                Virtual Time
              </strong>
              <br />
              {latestAsset?.virtualTime ||
                "Waiting for asset"}
            </p>

            <p>
              <strong>
                RF Model Features
              </strong>
              <br />
              5 existing features
            </p>

            <p>
              <strong>
                City/Time
              </strong>
              <br />
              Context variables
            </p>
          </div>

          {/* RESEARCH EXPERIMENT */}

          <div className="card experiment-control-card">
            <h2>
              🧪 Research Experiment
            </h2>

            <p>
              Run multiple assets
              through the actual
              AI storage decision
              system with virtual
              city and time generation.
            </p>

            <p>
              <strong>
                Assets to Test
              </strong>
            </p>

            <select
              className="experiment-select"
              value={
                experimentSize
              }
              onChange={(event) =>
                setExperimentSize(
                  Number(
                    event.target
                      .value
                  )
                )
              }
              disabled={
                loading ||
                experimentRunning
              }
            >
              <option value={10}>
                10 Assets
              </option>

              <option value={50}>
                50 Assets
              </option>

              <option value={100}>
                100 Assets
              </option>
            </select>

            <button
              className="experiment-button"
              onClick={
                handleRunResearchExperiment
              }
              disabled={
                experimentRunning ||
                !walletAddress ||
                !landClaimed
              }
            >
              {experimentRunning
                ? `⏳ Running ${experimentProgress}/${experimentSize}`
                : "🧪 Run Research Experiment"}
            </button>

            {experimentRunning && (
              <div className="experiment-progress">
                <div className="experiment-progress-track">
                  <div
                    className="experiment-progress-fill"
                    style={{
                      width: `${
                        experimentSize >
                        0
                          ? (experimentProgress /
                              experimentSize) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <small>
                  {
                    experimentProgress
                  }{" "}
                  /{" "}
                  {
                    experimentSize
                  }{" "}
                  assets processed
                </small>
              </div>
            )}
          </div>

          {/* AI MODEL EVALUATION */}

          <div className="card">
            <h2>
              📈 AI Model Evaluation
            </h2>

            {modelInfoLoading ? (
              <p>
                Loading AI model
                information...
              </p>
            ) : modelInfoError ? (
              <p className="status-error">
                ❌{" "}
                {
                  modelInfoError
                }
              </p>
            ) : modelInfo ? (
              <>
                <div className="model-accuracy-box">
                  <span>
                    Model Accuracy
                  </span>

                  <strong>
                    {formatMetric(
                      modelInfo.accuracy
                    )}
                  </strong>
                </div>

                <h3>
                  Performance Metrics
                </h3>

                <div className="metric-grid">
                  <div className="metric-card">
                    <span>
                      Precision
                    </span>

                    <strong>
                      {formatMetric(
                        modelInfo.precision
                      )}
                    </strong>
                  </div>

                  <div className="metric-card">
                    <span>
                      Recall
                    </span>

                    <strong>
                      {formatMetric(
                        modelInfo.recall
                      )}
                    </strong>
                  </div>

                  <div className="metric-card full">
                    <span>
                      F1-Score
                    </span>

                    <strong>
                      {formatMetric(
                        modelInfo.f1_score
                      )}
                    </strong>
                  </div>
                </div>

                <h3>
                  Confusion Matrix
                </h3>

                <div className="matrix-table-wrapper">
                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th>
                          Actual /
                          Predicted
                        </th>

                        <th>
                          OFF_CHAIN
                        </th>

                        <th>
                          ON_CHAIN
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <th>
                          OFF_CHAIN
                        </th>

                        <td>
                          {confusionMatrix?.[0]?.[0] ??
                            "—"}
                        </td>

                        <td>
                          {confusionMatrix?.[0]?.[1] ??
                            "—"}
                        </td>
                      </tr>

                      <tr>
                        <th>
                          ON_CHAIN
                        </th>

                        <td>
                          {confusionMatrix?.[1]?.[0] ??
                            "—"}
                        </td>

                        <td>
                          {confusionMatrix?.[1]?.[1] ??
                            "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3>
                  Dataset & Model
                </h3>

                <p>
                  <strong>
                    Algorithm
                  </strong>
                  <br />
                  {
                    modelInfo.algorithm
                  }
                </p>

                <p>
                  <strong>
                    Dataset
                  </strong>
                  <br />
                  {
                    modelInfo.dataset_type
                  }
                </p>

                <p>
                  <strong>
                    Total Records
                  </strong>
                  <br />
                  {modelInfo.total_records?.toLocaleString()}
                </p>

                <p>
                  <strong>
                    Training Records
                  </strong>
                  <br />
                  {modelInfo.training_records?.toLocaleString()}
                </p>

                <p>
                  <strong>
                    Testing Records
                  </strong>
                  <br />
                  {modelInfo.testing_records?.toLocaleString()}
                </p>

                <h3>
                  Class Distribution
                </h3>

                <div className="class-grid">
                  <div className="class-card">
                    <span>
                      OFF_CHAIN
                    </span>

                    <strong>
                      {modelInfo.class_distribution?.OFF_CHAIN?.toLocaleString() ||
                        "0"}
                    </strong>
                  </div>

                  <div className="class-card">
                    <span>
                      ON_CHAIN
                    </span>

                    <strong>
                      {modelInfo.class_distribution?.ON_CHAIN?.toLocaleString() ||
                        "0"}
                    </strong>
                  </div>
                </div>

                <h3>
                  Random Forest
                  Configuration
                </h3>

                <p>
                  <strong>
                    Estimators
                  </strong>
                  <br />
                  {
                    modelInfo.n_estimators
                  }
                </p>

                <p>
                  <strong>
                    Maximum Depth
                  </strong>
                  <br />
                  {
                    modelInfo.max_depth
                  }
                </p>

                <p>
                  <strong>
                    Minimum Samples
                    Split
                  </strong>
                  <br />
                  {
                    modelInfo.min_samples_split
                  }
                </p>

                <p>
                  <strong>
                    Minimum Samples
                    Leaf
                  </strong>
                  <br />
                  {
                    modelInfo.min_samples_leaf
                  }
                </p>

                <p>
                  <strong>
                    Random State
                  </strong>
                  <br />
                  {
                    modelInfo.random_state
                  }
                </p>

                <h3>
                  Feature Importance
                </h3>

                {featureImportanceEntries.map(
                  ([
                    feature,
                    value,
                  ]) => {
                    const percentage =
                      Number(
                        value
                      ) * 100;

                    return (
                      <div
                        className="feature-analysis"
                        key={
                          feature
                        }
                      >
                        <div className="feature-analysis-header">
                          <span>
                            {formatFeatureName(
                              feature
                            )}
                          </span>

                          <strong>
                            {percentage.toFixed(
                              2
                            )}
                            %
                          </strong>
                        </div>

                        <div className="feature-analysis-track">
                          <div
                            className="feature-analysis-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  percentage
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </>
            ) : (
              <p>
                No model
                information
                available.
              </p>
            )}
          </div>

          {/* GRAPHICAL EXPERIMENTAL ANALYSIS */}

          <div className="card analysis-card">
            <h2>
              📊 Graphical
              Experimental
              Analysis
            </h2>

            <p>
              Visual analysis of
              the AI storage model
              and experimental
              asset decisions.
            </p>

            {modelInfo && (
              <div className="analysis-section">
                <h3>
                  Model Performance
                </h3>

                {performanceMetrics.map(
                  (metric) => {
                    const percentage =
                      metric.value *
                      100;

                    return (
                      <div
                        className="metric-bar"
                        key={
                          metric.label
                        }
                      >
                        <div className="metric-bar-header">
                          <span>
                            {
                              metric.label
                            }
                          </span>

                          <strong>
                            {percentage.toFixed(
                              2
                            )}
                            %
                          </strong>
                        </div>

                        <div className="metric-bar-track">
                          <div
                            className="metric-bar-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  percentage
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {modelInfo && (
              <div className="analysis-section">
                <h3>
                  Confusion Matrix
                  Graph
                </h3>

                <div className="matrix-grid">
                  <div className="matrix-corner">
                    Actual /
                    Predicted
                  </div>

                  <div className="matrix-axis">
                    OFF_CHAIN
                  </div>

                  <div className="matrix-axis">
                    ON_CHAIN
                  </div>

                  <div className="matrix-axis">
                    OFF_CHAIN
                  </div>

                  <div className="matrix-cell matrix-correct">
                    {confusionMatrix?.[0]?.[0] ??
                      "—"}
                  </div>

                  <div className="matrix-cell matrix-error">
                    {confusionMatrix?.[0]?.[1] ??
                      "—"}
                  </div>

                  <div className="matrix-axis">
                    ON_CHAIN
                  </div>

                  <div className="matrix-cell matrix-error">
                    {confusionMatrix?.[1]?.[0] ??
                      "—"}
                  </div>

                  <div className="matrix-cell matrix-correct">
                    {confusionMatrix?.[1]?.[1] ??
                      "—"}
                  </div>
                </div>
              </div>
            )}

            {modelInfo && (
              <div className="analysis-section">
                <h3>
                  Feature Importance
                  Graph
                </h3>

                {featureImportanceEntries.map(
                  ([
                    feature,
                    value,
                  ]) => {
                    const percentage =
                      Number(
                        value
                      ) * 100;

                    return (
                      <div
                        className="feature-analysis"
                        key={`analysis-${feature}`}
                      >
                        <div className="feature-analysis-header">
                          <span>
                            {formatFeatureName(
                              feature
                            )}
                          </span>

                          <strong>
                            {percentage.toFixed(
                              2
                            )}
                            %
                          </strong>
                        </div>

                        <div className="feature-analysis-track">
                          <div
                            className="feature-analysis-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  percentage
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {/* STORAGE DISTRIBUTION */}

            <div className="analysis-section">
              <h3>
                Experimental
                Storage
                Distribution
              </h3>

              <div className="distribution-row">
                <div className="distribution-header">
                  <span>
                    ON_CHAIN
                  </span>

                  <strong>
                    {
                      onChainAssets
                    }{" "}
                    (
                    {onChainPercentage.toFixed(
                      1
                    )}
                    %)
                  </strong>
                </div>

                <div className="distribution-track">
                  <div
                    className="distribution-fill onchain-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          onChainPercentage
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="distribution-row">
                <div className="distribution-header">
                  <span>
                    OFF_CHAIN
                  </span>

                  <strong>
                    {
                      offChainAssets
                    }{" "}
                    (
                    {offChainPercentage.toFixed(
                      1
                    )}
                    %)
                  </strong>
                </div>

                <div className="distribution-track">
                  <div
                    className="distribution-fill offchain-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          offChainPercentage
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="analysis-stat-grid">
                <div className="analysis-stat">
                  <span>
                    Assets Tested
                  </span>

                  <strong>
                    {
                      totalAssets
                    }
                  </strong>
                </div>

                <div className="analysis-stat">
                  <span>
                    Avg Confidence
                  </span>

                  <strong>
                    {
                      averageConfidence
                    }
                    %
                  </strong>
                </div>

                <div className="analysis-stat">
                  <span>
                    Blockchain TX
                  </span>

                  <strong>
                    {
                      blockchainTransactions
                    }
                  </strong>
                </div>

                <div className="analysis-stat">
                  <span>
                    Failed ON_CHAIN
                  </span>

                  <strong>
                    {failedAssets}
                  </strong>
                </div>

                <div className="analysis-stat">
                  <span>
                    Total Records
                  </span>

                  <strong>
                    {modelInfo?.total_records?.toLocaleString() ||
                      "—"}
                  </strong>
                </div>
              </div>
            </div>

            {/* EXPERIMENTAL RESULTS */}

            <div className="analysis-section">
              <h3>
                Experimental
                Asset Results
              </h3>

              {blocks.length ===
              0 ? (
                <p>
                  Create assets in
                  the virtual world
                  to generate
                  experimental
                  results.
                </p>
              ) : (
                blocks
                  .slice(-5)
                  .reverse()
                  .map(
                    (block) => {
                      const confidence =
                        Number(
                          block.confidence ||
                            0
                        );

                      return (
                        <div
                          className="experiment-result"
                          key={`analysis-result-${block.id}`}
                        >
                          <div className="experiment-result-header">
                            <span>
                              Asset #
                              {
                                block.id
                              }
                            </span>

                            <strong>
                              {
                                block.storageDecision
                              }
                            </strong>
                          </div>

                          <div className="experiment-confidence-track">
                            <div
                              className="experiment-confidence-fill"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    confidence
                                  )
                                )}%`,
                              }}
                            />
                          </div>

                          <div className="experiment-result-details">
                            Confidence:{" "}
                            {confidence.toFixed(
                              2
                            )}
                            %
                            <br />
                            🌆 City:{" "}
                            {block.city ||
                              "—"}
                            <br />
                            ⏰ Time:{" "}
                            {block.virtualTime ||
                              "—"}
                          </div>
                        </div>
                      );
                    }
                  )
              )}
            </div>
          </div>

          {/* LATEST ASSET */}

          <div className="card">
            <h2>
              📊 Latest Asset
            </h2>

            {latestAsset ? (
              <>
                <p>
                  <strong>
                    Scenario
                  </strong>
                  <br />
                  {
                    latestAsset.scenario
                  }
                </p>

                <p>
                  <strong>
                    🌆 Virtual City
                  </strong>
                  <br />
                  {latestAsset.city ||
                    "—"}
                </p>

                <p>
                  <strong>
                    ⏰ Virtual Time
                  </strong>
                  <br />
                  {latestAsset.virtualTime ||
                    "—"}
                </p>

                <p>
                  <strong>
                    Asset Size
                  </strong>
                  <br />
                  {latestAsset.features
                    ?.asset_size ??
                    "—"}
                </p>

                <p>
                  <strong>
                    Importance
                  </strong>
                  <br />
                  {latestAsset.features
                    ?.importance ??
                    "—"}
                </p>

                <p>
                  <strong>
                    Update Frequency
                  </strong>
                  <br />
                  {latestAsset.features
                    ?.update_frequency ??
                    "—"}
                </p>

                <p>
                  <strong>
                    Transaction Cost
                  </strong>
                  <br />
                  {latestAsset.features
                    ?.transaction_cost ??
                    "—"}
                </p>

                <p>
                  <strong>
                    Ownership Required
                  </strong>
                  <br />
                  {latestAsset.features
                    ?.ownership_required ??
                    "—"}
                </p>
              </>
            ) : (
              <p>
                No asset analyzed
                yet.
              </p>
            )}
          </div>

          {/* DIGITAL ASSETS */}

          <div className="card">
            <h2>
              💎 Digital Assets
            </h2>

            <p>
              <strong>
                Blocks Created
              </strong>
              <br />
              {
                totalAssets
              }
            </p>

            <p>
              <strong>
                Blockchain
              </strong>
              <br />
              Hardhat Local
              Network
            </p>

            <p>
              <strong>
                Storage Mode
              </strong>
              <br />
              {latestAsset
                ? latestAsset.storageDecision
                : "Hybrid"}
            </p>

            <p>
              <strong>
                Last Asset
              </strong>
              <br />
              {latestAsset
                ? latestAsset.assetReference
                : "—"}
            </p>

            <p>
              <strong>
                🌆 City
              </strong>
              <br />
              {latestAsset?.city ||
                "—"}
            </p>

            <p>
              <strong>
                ⏰ Virtual Time
              </strong>
              <br />
              {latestAsset?.virtualTime ||
                "—"}
            </p>

            <p>
              <strong>
                Storage Location
              </strong>
              <br />
              {latestAsset
                ? latestAsset.storageLocation
                : "—"}
            </p>

            {latestAsset?.transactionHash && (
              <p>
                <strong>
                  Transaction
                </strong>
                <br />
                {latestAsset.transactionHash.slice(
                  0,
                  12
                )}
                ...
              </p>
            )}
          </div>

          {/* RESEARCH RESULTS */}

          <div className="card">
            <h2>
              📊 Research Results
            </h2>

            <div className="research-grid">
              <div className="research-stat">
                <strong>
                  Total Assets
                </strong>

                <span>
                  {
                    totalAssets
                  }
                </span>
              </div>

              <div className="research-stat">
                <strong>
                  Avg Confidence
                </strong>

                <span>
                  {
                    averageConfidence
                  }
                  %
                </span>
              </div>

              <div className="research-stat">
                <strong>
                  ON_CHAIN
                </strong>

                <span>
                  {
                    onChainAssets
                  }
                </span>

                <small>
                  {onChainPercentage.toFixed(
                    1
                  )}
                  %
                </small>
              </div>

              <div className="research-stat">
                <strong>
                  OFF_CHAIN
                </strong>

                <span>
                  {
                    offChainAssets
                  }
                </span>

                <small>
                  {offChainPercentage.toFixed(
                    1
                  )}
                  %
                </small>
              </div>

              <div className="research-stat">
                <strong>
                  Failed ON_CHAIN
                </strong>

                <span>
                  {failedAssets}
                </span>
              </div>

              <div className="research-stat full">
                <strong>
                  Blockchain
                  Transactions
                </strong>

                <span>
                  {
                    blockchainTransactions
                  }
                </span>
              </div>
            </div>
          </div>

          {/* STORAGE VERIFICATION */}

          <div className="card">
            <h2>
              🔎 Storage
              Verification
            </h2>

            <p>
              Verify the actual
              blockchain events and
              OFF_CHAIN backend
              records.
            </p>

            <button
              className="wallet"
              onClick={
                handleVerifyStorage
              }
              disabled={loading}
            >
              🔎 Verify Real
              Storage
            </button>

            {verification.status && (
              <p>
                {
                  verification.status
                }
              </p>
            )}

            <p>
              <strong>
                Blockchain Records
              </strong>
              <br />
              {
                verification.blockchain
              }
            </p>

            <p>
              <strong>
                OFF_CHAIN Records
              </strong>
              <br />
              {
                verification.offchain
              }
            </p>
          </div>

          {/* EXPORT */}

          <div className="card">
            <h2>
              📥 Research Export
            </h2>

            <p>
              Export the current
              experimental records
              as a CSV file including
              virtual city and time.
            </p>

            <button
              className="wallet"
              onClick={
                handleExportCSV
              }
              disabled={
                blocks.length ===
                0
              }
            >
              📥 Export Research
              CSV
            </button>
          </div>

          {/* ASSET HISTORY */}

          <div className="card">
            <div className="history-header">
              <h2>
                📜 Asset History
              </h2>

              {blocks.length >
                0 && (
                <button
                  className="wallet clear-button"
                  onClick={
                    handleClearHistory
                  }
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </div>

            {blocks.length ===
            0 ? (
              <p>
                No digital assets
                created yet.
              </p>
            ) : (
              <div>
                {[...blocks]
                  .reverse()
                  .map(
                    (block) => (
                      <div
                        key={
                          block.id
                        }
                        className={`history-item ${
                          block.storageLocation ===
                          "BLOCKCHAIN"
                            ? "history-onchain"
                            : block.storageLocation ===
                              "OFF_CHAIN"
                            ? "history-offchain"
                            : "history-failed"
                        }`}
                      >
                        <p>
                          <strong>
                            Asset ID
                          </strong>
                          <br />#
                          {
                            block.id
                          }
                        </p>

                        <p>
                          <strong>
                            Scenario
                          </strong>
                          <br />
                          {
                            block.scenario ||
                            "—"
                          }
                        </p>

                        <p>
                          <strong>
                            🌆 Virtual City
                          </strong>
                          <br />
                          {block.city ||
                            "—"}
                        </p>

                        <p>
                          <strong>
                            ⏰ Virtual Time
                          </strong>
                          <br />
                          {block.virtualTime ||
                            "—"}
                        </p>

                        <p>
                          <strong>
                            AI Decision
                          </strong>
                          <br />
                          {
                            block.storageDecision
                          }
                        </p>

                        <p>
                          <strong>
                            Confidence
                          </strong>
                          <br />
                          {
                            block.confidence
                          }
                          %
                        </p>

                        <p>
                          <strong>
                            Storage
                          </strong>
                          <br />
                          {
                            block.storageLocation
                          }
                        </p>

                        {block.error && (
                          <p className="status-error">
                            <strong>
                              Error
                            </strong>
                            <br />
                            {block.error}
                          </p>
                        )}

                        <p>
                          <strong>
                            Reference
                          </strong>
                          <br />
                          {
                            block.assetReference
                          }
                        </p>

                        <p>
                          <strong>
                            Owner
                          </strong>
                          <br />
                          {block.owner
                            ? `${block.owner.slice(
                                0,
                                6
                              )}...${block.owner.slice(
                                -4
                              )}`
                            : "—"}
                        </p>

                        {block.transactionHash && (
                          <p>
                            <strong>
                              Transaction
                            </strong>
                            <br />
                            {block.transactionHash.slice(
                              0,
                              14
                            )}
                            ...
                          </p>
                        )}

                        {block.features && (
                          <p>
                            <strong>
                              Features
                            </strong>
                            <br />
                            Size:{" "}
                            {
                              block
                                .features
                                .asset_size
                            }
                            <br />
                            Importance:{" "}
                            {
                              block
                                .features
                                .importance
                            }
                            <br />
                            Updates:{" "}
                            {
                              block
                                .features
                                .update_frequency
                            }
                            <br />
                            Cost:{" "}
                            {
                              block
                                .features
                                .transaction_cost
                            }
                            <br />
                            Ownership:{" "}
                            {
                              block
                                .features
                                .ownership_required
                            }
                          </p>
                        )}
                      </div>
                    )
                  )}
              </div>
            )}
          </div>

          {/* DATA TABLE */}

          <div className="card">
            <h2>
              📋 Research Data Table
            </h2>

            {blocks.length ===
            0 ? (
              <p>
                No experimental
                records available.
              </p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {[
                        "ID",
                        "City",
                        "Time",
                        "Decision",
                        "Confidence",
                        "Storage",
                        "Size",
                        "Importance",
                        "Updates",
                      ].map(
                        (heading) => (
                          <th
                            key={
                              heading
                            }
                          >
                            {
                              heading
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {[...blocks]
                      .reverse()
                      .map(
                        (block) => (
                          <tr
                            key={
                              block.id
                            }
                          >
                            <td>
                              #
                              {
                                block.id
                              }
                            </td>

                            <td>
                              {block.city ||
                                "—"}
                            </td>

                            <td>
                              {block.virtualTime ||
                                "—"}
                            </td>

                            <td>
                              {
                                block.storageDecision
                              }
                            </td>

                            <td>
                              {
                                block.confidence
                              }
                              %
                            </td>

                            <td>
                              {
                                block.storageLocation
                              }
                            </td>

                            <td>
                              {block
                                .features
                                ?.asset_size ??
                                "—"}
                            </td>

                            <td>
                              {block
                                .features
                                ?.importance ??
                                "—"}
                            </td>

                            <td>
                              {block
                                .features
                                ?.update_frequency ??
                                "—"}
                            </td>
                          </tr>
                        )
                      )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;