# 🔗 KrushiChain Blockchain Deployment Guide

## 📋 Prerequisites
1. **Sepolia Testnet ETH**
   - https://sepoliafaucet.com (Alchemy/QuickNode)
   - https://www.infura.io/faucet (0.05 ETH)

2. **MetaMask Wallet**
   - Sepolia Network added
   - Private Key available

3. **Infura API Key** (free)
   - https://infura.io/
   - Create project, get Sepolia API key

## 🚀 Deploy Steps

### Option 1: Remix IDE (Easiest)
1. Go to https://remix.ethereum.org/
2. Create new file: `KrushiChainProof.sol`
3. Copy contract from `contracts/KrushiChainProof.sol`
4. Compile (Ctrl+S)
5. Deploy:
   - Environment: Injected Web3
   - Connect MetaMask → Sepolia
   - Click Deploy
6. Copy contract address

### Option 2: Hardhat CLI (Advanced)
```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv

# Setup .env
BLOCKCHAIN_PRIVATE_KEY=0x... (from MetaMask)

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

## 📝 Configuration

### .env File
```
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_PRIVATE_KEY=0x[your_private_key_from_metamask]
CONTRACT_ADDRESS=0x[deployed_contract_address]
```

### Get Private Key from MetaMask
1. Open MetaMask
2. Click account → Settings → Privacy & Security
3. Export Private Key (requires password)
4. Copy (starts with 0x)

## ✅ Verification
After deployment:
```bash
# Test blockchain connection
npm run dev

# Check backend logs
# Should show: 🔗 Polygon Blockchain Connected
# Or: ⚠️ Blockchain not initialized (if missing key/address)
```

## 🔐 Security Notes
- Never commit private key to git
- Use testnet key only (no mainnet!)
- Keep .env in .gitignore

## 📚 Resources
- Ethereum Sepolia: https://sepoliafaucet.com
- Contract Explorer: https://sepolia.etherscan.io
- Infura: https://infura.io