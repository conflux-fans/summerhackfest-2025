import { Address } from "viem";

export const CONFLUX_BRIDGE_ADDRESS: Address = process.env.CONFLUX_BRIDGE_ADDRESS as Address || '0xdCe7e8289fe891209Cc6C850d76c7B5B8e401fFa';
export const BASE_BRIDGE_ADDRESS: Address = process.env.BASE_BRIDGE_ADDRESS as Address || '0xB0C9C474AD0dBd3c8B4658F548B51976cDE0F19F';
export const ETH_SEPOLIA_BRIDGE_ADDRESS: Address = process.env.ETH_SEPOLIA_BRIDGE_ADDRESS as Address || '0xc5698b40C2a8b4aa5c8fC18C8AFa9B0C5B80081E';
export const BASE_SEPOLIA_BRIDGE_ADDRESS: Address = process.env.BASE_SEPOLIA_BRIDGE_ADDRESS as Address || '0x16dED18bd0ead69b331B0222110F74b5716627f8';

export const NFT_MANAGER_BASE_SEPOLIA = '0xc7c78593CeE5C99723a13FF416B06503413635B7';
export const LAYERZERO_ENDPOINT = '0x1a44076050125825900e736c501f859c50fE728c';

export const CONFLUX_EID = 30212; // Conflux eSpace Mainnet EID
export const BASE_EID = 30184; // Base Mainnet EID
export const ETH_SEPOLIA_EID = 40161; // Ethereum Sepolia EID
export const BASE_SEPOLIA_EID = 40232; // Base Sepolia EID

export const CONFLUX_CHAIN_ID = 1030; // Conflux eSpace Mainnet
export const BASE_CHAIN_ID = 8453; // Base Mainnet
export const ETH_SEPOLIA_CHAIN_ID = 11155111; // Ethereum Sepolia
export const BASE_SEPOLIA_CHAIN_ID = 84532; // Base Sepolia