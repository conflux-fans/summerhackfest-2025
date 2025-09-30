require("@hardhat/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    conflux: {
      url: process.env.CONFLUX_RPC_URL || "https://evm.confluxrpc.com",
      accounts: process.env.CONFLUX_PRIVATE_KEY ? [process.env.CONFLUX_PRIVATE_KEY] : [],
      chainId: 1030,
      gasPrice: 1000000000, // 1 Gwei
    },
    confluxTestnet: {
      url: "https://evmtestnet.confluxrpc.com",
      accounts: process.env.CONFLUX_PRIVATE_KEY ? [process.env.CONFLUX_PRIVATE_KEY] : [],
      chainId: 71,
      gasPrice: 1000000000, // 1 Gwei
    },
  },
  etherscan: {
    apiKey: {
      conflux: "your-confluxscan-api-key-here",
    },
  },
  paths: {
    sources: "./",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};