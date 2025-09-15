import { getDefaultConfig } from "connectkit";
import { confluxESpace, confluxESpaceTestnet } from "viem/chains";
import { createConfig, fallback, http } from "wagmi";
import { arbitrum, mainnet, polygon } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";
import { confluxESpaceLocal } from "./chains";

// Environment variables for API keys
const walletConnectProjectId =
  (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID || "b4e498515364475312f3eea4265b2180";

// RPC API Keys
const alchemyApiKey = (import.meta as any).env?.VITE_ALCHEMY_API_KEY;
const infuraApiKey = (import.meta as any).env?.VITE_INFURA_API_KEY;
const confluxApiKey = (import.meta as any).env?.VITE_CONFLUX_API_KEY;

// RPC URL builders
const getAlchemyUrl = (chain: string) =>
  alchemyApiKey
    ? `https://${chain}.g.alchemy.com/v2/${alchemyApiKey}`
    : `https://${chain}.g.alchemy.com/v2/demo`;
const getInfuraUrl = (chain: string) =>
  infuraApiKey
    ? `https://${chain}.infura.io/v3/${infuraApiKey}`
    : `https://${chain}.infura.io/v3/demo`;
const getConfluxUrl = (isTestnet: boolean) => {
  if (confluxApiKey) {
    // Use CFXRPC Pro-Service format
    return isTestnet
      ? `https://evmtestnet.confluxrpc.com/v1/${confluxApiKey}`
      : `https://evm.confluxrpc.com/v1/${confluxApiKey}`;
  }
  return isTestnet ? "https://evmtestnet.confluxrpc.com" : "https://evm.confluxrpc.com";
};

// Log RPC configuration for debugging
console.log("🔗 RPC Configuration:", {
  alchemyApiKey: alchemyApiKey ? "✅ Configured" : "❌ Not configured (using demo)",
  infuraApiKey: infuraApiKey ? "✅ Configured" : "❌ Not configured (using demo)",
  confluxApiKey: confluxApiKey ? "✅ Configured" : "❌ Not configured (using public)",
  walletConnectProjectId: walletConnectProjectId ? "✅ Configured" : "❌ Not configured",
});

console.log("🔍 Raw Environment Values:", {
  confluxApiKey: `"${confluxApiKey}"`,
  alchemyApiKey: `"${alchemyApiKey}"`,
  infuraApiKey: `"${infuraApiKey}"`,
  walletConnectProjectId: `"${walletConnectProjectId}"`,
});

console.log("🌐 Conflux RPC Endpoints:", {
  testnet: confluxApiKey ? getConfluxUrl(true) : "https://evmtestnet.confluxrpc.com (public)",
  mainnet: confluxApiKey ? getConfluxUrl(false) : "https://evm.confluxrpc.com (public)",
});

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains - prioritize Conflux networks with local development
    chains: [confluxESpaceLocal, confluxESpaceTestnet, confluxESpace, mainnet, polygon, arbitrum],
    transports: {
      // Conflux Local - single RPC endpoint for development
      [confluxESpaceLocal.id]: http("http://127.0.0.1:8545"),

      // Conflux networks - multiple RPC providers with fallbacks
      [confluxESpaceTestnet.id]: fallback([
        // Primary: Your Conflux Pro API (if available)
        ...(confluxApiKey ? [http(getConfluxUrl(true))] : []),
        // Fallback 1: Public Conflux RPC
        http("https://evmtestnet.confluxrpc.com"),
        // Fallback 2: Alternative Conflux RPC
        http("https://evmtestnet.confluxrpc.com"),
        // Fallback 3: Direct Conflux node
        http("https://evmtestnet.confluxrpc.com"),
      ]),
      [confluxESpace.id]: fallback([
        // Primary: Your Conflux Pro API (if available)
        ...(confluxApiKey ? [http(getConfluxUrl(false))] : []),
        // Fallback 1: Public Conflux RPC
        http("https://evm.confluxrpc.com"),
        // Fallback 2: Alternative Conflux RPC
        http("https://evm.confluxrpc.com"),
        // Fallback 3: Direct Conflux node
        http("https://evm.confluxrpc.com"),
      ]),

      // Ethereum mainnet - multiple RPC providers with fallback
      [mainnet.id]: fallback([
        ...(alchemyApiKey ? [http(getAlchemyUrl("eth-mainnet"))] : []),
        ...(infuraApiKey ? [http(getInfuraUrl("mainnet"))] : []),
        http("https://eth-mainnet.g.alchemy.com/v2/demo"),
        http("https://mainnet.infura.io/v3/demo"),
        http("https://rpc.ankr.com/eth"),
        http("https://ethereum.publicnode.com"),
      ]),

      // Polygon - multiple RPC providers with fallback
      [polygon.id]: fallback([
        ...(alchemyApiKey ? [http(getAlchemyUrl("polygon-mainnet"))] : []),
        ...(infuraApiKey ? [http(getInfuraUrl("polygon-mainnet"))] : []),
        http("https://polygon-mainnet.g.alchemy.com/v2/demo"),
        http("https://polygon-mainnet.infura.io/v3/demo"),
        http("https://rpc.ankr.com/polygon"),
        http("https://polygon.publicnode.com"),
      ]),

      // Arbitrum - multiple RPC providers with fallback
      [arbitrum.id]: fallback([
        ...(alchemyApiKey ? [http(getAlchemyUrl("arb-mainnet"))] : []),
        ...(infuraApiKey ? [http(getInfuraUrl("arbitrum-mainnet"))] : []),
        http("https://arb-mainnet.g.alchemy.com/v2/demo"),
        http("https://arbitrum-mainnet.infura.io/v3/demo"),
        http("https://rpc.ankr.com/arbitrum"),
        http("https://arbitrum.publicnode.com"),
      ]),
    },
    // Required API Keys
    walletConnectProjectId,
    // Required App Info
    appName: "ChainBrawler",
    appDescription: "The Ultimate Blockchain RPG Experience",
    appUrl: "https://chainbrawler-web-ui.vercel.app",
    appIcon: "https://chainbrawler-web-ui.vercel.app/logo.png",
    // Conservative connector configuration - limit to MetaMask only
    connectors: [
      metaMask({
        dappMetadata: {
          name: "ChainBrawler",
          url: "https://chainbrawler-web-ui.vercel.app",
          iconUrl: "https://chainbrawler-web-ui.vercel.app/logo.png",
        },
      }),
    ],
  })
);

// Export the chains for use in other parts of the app
export const supportedChains = [
  confluxESpaceLocal,
  confluxESpaceTestnet,
  confluxESpace,
  mainnet,
  polygon,
  arbitrum,
];

// Export individual chains for specific use cases
export { confluxESpaceLocal };
