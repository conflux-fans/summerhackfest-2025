/**
 * Contract Client Interface for ChainBrawler Core
 *
 * This interface defines the contract interaction methods that will be used
 * by the core package. It's designed to be environment-agnostic and can be
 * implemented by different clients (wagmi, viem, etc.).
 */

import type { Address, Hash, PublicClient, WalletClient } from "viem";
import type { PoolsData } from "../types";

export interface ContractClient {
  // Read operations
  getCharacter(player: Address): Promise<CharacterData>;
  isCharacterInCombat(player: Address): Promise<boolean>;
  getCombatState(player: Address): Promise<CombatStateData>;
  getXPRequiredForLevel(level: number): Promise<bigint>;
  getScaledEnemyStats(enemyId: number, enemyLevel: number): Promise<EnemyStatsData>;
  getCreationFee(): Promise<bigint>;
  getHealingFee(): Promise<bigint>;
  getResurrectionFee(): Promise<bigint>;
  getAllPoolData(): Promise<PoolsData>;
  getCurrentEpoch(): Promise<bigint>;
  getEpochScore(player: Address, epoch: bigint): Promise<bigint>;
  getTotalPlayerCount(): Promise<bigint>;
  getPlayerByIndex(index: bigint): Promise<Address>;
  getEpochDuration(): Promise<bigint>;
  getEpochStartTime(): Promise<bigint>;
  getEpochTimeRemaining(): Promise<bigint>;
  isClaimed(epoch: bigint, index: bigint): Promise<boolean>;
  getMerkleProofForPlayer(player: Address, epoch: bigint): Promise<MerkleProofData>;
  isClaimWindowExpired(epoch: bigint): Promise<boolean>;
  getUnclaimedAmount(epoch: bigint): Promise<bigint>;
  getClaimDeadline(epoch: bigint): Promise<bigint>;
  canHeal(player: Address): Promise<{ canHeal: boolean; reason: string }>;
  canResurrect(player: Address): Promise<{ canResurrect: boolean; reason: string }>;

  // Write operations
  createCharacter(characterClass: number, value: bigint): Promise<Hash>;
  fightEnemy(enemyId: number, enemyLevel: number): Promise<Hash>;
  continueFight(): Promise<Hash>;
  fleeRound(): Promise<Hash>;
  healCharacter(value: bigint): Promise<Hash>;
  resurrectCharacter(value: bigint): Promise<Hash>;
  claimPrize(epoch: bigint, index: bigint, amount: bigint, proof: string[]): Promise<Hash>;

  // Event watching
  watchFightSummaryEvent(
    onLogs: (logs: FightSummaryEventLog[]) => void,
    options?: { fromBlock?: bigint; toBlock?: bigint }
  ): () => void;

  watchCharacterHealedEvent(
    onLogs: (logs: CharacterHealedEventLog[]) => void,
    options?: { fromBlock?: bigint; toBlock?: bigint }
  ): () => void;

  watchCharacterResurrectedEvent(
    onLogs: (logs: CharacterResurrectedEventLog[]) => void,
    options?: { fromBlock?: bigint; toBlock?: bigint }
  ): () => void;

  watchEquipmentDroppedEvent(
    onLogs: (logs: EquipmentDroppedEventLog[]) => void,
    options?: { fromBlock?: bigint; toBlock?: bigint }
  ): () => void;

  // Utility methods
  getAddress(): Address;
  getChainId(): number;
  getPublicClient(): PublicClient;
  getWalletClient(): WalletClient | undefined;
}

// Data types for contract interactions
export interface CharacterData {
  characterClass: number;
  level: number;
  experience: number;
  currentEndurance: number;
  maxEndurance: number;
  totalCombat: number;
  totalDefense: number;
  totalLuck: number;
  aliveFlag: boolean;
  equippedCombatBonus: number;
  equippedEnduranceBonus: number;
  equippedDefenseBonus: number;
  equippedLuckBonus: number;
  totalKills: number;
}

export interface CombatStateData {
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

export interface EnemyStatsData {
  enemyCombat: number;
  enemyEndurance: number;
  enemyDefense: number;
  enemyLuck: number;
}

export interface TopPlayersData {
  players: `0x${string}`[];
  scores: bigint[];
  ranks: bigint[];
  levels: number[];
  kills: number[];
}

export interface MerkleProofData {
  amount: bigint;
  index: bigint;
  proof: string[];
}

// Event log types
export interface FightSummaryEventLog {
  args: {
    player: Address;
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
  };
  blockNumber: bigint;
  transactionHash: Hash;
}

export interface CharacterHealedEventLog {
  args: {
    player: Address;
    newEndurance: number;
  };
  blockNumber: bigint;
  transactionHash: Hash;
}

export interface CharacterResurrectedEventLog {
  args: {
    player: Address;
  };
  blockNumber: bigint;
  transactionHash: Hash;
}

export interface EquipmentDroppedEventLog {
  args: {
    player: Address;
    bonuses: [number, number, number, number];
  };
  blockNumber: bigint;
  transactionHash: Hash;
}
