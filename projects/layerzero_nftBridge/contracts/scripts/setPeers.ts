// scripts/setPeers.ts

import { ethers } from "ethers"; // Assuming ethers v6 is configured in Hardhat

async function main() {
  const { network, ethers: hreEthers } = require("hardhat"); // For compatibility

  const currentNetwork = network.name;

  const confluxEid = 30212;
  const baseEid = 30184;
  const confluxAddress = "0x98D539a04ECB719D016031649A919f95B440e4D4";
  const baseAddress = "0x2e1ffF1Ac811c5936899B4CD61769A783539d392";

  let oappAddress: string;
  let peerEid: number;
  let peerAddress: string;

  if (currentNetwork === "conflux" || currentNetwork === "confluxESpace") { // Adjust network name as per your hardhat.config.ts
    oappAddress = confluxAddress;
    peerEid = baseEid;
    peerAddress = baseAddress;
  } else if (currentNetwork === "base") {
    oappAddress = baseAddress;
    peerEid = confluxEid;
    peerAddress = confluxAddress;
  } else {
    throw new Error(`Unsupported network: ${currentNetwork}. Run on 'conflux' or 'base'.`);
  }

  // Minimal ABI for setPeer function (assuming OApp interface)
  const abi = [
    "function setPeer(uint32 _eid, bytes32 _peer)"
  ];

  const signer = (await hreEthers.getSigners())[0];
  const oapp = new ethers.Contract(oappAddress, abi, signer);

  // String manipulation to convert address to bytes32 (avoids ethers.zeroPadValue if causing type issues)
  const peerBytes32 = `0x${peerAddress.slice(2).padStart(64, '0')}`;

  console.log(`Setting peer on ${currentNetwork} for EID ${peerEid} to ${peerAddress}`);

  const tx = await oapp.setPeer(peerEid, peerBytes32);
  await tx.wait();

  console.log(`Peer set successfully. Transaction hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});