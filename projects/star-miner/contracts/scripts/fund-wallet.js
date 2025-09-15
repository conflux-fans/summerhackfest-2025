const { ethers } = require("hardhat");

// Get parameters from environment variables or command line
function getOptions() {
  const options = {
    wallet: process.env.FUND_WALLET || null,
    amount: process.env.FUND_AMOUNT || '100',
    network: 'confluxTestnet' // Default network
  };
  
  // Get network from hardhat runtime environment if available
  try {
    const hre = require("hardhat");
    options.network = hre.network.name;
  } catch (e) {
    // Fallback to default if hre is not available
  }

  // Check for help flag
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log("CFX Wallet Funding Script");
    console.log("Usage: FUND_WALLET=<address> [FUND_AMOUNT=<cfx>] npx hardhat run scripts/fund-wallet.js --network <network>");
    console.log("");
    console.log("Environment Variables:");
    console.log("  FUND_WALLET=<address>   Wallet address to fund (required)");
    console.log("  FUND_AMOUNT=<cfx>       Amount of CFX to send (default: 100)");
    console.log("");
    console.log("Examples:");
    console.log("  FUND_WALLET=0x1234567890123456789012345678901234567890 npx hardhat run scripts/fund-wallet.js --network confluxTestnet");
    console.log("  FUND_WALLET=0x1234... FUND_AMOUNT=50 npx hardhat run scripts/fund-wallet.js --network confluxTestnet");
    console.log("  FUND_WALLET=0x1234... FUND_AMOUNT=25 npx hardhat run scripts/fund-wallet.js --network confluxMainnet");
    process.exit(0);
  }

  return options;
}

const options = getOptions();

async function main() {
  // Validate required parameters
  if (!options.wallet) {
    console.error("❌ Error: FUND_WALLET environment variable is required");
    console.log("Usage: FUND_WALLET=<address> [FUND_AMOUNT=<cfx>] npx hardhat run scripts/fund-wallet.js --network <network>");
    console.log("Example: FUND_WALLET=0x1234... FUND_AMOUNT=50 npx hardhat run scripts/fund-wallet.js --network confluxTestnet");
    console.log("For help: npx hardhat run scripts/fund-wallet.js --help");
    process.exit(1);
  }

  // Validate wallet address format
  if (!ethers.isAddress(options.wallet)) {
    console.error("❌ Error: Invalid wallet address format");
    process.exit(1);
  }

  // Parse and validate amount
  const fundAmount = parseFloat(options.amount);
  if (isNaN(fundAmount) || fundAmount <= 0) {
    console.error("❌ Error: Invalid amount. Must be a positive number");
    process.exit(1);
  }

  console.log("💰 CFX Wallet Funding Script");
  console.log("=" .repeat(50));
  
  // Get the deployer/sender account
  const [sender] = await ethers.getSigners();
  console.log("📤 Sender account:", sender.address);
  console.log("📥 Target wallet:", options.wallet);
  console.log("💵 Amount to send:", fundAmount, "CFX");
  console.log("🌐 Network:", options.network);
  
  // Check sender balance
  const senderBalance = await sender.provider.getBalance(sender.address);
  const senderBalanceEther = parseFloat(ethers.formatEther(senderBalance));
  console.log("💰 Sender balance:", senderBalanceEther.toFixed(4), "CFX");
  
  // Check if sender has enough balance (including gas fees)
  const requiredBalance = fundAmount + 0.01; // Add 0.01 CFX for gas fees
  if (senderBalanceEther < requiredBalance) {
    console.error(`❌ Error: Insufficient balance. Need at least ${requiredBalance} CFX (including gas fees)`);
    process.exit(1);
  }

  // Check target wallet current balance
  const targetBalance = await sender.provider.getBalance(options.wallet);
  const targetBalanceEther = parseFloat(ethers.formatEther(targetBalance));
  console.log("🎯 Target wallet current balance:", targetBalanceEther.toFixed(4), "CFX");
  
  console.log("\n" + "=".repeat(50));
  console.log("🚀 Initiating transfer...");
  
  try {
    // Send the transaction
    const amountWei = ethers.parseEther(fundAmount.toString());
    const tx = await sender.sendTransaction({
      to: options.wallet,
      value: amountWei,
      gasLimit: 21000 // Standard gas limit for simple transfer
    });
    
    console.log("📝 Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ Transaction confirmed!");
      console.log("🧾 Block number:", receipt.blockNumber);
      console.log("⛽ Gas used:", receipt.gasUsed.toString());
      
      // Check final balances
      const newSenderBalance = await sender.provider.getBalance(sender.address);
      const newTargetBalance = await sender.provider.getBalance(options.wallet);
      
      console.log("\n" + "=".repeat(50));
      console.log("📊 Final Balances:");
      console.log("📤 Sender balance:", parseFloat(ethers.formatEther(newSenderBalance)).toFixed(4), "CFX");
      console.log("📥 Target balance:", parseFloat(ethers.formatEther(newTargetBalance)).toFixed(4), "CFX");
      
      const actualReceived = parseFloat(ethers.formatEther(newTargetBalance)) - targetBalanceEther;
      console.log("✨ Amount received:", actualReceived.toFixed(4), "CFX");
      
      // Explorer link
      const explorerBase = options.network === "mainnet" 
        ? "https://evm.confluxscan.io/tx/" 
        : "https://evmtestnet.confluxscan.io/tx/";
      console.log("🔗 Explorer link:", explorerBase + tx.hash);
      
      console.log("\n🎉 Wallet funding completed successfully!");
      
    } else {
      console.error("❌ Transaction failed!");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Transaction failed:", error.message);
    
    // Provide helpful error messages
    if (error.message.includes("insufficient funds")) {
      console.error("💡 Tip: Make sure the sender wallet has enough CFX for the transfer + gas fees");
    } else if (error.message.includes("nonce")) {
      console.error("💡 Tip: Try again in a few seconds, there might be a nonce issue");
    } else if (error.message.includes("gas")) {
      console.error("💡 Tip: Gas estimation failed, the network might be congested");
    }
    
    process.exit(1);
  }
}

// Handle script errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  });