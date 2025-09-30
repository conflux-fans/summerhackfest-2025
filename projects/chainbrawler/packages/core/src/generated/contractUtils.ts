// Custom contract utilities and interfaces
// This file contains custom contract creation functions and utilities

import { CONTRACT_ADDRESSES, getContractAddresses } from "./contractAddresses";
import { ERROR_CODES, extractErrorCode, getErrorMessage, isRetryableError } from "./errorCodes";

// Contract ABI types (simplified for now)
export interface ChainBrawlerABI {
  address: `0x${string}`;
  abi: any[];
  errorCodes: typeof ERROR_CODES;
}

export interface LeaderboardTreasuryABI {
  address: `0x${string}`;
  abi: any[];
  errorCodes: typeof ERROR_CODES;
}

export interface LeaderboardManagerABI {
  address: `0x${string}`;
  abi: any[];
  errorCodes: typeof ERROR_CODES;
}

// Contract creation functions
export function createChainBrawlerContract(chainId: number): ChainBrawlerABI {
  const addresses = getContractAddresses(chainId);
  return {
    address: addresses.chainBrawler,
    abi: [], // Will be populated by Wagmi
    errorCodes: ERROR_CODES,
  };
}

export function createLeaderboardTreasuryContract(chainId: number): LeaderboardTreasuryABI {
  const addresses = getContractAddresses(chainId);
  return {
    address: addresses.leaderboardTreasury,
    abi: [], // Will be populated by Wagmi
    errorCodes: ERROR_CODES,
  };
}

export function createLeaderboardManagerContract(chainId: number): LeaderboardManagerABI {
  const addresses = getContractAddresses(chainId);
  return {
    address: addresses.leaderboardManager,
    abi: [], // Will be populated by Wagmi
    errorCodes: ERROR_CODES,
  };
}

// Re-export for convenience
export { CONTRACT_ADDRESSES, getContractAddresses } from "./contractAddresses";
export { ERROR_CODES, extractErrorCode, getErrorMessage, isRetryableError } from "./errorCodes";
