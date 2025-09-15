import type { WriteContractParameters } from "viem";
import { useWriteContract } from "wagmi";
import { createWriteCallWithGas, type WriteOperation } from "../utils/writeCallWithGas";
import { useWriteGasConfig } from "./useGasConfig";

/**
 * Enhanced write contract hook with manual gas configuration
 * Applies chain-specific gas settings to prevent gas estimation issues
 */
export function useWriteContractWithGas(operation: WriteOperation) {
  const gasConfig = useWriteGasConfig(operation);
  const writeContract = useWriteContract();

  /**
   * Write contract with manual gas configuration
   */
  const writeWithGas = async (params: WriteContractParameters) => {
    const gasConfiguredParams = createWriteCallWithGas(params, gasConfig.rawConfig);

    console.log(`🔧 Writing contract with manual gas:`, {
      operation,
      chainId: gasConfig.chainId,
      chainName: gasConfig.chainName,
      gasConfig: gasConfig.gasConfigDisplay,
      contract: params.address,
      function: params.functionName,
      isValid: gasConfig.isValid,
    });

    return writeContract.writeContract(gasConfiguredParams);
  };

  return {
    ...writeContract,
    writeContract: writeWithGas,

    // Gas configuration
    gasConfig: gasConfig.rawConfig,
    gasInfo: {
      gasPrice: gasConfig.gasPriceDisplay,
      gasLimit: gasConfig.gasLimitDisplay,
      gasConfig: gasConfig.gasConfigDisplay,
      isLocalChain: gasConfig.isLocalChain,
      supportsEIP1559: gasConfig.supportsEIP1559,
      chainId: gasConfig.chainId,
      chainName: gasConfig.chainName,
      isValid: gasConfig.isValid,
    },

    // Direct access to gas values
    gasPrice: gasConfig.gasPrice,
    gasLimit: gasConfig.gasLimit,
    maxFeePerGas: gasConfig.maxFeePerGas,
    maxPriorityFeePerGas: gasConfig.maxPriorityFeePerGas,
  };
}

/**
 * Specific hooks for common operations
 */
export function useCreateCharacterWithGas() {
  return useWriteContractWithGas("createCharacter");
}

export function useHealCharacterWithGas() {
  return useWriteContractWithGas("healCharacter");
}

export function useResurrectCharacterWithGas() {
  return useWriteContractWithGas("resurrectCharacter");
}

export function useStartFightWithGas() {
  return useWriteContractWithGas("startFight");
}

export function useContinueFightWithGas() {
  return useWriteContractWithGas("continueFight");
}

export function useFleeFightWithGas() {
  return useWriteContractWithGas("fleeFight");
}

export function useClaimRewardsWithGas() {
  return useWriteContractWithGas("claimRewards");
}
