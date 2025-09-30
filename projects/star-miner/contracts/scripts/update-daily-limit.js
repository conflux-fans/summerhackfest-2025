const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Updating P2E Daily Limit...");
  
  // Get the deployer account (contract owner)
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "CFX");
  
  // Get the P2E contract address from environment or deployment records
  let P2E_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_P2E_CONTRACT || process.env.P2E_CONTRACT;
  
  // If not found in env, try to get from latest deployment
  if (!P2E_CONTRACT_ADDRESS) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Get the latest deployment file
      const deploymentsDir = path.join(__dirname, '../deployments');
      if (fs.existsSync(deploymentsDir)) {
        const deploymentFiles = fs.readdirSync(deploymentsDir)
          .filter(file => file.startsWith('deployment-') && file.endsWith('.json'))
          .sort()
          .reverse(); // Get the latest one
        
        if (deploymentFiles.length > 0) {
          const latestDeployment = JSON.parse(
            fs.readFileSync(path.join(deploymentsDir, deploymentFiles[0]), 'utf8')
          );
          P2E_CONTRACT_ADDRESS = latestDeployment.contracts.P2ERewards;
          console.log("📁 Using P2E address from deployment:", deploymentFiles[0]);
        }
      }
    } catch (error) {
      console.log("⚠️  Could not read deployment files:", error.message);
    }
  }
  
  if (!P2E_CONTRACT_ADDRESS) {
    console.error("❌ P2E contract address not found");
    console.log("💡 Options to fix this:");
    console.log("   1. Set P2E_CONTRACT in contracts/.env file");
    console.log("   2. Set NEXT_PUBLIC_P2E_CONTRACT in main .env.local file");
    console.log("   3. Make sure deployment files exist in contracts/deployments/");
    process.exit(1);
  }
  
  console.log("🎯 P2E Contract:", P2E_CONTRACT_ADDRESS);
  
  // Get contract instance
  const P2ERewards = await ethers.getContractFactory("P2ERewards");
  const p2eContract = P2ERewards.attach(P2E_CONTRACT_ADDRESS);
  
  // New daily limit: 25 CFX
  const newDailyLimit = ethers.parseEther("25"); // 25 CFX in wei
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 Current Settings:");
  
  try {
    // Get current settings
    const currentStats = await p2eContract.getContractStats();
    console.log("Current daily limit:", ethers.formatEther(currentStats.dailyLimit), "CFX");
    console.log("Current exchange rate:", currentStats.exchangeRate.toString(), "Stardust per CFX");
    console.log("Current reward pool:", ethers.formatEther(currentStats.totalPool), "CFX");
    
    console.log("\n🔄 Updating daily limit to 25 CFX...");
    
    // Update daily limit
    const tx = await p2eContract.setDailyLimit(newDailyLimit);
    console.log("📝 Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ Daily limit updated successfully!");
      console.log("🧾 Block number:", receipt.blockNumber);
      console.log("⛽ Gas used:", receipt.gasUsed.toString());
      
      // Verify the change
      const updatedStats = await p2eContract.getContractStats();
      console.log("\n📊 Updated Settings:");
      console.log("New daily limit:", ethers.formatEther(updatedStats.dailyLimit), "CFX");
      
      // Explorer link
      const explorerBase = process.env.CONFLUX_NETWORK === "mainnet" 
        ? "https://evm.confluxscan.io/tx/" 
        : "https://evmtestnet.confluxscan.io/tx/";
      console.log("🔗 Explorer link:", explorerBase + tx.hash);
      
      console.log("\n🎉 Daily limit successfully updated to 25 CFX!");
      console.log("💡 Players can now claim up to 25 CFX per day from P2E rewards");
      
    } else {
      console.error("❌ Transaction failed!");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Failed to update daily limit:", error.message);
    
    // Provide helpful error messages
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.error("💡 Tip: Only the contract owner can update the daily limit");
      console.error("💡 Make sure you're using the same wallet that deployed the contract");
    } else if (error.message.includes("insufficient funds")) {
      console.error("💡 Tip: Make sure you have enough CFX for gas fees");
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