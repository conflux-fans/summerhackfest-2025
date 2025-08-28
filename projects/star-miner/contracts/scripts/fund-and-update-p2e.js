const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Funding P2E reward pool and updating exchange rate...');

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
  console.log('Current reward pool:', ethers.formatEther(await p2eContract.rewardPool()), 'CFX');
  console.log('Current exchange rate:', await p2eContract.stardustToCFXRate(), 'Stardust per CFX');

  // 1. Update exchange rate to 100,000 Stardust = 1 CFX (10x higher rate)
  const newExchangeRate = 100000; // 100,000 Stardust = 1 CFX
  console.log('Setting new exchange rate to:', newExchangeRate, 'Stardust per CFX');
  
  const updateRateTx = await p2eContract.setExchangeRate(newExchangeRate);
  await updateRateTx.wait();
  console.log('✅ Exchange rate updated! Transaction:', updateRateTx.hash);

  // 2. Fund the reward pool with 10 CFX
  const fundingAmount = ethers.parseEther('10'); // 10 CFX
  console.log('Funding reward pool with:', ethers.formatEther(fundingAmount), 'CFX');
  
  const fundTx = await p2eContract.fundRewardPool({ value: fundingAmount });
  await fundTx.wait();
  console.log('✅ Reward pool funded! Transaction:', fundTx.hash);

  // Check final state
  console.log('\n=== Final State ===');
  console.log('New reward pool:', ethers.formatEther(await p2eContract.rewardPool()), 'CFX');
  console.log('New exchange rate:', await p2eContract.stardustToCFXRate(), 'Stardust per CFX');
  console.log('Daily limit:', ethers.formatEther(await p2eContract.dailyRewardLimit()), 'CFX');
  
  console.log('\n🎉 P2E system updated successfully!');
  console.log('- Players now need 100,000 Stardust to get 1 CFX (10x harder)');
  console.log('- Reward pool has 10 CFX for testing');
  console.log('- Daily limit is 5 CFX per player');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error updating P2E system:', error);
    process.exit(1);
  });