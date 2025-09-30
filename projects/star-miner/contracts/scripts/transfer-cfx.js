const { ethers } = require("hardhat");

// Get parameters from environment variables
function getOptions() {
  const options = {
    fromPrivateKey: process.env.FROM_PRIVATE_KEY || null,
    toWallet: process.env.TO_WALLET || null,
    amount: process.env.TRANSFER_AMOUNT || '100',
    network: 'confluxTestnet'
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
    console.log("CFX Transfer Script - Transfer from any wallet to any wallet");
    console.log("Usage: FROM_PRIVATE_KEY=<private_key> TO_WALLET=<address> [TRANSFER_AMOUNT=<cfx>] npx hardhat run scripts/transfer-cfx.js --network <network>");
    console.log("");
    console.log("Environment Variables:");
    console.log("  FROM_PRIVATE_KEY=<key>     Private key of sender wallet (required)");
    console.log("  TO_WALLET=<address>       Target wallet address (required)");
    console.log("  TRANSFER_AMOUNT=<cfx>     Amount of CFX to send (default: 100)");
    console.log("");
    console.log("Examples:");
    console.log("  FROM_PRIVATE_KEY=0x1234... TO_WALLET=0xC3686C35a5E2E7c4c0960f92Acc0cDE9CbD59DFA npx hardhat run scripts/transfer-cfx.js --network confluxTestnet");
    console.log("  FROM_PRIVATE_KEY=0x1234... TO_WALLET=0xC3686... TRANSFER_AMOUNT=50 npx hardhat run scripts/transfer-cfx.js --network confluxTestnet");
    console.log("");
    console.log("⚠️  SECURITY WARNING: Never share your private key or commit it to version control!");
    console.log("💡 TIP: You can also create a .env file with these variables for easier use");
    process.exit(0);
  }

  return options;
}

const options = getOptions();

async function main() {
  // Validate required parameters
  if (!options.fromPrivateKey) {
    console.error("❌ Error: FROM_PRIVATE_KEY environment variable is required");
    console.log("Usage: FROM_PRIVATE_KEY=<private_key> TO_WALLET=<address> [TRANSFER_AMOUNT=<cfx>] npx hardhat run scripts/transfer-cfx.js --network <network>");
    console.log("For help: npx hardhat run scripts/transfer-cfx.js --help");
    process.exit(1);
  }

  if (!options.toWallet) {
    console.error("❌ Error: TO_WALLET environment variable is required");
    console.log("Usage: FROM_PRIVATE_KEY=<private_key> TO_WALLET=<address> [TRANSFER_AMOUNT=<cfx>] npx hardhat run scripts/transfer-cfx.js --network <network>");
    console.log("For help: npx hardhat run scripts/transfer-cfx.js --help");
    process.exit(1);
  }

  // Validate wallet address format
  if (!ethers.isAddress(options.toWallet)) {
    console.error("❌ Error: Invalid target wallet address format");
    process.exit(1);
  }

  // Validate private key format
  if (!options.fromPrivateKey.startsWith('0x') || options.fromPrivateKey.length !== 66) {
    console.error("❌ Error: Invalid private key format. Must be 64 hex characters prefixed with 0x");
    process.exit(1);
  }

  // Parse and validate amount
  const transferAmount = parseFloat(options.amount);
  if (isNaN(transferAmount) || transferAmount <= 0) {
    console.error("❌ Error: Invalid amount. Must be a positive number");
    process.exit(1);
  }

  console.log("💸 CFX Transfer Script");
  console.log("=" .repeat(50));
  
  try {
    // Create wallet from private key
    const provider = ethers.provider;
    const senderWallet = new ethers.Wallet(options.fromPrivateKey, provider);
    
    console.log("📤 Sender wallet:", senderWallet.address);
    console.log("📥 Target wallet:", options.toWallet);
    console.log("💵 Amount to transfer:", transferAmount, "CFX");
    console.log("🌐 Network:", options.network);
    
    // Check sender balance
    const senderBalance = await provider.getBalance(senderWallet.address);
    const senderBalanceEther = parseFloat(ethers.formatEther(senderBalance));
    console.log("💰 Sender balance:", senderBalanceEther.toFixed(4), "CFX");
    
    // Check if sender has enough balance (including gas fees)
    const requiredBalance = transferAmount + 0.01; // Add 0.01 CFX for gas fees
    if (senderBalanceEther < requiredBalance) {
      console.error(`❌ Error: Insufficient balance. Need at least ${requiredBalance} CFX (including gas fees)`);
      console.log(`💡 Current balance: ${senderBalanceEther.toFixed(4)} CFX`);
      console.log(`💡 Required: ${transferAmount} CFX + ~0.01 CFX (gas) = ${requiredBalance} CFX`);
      process.exit(1);
    }

    // Check target wallet current balance
    const targetBalance = await provider.getBalance(options.toWallet);
    const targetBalanceEther = parseFloat(ethers.formatEther(targetBalance));
    console.log("🎯 Target wallet current balance:", targetBalanceEther.toFixed(4), "CFX");
    
    // Prevent self-transfer
    if (senderWallet.address.toLowerCase() === options.toWallet.toLowerCase()) {
      console.warn("⚠️  Warning: You're transferring to the same wallet (self-transfer)");
      console.log("This will only consume gas fees without changing the balance.");
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("🚀 Initiating transfer...");
    
    // Send the transaction
    const amountWei = ethers.parseEther(transferAmount.toString());
    const tx = await senderWallet.sendTransaction({
      to: options.toWallet,
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
      
      // Calculate actual gas cost
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.gasPrice || tx.gasPrice;
      const gasCost = parseFloat(ethers.formatEther(gasUsed * gasPrice));
      console.log("💸 Gas cost:", gasCost.toFixed(6), "CFX");
      
      // Check final balances
      const newSenderBalance = await provider.getBalance(senderWallet.address);
      const newTargetBalance = await provider.getBalance(options.toWallet);
      
      console.log("\n" + "=".repeat(50));
      console.log("📊 Final Balances:");
      console.log("📤 Sender balance:", parseFloat(ethers.formatEther(newSenderBalance)).toFixed(4), "CFX");
      console.log("📥 Target balance:", parseFloat(ethers.formatEther(newTargetBalance)).toFixed(4), "CFX");
      
      const actualReceived = parseFloat(ethers.formatEther(newTargetBalance)) - targetBalanceEther;
      const actualSent = senderBalanceEther - parseFloat(ethers.formatEther(newSenderBalance));
      
      console.log("✨ Amount received:", actualReceived.toFixed(4), "CFX");
      console.log("📉 Total deducted from sender:", actualSent.toFixed(4), "CFX", `(${transferAmount} CFX + ${gasCost.toFixed(6)} CFX gas)`);
      
      // Explorer link
      const explorerBase = options.network === "confluxMainnet" 
        ? "https://evm.confluxscan.io/tx/" 
        : "https://evmtestnet.confluxscan.io/tx/";
      console.log("🔗 Explorer link:", explorerBase + tx.hash);
      
      console.log("\n🎉 Transfer completed successfully!");
      
    } else {
      console.error("❌ Transaction failed!");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Transfer failed:", error.message);
    
    // Provide helpful error messages
    if (error.message.includes("insufficient funds")) {
      console.error("💡 Tip: Make sure the sender wallet has enough CFX for the transfer + gas fees");
    } else if (error.message.includes("nonce")) {
      console.error("💡 Tip: Try again in a few seconds, there might be a nonce issue");
    } else if (error.message.includes("gas")) {
      console.error("💡 Tip: Gas estimation failed, the network might be congested");
    } else if (error.message.includes("private key")) {
      console.error("💡 Tip: Check that your private key is correct and properly formatted");
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