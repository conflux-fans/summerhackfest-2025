// Fight data normalization utilities
// Provides comprehensive data transformation for fight summary display

import type { EquipmentData, FightSummaryData } from "../types";

// Enemy names mapping
export const ENEMY_NAMES = [
  "Unknown",
  "Goblin Warrior",
  "Orc Berserker",
  "Shadow Assassin",
  "Ice Troll",
  "Fire Elemental",
  "Stone Golem",
  "Dark Wizard",
  "Skeleton Knight",
  "Dragon Whelp",
  "Void Stalker",
  "Ancient Dragon",
  "Crystal Beast",
  "Shadow Demon",
  "Frost Giant",
  "Lava Dragon",
];

// Raw contract event data interface
export interface RawFightSummaryEvent {
  enemyId: number;
  enemyLevel: number;
  roundsElapsed: number;
  playerStartEndurance: number;
  playerEndurance: number;
  enemyStartEndurance: number;
  enemyEndurance: number;
  victory: boolean;
  unresolved: boolean;
  roundNumbers: number[];
  playerDamages: number[];
  enemyDamages: number[];
  playerCriticals: boolean[];
  enemyCriticals: boolean[];
  xpGained: number;
  difficultyMultiplier?: number;
}

// Equipment drop data from contract
export interface RawEquipmentDrop {
  bonuses: number[];
  description?: string;
}

export class FightDataNormalizer {
  /**
   * Normalize BigInt values for serialization
   * Recursively converts BigInt values to strings to prevent serialization errors
   */
  static normalizeBigInts(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === "bigint") {
      return value.toString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => FightDataNormalizer.normalizeBigInts(item));
    }

    if (typeof value === "object") {
      const normalized: any = {};
      for (const [key, val] of Object.entries(value)) {
        normalized[key] = FightDataNormalizer.normalizeBigInts(val);
      }
      return normalized;
    }

    return value;
  }

  /**
   * Calculate health percentage for display
   */
  static calculateHealthPercentage(current: number, max: number): number {
    if (max === 0) return 0;
    return Math.max(0, Math.min(100, (current / max) * 100));
  }

  /**
   * Get health color based on percentage
   */
  static getHealthColor(percentage: number): string {
    if (percentage >= 80) return "#22c55e"; // green
    if (percentage >= 60) return "#84cc16"; // lime
    if (percentage >= 40) return "#eab308"; // yellow
    if (percentage >= 20) return "#f97316"; // orange
    return "#ef4444"; // red
  }

  /**
   * Calculate progress percentage for XP/leveling
   */
  static calculateProgressPercentage(current: number, total: number): number {
    if (total === 0) return 0;
    return Math.max(0, Math.min(100, (current / total) * 100));
  }

  /**
   * Get progress color based on percentage
   */
  static getProgressColor(percentage: number): string {
    if (percentage >= 90) return "#22c55e"; // green
    if (percentage >= 70) return "#84cc16"; // lime
    if (percentage >= 50) return "#eab308"; // yellow
    if (percentage >= 30) return "#f97316"; // orange
    return "#3b82f6"; // blue
  }

  /**
   * Format health display with color
   */
  static formatHealthDisplay(
    current: number,
    max: number
  ): {
    current: number;
    max: number;
    percentage: number;
    color: string;
    display: string;
  } {
    const percentage = FightDataNormalizer.calculateHealthPercentage(current, max);
    const color = FightDataNormalizer.getHealthColor(percentage);

    return {
      current,
      max,
      percentage,
      color,
      display: `${current}/${max} (${percentage.toFixed(1)}%)`,
    };
  }

  /**
   * Format progress display with color
   */
  static formatProgressDisplay(
    current: number,
    total: number,
    label: string = "Progress"
  ): {
    current: number;
    total: number;
    percentage: number;
    color: string;
    display: string;
  } {
    const percentage = FightDataNormalizer.calculateProgressPercentage(current, total);
    const color = FightDataNormalizer.getProgressColor(percentage);

    return {
      current,
      total,
      percentage,
      color,
      display: `${label}: ${current}/${total} (${percentage.toFixed(1)}%)`,
    };
  }

  /**
   * Normalizes raw contract event data into structured FightSummaryData
   */
  static normalizeFightSummary(
    rawData: RawFightSummaryEvent,
    equipmentDrop?: RawEquipmentDrop
  ): FightSummaryData {
    // Calculate derived fields
    const playerDied = !rawData.victory && !rawData.unresolved;
    const enemyDied = rawData.victory;

    // Normalize equipment drop data
    const normalizedEquipmentDrop = equipmentDrop
      ? FightDataNormalizer.normalizeEquipmentDrop(equipmentDrop)
      : undefined;

    // Get enemy name
    const enemyName = FightDataNormalizer.getEnemyName(rawData.enemyId);

    // Normalize rounds data
    const rounds = FightDataNormalizer.normalizeRoundsData(rawData);

    return {
      enemyId: Number(rawData.enemyId),
      enemyLevel: Number(rawData.enemyLevel),
      roundsElapsed: Number(rawData.roundsElapsed),
      victory: Boolean(rawData.victory),
      unresolved: Boolean(rawData.unresolved),
      xpGained: Number(rawData.xpGained),
      equipmentDropped: normalizedEquipmentDrop,
      playerDied,
      enemyDied,
      playerHealthRemaining: Number(rawData.playerEndurance),
      enemyHealthRemaining: Number(rawData.enemyEndurance),
      playerStartEndurance: Number(rawData.playerStartEndurance),
      enemyStartEndurance: Number(rawData.enemyStartEndurance),
      rounds,
      enemyName,
      difficultyMultiplier: rawData.difficultyMultiplier
        ? Number(rawData.difficultyMultiplier)
        : 1.0,
    };
  }

  /**
   * Normalizes equipment drop data
   */
  static normalizeEquipmentDrop(rawDrop: RawEquipmentDrop): EquipmentData {
    const bonuses = (rawDrop.bonuses || [0, 0, 0, 0]).map(Number);
    return {
      combat: bonuses[0] || 0,
      endurance: bonuses[1] || 0,
      defense: bonuses[2] || 0,
      luck: bonuses[3] || 0,
    };
  }

  /**
   * Normalizes rounds data for display
   */
  static normalizeRoundsData(rawData: RawFightSummaryEvent): FightSummaryData["rounds"] {
    const roundNumbers = (rawData.roundNumbers || []).map(Number);
    const playerDamages = (rawData.playerDamages || []).map(Number);
    const enemyDamages = (rawData.enemyDamages || []).map(Number);
    const playerCriticals = (rawData.playerCriticals || []).map(Boolean);
    const enemyCriticals = (rawData.enemyCriticals || []).map(Boolean);

    return {
      count: roundNumbers.length,
      numbers: roundNumbers,
      playerDamages,
      enemyDamages,
      playerCriticals,
      enemyCriticals,
    };
  }

  /**
   * Gets enemy name by ID
   */
  static getEnemyName(enemyId: number): string {
    return ENEMY_NAMES[enemyId] || `Enemy ${enemyId}`;
  }

  /**
   * Calculates fight outcome for display
   */
  static getFightOutcome(fightData: FightSummaryData): {
    type: "victory" | "defeat" | "unresolved" | "ended";
    color: string;
    icon: string;
    text: string;
  } {
    if (fightData.victory) {
      return {
        type: "victory",
        color: "#4CAF50",
        icon: "🏆",
        text: "VICTORY!",
      };
    }

    if (fightData.playerDied) {
      return {
        type: "defeat",
        color: "#F44336",
        icon: "💀",
        text: "DEFEAT",
      };
    }

    if (fightData.unresolved) {
      return {
        type: "unresolved",
        color: "#FF9800",
        icon: "⏰",
        text: "UNRESOLVED",
      };
    }

    return {
      type: "ended",
      color: "#666",
      icon: "⚔️",
      text: "FIGHT ENDED",
    };
  }

  /**
   * Calculates health percentage for display
   */
  static getHealthPercentage(current: number, max: number): number {
    if (max === 0) return 0;
    return Math.max(0, Math.min(100, (current / max) * 100));
  }

  /**
   * Formats damage for display
   */
  static formatDamage(damage: number, isCritical: boolean): string {
    const criticalText = isCritical ? " (CRITICAL!)" : "";
    return `${damage}${criticalText}`;
  }

  /**
   * Gets round summary for display
   */
  static getRoundSummary(rounds: FightSummaryData["rounds"]): {
    totalPlayerDamage: number;
    totalEnemyDamage: number;
    criticalHits: number;
    averageDamage: number;
  } {
    const totalPlayerDamage = rounds.playerDamages.reduce((sum, damage) => sum + damage, 0);
    const totalEnemyDamage = rounds.enemyDamages.reduce((sum, damage) => sum + damage, 0);
    const criticalHits =
      rounds.playerCriticals.filter(Boolean).length + rounds.enemyCriticals.filter(Boolean).length;
    const averageDamage =
      rounds.count > 0 ? (totalPlayerDamage + totalEnemyDamage) / (rounds.count * 2) : 0;

    return {
      totalPlayerDamage,
      totalEnemyDamage,
      criticalHits,
      averageDamage,
    };
  }

  /**
   * Validates fight summary data
   */
  static validateFightSummary(data: FightSummaryData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.enemyId < 0 || data.enemyId >= ENEMY_NAMES.length) {
      errors.push(`Invalid enemy ID: ${data.enemyId}`);
    }

    if (data.enemyLevel < 1 || data.enemyLevel > 250) {
      errors.push(`Invalid enemy level: ${data.enemyLevel}`);
    }

    if (data.roundsElapsed < 0) {
      errors.push(`Invalid rounds elapsed: ${data.roundsElapsed}`);
    }

    if (data.playerHealthRemaining < 0) {
      errors.push(`Invalid player health: ${data.playerHealthRemaining}`);
    }

    if (data.enemyHealthRemaining < 0) {
      errors.push(`Invalid enemy health: ${data.enemyHealthRemaining}`);
    }

    if (data.rounds.count !== data.rounds.numbers.length) {
      errors.push(`Round count mismatch: ${data.rounds.count} vs ${data.rounds.numbers.length}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
