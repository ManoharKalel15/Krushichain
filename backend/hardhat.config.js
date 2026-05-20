require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
  solidity: '0.8.0',
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`,
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : []
    },
    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com',
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : []
    }
  }
};