import { getDefaultConfig } from "connectkit";
import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { arbitrum, mainnet, polygon } from "wagmi/chains";

// WalletConnect Project ID
const walletConnectProjectId =
  (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id";

// Define ChainBrawler supported chains
export const chainBrawlerLocal = defineChain({
  id: 2030,
  name: "ChainBrawler Local",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "CFX",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: { name: "Local", url: "http://localhost:8545" },
  },
});

export const confluxEspaceTestnet = defineChain({
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

export const confluxEspace = defineChain({
  id: 1030,
  name: "Conflux Espace",
  nativeCurrency: {
    name: "Conflux",
    symbol: "CFX",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://evm.confluxrpc.com"] },
    public: { http: ["https://evm.confluxrpc.com"] },
  },
  blockExplorers: {
    default: { name: "ConfluxScan", url: "https://evm.confluxscan.org" },
  },
});

// Prioritize ChainBrawler chains
export const supportedChains = [
  chainBrawlerLocal,
  confluxEspaceTestnet,
  confluxEspace,
  mainnet,
  polygon,
  arbitrum,
] as const;

export const config = createConfig(
  getDefaultConfig({
    chains: supportedChains,
    transports: {
      [chainBrawlerLocal.id]: http("http://127.0.0.1:8545"),
      [confluxEspaceTestnet.id]: http("https://evmtestnet.confluxrpc.com"),
      [confluxEspace.id]: http("https://evm.confluxrpc.com"),
      [mainnet.id]: http("https://eth-mainnet.g.alchemy.com/v2/demo"),
      [polygon.id]: http("https://polygon-mainnet.g.alchemy.com/v2/demo"),
      [arbitrum.id]: http("https://arb-mainnet.g.alchemy.com/v2/demo"),
    },
    walletConnectProjectId,
    appName: "ChainBrawler",
    appDescription: "The Ultimate Blockchain RPG Experience",
    appUrl: "http://localhost:3000",
    appIcon: "http://localhost:3000/favicon.ico",
  })
);
