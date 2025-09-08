import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

dotenv.config();

const CONFLUX_RPC_URL = process.env.CONFLUX_RPC_URL;
const CONFLUX_PRIVATE_KEY = process.env.CONFLUX_PRIVATE_KEY;

if (!CONFLUX_RPC_URL || !CONFLUX_PRIVATE_KEY) {
  throw new Error("Please set CONFLUX_TESTNET_RPC_URL and CONFLUX_TESTNET_PRIVATE_KEY in your .env file");
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
      url: CONFLUX_RPC_URL, // guaranteed string
      chainId: 71,
      accounts: [CONFLUX_PRIVATE_KEY],
    },
    sepolia: {
      type: "http",
      url: "https://ethereum-sepolia-rpc.publicnode.com", // public Sepolia RPC
      chainId: 11155111,
      accounts: [CONFLUX_PRIVATE_KEY], // replace with your test account private key
    },
  },
};

export default config;
