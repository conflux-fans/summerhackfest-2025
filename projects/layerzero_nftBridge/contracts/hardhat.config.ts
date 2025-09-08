import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error("Please set PRIVATE_KEY .env");
}

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: { version: "0.8.28" },
      production: {
        version: "0.8.28",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    },
  },
  networks: {
    conflux: {
      type: "http",
      chainType: "l1",
      url: "https://evm.confluxrpc.com", // guaranteed string
      chainId: 1030,
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      type: "http",
      url: "https://ethereum-sepolia-rpc.publicnode.com", // public Sepolia RPC
      chainId: 11155111,
      accounts: [PRIVATE_KEY], // replace with your test account private key
    },
    base: {
      type: "http",
      url: "https://base-rpc.publicnode.com", // public Sepolia RPC
      chainId: 8453,
      accounts: [PRIVATE_KEY], // replace with your test account private key
    },
  },
};

export default config;
