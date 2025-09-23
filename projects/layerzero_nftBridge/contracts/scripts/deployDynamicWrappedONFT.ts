// deployDynamicWrappedONFTFactory.ts - Deployment script for DynamicWrappedONFTFactory on Base Mainnet
import { ethers } from "hardhat";

async function main() {
  // LayerZero V2 Endpoint address on Base Mainnet
  const ENDPOINT_ADDRESS = "0x1a44076050125825900e736c501f859c50fE728c";
  const [deployer] = await ethers.getSigners();
  const DELEGATE_ADDRESS = deployer.address; // Owner/delegate for OApp configs

  console.log(`Deploying DynamicWrappedONFTFactory from account: ${deployer.address}`);
  const DynamicWrappedONFTFactory = await ethers.getContractFactory("DynamicWrappedONFTFactory");
  const dynamicWrapped = await DynamicWrappedONFTFactory.deploy(
    ENDPOINT_ADDRESS,
    DELEGATE_ADDRESS
  );

  await dynamicWrapped.deployed();
  console.log(`DynamicWrappedONFTFactory deployed on Base to: ${dynamicWrapped.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});