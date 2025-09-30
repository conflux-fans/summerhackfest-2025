import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    customize: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
  chainDescriptors: {
    71: {
      name: "Conflux",
      chainType: "l1",
      blockExplorers: {
        etherscan: {
          name: "Conflux Explorer",
          url: "https://evmtestnet.confluxscan.org",
          apiUrl: "https://evmapi-testnet.confluxscan.org",
        },
      },
    },
  },
  verify:{
    etherscan: {
      apiKey: "234234234324234234",
    }
  }
};

export default config;
