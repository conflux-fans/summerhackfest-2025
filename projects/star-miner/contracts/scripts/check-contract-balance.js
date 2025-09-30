const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Checking P2E contract balance and reward pool...');

  // Get contract address from env or use the one from .env.local
  const p2eAddress = process.env.NEXT_PUBLIC_P2E_CONTRACT || '0xf64aB338Bc539d0450Cc0Bdc673c27c3972E0C9D';
  console.log('Using P2E contract address:', p2eAddress);

  // Get contract instance
  const P2ERewards = await ethers.getContractFactory('P2ERewards');
  const p2eContract = P2ERewards.attach(p2eAddress);

  // Check contract balance
  const contractBalance = await ethers.provider.getBalance(p2eContract.target);
  console.log('Contract balance:', ethers.formatEther(contractBalance), 'CFX');

  // Try to call getExchangeInfo
  try {
    const exchangeInfo = await p2eContract.getExchangeInfo('0x0000000000000000000000000000000000000000');
    console.log('Exchange info:', exchangeInfo);
    console.log('Reward pool from getExchangeInfo:', ethers.formatEther(exchangeInfo[3]), 'CFX');
  } catch (error) {
    console.log('❌ getExchangeInfo failed:', error.message);
  }

  // Check difference
  const difference = contractBalance - rewardPool;
  console.log('Difference:', ethers.formatEther(difference), 'CFX');

  if (difference > 0) {
    console.log('❌ Contract has CFX not accounted for in reward pool!');
    console.log('Need to sync the reward pool with contract balance.');
  } else {
    console.log('✅ Contract balance matches reward pool.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });