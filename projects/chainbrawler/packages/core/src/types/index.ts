// Core types for ChainBrawler - environment agnostic
// Based on UX_STATE_MANAGEMENT_SPEC.md

export interface CharacterData {
  exists: boolean;
  isAlive: boolean;
  class: number;
  className: string;
  level: number;
  experience: number;
  endurance: {
    current: number;
    max: number;
    percentage: number;
  };
  stats: {
    combat: number;
    defense: number;
    luck: number;
  };
  equipment: EquipmentData[];
  inCombat: boolean;
  combatState?: CombatState;
  totalKills: number;
}

export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  baseStats: {
    combat: number;
    defense: number;
    luck: number;
    speed: number;
  };
  statGrowth: {
    combat: number;
    defense: number;
    luck: number;
    speed: number;
  };
  skills: string[];
}

export interface EquipmentData {
  name?: string;
  combat: number;
  endurance: number;
  defense: number;
  luck: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  quantity: number;
  icon: string;
  description: string;
  usable: boolean;
  consumable: boolean;
  value: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  type: SkillType;
  cost: number;
  cooldown: number;
  icon: string;
  unlocked: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  health: {
    current: number;
    max: number;
  };
  stats: {
    combat: number;
    defense: number;
    luck: number;
    speed: number;
  };
  rewards: {
    experience: number;
    gold: number;
    items?: InventoryItem[];
  };
  difficulty: Difficulty;
  icon: string;
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  category: string;
  rarity: Rarity;
}

// Enums
export enum Difficulty {
  EASY = "easy",
  NORMAL = "normal",
  HARD = "hard",
  NIGHTMARE = "nightmare",
}

export enum Rarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
}

export enum EquipmentType {
  WEAPON = "weapon",
  ARMOR = "armor",
  ACCESSORY = "accessory",
  SHIELD = "shield",
}

export enum ItemType {
  CONSUMABLE = "consumable",
  EQUIPMENT = "equipment",
  QUEST = "quest",
  MATERIAL = "material",
}

export enum SkillType {
  ACTIVE = "active",
  PASSIVE = "passive",
  BUFF = "buff",
  DEBUFF = "debuff",
}

export interface CombatState {
  enemyId: number;
  enemyLevel: number;
  enemyCurrentEndurance: number;
  playerCurrentEndurance: number;
  roundsElapsed: number;
  playerStartEndurance: number;
  enemyStartEndurance: number;
  lastUpdated: number;
  difficultyMultiplier: number;
}

export interface MenuState {
  canCreateCharacter: boolean;
  canAct: boolean;
  canFight: boolean;
  canHeal: boolean;
  canResurrect: boolean;
  canContinueFight: boolean;
  canFlee: boolean;
  canViewPools: boolean;
  canViewLeaderboard: boolean;
  canViewClaims: boolean;
  canClaimPrize: boolean;
  availableActions: string[];
  disabledActions: string[];
  disabledReasons: Record<string, string>;
  healingCooldownRemaining: number;
}

export interface OperationState {
  isActive: boolean;
  operationType: string;
  status: "pending" | "processing" | "completed" | "error";
  hash?: string;
  startTime: number;
  progress?: string;
  error?: string;
  isWriteOperation?: boolean; // true for write operations, false for read operations
}

export interface PoolInfo {
  value: bigint;
  formatted: string;
  description: string;
  percentage: number;
}

export interface PoolsData {
  prizePool: PoolInfo;
  equipmentPool: PoolInfo;
  gasRefundPool: PoolInfo;
  developerPool: PoolInfo;
  nextEpochPool: PoolInfo;
  emergencyPool: PoolInfo;
  totalValue: bigint;
  lastUpdated: number;
}

export interface LeaderboardPlayer {
  address: `0x${string}`;
  score: bigint;
  rank: bigint;
  level: number;
  kills: number;
  isCurrentPlayer: boolean;
}

export interface LeaderboardData {
  currentEpoch: bigint;
  playerScore: bigint;
  playerRank: bigint;
  totalPlayers: bigint;
  topPlayers: LeaderboardPlayer[];
  epochTimeRemaining: bigint;
  lastUpdated: number;
}

export interface ClaimableReward {
  type: "epoch" | "equipment" | "gas_refund";
  amount: bigint;
  description: string;
  canClaim: boolean;
  epoch?: number;
  index?: bigint;
  proof?: string[];
}

export interface ClaimsData {
  available: ClaimableReward[];
  totalClaimable: bigint;
  lastChecked: number;
}

export interface UXState {
  // Player data
  playerAddress: string | null;

  // Character data
  character: CharacterData | null;

  // Menu state
  menu: MenuState | null;

  // Operation state
  operation: OperationState | null;

  // Pool data
  pools: PoolsData | null;

  // Leaderboard data
  leaderboard: LeaderboardData | null;

  // Claims data
  claims: ClaimsData | null;

  // UI state
  statusMessage: string;
  isLoading: boolean;
  error: string | null;

  // Event data
  lastFightSummary?: FightSummaryData;
  lastEquipmentDropped?: EquipmentDropData;
  lastHealing?: HealingData;
  lastResurrection?: ResurrectionData;
}

export interface FightSummaryData {
  enemyId: number;
  enemyLevel: number;
  roundsElapsed: number;
  victory: boolean;
  unresolved: boolean;
  xpGained: number;
  equipmentDropped?: EquipmentData;
  playerDied: boolean;
  enemyDied: boolean;
  playerHealthRemaining: number;
  enemyHealthRemaining: number;
  playerStartEndurance: number;
  enemyStartEndurance: number;
  rounds: {
    count: number;
    numbers: number[];
    playerDamages: number[];
    enemyDamages: number[];
    playerCriticals: boolean[];
    enemyCriticals: boolean[];
  };
  enemyName?: string;
  difficultyMultiplier?: number;
}

export interface EquipmentDropData {
  bonuses: number[];
  description: string;
}

export interface HealingData {
  newEndurance: number;
  cost: bigint;
}

export interface ResurrectionData {
  newEndurance: number;
  cost: bigint;
}

export interface ChainBrawlerConfig {
  address: `0x${string}`;
  chain: { id: number; name: string }; // Viem chain type
  publicClient: any; // Viem public client
  walletClient?: any; // Viem wallet client
  wagmiConfig?: any; // Wagmi config for generated functions
  contractClient?: any; // Optional contract client for adapters
}

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

// Error types
export enum ErrorType {
  NETWORK_ERROR = "Network connection failed",
  CONTRACT_ERROR = "Contract interaction failed",
  VALIDATION_ERROR = "Invalid operation",
  COOLDOWN_ERROR = "Operation on cooldown",
  CHARACTER_ERROR = "Character state error",
  TRANSACTION_ERROR = "Transaction failed",
  POOL_ERROR = "Pool operation failed",
  LEADERBOARD_ERROR = "Leaderboard operation failed",
  CLAIM_ERROR = "Prize claim failed",
  UNKNOWN_ERROR = "Unknown error occurred",
}

export interface ChainBrawlerError {
  type: ErrorType;
  code: number;
  message: string;
  originalError?: any;
  retryable: boolean;
  context?: Record<string, any>;
}

// Event types
export enum EventType {
  CHARACTER_CREATED = "characterCreated",
  CHARACTER_UPDATED = "characterUpdated",
  FIGHT_STARTED = "fightStarted",
  FIGHT_COMPLETED = "fightCompleted",
  HEALING_STARTED = "healingStarted",
  HEALING_COMPLETED = "healingCompleted",
  RESURRECTION_STARTED = "resurrectionStarted",
  RESURRECTION_COMPLETED = "resurrectionCompleted",
  OPERATION_STARTED = "operationStarted",
  OPERATION_COMPLETED = "operationCompleted",
  OPERATION_FAILED = "operationFailed",
  POOLS_UPDATED = "poolsUpdated",
  LEADERBOARD_UPDATED = "leaderboardUpdated",
  CLAIMS_UPDATED = "claimsUpdated",
  CLAIM_STARTED = "claimStarted",
  CLAIM_COMPLETED = "claimCompleted",
  CLAIM_FAILED = "claimFailed",
  STATE_CHANGED = "stateChanged",
  ERROR_OCCURRED = "errorOccurred",
  VALIDATION_FAILED = "validationFailed",
  TRANSACTION_STATUS = "transactionStatus",
  CHARACTER_DATA_REFRESH = "characterDataRefresh",
}

export interface EventPayload {
  type: EventType;
  data: any;
  timestamp: number;
}
