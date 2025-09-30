const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Funding P2E reward pool to 1000 CFX total...');

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

  // Calculate how much more CFX we need to reach 1000 CFX
  const targetAmount = ethers.parseEther('1000'); // 1000 CFX
  const additionalFunding = targetAmount - currentPool;

  if (additionalFunding <= 0) {
    console.log('✅ Reward pool already has 1000+ CFX!');
    return;
  }

  console.log('Adding:', ethers.formatEther(additionalFunding), 'CFX to reach 1000 CFX total');

  // Check deployer balance
  const [deployer] = await ethers.getSigners();
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log('Deployer balance:', ethers.formatEther(deployerBalance), 'CFX');

  if (deployerBalance < additionalFunding) {
    console.log('❌ Insufficient balance! You need', ethers.formatEther(additionalFunding), 'CFX');
    console.log('💡 Get testnet CFX from: https://efaucet.confluxnetwork.org/');
    return;
  }

  // Fund the reward pool
  console.log('Funding reward pool with:', ethers.formatEther(additionalFunding), 'CFX...');
  
  const fundTx = await p2eContract.fundRewardPool({ value: additionalFunding });
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
  
  console.log('\n🎉 Reward pool successfully funded to 1000 CFX!');
  console.log('This supports extensive testing and gameplay!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error funding reward pool:', error);
    process.exit(1);
  });