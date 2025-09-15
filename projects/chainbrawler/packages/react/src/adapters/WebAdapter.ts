// Web adapter for ChainBrawler using wagmi/core generated functions
// Integrates with RainbowKit and wagmi ecosystem

import {
  type ChainBrawlerConfig,
  ChainBrawlerSDK,
  ContractClientFactory,
  EventType,
  type UXState,
  UXStore,
} from "@chainbrawler/core";
import { PublicClient, type WalletClient } from "viem";

// Web-specific SDK that composes ChainBrawler
class WebChainBrawlerSDK {
  private sdk: ChainBrawlerSDK;
  private contractClient: any; // Will be WagmiContractClient

  constructor(config: ChainBrawlerConfig) {
    // Create contract client using factory
    this.contractClient = ContractClientFactory.createClientForEnvironment(
      config.address,
      config.chain.id,
      config.publicClient,
      config.walletClient,
      config.wagmiConfig
    );

    // Create a custom config with our contract client
    const customConfig = {
      ...config,
      contractClient: this.contractClient,
    };

    this.sdk = new ChainBrawlerSDK(customConfig);
  }

  // Delegate all methods to the SDK
  getState() {
    return this.sdk.getState();
  }

  get actions() {
    return this.sdk.actions;
  }

  getStore() {
    return this.sdk.getStore();
  }

  getSDK() {
    return this.sdk;
  }

  // Initialize character data for a player
  async initializeCharacterForPlayer(playerAddress: string): Promise<void> {
    return this.sdk.initializeCharacterForPlayer(playerAddress);
  }

  cleanup() {
    this.sdk.cleanup();
  }

  // Update wallet client when wallet changes
  updateWalletClient(walletClient: WalletClient | undefined): void {
    // For now, we'll recreate the SDK with the new wallet client
    // In a real implementation, we'd update the contract client
    console.log("Wallet client updated:", walletClient?.account?.address);
  }
}

export class WebAdapter {
  private sdk: WebChainBrawlerSDK;

  constructor(config: ChainBrawlerConfig) {
    this.sdk = new WebChainBrawlerSDK(config);

    // Set player address from wallet client if available
    const walletClient = (config as any).walletClient;
    if (walletClient?.account?.address) {
      console.log(
        "WebAdapter: Constructor - setting player address:",
        walletClient.account.address
      );
      this.sdk.getSDK().setPlayerAddress(walletClient.account.address);

      // Check for existing character data on startup - do this asynchronously
      setTimeout(() => {
        this.initializeCharacterData(walletClient.account.address);
      }, 100); // Small delay to ensure SDK is fully initialized
    } else {
      console.log("WebAdapter: Constructor - no wallet client or address available");
    }
  }

  // Get the current state
  getState(): UXState {
    return this.sdk.getState();
  }

  // Subscribe to state changes - use the SDK's store
  subscribe(callback: (state: UXState) => void): () => void {
    // Get the store from the SDK and subscribe to it
    const store = this.sdk.getStore();
    return store.subscribe(callback);
  }

  // Update wallet connection
  async updateWalletClient(walletClient: WalletClient | undefined): Promise<void> {
    console.log("WebAdapter: updateWalletClient called with:", walletClient?.account?.address);
    this.sdk.updateWalletClient(walletClient);

    // Also update player address from wallet client
    if (walletClient?.account?.address) {
      console.log(
        "WebAdapter: Setting player address and loading character data for:",
        walletClient.account.address
      );
      this.sdk.getSDK().setPlayerAddress(walletClient.account.address);

      // Check for existing character data when wallet changes
      await this.initializeCharacterData(walletClient.account.address);
    } else {
      console.log("WebAdapter: No wallet client or address - clearing player data");
      this.sdk.getSDK().setPlayerAddress(undefined);
      // Clear character data when wallet disconnects
      const store = this.sdk.getStore();
      store.updateCharacter(null);
      store.setStatusMessage("Connect wallet to continue");
    }
  }

  // Initialize character data on startup or wallet change
  private async initializeCharacterData(playerAddress: string): Promise<void> {
    try {
      console.log("WebAdapter: Initializing character data for player:", playerAddress);
      // Use the SDK's character initialization method
      await this.sdk.initializeCharacterForPlayer(playerAddress);
      console.log("WebAdapter: Character data initialization completed");
    } catch (error) {
      console.error("WebAdapter: Failed to initialize character data:", error);
      // Set error state so UI can show the issue
      const store = this.sdk.getStore();
      store.setError(`Failed to load character: ${error}`);
    }
  }

  // Refresh character data after transactions
  async refreshCharacterData(playerAddress: string): Promise<void> {
    try {
      console.log("WebAdapter: Refreshing character data for player:", playerAddress);
      // Use the SDK's character refresh method
      await this.sdk.initializeCharacterForPlayer(playerAddress);
      console.log("WebAdapter: Character data refresh completed");
    } catch (error) {
      console.error("WebAdapter: Failed to refresh character data:", error);
      // Set error state so UI can show the issue
      const store = this.sdk.getStore();
      store.setError(`Failed to refresh character: ${error}`);
    }
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

  async fightEnemy(enemyId: number, enemyLevel: number) {
    return this.sdk.actions.fightEnemy(enemyId, enemyLevel);
  }

  async continueFight() {
    return this.sdk.actions.continueFight();
  }

  async fleeRound() {
    return this.sdk.actions.fleeRound();
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
    const store = this.sdk.getStore();
    store.setError(null);
  }

  async getXPRequiredForLevel(level: number): Promise<number> {
    const contractClient = (this.sdk as any).contractClient;
    const xpRequired = await contractClient.getXPRequiredForLevel(level);
    return Number(xpRequired);
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

  // Expose SDK for hooks
  getSDK() {
    return this.sdk.getSDK();
  }

  // Expose actions for hooks
  get actions() {
    return this.sdk.actions;
  }

  // Calculate menu state based on character
  private calculateMenuState(character: any): any {
    if (!character) {
      return {
        canCreateCharacter: true,
        canAct: false,
        canFight: false,
        canHeal: false,
        canResurrect: false,
        canContinueFight: false,
        canFlee: false,
        canViewPools: true,
        canViewLeaderboard: true,
        canViewClaims: false,
        canClaimPrize: false,
        availableActions: ["createCharacter"],
        disabledActions: [],
        disabledReasons: {},
      };
    }

    return {
      canCreateCharacter: false,
      canAct: character.isAlive && !character.inCombat,
      canFight: character.isAlive && !character.inCombat,
      canHeal: character.isAlive && !character.inCombat,
      canResurrect: !character.isAlive,
      canContinueFight: character.inCombat,
      canFlee: character.inCombat,
      canViewPools: true,
      canViewLeaderboard: true,
      canViewClaims: true,
      canClaimPrize: true,
      availableActions: this.getAvailableActions(character),
      disabledActions: this.getDisabledActions(character),
      disabledReasons: this.getDisabledReasons(character),
    };
  }

  private getAvailableActions(character: any): string[] {
    const actions = ["viewPools", "viewLeaderboard", "viewClaims"];

    if (character.isAlive && !character.inCombat) {
      actions.push("fight", "heal");
    }

    if (!character.isAlive) {
      actions.push("resurrect");
    }

    if (character.inCombat) {
      actions.push("continueFight", "flee");
    }

    return actions;
  }

  private getDisabledActions(character: any): string[] {
    const disabled = [];

    if (!character.isAlive) {
      disabled.push("fight", "heal");
    }

    if (character.inCombat) {
      disabled.push("heal", "resurrect");
    }

    if (character.isAlive && !character.inCombat) {
      disabled.push("resurrect", "continueFight", "flee");
    }

    return disabled;
  }

  private getDisabledReasons(character: any): Record<string, string> {
    const reasons: Record<string, string> = {};

    if (!character.isAlive) {
      reasons.fight = "Character is dead";
      reasons.heal = "Character is dead";
    }

    if (character.inCombat) {
      reasons.heal = "Character is in combat";
      reasons.resurrect = "Character is in combat";
    }

    if (character.isAlive && !character.inCombat) {
      reasons.resurrect = "Character is alive";
      reasons.continueFight = "Character is not in combat";
      reasons.flee = "Character is not in combat";
    }

    return reasons;
  }
}
