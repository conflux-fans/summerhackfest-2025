// Main ChainBrawler SDK - orchestrates all operations
// Based on REFACTORING_PLAN.md and UX_STATE_MANAGEMENT_SPEC.md

import type { ContractClient } from "./contract/ContractClient";
import { WagmiContractClient } from "./contract/WagmiContractClient";
import { EventEmitter } from "./events/EventEmitter";
import { EventHandler } from "./events/EventHandler";
import { getContractAddresses } from "./generated/contractAddresses";
import { CharacterOperations } from "./operations/CharacterOperations";
import { ClaimsOperations } from "./operations/ClaimsOperations";
import { CombatOperations } from "./operations/CombatOperations";
import { LeaderboardOperations } from "./operations/LeaderboardOperations";
import { PoolsOperations } from "./operations/PoolsOperations";
import { UXStore } from "./state/UXStore";
import { type ChainBrawlerConfig, EventType, type FightSummaryData, type UXState } from "./types";
import {
  FightDataNormalizer,
  type RawEquipmentDrop,
  type RawFightSummaryEvent,
} from "./utils/FightDataNormalizer";

export class ChainBrawlerSDK {
  private store: UXStore;
  private characterOps: CharacterOperations;
  private combatOps: CombatOperations;
  private poolsOps: PoolsOperations;
  private leaderboardOps: LeaderboardOperations;
  private claimsOps: ClaimsOperations;
  private contractClient: ContractClient;
  private eventEmitter: EventEmitter;
  private eventHandler: EventHandler;
  private playerAddress: string | undefined;

  constructor(config: ChainBrawlerConfig, logger?: any) {
    this.store = new UXStore();
    this.contractClient = config.contractClient || this.createContractClient(config);
    this.eventEmitter = new EventEmitter();
    this.eventHandler = new EventHandler(this.store, this.eventEmitter);

    // Initialize operations
    this.characterOps = new CharacterOperations(
      this.store,
      this.contractClient,
      this.eventEmitter,
      this,
      logger
    );

    this.combatOps = new CombatOperations(
      this.store,
      this.contractClient,
      this.eventEmitter,
      logger
    );

    this.poolsOps = new PoolsOperations(this.store, this.contractClient, this.eventEmitter, logger);

    this.leaderboardOps = new LeaderboardOperations(
      this.store,
      this.contractClient,
      this.eventEmitter,
      logger
    );

    this.claimsOps = new ClaimsOperations(
      this.store,
      this.contractClient,
      this.eventEmitter,
      logger
    );

    // Initialize SDK
    this.initialize();
  }

  // Initialize the SDK
  private async initialize(): Promise<void> {
    this.store.setLoading(true);
    this.store.setStatusMessage("Initializing SDK...");

    try {
      // Set loading to false before loading data to allow operations
      this.store.setLoading(false);
      this.store.setStatusMessage("Loading initial data...");

      // Initialize event watchers
      this.initializeEventWatchers();

      // Load initial data
      await this.loadInitialData();

      this.store.setStatusMessage("SDK ready");
    } catch (error) {
      this.store.setLoading(false);
      this.store.setError("Failed to initialize SDK");
      this.store.setStatusMessage("SDK initialization failed");
    }
  }

  // Initialize contract event watchers
  private initializeEventWatchers(): void {
    try {
      // Watch for fight summary events
      this.contractClient.watchFightSummaryEvent((logs) => {
        logs.forEach((log) => {
          console.log("FightSummary event received:", log);

          // Convert raw contract data to normalized format
          const rawFightData: RawFightSummaryEvent = {
            enemyId: log.args.enemyId,
            enemyLevel: log.args.enemyLevel,
            roundsElapsed: log.args.roundsElapsed,
            playerStartEndurance: log.args.playerStartEndurance,
            playerEndurance: log.args.playerEndurance,
            enemyStartEndurance: log.args.enemyStartEndurance,
            enemyEndurance: log.args.enemyEndurance,
            victory: log.args.victory,
            unresolved: log.args.unresolved,
            roundNumbers: log.args.roundNumbers || [],
            playerDamages: log.args.playerDamages || [],
            enemyDamages: log.args.enemyDamages || [],
            playerCriticals: log.args.playerCriticals || [],
            enemyCriticals: log.args.enemyCriticals || [],
            xpGained: log.args.xpGained,
            difficultyMultiplier: (log.args as any).difficultyMultiplier || 1.0,
          };

          // Normalize equipment drop if present
          const rawEquipmentDrop: RawEquipmentDrop | undefined = (log.args as any).equipmentDropped
            ? {
                bonuses: Array.isArray((log.args as any).equipmentDropped)
                  ? (log.args as any).equipmentDropped
                  : [
                      (log.args as any).equipmentDropped.combat || 0,
                      (log.args as any).equipmentDropped.endurance || 0,
                      (log.args as any).equipmentDropped.defense || 0,
                      (log.args as any).equipmentDropped.luck || 0,
                    ],
                description: `Equipment: +${(log.args as any).equipmentDropped.combat || 0} Combat, +${(log.args as any).equipmentDropped.defense || 0} Defense, +${(log.args as any).equipmentDropped.luck || 0} Luck`,
              }
            : undefined;

          // Use the normalizer to create comprehensive fight summary data
          const normalizedFightSummary = FightDataNormalizer.normalizeFightSummary(
            rawFightData,
            rawEquipmentDrop
          );

          // Store in UX state and emit internal event (normalize BigInt values)
          this.store.setLastFightSummary(
            FightDataNormalizer.normalizeBigInts(normalizedFightSummary)
          );
          this.eventEmitter.emit(
            EventType.FIGHT_COMPLETED,
            FightDataNormalizer.normalizeBigInts(normalizedFightSummary)
          );

          // Refresh character data after fight completion to reflect new state
          this.refreshCharacterAfterFight(normalizedFightSummary);
        });
      });

      // Watch for character healed events
      this.contractClient.watchCharacterHealedEvent((logs) => {
        logs.forEach((log) => {
          console.log("CharacterHealed event received:", log);
          const healingData = {
            newEndurance: log.args.newEndurance,
            cost: 0n, // Will be calculated from transaction
          };

          this.store.setLastHealing(healingData);
          this.eventEmitter.emit(EventType.HEALING_COMPLETED, healingData);
        });
      });

      // Watch for character resurrected events
      this.contractClient.watchCharacterResurrectedEvent((logs) => {
        logs.forEach((log) => {
          console.log("CharacterResurrected event received:", log);
          const resurrectionData = {
            newEndurance: 100, // Resurrection restores to full health
            cost: 0n, // Will be calculated from transaction
          };

          this.store.setLastResurrection(resurrectionData);
          this.eventEmitter.emit(EventType.RESURRECTION_COMPLETED, resurrectionData);
        });
      });

      // Watch for equipment dropped events
      this.contractClient.watchEquipmentDroppedEvent((logs) => {
        logs.forEach((log) => {
          console.log("EquipmentDropped event received:", log);
          const equipmentData = {
            combat: log.args.bonuses[0],
            endurance: log.args.bonuses[1],
            defense: log.args.bonuses[2],
            luck: log.args.bonuses[3],
          };

          // Update the last fight summary with equipment drop
          const lastFight = this.store.getState().lastFightSummary;
          if (lastFight) {
            lastFight.equipmentDropped = equipmentData;
            this.store.setLastFightSummary(lastFight);
          }
        });
      });
    } catch (error) {
      console.warn("Failed to initialize event watchers:", error);
      // Non-critical error, don't fail SDK initialization
    }
  }

  // Load initial data
  private async loadInitialData(): Promise<void> {
    try {
      // Load pools data (no player address needed)
      await this.poolsOps.loadPools();

      // Set initial menu state for no character
      this.store.updateMenu(this.characterOps.calculateMenuState(null));

      // Set initial status message
      this.store.setStatusMessage("Ready for action");

      // Note: Character, leaderboard, and claims data require a player address
      // These will be loaded when a player address is set via the actions
    } catch (error) {
      console.error("ChainBrawlerSDK.loadInitialData: Failed to load initial data:", error);
      this.store.setError(`Failed to load initial data: ${error}`);
    }
  }

  // Create contract client (to be implemented by adapters)
  protected createContractClient(config: ChainBrawlerConfig): ContractClient {
    if (!config.address || !config.chain || !config.publicClient || !config.wagmiConfig) {
      throw new Error("Missing required configuration for contract client");
    }

    console.log("ChainBrawlerSDK: Creating contract client with config:", {
      address: config.address,
      chainId: config.chain.id,
      hasPublicClient: !!config.publicClient,
      hasWalletClient: !!config.walletClient,
      walletClientAccount: config.walletClient?.account?.address,
      hasWagmiConfig: !!config.wagmiConfig,
    });

    const addresses = getContractAddresses(config.chain.id);
    return new WagmiContractClient(
      addresses.chainBrawler,
      config.chain.id,
      config.publicClient,
      config.walletClient,
      config.wagmiConfig
    );
  }

  // Get event emitter for external use
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  // Get store for external use (for adapters)
  getStore(): UXStore {
    return this.store;
  }

  // Set player address
  setPlayerAddress(address: string | undefined): void {
    this.playerAddress = address;
    this.store.setPlayerAddress(address || null);
  }

  // Get player address
  getPlayerAddress(): string | undefined {
    return this.playerAddress;
  }

  // Public API - State access
  getState(): UXState {
    return this.store.getState();
  }

  getCharacter() {
    return this.store.getCharacter();
  }

  getMenu() {
    return this.store.getMenu();
  }

  getOperation() {
    return this.store.getOperation();
  }

  getPools() {
    return this.store.getPools();
  }

  getLeaderboard() {
    return this.store.getLeaderboard();
  }

  getClaims() {
    return this.store.getClaims();
  }

  getStatusMessage() {
    return this.store.getStatusMessage();
  }

  isLoading() {
    return this.store.isLoading();
  }

  getError() {
    return this.store.getError();
  }

  // Public API - Actions
  get actions() {
    return {
      // Character actions
      createCharacter: (classId: number) => this.characterOps.createCharacter(classId),
      getCharacter: (playerAddress: string) => this.characterOps.getCharacter(playerAddress),
      healCharacter: () => this.characterOps.healCharacter(),
      resurrectCharacter: () => this.characterOps.resurrectCharacter(),
      canHeal: (playerAddress: string) => this.characterOps.canHeal(playerAddress),
      canResurrect: (playerAddress: string) => this.characterOps.canResurrect(playerAddress),

      // Combat actions
      fightEnemy: (enemyId: number, enemyLevel: number) =>
        this.combatOps.fightEnemy(enemyId, enemyLevel),
      continueFight: () => this.combatOps.continueFight(),
      fleeRound: () => this.combatOps.fleeRound(),
      isCharacterInCombat: (playerAddress: string) =>
        this.combatOps.isCharacterInCombat(playerAddress),
      getCombatState: (playerAddress: string) => this.combatOps.getCombatState(playerAddress),
      getEnemyStats: (enemyId: number, enemyLevel: number) =>
        this.combatOps.getEnemyStats(enemyId, enemyLevel),

      // Pools actions
      loadPools: () => this.poolsOps.loadPools(),
      refreshPools: () => this.poolsOps.refreshPools(),

      // Leaderboard actions
      loadLeaderboard: (playerAddress: string) =>
        this.leaderboardOps.loadLeaderboard(playerAddress),
      refreshLeaderboard: (playerAddress: string) =>
        this.leaderboardOps.refreshLeaderboard(playerAddress),
      getCurrentEpoch: () => this.leaderboardOps.getCurrentEpoch(),
      getEpochScore: (playerAddress: string, epoch: bigint) =>
        this.leaderboardOps.getEpochScore(playerAddress, epoch),
      getTotalPlayerCount: () => this.leaderboardOps.getTotalPlayerCount(),
      getPlayerRank: (playerAddress: string, epoch: bigint) =>
        this.leaderboardOps.getPlayerRank(playerAddress, epoch),

      // Claims actions
      loadClaims: (playerAddress: string) => this.claimsOps.loadClaims(playerAddress),
      refreshClaims: (playerAddress: string) => this.claimsOps.refreshClaims(playerAddress),
      claimPrize: (epoch: bigint, index: bigint, amount: bigint, proof: string[]) =>
        this.claimsOps.claimPrize(epoch, index, amount, proof),
      isClaimed: (epoch: bigint, index: bigint) => this.claimsOps.isClaimed(epoch, index),
      getMerkleProof: (playerAddress: string, epoch: bigint) =>
        this.claimsOps.getMerkleProof(playerAddress, epoch),

      // Utility actions
      refreshAll: async (playerAddress?: string) => {
        const promises: Promise<any>[] = [this.poolsOps.refreshPools()];

        if (playerAddress) {
          promises.push(
            this.leaderboardOps.refreshLeaderboard(playerAddress),
            this.claimsOps.refreshClaims(playerAddress)
          );
        }

        await Promise.all(promises);
        return { success: true };
      },
    };
  }

  // Public API - Operations access
  get operations() {
    return {
      character: this.characterOps,
      combat: this.combatOps,
      pools: this.poolsOps,
      leaderboard: this.leaderboardOps,
      claims: this.claimsOps,
    };
  }

  // Public API - Event subscription
  subscribe(listener: (state: UXState) => void): () => void {
    return this.store.subscribe(listener);
  }

  // Public API - Utility methods
  clearError(): void {
    this.store.clearError();
  }

  reset(): void {
    this.store.reset();
  }

  // Initialize character data for a player
  async initializeCharacterForPlayer(playerAddress: string): Promise<void> {
    const startTime = Date.now();
    const minLoadingDuration = 1000; // Minimum 1 second loading time

    try {
      console.log("ChainBrawlerSDK: Initializing character for player:", playerAddress);
      this.store.setPlayerAddress(playerAddress);
      this.store.setStatusMessage("Loading character data...");

      // Load character data
      console.log("ChainBrawlerSDK: Calling characterOps.getCharacter...");
      const character = await this.characterOps.getCharacter(playerAddress);
      console.log("ChainBrawlerSDK: Character data received:", character);

      if (character) {
        console.log("ChainBrawlerSDK: Character exists, setting ready status");
        this.store.setStatusMessage("Character ready for action");
      } else {
        console.log("ChainBrawlerSDK: No character found, setting create status");
        this.store.setStatusMessage("Ready to create character");
      }

      // Load other player-specific data
      console.log("ChainBrawlerSDK: Loading additional player data...");
      await Promise.all([
        this.leaderboardOps.loadLeaderboard(playerAddress),
        this.claimsOps.loadClaims(playerAddress),
      ]);

      console.log("ChainBrawlerSDK: Player initialization complete");

      // Ensure minimum loading duration for better UX
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingDuration - elapsedTime);

      if (remainingTime > 0) {
        console.log(
          `ChainBrawlerSDK: Waiting ${remainingTime}ms to ensure loading screen is visible`
        );
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      // Set loading to false after successful initialization
      this.store.setLoading(false);
    } catch (error) {
      console.error("ChainBrawlerSDK: Failed to initialize character for player:", error);
      this.store.setError(`Failed to initialize character: ${error}`);

      // Ensure minimum loading duration even on error
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingDuration - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      // Also set loading to false on error
      this.store.setLoading(false);
    }
  }

  // Refresh character data after fight completion
  private async refreshCharacterAfterFight(fightSummary: FightSummaryData): Promise<void> {
    try {
      const playerAddress = this.getPlayerAddress();
      if (!playerAddress) {
        console.warn("ChainBrawlerSDK: No player address available for character refresh");
        return;
      }

      console.log("ChainBrawlerSDK: Refreshing character data after fight completion");

      // Get fresh character data from contract
      const character = await this.characterOps.getCharacter(playerAddress);
      if (character) {
        // Update character in store
        this.store.updateCharacter(character);

        // Update menu state based on new character data
        const menuState = this.characterOps.calculateMenuState(character);
        this.store.updateMenu(menuState);

        console.log("ChainBrawlerSDK: Character data refreshed successfully", {
          isAlive: character.isAlive,
          inCombat: character.inCombat,
          endurance: character.endurance,
        });
      } else {
        console.warn("ChainBrawlerSDK: Failed to get character data after fight");
      }
    } catch (error) {
      console.error("ChainBrawlerSDK: Failed to refresh character after fight:", error);
    }
  }

  // Cleanup
  cleanup(): void {
    this.store.reset();
    // Additional cleanup if needed
  }
}
