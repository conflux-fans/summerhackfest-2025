const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("=== WALLET BALANCE CHECK ===");
    console.log("Deployer address:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceInCFX = ethers.formatEther(balance);
    
    console.log("Balance:", balanceInCFX, "CFX");
    
    if (parseFloat(balanceInCFX) > 0.1) {
        console.log("✅ Sufficient balance for deployment");
        return true;
    } else {
        console.log("❌ Insufficient balance. Need at least 0.1 CFX for deployment");
        console.log("Please fund the wallet using the faucet:");
        console.log("https://efaucet.confluxnetwork.org/");
        return false;
    }
}

main()
    .then((hasBalance) => {
        if (hasBalance) {
            console.log("\n🚀 Ready to deploy contracts!");
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });