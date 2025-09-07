require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      viaIR: true,          // Enable IR to fix "stack too deep" errors
      optimizer: {
        enabled: true,      // Enable optimizer
        runs: 200
      }
    }
  },
  defaultNetwork: "conflux",
  networks: {
    hardhat: {},
    conflux: {
      url: "https://evm.confluxrpc.com",
      chainId: 1030,
      accounts: [process.env.PRIVATE_KEY]
    },
  },
};
