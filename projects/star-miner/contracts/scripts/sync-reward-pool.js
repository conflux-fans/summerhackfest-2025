const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Syncing P2E reward pool with contract balance...');

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
  const contractBalance = await ethers.provider.getBalance(p2eContract.target);
  const currentPool = await p2eContract.rewardPool();

  console.log('Contract balance:', ethers.formatEther(contractBalance), 'CFX');
  console.log('Current reward pool:', ethers.formatEther(currentPool), 'CFX');

  const difference = contractBalance - currentPool;
  console.log('Difference:', ethers.formatEther(difference), 'CFX');

  if (difference <= 0) {
    console.log('✅ Reward pool is already in sync with contract balance.');
    return;
  }

  // Sync the reward pool
  console.log('Calling syncRewardPool()...');
  const syncTx = await p2eContract.syncRewardPool();
  console.log('Transaction sent:', syncTx.hash);

  await syncTx.wait();
  console.log('✅ Transaction confirmed!');

  // Check final state
  const finalPool = await p2eContract.rewardPool();
  console.log('\n=== Final State ===');
  console.log('Final reward pool:', ethers.formatEther(finalPool), 'CFX');
  console.log('Contract balance:', ethers.formatEther(contractBalance), 'CFX');

  if (finalPool === contractBalance) {
    console.log('🎉 Reward pool successfully synced!');
  } else {
    console.log('❌ Sync may have failed. Please check the contract state.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error syncing reward pool:', error);
    process.exit(1);
  });