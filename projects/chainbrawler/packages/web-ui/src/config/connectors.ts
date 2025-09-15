/**
 * Conservative Connector Configuration
 *
 * Limits wallet providers to MetaMask only for security and simplicity
 */

import { createConfig, http } from "wagmi";
import { arbitrum, mainnet, polygon } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";
import { confluxESpace, confluxESpaceLocal, confluxESpaceTestnet } from "./chains";

/**
 * Conservative connector configuration
 * Only MetaMask connector for security and simplicity
 */
export const conservativeConnectors = [
  metaMask({
    // Conservative settings for MetaMask
    dappMetadata: {
      name: "ChainBrawler",
      url: "https://chainbrawler-web-ui.vercel.app",
      iconUrl: "https://chainbrawler-web-ui.vercel.app/logo.png",
    },
  }),
];

/**
 * Conservative wagmi configuration
 * Limited to MetaMask connector with manual gas settings
 */
export const conservativeConfig = createConfig({
  chains: [confluxESpaceLocal, confluxESpaceTestnet, confluxESpace, mainnet, polygon, arbitrum],
  connectors: conservativeConnectors,
  transports: {
    [confluxESpaceLocal.id]: http("http://127.0.0.1:8545"),
    [confluxESpaceTestnet.id]: http("https://evmtestnet.confluxrpc.com"),
    [confluxESpace.id]: http("https://evm.confluxrpc.com"),
    [mainnet.id]: http("https://eth-mainnet.g.alchemy.com/v2/demo"),
    [polygon.id]: http("https://polygon-mainnet.g.alchemy.com/v2/demo"),
    [arbitrum.id]: http("https://arb-mainnet.g.alchemy.com/v2/demo"),
  },
  // Conservative polling settings
  pollingInterval: 4000, // 4 seconds
});
