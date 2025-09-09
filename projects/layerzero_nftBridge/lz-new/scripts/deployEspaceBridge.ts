import { ethers } from "hardhat";

async function main() {
  const ENDPOINT_ADDRESS = "0x1a44076050125825900e736c501f859c50fE728c";
  const ORIGINAL_NFT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Dummy or your existing NFT
  const [deployer] = await ethers.getSigners();
  const DELEGATE_ADDRESS = deployer.address;

  const EspaceBridge = await ethers.getContractFactory("EspaceBridge");
  const espaceBridge = await EspaceBridge.deploy(ENDPOINT_ADDRESS, ORIGINAL_NFT_ADDRESS, DELEGATE_ADDRESS);
  await espaceBridge.deployed();
  console.log(`EspaceBridge deployed on Conflux eSpace to: ${espaceBridge.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});