// deployFactoryNftCollectionsMint.ts - Deployment script for FactoryNftCollectionsMint on any EVM-compatible chain
import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Use the Hardhat network name as chainName (capitalized for display)
  const chainName = network.name.charAt(0).toUpperCase() + network.name.slice(1);
  console.log(`Deploying FactoryNftCollectionsMint on ${chainName} from account: ${deployer.address}`);

  const FactoryNftCollectionsMint = await ethers.getContractFactory("NFTCollectionFactory");
  const factory = await FactoryNftCollectionsMint.deploy();

  await factory.deployed();
  console.log(`FactoryNftCollectionsMint deployed on ${chainName} to: ${factory.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});