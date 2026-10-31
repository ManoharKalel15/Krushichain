const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { getNetworkInfo, getProof, storeProof, generateHash } = require('../utils/blockchain');

const NETWORKS = {
  mstMainnet: {
    name: 'MST Mainnet',
    rpc: 'https://mariorpc.mstblockchain.com',
    chainId: 4646,
    symbol: 'MSTC',
    explorer: 'https://mstscan.com'
  },
  mstTestnet: {
    name: 'MST Testnet',
    rpc: 'https://testnetrpc.mstblockchain.com',
    chainId: 91562037,
    symbol: 'tMSTC',
    explorer: 'https://testnet.mstscan.com'
  }
};

// GET /api/blockchain/status - Get real-time status of MST Chain & contract
router.get('/status', async (req, res) => {
  try {
    const activeKey = process.env.BLOCKCHAIN_NETWORK || 'mstTestnet';
    const activeNet = NETWORKS[activeKey] || NETWORKS.mstTestnet;
    const contractAddr = process.env.CONTRACT_ADDRESS || '';

    let deployerAddress = '';
    let deployerBalance = '0.0';
    let isConnected = false;
    let blockNumber = 0;
    let proofCount = 0;

    try {
      const provider = new ethers.JsonRpcProvider(activeNet.rpc);
      blockNumber = await provider.getBlockNumber();
      isConnected = true;

      if (process.env.BLOCKCHAIN_PRIVATE_KEY) {
        const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
        deployerAddress = wallet.address;
        const bal = await provider.getBalance(wallet.address);
        deployerBalance = ethers.formatEther(bal);
      }

      if (contractAddr && contractAddr.startsWith('0x') && contractAddr.length === 42) {
        try {
          const abi = ["function getProofCount() public view returns (uint256)"];
          const contract = new ethers.Contract(contractAddr, abi, provider);
          const count = await contract.getProofCount();
          proofCount = Number(count);
        } catch (_) {}
      }
    } catch (e) {
      console.warn('Blockchain status check error:', e.message);
    }

    res.json({
      success: true,
      activeNetwork: activeKey,
      network: activeNet,
      networks: NETWORKS,
      deployerAddress,
      deployerBalance,
      contractAddress: contractAddr,
      isContractSet: Boolean(contractAddr && contractAddr.startsWith('0x')),
      blockNumber,
      proofCount,
      isConnected
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blockchain/verify/:proofId - Verify proof on smart contract
router.get('/verify/:proofId', async (req, res) => {
  try {
    const { proofId } = req.params;
    const proof = await getProof(Number(proofId));
    if (!proof) {
      return res.status(404).json({ error: 'Proof not found on blockchain' });
    }
    res.json({ success: true, proof });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blockchain/set-contract - Update contract address in runtime & .env
router.post('/set-contract', async (req, res) => {
  try {
    const { contractAddress } = req.body;
    if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      return res.status(400).json({ error: 'Invalid Ethereum contract address' });
    }

    process.env.CONTRACT_ADDRESS = contractAddress;

    // Persist to .env
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      if (content.includes('CONTRACT_ADDRESS=')) {
        content = content.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${contractAddress}`);
      } else {
        content += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
      }
      fs.writeFileSync(envPath, content);
    }

    // Reinitialize blockchain instance
    require('../utils/blockchain').initBlockchain();

    res.json({
      success: true,
      message: 'Contract address updated successfully',
      contractAddress
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blockchain/switch-network - Switch backend network
router.post('/switch-network', async (req, res) => {
  try {
    const { network } = req.body;
    if (!NETWORKS[network]) {
      return res.status(400).json({ error: 'Invalid network. Use mstMainnet or mstTestnet' });
    }

    process.env.BLOCKCHAIN_NETWORK = network;

    // Persist to .env
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      if (content.includes('BLOCKCHAIN_NETWORK=')) {
        content = content.replace(/BLOCKCHAIN_NETWORK=.*/, `BLOCKCHAIN_NETWORK=${network}`);
      } else {
        content += `\nBLOCKCHAIN_NETWORK=${network}\n`;
      }
      fs.writeFileSync(envPath, content);
    }

    res.json({
      success: true,
      message: `Network switched to ${NETWORKS[network].name}`,
      activeNetwork: network,
      network: NETWORKS[network]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
