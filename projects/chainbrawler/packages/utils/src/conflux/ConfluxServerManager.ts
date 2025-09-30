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
 * Conflux Server Management utilities for creating and managing development nodes
 * This provides a bridge between the common ConfluxNodeManager and @xcfx/node
 */

import { type ConfluxNodeConfig, ConfluxNodeManager } from "./ConfluxNodeManager";

export interface ConfluxServer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface ConfluxServerManager {
  startServer(): Promise<void>;
  stopServer(): Promise<void>;
  getConfig(): ConfluxNodeConfig;
  getMinerWallet(): any;
}

/**
 * Creates a server configuration ready for use with @xcfx/node
 * This function prepares the configuration and can be used as:
 *
 * ```typescript
 * import { createServer } from '@xcfx/node';
 * import { createServerConfig } from '@chainbrawler/utils';
 *
 * const config = await createServerConfig();
 * const server = await createServer(config);
 * await server.start();
 * ```
 */
export async function createServerConfig(options?: {
  mnemonic?: string;
  accountCount?: number;
  configOverrides?: Partial<ConfluxNodeConfig>;
  dataDir?: string;
}): Promise<ConfluxNodeConfig> {
  const nodeManager = new ConfluxNodeManager(options?.configOverrides);

  if (options?.mnemonic) {
    nodeManager.setMnemonic(options.mnemonic);
  }

  const config = await nodeManager.initializeNodeConfig(options?.accountCount ?? 10);

  // Set data directory if provided
  if (options?.dataDir) {
    config.confluxDataDir = options.dataDir;
  }

  return config;
}

/**
 * Simple Conflux Server Manager implementation
 * This provides a basic wrapper around the ConfluxNodeManager for server operations
 */
export class SimpleConfluxServerManager implements ConfluxServerManager {
  private nodeManager: ConfluxNodeManager;
  private config: ConfluxNodeConfig;
  private server: any = null;

  constructor(options?: {
    mnemonic?: string;
    accountCount?: number;
    configOverrides?: Partial<ConfluxNodeConfig>;
    dataDir?: string;
  }) {
    this.nodeManager = new ConfluxNodeManager(options?.configOverrides);

    if (options?.mnemonic) {
      this.nodeManager.setMnemonic(options.mnemonic);
    }

    this.config = this.nodeManager.getConfig();

    if (options?.dataDir) {
      this.config.confluxDataDir = options.dataDir;
    }
  }

  async startServer(): Promise<void> {
    // Initialize the configuration with accounts
    this.config = await this.nodeManager.initializeNodeConfig();
  }

  async stopServer(): Promise<void> {
    // Cleanup if needed
    this.server = null;
  }

  getConfig(): ConfluxNodeConfig {
    return { ...this.config };
  }

  getMinerWallet(): any {
    // Return miner wallet information
    return {
      address: this.config.miningAuthor,
      // Add other wallet properties as needed
    };
  }
}

export default SimpleConfluxServerManager;
