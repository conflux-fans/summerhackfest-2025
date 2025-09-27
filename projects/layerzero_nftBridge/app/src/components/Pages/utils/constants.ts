// utils/constants.ts
import { Address } from "viem";
export const CONFLUX_BRIDGE_ADDRESS: Address = process.env.CONFLUX_BRIDGE_ADDRESS as Address || '0x8078EFb3CEe419Abde856B6F5f470CC9d8971319';
export const BASE_BRIDGE_ADDRESS: Address = process.env.BASE_BRIDGE_ADDRESS as Address || '0xd97deC9D62011e63AD3Bd27B51E33c8df3Ac44Cf';
// export const ETH_SEPOLIA_BRIDGE_ADDRESS: Address = process.env.ETH_SEPOLIA_BRIDGE_ADDRESS as Address || '0x54f1A8992AE2248199186D062DcD466b4B82217b';
// export const BASE_SEPOLIA_BRIDGE_ADDRESS: Address = process.env.BASE_SEPOLIA_BRIDGE_ADDRESS as Address || '0x3aA8Fdaf86CDA7c9CBf83B72d2a2bfDD01e7621D';
// export const NFT_MANAGER_BASE_SEPOLIA = '0xD4A9409915520b7D1cB456Ec7A0f194C493F93c8';
export const NFT_MANAGER_CONFLUX = '0x47fC91Df5266456BAc2de008A4A4DB7Ae532c5C8';
export const ARBITRUM_BRIDGE_ADDRESS: Address = process.env.ARBITRUM_BRIDGE_ADDRESS as Address || '0x16dED18bd0ead69b331B0222110F74b5716627f8';
export const LAYERZERO_ENDPOINT = '0x1a44076050125825900e736c501f859c50fE728c';
export const CONFLUX_EID = 30212; // Conflux eSpace Mainnet EID
export const BASE_EID = 30184; // Base Mainnet EID
// export const ETH_SEPOLIA_EID = 40161; // Ethereum Sepolia EID
// export const BASE_SEPOLIA_EID = 40245; // Base Sepolia EID
export const ARBITRUM_EID = 30110; // Arbitrum Mainnet EID
export const CONFLUX_CHAIN_ID = 1030; // Conflux eSpace Mainnet
export const BASE_CHAIN_ID = 8453; // Base Mainnet
// export const ETH_SEPOLIA_CHAIN_ID = 11155111; // Ethereum Sepolia
// export const BASE_SEPOLIA_CHAIN_ID = 84532; // Base Sepolia
export const ARBITRUM_CHAIN_ID = 42161; // Arbitrum Mainnet
export const CHAIN_TO_EID: Record<number, number> = {
// [ETH_SEPOLIA_CHAIN_ID]: 40161,
// [BASE_SEPOLIA_CHAIN_ID]: 40245,
[CONFLUX_CHAIN_ID]: 30212,
[BASE_CHAIN_ID]: 30184,
[ARBITRUM_CHAIN_ID]: 30110,
};
export const EID_TO_CHAIN: Record<number, number> = Object.fromEntries(
Object.entries(CHAIN_TO_EID).map(([k, v]) => [v, parseInt(k as string)])
);
export const EID_TO_NAME: Record<number, string> = {
// 40161: "Ethereum Sepolia",
// 40245: "Base Sepolia",
30212: "Conflux eSpace",
30184: "Base",
30110: "Arbitrum",
};