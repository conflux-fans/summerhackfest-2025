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
 * Minimal Conflux Node Configuration System
 * Extracted from devkit-cli to provide basic node functionality using HARDHAT_VAR_DEPLOYER_MNEMONIC
 */

import { BIP32Factory } from "bip32";
import { mnemonicToSeed, validateMnemonic } from "bip39";
import { privateKeyToAccount as corePrivateKeyToAccount } from "cive/accounts";
import * as ecc from "tiny-secp256k1";
import { privateKeyToAccount as espacePrivateKeyToAccount } from "viem/accounts";

const bip32 = BIP32Factory(ecc);

export interface ConfluxNodeConfig {
  posReferenceEnableHeight?: number;
  jsonrpcHttpPort?: number;
  jsonrpcWsPort?: number;
  jsonrpcHttpEthPort?: number;
  jsonrpcWsEthPort?: number;
  chainId?: number;
  evmChainId?: number;
  nodeType?: string;
  blockDbType?: string;
  log?: boolean;
  logLevel?: string;
  confluxDataDir?: string;
  devBlockIntervalMs?: number;
  genesisSecrets?: `0x${string}`[];
  genesisEvmSecrets?: `0x${string}`[];
  miningAuthor?: string;
}

export const defaultConfluxNodeConfig: ConfluxNodeConfig = {
  posReferenceEnableHeight: 0,
  jsonrpcHttpPort: 12537,
  jsonrpcWsPort: 12535,
  jsonrpcHttpEthPort: 8545,
  jsonrpcWsEthPort: 8546,
  chainId: 2029,
  evmChainId: 2030,
  nodeType: "full",
  blockDbType: "sqlite",
  log: false,
  logLevel: "error",
  devBlockIntervalMs: 1000,
};

export class ConfluxNodeManager {
  private mnemonic?: string;
  private config: ConfluxNodeConfig;

  constructor(config?: Partial<ConfluxNodeConfig>) {
    this.config = { ...defaultConfluxNodeConfig, ...config };

    // Get mnemonic from environment variable
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.HARDHAT_VAR_DEPLOYER_MNEMONIC
    ) {
      this.mnemonic = process.env.HARDHAT_VAR_DEPLOYER_MNEMONIC;
    }
  }

  /**
   * Sets the mnemonic to use for key derivation
   */
  setMnemonic(mnemonic: string): void {
    this.mnemonic = mnemonic;
  }

  /**
   * Gets the current configuration
   */
  getConfig(): ConfluxNodeConfig {
    return { ...this.config };
  }

  /**
   * Updates the configuration
   */
  updateConfig(updates: Partial<ConfluxNodeConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Derives a private key from the mnemonic using a derivation path
   */
  private async derivePrivateKey(derivationPath: string): Promise<string> {
    if (!this.mnemonic) {
      throw new Error(
        "Mnemonic not available. Set HARDHAT_VAR_DEPLOYER_MNEMONIC or call setMnemonic()"
      );
    }

    if (!validateMnemonic(this.mnemonic)) {
      throw new Error("Invalid mnemonic");
    }

    const seed = await mnemonicToSeed(this.mnemonic);
    const root = bip32.fromSeed(Buffer.from(seed));
    const child = root.derivePath(derivationPath);

    if (!child.privateKey) {
      throw new Error("Unable to derive private key");
    }

    return `0x${child.privateKey.toString("hex")}`;
  }

  /**
   * Gets a Core private key for the specified index
   */
  async getCorePrivateKey(index: number): Promise<string> {
    return this.derivePrivateKey(`m/44'/503'/0'/0/${index}`);
  }

  /**
   * Gets an eSpace private key for the specified index
   */
  async getEspacePrivateKey(index: number): Promise<string> {
    return this.derivePrivateKey(`m/44'/60'/0'/0/${index}`);
  }

  /**
   * Gets a Core address for the specified index
   */
  async getCoreAddress(index: number, networkId?: number): Promise<string> {
    const privateKey = await this.getCorePrivateKey(index);
    return corePrivateKeyToAccount(privateKey as `0x${string}`, {
      networkId: networkId || this.config.chainId || 2029,
    }).address;
  }

  /**
   * Gets an eSpace address for the specified index
   */
  async getEspaceAddress(index: number): Promise<string> {
    const privateKey = await this.getEspacePrivateKey(index);
    return espacePrivateKeyToAccount(privateKey as `0x${string}`).address;
  }

  /**
   * Initializes the node configuration with generated accounts
   * This prepares the config for use with @xcfx/node createServer
   */
  async initializeNodeConfig(accountCount: number = 10): Promise<ConfluxNodeConfig> {
    if (!this.mnemonic) {
      throw new Error(
        "Mnemonic not available. Set HARDHAT_VAR_DEPLOYER_MNEMONIC or call setMnemonic()"
      );
    }

    // Generate Core private keys
    const corePrivateKeys = await Promise.all(
      Array.from({ length: accountCount }, (_, i) => this.getCorePrivateKey(i))
    );

    // Generate eSpace private keys
    const evmPrivateKeys = await Promise.all(
      Array.from({ length: accountCount }, (_, i) => this.getEspacePrivateKey(i))
    );

    // Generate miner account (one additional account)
    const minerPrivateKey = await this.getCorePrivateKey(accountCount);
    const minerAccount = corePrivateKeyToAccount(minerPrivateKey as `0x${string}`, {
      networkId: this.config.chainId || 2029,
    });

    // Update configuration with genesis secrets
    const updatedConfig: ConfluxNodeConfig = {
      ...this.config,
      genesisSecrets: [...corePrivateKeys, minerPrivateKey] as `0x${string}`[],
      genesisEvmSecrets: [...evmPrivateKeys, minerPrivateKey] as `0x${string}`[],
      miningAuthor: minerAccount.address,
    };

    this.config = updatedConfig;
    return updatedConfig;
  }

  /**
   * Gets the default configuration compatible with @xcfx/node
   * This is what can be passed directly to createServer from @xcfx/node
   */
  static getDefaultConfig(): ConfluxNodeConfig {
    return { ...defaultConfluxNodeConfig };
  }
}

export default ConfluxNodeManager;
