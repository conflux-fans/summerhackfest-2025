const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Conflux Network...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "CFX");
  
  if (balance === 0n) {
    throw new Error("❌ Deployer account has no funds! Please fund the account first.");
  }
  
  // Deploy OwnershipNFT implementation
  console.log("\n📦 Deploying OwnershipNFT implementation...");
  const OwnershipNFT = await ethers.getContractFactory("OwnershipNFT");
  const ownershipNFT = await OwnershipNFT.deploy();
  await ownershipNFT.waitForDeployment();
  
  const ownershipNFTAddress = await ownershipNFT.getAddress();
  console.log("✅ OwnershipNFT deployed to:", ownershipNFTAddress);
  
  // Deploy OwnershipFactory
  console.log("\n📦 Deploying OwnershipFactory...");
  const OwnershipFactory = await ethers.getContractFactory("OwnershipFactory");
  
  // Platform fee is 2.5% (250 basis points)
  const platformFee = 250;
  const factory = await OwnershipFactory.deploy(ownershipNFTAddress, platformFee);
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ OwnershipFactory deployed to:", factoryAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  
  try {
    const factoryOwner = await factory.owner();
    const implementationAddress = await factory.nftImplementation();
    const currentPlatformFee = await factory.platformFee();
    
    console.log("📋 Deployment Summary:");
    console.log("- Factory Owner:", factoryOwner);
    console.log("- NFT Implementation:", implementationAddress);
    console.log("- Platform Fee:", currentPlatformFee.toString(), "basis points");
    console.log("- Factory Address:", factoryAddress);
    
    // Test creating a collection
    console.log("\n🧪 Testing collection creation...");
    const testTx = await factory.createCollection(
      "Test Collection",
      "TEST",
      "A test collection for deployment verification",
      "test",
      {
        ruleType: "hold-one",
        traitType: "",
        traitValue: "",
        minRarity: 0,
        validityStart: Math.floor(Date.now() / 1000),
        validityEnd: 0,
        transferable: true
      },
      500, // 5% royalty
      1000, // max supply
      ethers.parseEther("0.01") // 0.01 CFX price
    );
    
    const receipt = await testTx.wait();
    console.log("✅ Test collection created in transaction:", receipt.hash);
    
    // Get the created collection address from events
    const collectionCreatedEvent = receipt.logs.find(
      log => log.topics[0] === ethers.id("CollectionCreated(address,address,string,string)")
    );
    
    if (collectionCreatedEvent) {
      const collectionAddress = ethers.AbiCoder.defaultAbiCoder().decode(
        ["address", "address", "string", "string"],
        collectionCreatedEvent.data
      )[0];
      console.log("🎨 Test collection deployed at:", collectionAddress);
    }
    
  } catch (error) {
    console.error("❌ Deployment verification failed:", error);
  }
  
  // Save deployment info
  const deployment = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      OwnershipNFT: {
        address: ownershipNFTAddress,
        type: "implementation"
      },
      OwnershipFactory: {
        address: factoryAddress,
        type: "factory",
        config: {
          platformFee: platformFee,
          owner: deployer.address
        }
      }
    },
    gasUsed: {
      // This would need to be calculated from transaction receipts
      total: "estimated"
    }
  };
  
  // Write deployment info to file
  const fs = require('fs');
  const path = require('path');
  
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));
  
  console.log("\n📄 Deployment info saved to:", deploymentFile);
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("OwnershipNFT (Implementation):", ownershipNFTAddress);
  console.log("OwnershipFactory:", factoryAddress);
  console.log("\n🔗 Add these addresses to your frontend configuration!");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });