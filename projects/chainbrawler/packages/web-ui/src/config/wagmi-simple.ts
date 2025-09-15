import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { arbitrum, mainnet, polygon } from "wagmi/chains";

// Define Conflux Espace Testnet (chain ID 71)
const confluxEspaceTestnet = defineChain({
  id: 71,
  name: "Conflux Espace Testnet",
  nativeCurrency: {
    name: "Conflux",
    symbol: "CFX",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://evmtestnet.confluxrpc.com"] },
    public: { http: ["https://evmtestnet.confluxrpc.com"] },
  },
  blockExplorers: {
    default: { name: "ConfluxScan", url: "https://evmtestnet.confluxscan.org" },
  },
});

// Simple wagmi config without WalletConnect for development
export const config = createConfig({
  chains: [confluxEspaceTestnet, mainnet, polygon, arbitrum],
  transports: {
    [confluxEspaceTestnet.id]: http("https://evmtestnet.confluxrpc.com"),
    [mainnet.id]: http("https://eth-mainnet.g.alchemy.com/v2/demo"),
    [polygon.id]: http("https://polygon-mainnet.g.alchemy.com/v2/demo"),
    [arbitrum.id]: http("https://arb-mainnet.g.alchemy.com/v2/demo"),
  },
});

// Export the chains for use in other parts of the app
export const supportedChains = [confluxEspaceTestnet, mainnet, polygon, arbitrum];
