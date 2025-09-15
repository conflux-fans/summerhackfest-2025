/**
 * Contract Client Factory
 *
 * Factory for creating contract clients based on environment and configuration.
 * Creates real contract clients for production use.
 */

import type { Address, PublicClient, WalletClient } from "viem";
import { getContractAddresses } from "../generated/contractAddresses";
import type { ContractClient } from "./ContractClient";
import { WagmiContractClient } from "./WagmiContractClient";

export interface ContractClientConfig {
  address: Address;
  chainId: number;
  publicClient: PublicClient;
  walletClient?: WalletClient;
  wagmiConfig?: any;
}

export class ContractClientFactory {
  /**
   * Create a contract client based on configuration
   */
  static createClient(config: ContractClientConfig): ContractClient {
    return new WagmiContractClient(
      config.address,
      config.chainId,
      config.publicClient,
      config.walletClient,
      config.wagmiConfig
    );
  }

  /**
   * Create a contract client for production
   */
  static createRealClient(
    address: Address,
    chainId: number,
    publicClient: PublicClient,
    walletClient?: WalletClient,
    wagmiConfig?: any
  ): WagmiContractClient {
    return new WagmiContractClient(address, chainId, publicClient, walletClient, wagmiConfig);
  }

  /**
   * Create a contract client based on environment
   */
  static createClientForEnvironment(
    address: Address,
    chainId: number,
    publicClient: PublicClient,
    walletClient?: WalletClient,
    wagmiConfig?: any
  ): ContractClient {
    // Check if we have a deployed contract for this chain
    const hasDeployedContract = ContractClientFactory.hasDeployedContract(chainId);

    if (!hasDeployedContract) {
      throw new Error(
        `No deployed contract found for chain ${chainId}. Please deploy the contract first.`
      );
    }

    console.log(`🔧 Chain ${chainId}: Using real contract client`);

    return ContractClientFactory.createClient({
      address,
      chainId,
      publicClient,
      walletClient,
      wagmiConfig,
    });
  }

  /**
   * Check if we have a deployed contract for the given chain
   */
  private static hasDeployedContract(chainId: number): boolean {
    try {
      console.log(`🔍 Checking for deployed contract on chain ${chainId}`);
      const addresses = getContractAddresses(chainId);
      console.log(`✅ Found deployed contract on chain ${chainId}:`, addresses);
      return true;
    } catch (error: any) {
      console.log(`❌ No deployed contract found on chain ${chainId}:`, error.message);
      return false;
    }
  }
}
