const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying GasTopUp with account:", deployer.address);

  const GasTopUp = await hre.ethers.getContractFactory("GasStation");
  const gasTopUp = await GasTopUp.deploy(
    process.env.PYTH_ADDRESS,
    process.env.CFX_USD_FEED_ID
  );

  // Wait for deployment to be mined
  await gasTopUp.deployed();
  console.log("GasTopUp deployed to:", gasTopUp.address);

  // Add token after deployment
  const tx = await gasTopUp.addToken(
    "0xfe97E85d13ABD9c1c33384E796F10B73905637cE", // token address
    "USDT", // ticker
    "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b" // Pyth feedId
  );
  await tx.wait();
  console.log("Token added successfully!");

  // Optional: log all supported tokens
  const tokens = await gasTopUp.getSupportedTokens();
  console.log("Supported tokens:", tokens);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
