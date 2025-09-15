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

// Enemy utilities for ChainBrawler

export interface EnemyType {
  id: number;
  name: string;
  description: string;
}

export interface EnemyStats {
  name: string;
  description: string;
  baseStats: {
    health: number;
    combat: number;
    defense: number;
    luck: number;
  };
  scaledStats: {
    health: number;
    combat: number;
    defense: number;
    luck: number;
  };
  difficultyMultiplier: number;
}

export const ENEMY_TYPES: EnemyType[] = [
  { id: 1, name: "Goblin Warrior", description: "A small but fierce warrior" },
  { id: 2, name: "Orc Berserker", description: "A massive, rage-filled fighter" },
  { id: 3, name: "Shadow Assassin", description: "A stealthy, deadly killer" },
  { id: 4, name: "Ice Troll", description: "A massive, frost-covered beast" },
  { id: 5, name: "Fire Elemental", description: "A living flame creature" },
  { id: 6, name: "Stone Golem", description: "An ancient, animated statue" },
  { id: 7, name: "Dark Wizard", description: "A powerful spellcaster" },
  { id: 8, name: "Skeleton Knight", description: "An undead warrior" },
  { id: 9, name: "Dragon Whelp", description: "A young but dangerous dragon" },
  { id: 10, name: "Demon Scout", description: "A fast, agile demon" },
  { id: 11, name: "Crystal Spider", description: "A crystalline arachnid" },
  { id: 12, name: "Storm Giant", description: "A towering giant of storms" },
  { id: 13, name: "Lich King", description: "An undead master of dark magic" },
  { id: 14, name: "Phoenix Guardian", description: "A reborn fire bird" },
  { id: 15, name: "Void Stalker", description: "A creature from the void" },
  { id: 16, name: "Ancient Dragon", description: "An ancient, powerful dragon" },
];

export function getEnemyType(enemyId: number): EnemyType | undefined {
  return ENEMY_TYPES.find((e) => e.id === enemyId);
}

export function getEnemyName(enemyId: number): string {
  const enemy = getEnemyType(enemyId);
  return enemy?.name || `Enemy ${enemyId}`;
}

export function calculateEnemyStats(enemyId: number, level: number): EnemyStats {
  const enemy = getEnemyType(enemyId) || ENEMY_TYPES[0];

  // Base stats vary by enemy type
  const baseHealth = 50 + enemyId * 10;
  const baseCombat = 8 + enemyId * 2;
  const baseDefense = 6 + enemyId * 1.5;
  const baseLuck = 4 + enemyId * 1;

  // Scale by level
  const levelMultiplier = 1 + (level - 1) * 0.2;

  // Calculate difficulty multiplier
  const difficultyMultiplier = 1 + (enemyId - 1) * 0.1 + (level - 1) * 0.05;

  const scaledStats = {
    health: Math.floor(baseHealth * levelMultiplier),
    combat: Math.floor(baseCombat * levelMultiplier),
    defense: Math.floor(baseDefense * levelMultiplier),
    luck: Math.floor(baseLuck * levelMultiplier),
  };

  return {
    name: enemy.name,
    description: enemy.description,
    baseStats: {
      health: baseHealth,
      combat: baseCombat,
      defense: baseDefense,
      luck: baseLuck,
    },
    scaledStats,
    difficultyMultiplier,
  };
}

export type DifficultyLevel = "Easy" | "Medium" | "Hard" | "Extreme";

export function getDifficultyLevel(multiplier: number): DifficultyLevel {
  if (multiplier <= 1.2) return "Easy";
  if (multiplier <= 1.8) return "Medium";
  if (multiplier <= 2.5) return "Hard";
  return "Extreme";
}

export function getDifficultyColor(multiplier: number): string {
  if (multiplier <= 1.2) return "#4CAF50"; // Green
  if (multiplier <= 1.8) return "#FF9800"; // Orange
  return "#F44336"; // Red
}
