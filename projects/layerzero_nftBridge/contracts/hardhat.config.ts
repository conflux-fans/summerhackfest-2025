import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "@layerzerolabs/toolbox-hardhat";
import * as dotenv from "dotenv";
dotenv.config();
const config: HardhatUserConfig = {
solidity: {
compilers: [
      {
version: "0.8.22",
settings: {
optimizer: {
enabled: true,
runs: 200, // Low runs prioritizes smaller bytecode size over runtime gas efficiency
          },
        },
      },
    ],
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
// baseSepolia: {
// url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
// chainId: 84532,
// eid: 40245,
// accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
//    },
// ethereumSepolia: {
// url: process.env.ETHEREUM_SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com",
// chainId: 11155111,
// eid: 40161,
// accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
//    },
arbitrum: {
url: process.env.ARBITRUM_RPC || "https://arbitrum-one-rpc.publicnode.com",
chainId: 42161,
eid: 30110,
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