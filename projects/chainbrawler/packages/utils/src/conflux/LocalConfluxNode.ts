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
 * Local Conflux Node for Development and Contract Deployment
 *
 * This module provides a complete implementation for starting and managing
 * a local Conflux node for development and contract deployment purposes.
 */

import { promises as fs } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "@xcfx/node";
import { createLogger } from "../logging/logger";
import { type ConfluxNodeConfig, ConfluxNodeManager } from "./ConfluxNodeManager";

export interface LocalNodeOptions {
  /** Custom mnemonic to use (defaults to HARDHAT_VAR_DEPLOYER_MNEMONIC) */
  mnemonic?: string;
  /** Number of accounts to generate (default: 10) */
  accountCount?: number;
  /** Configuration overrides */
  configOverrides?: Partial<ConfluxNodeConfig>;
  /** Data management mode: 'clean' always starts fresh, 'resume' tries to resume existing data, 'auto' prompts user (default: 'auto') */
  dataMode?: "clean" | "resume" | "auto";
}

export interface LocalNodeInfo {
  /** HTTP RPC endpoint URL */
  httpRpcUrl: string;
  /** WebSocket RPC endpoint URL */
  wsRpcUrl: string;
  /** eSpace HTTP RPC endpoint URL */
  espaceHttpRpcUrl: string;
  /** eSpace WebSocket RPC endpoint URL */
  espaceWsRpcUrl: string;
  /** Chain ID */
  chainId: number;
  /** Generated accounts information */
  accounts: Array<{
    index: number;
    coreAddress: string;
    espaceAddress: string;
    corePrivateKey: string;
    espacePrivateKey: string;
  }>;
  /** Miner account information */
  miner: {
    coreAddress: string;
    privateKey: string;
  };
  /** Node configuration */
  config: ConfluxNodeConfig;
}

export class LocalConfluxNode {
  private nodeManager: ConfluxNodeManager;
  private server: any = null;
  private isRunningFlag = false;
  private nodeInfo: LocalNodeInfo | null = null;
  private logger = createLogger("LocalConfluxNode");
  private options: Required<LocalNodeOptions>;

  constructor(options: LocalNodeOptions = {}) {
    this.options = {
      mnemonic:
        process.env.HARDHAT_VAR_DEPLOYER_MNEMONIC ||
        "test test test test test test test test test test test junk",
      accountCount: 10,
      configOverrides: {},
      dataMode: "auto",
      ...options,
    };

    this.nodeManager = new ConfluxNodeManager(this.options.configOverrides);
    this.nodeManager.setMnemonic(this.options.mnemonic);
  }

  /**
   * Starts the local Conflux node
   */
  async start(): Promise<LocalNodeInfo> {
    try {
      this.logger.info("Starting local Conflux node...");

      // Initialize node configuration with accounts
      const config = await this.nodeManager.initializeNodeConfig(this.options.accountCount);

      // Create server
      this.server = await createServer(config);

      // Start server
      await this.server.start();

      this.isRunningFlag = true;

      // Generate account information
      const accounts = await Promise.all(
        Array.from({ length: this.options.accountCount }, async (_, i) => ({
          index: i,
          coreAddress: await this.nodeManager.getCoreAddress(i),
          espaceAddress: await this.nodeManager.getEspaceAddress(i),
          corePrivateKey: await this.nodeManager.getCorePrivateKey(i),
          espacePrivateKey: await this.nodeManager.getEspacePrivateKey(i),
        }))
      );

      // Get miner account
      const minerPrivateKey = await this.nodeManager.getCorePrivateKey(this.options.accountCount);
      const minerCoreAddress = await this.nodeManager.getCoreAddress(this.options.accountCount);

      this.nodeInfo = {
        httpRpcUrl: `http://127.0.0.1:${config.jsonrpcHttpPort}`,
        wsRpcUrl: `ws://127.0.0.1:${config.jsonrpcWsPort}`,
        espaceHttpRpcUrl: `http://127.0.0.1:${config.jsonrpcHttpEthPort}`,
        espaceWsRpcUrl: `ws://127.0.0.1:${config.jsonrpcWsEthPort}`,
        chainId: config.evmChainId || 2030,
        accounts,
        miner: {
          coreAddress: minerCoreAddress,
          privateKey: minerPrivateKey,
        },
        config,
      };

      this.logger.info("Local Conflux node started successfully", {
        chainId: this.nodeInfo.chainId,
        httpRpcUrl: this.nodeInfo.httpRpcUrl,
        espaceHttpRpcUrl: this.nodeInfo.espaceHttpRpcUrl,
      });

      return this.nodeInfo;
    } catch (error) {
      this.logger.error("Failed to start local Conflux node", { error });
      throw error;
    }
  }

  /**
   * Stops the local Conflux node
   */
  async stop(): Promise<void> {
    try {
      if (this.server) {
        this.logger.info("Stopping local Conflux node...");
        await this.server.stop();
        this.server = null;
        this.isRunningFlag = false;
        this.nodeInfo = null;
        this.logger.info("Local Conflux node stopped");
      }
    } catch (error) {
      this.logger.error("Error stopping local Conflux node", { error });
      throw error;
    }
  }

  /**
   * Checks if the node is running
   */
  isRunning(): boolean {
    return this.isRunningFlag;
  }

  /**
   * Gets the current node information
   */
  getNodeInfo(): LocalNodeInfo | null {
    return this.nodeInfo;
  }

  /**
   * Gets the node manager instance
   */
  getNodeManager(): ConfluxNodeManager {
    return this.nodeManager;
  }
}

/**
 * Quick start function for starting a local node
 */
export async function startLocalNode(options: LocalNodeOptions = {}): Promise<LocalConfluxNode> {
  const node = new LocalConfluxNode(options);
  await node.start();
  return node;
}

/**
 * Quick start function with minimal configuration
 */
export async function quickStartNode(): Promise<LocalConfluxNode> {
  return startLocalNode({
    accountCount: 5,
    dataMode: "clean",
  });
}

export default LocalConfluxNode;
