// scripts/deploy-mainnet.js — Deploy KrushiChainProof directly to MST Chain MAINNET
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('══════════════════════════════════════════════════════════');
  console.log('🚀  KrushiChain — MST Chain MAINNET Deployment');
  console.log('══════════════════════════════════════════════════════════');

  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId;

  console.log(`📡  Target Network : ${networkName}`);
  console.log(`🔗  Chain ID       : ${chainId}`);
  console.log(`🌐  RPC Endpoint   : ${hre.network.config.url}`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`👛  Deployer Wallet: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceFmt = hre.ethers.formatEther(balance);
  console.log(`💰  Mainnet Balance: ${balanceFmt} MSTC`);

  if (balance === 0n) {
    console.log('\n⚠️  Mainnet Wallet Balance is 0.0 MSTC!');
    console.log('──────────────────────────────────────────────────────────');
    console.log('To deploy directly to MST Mainnet:');
    console.log(`1. Send a small amount of MSTC to deployer address:`);
    console.log(`   👉 ${deployer.address}`);
    console.log('2. Once received, re-run:');
    console.log('   npm run deploy:mainnet');
    console.log('──────────────────────────────────────────────────────────');
    console.log('💡 Note: Contract is ALREADY deployed and active on MST Testnet at:');
    console.log('   👉 0x839A088dea854A031b9e6F0047dbF5860D5CdED6');
    console.log('   Explorer: https://testnet.mstscan.com/address/0x839A088dea854A031b9e6F0047dbF5860D5CdED6\n');
    process.exit(1);
  }

  console.log('\n🚀 Deploying KrushiChainProof contract to MST Mainnet...');
  const KrushiChainProof = await hre.ethers.getContractFactory('contracts/KrushiChainProof.sol:KrushiChainProof');
  const contract = await KrushiChainProof.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('🎉  SUCCESS! Deployed to MST Mainnet!');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`📦  Mainnet Contract Address : ${contractAddress}`);
  console.log(`🔖  Transaction Hash         : ${deployTx?.hash}`);
  console.log(`🔍  Explorer URL             : https://mstscan.com/address/${contractAddress}`);
  console.log(`🔍  Transaction URL          : https://mstscan.com/tx/${deployTx?.hash}`);

  // Update .env files
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/BLOCKCHAIN_NETWORK=.*/, 'BLOCKCHAIN_NETWORK=mstMainnet');
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${contractAddress}`);
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅  backend/.env updated with BLOCKCHAIN_NETWORK=mstMainnet and CONTRACT_ADDRESS');
  }

  const frontendEnvPath = path.join(__dirname, '..', '..', 'frontend', '.env');
  if (fs.existsSync(frontendEnvPath)) {
    let fContent = fs.readFileSync(frontendEnvPath, 'utf8');
    fContent = fContent.replace(/VITE_CONTRACT_ADDRESS=.*/, `VITE_CONTRACT_ADDRESS=${contractAddress}`);
    fs.writeFileSync(frontendEnvPath, fContent);
    console.log('✅  frontend/.env updated with VITE_CONTRACT_ADDRESS');
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Mainnet deployment failed:', err.message);
    process.exit(1);
  });
