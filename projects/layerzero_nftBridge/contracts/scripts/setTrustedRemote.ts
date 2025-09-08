import hre from "hardhat";
import { Wallet, JsonRpcProvider, Contract, solidityPacked } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// Contract addresses and chain IDs
const CONFLUX_ORIGIN_ADDRESS = "0x17f99bad7981986c684FDc8d78B1342ec7470ac1";
const BASE_WRAPPED_ADDRESS = "0x16dED18bd0ead69b331B0222110F74b5716627f8";
const CONFLUX_EID = 30212;
const BASE_EID = 30184;

// ABI for setTrustedRemote and trustedRemoteLookup
const BRIDGE_ABI = [
  {
    inputs: [
      { name: "_dstChainId", type: "uint16" },
      { name: "_path", type: "bytes" },
    ],
    name: "setTrustedRemote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_dstChainId", type: "uint16" }],
    name: "trustedRemoteLookup",
    outputs: [{ name: "", type: "bytes" }],
    stateMutability: "view",
    type: "function",
  },
];

// Utility to compute the path
function computePath(addr1: string, addr2: string) {
  return solidityPacked(["address", "address"], [addr1, addr2]);
}

async function main() {
  // Providers
  const confluxProvider = new JsonRpcProvider(process.env.CONFLUX_RPC || "https://evm.confluxrpc.com");
  const baseProvider = new JsonRpcProvider(process.env.BASE_RPC || "https://mainnet.base.org");

  // Wallet (same private key works on both networks)
  const wallet = new Wallet(process.env.PRIVATE_KEY || "", confluxProvider);
  console.log("Wallet address:", wallet.address);

  // Compute paths
  const confluxToBasePath = computePath(BASE_WRAPPED_ADDRESS, CONFLUX_ORIGIN_ADDRESS);
  const baseToConfluxPath = computePath(CONFLUX_ORIGIN_ADDRESS, BASE_WRAPPED_ADDRESS);

  // --- Conflux Bridge ---
  const confluxBridge = new Contract(CONFLUX_ORIGIN_ADDRESS, BRIDGE_ABI, wallet);
  const currentConfluxRemote = await confluxBridge.trustedRemoteLookup(BASE_EID);

  if (currentConfluxRemote.toLowerCase() === confluxToBasePath.toLowerCase()) {
    console.log("✅ Trusted remote already set on Conflux for Base EID 30184");
  } else {
    console.log("⏳ Setting trusted remote on Conflux...");
    const tx = await confluxBridge.setTrustedRemote(BASE_EID, confluxToBasePath);
    await tx.wait();
    console.log("✅ Trusted remote set on Conflux:", tx.hash);
    console.log("🔗 ConfluxScan:", `https://evm.confluxscan.net/tx/${tx.hash}`);
  }

  // --- Base Bridge ---
  const baseWallet = new Wallet(process.env.PRIVATE_KEY || "", baseProvider);
  const baseBridge = new Contract(BASE_WRAPPED_ADDRESS, BRIDGE_ABI, baseWallet);
  const currentBaseRemote = await baseBridge.trustedRemoteLookup(CONFLUX_EID);

  if (currentBaseRemote.toLowerCase() === baseToConfluxPath.toLowerCase()) {
    console.log("✅ Trusted remote already set on Base for Conflux EID 30212");
  } else {
    console.log("⏳ Setting trusted remote on Base...");
    const tx = await baseBridge.setTrustedRemote(CONFLUX_EID, baseToConfluxPath);
    await tx.wait();
    console.log("✅ Trusted remote set on Base:", tx.hash);
    console.log("🔗 BaseScan:", `https://basescan.org/tx/${tx.hash}`);
  }

  console.log("🎉 Trusted remote setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
