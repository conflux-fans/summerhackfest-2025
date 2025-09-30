const { ethers } = require("hardhat");

async function main() {
    // Generate a new random wallet
    const wallet = ethers.Wallet.createRandom();
    
    console.log("=== NEW WALLET GENERATED ===");
    console.log("Address:", wallet.address);
    console.log("Private Key:", wallet.privateKey);
    console.log("Mnemonic:", wallet.mnemonic.phrase);
    console.log("");
    console.log("=== NEXT STEPS ===");
    console.log("1. Add testnet CFX to this address using the Conflux faucet:");
    console.log("   https://efaucet.confluxnetwork.org/");
    console.log("");
    console.log("2. Update your .env file with the private key:");
    console.log(`   PRIVATE_KEY=${wallet.privateKey}`);
    console.log("");
    console.log("3. Run deployment script after funding the wallet");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });