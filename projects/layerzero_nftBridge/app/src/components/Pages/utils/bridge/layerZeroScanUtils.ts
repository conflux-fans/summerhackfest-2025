// utils/layerZeroScanUtils.ts
import { PublicClient, Hash, Address } from "viem";
import { BRIDGE_ABI } from "../abi/bridgeAbi";
import {
  CONFLUX_CHAIN_ID,
  BASE_CHAIN_ID,
  ETH_SEPOLIA_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_ID,
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
const getLzNetwork = (chainId: number): "testnet" | "mainnet" => {
  // Assuming testnet for Sepolia/Base Sepolia; adjust for mainnet if needed
  if ([ETH_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID].includes(chainId)) {
    return "testnet";
  }
  // For Conflux/Base mainnet (if live)
  return "mainnet";
};

// Parse transaction receipt logs for OAppSend event to extract messageId (GUID)
export async function extractLzMessageId(
  publicClient: PublicClient,
  txHash: Hash,
  chainId: number
): Promise<`0x${string}` | null> {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    if (!receipt || !receipt.logs) return null;

    // ABI fragment for OAppSend event (from OAppSender)
    const eventAbi = [
      {
        anonymous: false,
        inputs: [
          { indexed: true, name: "_dstEid", type: "uint32" },
          { indexed: true, name: "_messageId", type: "bytes32" },
          { indexed: false, name: "_message", type: "bytes" },
          { indexed: false, name: "_refundAddress", type: "address" },
        ],
        name: "OAppSend",
        type: "event",
      },
    ] as const;

    for (const log of receipt.logs) {
      try {
        const decoded = publicClient.decodeEventLog({
          abi: eventAbi,
          eventName: "OAppSend",
          data: log.data,
          topics: log.topics,
        });
        if (decoded && "messageId" in decoded.args) {
          return decoded.args.messageId as `0x${string}`;
        }
      } catch (decodeErr) {
        // Skip non-matching logs
        continue;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to extract Lz messageId:", error);
    return null;
  }
}

// Poll LayerZero Scan API for message status
export async function fetchLzMessageStatus(
  messageId: `0x${string}`,
  srcChainId: number,
  dstChainId: number
): Promise<LzMessageStatus | null> {
  try {
    const network = getLzNetwork(srcChainId); // Use src network for query
    const apiUrl = `https://api.layerzeroscan.com/v1/${network}/message/${messageId}?includeFullTx=true`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.message) {
      return null;
    }

    const msg = data.message;
    let status: LzMessageStatus["status"] = "unknown";
    let timestamp: number | null = null;
    let dstTxHash: string | undefined;

    // Map LayerZero statuses to our enum
    if (msg.dstDeliveryStatus === "delivered") {
      status = "delivered";
      timestamp = msg.dstDeliveryTimestamp ? parseInt(msg.dstDeliveryTimestamp) * 1000 : null; // Convert to ms
      dstTxHash = msg.dstTxHash;
    } else if (msg.dstDeliveryStatus === "pending") {
      status = "pending";
    } else if (msg.dstDeliveryStatus === "failed") {
      status = "failed";
    }

    // Estimate remaining time (rough averages; customize based on chain pair)
    let estimatedRemainingMs: number | null = null;
    if (status === "pending") {
      const now = Date.now();
      const avgDeliveryMs = getAverageDeliveryTime(srcChainId, dstChainId); // Define below
      const elapsedMs = now - (msg.srcSentTimestamp ? parseInt(msg.srcSentTimestamp) * 1000 : now);
      estimatedRemainingMs = Math.max(0, avgDeliveryMs - elapsedMs);
    }

    return {
      status,
      timestamp,
      estimatedRemainingMs,
      txHashes: {
        srcTxHash: msg.srcTxHash || "",
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
  if (srcChainId === ETH_SEPOLIA_CHAIN_ID && dstChainId === BASE_SEPOLIA_CHAIN_ID) {
    return 180000; // 3 min avg
  }
  if (srcChainId === BASE_SEPOLIA_CHAIN_ID && dstChainId === ETH_SEPOLIA_CHAIN_ID) {
    return 180000;
  }
  // Conflux to Base (mainnet) ~5-10 min
  if (srcChainId === CONFLUX_CHAIN_ID && dstChainId === BASE_CHAIN_ID) {
    return 420000; // 7 min avg
  }
  if (srcChainId === BASE_CHAIN_ID && dstChainId === CONFLUX_CHAIN_ID) {
    return 420000;
  }
  return 300000; // Default 5 min
};

// Poll function (call periodically, e.g., every 10s)
export async function pollLzStatus(
  messageId: `0x${string}`,
  srcChainId: number,
  dstChainId: number,
  onUpdate: (status: LzMessageStatus) => void,
  maxPolls: number = 60 // ~10 min at 10s intervals
): Promise<void> {
  let polls = 0;
  const interval = setInterval(async () => {
    polls++;
    const status = await fetchLzMessageStatus(messageId, srcChainId, dstChainId);
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
  const initialStatus = await fetchLzMessageStatus(messageId, srcChainId, dstChainId);
  if (initialStatus) {
    onUpdate(initialStatus);
  }
}