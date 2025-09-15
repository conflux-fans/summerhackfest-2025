import { defineChain } from "viem";
import { confluxESpace, confluxESpaceTestnet } from "viem/chains";

/**
 * Conflux eSpace Local Development Chain
 *
 * This is the local Conflux node started by the utils package
 * Chain ID: 2030
 * RPC: http://127.0.0.1:8545
 * WebSocket: ws://127.0.0.1:8546
 */
export const confluxESpaceLocal = defineChain({
  id: 2030,
  name: "Conflux eSpace Local",
  nativeCurrency: {
    decimals: 18,
    name: "Conflux",
    symbol: "CFX",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8546"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8546"],
    },
  },
  blockExplorers: {
    default: {
      name: "Conflux Local Explorer",
      url: "http://127.0.0.1:8545",
    },
  },
  testnet: true,
  // Conservative gas settings for local development
  gas: {
    price: {
      slow: 1000000000n, // 1 Gwei
      standard: 2000000000n, // 2 Gwei
      fast: 5000000000n, // 5 Gwei
    },
  },
});

// Re-export the standard Conflux chains for convenience
export { confluxESpaceTestnet, confluxESpace };
