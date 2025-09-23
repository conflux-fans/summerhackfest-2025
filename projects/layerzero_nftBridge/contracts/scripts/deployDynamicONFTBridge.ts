// deployDynamicONFTBridge.ts - Deployment script for DynamicONFTBridge on any EVM-compatible chain
import { ethers, network } from "hardhat";

async function main() {
  // LayerZero V2 Endpoint address (assuming deterministic deployment across supported EVM chains; update if needed for specific chains)
  const ENDPOINT_ADDRESS = "0x1a44076050125825900e736c501f859c50fE728c";

  const [deployer] = await ethers.getSigners();
  const DELEGATE_ADDRESS = deployer.address; // Owner/delegate for OApp configs

  // Use the Hardhat network name as chainName (capitalized for display)
  const chainName = network.name.charAt(0).toUpperCase() + network.name.slice(1);

  console.log(`Deploying DynamicONFTBridge on ${chainName} from account: ${deployer.address}`);

  const DynamicONFTBridge = await ethers.getContractFactory("DynamicONFTBridge");
  const dynamicBridge = await DynamicONFTBridge.deploy(
    ENDPOINT_ADDRESS,
    DELEGATE_ADDRESS
  );

  await dynamicBridge.deployed();

  console.log(`DynamicONFTBridge deployed on ${chainName} to: ${dynamicBridge.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});