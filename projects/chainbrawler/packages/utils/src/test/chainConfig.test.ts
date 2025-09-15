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

import { describe, expect, it } from "vitest";
import {
  chain2030,
  chainBrawlerLocal,
  chainConfigs,
  getChainConfig,
  type NetworkEnvironment,
} from "../chain/chainConfig";

describe("Chain Configuration", () => {
  describe("chainBrawlerLocal", () => {
    it("should have correct chain properties", () => {
      expect(chainBrawlerLocal.id).toBe(2030);
      expect(chainBrawlerLocal.name).toBe("ChainBrawler Local");
      expect(chainBrawlerLocal.nativeCurrency.symbol).toBe("CFX");
      expect(chainBrawlerLocal.nativeCurrency.decimals).toBe(18);
      expect(chainBrawlerLocal.testnet).toBe(true);
    });

    it("should have RPC URLs configured", () => {
      expect(chainBrawlerLocal.rpcUrls.default.http).toEqual(["http://127.0.0.1:8545"]);
      expect(chainBrawlerLocal.rpcUrls.public.http).toEqual(["http://127.0.0.1:8545"]);
    });

    it("should have block explorer configured", () => {
      expect(chainBrawlerLocal.blockExplorers?.default?.name).toBe("Local Explorer");
      expect(chainBrawlerLocal.blockExplorers?.default?.url).toBe("http://127.0.0.1:8545");
    });

    it("should have gas configuration", () => {
      expect(chainBrawlerLocal.fees?.baseFeeMultiplier).toBe(1.2);
      expect(chainBrawlerLocal.fees?.defaultPriorityFee).toBe(BigInt(1000000000));
    });

    it("should have transaction serializer", () => {
      expect(typeof chainBrawlerLocal.serializers?.transaction).toBe("function");
    });
  });

  describe("chain2030 (legacy export)", () => {
    it("should be the same as chainBrawlerLocal", () => {
      expect(chain2030).toBe(chainBrawlerLocal);
    });
  });

  describe("chainConfigs", () => {
    it("should have all network environments", () => {
      expect(chainConfigs.local).toBe(chainBrawlerLocal);
      expect(chainConfigs.testnet).toBeDefined();
      expect(chainConfigs.mainnet).toBeDefined();
    });

    it("should have correct chain IDs", () => {
      expect(chainConfigs.local.id).toBe(2030);
      expect(chainConfigs.testnet.id).toBe(71); // Conflux eSpace Testnet
      expect(chainConfigs.mainnet.id).toBe(1030); // Conflux eSpace Mainnet
    });
  });

  describe("getChainConfig", () => {
    it("should return local chain by default", () => {
      const chain = getChainConfig();
      expect(chain).toBe(chainBrawlerLocal);
    });

    it("should return local chain when explicitly requested", () => {
      const chain = getChainConfig("local");
      expect(chain).toBe(chainBrawlerLocal);
    });

    it("should return testnet chain", () => {
      const chain = getChainConfig("testnet");
      expect(chain).toBe(chainConfigs.testnet);
    });

    it("should return mainnet chain", () => {
      const chain = getChainConfig("mainnet");
      expect(chain).toBe(chainConfigs.mainnet);
    });

    it("should throw error for invalid network", () => {
      expect(() => getChainConfig("invalid" as NetworkEnvironment)).toThrow(
        "Invalid network environment: invalid. Must be one of: local, testnet, mainnet"
      );
    });
  });

  describe("transaction serializer", () => {
    it("should add gas buffer to transactions", () => {
      const serializer = chainBrawlerLocal.serializers?.transaction;
      expect(serializer).toBeDefined();

      const transaction = { gas: BigInt(1000000) };
      const result = serializer!(transaction);

      expect(result.gas).toBe(BigInt(1200000)); // 20% buffer
    });

    it("should handle transactions without gas", () => {
      const serializer = chainBrawlerLocal.serializers?.transaction;
      expect(serializer).toBeDefined();

      const transaction = { to: "0x123" };
      const result = serializer!(transaction);

      expect(result).toBe(transaction);
    });
  });
});
