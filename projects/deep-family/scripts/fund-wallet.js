const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Your wallet address
  const targetAddress = "0x327C01dA6Da9A6818805cadB9eA8d62B10c20000";

  // Transfer amount (10 ETH)
  const amount = ethers.parseEther("10.0");

  console.log(`Funding ${targetAddress} with ${ethers.formatEther(amount)} ETH...`);

  const tx = await deployer.sendTransaction({
    to: targetAddress,
    value: amount,
  });

  await tx.wait();

  console.log(`✅ Successfully sent ${ethers.formatEther(amount)} ETH to ${targetAddress}`);
  console.log(`Transaction hash: ${tx.hash}`);

  // Check balance
  const balance = await ethers.provider.getBalance(targetAddress);
  console.log(`New balance: ${ethers.formatEther(balance)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
