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

// Mock the modules to avoid complex dependencies
vi.mock("../orchestrator/DevelopmentOrchestrator", () => ({
  DevelopmentOrchestrator: class MockDevelopmentOrchestrator {},
}));

vi.mock("../testing/TestRunner", () => ({
  TestRunner: class MockTestRunner {},
}));

vi.mock("../conflux/ConfluxNodeManager", () => ({
  ConfluxNodeManager: class MockConfluxNodeManager {},
  defaultConfluxNodeConfig: {},
}));

vi.mock("../conflux/ConfluxServerManager", () => ({
  SimpleConfluxServerManager: class MockSimpleConfluxServerManager {},
  createServerConfig: vi.fn(),
}));

vi.mock("../conflux/LocalConfluxNode", () => ({
  LocalConfluxNode: class MockLocalConfluxNode {},
  startLocalNode: vi.fn(),
  quickStartNode: vi.fn(),
}));

describe("Utils Package Exports", () => {
  it("should export all expected functions and classes", async () => {
    const utils = await import("../index");

    // Development Orchestrator
    expect(utils.DevelopmentOrchestrator).toBeDefined();

    // Test Runner
    expect(utils.TestRunner).toBeDefined();

    // Chain Configuration
    expect(utils.chain2030).toBeDefined();
    expect(utils.chainBrawlerLocal).toBeDefined();
    expect(utils.chainConfigs).toBeDefined();
    expect(utils.getChainConfig).toBeDefined();

    // Contract Address Management
    expect(utils.findDeployedAddress).toBeDefined();
    expect(utils.findDeployedAddressForNetwork).toBeDefined();

    // Logging
    expect(utils.createLogger).toBeDefined();
    expect(utils.logger).toBeDefined();

    // Conflux Node Management
    expect(utils.ConfluxNodeManager).toBeDefined();
    expect(utils.defaultConfluxNodeConfig).toBeDefined();

    // Conflux Server Management
    expect(utils.SimpleConfluxServerManager).toBeDefined();
    expect(utils.createServerConfig).toBeDefined();

    // Local Node Management
    expect(utils.LocalConfluxNode).toBeDefined();
    expect(utils.startLocalNode).toBeDefined();
    expect(utils.quickStartNode).toBeDefined();
  });

  it("should have correct function types", async () => {
    const utils = await import("../index");

    // Test function types
    expect(typeof utils.getChainConfig).toBe("function");
    expect(typeof utils.findDeployedAddress).toBe("function");
    expect(typeof utils.findDeployedAddressForNetwork).toBe("function");
    expect(typeof utils.createLogger).toBe("function");
    expect(typeof utils.createServerConfig).toBe("function");
    expect(typeof utils.startLocalNode).toBe("function");
    expect(typeof utils.quickStartNode).toBe("function");
  });

  it("should have correct object types", async () => {
    const utils = await import("../index");

    // Test object types
    expect(typeof utils.chainConfigs).toBe("object");
    expect(utils.chainConfigs).toHaveProperty("local");
    expect(utils.chainConfigs).toHaveProperty("testnet");
    expect(utils.chainConfigs).toHaveProperty("mainnet");
  });
});
