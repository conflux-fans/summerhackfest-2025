import { GameState, UpgradeConfig } from '@/types/game';
import { GAME_CONSTANTS, UPGRADE_CONFIGS } from '@/lib/utils/constants';

/**
 * Calculate upgrade cost with exponential scaling
 */
export function calculateUpgradeCost(
  baseCost: bigint,
  multiplier: number,
  level: number
): bigint {
  if (level === 0) return baseCost;
  
  let cost = baseCost;
  for (let i = 0; i < level; i++) {
    cost = (cost * BigInt(multiplier)) / BigInt(1000);
  }
  return cost;
}

/**
 * Get the cost for the next level of an upgrade
 */
export function getUpgradeCost(upgradeId: string, currentLevel: number): bigint {
  const config = UPGRADE_CONFIGS[upgradeId];
  if (!config) return BigInt(0);
  
  return calculateUpgradeCost(config.baseCost, config.costMultiplier, currentLevel);
}

/**
 * Calculate total stardust per click from all upgrades
 */
export function calculateStardustPerClick(gameState: GameState): bigint {
  let total = GAME_CONSTANTS.INITIAL_STARDUST_PER_CLICK;
  
  Object.entries(gameState.upgrades).forEach(([upgradeId, upgrade]) => {
    const config = UPGRADE_CONFIGS[upgradeId];
    if (config && upgrade.level > 0) {
      total += config.stardustPerClick * BigInt(upgrade.level);
    }
  });
  
  return total;
}

/**
 * Calculate total stardust per second from all upgrades
 */
export function calculateStardustPerSecond(gameState: GameState): bigint {
  let total = GAME_CONSTANTS.INITIAL_STARDUST_PER_SECOND;
  
  Object.entries(gameState.upgrades).forEach(([upgradeId, upgrade]) => {
    const config = UPGRADE_CONFIGS[upgradeId];
    if (config && upgrade.level > 0) {
      total += config.stardustPerSecond * BigInt(upgrade.level);
    }
  });
  
  // Apply prestige bonus (each prestige level gives +1 stardust per second)
  if (gameState.prestigeLevel > 0) {
    const prestigeBonus = BigInt(gameState.prestigeLevel);
    total += prestigeBonus;
  }
  
  return total;
}

/**
 * Calculate idle rewards based on time elapsed
 */
export function calculateIdleRewards(
  stardustPerSecond: bigint,
  timeElapsedSeconds: number
): bigint {
  if (timeElapsedSeconds <= 0) return BigInt(0);
  
  // Cap idle time to prevent exploitation (max 24 hours)
  const cappedTime = Math.min(timeElapsedSeconds, 24 * 60 * 60);
  
  return stardustPerSecond * BigInt(cappedTime);
}

/**
 * Check if player can afford an upgrade
 */
export function canAffordUpgrade(
  gameState: GameState,
  upgradeId: string
): boolean {
  const config = UPGRADE_CONFIGS[upgradeId];
  if (!config) return false;
  
  const currentLevel = gameState.upgrades[upgradeId]?.level || 0;
  const cost = getUpgradeCost(upgradeId, currentLevel);
  
  if (config.costType === 'stardust') {
    return gameState.stardust >= cost;
  } else {
    return gameState.credits >= cost;
  }
}

/**
 * Purchase an upgrade and update game state
 */
export function purchaseUpgrade(
  gameState: GameState,
  upgradeId: string
): GameState {
  const config = UPGRADE_CONFIGS[upgradeId];
  if (!config || !canAffordUpgrade(gameState, upgradeId)) {
    return gameState;
  }
  
  const currentLevel = gameState.upgrades[upgradeId]?.level || 0;
  const cost = getUpgradeCost(upgradeId, currentLevel);
  
  const newGameState = { ...gameState };
  
  // Deduct cost
  if (config.costType === 'stardust') {
    newGameState.stardust -= cost;
  } else {
    newGameState.credits -= cost;
  }
  
  // Update upgrade level
  if (!newGameState.upgrades[upgradeId]) {
    newGameState.upgrades[upgradeId] = {
      level: 0,
      cost: config.baseCost,
      costType: config.costType,
    };
  }
  newGameState.upgrades[upgradeId].level += 1;
  
  // Recalculate rates
  newGameState.stardustPerClick = calculateStardustPerClick(newGameState);
  newGameState.stardustPerSecond = calculateStardustPerSecond(newGameState);
  
  return newGameState;
}

/**
 * Process a click and update game state
 */
export function processClick(gameState: GameState): GameState {
  const newGameState = { ...gameState };
  
  newGameState.stardust += gameState.stardustPerClick;
  newGameState.totalClicks += 1;
  
  return newGameState;
}

/**
 * Check if player can activate prestige
 */
export function canActivatePrestige(gameState: GameState): boolean {
  return gameState.stardust >= GAME_CONSTANTS.PRESTIGE_REQUIREMENT;
}

/**
 * Activate prestige and reset progress
 */
export function activatePrestige(gameState: GameState): GameState {
  if (!canActivatePrestige(gameState)) {
    return gameState;
  }
  
  const newGameState: GameState = {
    ...gameState,
    stardust: BigInt(0),
    stardustPerClick: GAME_CONSTANTS.INITIAL_STARDUST_PER_CLICK,
    stardustPerSecond: GAME_CONSTANTS.INITIAL_STARDUST_PER_SECOND,
    totalClicks: 0,
    upgrades: {},
    prestigeLevel: gameState.prestigeLevel + 1,
    lastSaveTime: Date.now(),
  };
  
  // Recalculate rates with new prestige level
  newGameState.stardustPerClick = calculateStardustPerClick(newGameState);
  newGameState.stardustPerSecond = calculateStardustPerSecond(newGameState);
  
  return newGameState;
}

/**
 * Calculate stardust to CFX exchange rate
 */
export function calculateStardustToCFX(stardustAmount: bigint): bigint {
  return (stardustAmount * BigInt(1e18)) / GAME_CONSTANTS.STARDUST_TO_CFX_RATE;
}

/**
 * Calculate CFX to credits exchange rate
 */
export function calculateCFXToCredits(cfxAmount: bigint): bigint {
  return (cfxAmount * GAME_CONSTANTS.CREDITS_PER_CFX) / BigInt(1e18);
}

/**
 * Get all available upgrades for current game state
 */
export function getAvailableUpgrades(gameState: GameState): UpgradeConfig[] {
  return Object.values(UPGRADE_CONFIGS).filter(config => config.isActive);
}

/**
 * Get upgrades by cost type
 */
export function getUpgradesByCostType(costType: 'stardust' | 'credits'): UpgradeConfig[] {
  return Object.values(UPGRADE_CONFIGS).filter(
    config => config.isActive && config.costType === costType
  );
}

/**
 * Calculate total value of all upgrades
 */
export function calculateTotalUpgradeValue(gameState: GameState): {
  stardustSpent: bigint;
  creditsSpent: bigint;
} {
  let stardustSpent = BigInt(0);
  let creditsSpent = BigInt(0);
  
  Object.entries(gameState.upgrades).forEach(([upgradeId, upgrade]) => {
    const config = UPGRADE_CONFIGS[upgradeId];
    if (!config) return;
    
    // Calculate total cost for all levels
    for (let level = 0; level < upgrade.level; level++) {
      const cost = calculateUpgradeCost(config.baseCost, config.costMultiplier, level);
      if (config.costType === 'stardust') {
        stardustSpent += cost;
      } else {
        creditsSpent += cost;
      }
    }
  });
  
  return { stardustSpent, creditsSpent };
}

/**
 * Initialize default game state
 */
export function createInitialGameState(): GameState {
  return {
    stardust: BigInt(0),
    stardustPerClick: GAME_CONSTANTS.INITIAL_STARDUST_PER_CLICK,
    stardustPerSecond: GAME_CONSTANTS.INITIAL_STARDUST_PER_SECOND,
    totalClicks: 0,
    upgrades: {},
    credits: BigInt(0),
    walletConnected: false,
    userAddress: '',
    prestigeLevel: 0,
    achievements: [],
    lastSaveTime: Date.now(),
  };
}