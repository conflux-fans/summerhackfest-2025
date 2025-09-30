// utils/bridge/layerZeroScanUtils.ts
import { PublicClient, Hash, Address, createPublicClient, http } from "viem";
import { decodeAbiParameters, decodeEventLog, encodePacked, keccak256 } from "viem";
import { BRIDGE_ABI } from "../abi/bridgeAbi";
import {
CONFLUX_CHAIN_ID,
BASE_CHAIN_ID,
// ETH_SEPOLIA_CHAIN_ID,
// BASE_SEPOLIA_CHAIN_ID,
ARBITRUM_CHAIN_ID,
} from "../constants";
export interface LzMessageStatus {
status: "pending" | "delivered" | "failed" | "unknown";
timestamp: number | null; // Delivery timestamp if delivered
estimatedRemainingMs: number | null; // Estimated time left in ms (based on averages)
txHashes: {
srcTxHash: string;
dstTxHash?: string;
  };
}
export interface OAppSendEvent {
dstEid: bigint;
messageId: `0x${string}`;
message: `0x${string}`;
refundAddress: Address;
}
// Helper to map chainId to LayerZero Scan network
export const getLzNetwork = (chainId: number): "testnet" | "mainnet" => {
// Assuming testnet for Sepolia/Base Sepolia; adjust for mainnet if needed
// if ([ETH_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID].includes(chainId)) {
// return "testnet";
//   }
// For Conflux/Base mainnet (if live)
return "mainnet";
};
// Fetch messages for a wallet
export async function fetchLzMessages(
address: string,
network: "testnet" | "mainnet"
): Promise<any[]> {
try {
const baseDomain = network === "testnet" ? 'scan-testnet.layerzero-api.com' : 'scan.layerzero-api.com';
const originalUrl = `https://${baseDomain}/v1/messages/wallet/${address}?limit=100`;
const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`;
const response = await fetch(proxyUrl);
if (!response.ok) {
throw new Error(`API error: ${response.status}`);
    }
const data = await response.json();
return data.data || [];
  } catch (error) {
console.error("Failed to fetch Lz messages:", error);
return [];
  }
}
// Poll LayerZero Scan API for message status by tx hash
export async function fetchLzMessageStatus(
txHash: string,
srcChainId: number,
dstChainId: number
): Promise<LzMessageStatus | null> {
try {
const network = getLzNetwork(srcChainId); // Use src network for query
const baseDomain = network === "testnet" ? 'scan-testnet.layerzero-api.com' : 'scan.layerzero-api.com';
const originalUrl = `https://${baseDomain}/v1/messages/tx/${txHash}`;
const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`;
const response = await fetch(proxyUrl);
if (!response.ok) {
throw new Error(`API error: ${response.status}`);
    }
const data = await response.json();
if (!data || !data.data || data.data.length === 0) {
return null;
    }
const msg = data.data[0];
let status: LzMessageStatus["status"] = "unknown";
let timestamp: number | null = null;
let dstTxHash: string | undefined;
// Map LayerZero statuses to our enum
if (msg.status.name === "DELIVERED") {
status = "delivered";
timestamp = msg.destination.tx?.blockTimestamp ? msg.destination.tx.blockTimestamp * 1000 : null; // Convert to ms
dstTxHash = msg.destination.tx?.txHash;
    } else if (["FAILED", "BLOCKED", "PAYLOAD_STORED", "APPLICATION_BURNED", "APPLICATION_SKIPPED", "UNRESOLVABLE_COMMAND", "MALFORMED_COMMAND"].includes(msg.status.name)) {
status = "failed";
    } else {
status = "pending";
    }
// Estimate remaining time (rough averages; customize based on chain pair)
let estimatedRemainingMs: number | null = null;
if (status === "pending") {
const now = Date.now();
const avgDeliveryMs = getAverageDeliveryTime(srcChainId, dstChainId); // Define below
const srcSentTimestamp = msg.source.tx?.blockTimestamp;
const elapsedMs = srcSentTimestamp ? now - (srcSentTimestamp * 1000) : 0;
estimatedRemainingMs = Math.max(0, avgDeliveryMs - elapsedMs);
    }
return {
status,
timestamp,
estimatedRemainingMs,
txHashes: {
srcTxHash: msg.source.tx?.txHash || "",
dstTxHash,
      },
    };
  } catch (error) {
console.error("Failed to fetch Lz status:", error);
return null;
  }
}
// Rough average delivery times in ms (based on historical data; update as needed)
const getAverageDeliveryTime = (srcChainId: number, dstChainId: number): number => {
// Examples: Sepolia to Base Sepolia ~2-5 min (120000-300000 ms)
// if (srcChainId === ETH_SEPOLIA_CHAIN_ID && dstChainId === BASE_SEPOLIA_CHAIN_ID) {
// return 180000; // 3 min avg
//   }
// if (srcChainId === BASE_SEPOLIA_CHAIN_ID && dstChainId === ETH_SEPOLIA_CHAIN_ID) {
// return 180000;
//   }
// Conflux to Base (mainnet) ~5-10 min
if (srcChainId === CONFLUX_CHAIN_ID && dstChainId === BASE_CHAIN_ID) {
return 420000; // 7 min avg
  }
if (srcChainId === BASE_CHAIN_ID && dstChainId === CONFLUX_CHAIN_ID) {
return 420000;
  }
// Arbitrum pairs (assume similar to Base-Conflux)
if (srcChainId === ARBITRUM_CHAIN_ID && dstChainId === BASE_CHAIN_ID) {
return 420000;
  }
if (srcChainId === BASE_CHAIN_ID && dstChainId === ARBITRUM_CHAIN_ID) {
return 420000;
  }
if (srcChainId === ARBITRUM_CHAIN_ID && dstChainId === CONFLUX_CHAIN_ID) {
return 420000;
  }
if (srcChainId === CONFLUX_CHAIN_ID && dstChainId === ARBITRUM_CHAIN_ID) {
return 420000;
  }
return 300000; // Default 5 min
};
// Poll function (call periodically, e.g., every 10s)
export async function pollLzStatus(
txHash: string,
srcChainId: number,
dstChainId: number,
onUpdate: (status: LzMessageStatus) => void,
maxPolls: number = 60 // ~10 min at 10s intervals
): Promise<void> {
let polls = 0;
const interval = setInterval(async () => {
polls++;
const status = await fetchLzMessageStatus(txHash, srcChainId, dstChainId);
if (status) {
onUpdate(status);
if (status.status === "delivered" || status.status === "failed") {
clearInterval(interval);
      }
    }
if (polls >= maxPolls) {
clearInterval(interval);
onUpdate({ status: "unknown", timestamp: null, estimatedRemainingMs: null, txHashes: { srcTxHash: "" } });
    }
  }, 10000); // Poll every 10s
// Initial fetch
const initialStatus = await fetchLzMessageStatus(txHash, srcChainId, dstChainId);
if (initialStatus) {
onUpdate(initialStatus);
  }
}
// Poll LayerZero Scan API for full message by tx hash
export async function pollLzMessage(
txHash: string,
srcChainId: number,
onUpdate: (msg: Message | null) => void,
maxPolls: number = 60 // ~5 min at 5s intervals
): Promise<void> {
let polls = 0;
const interval = setInterval(async () => {
polls++;
const msg = await fetchLzMessage(txHash, srcChainId);
onUpdate(msg);
if (msg && ["DELIVERED", "FAILED", "BLOCKED", "PAYLOAD_STORED", "APPLICATION_BURNED", "APPLICATION_SKIPPED", "UNRESOLVABLE_COMMAND", "MALFORMED_COMMAND"].includes(msg.status.name)) {
clearInterval(interval);
    }
if (polls >= maxPolls) {
clearInterval(interval);
onUpdate(null);
    }
  }, 5000); // Poll every 5s
// Initial fetch
const initialMsg = await fetchLzMessage(txHash, srcChainId);
onUpdate(initialMsg);
}
// Fetch full LayerZero message by tx hash
export async function fetchLzMessage(
txHash: string,
srcChainId: number
): Promise<Message | null> {
const network = getLzNetwork(srcChainId);
const baseDomain = network === "testnet" ? 'scan-testnet.layerzero-api.com' : 'scan.layerzero-api.com';
const originalUrl = `https://${baseDomain}/v1/messages/tx/${txHash}`;
const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`;
try {
const response = await fetch(proxyUrl);
if (!response.ok) {
throw new Error(`API error: ${response.status}`);
    }
const data = await response.json();
if (!data || !data.data || data.data.length === 0) {
return null;
    }
return data.data[0];
  } catch (error) {
console.error("Failed to fetch Lz message:", error);
return null;
  }
}