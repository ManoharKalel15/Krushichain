// scripts/deploy.js
const hre = require('hardhat');

async function main() {
  console.log('🚀 Deploying KrushiChainProof contract...');

  const KrushiChainProof = await hre.ethers.getContractFactory('KrushiChainProof');
  const contract = await KrushiChainProof.deploy();
  await contract.deployed();

  console.log('✅ Contract deployed to:', contract.address);
  console.log('\n📝 Add this to your .env file:');
  console.log(`CONTRACT_ADDRESS=${contract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });