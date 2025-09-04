require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
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
