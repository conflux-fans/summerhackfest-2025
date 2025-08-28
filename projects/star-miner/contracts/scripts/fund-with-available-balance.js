const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Funding P2E reward pool with available balance...');

  // Load deployment info
  const deploymentsDir = path.join(__dirname, '../deployments');
  const deploymentFiles = fs.readdirSync(deploymentsDir);
  const latestDeployment = deploymentFiles
    .filter(file => file.startsWith('deployment-'))
    .sort()
    .pop();

  if (!latestDeployment) {
    throw new Error('No deployment file found');
  }

  const deploymentPath = path.join(deploymentsDir, latestDeployment);
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  // Get contract instance
  const P2ERewards = await ethers.getContractFactory('P2ERewards');
  const p2eContract = P2ERewards.attach(deployment.contracts.P2ERewards);

  // Check current state
  const currentPool = await p2eContract.rewardPool();
  console.log('Current reward pool:', ethers.formatEther(currentPool), 'CFX');

  // Check deployer balance
  const [deployer] = await ethers.getSigners();
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log('Deployer balance:', ethers.formatEther(deployerBalance), 'CFX');

  // Leave 1 CFX for gas fees, fund with the rest
  const gasReserve = ethers.parseEther('1');
  const availableForFunding = deployerBalance - gasReserve;

  if (availableForFunding <= 0) {
    console.log('❌ Insufficient balance for funding (need to keep 1 CFX for gas)');
    return;
  }

  console.log('Funding with:', ethers.formatEther(availableForFunding), 'CFX (keeping 1 CFX for gas)');

  // Fund the reward pool
  const fundTx = await p2eContract.fundRewardPool({ value: availableForFunding });
  console.log('Transaction sent:', fundTx.hash);
  
  await fundTx.wait();
  console.log('✅ Transaction confirmed!');

  // Check final state
  const finalPool = await p2eContract.rewardPool();
  console.log('\n=== Final State ===');
  console.log('Final reward pool:', ethers.formatEther(finalPool), 'CFX');
  console.log('Exchange rate:', await p2eContract.stardustToCFXRate(), 'Stardust per CFX');
  console.log('Daily limit:', ethers.formatEther(await p2eContract.dailyRewardLimit()), 'CFX per player');
  
  // Calculate how many exchanges this supports
  const exchangesSupported = Math.floor(Number(ethers.formatEther(finalPool)) / 0.1); // 0.1 CFX per minimum exchange
  console.log('Minimum exchanges supported:', exchangesSupported.toLocaleString());
  
  console.log('\n🎉 Reward pool funded with available balance!');
  console.log('💡 To get 1000 CFX total, get more testnet CFX from: https://efaucet.confluxnetwork.org/');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error funding reward pool:', error);
    process.exit(1);
  });