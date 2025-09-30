/**
 * Gas Configuration for ChainBrawler
 *
 * Chain-specific gas settings for different operations
 * Manual gas configuration for write calls with chain ID awareness
 */

export interface GasConfig {
  gasPrice: bigint;
  gasLimit: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export interface ChainGasConfig {
  [chainId: number]: {
    [operation: string]: GasConfig;
  };
}

/**
 * Chain-specific gas configurations
 * Each chain has its own gas parameters optimized for that network
 */
export const CHAIN_GAS_CONFIGS: ChainGasConfig = {
  // Conflux Local (Chain ID: 2030) - Development network
  2030: {
    createCharacter: {
      gasPrice: 1000000000n, // 1 Gwei - Low for local development
      gasLimit: 500000n, // 500k gas
    },
    healCharacter: {
      gasPrice: 1000000000n, // 1 Gwei
      gasLimit: 200000n, // 200k gas
    },
    resurrectCharacter: {
      gasPrice: 1000000000n, // 1 Gwei
      gasLimit: 300000n, // 300k gas
    },
    startFight: {
      gasPrice: 1000000000n, // 1 Gwei
      gasLimit: 400000n, // 400k gas
    },
    continueFight: {
      gasPrice: 1000000000n, // 1 Gwei
      gasLimit: 300000n, // 300k gas
    },
    fleeFight: {
      gasPrice: 1000000000n, // 1 Gwei
      gasLimit: 200000n, // 200k gas
    },
    claimRewards: {
      gasPrice: 1000000000n, // 1 Gwei
      gasLimit: 250000n, // 250k gas
    },
    default: {
      gasPrice: 1000000000n, // 1 Gwei
      gasLimit: 300000n, // 300k gas
    },
  },

  // Conflux eSpace Testnet (Chain ID: 71) - Test network
  71: {
    createCharacter: {
      gasPrice: 2000000000n, // 2 Gwei - Moderate for testnet
      gasLimit: 500000n, // 500k gas
    },
    healCharacter: {
      gasPrice: 2000000000n, // 2 Gwei
      gasLimit: 200000n, // 200k gas
    },
    resurrectCharacter: {
      gasPrice: 2000000000n, // 2 Gwei
      gasLimit: 300000n, // 300k gas
    },
    startFight: {
      gasPrice: 2000000000n, // 2 Gwei
      gasLimit: 400000n, // 400k gas
    },
    continueFight: {
      gasPrice: 2000000000n, // 2 Gwei
      gasLimit: 300000n, // 300k gas
    },
    fleeFight: {
      gasPrice: 2000000000n, // 2 Gwei
      gasLimit: 200000n, // 200k gas
    },
    claimRewards: {
      gasPrice: 2000000000n, // 2 Gwei
      gasLimit: 250000n, // 250k gas
    },
    default: {
      gasPrice: 2000000000n, // 2 Gwei
      gasLimit: 300000n, // 300k gas
    },
  },

  // Conflux eSpace Mainnet (Chain ID: 1030) - Production network
  1030: {
    createCharacter: {
      gasPrice: 5000000000n, // 5 Gwei - Higher for mainnet reliability
      gasLimit: 500000n, // 500k gas
    },
    healCharacter: {
      gasPrice: 5000000000n, // 5 Gwei
      gasLimit: 200000n, // 200k gas
    },
    resurrectCharacter: {
      gasPrice: 5000000000n, // 5 Gwei
      gasLimit: 300000n, // 300k gas
    },
    startFight: {
      gasPrice: 5000000000n, // 5 Gwei
      gasLimit: 400000n, // 400k gas
    },
    continueFight: {
      gasPrice: 5000000000n, // 5 Gwei
      gasLimit: 300000n, // 300k gas
    },
    fleeFight: {
      gasPrice: 5000000000n, // 5 Gwei
      gasLimit: 200000n, // 200k gas
    },
    claimRewards: {
      gasPrice: 5000000000n, // 5 Gwei
      gasLimit: 250000n, // 250k gas
    },
    default: {
      gasPrice: 5000000000n, // 5 Gwei
      gasLimit: 300000n, // 300k gas
    },
  },

  // Ethereum Mainnet (Chain ID: 1) - EIP-1559 support
  1: {
    createCharacter: {
      gasPrice: 20000000000n, // 20 Gwei
      gasLimit: 500000n, // 500k gas
      maxFeePerGas: 30000000000n, // 30 Gwei
      maxPriorityFeePerGas: 2000000000n, // 2 Gwei
    },
    healCharacter: {
      gasPrice: 20000000000n, // 20 Gwei
      gasLimit: 200000n, // 200k gas
      maxFeePerGas: 30000000000n, // 30 Gwei
      maxPriorityFeePerGas: 2000000000n, // 2 Gwei
    },
    resurrectCharacter: {
      gasPrice: 20000000000n, // 20 Gwei
      gasLimit: 300000n, // 300k gas
      maxFeePerGas: 30000000000n, // 30 Gwei
      maxPriorityFeePerGas: 2000000000n, // 2 Gwei
    },
    startFight: {
      gasPrice: 20000000000n, // 20 Gwei
      gasLimit: 400000n, // 400k gas
      maxFeePerGas: 30000000000n, // 30 Gwei
      maxPriorityFeePerGas: 2000000000n, // 2 Gwei
    },
    continueFight: {
      gasPrice: 20000000000n, // 20 Gwei
      gasLimit: 300000n, // 300k gas
      maxFeePerGas: 30000000000n, // 30 Gwei
      maxPriorityFeePerGas: 2000000000n, // 2 Gwei
    },
    fleeFight: {
      gasPrice: 20000000000n, // 20 Gwei
      gasLimit: 200000n, // 200k gas
      maxFeePerGas: 30000000000n, // 30 Gwei
      maxPriorityFeePerGas: 2000000000n, // 2 Gwei
    },
    claimRewards: {
      gasPrice: 20000000000n, // 20 Gwei
      gasLimit: 250000n, // 250k gas
      maxFeePerGas: 30000000000n, // 30 Gwei
      maxPriorityFeePerGas: 2000000000n, // 2 Gwei
    },
    default: {
      gasPrice: 20000000000n, // 20 Gwei
      gasLimit: 300000n, // 300k gas
      maxFeePerGas: 30000000000n, // 30 Gwei
      maxPriorityFeePerGas: 2000000000n, // 2 Gwei
    },
  },
};

/**
 * Get gas configuration for a specific operation and chain ID
 * This is the main function that should be used throughout the app
 */
export function getGasConfig(chainId: number, operation: string): GasConfig {
  const chainConfig = CHAIN_GAS_CONFIGS[chainId];
  if (!chainConfig) {
    console.warn(`No gas configuration found for chain ID ${chainId}, using default`);
    return getDefaultGasConfig(chainId);
  }

  const operationConfig = chainConfig[operation];
  if (!operationConfig) {
    console.warn(
      `No gas configuration found for operation ${operation} on chain ${chainId}, using default`
    );
    return chainConfig.default || getDefaultGasConfig(chainId);
  }

  return operationConfig;
}

/**
 * Get default gas configuration for a chain
 * Fallback when no specific operation config is found
 */
export function getDefaultGasConfig(chainId: number): GasConfig {
  const chainConfig = CHAIN_GAS_CONFIGS[chainId];
  if (chainConfig?.default) {
    return chainConfig.default;
  }

  // Ultimate fallback - conservative settings
  return {
    gasPrice: 2000000000n, // 2 Gwei
    gasLimit: 300000n, // 300k gas
  };
}

/**
 * Check if a chain supports EIP-1559 (Type 2 transactions)
 */
export function supportsEIP1559(chainId: number): boolean {
  // Ethereum mainnet and some other chains support EIP-1559
  return chainId === 1; // Add more chains as needed
}

/**
 * Get gas configuration optimized for the current chain
 * Automatically detects EIP-1559 support and adjusts accordingly
 */
export function getOptimizedGasConfig(chainId: number, operation: string): GasConfig {
  const baseConfig = getGasConfig(chainId, operation);

  // For EIP-1559 chains, ensure we have the required fields
  if (supportsEIP1559(chainId)) {
    return {
      ...baseConfig,
      // Ensure we have EIP-1559 fields for Type 2 transactions
      maxFeePerGas: baseConfig.maxFeePerGas || baseConfig.gasPrice * 2n,
      maxPriorityFeePerGas: baseConfig.maxPriorityFeePerGas || baseConfig.gasPrice / 10n,
    };
  }

  return baseConfig;
}

/**
 * Format gas price for display
 */
export function formatGasPrice(gasPrice: bigint): string {
  const gwei = Number(gasPrice) / 1e9;
  return `${gwei} Gwei`;
}

/**
 * Format gas limit for display
 */
export function formatGasLimit(gasLimit: bigint): string {
  const kGas = Number(gasLimit) / 1000;
  return `${kGas}k gas`;
}

/**
 * Format gas configuration for display
 */
export function formatGasConfig(config: GasConfig): string {
  const price = formatGasPrice(config.gasPrice);
  const limit = formatGasLimit(config.gasLimit);

  if (config.maxFeePerGas && config.maxPriorityFeePerGas) {
    const maxFee = formatGasPrice(config.maxFeePerGas);
    const priorityFee = formatGasPrice(config.maxPriorityFeePerGas);
    return `${price} (max: ${maxFee}, priority: ${priorityFee}) | ${limit}`;
  }

  return `${price} | ${limit}`;
}

/**
 * Validate gas configuration
 * Ensures gas settings are reasonable for the operation
 */
export function validateGasConfig(config: GasConfig, operation: string): boolean {
  // Basic validation
  if (config.gasPrice <= 0n) {
    console.error(`Invalid gas price for ${operation}: ${config.gasPrice}`);
    return false;
  }

  if (config.gasLimit <= 0n) {
    console.error(`Invalid gas limit for ${operation}: ${config.gasLimit}`);
    return false;
  }

  // Check for reasonable gas limits based on operation
  const minGasLimits: Record<string, bigint> = {
    createCharacter: 100000n,
    healCharacter: 50000n,
    resurrectCharacter: 100000n,
    startFight: 100000n,
    continueFight: 100000n,
    fleeFight: 50000n,
    claimRewards: 100000n,
  };

  const minLimit = minGasLimits[operation] || 50000n;
  if (config.gasLimit < minLimit) {
    console.warn(`Gas limit for ${operation} seems low: ${config.gasLimit} < ${minLimit}`);
  }

  return true;
}
