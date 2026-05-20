// blockchain.js - Ethereum Sepolia Testnet Integration for KrushiChain Proofs
const { ethers } = require('ethers');

// Ethereum Sepolia Testnet
const NETWORK = process.env.BLOCKCHAIN_NETWORK || 'sepolia'; // 'sepolia' or 'mumbai'

const NETWORKS = {
  sepolia: {
    rpc: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111
  },
  mumbai: {
    rpc: 'https://rpc-mumbai.maticvigil.com',
    chainId: 80001
  }
};

const config = NETWORKS[NETWORK];
const RPC_URL = config.rpc;
const CHAIN_ID = config.chainId;

// Demo Private Key (replace with secure wallet in production)
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478c7595d5e36ba1f24b283c7a769'; // Hardhat test key

// Simple KrushiChain Proof Contract ABI (deploy this contract first)
const CONTRACT_ABI = [
  "function storeProof(string memory farmerIdHash, string memory landHash, string memory ipfsHash, string memory action, uint256 timestamp) public returns (uint256)",
  "function getProof(uint256 proofId) public view returns (string, string, string, string, uint256, address, uint256)",
  "function getProofCount() public view returns (uint256)"
];

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x...'; // Deploy and add to .env

let provider, signer, contract;

function initBlockchain() {
  if (!provider && PRIVATE_KEY && PRIVATE_KEY !== '0x...' && CONTRACT_ADDRESS && CONTRACT_ADDRESS !== '0x...') {
    try {
      provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
      signer = new ethers.Wallet(PRIVATE_KEY, provider);
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      console.log('🔗 Polygon Blockchain Connected');
    } catch (e) {
      console.log('⚠️  Blockchain init failed:', e.message);
    }
  } else {
    console.log('⚠️  Blockchain not initialized (missing key/address)');
  }
}

// Store proof on blockchain
async function storeProof(farmerIdHash, landHash, ipfsHash, action) {
  try {
    initBlockchain();
    const timestamp = Math.floor(Date.now() / 1000);
    const tx = await contract.storeProof(farmerIdHash, landHash, ipfsHash, action, timestamp);
    const receipt = await tx.wait();
    console.log(`✅ Proof stored on Polygon: ${receipt.transactionHash}`);
    return {
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      proofId: receipt.logs[0]?.topics[1] // Assuming event emits proofId
    };
  } catch (e) {
    console.error('❌ Blockchain store failed:', e.message);
    return null;
  }
}

// Get proof from blockchain
async function getProof(proofId) {
  try {
    initBlockchain();
    const proof = await contract.getProof(proofId);
    return {
      farmerIdHash: proof[0],
      landHash: proof[1],
      ipfsHash: proof[2],
      action: proof[3],
      timestamp: proof[4],
      storedBy: proof[5],
      blockNumber: proof[6]
    };
  } catch (e) {
    console.error('❌ Get proof failed:', e.message);
    return null;
  }
}

// Generate hash for data
function generateHash(data) {
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
}

module.exports = { storeProof, getProof, generateHash, initBlockchain };