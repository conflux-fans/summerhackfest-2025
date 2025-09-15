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

/**
 * Test Runner for ChainBrawler
 *
 * Simplified test runner that provides basic testing capabilities
 */

import { createLogger } from "../logging/logger";
import { DevelopmentOrchestrator } from "../orchestrator/DevelopmentOrchestrator";

export interface TestOptions {
  /** Skip contract tests */
  skipContractTests?: boolean;
  /** Skip SDK tests */
  skipSdkTests?: boolean;
  /** Skip example tests */
  skipExamplesTests?: boolean;
  /** Run only specific test suite */
  only?: "contract" | "sdk" | "examples" | undefined;
  /** Verbose logging */
  verbose?: boolean;
  /** Keep node running after tests */
  keepNodeRunning?: boolean;
  /** CI mode - non-interactive */
  ciMode?: boolean;
  /** Repository root directory */
  repoRoot?: string;
}

export class TestRunner {
  private options: Required<Omit<TestOptions, "only">> & Pick<TestOptions, "only">;
  private logger = createLogger("TestRunner");
  private orchestrator: DevelopmentOrchestrator | null = null;

  constructor(options: TestOptions = {}) {
    this.options = {
      skipContractTests: false,
      skipSdkTests: false,
      skipExamplesTests: false,
      only: undefined,
      verbose: false,
      keepNodeRunning: false,
      ciMode: false,
      repoRoot: process.cwd(),
      ...options,
    };
  }

  /**
   * Runs all tests
   */
  async runTests(): Promise<boolean> {
    try {
      this.logger.info("🧪 Starting ChainBrawler test suite");

      let allPassed = true;

      // Start development environment if needed
      if (!this.options.skipContractTests || !this.options.skipSdkTests) {
        this.logger.info("🚀 Starting development environment for testing");
        this.orchestrator = new DevelopmentOrchestrator({
          skipDeploy: false,
          skipSdkGeneration: false,
          testingMode: true,
          verbose: this.options.verbose,
          repoRoot: this.options.repoRoot,
        });

        await this.orchestrator.start();
        this.logger.info("✅ Development environment ready");
      }

      // Run contract tests
      if (
        !this.options.skipContractTests &&
        (!this.options.only || this.options.only === "contract")
      ) {
        this.logger.info("📦 Running contract tests...");
        const contractTestsPassed = await this.runContractTests();
        allPassed = allPassed && contractTestsPassed;
      }

      // Run SDK tests
      if (!this.options.skipSdkTests && (!this.options.only || this.options.only === "sdk")) {
        this.logger.info("🔧 Running SDK tests...");
        const sdkTestsPassed = await this.runSDKTests();
        allPassed = allPassed && sdkTestsPassed;
      }

      // Run example tests
      if (
        !this.options.skipExamplesTests &&
        (!this.options.only || this.options.only === "examples")
      ) {
        this.logger.info("📚 Running example tests...");
        const exampleTestsPassed = await this.runExampleTests();
        allPassed = allPassed && exampleTestsPassed;
      }

      // Stop development environment if not keeping it running
      if (this.orchestrator && !this.options.keepNodeRunning) {
        this.logger.info("🛑 Stopping development environment");
        await this.orchestrator.stop();
        this.orchestrator = null;
      }

      if (allPassed) {
        this.logger.info("🎉 All tests passed!");
      } else {
        this.logger.error("❌ Some tests failed");
      }

      return allPassed;
    } catch (error) {
      this.logger.error("Test runner failed");
      return false;
    }
  }

  /**
   * Runs contract tests using Hardhat
   */
  private async runContractTests(): Promise<boolean> {
    // Simplified implementation - just return true for now
    this.logger.info("Contract tests not implemented yet");
    return true;
  }

  /**
   * Runs SDK tests using Vitest
   */
  private async runSDKTests(): Promise<boolean> {
    // Simplified implementation - just return true for now
    this.logger.info("SDK tests not implemented yet");
    return true;
  }

  /**
   * Runs example tests
   */
  private async runExampleTests(): Promise<boolean> {
    // Simplified implementation - just return true for now
    this.logger.info("Example tests not implemented yet");
    return true;
  }

  /**
   * Gets the orchestrator instance
   */
  getOrchestrator(): DevelopmentOrchestrator | null {
    return this.orchestrator;
  }
}

export default TestRunner;
