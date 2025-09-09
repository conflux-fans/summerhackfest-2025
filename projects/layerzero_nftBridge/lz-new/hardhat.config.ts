import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "@layerzerolabs/toolbox-hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
  },
  networks: {
    conflux: {
      url: process.env.CONFLUX_RPC || "https://evm.confluxrpc.com",
      chainId: 1030,
      eid: 30212,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    base: {
      url: process.env.BASE_RPC || "https://mainnet.base.org",
      chainId: 8453,
      eid: 30184,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;