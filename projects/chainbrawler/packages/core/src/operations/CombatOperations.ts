/**
 * Combat Operations
 *
 * Handles combat-related operations including fighting enemies,
 * continuing fights, and fleeing from combat.
 */

import type { Address, Hash } from "viem";
import type { ContractClient } from "../contract/ContractClient";
import type { EventEmitter } from "../events/EventEmitter";
import type { UXStore } from "../state/UXStore";
import type { OperationResult } from "../types";
import { BaseOperation } from "./BaseOperation";

export class CombatOperations extends BaseOperation {
  constructor(
    store: UXStore,
    contractClient: ContractClient,
    eventEmitter: EventEmitter,
    logger?: any
  ) {
    super(store, contractClient, eventEmitter, logger);
  }

  /**
   * Fight an enemy
   */
  async fightEnemy(enemyId: number, enemyLevel: number): Promise<OperationResult<Hash>> {
    try {
      console.log("CombatOperations: fightEnemy called with:", { enemyId, enemyLevel });
      console.log("CombatOperations: contractClient type:", this.contractClient.constructor.name);

      this.store.setOperation({
        id: `fightEnemy-${Date.now()}`,
        type: "fightEnemy",
        status: "pending",
        message: `Fighting enemy ${enemyId} (level ${enemyLevel})...`,
      });

      // Validate enemy parameters
      if (enemyId < 1 || enemyId > 16) {
        throw new Error(`Invalid enemy ID: ${enemyId}. Must be between 1-16`);
      }

      if (enemyLevel < 1 || enemyLevel > 100) {
        throw new Error(`Invalid enemy level: ${enemyLevel}. Must be between 1-100`);
      }

      // Check if player is already in combat
      const playerAddress = this.store.getPlayerAddress();
      console.log("CombatOperations: playerAddress:", playerAddress);
      if (!playerAddress) {
        throw new Error("Player address not set");
      }

      console.log("CombatOperations: Checking if character is in combat...");
      const inCombat = await this.contractClient.isCharacterInCombat(playerAddress as Address);
      console.log("CombatOperations: inCombat result:", inCombat);
      if (inCombat) {
        throw new Error(
          "Character is already in combat. Use continueFight() or fleeRound() first."
        );
      }

      // Execute the fight
      console.log("CombatOperations: Calling contractClient.fightEnemy...");
      const hash = await this.contractClient.fightEnemy(enemyId, enemyLevel);
      console.log("CombatOperations: fightEnemy result hash:", hash);

      this.store.setOperation({
        id: `fightEnemy-${Date.now()}`,
        type: "fightEnemy",
        status: "success",
        message: `Fight started! Transaction: ${hash.slice(0, 10)}...`,
      });

      // Emit event
      this.eventEmitter.emit("fightEnemy:success", { enemyId, enemyLevel, hash });

      return { success: true, data: hash };
    } catch (error: any) {
      console.error("CombatOperations: fightEnemy error:", error);
      this.store.setOperation({
        id: `fightEnemy-${Date.now()}`,
        type: "fightEnemy",
        status: "error",
        message: `Fight failed: ${error.message}`,
      });

      this.eventEmitter.emit("fightEnemy:error", { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Continue an ongoing fight
   */
  async continueFight(): Promise<OperationResult<Hash>> {
    try {
      this.store.setOperation({
        id: `continueFight-${Date.now()}`,
        type: "continueFight",
        status: "pending",
        message: "Continuing fight...",
      });

      const playerAddress = this.store.getPlayerAddress();
      if (!playerAddress) {
        throw new Error("Player address not set");
      }

      // Check if player is in combat
      const inCombat = await this.contractClient.isCharacterInCombat(playerAddress as Address);
      if (!inCombat) {
        throw new Error("Character is not in combat");
      }

      // Execute the continue fight
      const hash = await this.contractClient.continueFight();

      this.store.setOperation({
        id: `continueFight-${Date.now()}`,
        type: "continueFight",
        status: "success",
        message: `Fight continued! Transaction: ${hash.slice(0, 10)}...`,
      });

      // Emit event
      this.eventEmitter.emit("continueFight:success", { hash });

      return { success: true, data: hash };
    } catch (error: any) {
      this.store.setOperation({
        id: `continueFight-${Date.now()}`,
        type: "continueFight",
        status: "error",
        message: `Continue fight failed: ${error.message}`,
      });

      this.eventEmitter.emit("continueFight:error", { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Flee from combat
   */
  async fleeRound(): Promise<OperationResult<Hash>> {
    try {
      this.store.setOperation({
        id: `fleeRound-${Date.now()}`,
        type: "fleeRound",
        status: "pending",
        message: "Fleeing from combat...",
      });

      const playerAddress = this.store.getPlayerAddress();
      if (!playerAddress) {
        throw new Error("Player address not set");
      }

      // Check if player is in combat
      const inCombat = await this.contractClient.isCharacterInCombat(playerAddress as Address);
      if (!inCombat) {
        throw new Error("Character is not in combat");
      }

      // Execute the flee
      const hash = await this.contractClient.fleeRound();

      this.store.setOperation({
        id: `fleeRound-${Date.now()}`,
        type: "fleeRound",
        status: "success",
        message: `Fled from combat! Transaction: ${hash.slice(0, 10)}...`,
      });

      // Emit event
      this.eventEmitter.emit("fleeRound:success", { hash });

      return { success: true, data: hash };
    } catch (error: any) {
      this.store.setOperation({
        id: `fleeRound-${Date.now()}`,
        type: "fleeRound",
        status: "error",
        message: `Flee failed: ${error.message}`,
      });

      this.eventEmitter.emit("fleeRound:error", { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if character is in combat
   */
  async isCharacterInCombat(playerAddress: string): Promise<OperationResult<boolean>> {
    try {
      const inCombat = await this.contractClient.isCharacterInCombat(playerAddress as Address);
      return { success: true, data: inCombat };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get combat state
   */
  async getCombatState(playerAddress: string): Promise<OperationResult<any>> {
    try {
      const combatState = await this.contractClient.getCombatState(playerAddress as Address);
      return { success: true, data: combatState };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get enemy stats
   */
  async getEnemyStats(enemyId: number, enemyLevel: number): Promise<OperationResult<any>> {
    try {
      const enemyStats = await this.contractClient.getScaledEnemyStats(enemyId, enemyLevel);
      return { success: true, data: enemyStats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
