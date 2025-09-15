const hre  = require("hardhat");
const { ethers, JsonRpcProvider } = require('ethers');
// const fs = require('fs');

async function main() {
  const InvestmentClub = await hre.ethers.getContractFactory("InvestmentClub")
  const investmentClub = await InvestmentClub.deploy();
  await investmentClub.deployed();
  console.log("nftMarketplace deployed to:", investmentClub.address);

  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
