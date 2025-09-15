/**
 * UX Manager provides high-level, UI-focused character and game state management
 * It coordinates between character operations, operation tracking, and events
 *
 * Ported from packages/sdk/src/modules/UXManager.ts
 */

import type { Address } from "viem";
import type { EventEmitter } from "../events/EventEmitter";
import { type CharacterData, type MenuState, type OperationState, UXState } from "../types";
import { FightDataNormalizer } from "../utils/FightDataNormalizer";
import { MenuStateCalculator } from "../utils/MenuStateCalculator";

export interface CharacterUXData {
  exists: boolean;
  address: string;
  class: number;
  className: string;
  level: number;
  experience: number;
  isAlive: boolean;
  inCombat: boolean;
  endurance: {
    current: number;
    max: number;
    percentage: number;
    color: string;
    regenerated: number;
    bonusFromEquipment: number;
    effective: number;
  };
  combat: {
    total: number;
    bonusFromEquipment: number;
  };
  defense: {
    total: number;
    bonusFromEquipment: number;
  };
  luck: {
    total: number;
    bonusFromEquipment: number;
  };
  progression?: {
    currentXP: number;
    xpToNextLevel: number;
    totalXPForNextLevel: number;
    progressPercentage: number;
    levelsGained: number;
  };
  totalKills: number;
  points: number;
  healingCooldownRemaining: number;
  bonuses: {
    combat: number;
    endurance: number;
    defense: number;
    luck: number;
  };
}

export interface MenuUXState extends MenuState {
  inCombat: boolean;
  characterExists: boolean;
  isAlive: boolean;
  currentOperation: OperationState | null;
  isOperationActive: boolean;
  combatDetails?: {
    enemyId: number;
    enemyLevel: number;
    enemyName: string;
    enemyCurrentEndurance: number;
    enemyStartEndurance: number;
    playerStartEndurance: number;
    roundsElapsed: number;
    difficultyMultiplier: number;
    enemyStats?: {
      combat: number;
      defense: number;
      luck: number;
    };
  };
}

export class UXManager {
  private characterData: CharacterUXData | null = null;
  private menuState: MenuUXState | null = null;
  private eventSubscriptions: (() => void)[] = [];
  private listeners: {
    character: ((data: CharacterUXData | null) => void)[];
    menu: ((state: MenuUXState | null) => void)[];
  } = { character: [], menu: [] };

  constructor(
    private store: any, // UXStore - avoiding circular dependency
    private characterOps: any, // CharacterOperations
    private combatOps: any, // CombatOperations
    private operationTracker: any, // OperationTracker
    private eventEmitter: EventEmitter
  ) {
    this.setupEventListeners();
    this.setupOperationTracking();
  }

  /**
   * Initialize UX state for a specific player
   */
  async initializeForPlayer(player: Address) {
    console.log("Initializing UX state for player", { player });

    try {
      // Load initial character data
      await this.refreshCharacterData(player);
      await this.refreshMenuState(player);

      console.log("UX state initialized successfully", { player });
    } catch (error) {
      console.error("Failed to initialize UX state", { player, error });
      throw error;
    }
  }

  /**
   * Get current character data (UX-optimized)
   */
  getCharacterData(): CharacterUXData | null {
    return this.characterData ? { ...this.characterData } : null;
  }

  /**
   * Get current menu state (UX-optimized)
   */
  getMenuState(): MenuUXState | null {
    return this.menuState ? { ...this.menuState } : null;
  }

  /**
   * Refresh character data from contract
   */
  async refreshCharacterData(player: Address) {
    try {
      const character = await this.characterOps.getCharacter(player);

      if (character?.exists) {
        this.characterData = this.normalizeCharacterUXData(character, player);
      } else {
        this.characterData = this.createEmptyCharacterData(player);
      }

      this.notifyCharacterListeners();
      console.log("Character data refreshed", { player });
    } catch (error) {
      console.error("Failed to refresh character data", { player, error });
    }
  }

  /**
   * Refresh menu state from contract
   */
  async refreshMenuState(player: Address) {
    try {
      const character = this.characterData;
      const operation = this.store.getOperation();

      // Use centralized menu state calculator
      const baseMenuState = MenuStateCalculator.calculateMenuState(character, {
        operation,
        healingCooldownRemaining: character?.healingCooldownRemaining || 0,
      });

      // Add UX-specific fields
      this.menuState = {
        ...baseMenuState,
        inCombat: character?.inCombat || false,
        characterExists: character?.exists || false,
        isAlive: character?.isAlive || false,
        currentOperation: operation,
        isOperationActive: operation?.isActive || false,
      };

      this.notifyMenuListeners();
      console.log("Menu state refreshed", { player });
    } catch (error) {
      console.error("Failed to refresh menu state", { player, error });
    }
  }

  /**
   * Subscribe to character data changes
   */
  onCharacterChange(callback: (data: CharacterUXData | null) => void): () => void {
    this.listeners.character.push(callback);
    return () => {
      const index = this.listeners.character.indexOf(callback);
      if (index > -1) {
        this.listeners.character.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to menu state changes
   */
  onMenuChange(callback: (state: MenuUXState | null) => void): () => void {
    this.listeners.menu.push(callback);
    return () => {
      const index = this.listeners.menu.indexOf(callback);
      if (index > -1) {
        this.listeners.menu.splice(index, 1);
      }
    };
  }

  /**
   * Normalize character data for UX display
   */
  private normalizeCharacterUXData(character: CharacterData, player: Address): CharacterUXData {
    const className = this.getClassName(character.class);
    const endurancePercentage = FightDataNormalizer.calculateHealthPercentage(
      character.endurance.current,
      character.endurance.max
    );
    const enduranceColor = FightDataNormalizer.getHealthColor(endurancePercentage);

    // Calculate equipment bonuses
    const equipmentBonuses = character.equipment.reduce(
      (acc, item) => ({
        combat: acc.combat + item.combat,
        endurance: acc.endurance + item.endurance,
        defense: acc.defense + item.defense,
        luck: acc.luck + item.luck,
      }),
      { combat: 0, endurance: 0, defense: 0, luck: 0 }
    );

    return {
      exists: true,
      address: player,
      class: character.class,
      className,
      level: character.level,
      experience: character.experience,
      isAlive: character.isAlive,
      inCombat: character.inCombat,
      endurance: {
        current: character.endurance.current,
        max: character.endurance.max,
        percentage: endurancePercentage,
        color: enduranceColor,
        regenerated: 0, // TODO: Calculate from contract
        bonusFromEquipment: equipmentBonuses.endurance,
        effective: character.endurance.current + equipmentBonuses.endurance,
      },
      combat: {
        total: character.stats.combat,
        bonusFromEquipment: equipmentBonuses.combat,
      },
      defense: {
        total: character.stats.defense,
        bonusFromEquipment: equipmentBonuses.defense,
      },
      luck: {
        total: character.stats.luck,
        bonusFromEquipment: equipmentBonuses.luck,
      },
      totalKills: character.totalKills,
      points: 0, // TODO: Calculate from contract
      healingCooldownRemaining: 0, // TODO: Get from contract
      bonuses: equipmentBonuses,
    };
  }

  /**
   * Create empty character data for new players
   */
  private createEmptyCharacterData(player: Address): CharacterUXData {
    return {
      exists: false,
      address: player,
      class: 0,
      className: "None",
      level: 0,
      experience: 0,
      isAlive: false,
      inCombat: false,
      endurance: {
        current: 0,
        max: 0,
        percentage: 0,
        color: "#ef4444",
        regenerated: 0,
        bonusFromEquipment: 0,
        effective: 0,
      },
      combat: {
        total: 0,
        bonusFromEquipment: 0,
      },
      defense: {
        total: 0,
        bonusFromEquipment: 0,
      },
      luck: {
        total: 0,
        bonusFromEquipment: 0,
      },
      totalKills: 0,
      points: 0,
      healingCooldownRemaining: 0,
      bonuses: {
        combat: 0,
        endurance: 0,
        defense: 0,
        luck: 0,
      },
    };
  }

  /**
   * Get class name from class ID
   */
  private getClassName(classId: number): string {
    const classNames = ["Warrior", "Mage", "Rogue", "Cleric"];
    return classNames[classId] || "Unknown";
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners() {
    // Listen for character data changes
    const unsubscribeCharacter = this.eventEmitter.on("characterDataUpdated" as any, () => {
      // Refresh character data when it changes
      // This would need the player address, which should be passed from the SDK
    });

    // Listen for operation changes
    const unsubscribeOperation = this.eventEmitter.on("operationUpdated" as any, () => {
      // Refresh menu state when operations change
      // This would need the player address, which should be passed from the SDK
    });

    this.eventSubscriptions.push(unsubscribeCharacter, unsubscribeOperation);
  }

  /**
   * Setup operation tracking
   */
  private setupOperationTracking() {
    // This would integrate with the operation tracker
    // to automatically refresh state after operations complete
  }

  /**
   * Notify character listeners
   */
  private notifyCharacterListeners() {
    this.listeners.character.forEach((callback) => callback(this.characterData));
  }

  /**
   * Notify menu listeners
   */
  private notifyMenuListeners() {
    this.listeners.menu.forEach((callback) => callback(this.menuState));
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    this.eventSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.eventSubscriptions = [];
    this.listeners.character = [];
    this.listeners.menu = [];
  }
}
