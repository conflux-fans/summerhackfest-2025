const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Updating P2E daily limit to 5 CFX...');

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

  // Update daily limit to 5 CFX
  const newDailyLimit = ethers.parseEther('5'); // 5 CFX
  
  console.log('Current daily limit:', ethers.formatEther(await p2eContract.dailyRewardLimit()), 'CFX');
  console.log('Setting new daily limit to:', ethers.formatEther(newDailyLimit), 'CFX');

  const tx = await p2eContract.setDailyLimit(newDailyLimit);
  await tx.wait();

  console.log('✅ Daily limit updated successfully!');
  console.log('Transaction hash:', tx.hash);
  console.log('New daily limit:', ethers.formatEther(await p2eContract.dailyRewardLimit()), 'CFX');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error updating daily limit:', error);
    process.exit(1);
  });