import { ethers } from 'hardhat';

async function main() {
  const ESPACE_BRIDGE_ADDRESS = '0x549E05CDE1f00e2FDfA3D58B7402E76438FF48CE';
  const BASE_EID = 30184; // Base EID
  const MSG_TYPE = 1; // SEND

  // Full ABI with inherited enforcedOptions
  const ABI = [
    // ... your existing ABI items ...
    {
      "inputs": [
        { "internalType": "uint32", "name": "_eid", "type": "uint32" },
        { "internalType": "uint16", "name": "_msgType", "type": "uint16" }
      ],
      "name": "enforcedOptions",
      "outputs": [
        { "internalType": "bytes", "name": "", "type": "bytes" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
    // Add other missing inherited functions if needed
  ];

  const espaceBridge = await ethers.getContractAt(ABI, ESPACE_BRIDGE_ADDRESS);
  const options = await espaceBridge.enforcedOptions(BASE_EID, MSG_TYPE);
  console.log(`Enforced options for EID ${BASE_EID}, msgType ${MSG_TYPE}: ${options}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});