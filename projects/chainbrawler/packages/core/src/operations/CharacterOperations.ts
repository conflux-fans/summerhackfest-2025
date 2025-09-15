// Character operations - create, get, heal, resurrect
// Based on UX_STATE_MANAGEMENT_SPEC.md and CONTRACT_REFERENCE.md

import type { ContractClient } from "../contract/ContractClient";
import { CharacterStateManager } from "../managers/CharacterStateManager";
import type { CharacterData, OperationResult, ValidationResult } from "../types";
import { getCharacterClassName } from "../utils/CharacterUtils";
import { MenuStateCalculator } from "../utils/MenuStateCalculator";
import { BaseOperation } from "./BaseOperation";

export class CharacterOperations extends BaseOperation {
  private sdk: any; // ChainBrawlerSDK instance
  private characterStateManager: CharacterStateManager;

  constructor(
    store: any,
    contractClient: ContractClient,
    eventEmitter: any,
    sdk: any,
    logger?: any
  ) {
    super(store, contractClient, eventEmitter, logger);
    this.sdk = sdk;
    this.characterStateManager = new CharacterStateManager(store, contractClient, eventEmitter);
  }

  // Create character
  async createCharacter(classId: number): Promise<OperationResult<CharacterData>> {
    if (!this.canStartOperation("createCharacter")) {
      return { success: false, error: "Cannot start operation" };
    }

    this.startOperation("createCharacter", { classId });
    this.store.setStatusMessage("Creating character...");

    try {
      // Get creation fee
      const creationFee = await this.contractClient.getCreationFee();

      // Call contract method
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.createCharacter(classId, creationFee);
      });

      if (!result.success) {
        console.error("CharacterOperations.createCharacter: Contract call failed:", result.error);
        this.failOperation(result.error || "Character creation failed");
        return { success: false, error: result.error || "Character creation failed" };
      }

      // Update character data - try to get player address from wallet client
      const playerAddress = this.sdk.getPlayerAddress();
      let character = null;

      if (playerAddress) {
        // Use CharacterStateManager to refresh character data
        await this.characterStateManager.refreshCharacter(playerAddress);
        character = this.characterStateManager.getCharacterData();
      } else {
        // Still update menu state to show character exists
        this.store.updateMenu(this.calculateMenuState({ exists: true, isAlive: true } as any));
      }

      this.completeOperation();
      this.store.setStatusMessage("Character created successfully");

      return { success: true, data: character || undefined };
    } catch (error) {
      this.failOperation("Character creation failed");
      return { success: false, error: "Character creation failed" };
    }
  }

  // Get character data
  async getCharacter(playerAddress: string): Promise<CharacterData | null> {
    try {
      // Use CharacterStateManager to load character data
      const character = await this.characterStateManager.loadCharacter(playerAddress);
      return character;
    } catch (error) {
      console.error("Failed to get character:", error);
      return null;
    }
  }

  // Heal character
  async healCharacter(): Promise<OperationResult<void>> {
    if (!this.canStartOperation("healCharacter")) {
      return { success: false, error: "Cannot start operation" };
    }

    this.startOperation("healCharacter");
    this.store.setStatusMessage("Healing character...");

    try {
      const healingFee = await this.contractClient.getHealingFee();
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.healCharacter(healingFee);
      });

      if (!result.success) {
        this.failOperation(result.error || "Healing failed");
        return { success: false, error: result.error || "Healing failed" };
      }

      // Refresh character data
      const playerAddress = this.sdk.getPlayerAddress();
      if (playerAddress) {
        const character = await this.getCharacter(playerAddress);
        this.store.updateCharacter(character || undefined);
        this.store.updateMenu(this.calculateMenuState(character));
      }

      this.completeOperation();
      this.store.setStatusMessage("Character healed successfully");

      return { success: true };
    } catch (error) {
      this.failOperation("Healing failed");
      return { success: false, error: "Healing failed" };
    }
  }

  // Resurrect character
  async resurrectCharacter(): Promise<OperationResult<void>> {
    if (!this.canStartOperation("resurrectCharacter")) {
      return { success: false, error: "Cannot start operation" };
    }

    this.startOperation("resurrectCharacter");
    this.store.setStatusMessage("Resurrecting character...");

    try {
      const resurrectionFee = await this.contractClient.getResurrectionFee();
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.resurrectCharacter(resurrectionFee);
      });

      if (!result.success) {
        this.failOperation(result.error || "Resurrection failed");
        return { success: false, error: result.error || "Resurrection failed" };
      }

      // Refresh character data
      const playerAddress = this.sdk.getPlayerAddress();
      if (playerAddress) {
        const character = await this.getCharacter(playerAddress);
        this.store.updateCharacter(character || undefined);
        this.store.updateMenu(this.calculateMenuState(character));
      }

      this.completeOperation();
      this.store.setStatusMessage("Character resurrected successfully");

      return { success: true };
    } catch (error) {
      this.failOperation("Resurrection failed");
      return { success: false, error: "Resurrection failed" };
    }
  }

  // Check if character can heal
  async canHeal(playerAddress: string): Promise<ValidationResult> {
    try {
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.canHeal(playerAddress as `0x${string}`);
      });

      if (!result.success) {
        return { valid: false, reason: result.error };
      }

      const data = result.data;
      if (!data) {
        return { valid: false, reason: "No data returned" };
      }
      return { valid: data.canHeal, reason: data.canHeal ? undefined : data.reason };
    } catch (error) {
      return { valid: false, reason: "Failed to check heal status" };
    }
  }

  // Check if character can resurrect
  async canResurrect(playerAddress: string): Promise<ValidationResult> {
    try {
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.canResurrect(playerAddress as `0x${string}`);
      });

      if (!result.success) {
        return { valid: false, reason: result.error };
      }

      const data = result.data;
      if (!data) {
        return { valid: false, reason: "No data returned" };
      }
      return { valid: data.canResurrect, reason: data.canResurrect ? undefined : data.reason };
    } catch (error) {
      return { valid: false, reason: "Failed to check resurrect status" };
    }
  }

  // Parse character data from contract
  private parseCharacterData(contractData: any): CharacterData {
    // Convert BigInt values to numbers for percentage calculation
    const currentEndurance = Number(contractData.currentEndurance);
    const maxEndurance = Number(contractData.maxEndurance);
    const percentage = maxEndurance > 0 ? (currentEndurance / maxEndurance) * 100 : 0;

    return {
      exists: Number(contractData.characterClass) > 0,
      isAlive: Boolean(contractData.aliveFlag),
      class: Number(contractData.characterClass),
      className: this.getClassName(Number(contractData.characterClass)),
      level: Number(contractData.level),
      experience: Number(contractData.experience),
      endurance: {
        current: Number(contractData.currentEndurance),
        max: Number(contractData.maxEndurance),
        percentage: percentage,
      },
      stats: {
        combat: Number(contractData.totalCombat),
        defense: Number(contractData.totalDefense),
        luck: Number(contractData.totalLuck),
      },
      equipment: [
        {
          combat: Number(contractData.equippedCombatBonus),
          endurance: Number(contractData.equippedEnduranceBonus),
          defense: Number(contractData.equippedDefenseBonus),
          luck: Number(contractData.equippedLuckBonus),
        },
      ],
      inCombat: false, // Will be updated by combat check
      totalKills: Number(contractData.totalKills),
    };
  }

  // Get class name from class ID
  private getClassName(classId: number): string {
    return getCharacterClassName(classId);
  }

  // Character validation methods
  validateCharacterForAction(action: string): ValidationResult {
    return this.characterStateManager.validateCharacterForAction(action);
  }

  canCharacterAct(): boolean {
    return this.characterStateManager.canCharacterAct();
  }

  getCharacterStatusMessage(): string {
    return this.characterStateManager.getCharacterStatusMessage();
  }

  hasCharacter(): boolean {
    return this.characterStateManager.hasCharacter();
  }

  isCharacterAlive(): boolean {
    return this.characterStateManager.isCharacterAlive();
  }

  isCharacterInCombat(): boolean {
    return this.characterStateManager.isCharacterInCombat();
  }

  // Calculate menu state based on character
  public calculateMenuState(character: CharacterData | null): any {
    return MenuStateCalculator.calculateMenuState(character, {
      operation: this.store.getOperation(),
      healingCooldownRemaining: 0, // TODO: Get from contract
    });
  }
}
