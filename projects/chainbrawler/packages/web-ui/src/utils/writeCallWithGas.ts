import type { WriteContractParameters } from "viem";
import type { GasConfig } from "../config/gas";

/**
 * Apply gas configuration to write contract parameters
 * Ensures manual gas settings are applied to write calls
 * Handles both legacy and EIP-1559 transactions
 */
export function applyGasConfigToWriteCall<T extends WriteContractParameters>(
  writeParams: T,
  gasConfig: GasConfig
): T {
  const baseParams = {
    ...writeParams,
    gas: gasConfig.gasLimit,
  };

  // For EIP-1559 transactions (Type 2), use maxFeePerGas and maxPriorityFeePerGas
  if (gasConfig.maxFeePerGas && gasConfig.maxPriorityFeePerGas) {
    return {
      ...baseParams,
      maxFeePerGas: gasConfig.maxFeePerGas,
      maxPriorityFeePerGas: gasConfig.maxPriorityFeePerGas,
      // Don't set gasPrice for EIP-1559 transactions
    } as T;
  }

  // For legacy transactions (Type 0), use gasPrice
  return {
    ...baseParams,
    gasPrice: gasConfig.gasPrice,
  } as T;
}

/**
 * Create a write call with chain-specific gas settings
 * Applies manual gas configuration to prevent gas estimation issues
 */
export function createWriteCallWithGas<T extends WriteContractParameters>(
  writeParams: T,
  gasConfig: GasConfig
): T {
  return applyGasConfigToWriteCall(writeParams, gasConfig);
}

/**
 * Validate write call parameters before execution
 * Ensures all required fields are present and valid
 */
export function validateWriteCall<T extends WriteContractParameters>(
  writeParams: T,
  gasConfig: GasConfig
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!writeParams.address) {
    errors.push("Contract address is required");
  }

  if (!writeParams.abi) {
    errors.push("Contract ABI is required");
  }

  if (!writeParams.functionName) {
    errors.push("Function name is required");
  }

  // Check gas configuration
  if (gasConfig.gasLimit <= 0n) {
    errors.push("Gas limit must be greater than 0");
  }

  if (gasConfig.gasPrice <= 0n) {
    errors.push("Gas price must be greater than 0");
  }

  // For EIP-1559, check maxFeePerGas and maxPriorityFeePerGas
  if (gasConfig.maxFeePerGas && gasConfig.maxPriorityFeePerGas) {
    if (gasConfig.maxFeePerGas <= 0n) {
      errors.push("maxFeePerGas must be greater than 0");
    }
    if (gasConfig.maxPriorityFeePerGas <= 0n) {
      errors.push("maxPriorityFeePerGas must be greater than 0");
    }
    if (gasConfig.maxPriorityFeePerGas > gasConfig.maxFeePerGas) {
      errors.push("maxPriorityFeePerGas cannot be greater than maxFeePerGas");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gas configuration for different contract operations
 * Maps operation types to appropriate gas settings
 */
export const WRITE_OPERATION_GAS = {
  // Character operations
  createCharacter: "createCharacter",
  healCharacter: "healCharacter",
  resurrectCharacter: "resurrectCharacter",

  // Combat operations
  startFight: "startFight",
  continueFight: "continueFight",
  fleeFight: "fleeFight",

  // Pool operations
  claimRewards: "claimRewards",

  // Default fallback
  default: "default",
} as const;

export type WriteOperation = keyof typeof WRITE_OPERATION_GAS;

/**
 * Create a write call with validation and gas configuration
 * Combines validation and gas application for robust write operations
 */
export function createValidatedWriteCall<T extends WriteContractParameters>(
  writeParams: T,
  gasConfig: GasConfig
): { params: T; isValid: boolean; errors: string[] } {
  const validation = validateWriteCall(writeParams, gasConfig);

  if (!validation.isValid) {
    console.error("Write call validation failed:", validation.errors);
    return {
      params: writeParams,
      isValid: false,
      errors: validation.errors,
    };
  }

  const gasConfiguredParams = createWriteCallWithGas(writeParams, gasConfig);

  return {
    params: gasConfiguredParams,
    isValid: true,
    errors: [],
  };
}
