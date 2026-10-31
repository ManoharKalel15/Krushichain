// blockchain.js - MST Chain Testnet Integration for KrushiChain Proofs
const { ethers } = require('ethers');

// ─── MST Chain Network Configuration ────────────────────────────────────────
const NETWORKS = {
  mstTestnet: {
    name: 'MST Testnet',
    rpc: 'https://testnetrpc.mstblockchain.com',
    chainId: 91562037,
    symbol: 'tMSTC',
    explorer: 'https://testnet.mstscan.com'
  },
  mstMainnet: {
    name: 'MST Mainnet',
    rpc: 'https://mariorpc.mstblockchain.com',
    chainId: 4646,
    symbol: 'MSTC',
    explorer: 'https://mstscan.com'
  }
};

const NETWORK_KEY = process.env.BLOCKCHAIN_NETWORK || 'mstTestnet';
const config = NETWORKS[NETWORK_KEY] || NETWORKS.mstTestnet;

const RPC_URL  = config.rpc;
const CHAIN_ID = config.chainId;

// KrushiChain Proof Contract ABI
const CONTRACT_ABI = [
  "function storeProof(string memory farmerIdHash, string memory landHash, string memory ipfsHash, string memory action, uint256 timestamp) public returns (uint256)",
  "function getProof(uint256 proofId) public view returns (string, string, string, string, uint256, address, uint256)",
  "function getProofCount() public view returns (uint256)",
  "event ProofStored(uint256 indexed proofId, string farmerIdHash, string action, uint256 timestamp)"
];

const PRIVATE_KEY      = process.env.BLOCKCHAIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

let provider, signer, contract;

function initBlockchain() {
  if (provider) return; // already initialized

  if (!PRIVATE_KEY || !CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x...') {
    console.log('⚠️  MST Chain: Missing PRIVATE_KEY or CONTRACT_ADDRESS — blockchain disabled');
    return;
  }

  try {
    provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
    signer   = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    console.log(`🔗 MST Chain Connected → ${config.name} (Chain ID: ${CHAIN_ID})`);
    console.log(`📦 Contract: ${CONTRACT_ADDRESS}`);
    console.log(`🔍 Explorer: ${config.explorer}`);
  } catch (e) {
    console.log('⚠️  MST Chain init failed:', e.message);
  }
}

// Store proof on MST Chain blockchain
async function storeProof(farmerIdHash, landHash, ipfsHash, action) {
  try {
    if (!contract) initBlockchain();
    if (!contract) return null;

    const timestamp = Math.floor(Date.now() / 1000);
    const tx        = await contract.storeProof(farmerIdHash, landHash, ipfsHash, action, timestamp);
    const receipt   = await tx.wait();

    const explorerUrl = `${config.explorer}/tx/${receipt.hash}`;
    console.log(`✅ Proof stored on MST Chain: ${receipt.hash}`);
    console.log(`🔍 View: ${explorerUrl}`);

    return {
      txHash:      receipt.hash,
      blockNumber: receipt.blockNumber,
      proofId:     receipt.logs[0]?.topics[1],
      explorerUrl,
      network:     config.name
    };
  } catch (e) {
    console.error('❌ MST Chain store failed:', e.message);
    return null;
  }
}

// Get proof from MST Chain blockchain
async function getProof(proofId) {
  try {
    if (!contract) initBlockchain();
    if (!contract) return null;

    const proof = await contract.getProof(proofId);
    return {
      farmerIdHash: proof[0],
      landHash:     proof[1],
      ipfsHash:     proof[2],
      action:       proof[3],
      timestamp:    proof[4],
      storedBy:     proof[5],
      blockNumber:  proof[6]
    };
  } catch (e) {
    console.error('❌ MST Chain get proof failed:', e.message);
    return null;
  }
}

// Generate keccak256 hash for data
function generateHash(data) {
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
}

// Get network info (useful for API responses / health check)
function getNetworkInfo() {
  return {
    name:     config.name,
    chainId:  config.chainId,
    symbol:   config.symbol,
    explorer: config.explorer,
    contract: CONTRACT_ADDRESS
  };
}

module.exports = { storeProof, getProof, generateHash, initBlockchain, getNetworkInfo };