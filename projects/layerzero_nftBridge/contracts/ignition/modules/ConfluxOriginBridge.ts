import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DEFAULT_ENDPOINT = "0x1a44076050125825900e736c501f859c50fE728c"; // LayerZero V2 endpoint address
const DEFAULT_ORIGINAL_NFT = "0x0000000000000000000000000000000000000000"; // Placeholder: replace with your actual original NFT contract address on Conflux eSpace
const DEFAULT_DELEGATE = "0x0000000000000000000000000000000000000000"; // Placeholder: replace with the delegate/owner address (e.g., your wallet address)

export default buildModule("EspaceBridgeModuleV2", (m) => {  // Changed module name to V2 for fresh state
  const endpoint = m.getParameter("endpoint", DEFAULT_ENDPOINT);
  const originalNFT = m.getParameter("originalNFT", DEFAULT_ORIGINAL_NFT);
  const delegate = m.getAccount(0);
  const espaceBridge = m.contract("EspaceBridge", [endpoint, originalNFT, delegate]);  // Changed future ID to EspaceBridgeV2
  return { espaceBridge };
});