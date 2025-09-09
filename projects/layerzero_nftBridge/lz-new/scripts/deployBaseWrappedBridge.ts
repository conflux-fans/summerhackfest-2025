import { ethers } from "hardhat";

async function main() {
  const ENDPOINT_ADDRESS = "0x1a44076050125825900e736c501f859c50fE728c";
  const NAME = "Wrapped Image NFT";
  const SYMBOL = "WINFT";
  const [deployer] = await ethers.getSigners();
  const DELEGATE_ADDRESS = deployer.address;

  const BaseWrappedBridge = await ethers.getContractFactory("BaseWrappedBridge");
  const baseWrappedBridge = await BaseWrappedBridge.deploy(NAME, SYMBOL, ENDPOINT_ADDRESS, DELEGATE_ADDRESS);
  await baseWrappedBridge.deployed();
  console.log(`BaseWrappedBridge deployed on Base to: ${baseWrappedBridge.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});