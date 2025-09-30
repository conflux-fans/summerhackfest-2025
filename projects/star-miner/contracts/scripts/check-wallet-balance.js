const { ethers } = require("hardhat");

// Get parameters from environment variables
function getOptions() {
  const options = {
    wallets: [],
    network: 'confluxTestnet'
  };
  
  // Get network from hardhat runtime environment if available
  try {
    const hre = require("hardhat");
    options.network = hre.network.name;
  } catch (e) {
    // Fallback to default if hre is not available
  }

  // Parse wallet addresses from environment variable
  if (process.env.CHECK_WALLETS) {
    options.wallets = process.env.CHECK_WALLETS.split(',').map(addr => addr.trim());
  }

  // Check for help flag
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log("Wallet Balance Checker");
    console.log("Usage: [CHECK_WALLETS=<addresses>] npx hardhat run scripts/check-wallet-balance.js --network <network>");
    console.log("");
    console.log("Environment Variables:");
    console.log("  CHECK_WALLETS=<addresses>   Comma-separated wallet addresses to check (optional)");
    console.log("                              If not provided, checks the default Hardhat wallet");
    console.log("");
    console.log("Examples:");
    console.log("  npx hardhat run scripts/check-wallet-balance.js --network confluxTestnet");
    console.log("  CHECK_WALLETS=0x1234...,0x5678... npx hardhat run scripts/check-wallet-balance.js --network confluxTestnet");
    console.log("  CHECK_WALLETS=0xC3686C35a5E2E7c4c0960f92Acc0cDE9CbD59DFA npx hardhat run scripts/check-wallet-balance.js --network confluxTestnet");
    process.exit(0);
  }

  return options;
}

const options = getOptions();

async function checkWalletBalance(address, label = null) {
  try {
    // Validate address format
    if (!ethers.isAddress(address)) {
      console.log(`❌ Invalid address format: ${address}`);
      return null;
    }

    const balance = await ethers.provider.getBalance(address);
    const balanceInCFX = parseFloat(ethers.formatEther(balance));
    
    const displayLabel = label || `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`;
    
    console.log(`📍 ${displayLabel}:`);
    console.log(`   Address: ${address}`);
    console.log(`   Balance: ${balanceInCFX.toFixed(6)} CFX`);
    
    // Balance status indicators
    if (balanceInCFX >= 100) {
      console.log(`   Status:  🟢 Excellent (${balanceInCFX.toFixed(2)} CFX)`);
    } else if (balanceInCFX >= 10) {
      console.log(`   Status:  🟡 Good (${balanceInCFX.toFixed(2)} CFX)`);
    } else if (balanceInCFX >= 1) {
      console.log(`   Status:  🟠 Moderate (${balanceInCFX.toFixed(2)} CFX)`);
    } else if (balanceInCFX >= 0.1) {
      console.log(`   Status:  🔴 Low (${balanceInCFX.toFixed(4)} CFX)`);
    } else if (balanceInCFX > 0) {
      console.log(`   Status:  ⚠️  Very Low (${balanceInCFX.toFixed(6)} CFX)`);
    } else {
      console.log(`   Status:  💀 Empty (0 CFX)`);
    }
    
    return balanceInCFX;
  } catch (error) {
    console.log(`❌ Error checking ${address}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("💰 Wallet Balance Checker");
  console.log("=" .repeat(60));
  console.log(`🌐 Network: ${options.network}`);
  
  // Get explorer base URL
  const explorerBase = options.network === "confluxMainnet" 
    ? "https://evm.confluxscan.io/address/" 
    : "https://evmtestnet.confluxscan.io/address/";
  
  let walletsToCheck = [];
  let totalBalance = 0;
  let validWallets = 0;

  // If specific wallets provided, use those
  if (options.wallets.length > 0) {
    console.log(`📋 Checking ${options.wallets.length} specified wallet(s)...\n`);
    
    for (let i = 0; i < options.wallets.length; i++) {
      const address = options.wallets[i];
      const balance = await checkWalletBalance(address, `Wallet #${i + 1}`);
      
      if (balance !== null) {
        totalBalance += balance;
        validWallets++;
        console.log(`   🔗 Explorer: ${explorerBase}${address}`);
      }
      
      console.log(""); // Empty line for spacing
    }
  } else {
    // Check default Hardhat wallet
    console.log("📋 Checking default Hardhat wallet...\n");
    
    const [defaultWallet] = await ethers.getSigners();
    const balance = await checkWalletBalance(defaultWallet.address, "Default Hardhat Wallet");
    
    if (balance !== null) {
      totalBalance += balance;
      validWallets++;
      console.log(`   🔗 Explorer: ${explorerBase}${defaultWallet.address}`);
    }
    
    console.log(""); // Empty line for spacing
  }

  // Summary
  console.log("=" .repeat(60));
  console.log("📊 SUMMARY:");
  console.log(`   Wallets checked: ${validWallets}`);
  console.log(`   Total balance: ${totalBalance.toFixed(6)} CFX`);
  console.log(`   Average balance: ${validWallets > 0 ? (totalBalance / validWallets).toFixed(6) : '0'} CFX`);
  
  // Recommendations
  console.log("\n💡 RECOMMENDATIONS:");
  
  if (totalBalance >= 100) {
    console.log("   ✅ Excellent! You have sufficient funds for multiple operations");
  } else if (totalBalance >= 10) {
    console.log("   ✅ Good balance for contract deployments and testing");
  } else if (totalBalance >= 1) {
    console.log("   ⚠️  Moderate balance. Good for testing but may need more for heavy operations");
  } else if (totalBalance >= 0.1) {
    console.log("   🔴 Low balance. Sufficient for basic transactions but consider funding more");
  } else if (totalBalance > 0) {
    console.log("   ⚠️  Very low balance. Only enough for a few transactions");
  } else {
    console.log("   💀 No funds available. Please fund your wallet(s) using a faucet");
  }

  // Funding suggestions
  if (totalBalance < 10) {
    console.log("\n🚰 FUNDING OPTIONS:");
    console.log("   • Conflux Testnet Faucet: https://efaucet.confluxnetwork.org/");
    console.log("   • Alternative Faucet: https://conflux-faucets.com/");
    console.log("   • Use transfer script to move funds between wallets");
  }

  // Usage suggestions based on balance
  console.log("\n🎯 WHAT YOU CAN DO:");
  if (totalBalance >= 100) {
    console.log("   • Deploy multiple contracts");
    console.log("   • Fund reward pools generously");
    console.log("   • Extensive testing and transactions");
  } else if (totalBalance >= 10) {
    console.log("   • Deploy contracts");
    console.log("   • Fund reward pools");
    console.log("   • Regular testing");
  } else if (totalBalance >= 1) {
    console.log("   • Deploy smaller contracts");
    console.log("   • Basic testing");
    console.log("   • Limited transactions");
  } else if (totalBalance >= 0.1) {
    console.log("   • Basic transactions");
    console.log("   • Simple contract interactions");
  } else if (totalBalance > 0) {
    console.log("   • Very limited transactions");
    console.log("   • Check balances and read operations");
  } else {
    console.log("   • Only read operations (no transactions possible)");
  }
}

// Handle script errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  });