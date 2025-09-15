// Character State Manager - handles all character-related UX state
// Based on UX_STATE_MANAGEMENT_SPEC.md

import type { ContractClient } from "../contract/ContractClient";
import type { EventEmitter } from "../events/EventEmitter";
import type { UXStore } from "../state/UXStore";
import { type CharacterData, OperationState, type ValidationResult } from "../types";
import { EventType } from "../types/EventType";
import { StatusMessageType } from "../types/StatusMessageType";
import { MenuStateCalculator } from "../utils/MenuStateCalculator";

export class CharacterStateManager {
  constructor(
    private store: UXStore,
    private contractClient: ContractClient,
    private eventEmitter: EventEmitter
  ) {}

  // Character data methods
  async loadCharacter(player: string): Promise<CharacterData | null> {
    try {
      console.log("CharacterStateManager: Loading character for player:", player);
      this.store.setStatusMessage("Loading character data...");

      const character = await this.contractClient.getCharacter(player as `0x${string}`);
      console.log("CharacterStateManager: Contract returned character data:", character);

      if (character) {
        const parsedCharacter = this.parseCharacterData(character);
        console.log("CharacterStateManager: Parsed character data:", parsedCharacter);

        // Check combat state if character exists and is alive
        if (parsedCharacter.exists && parsedCharacter.isAlive) {
          try {
            console.log("CharacterStateManager: Checking combat state for player:", player);
            const combatState = await this.contractClient.getCombatState(player as `0x${string}`);
            console.log("CharacterStateManager: Combat state result:", combatState);

            // Update inCombat flag based on combat state
            if (combatState && combatState.enemyId > 0) {
              parsedCharacter.inCombat = true;
              parsedCharacter.combatState = {
                enemyId: combatState.enemyId,
                enemyLevel: combatState.enemyLevel,
                enemyCurrentEndurance: combatState.enemyCurrentEndurance,
                playerCurrentEndurance: combatState.playerCurrentEndurance,
                roundsElapsed: combatState.roundsElapsed,
                playerStartEndurance: combatState.playerStartEndurance,
                enemyStartEndurance: combatState.enemyStartEndurance,
                lastUpdated: combatState.lastUpdated,
                difficultyMultiplier: combatState.difficultyMultiplier,
              };
              console.log(
                "CharacterStateManager: Character is in combat:",
                parsedCharacter.combatState
              );
            } else {
              parsedCharacter.inCombat = false;
              parsedCharacter.combatState = undefined;
              console.log("CharacterStateManager: Character is not in combat");
            }
          } catch (error) {
            console.warn("CharacterStateManager: Failed to get combat state:", error);
            // If combat state check fails, assume not in combat
            parsedCharacter.inCombat = false;
            parsedCharacter.combatState = undefined;
          }
        }

        this.store.updateCharacter(parsedCharacter);
        this.store.setStatusMessage(StatusMessageType.CHARACTER_EXISTS);

        // Update menu state based on character (including combat state)
        this.updateMenuState(parsedCharacter);

        return parsedCharacter;
      } else {
        console.log("CharacterStateManager: No character found for player");
        this.store.updateCharacter(null);
        this.store.setStatusMessage(StatusMessageType.READY);

        // Update menu state for no character
        this.updateMenuState(null);

        return null;
      }
    } catch (error) {
      console.error("CharacterStateManager: Failed to load character:", error);
      this.store.setError(`Failed to load character: ${error}`);
      return null;
    }
  }

  async refreshCharacter(player: string): Promise<void> {
    try {
      const character = await this.loadCharacter(player);
      if (character) {
        this.updateMenuState(character);
        this.eventEmitter.emit("characterUpdated" as any, character);
      }
    } catch (error) {
      console.error("Failed to refresh character:", error);
    }
  }

  getCharacterData(): CharacterData | null {
    return this.store.getCharacter();
  }

  hasCharacter(): boolean {
    const character = this.store.getCharacter();
    return character?.exists || false;
  }

  isCharacterAlive(): boolean {
    const character = this.store.getCharacter();
    return Boolean(character?.isAlive);
  }

  isCharacterInCombat(): boolean {
    const character = this.store.getCharacter();
    return Boolean(character?.inCombat);
  }

  // Character state updates
  updateCharacterFromContract(data: any): CharacterData {
    const parsedCharacter = this.parseCharacterData(data);
    this.store.updateCharacter(parsedCharacter);
    this.updateMenuState(parsedCharacter);
    return parsedCharacter;
  }

  updateCharacterStats(stats: { combat: number; defense: number; luck: number }): void {
    const character = this.store.getCharacter();
    if (character) {
      const updatedCharacter = {
        ...character,
        stats: { ...character.stats, ...stats },
      };
      this.store.updateCharacter(updatedCharacter);
      this.updateMenuState(updatedCharacter);
    }
  }

  updateCharacterEndurance(endurance: { current: number; max: number; percentage: number }): void {
    const character = this.store.getCharacter();
    if (character) {
      const updatedCharacter = {
        ...character,
        endurance: { ...character.endurance, ...endurance },
      };
      this.store.updateCharacter(updatedCharacter);
      this.updateMenuState(updatedCharacter);
    }
  }

  updateCharacterEquipment(equipment: any[]): void {
    const character = this.store.getCharacter();
    if (character) {
      const updatedCharacter = {
        ...character,
        equipment: equipment,
      };
      this.store.updateCharacter(updatedCharacter);
      this.updateMenuState(updatedCharacter);
    }
  }

  // Character validation
  validateCharacterForAction(action: string): ValidationResult {
    const character = this.store.getCharacter();
    const state = this.store.getState();

    if (!character?.exists) {
      return { valid: false, reason: "No character exists" };
    }

    switch (action) {
      case "fight":
        if (!character.isAlive) {
          return { valid: false, reason: "Character is dead" };
        }
        if (character.inCombat) {
          return { valid: false, reason: "Character is already in combat" };
        }
        break;

      case "heal":
        if (!character.isAlive) {
          return { valid: false, reason: "Character is dead" };
        }
        if (character.inCombat) {
          return { valid: false, reason: "Character is in combat" };
        }
        break;

      case "resurrect":
        if (character.isAlive) {
          return { valid: false, reason: "Character is already alive" };
        }
        break;

      case "continueFight":
      case "flee":
        if (!character.inCombat) {
          return { valid: false, reason: "Character is not in combat" };
        }
        break;
    }

    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    return { valid: true };
  }

  canCharacterAct(): boolean {
    const character = this.store.getCharacter();
    return Boolean(character?.exists && character.isAlive && !character.inCombat);
  }

  getCharacterStatusMessage(): string {
    const character = this.store.getCharacter();

    if (!character?.exists) {
      return StatusMessageType.READY;
    }

    if (character.inCombat) {
      return "Character in combat";
    }

    if (!character.isAlive) {
      return "Character is dead - resurrection required";
    }

    if (character.endurance.percentage < 50) {
      return "Character needs healing";
    }

    return StatusMessageType.CHARACTER_EXISTS;
  }

  // Parse character data from contract
  private parseCharacterData(contractData: any): CharacterData {
    console.log("🔍 CharacterStateManager.parseCharacterData: Input contract data:", contractData);

    const currentEndurance = Number(contractData.currentEndurance);
    const maxEndurance = Number(contractData.maxEndurance);

    console.log("🔍 CharacterStateManager.parseCharacterData: Endurance calculations:", {
      rawCurrentEndurance: contractData.currentEndurance,
      rawMaxEndurance: contractData.maxEndurance,
      parsedCurrentEndurance: currentEndurance,
      parsedMaxEndurance: maxEndurance,
      currentEnduranceType: typeof contractData.currentEndurance,
      maxEnduranceType: typeof contractData.maxEndurance,
    });

    const percentage = maxEndurance > 0 ? (currentEndurance / maxEndurance) * 100 : 0;

    const enduranceObject = {
      current: currentEndurance,
      max: maxEndurance,
      percentage: percentage,
    };

    console.log(
      "🔍 CharacterStateManager.parseCharacterData: Final endurance object:",
      enduranceObject
    );

    return {
      exists: Number(contractData.level) > 0, // In Solidity, non-existing data returns 0
      isAlive: Boolean(contractData.aliveFlag),
      class: Number(contractData.characterClass),
      className: this.getClassName(Number(contractData.characterClass)),
      level: Number(contractData.level),
      experience: Number(contractData.experience),
      endurance: {
        current: currentEndurance,
        max: maxEndurance,
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
    const classNames = ["Warrior", "Mage", "Rogue", "Paladin"];
    return classNames[classId] || "Unknown";
  }

  // Update menu state based on character
  private updateMenuState(character: CharacterData | null): void {
    const menuState = this.calculateMenuState(character);
    this.store.updateMenu(menuState);
  }

  // Calculate menu state based on character
  private calculateMenuState(character: CharacterData | null): any {
    return MenuStateCalculator.calculateMenuState(character, {
      operation: this.store.getOperation(),
      healingCooldownRemaining: 0, // TODO: Get from contract
    });
  }
}
