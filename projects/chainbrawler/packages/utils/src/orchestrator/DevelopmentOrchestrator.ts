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
 * Development Orchestrator
 *
 * Integrated TypeScript solution that provides a complete development environment:
 * 1. Starts LocalConfluxNode with proper configuration
 * 2. Waits for node readiness
 * 3. Deploys contracts using Hardhat programmatically
 * 4. Extracts deployed addresses to TypeScript
 * 5. Generates SDK types using Wagmi CLI
 * 6. Provides cleanup and CI-friendly operation
 */

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { LocalConfluxNode, type LocalNodeInfo } from "../conflux/LocalConfluxNode";
import { createLogger } from "../logging/logger";
// Note: This would normally import from @chainbrawler/core
// For now, we'll use a placeholder implementation
// import { getContractAddresses } from "@chainbrawler/core";

export interface DeploymentResult {
  chainId: number;
  deployedAddresses: Record<string, string>;
  transactionHashes: Record<string, string>;
}

export interface OrchestratorOptions {
  /** Skip contract deployment (use existing) */
  skipDeploy?: boolean;
  /** Skip SDK generation */
  skipSdkGeneration?: boolean;
  /** Keep node running after completion */
  keepNodeRunning?: boolean;
  /** Data management mode: 'clean' always starts fresh, 'resume' tries to resume existing data, 'auto' uses smart defaults (default: testing mode uses 'clean', dev mode uses 'auto') */
  dataMode?: "clean" | "resume" | "auto";
  /** Testing mode - always cleanup data, non-interactive */
  testingMode?: boolean;
  /** Custom node configuration */
  nodeConfig?: {
    accountCount?: number;
    ports?: {
      httpRpc?: number;
      wsRpc?: number;
      espaceHttpRpc?: number;
      espaceWsRpc?: number;
    };
  };
  /** Verbose logging */
  verbose?: boolean;
  /** Repository root directory */
  repoRoot?: string;
}

export class DevelopmentOrchestrator {
  private node: LocalConfluxNode;
  private nodeInfo: LocalNodeInfo | null = null;
  private options: Required<OrchestratorOptions>;
  private repoRoot: string;
  private logger = createLogger("DevelopmentOrchestrator");

  constructor(options: OrchestratorOptions = {}) {
    // Default to utils package parent directory (should be repo root)
    // In ES modules, use import.meta.url to get current file path
    const currentDir = resolve(fileURLToPath(import.meta.url), "..", "..", "..");
    this.repoRoot = options.repoRoot || resolve(currentDir, "..", "..");

    this.options = {
      skipDeploy: false,
      skipSdkGeneration: false,
      keepNodeRunning: false,
      testingMode: false,
      dataMode: options.testingMode ? "clean" : options.dataMode || "auto",
      nodeConfig: {
        accountCount: 10,
        ports: {
          httpRpc: 12537,
          wsRpc: 12535,
          espaceHttpRpc: 8545,
          espaceWsRpc: 8546,
        },
        ...options.nodeConfig,
      },
      verbose: false,
      repoRoot: this.repoRoot,
      ...options,
    };

    // Create LocalConfluxNode with configuration
    this.node = new LocalConfluxNode({
      accountCount: this.options.nodeConfig.accountCount,
      dataMode: this.options.dataMode,
      configOverrides: {
        jsonrpcHttpPort: this.options.nodeConfig.ports?.httpRpc,
        jsonrpcWsPort: this.options.nodeConfig.ports?.wsRpc,
        jsonrpcHttpEthPort: this.options.nodeConfig.ports?.espaceHttpRpc,
        jsonrpcWsEthPort: this.options.nodeConfig.ports?.espaceWsRpc,
        devBlockIntervalMs: 1000, // 1 second blocks for development
      },
    });
  }

  private log(message: string, force = false) {
    if (this.options.verbose || force) {
      this.logger.info(message);
    }
  }

  /**
   * Starts the development environment
   */
  async start(): Promise<DeploymentResult> {
    try {
      this.log("🚀 Starting ChainBrawler Development Environment");

      // Step 1: Start local node
      this.log("📡 Starting local Conflux node...");
      this.nodeInfo = await this.node.start();
      this.log(`✅ Node started on chain ${this.nodeInfo.chainId}`);

      // Step 2: Deploy contracts (if not skipped)
      let deploymentResult: DeploymentResult | null = null;
      if (!this.options.skipDeploy) {
        this.log("📦 Deploying contracts...");
        deploymentResult = await this.deployContracts();
        this.log("✅ Contracts deployed successfully");
      } else {
        this.log("⏭️ Skipping contract deployment");
        // Placeholder - would normally get addresses from core package
        this.logger.warn("Contract address loading not implemented yet");
      }

      // Step 3: Generate SDK types (if not skipped)
      if (!this.options.skipSdkGeneration) {
        this.log("🔧 Generating SDK types...");
        await this.generateSDKTypes();
        this.log("✅ SDK types generated");
      } else {
        this.log("⏭️ Skipping SDK generation");
      }

      this.log("🎉 Development environment ready!");

      return (
        deploymentResult || {
          chainId: this.nodeInfo.chainId,
          deployedAddresses: {},
          transactionHashes: {},
        }
      );
    } catch (error) {
      this.logger.error("Failed to start development environment", { error });
      throw error;
    }
  }

  /**
   * Stops the development environment
   */
  async stop(): Promise<void> {
    try {
      this.log("🛑 Stopping development environment...");
      await this.node.stop();
      this.log("✅ Development environment stopped");
    } catch (error) {
      this.logger.error("Error stopping development environment", { error });
      throw error;
    }
  }

  /**
   * Deploys contracts using Hardhat
   */
  private async deployContracts(): Promise<DeploymentResult> {
    return new Promise((resolve, reject) => {
      const contractDir = join(this.repoRoot, "packages", "contract");
      const hardhatCommand = "npx";
      const hardhatArgs = [
        "hardhat",
        "ignition",
        "deploy",
        "ignition/modules/ChainBrawlerModule.ts",
        "--network",
        "confluxESpaceLocal",
        "--reset",
      ];

      this.log(`Running: ${hardhatCommand} ${hardhatArgs.join(" ")} in ${contractDir}`);

      const childProcess = spawn(hardhatCommand, hardhatArgs, {
        cwd: contractDir,
        stdio: this.options.verbose ? "inherit" : "pipe",
        env: {
          ...process.env,
          HARDHAT_NETWORK: "confluxESpaceLocal",
          HARDHAT_VAR_DEPLOYER_MNEMONIC:
            process.env.HARDHAT_VAR_DEPLOYER_MNEMONIC ||
            "test test test test test test test test test test test junk",
        },
      });

      let stdout = "";
      let stderr = "";

      if (!this.options.verbose) {
        childProcess.stdout?.on("data", (data: any) => {
          stdout += data.toString();
        });

        childProcess.stderr?.on("data", (data: any) => {
          stderr += data.toString();
        });
      }

      childProcess.on("close", (code: number | null) => {
        if (code === 0) {
          // Placeholder - would normally extract addresses from core package
          this.logger.warn("Contract address extraction not implemented yet");
          resolve({
            chainId: this.nodeInfo?.chainId || 2030,
            deployedAddresses: {},
            transactionHashes: {},
          });
        } else {
          reject(new Error(`Contract deployment failed with code ${code}: ${stderr}`));
        }
      });

      childProcess.on("error", (error: any) => {
        reject(new Error(`Failed to start contract deployment: ${error.message}`));
      });
    });
  }

  /**
   * Generates SDK types using core package generate:all script
   */
  private async generateSDKTypes(): Promise<void> {
    return new Promise((resolve, reject) => {
      const coreDir = join(this.repoRoot, "packages", "core");
      const npmCommand = "npm";
      const npmArgs = ["run", "generate:all"];

      this.log(`Running: ${npmCommand} ${npmArgs.join(" ")} in ${coreDir}`);

      const childProcess = spawn(npmCommand, npmArgs, {
        cwd: coreDir,
        stdio: this.options.verbose ? "inherit" : "pipe",
      });

      let stderr = "";

      if (!this.options.verbose) {
        childProcess.stderr?.on("data", (data: any) => {
          stderr += data.toString();
        });
      }

      childProcess.on("close", (code: number | null) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`SDK generation failed with code ${code}: ${stderr}`));
        }
      });

      childProcess.on("error", (error: any) => {
        reject(new Error(`Failed to start SDK generation: ${error.message}`));
      });
    });
  }

  /**
   * Gets the current node information
   */
  getNodeInfo(): LocalNodeInfo | null {
    return this.nodeInfo;
  }

  /**
   * Checks if the orchestrator is running
   */
  isRunning(): boolean {
    return this.node.isRunning();
  }
}

export default DevelopmentOrchestrator;
