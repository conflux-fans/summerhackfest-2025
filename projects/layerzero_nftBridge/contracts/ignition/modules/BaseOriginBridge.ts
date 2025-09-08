// ignition/modules/BaseOriginBridge.ts (for originals on Base, to Conflux wrapped)
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DEFAULT_ENDPOINT = "0x1a44076050125825900e736c501f859c50fE728c"; // LayerZero V2 mainnet endpoint
const DEFAULT_ORIGINAL_NFT = "0x0000000000000000000000000000000000000000"; // Placeholder: your original NFT on Base

export default buildModule("BaseOriginBridgeModule", (m) => {
  const endpoint = m.getParameter("endpoint", DEFAULT_ENDPOINT);
  const originalNFT = m.getParameter("originalNFT", DEFAULT_ORIGINAL_NFT);

  const baseOriginBridge = m.contract("EspaceBridge", [endpoint, originalNFT]); // Reuse the contract code, rename for clarity

  return { baseOriginBridge };
});