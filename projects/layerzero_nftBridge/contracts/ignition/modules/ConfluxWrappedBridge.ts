// ignition/modules/ConfluxWrappedBridge.ts (for wrapped on Conflux, from Base originals)
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DEFAULT_NAME = "Wrapped NFT from Base";
const DEFAULT_SYMBOL = "WBNFT";
const DEFAULT_ENDPOINT = "0x1a44076050125825900e736c501f859c50fE728c"; // LayerZero V2 mainnet endpoint

export default buildModule("ConfluxWrappedBridgeModule", (m) => {
  const name = m.getParameter("name", DEFAULT_NAME);
  const symbol = m.getParameter("symbol", DEFAULT_SYMBOL);
  const endpoint = m.getParameter("endpoint", DEFAULT_ENDPOINT);

  const confluxWrappedBridge = m.contract("SepoliaWrappedBridge", [name, symbol, endpoint]); // Reuse the contract code, just rename for clarity

  return { confluxWrappedBridge };
});