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

// Chain utilities for ChainBrawler

export interface SupportedChain {
  id: number;
  name: string;
  hasContract: boolean;
}

export interface ChainConfig {
  chainId: string; // hex format
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const SUPPORTED_CHAINS: SupportedChain[] = [
  { id: 2030, name: "ChainBrawler Local", hasContract: true },
  { id: 71, name: "Conflux eSpace Testnet", hasContract: true },
  { id: 1030, name: "Conflux eSpace", hasContract: true },
];

export function isSupportedChain(chainId: number): boolean {
  return SUPPORTED_CHAINS.some((chain) => chain.id === chainId);
}

export function getChainConfig(chainId: number): ChainConfig | null {
  switch (chainId) {
    case 2030:
      return {
        chainId: "0x7ee", // 2030 in hex
        chainName: "ChainBrawler Local",
        nativeCurrency: {
          name: "CFX",
          symbol: "CFX",
          decimals: 18,
        },
        rpcUrls: ["http://127.0.0.1:8545"],
        blockExplorerUrls: ["http://127.0.0.1:8545"],
      };
    case 71:
      return {
        chainId: "0x47", // 71 in hex
        chainName: "Conflux eSpace Testnet",
        nativeCurrency: {
          name: "CFX",
          symbol: "CFX",
          decimals: 18,
        },
        rpcUrls: ["https://evmtestnet.confluxrpc.com"],
        blockExplorerUrls: ["https://evmtestnet.confluxscan.org"],
      };
    case 1030:
      return {
        chainId: "0x406", // 1030 in hex
        chainName: "Conflux eSpace",
        nativeCurrency: {
          name: "CFX",
          symbol: "CFX",
          decimals: 18,
        },
        rpcUrls: ["https://evm.confluxrpc.com"],
        blockExplorerUrls: ["https://evm.confluxscan.org"],
      };
    default:
      return null;
  }
}

export type WalletType = "rabby" | "metamask" | "coinbase" | "brave" | "other" | "unknown";

export function detectWalletType(): WalletType {
  if (typeof window === "undefined" || !window.ethereum) return "unknown";

  if (window.ethereum.isRabby) return "rabby";
  if (window.ethereum.isMetaMask) return "metamask";
  if (window.ethereum.isCoinbaseWallet) return "coinbase";
  if (window.ethereum.isBraveWallet) return "brave";

  return "other";
}

export function getSupportedChainById(chainId: number): SupportedChain | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
}

export function hasContractDeployed(chainId: number): boolean {
  const chain = getSupportedChainById(chainId);
  return chain?.hasContract ?? false;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
