import { ethers } from "ethers";

// ============================================================
// DEPLOYED CONTRACT
// ============================================================

export const CONTRACT_ADDRESS =
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// ============================================================
// CONTRACT ABI
// ============================================================

export const CONTRACT_ABI = [
  "function claimLand(uint256 landId)",
  "function getLandOwner(uint256 landId) view returns (address)",
  "function transferLand(uint256 landId, address newOwner)",

  "function storeAssetOnChain(uint256 assetId, uint256 landId, string assetReference)",

  "function getDigitalAsset(uint256 assetId) view returns (uint256, uint256, address, string, bool)",

  "event LandClaimed(uint256 indexed landId, address indexed owner)",

  "event LandTransferred(uint256 indexed landId, address indexed from, address indexed to)",

  "event AssetStoredOnChain(uint256 indexed assetId, uint256 indexed landId, address indexed owner, string assetReference)",
];

// ============================================================
// HARDHAT LOCAL NETWORK
// ============================================================

const HARDHAT_CHAIN_ID = "0x7a69";
const HARDHAT_RPC_URL = "http://127.0.0.1:8545";

// ============================================================
// CHECK CONTRACT
// ============================================================

async function verifyContractExists(provider) {
  const code = await provider.getCode(CONTRACT_ADDRESS);

  if (!code || code === "0x") {
    throw new Error(
      `Smart contract was not found at ${CONTRACT_ADDRESS} on Hardhat Local. ` +
      `Make sure Hardhat node is running and the contract has been deployed to the current network.`
    );
  }

  return true;
}

// ============================================================
// SWITCH TO HARDHAT LOCAL
// ============================================================

async function switchToHardhat() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  const currentChainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (currentChainId === HARDHAT_CHAIN_ID) {
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: HARDHAT_CHAIN_ID,
        },
      ],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: HARDHAT_CHAIN_ID,
            chainName: "Hardhat Local",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [HARDHAT_RPC_URL],
          },
        ],
      });
    } else {
      throw error;
    }
  }

  // Confirm the switch actually happened.
  const newChainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (newChainId !== HARDHAT_CHAIN_ID) {
    throw new Error(
      `MetaMask is not connected to Hardhat Local. Current chain ID: ${newChainId}`
    );
  }
}

// ============================================================
// CONNECT WALLET
// ============================================================

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  await switchToHardhat();

  const provider = new ethers.BrowserProvider(window.ethereum);

  await verifyContractExists(provider);

  const signer = await provider.getSigner();

  const address = await signer.getAddress();

  return {
    provider,
    signer,
    address,
  };
}

// ============================================================
// CLAIM LAND
// ============================================================

export async function claimLand(landId) {
  const { signer, provider } = await connectWallet();

  await verifyContractExists(provider);

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );

  const transaction = await contract.claimLand(landId);

  await transaction.wait();

  return transaction;
}

// ============================================================
// GET LAND OWNER
// ============================================================

export async function getLandOwner(landId) {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  await switchToHardhat();

  const provider = new ethers.BrowserProvider(window.ethereum);

  await verifyContractExists(provider);

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );

  try {
    const owner = await contract.getLandOwner(landId);

    return owner;
  } catch (error) {
    console.error("getLandOwner failed:", error);

    throw new Error(
      `Unable to read Land #${landId} ownership from the deployed contract. ` +
      `Contract: ${CONTRACT_ADDRESS}`
    );
  }
}

// ============================================================
// STORE DIGITAL ASSET ON-CHAIN
// ============================================================

export async function storeAssetOnChain(
  assetId,
  landId,
  assetReference
) {
  const { signer, provider } = await connectWallet();

  await verifyContractExists(provider);

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );

  const transaction = await contract.storeAssetOnChain(
    assetId,
    landId,
    assetReference
  );

  await transaction.wait();

  return transaction;
}

// ============================================================
// GET SINGLE DIGITAL ASSET
// ============================================================

export async function getDigitalAsset(assetId) {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  await switchToHardhat();

  const provider = new ethers.BrowserProvider(window.ethereum);

  await verifyContractExists(provider);

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );

  return await contract.getDigitalAsset(assetId);
}

// ============================================================
// GET ALL ON-CHAIN ASSETS
// ============================================================

export async function getAllOnChainAssets() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  await switchToHardhat();

  const provider = new ethers.BrowserProvider(window.ethereum);

  await verifyContractExists(provider);

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );

  const filter = contract.filters.AssetStoredOnChain();

  const events = await contract.queryFilter(
    filter,
    0,
    "latest"
  );

  const assets = [];

  for (const event of events) {
    const args = event.args;

    let timestamp = null;

    try {
      const block = await provider.getBlock(
        event.blockNumber
      );

      if (block) {
        timestamp = new Date(
          Number(block.timestamp) * 1000
        ).toISOString();
      }
    } catch (error) {
      console.warn(
        "Unable to read block timestamp:",
        error
      );
    }

    assets.push({
      asset_id: args.assetId.toString(),

      land_id: args.landId.toString(),

      owner: args.owner,

      asset_reference: args.assetReference,

      storage_location: "BLOCKCHAIN",

      transaction_hash: event.transactionHash,

      block_number: event.blockNumber,

      timestamp,
    });
  }

  return assets;
}