const { ethers } = require("hardhat");

async function main() {
  const signers = await ethers.getSigners();

  console.log("Available test accounts:");
  for (let i = 0; i < Math.min(5, signers.length); i++) {
    const signer = signers[i];
    const balance = await ethers.provider.getBalance(signer.address);
    console.log(`Account ${i}: ${signer.address} - Balance: ${ethers.formatEther(balance)} ETH`);
  }

  // Check your wallet balance
  const yourAddress = "0x327C01dA6Da9A6818805cadB9eA8d62B10c20000";
  const yourBalance = await ethers.provider.getBalance(yourAddress);
  console.log(`\nYour wallet: ${yourAddress} - Balance: ${ethers.formatEther(yourBalance)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
