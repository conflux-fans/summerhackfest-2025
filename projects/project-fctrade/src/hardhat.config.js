require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    confluxTestnet: {
      url: "https://evmtestnet.confluxrpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 71,
    },
    confluxMainnet: {
      url: "https://evm.confluxrpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1030,
    },
  },
  etherscan: {
    apiKey: {
      confluxTestnet: "not-needed",
      confluxMainnet: "not-needed",
    },
    customChains: [
      {
        network: "confluxTestnet",
        chainId: 71,
        urls: {
          apiURL: "https://evmtestnet.confluxscan.io/api",
          browserURL: "https://evmtestnet.confluxscan.io",
        },
      },
      {
        network: "confluxMainnet",
        chainId: 1030,
        urls: {
          apiURL: "https://evm.confluxscan.org/api",
          browserURL: "https://evm.confluxscan.org",
        },
      },
    ],
  },
}; 