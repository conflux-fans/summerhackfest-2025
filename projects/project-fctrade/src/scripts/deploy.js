const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // // Deploy FCToken
  // console.log("Deploying FCToken...");
  // const FCToken = await ethers.getContractFactory("FCToken");
  // const fcToken = await FCToken.deploy(deployer.address);
  // await fcToken.deployed();
  // console.log("FCToken deployed to:", fcToken.address);

  // // Mint some FC tokens for the deployer for testing
  // console.log("Minting 100,000 FC tokens to deployer...");
  // const mintAmount = ethers.utils.parseEther("100000");
  // const mintTx = await fcToken.mint(deployer.address, mintAmount);
  // await mintTx.wait();
  // console.log("Successfully minted 100,000 FC tokens to deployer");

  // Deploy OrderBook contract
  console.log("Deploying OrderBook contract...");
  const OrderBook = await ethers.getContractFactory("OrderBook");
  const orderBook = await upgrades.deployProxy(OrderBook, ["0xba2289fee4673ef00ee8d8dae260965ab543b68f", deployer.address], { initializer: 'initialize' });
    
  await orderBook.deployed();
  console.log("OrderBook (proxy) contract deployed to:", orderBook.address);

  // Verification and summary
  console.log("\nDeployment Summary:");
  console.log("OrderBook Contract:", orderBook.address);
  console.log("Deployer:", deployer.address);

  // Get initial information from the OrderBook contract
  const feeBps = await orderBook.feeBps();
  const owner = await orderBook.owner();
  const cfxBalance = await ethers.provider.getBalance(orderBook.address);

  console.log("\nInitial Contract State:");
  console.log("OrderBook - Trading Fee (Basis Points):", feeBps.toString());
  console.log("OrderBook - Owner:", owner);
  console.log("OrderBook - CFX Balance:", ethers.utils.formatEther(cfxBalance), "CFX");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 