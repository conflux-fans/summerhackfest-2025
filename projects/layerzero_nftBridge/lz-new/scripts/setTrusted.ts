import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();
// Contract addresses and EIDs
const CONFLUX_ORIGIN_ADDRESS = "0x45a8c758a42B0515dB5FfC880d1dffC7358cac03";
const BASE_WRAPPED_ADDRESS = "0xF5d65814E2584cD504F1AC836C0A24d438CDf7Ec";
const CONFLUX_EID = 30212;
const BASE_EID = 30184;
// ABI for setPeer and peers
const BRIDGE_ABI = [
  {
    inputs: [
      { name: "_dstEid", type: "uint32" },
      { name: "_peer", type: "bytes32" },
    ],
    name: "setPeer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_eid", type: "uint32" }],
    name: "peers",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
];
// Utility to compute the peer (bytes32 from address)
function computePeer(addr: string) {
  return ethers.utils.hexZeroPad(addr, 32);
}
async function main() {
  // Providers
  const confluxProvider = new ethers.providers.JsonRpcProvider(process.env.CONFLUX_RPC || "https://evm.confluxrpc.com");
  const baseProvider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC || "https://mainnet.base.org");
  // Wallet (same private key works on both networks)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", confluxProvider);
  console.log("Wallet address:", wallet.address);
  // Compute peers
  const confluxToBasePeer = computePeer(BASE_WRAPPED_ADDRESS);
  const baseToConfluxPeer = computePeer(CONFLUX_ORIGIN_ADDRESS);
  // --- Conflux Bridge ---
  const confluxBridge = new ethers.Contract(CONFLUX_ORIGIN_ADDRESS, BRIDGE_ABI, wallet.connect(confluxProvider));
  const currentConfluxPeer = await confluxBridge.peers(BASE_EID);
  if (currentConfluxPeer.toLowerCase() === confluxToBasePeer.toLowerCase()) {
    console.log("✅ Peer already set on Conflux for Base EID 30184");
  } else {
    console.log("⏳ Setting peer on Conflux...");
    const tx = await confluxBridge.setPeer(BASE_EID, confluxToBasePeer);
    await tx.wait();
    console.log("✅ Peer set on Conflux:", tx.hash);
    console.log("🔗 ConfluxScan:", `https://evm.confluxscan.net/tx/${tx.hash}`);
  }
  // --- Base Bridge ---
  const baseWallet = wallet.connect(baseProvider);
  const baseBridge = new ethers.Contract(BASE_WRAPPED_ADDRESS, BRIDGE_ABI, baseWallet);
  const currentBasePeer = await baseBridge.peers(CONFLUX_EID);
  if (currentBasePeer.toLowerCase() === baseToConfluxPeer.toLowerCase()) {
    console.log("✅ Peer already set on Base for Conflux EID 30212");
  } else {
    console.log("⏳ Setting peer on Base...");
    const tx = await baseBridge.setPeer(CONFLUX_EID, baseToConfluxPeer);
    await tx.wait();
    console.log("✅ Peer set on Base:", tx.hash);
    console.log("🔗 BaseScan:", `https://basescan.org/tx/${tx.hash}`);
  }
  console.log("🎉 Peer setup complete!");
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });