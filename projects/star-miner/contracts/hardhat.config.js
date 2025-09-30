require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const CONFLUXSCAN_API_KEY = process.env.CONFLUXSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    confluxTestnet: {
      url: "https://evmtestnet.confluxrpc.com",
      accounts: [PRIVATE_KEY],
      chainId: 71,
      gasPrice: 20000000000, // 20 gwei
      gas: 8000000
    },
    confluxMainnet: {
      url: "https://evm.confluxrpc.com",
      accounts: [PRIVATE_KEY],
      chainId: 1030,
      gasPrice: 20000000000,
      gas: 8000000
    }
  },
  etherscan: {
    apiKey: {
      confluxTestnet: CONFLUXSCAN_API_KEY,
      confluxMainnet: CONFLUXSCAN_API_KEY
    },
    customChains: [
      {
        network: "confluxTestnet",
        chainId: 71,
        urls: {
          apiURL: "https://evmapi-testnet.confluxscan.io/api",
          browserURL: "https://evmtestnet.confluxscan.io"
        }
      },
      {
        network: "confluxMainnet",
        chainId: 1030,
        urls: {
          apiURL: "https://evmapi.confluxscan.io/api",
          browserURL: "https://evm.confluxscan.io"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};