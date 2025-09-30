import { useMemo } from "react";
import { useAccount } from "wagmi";
import { confluxESpaceLocal } from "../config/chains";
import {
  formatGasConfig,
  type GasConfig,
  getOptimizedGasConfig,
  supportsEIP1559,
  validateGasConfig,
} from "../config/gas";

/**
 * Hook for managing gas configuration
 * Automatically selects appropriate gas settings based on chain and operation
 */
export function useGasConfig(operation: string) {
  const { chain } = useAccount();

  const gasConfig = useMemo((): GasConfig => {
    if (!chain?.id) {
      console.warn("No chain ID available, using fallback gas config");
      return {
        gasPrice: 2000000000n, // 2 Gwei fallback
        gasLimit: 300000n, // 300k gas fallback
      };
    }

    // Get optimized gas config for the current chain and operation
    const config = getOptimizedGasConfig(chain.id, operation);

    // Validate the configuration
    if (!validateGasConfig(config, operation)) {
      console.error(`Invalid gas config for ${operation} on chain ${chain.id}`);
    }

    return config;
  }, [chain?.id, operation]);

  const isLocalChain = chain?.id === confluxESpaceLocal.id;
  const supportsEIP1559Transactions = chain?.id ? supportsEIP1559(chain.id) : false;

  return {
    gasConfig,
    isLocalChain,
    supportsEIP1559: supportsEIP1559Transactions,
    chainId: chain?.id,
    chainName: chain?.name,

    // Helper functions
    formatGasPrice: () => `${Number(gasConfig.gasPrice) / 1e9} Gwei`,
    formatGasLimit: () => `${Number(gasConfig.gasLimit) / 1000}k gas`,
    formatGasConfig: () => formatGasConfig(gasConfig),
  };
}

/**
 * Hook for getting gas configuration for write operations
 * Provides manual gas settings for contract interactions
 */
export function useWriteGasConfig(operation: string) {
  const {
    gasConfig,
    isLocalChain,
    supportsEIP1559,
    chainId,
    chainName,
    formatGasPrice,
    formatGasLimit,
    formatGasConfig: formatConfig,
  } = useGasConfig(operation);

  return {
    // Gas settings for write operations
    gasPrice: gasConfig.gasPrice,
    gasLimit: gasConfig.gasLimit,
    maxFeePerGas: gasConfig.maxFeePerGas,
    maxPriorityFeePerGas: gasConfig.maxPriorityFeePerGas,

    // Chain information
    isLocalChain,
    supportsEIP1559,
    chainId,
    chainName,

    // Display helpers
    gasPriceDisplay: formatGasPrice(),
    gasLimitDisplay: formatGasLimit(),
    gasConfigDisplay: formatConfig(),

    // Raw config for advanced usage
    rawConfig: gasConfig,

    // Validation
    isValid: validateGasConfig(gasConfig, operation),
  };
}

/**
 * Hook for getting gas configuration for specific operations
 * Provides type-safe operation names
 */
export function useOperationGasConfig(
  operation:
    | "createCharacter"
    | "healCharacter"
    | "resurrectCharacter"
    | "startFight"
    | "continueFight"
    | "fleeFight"
    | "claimRewards"
) {
  return useWriteGasConfig(operation);
}
