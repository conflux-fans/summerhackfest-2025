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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { findDeployedAddress, findDeployedAddressForNetwork } from "../contracts/addressManager";

// Mock console.warn to test warning messages
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("Address Manager", () => {
  beforeEach(() => {
    mockConsoleWarn.mockClear();
  });

  describe("findDeployedAddress", () => {
    it("should return undefined and log warning for any chain", () => {
      const result = findDeployedAddress(123, "test-contract");

      expect(result).toBeUndefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Contract address lookup not implemented for chain 123"
      );
    });

    it("should use local chain ID as default when no chainId provided", () => {
      const result = findDeployedAddress();

      expect(result).toBeUndefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Contract address lookup not implemented for chain 2030"
      );
    });

    it("should handle undefined key parameter", () => {
      const result = findDeployedAddress(456);

      expect(result).toBeUndefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Contract address lookup not implemented for chain 456"
      );
    });
  });

  describe("findDeployedAddressForNetwork", () => {
    it("should call findDeployedAddress with correct chain ID for local", () => {
      const result = findDeployedAddressForNetwork("local", "test-contract");

      expect(result).toBeUndefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Contract address lookup not implemented for chain 2030"
      );
    });

    it("should call findDeployedAddress with correct chain ID for testnet", () => {
      const result = findDeployedAddressForNetwork("testnet", "test-contract");

      expect(result).toBeUndefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Contract address lookup not implemented for chain 71"
      );
    });

    it("should call findDeployedAddress with correct chain ID for mainnet", () => {
      const result = findDeployedAddressForNetwork("mainnet", "test-contract");

      expect(result).toBeUndefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Contract address lookup not implemented for chain 1030"
      );
    });

    it("should handle undefined key parameter", () => {
      const result = findDeployedAddressForNetwork("local");

      expect(result).toBeUndefined();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Contract address lookup not implemented for chain 2030"
      );
    });
  });
});
