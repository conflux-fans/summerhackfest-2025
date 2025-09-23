// deployDynamicConfluxAdapter.ts - Deployment script for DynamicConfluxONFTAdapter on Conflux eSpace
import { ethers } from "hardhat";

async function main() {
  // LayerZero V2 Endpoint address on Conflux eSpace Mainnet
  const ENDPOINT_ADDRESS = "0x1a44076050125825900e736c501f859c50fE728c";
  const [deployer] = await ethers.getSigners();
  const DELEGATE_ADDRESS = deployer.address; // Owner/delegate for OApp configs
  console.log(`Deploying DynamicConfluxONFTAdapter from account: ${deployer.address}`);
  const DynamicConfluxONFTAdapter = await ethers.getContractFactory("DynamicConfluxONFTAdapter");
  const dynamicAdapter = await DynamicConfluxONFTAdapter.deploy(
    ENDPOINT_ADDRESS,
    DELEGATE_ADDRESS
  );
  await dynamicAdapter.deployed();
  console.log(`DynamicConfluxONFTAdapter deployed on Conflux eSpace to: ${dynamicAdapter.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});