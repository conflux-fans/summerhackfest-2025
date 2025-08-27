const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting StarMiner contract deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "CFX");
  
  if (balance < ethers.parseEther("0.1")) {
    console.warn("⚠️  Warning: Low balance. Make sure you have enough CFX for deployment.");
  }
  
  console.log("\n" + "=".repeat(50));
  
  // Deploy StarMinerCredits contract
  console.log("📦 Deploying StarMinerCredits...");
  const StarMinerCredits = await ethers.getContractFactory("StarMinerCredits");
  const creditsContract = await StarMinerCredits.deploy();
  await creditsContract.waitForDeployment();
  const creditsAddress = await creditsContract.getAddress();
  console.log("✅ StarMinerCredits deployed to:", creditsAddress);
  
  // Deploy GameStateManager contract
  console.log("📦 Deploying GameStateManager...");
  const GameStateManager = await ethers.getContractFactory("GameStateManager");
  const gameStateContract = await GameStateManager.deploy(creditsAddress);
  await gameStateContract.waitForDeployment();
  const gameStateAddress = await gameStateContract.getAddress();
  console.log("✅ GameStateManager deployed to:", gameStateAddress);
  
  // Deploy P2ERewards contract
  console.log("📦 Deploying P2ERewards...");
  const P2ERewards = await ethers.getContractFactory("P2ERewards");
  const p2eContract = await P2ERewards.deploy(creditsAddress);
  await p2eContract.waitForDeployment();
  const p2eAddress = await p2eContract.getAddress();
  console.log("✅ P2ERewards deployed to:", p2eAddress);
  
  console.log("\n" + "=".repeat(50));
  
  // Set up contract permissions
  console.log("🔧 Setting up contract permissions...");
  
  // Authorize GameStateManager to interact with Credits contract
  console.log("🔑 Authorizing GameStateManager...");
  await creditsContract.setAuthorizedContract(gameStateAddress, true);
  
  // Authorize P2ERewards to interact with Credits contract
  console.log("🔑 Authorizing P2ERewards...");
  await creditsContract.setAuthorizedContract(p2eAddress, true);
  
  console.log("✅ Contract permissions configured");
  
  // Fund the reward pool with initial amount
  console.log("💰 Funding initial reward pool...");
  const initialFunding = ethers.parseEther("1.0"); // 1 CFX
  await deployer.sendTransaction({
    to: p2eAddress,
    value: initialFunding
  });
  console.log("✅ Reward pool funded with 1 CFX");
  
  console.log("\n" + "=".repeat(50));
  console.log("🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("StarMinerCredits:", creditsAddress);
  console.log("GameStateManager:", gameStateAddress);
  console.log("P2ERewards:", p2eAddress);
  
  console.log("\n🔗 Explorer Links:");
  const explorerBase = process.env.CONFLUX_NETWORK === "mainnet" 
    ? "https://evm.confluxscan.io/address/" 
    : "https://evmtestnet.confluxscan.io/address/";
  
  console.log("StarMinerCredits:", explorerBase + creditsAddress);
  console.log("GameStateManager:", explorerBase + gameStateAddress);
  console.log("P2ERewards:", explorerBase + p2eAddress);
  
  console.log("\n📝 Environment Variables for Frontend:");
  console.log("NEXT_PUBLIC_CREDITS_CONTRACT=" + creditsAddress);
  console.log("NEXT_PUBLIC_GAMESTATE_CONTRACT=" + gameStateAddress);
  console.log("NEXT_PUBLIC_P2E_CONTRACT=" + p2eAddress);
  
  // Save deployment info to file
  const deploymentInfo = {
    network: process.env.CONFLUX_NETWORK || "testnet",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      StarMinerCredits: creditsAddress,
      GameStateManager: gameStateAddress,
      P2ERewards: p2eAddress
    },
    transactionHashes: {
      StarMinerCredits: creditsContract.deploymentTransaction()?.hash,
      GameStateManager: gameStateContract.deploymentTransaction()?.hash,
      P2ERewards: p2eContract.deploymentTransaction()?.hash
    }
  };
  
  const fs = require('fs');
  const path = require('path');
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, `deployment-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);
  
  console.log("\n🎮 Next Steps:");
  console.log("1. Update your .env.local file with the contract addresses above");
  console.log("2. Verify contracts on ConfluxScan (optional)");
  console.log("3. Test the game with blockchain integration");
  console.log("4. Fund the reward pool with more CFX if needed");
  
  console.log("\n✨ StarMiner is ready for play-to-earn gaming!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });