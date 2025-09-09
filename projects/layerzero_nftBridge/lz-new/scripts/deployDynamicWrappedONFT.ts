// deployDynamicWrappedONFT.ts - Deployment script for DynamicWrappedONFT on Base Mainnet
import { ethers } from "hardhat";

async function main() {
  // LayerZero V2 Endpoint address on Base Mainnet
  const ENDPOINT_ADDRESS = "0x1a44076050125825900e736c501f859c50fE728c";
  const [deployer] = await ethers.getSigners();
  const DELEGATE_ADDRESS = deployer.address; // Owner/delegate for OApp configs
  console.log(`Deploying DynamicWrappedONFT from account: ${deployer.address}`);
  const DynamicWrappedONFT = await ethers.getContractFactory("DynamicWrappedONFT");
  const dynamicWrapped = await DynamicWrappedONFT.deploy(
    ENDPOINT_ADDRESS,
    DELEGATE_ADDRESS
  );
  await dynamicWrapped.deployed();
  console.log(`DynamicWrappedONFT deployed on Base to: ${dynamicWrapped.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});