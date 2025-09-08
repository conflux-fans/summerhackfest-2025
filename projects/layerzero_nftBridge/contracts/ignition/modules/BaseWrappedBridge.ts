// ignition/modules/BaseWrappedBridge.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DEFAULT_NAME = "Wrapped NFT";
const DEFAULT_SYMBOL = "WNFT";
const DEFAULT_ENDPOINT = "0x1a44076050125825900e736c501f859c50fE728c"; // LayerZero Base testnet/mainnet endpoint address

export default buildModule("BaseWrappedBridgeModule", (m) => {
  const name = m.getParameter("name", DEFAULT_NAME);
  const symbol = m.getParameter("symbol", DEFAULT_SYMBOL);
  const endpoint = m.getParameter("endpoint", DEFAULT_ENDPOINT);

  const baseWrappedBridge = m.contract("BaseWrappedBridge", [name, symbol, endpoint]);

  return { baseWrappedBridge };
});
