// ignition/modules/ConfluxOriginBridge.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DEFAULT_ENDPOINT = "0x1a44076050125825900e736c501f859c50fE728c"; // LayerZero V2 testnet endpoint address
const DEFAULT_ORIGINAL_NFT = "0x0000000000000000000000000000000000000000"; // Placeholder: replace with your actual original NFT contract address on Conflux eSpace

export default buildModule("EspaceBridgeModule", (m) => {
  const endpoint = m.getParameter("endpoint", DEFAULT_ENDPOINT);
  const originalNFT = m.getParameter("originalNFT", DEFAULT_ORIGINAL_NFT);

  const espaceBridge = m.contract("EspaceBridge", [endpoint, originalNFT]);

  return { espaceBridge };
});