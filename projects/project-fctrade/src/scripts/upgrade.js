const { upgrades, ethers } = require("hardhat");

async function main() {
  const proxyAddress = "0x37F1EDfEA5D7F738840646a6BFCa206BC756E67f"; // 填写你的代理合约地址

  const OrderBook = await ethers.getContractFactory("OrderBook");
  console.log("Upgrading OrderBook...");
  await upgrades.upgradeProxy(proxyAddress, OrderBook);
  console.log("OrderBook upgraded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });