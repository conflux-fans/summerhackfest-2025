const { ethers } = require('hardhat');

async function main() {
  console.log('Funding P2E contract with CFX...');

  const contractAddress = '0xf64aB338Bc539d0450Cc0Bdc673c27c3972E0C9D';
  const fundingAmount = ethers.parseEther('10'); // 10 CFX

  console.log('Contract address:', contractAddress);
  console.log('Funding amount:', ethers.formatEther(fundingAmount), 'CFX');

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address:', deployer.address);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Deployer balance:', ethers.formatEther(balance), 'CFX');

  if (balance < fundingAmount) {
    console.log('❌ Insufficient balance! Need at least', ethers.formatEther(fundingAmount), 'CFX');
    console.log('💡 Get testnet CFX from: https://efaucet.confluxnetwork.org/');
    return;
  }

  // Check current contract balance
  const currentBalance = await ethers.provider.getBalance(contractAddress);
  console.log('Current contract balance:', ethers.formatEther(currentBalance), 'CFX');

  // Send CFX to contract
  console.log('Sending', ethers.formatEther(fundingAmount), 'CFX to contract...');
  const tx = await deployer.sendTransaction({
    to: contractAddress,
    value: fundingAmount
  });

  console.log('Transaction sent:', tx.hash);
  await tx.wait();
  console.log('✅ Transaction confirmed!');

  // Check new balance
  const newBalance = await ethers.provider.getBalance(contractAddress);
  console.log('New contract balance:', ethers.formatEther(newBalance), 'CFX');

  console.log('🎉 Contract funded successfully!');
  console.log('The reward pool should now show the correct balance in your game.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });