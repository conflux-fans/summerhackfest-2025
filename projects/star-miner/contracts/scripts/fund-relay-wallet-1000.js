const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

async function main() {
  console.log('💰 Funding Relay Wallet to 1000 CFX total...');

  // Configuration
  const relayPrivateKey = process.env.RELAY_PRIVATE_KEY || "0x3060cb095b1e7cc3727d88b00ce99ff4152c006c21358c42b73655ffc5aa87a4";
  const relayWalletAddress = process.env.RELAY_WALLET_ADDRESS || "0xC3686C35a5E2E7c4c0960f92Acc0cDE9CbD59DFA";

  if (!relayPrivateKey) {
    console.error('❌ RELAY_PRIVATE_KEY not found in .env.local');
    console.log('💡 Generate a relay wallet first:');
    console.log('   node ../../scripts/generate-relay-wallet.js');
    process.exit(1);
  }

  if (!relayWalletAddress) {
    console.error('❌ RELAY_WALLET_ADDRESS not found in .env.local');
    console.log('💡 Make sure RELAY_WALLET_ADDRESS is set in .env.local');
    process.exit(1);
  }

  try {
    // Get the deployer/funder wallet (first signer from hardhat)
    const [funder] = await ethers.getSigners();
    
    // Create relay wallet instance for address verification
    const relayWallet = new ethers.Wallet(relayPrivateKey);
    
    console.log('📍 Relay Wallet Address:', relayWallet.address);
    console.log('📍 Funder Address:', funder.address);
    console.log('🌐 Network: Conflux eSpace Testnet');
    console.log('');

    // Verify relay wallet address matches
    if (relayWallet.address.toLowerCase() !== relayWalletAddress.toLowerCase()) {
      console.error('❌ Relay wallet address mismatch!');
      console.log('Expected:', relayWalletAddress);
      console.log('Derived from private key:', relayWallet.address);
      process.exit(1);
    }

    // Check current relay wallet balance
    const currentBalance = await ethers.provider.getBalance(relayWallet.address);
    console.log('Current relay wallet balance:', ethers.formatEther(currentBalance), 'CFX');

    // Calculate how much more CFX we need to reach 1000 CFX
    const targetAmount = ethers.parseEther('1000'); // 1000 CFX
    const additionalFunding = targetAmount - currentBalance;

    if (additionalFunding <= 0) {
      console.log('✅ Relay wallet already has 1000+ CFX!');
      return;
    }

    console.log('Adding:', ethers.formatEther(additionalFunding), 'CFX to reach 1000 CFX total');

    // Check funder balance
    const funderBalance = await ethers.provider.getBalance(funder.address);
    console.log('Funder balance:', ethers.formatEther(funderBalance), 'CFX');

    if (funderBalance < additionalFunding) {
      console.log('❌ Insufficient balance! You need', ethers.formatEther(additionalFunding), 'CFX');
      console.log('💡 Get testnet CFX from: https://efaucet.confluxnetwork.org/');
      return;
    }

    // Fund the relay wallet
    console.log('Funding relay wallet with:', ethers.formatEther(additionalFunding), 'CFX...');
    
    const fundTx = await funder.sendTransaction({
      to: relayWallet.address,
      value: additionalFunding
    });
    
    console.log('Transaction sent:', fundTx.hash);
    
    await fundTx.wait();
    console.log('✅ Transaction confirmed!');

    // Check final state
    const finalBalance = await ethers.provider.getBalance(relayWallet.address);
    console.log('\n=== Final State ===');
    console.log('Final relay wallet balance:', ethers.formatEther(finalBalance), 'CFX');
    
    // Calculate transaction capacity
    const avgGasPrice = ethers.parseUnits('20', 'gwei'); // 20 gwei
    const avgGasLimit = 500000; // 500k gas per transaction
    const costPerTx = avgGasPrice * BigInt(avgGasLimit);
    const costPerTxInCFX = parseFloat(ethers.formatEther(costPerTx));
    const estimatedTxs = Math.floor(parseFloat(ethers.formatEther(finalBalance)) / costPerTxInCFX);
    
    console.log('📊 Transaction Capacity:');
    console.log(`   Cost per transaction: ~${costPerTxInCFX.toFixed(6)} CFX`);
    console.log(`   Estimated transactions possible: ~${estimatedTxs.toLocaleString()}`);
    
    console.log('\n🎉 Relay wallet successfully funded to 1000 CFX!');
    console.log('This supports extensive meta-transaction processing!');
    
  } catch (error) {
    console.error('❌ Error funding relay wallet:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error funding relay wallet:', error);
    process.exit(1);
  });