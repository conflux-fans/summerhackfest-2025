export interface GameState {
  // Core stats
  stardust: bigint;
  stardustPerClick: bigint;
  stardustPerSecond: bigint;
  totalClicks: number;
  
  // Upgrades
  upgrades: {
    [key: string]: {
      level: number;
      cost: bigint;
      costType: 'stardust' | 'credits';
    };
  };
  
  // Blockchain data
  credits: bigint;
  walletConnected: boolean;
  userAddress: string;
  
  // Game progression
  prestigeLevel: number;
  achievements: string[];
  lastSaveTime: number;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: bigint;
  costMultiplier: number; // Multiplied by 1000 for precision
  stardustPerClick: bigint;
  stardustPerSecond: bigint;
  costType: 'stardust' | 'credits';
  isActive: boolean;
}

export interface ClickEffect {
  id: string;
  x: number;
  y: number;
  value: number;
  timestamp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (gameState: GameState) => boolean;
  reward: {
    type: 'stardust' | 'credits' | 'multiplier';
    amount: bigint;
  };
  unlocked: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  autoSaveInterval: number;
  theme: 'space' | 'cosmic' | 'nebula';
}

export interface PlayerStats {
  totalStardustEarned: bigint;
  totalCreditsSpent: bigint;
  totalClicks: number;
  totalPlayTime: number;
  highestStardustPerSecond: bigint;
  prestigeCount: number;
  achievementsUnlocked: number;
}