// Event handler for processing contract events
// Based on UX_STATE_MANAGEMENT_SPEC.md

import {
  EquipmentDropData,
  EventType,
  type FightSummaryData,
  type HealingData,
  type ResurrectionData,
} from "../types";
import {
  FightDataNormalizer,
  type RawEquipmentDrop,
  type RawFightSummaryEvent,
} from "../utils/FightDataNormalizer";
import type { EventEmitter } from "./EventEmitter";

export class EventHandler {
  constructor(
    private store: any, // UXStore - avoiding circular dependency
    private eventEmitter: EventEmitter
  ) {
    this.subscribeToEvents();
  }

  // Subscribe to all events
  private subscribeToEvents(): void {
    this.eventEmitter.on(EventType.CHARACTER_CREATED, this.handleCharacterCreated.bind(this));
    this.eventEmitter.on(EventType.CHARACTER_UPDATED, this.handleCharacterUpdated.bind(this));
    this.eventEmitter.on(EventType.FIGHT_STARTED, this.handleFightStarted.bind(this));
    this.eventEmitter.on(EventType.FIGHT_COMPLETED, this.handleFightCompleted.bind(this));
    this.eventEmitter.on(EventType.HEALING_STARTED, this.handleHealingStarted.bind(this));
    this.eventEmitter.on(EventType.HEALING_COMPLETED, this.handleHealingCompleted.bind(this));
    this.eventEmitter.on(EventType.RESURRECTION_STARTED, this.handleResurrectionStarted.bind(this));
    this.eventEmitter.on(
      EventType.RESURRECTION_COMPLETED,
      this.handleResurrectionCompleted.bind(this)
    );
    this.eventEmitter.on(EventType.OPERATION_STARTED, this.handleOperationStarted.bind(this));
    this.eventEmitter.on(EventType.OPERATION_COMPLETED, this.handleOperationCompleted.bind(this));
    this.eventEmitter.on(EventType.OPERATION_FAILED, this.handleOperationFailed.bind(this));
    this.eventEmitter.on(EventType.POOLS_UPDATED, this.handlePoolsUpdated.bind(this));
    this.eventEmitter.on(EventType.LEADERBOARD_UPDATED, this.handleLeaderboardUpdated.bind(this));
    this.eventEmitter.on(EventType.CLAIMS_UPDATED, this.handleClaimsUpdated.bind(this));
    this.eventEmitter.on(EventType.CLAIM_STARTED, this.handleClaimStarted.bind(this));
    this.eventEmitter.on(EventType.CLAIM_COMPLETED, this.handleClaimCompleted.bind(this));
    this.eventEmitter.on(EventType.CLAIM_FAILED, this.handleClaimFailed.bind(this));
    this.eventEmitter.on(EventType.ERROR_OCCURRED, this.handleErrorOccurred.bind(this));
  }

  // Character events
  private handleCharacterCreated(data: any): void {
    this.store.setStatusMessage("Character created successfully");
    this.store.setLastFightSummary(undefined);
  }

  private handleCharacterUpdated(data: any): void {
    this.store.setStatusMessage("Character updated");
  }

  // Combat events
  private handleFightStarted(data: any): void {
    this.store.setStatusMessage("Fight started");
  }

  private handleFightCompleted(data: any): void {
    const fightSummary = this.processFightSummary(data);
    this.store.setLastFightSummary(fightSummary);
    this.store.setStatusMessage("Fight completed");
  }

  // Healing events
  private handleHealingStarted(data: any): void {
    this.store.setStatusMessage("Healing in progress...");
  }

  private handleHealingCompleted(data: any): void {
    const healingData = this.processHealingData(data);
    this.store.setLastHealing(healingData);
    this.store.setStatusMessage("Character healed successfully");
  }

  // Resurrection events
  private handleResurrectionStarted(data: any): void {
    this.store.setStatusMessage("Resurrection in progress...");
  }

  private handleResurrectionCompleted(data: any): void {
    const resurrectionData = this.processResurrectionData(data);
    this.store.setLastResurrection(resurrectionData);
    this.store.setStatusMessage("Character resurrected successfully");
  }

  // Operation events
  private handleOperationStarted(data: any): void {
    this.store.setStatusMessage("Operation started...");
  }

  private handleOperationCompleted(data: any): void {
    this.store.setStatusMessage("Operation completed");
  }

  private handleOperationFailed(data: any): void {
    this.store.setStatusMessage("Operation failed");
  }

  // Pools events
  private handlePoolsUpdated(data: any): void {
    this.store.setStatusMessage("Pools updated");
  }

  // Leaderboard events
  private handleLeaderboardUpdated(data: any): void {
    this.store.setStatusMessage("Leaderboard updated");
  }

  // Claims events
  private handleClaimsUpdated(data: any): void {
    this.store.setStatusMessage("Claims updated");
  }

  private handleClaimStarted(data: any): void {
    this.store.setStatusMessage("Claiming reward...");
  }

  private handleClaimCompleted(data: any): void {
    this.store.setStatusMessage("Reward claimed successfully");
  }

  private handleClaimFailed(data: any): void {
    this.store.setStatusMessage("Claim failed");
  }

  // Error events
  private handleErrorOccurred(data: any): void {
    this.store.setError(data.message);
    this.store.setStatusMessage(`Error: ${data.message}`);
  }

  // Process event data using comprehensive normalization
  private processFightSummary(data: any): FightSummaryData {
    // Convert raw data to normalized format
    const rawFightData: RawFightSummaryEvent = {
      enemyId: data.enemyId || 0,
      enemyLevel: data.enemyLevel || 0,
      roundsElapsed: data.roundsElapsed || 0,
      playerStartEndurance: data.playerStartEndurance || 0,
      playerEndurance: data.playerEndurance || 0,
      enemyStartEndurance: data.enemyStartEndurance || 0,
      enemyEndurance: data.enemyEndurance || 0,
      victory: data.victory || false,
      unresolved: data.unresolved || false,
      roundNumbers: data.roundNumbers || [],
      playerDamages: data.playerDamages || [],
      enemyDamages: data.enemyDamages || [],
      playerCriticals: data.playerCriticals || [],
      enemyCriticals: data.enemyCriticals || [],
      xpGained: data.xpGained || 0,
      difficultyMultiplier: data.difficultyMultiplier,
    };

    // Normalize equipment drop if present
    const rawEquipmentDrop: RawEquipmentDrop | undefined = data.equipmentDropped
      ? {
          bonuses: Array.isArray(data.equipmentDropped)
            ? data.equipmentDropped
            : data.equipmentDropped.bonuses || [],
          description: data.equipmentDropped.description,
        }
      : undefined;

    // Use the normalizer to create comprehensive fight summary data
    return FightDataNormalizer.normalizeFightSummary(rawFightData, rawEquipmentDrop);
  }

  private processHealingData(data: any): HealingData {
    return {
      newEndurance: data.newEndurance || 0,
      cost: data.cost || 0n,
    };
  }

  private processResurrectionData(data: any): ResurrectionData {
    return {
      newEndurance: data.newEndurance || 0,
      cost: data.cost || 0n,
    };
  }

  // Public methods for manual event emission
  emitCharacterCreated(characterData: any): void {
    this.eventEmitter.emit(EventType.CHARACTER_CREATED, characterData);
  }

  emitFightCompleted(fightData: any): void {
    this.eventEmitter.emit(EventType.FIGHT_COMPLETED, fightData);
  }

  emitHealingCompleted(healingData: any): void {
    this.eventEmitter.emit(EventType.HEALING_COMPLETED, healingData);
  }

  emitResurrectionCompleted(resurrectionData: any): void {
    this.eventEmitter.emit(EventType.RESURRECTION_COMPLETED, resurrectionData);
  }

  emitPoolsUpdated(poolsData: any): void {
    this.eventEmitter.emit(EventType.POOLS_UPDATED, poolsData);
  }

  emitLeaderboardUpdated(leaderboardData: any): void {
    this.eventEmitter.emit(EventType.LEADERBOARD_UPDATED, leaderboardData);
  }

  emitClaimsUpdated(claimsData: any): void {
    this.eventEmitter.emit(EventType.CLAIMS_UPDATED, claimsData);
  }

  emitError(error: any): void {
    this.eventEmitter.emit(EventType.ERROR_OCCURRED, error);
  }
}
