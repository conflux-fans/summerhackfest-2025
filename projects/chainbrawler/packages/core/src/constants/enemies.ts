// Enemy system constants and configuration
export interface EnemyConfig {
  id: number;
  name: string;
  icon: string;
  description: string;
  color: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert" | "Legendary";
  baseStats: {
    combat: number;
    defense: number;
    luck: number;
  };
  levelMultipliers: {
    combat: number;
    defense: number;
    luck: number;
    health: number;
  };
  rewards: {
    baseXP: number;
    levelMultiplier: number;
  };
  dropRates: {
    equipment: number;
    rare: number;
  };
}

export const ENEMY_CONFIGS: Record<number, EnemyConfig> = {
  1: {
    id: 1,
    name: "Goblin",
    icon: "👹",
    description: "A weak but cunning creature that attacks travelers",
    color: "green",
    difficulty: "Easy",
    baseStats: {
      combat: 2,
      defense: 1,
      luck: 1,
    },
    levelMultipliers: {
      combat: 1.2,
      defense: 1.1,
      luck: 1.0,
      health: 1.3,
    },
    rewards: {
      baseXP: 10,
      levelMultiplier: 1.1,
    },
    dropRates: {
      equipment: 0.1,
      rare: 0.01,
    },
  },
  2: {
    id: 2,
    name: "Orc",
    icon: "🧌",
    description: "A brutal warrior with thick skin and sharp weapons",
    color: "orange",
    difficulty: "Medium",
    baseStats: {
      combat: 4,
      defense: 3,
      luck: 1,
    },
    levelMultipliers: {
      combat: 1.3,
      defense: 1.2,
      luck: 1.0,
      health: 1.4,
    },
    rewards: {
      baseXP: 25,
      levelMultiplier: 1.2,
    },
    dropRates: {
      equipment: 0.15,
      rare: 0.02,
    },
  },
  3: {
    id: 3,
    name: "Troll",
    icon: "🧟",
    description: "A massive regenerating beast with incredible strength",
    color: "red",
    difficulty: "Hard",
    baseStats: {
      combat: 6,
      defense: 5,
      luck: 2,
    },
    levelMultipliers: {
      combat: 1.4,
      defense: 1.3,
      luck: 1.1,
      health: 1.5,
    },
    rewards: {
      baseXP: 50,
      levelMultiplier: 1.3,
    },
    dropRates: {
      equipment: 0.2,
      rare: 0.05,
    },
  },
  4: {
    id: 4,
    name: "Dragon",
    icon: "🐉",
    description: "An ancient wyrm with devastating magical powers",
    color: "purple",
    difficulty: "Legendary",
    baseStats: {
      combat: 10,
      defense: 8,
      luck: 5,
    },
    levelMultipliers: {
      combat: 1.5,
      defense: 1.4,
      luck: 1.2,
      health: 1.6,
    },
    rewards: {
      baseXP: 100,
      levelMultiplier: 1.5,
    },
    dropRates: {
      equipment: 0.3,
      rare: 0.1,
    },
  },
};

export function getEnemyConfig(enemyId: number): EnemyConfig | null {
  return ENEMY_CONFIGS[enemyId] || null;
}

export function calculateEnemyStats(
  enemyId: number,
  level: number
): {
  combat: number;
  defense: number;
  luck: number;
  health: number;
} | null {
  const config = getEnemyConfig(enemyId);
  if (!config) return null;

  return {
    combat: Math.floor(config.baseStats.combat * config.levelMultipliers.combat ** (level - 1)),
    defense: Math.floor(config.baseStats.defense * config.levelMultipliers.defense ** (level - 1)),
    luck: Math.floor(config.baseStats.luck * config.levelMultipliers.luck ** (level - 1)),
    health: Math.floor(50 * config.levelMultipliers.health ** (level - 1)),
  };
}

export function calculateEnemyRewards(
  enemyId: number,
  level: number
): {
  xp: number;
  equipmentDropChance: number;
  rareDropChance: number;
} | null {
  const config = getEnemyConfig(enemyId);
  if (!config) return null;

  return {
    xp: Math.floor(config.rewards.baseXP * config.rewards.levelMultiplier ** (level - 1)),
    equipmentDropChance: config.dropRates.equipment * (1 + (level - 1) * 0.01),
    rareDropChance: config.dropRates.rare * (1 + (level - 1) * 0.005),
  };
}

export const ENEMY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export type EnemyLevel = (typeof ENEMY_LEVELS)[number];

export function getEnemyDisplayName(enemyId: number, level: number): string {
  const config = getEnemyConfig(enemyId);
  if (!config) return `Unknown Enemy Lv.${level}`;

  return `${config.name} Lv.${level}`;
}

export function getEnemyDifficultyColor(difficulty: EnemyConfig["difficulty"]): string {
  const colors = {
    Easy: "#4caf50",
    Medium: "#ff9800",
    Hard: "#f44336",
    Expert: "#9c27b0",
    Legendary: "#e91e63",
  };
  return colors[difficulty];
}
