require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.0',
  networks: {
    // ─── MST Chain Testnet (Primary) ─────────────────────────────────────────
    mstTestnet: {
      url: 'https://testnetrpc.mstblockchain.com',
      chainId: 91562037,
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY
        ? [process.env.BLOCKCHAIN_PRIVATE_KEY]
        : [],
      gasPrice: 'auto'
    },

    // ─── MST Chain Mainnet (Production) ──────────────────────────────────────
    mstMainnet: {
      url: 'https://mariorpc.mstblockchain.com',
      chainId: 4646,
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY
        ? [process.env.BLOCKCHAIN_PRIVATE_KEY]
        : [],
      gasPrice: 'auto'
    },

    // ─── Local Hardhat Node (offline development) ─────────────────────────────
    hardhat: {
      chainId: 31337
    }

    // ─── Legacy (commented out — no longer used) ──────────────────────────────
    // sepolia: {
    //   url: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`,
    //   accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : []
    // },
    // mumbai: {
    //   url: 'https://rpc-mumbai.maticvigil.com',
    //   accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : []
    // }
  }
};