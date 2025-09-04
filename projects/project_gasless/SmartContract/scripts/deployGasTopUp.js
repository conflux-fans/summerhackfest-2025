const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying GasTopUp with account:", deployer.address);

  const GasTopUp = await hre.ethers.getContractFactory("GasTopUp");
  const gasTopUp = await GasTopUp.deploy(
    process.env.PYTH_ADDRESS,
    process.env.CFX_USD_FEED_ID
);


  await gasTopUp.deployed();

  console.log("GasTopUp deployed to:", gasTopUp.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
