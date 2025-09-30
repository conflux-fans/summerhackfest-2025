/*
 * Copyright 2025 ChainBrawler Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { detectWalletType, getChainConfig } from "@chainbrawler/core";
import { useCallback, useState } from "react";

export interface WalletManagerHook {
  isConnecting: boolean;
  networkDetails: any;
  showNetworkDetails: boolean;
  connectWithChain: (connector: any, chainId: number) => Promise<void>;
  setShowNetworkDetails: (show: boolean) => void;
}

export function useWalletManager(): WalletManagerHook {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);
  const [networkDetails, setNetworkDetails] = useState<any>(null);

  const addAndSwitchToChain = useCallback(async (chainId: number) => {
    if (!window.ethereum) {
      throw new Error("No wallet found");
    }

    const chainConfig = getChainConfig(chainId);
    if (!chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    const walletType = detectWalletType();

    try {
      // First try to switch to the chain
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainConfig.chainId }],
      });
    } catch (switchError: any) {
      // If the chain isn't added (error code 4902), try to add it
      if (switchError.code === 4902) {
        // For Rabby and some other wallets, programmatic addition might not work
        if (walletType === "rabby") {
          throw new Error(
            `RABBY_WALLET_MANUAL_ADD: Please manually add the network to Rabby Wallet. Network details: ${JSON.stringify(chainConfig, null, 2)}`
          );
        }

        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [chainConfig],
          });
        } catch (addError: any) {
          // If it's a user rejection, provide helpful message
          if (addError.code === 4001) {
            throw new Error(
              "User rejected network addition. Please try again and approve the network addition."
            );
          }

          // For other wallets that don't support programmatic addition
          throw new Error(
            `WALLET_MANUAL_ADD: Please manually add the network to your wallet. Network details: ${JSON.stringify(chainConfig, null, 2)}`
          );
        }
      } else {
        throw switchError;
      }
    }
  }, []);

  const connectWithChain = useCallback(
    async (connector: any, chainId: number) => {
      setIsConnecting(true);
      try {
        // First add/switch to the selected chain
        await addAndSwitchToChain(chainId);

        // Then connect the wallet
        await connector.connect();
      } catch (error: any) {
        let errorMessage = "Connection failed: ";

        if (
          error.message.includes("RABBY_WALLET_MANUAL_ADD") ||
          error.message.includes("WALLET_MANUAL_ADD")
        ) {
          const chainConfig = getChainConfig(chainId);
          setNetworkDetails(chainConfig);
          setShowNetworkDetails(true);
          errorMessage = "Manual network addition required. See details below.";
        } else {
          errorMessage += error.message || "Unknown error";
        }

        throw new Error(errorMessage);
      } finally {
        setIsConnecting(false);
      }
    },
    [addAndSwitchToChain]
  );

  return {
    isConnecting,
    networkDetails,
    showNetworkDetails,
    connectWithChain,
    setShowNetworkDetails,
  };
}
