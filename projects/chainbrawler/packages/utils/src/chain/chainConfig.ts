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

import type { Chain } from "viem";
import { defineChain } from "viem";
import { confluxESpace, confluxESpaceTestnet } from "viem/chains";

// Local development chain configuration
export const chainBrawlerLocal = defineChain({
  id: 2030,
  name: "ChainBrawler Local",
  nativeCurrency: { decimals: 18, name: "CFX", symbol: "CFX" },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
  testnet: true,
  // Add block explorer for better debugging
  blockExplorers: {
    default: { name: "Local Explorer", url: "http://127.0.0.1:8545" },
  },
  // Add gas configuration to help wallets with local development
  fees: {
    baseFeeMultiplier: 1.2, // Add 20% buffer like CLI
    defaultPriorityFee: BigInt(1000000000), // 1 gwei default priority fee
  },
  // Custom serializers to help with gas estimation
  serializers: {
    transaction: (transaction: any) => {
      // Add gas buffer if not present
      if (transaction.gas && typeof transaction.gas === "bigint") {
        transaction.gas = (transaction.gas * 12n) / 10n; // Add 20% buffer
      }
      return transaction;
    },
  },
});

// Network environment type
export type NetworkEnvironment = "local" | "testnet" | "mainnet";

// Chain configuration mapping
export const chainConfigs = {
  local: chainBrawlerLocal,
  testnet: confluxESpaceTestnet,
  mainnet: confluxESpace,
} as const;

/**
 * Get chain configuration by network environment (browser-safe)
 * @param network - Network environment (local, testnet, mainnet)
 * @returns Chain configuration
 */
export function getChainConfig(network: NetworkEnvironment = "local"): Chain {
  const chain = chainConfigs[network];
  if (!chain) {
    throw new Error(
      `Invalid network environment: ${network}. Must be one of: local, testnet, mainnet`
    );
  }

  return chain;
}

// Legacy export for backward compatibility
export const chain2030 = chainBrawlerLocal;

// Default export for backward compatibility
export default chain2030;

export type { Chain };
