import { Address } from "viem";

export const CONFLUX_ORIGIN_ADDRESS: Address = process.env.CONFLUX_ORIGIN_ADDRESS as Address || '0x1bFa18Be18B23e405bFB85009d5D58704190ac0e';
export const BASE_BRIDGE_ADDRESS: Address = process.env.BASE_BRIDGE_ADDRESS as Address || '0x25f514f506D28A252F16C86e4A904A1FB84262D6';
export const IMAGE_MINT_NFT_ADDRESS = '0xD9Ed0B00Aa868Cd2E7aa4198C7D792D3aF9ec61d';
export const LAYERZERO_ENDPOINT = '0x1a44076050125825900e736c501f859c50fE728c';
export const CONFLUX_EID = 30212; // Conflux eSpace Mainnet EID
export const BASE_EID = 30184; // Base Mainnet EID
export const CONFLUX_CHAIN_ID = 1030; // Conflux eSpace Mainnet
export const BASE_CHAIN_ID = 8453; // Base Mainnet