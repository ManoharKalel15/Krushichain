// scripts/deploy.js — Deploy KrushiChainProof to MST Chain Testnet
const hre = require('hardhat');

async function main() {
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;

  console.log('══════════════════════════════════════════════════════');
  console.log('🌾  KrushiChain — MST Chain Smart Contract Deployment');
  console.log('══════════════════════════════════════════════════════');
  console.log(`📡  Network : ${network}`);
  console.log(`🔗  Chain ID: ${chainId}`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`👛  Deployer: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceFmt = hre.ethers.formatEther(balance);
  console.log(`💰  Balance : ${balanceFmt} ${network === 'mstTestnet' ? 'tMSTC' : 'MSTC'}`);

  if (balance === 0n) {
    console.error('\n❌ Wallet has 0 balance! Get test MSTC from:');
    console.error('   👉 https://faucet.mstblockchain.com');
    process.exit(1);
  }

  console.log('\n🚀 Deploying KrushiChainProof contract...');

  const KrushiChainProof = await hre.ethers.getContractFactory('contracts/KrushiChainProof.sol:KrushiChainProof');
  const contract = await KrushiChainProof.deploy();

  // Wait for deployment confirmation
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();

  console.log('\n══════════════════════════════════════════════════════');
  console.log('✅  Contract deployed successfully!');
  console.log('══════════════════════════════════════════════════════');
  console.log(`📦  Contract Address : ${contractAddress}`);
  console.log(`🔖  Transaction Hash : ${deployTx?.hash}`);

  const explorerBase = network === 'mstTestnet'
    ? 'https://testnet.mstscan.com'
    : 'https://mstscan.com';
  console.log(`🔍  View on Explorer : ${explorerBase}/address/${contractAddress}`);
  console.log(`🔍  View TX          : ${explorerBase}/tx/${deployTx?.hash}`);

  console.log('\n📝  Updating backend/.env file...');
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`✅  backend/.env automatically updated with CONTRACT_ADDRESS=${contractAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  });