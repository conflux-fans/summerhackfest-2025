// React adapter for ChainBrawler
// Based on REFACTORING_PLAN.md

import {
  type ChainBrawlerConfig,
  ChainBrawlerSDK,
  type UXState,
  UXStore,
} from "@chainbrawler/core";
import type { PublicClient, WalletClient } from "viem";

// React-specific contract client implementation
class ReactContractClient {
  constructor(
    private publicClient: PublicClient,
    private walletClient: WalletClient | undefined,
    private contractAddress: `0x${string}`
  ) {}

  // Contract client methods that will be used by Core operations
  async createCharacter(classId: number): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }

  async getCharacter(playerAddress: string): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }

  async healCharacter(): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }

  async resurrectCharacter(): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }

  async getAllPoolData(): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }

  async getCurrentEpoch(): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }

  async getEpochScore(playerAddress: string, epoch: bigint): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }

  async getTotalPlayerCount(): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }

  async getPlayerRank(playerAddress: string, epoch: bigint): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }

  async getTopPlayersData(limit: number, epoch: bigint): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }

  async loadClaims(playerAddress: string): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }

  async claimPrize(epoch: bigint, index: bigint, amount: bigint, proof: string[]): Promise<any> {
    // This will be implemented by the Core package's contract client
    throw new Error("Contract client must be implemented by Core package");
  }
}

export class ReactAdapter {
  private sdk: ChainBrawlerSDK;
  private store: UXStore;
  private contractClient: ReactContractClient;

  constructor(config: ChainBrawlerConfig) {
    this.store = new UXStore();
    this.contractClient = new ReactContractClient(
      config.publicClient,
      config.walletClient,
      config.address
    );

    // Create Core SDK with React-specific contract client
    this.sdk = new ChainBrawlerSDK(config);
  }

  // Initialize the adapter - SDK initializes automatically in constructor

  // Get the SDK instance
  getSDK(): ChainBrawlerSDK {
    return this.sdk;
  }

  // Get the current state
  getState(): UXState {
    return this.store.getState();
  }

  // Subscribe to state changes
  subscribe(callback: (state: UXState) => void): () => void {
    return this.store.subscribe(callback);
  }

  // Update wallet connection
  updateWalletClient(walletClient: WalletClient | undefined): void {
    // Update the contract client with new wallet client
    (this.contractClient as any).walletClient = walletClient;
  }

  // Update player address
  updatePlayerAddress(address: `0x${string}` | undefined): void {
    // Update the SDK with new player address
    (this.sdk as any).playerAddress = address;
  }

  // Cleanup method
  cleanup(): void {
    this.sdk.cleanup();
  }

  // Convenience methods for React components
  async createCharacter(classId: number) {
    return this.sdk.actions.createCharacter(classId);
  }

  async getCharacter(playerAddress: string) {
    return this.sdk.actions.getCharacter(playerAddress);
  }

  async healCharacter() {
    return this.sdk.actions.healCharacter();
  }

  async resurrectCharacter() {
    return this.sdk.actions.resurrectCharacter();
  }

  async loadPools() {
    return this.sdk.actions.loadPools();
  }

  async loadLeaderboard(playerAddress: string) {
    return this.sdk.actions.loadLeaderboard(playerAddress);
  }

  async loadClaims(playerAddress: string) {
    return this.sdk.actions.loadClaims(playerAddress);
  }

  async claimPrize(epoch: bigint, index: bigint, amount: bigint, proof: string[]) {
    return this.sdk.actions.claimPrize(epoch, index, amount, proof);
  }

  clearError() {
    this.store.setError(null);
  }

  async refreshAll() {
    // Refresh all data by calling individual refresh methods
    const playerAddress = (this.sdk as any).playerAddress;
    if (playerAddress) {
      await Promise.all([
        this.sdk.actions.refreshPools(),
        this.sdk.actions.refreshLeaderboard(playerAddress),
        this.sdk.actions.refreshClaims(playerAddress),
      ]);
    } else {
      await this.sdk.actions.refreshPools();
    }
    return { success: true };
  }
}
