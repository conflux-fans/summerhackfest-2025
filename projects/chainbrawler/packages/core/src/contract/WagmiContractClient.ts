/**
 * Wagmi Contract Client Implementation
 *
 * Real contract client using wagmi for actual blockchain interactions.
 */

import {
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
  decodeEventLog,
} from "viem";
import {
  type ContractClient,
  CharacterData,
  type CombatStateData,
  type EnemyStatsData,
  TopPlayersData,
  type MerkleProofData,
  type FightSummaryEventLog,
  type CharacterHealedEventLog,
  type CharacterResurrectedEventLog,
  type EquipmentDroppedEventLog,
} from "./ContractClient";
import type { PoolsData, PoolInfo } from "../types";
import { getContractAddresses } from "../generated/contractAddresses";
import { ChainBrawlerABI } from "../generated/contractABI";
import { LeaderboardTreasuryABI } from "../generated/leaderboardTreasuryABI";
import {
  FightDataNormalizer,
  type RawFightSummaryEvent,
  type RawEquipmentDrop,
} from "../utils/FightDataNormalizer";

export class WagmiContractClient implements ContractClient {
  private contractAddress: Address;
  private leaderboardTreasuryAddress: Address;
  private chainId: number;
  private publicClient: PublicClient;
  private walletClient: WalletClient | undefined;
  private wagmiConfig: any;

  constructor(
    contractAddress: Address,
    chainId: number,
    publicClient: PublicClient,
    walletClient: WalletClient | undefined,
    wagmiConfig: any
  ) {
    this.contractAddress = contractAddress;
    this.chainId = chainId;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.wagmiConfig = wagmiConfig;

    // Get all contract addresses for this chain
    const addresses = getContractAddresses(chainId);
    this.leaderboardTreasuryAddress = addresses.leaderboardTreasury;
  }

  // Read operations - real contract calls
  async getCharacter(player: Address): Promise<any> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getCharacter",
        args: [player],
      });

      console.log("🔍 WagmiContractClient: Raw contract result:", result);
      console.log("🔍 WagmiContractClient: Result type:", typeof result, Array.isArray(result));

      // Parse the result tuple
      const [
        characterClass,
        level,
        experience,
        currentEndurance,
        maxEndurance,
        totalCombat,
        totalDefense,
        totalLuck,
        aliveFlag,
        equippedCombatBonus,
        equippedEnduranceBonus,
        equippedDefenseBonus,
        equippedLuckBonus,
        totalKills,
      ] = result as any[];

      console.log("🔍 WagmiContractClient: Parsed endurance values:", {
        rawCurrentEndurance: currentEndurance,
        rawMaxEndurance: maxEndurance,
        currentEnduranceType: typeof currentEndurance,
        maxEnduranceType: typeof maxEndurance,
        currentEnduranceNumber: Number(currentEndurance),
        maxEnduranceNumber: Number(maxEndurance),
      });

      // CRITICAL BUG FIX: Validate endurance values to prevent current > max
      const currentEnduranceNum = Number(currentEndurance);
      const maxEnduranceNum = Number(maxEndurance);

      if (currentEnduranceNum > maxEnduranceNum) {
        console.error("🚨 CRITICAL BUG: Contract returned currentEndurance > maxEndurance!", {
          currentEndurance: currentEnduranceNum,
          maxEndurance: maxEnduranceNum,
          player: player,
        });
        // Fix the invalid data by capping current to max
        const fixedCurrentEndurance = maxEnduranceNum;
        console.warn("🔧 FIXING: Capping currentEndurance to maxEndurance:", fixedCurrentEndurance);

        return {
          characterClass: Number(characterClass),
          level: Number(level),
          experience: Number(experience),
          currentEndurance: fixedCurrentEndurance,
          maxEndurance: maxEnduranceNum,
          totalCombat: Number(totalCombat),
          totalDefense: Number(totalDefense),
          totalLuck: Number(totalLuck),
          aliveFlag: Boolean(aliveFlag),
          equippedCombatBonus: Number(equippedCombatBonus),
          equippedEnduranceBonus: Number(equippedEnduranceBonus),
          equippedDefenseBonus: Number(equippedDefenseBonus),
          equippedLuckBonus: Number(equippedLuckBonus),
          totalKills: Number(totalKills),
        };
      }

      return {
        characterClass: Number(characterClass),
        level: Number(level),
        experience: Number(experience),
        currentEndurance: Number(currentEndurance),
        maxEndurance: Number(maxEndurance),
        totalCombat: Number(totalCombat),
        totalDefense: Number(totalDefense),
        totalLuck: Number(totalLuck),
        aliveFlag: Boolean(aliveFlag),
        equippedCombatBonus: Number(equippedCombatBonus),
        equippedEnduranceBonus: Number(equippedEnduranceBonus),
        equippedDefenseBonus: Number(equippedDefenseBonus),
        equippedLuckBonus: Number(equippedLuckBonus),
        totalKills: Number(totalKills),
      };
    } catch (error) {
      console.error("Failed to get character:", error);
      throw error;
    }
  }

  async isCharacterInCombat(player: Address): Promise<boolean> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "isCharacterInCombat",
        args: [player],
      });
      return Boolean(result);
    } catch (error) {
      console.error("Failed to check combat status:", error);
      throw error;
    }
  }

  async getCombatState(player: Address): Promise<CombatStateData> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getCombatState",
        args: [player],
      });

      const [
        enemyId,
        enemyLevel,
        enemyCurrentEndurance,
        playerCurrentEndurance,
        roundsElapsed,
        playerStartEndurance,
        enemyStartEndurance,
        lastUpdated,
        difficultyMultiplier,
      ] = result as any[];

      return {
        enemyId: Number(enemyId),
        enemyLevel: Number(enemyLevel),
        enemyCurrentEndurance: Number(enemyCurrentEndurance),
        playerCurrentEndurance: Number(playerCurrentEndurance),
        roundsElapsed: Number(roundsElapsed),
        playerStartEndurance: Number(playerStartEndurance),
        enemyStartEndurance: Number(enemyStartEndurance),
        lastUpdated: Number(lastUpdated),
        difficultyMultiplier: Number(difficultyMultiplier),
      };
    } catch (error) {
      console.error("Failed to get combat state:", error);
      throw error;
    }
  }

  async getXPRequiredForLevel(level: number): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getXPRequiredForLevel",
        args: [BigInt(level)],
      });
      return result as bigint;
    } catch (error) {
      console.error("Failed to get XP required for level:", error);
      throw error;
    }
  }

  async getScaledEnemyStats(enemyId: number, enemyLevel: number): Promise<EnemyStatsData> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getScaledEnemyStats",
        args: [BigInt(enemyId), BigInt(enemyLevel)],
      });

      const [enemyCombat, enemyEndurance, enemyDefense, enemyLuck] = result as any[];

      return {
        enemyCombat: Number(enemyCombat),
        enemyEndurance: Number(enemyEndurance),
        enemyDefense: Number(enemyDefense),
        enemyLuck: Number(enemyLuck),
      };
    } catch (error) {
      console.error("Failed to get enemy stats:", error);
      throw error;
    }
  }

  async getCreationFee(): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getCreationFee",
        args: [],
      });
      return result as bigint;
    } catch (error) {
      console.error("Failed to get creation fee:", error);
      throw error;
    }
  }

  async getHealingFee(): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getHealingFee",
        args: [],
      });
      return result as bigint;
    } catch (error) {
      console.error("Failed to get healing fee:", error);
      throw error;
    }
  }

  async getResurrectionFee(): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getResurrectionFee",
        args: [],
      });
      return result as bigint;
    } catch (error) {
      console.error("Failed to get resurrection fee:", error);
      throw error;
    }
  }

  async getAllPoolData(): Promise<PoolsData> {
    try {
      console.log("WagmiContractClient: getAllPoolData called for address:", this.contractAddress);
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getAllPoolData",
        args: [],
      });
      console.log("WagmiContractClient: getAllPoolData result:", result);

      // Parse the raw array into PoolsData format
      console.log("WagmiContractClient: Parsing raw array into PoolsData");
      const poolsData = this.parsePoolsData(result as unknown[]);
      console.log("WagmiContractClient: Parsed pools data:", poolsData);
      return poolsData;
    } catch (error) {
      console.error("WagmiContractClient: getAllPoolData failed, trying individual calls:", error);

      // Fallback to individual calls if getAllPoolData fails
      try {
        console.log("WagmiContractClient: Using individual pool calls as fallback");
        const [
          prizePool,
          equipmentPool,
          gasRefundPool,
          developerPool,
          nextEpochPool,
          emergencyPool,
        ] = await Promise.all([
          this.publicClient.readContract({
            address: this.contractAddress,
            abi: this.getContractABI(),
            functionName: "getPrizePool",
            args: [],
          }),
          this.publicClient.readContract({
            address: this.contractAddress,
            abi: this.getContractABI(),
            functionName: "getEquipmentRewardPool",
            args: [],
          }),
          this.publicClient.readContract({
            address: this.contractAddress,
            abi: this.getContractABI(),
            functionName: "getGasRefundPool",
            args: [],
          }),
          this.publicClient.readContract({
            address: this.contractAddress,
            abi: this.getContractABI(),
            functionName: "getDeveloperFund",
            args: [],
          }),
          this.publicClient.readContract({
            address: this.contractAddress,
            abi: this.getContractABI(),
            functionName: "getNextEpochReserve",
            args: [],
          }),
          this.publicClient.readContract({
            address: this.contractAddress,
            abi: this.getContractABI(),
            functionName: "getEmergencyReserve",
            args: [],
          }),
        ]);

        console.log("WagmiContractClient: Individual calls result:", {
          prizePool,
          equipmentPool,
          gasRefundPool,
          developerPool,
          nextEpochPool,
          emergencyPool,
        });

        // Parse array into PoolsData format for consistency
        console.log("WagmiContractClient: Fallback parsing individual calls into PoolsData");
        const fallbackPoolsData = this.parsePoolsData([
          prizePool,
          equipmentPool,
          gasRefundPool,
          developerPool,
          nextEpochPool,
          emergencyPool,
        ]);
        console.log("WagmiContractClient: Fallback parsed pools data:", fallbackPoolsData);
        return fallbackPoolsData;
      } catch (fallbackError) {
        console.error("WagmiContractClient: Individual pool calls also failed:", fallbackError);
        throw new Error(
          `Failed to fetch pools data: ${error}. Fallback also failed: ${fallbackError}`
        );
      }
    }
  }

  private parsePoolsData(contractData: unknown[]): PoolsData {
    const [prizePool, equipmentPool, gasRefundPool, developerPool, nextEpochPool, emergencyPool] =
      contractData;

    const pools = {
      prizePool: this.createPoolInfo(prizePool as bigint, "Rewards for top players each epoch"),
      equipmentPool: this.createPoolInfo(equipmentPool as bigint, "Funding for equipment drops"),
      gasRefundPool: this.createPoolInfo(gasRefundPool as bigint, "Gas fee reimbursements"),
      developerPool: this.createPoolInfo(developerPool as bigint, "Development funding"),
      nextEpochPool: this.createPoolInfo(
        nextEpochPool as bigint,
        "Reserved for next epoch rewards"
      ),
      emergencyPool: this.createPoolInfo(
        emergencyPool as bigint,
        "Emergency funds and contingency"
      ),
    };

    const totalValue =
      (prizePool as bigint) +
      (equipmentPool as bigint) +
      (gasRefundPool as bigint) +
      (developerPool as bigint) +
      (nextEpochPool as bigint) +
      (emergencyPool as bigint);

    // Calculate percentages
    Object.values(pools).forEach((pool) => {
      pool.percentage = totalValue > 0n ? Number((pool.value * 100n) / totalValue) : 0;
    });

    return {
      ...pools,
      totalValue,
      lastUpdated: Date.now(),
    };
  }

  private createPoolInfo(value: bigint, description: string): PoolInfo {
    return {
      value,
      formatted: this.formatEther(value),
      description,
      percentage: 0, // Will be calculated later
    };
  }

  async getCurrentEpoch(): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getCurrentEpoch",
        args: [],
      });
      return result as bigint;
    } catch (error) {
      console.error("Failed to get current epoch:", error);
      throw error;
    }
  }

  async getEpochScore(player: Address, epoch: bigint): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getEpochScore",
        args: [player, epoch],
      });
      return result as bigint;
    } catch (error) {
      console.error("Failed to get epoch score:", error);
      throw error;
    }
  }

  async getPlayerByIndex(index: bigint): Promise<Address> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getPlayerByIndex",
        args: [index],
      });
      return result as Address;
    } catch (error) {
      console.error("Failed to get player by index:", error);
      throw error;
    }
  }

  async getTotalPlayerCount(): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getTotalPlayerCount",
        args: [],
      });
      return result as bigint;
    } catch (error) {
      console.error("Failed to get total player count:", error);
      throw error;
    }
  }

  async getEpochDuration(): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getEpochDuration",
        args: [],
      });
      return result as bigint;
    } catch (error) {
      console.error("Failed to get epoch duration:", error);
      throw error;
    }
  }

  async getEpochStartTime(): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getEpochStartTime",
        args: [],
      });
      return result as bigint;
    } catch (error) {
      console.error("Failed to get epoch start time:", error);
      throw error;
    }
  }

  async getEpochTimeRemaining(): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "getEpochTimeRemaining",
        args: [],
      });
      return result as bigint;
    } catch (error) {
      console.error("Failed to get epoch time remaining:", error);
      throw error;
    }
  }

  async isClaimed(epoch: bigint, index: bigint): Promise<boolean> {
    try {
      const result = await this.publicClient.readContract({
        address: this.leaderboardTreasuryAddress,
        abi: LeaderboardTreasuryABI,
        functionName: "isClaimed",
        args: [epoch, index],
      });
      return Boolean(result);
    } catch (error) {
      console.error("Failed to check claim status:", error);
      throw error;
    }
  }

  async getMerkleProofForPlayer(player: Address, epoch: bigint): Promise<MerkleProofData> {
    // This method is implemented off-chain using merkle tree utilities
    // For now, return empty data structure as placeholder
    // In a real implementation, this would fetch leaderboard data and generate proofs
    console.warn("getMerkleProofForPlayer should be implemented with leaderboard data from API");
    return {
      amount: 0n,
      index: 0n,
      proof: [],
    };
  }

  async isClaimWindowExpired(epoch: bigint): Promise<boolean> {
    try {
      const result = await this.publicClient.readContract({
        address: this.leaderboardTreasuryAddress,
        abi: LeaderboardTreasuryABI,
        functionName: "isClaimWindowExpired",
        args: [epoch],
      });
      return Boolean(result);
    } catch (error) {
      console.error("Failed to check claim window expiry:", error);
      throw error;
    }
  }

  async getUnclaimedAmount(epoch: bigint): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.leaderboardTreasuryAddress,
        abi: LeaderboardTreasuryABI,
        functionName: "getUnclaimedAmount",
        args: [epoch],
      });
      return BigInt(result as unknown as string);
    } catch (error) {
      console.error("Failed to get unclaimed amount:", error);
      throw error;
    }
  }

  async getClaimDeadline(epoch: bigint): Promise<bigint> {
    try {
      const result = await this.publicClient.readContract({
        address: this.leaderboardTreasuryAddress,
        abi: LeaderboardTreasuryABI,
        functionName: "getClaimDeadline",
        args: [epoch],
      });
      return BigInt(result as unknown as string);
    } catch (error) {
      console.error("Failed to get claim deadline:", error);
      throw error;
    }
  }

  async canHeal(player: Address): Promise<{ canHeal: boolean; reason: string }> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "canHeal",
        args: [player],
      });

      const [canHealResult, reason] = result as any[];

      return {
        canHeal: Boolean(canHealResult),
        reason: String(reason),
      };
    } catch (error) {
      console.error("Failed to check heal eligibility:", error);
      throw error;
    }
  }

  async canResurrect(player: Address): Promise<{ canResurrect: boolean; reason: string }> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "canResurrect",
        args: [player],
      });

      const [canResurrectResult, reason] = result as any[];

      return {
        canResurrect: Boolean(canResurrectResult),
        reason: String(reason),
      };
    } catch (error) {
      console.error("Failed to check resurrect eligibility:", error);
      throw error;
    }
  }

  // Write operations - real contract calls
  async createCharacter(characterClass: number, value: bigint): Promise<Hash> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error("Wallet client with account required for write operations");
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "createCharacter",
        args: [BigInt(characterClass)],
        value: value,
        account: this.walletClient.account,
        chain: undefined,
      });

      // Emit transaction status events for UX orchestration
      this.emitTransactionStatus("createCharacter", hash, { characterClass });

      return hash;
    } catch (error) {
      console.error("Failed to create character:", error);

      // Emit error status for UI feedback
      this.emitErrorStatus("createCharacter", error);

      throw error;
    }
  }

  async fightEnemy(enemyId: number, enemyLevel: number): Promise<Hash> {
    console.log("WagmiContractClient: fightEnemy called with:", { enemyId, enemyLevel });
    console.log("WagmiContractClient: walletClient available:", !!this.walletClient);
    console.log("WagmiContractClient: walletClient account:", this.walletClient?.account?.address);
    console.log("WagmiContractClient: contractAddress:", this.contractAddress);

    if (!this.walletClient || !this.walletClient.account) {
      console.error(
        "WagmiContractClient: Wallet client with account required for write operations"
      );
      throw new Error("Wallet client with account required for write operations");
    }

    try {
      console.log("WagmiContractClient: Calling writeContract...");
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "fightEnemy",
        args: [BigInt(enemyId), BigInt(enemyLevel)],
        account: this.walletClient.account,
        chain: undefined,
      });

      console.log("WagmiContractClient: writeContract successful, hash:", hash);

      // Emit transaction status events for UX orchestration
      this.emitTransactionStatus("fightEnemy", hash, { enemyId, enemyLevel });

      return hash;
    } catch (error) {
      console.error("WagmiContractClient: Failed to fight enemy:", error);
      this.emitErrorStatus("fightEnemy", error);
      throw error;
    }
  }

  async continueFight(): Promise<Hash> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error("Wallet client with account required for write operations");
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "continueFight",
        args: [],
        account: this.walletClient.account,
        chain: undefined,
      });

      // Emit transaction status events for UX orchestration
      this.emitTransactionStatus("continueFight", hash, {});

      return hash;
    } catch (error) {
      console.error("Failed to continue fight:", error);
      this.emitErrorStatus("continueFight", error);
      throw error;
    }
  }

  async fleeRound(): Promise<Hash> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error("Wallet client with account required for write operations");
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "fleeRound",
        args: [],
        account: this.walletClient.account,
        chain: undefined,
      });

      // Emit transaction status events for UX orchestration
      this.emitTransactionStatus("fleeRound", hash, {});

      return hash;
    } catch (error) {
      console.error("Failed to flee round:", error);
      this.emitErrorStatus("fleeRound", error);
      throw error;
    }
  }

  async healCharacter(value: bigint): Promise<Hash> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error("Wallet client with account required for write operations");
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "healCharacter",
        args: [],
        value: value,
        account: this.walletClient.account,
        chain: undefined,
      });

      // Emit transaction status events for UX orchestration
      this.emitTransactionStatus("healCharacter", hash, {});

      return hash;
    } catch (error) {
      console.error("Failed to heal character:", error);
      this.emitErrorStatus("healCharacter", error);
      throw error;
    }
  }

  async resurrectCharacter(value: bigint): Promise<Hash> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error("Wallet client with account required for write operations");
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: this.getContractABI(),
        functionName: "resurrectCharacter",
        args: [],
        value: value,
        account: this.walletClient.account,
        chain: undefined,
      });

      // Emit transaction status events for UX orchestration
      this.emitTransactionStatus("resurrectCharacter", hash, {});

      return hash;
    } catch (error) {
      console.error("Failed to resurrect character:", error);
      this.emitErrorStatus("resurrectCharacter", error);
      throw error;
    }
  }

  async claimPrize(epoch: bigint, index: bigint, amount: bigint, proof: string[]): Promise<Hash> {
    if (!this.walletClient || !this.walletClient.account) {
      throw new Error("Wallet client with account required for write operations");
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: this.leaderboardTreasuryAddress,
        abi: LeaderboardTreasuryABI,
        functionName: "claim",
        args: [
          epoch,
          index,
          this.walletClient.account.address,
          amount,
          proof as readonly `0x${string}`[],
        ],
        account: this.walletClient.account,
        chain: undefined,
      });

      // Emit transaction status events for UX orchestration
      this.emitTransactionStatus("claimPrize", hash, {});

      return hash;
    } catch (error) {
      console.error("Failed to claim prize:", error);
      this.emitErrorStatus("claimPrize", error);
      throw error;
    }
  }

  // Event watching - real contract events
  watchFightSummaryEvent(
    onLogs: (logs: FightSummaryEventLog[]) => void,
    options?: { fromBlock?: bigint; toBlock?: bigint }
  ): () => void {
    return this.publicClient.watchContractEvent({
      address: this.contractAddress,
      abi: this.getContractABI(),
      eventName: "FightSummary",
      onLogs: (logs) => {
        onLogs(logs as unknown as FightSummaryEventLog[]);
      },
      ...options,
    });
  }

  watchCharacterHealedEvent(
    onLogs: (logs: CharacterHealedEventLog[]) => void,
    options?: { fromBlock?: bigint; toBlock?: bigint }
  ): () => void {
    return this.publicClient.watchContractEvent({
      address: this.contractAddress,
      abi: this.getContractABI(),
      eventName: "CharacterHealed",
      onLogs: (logs) => {
        onLogs(logs as unknown as CharacterHealedEventLog[]);
      },
      ...options,
    });
  }

  watchCharacterResurrectedEvent(
    onLogs: (logs: CharacterResurrectedEventLog[]) => void,
    options?: { fromBlock?: bigint; toBlock?: bigint }
  ): () => void {
    return this.publicClient.watchContractEvent({
      address: this.contractAddress,
      abi: this.getContractABI(),
      eventName: "CharacterResurrected",
      onLogs: (logs) => {
        onLogs(logs as unknown as CharacterResurrectedEventLog[]);
      },
      ...options,
    });
  }

  watchEquipmentDroppedEvent(
    onLogs: (logs: EquipmentDroppedEventLog[]) => void,
    options?: { fromBlock?: bigint; toBlock?: bigint }
  ): () => void {
    return this.publicClient.watchContractEvent({
      address: this.contractAddress,
      abi: this.getContractABI(),
      eventName: "EquipmentDropped",
      onLogs: (logs) => {
        onLogs(logs as unknown as EquipmentDroppedEventLog[]);
      },
      ...options,
    });
  }

  // Utility methods
  getAddress(): Address {
    return this.contractAddress;
  }

  getChainId(): number {
    return this.chainId;
  }

  getPublicClient(): PublicClient {
    return this.publicClient;
  }

  getWalletClient(): WalletClient | undefined {
    return this.walletClient;
  }

  // Private helper methods
  private getContractABI(): readonly any[] {
    return ChainBrawlerABI;
  }

  private formatEther(value: bigint): string {
    // Simple ether formatting - in production, use a proper library
    const ether = Number(value) / 1e18;
    return `${ether.toFixed(4)} CFX`;
  }

  // Transaction status handling for UX orchestration
  private emitTransactionStatus(operationType: string, txHash: Hash, args?: any): void {
    if (typeof window === "undefined") return;

    // Emit pending status immediately with comprehensive data
    window.dispatchEvent(
      new CustomEvent("transactionStatus", {
        detail: {
          type: operationType,
          status: "pending",
          hash: txHash,
          args: FightDataNormalizer.normalizeBigInts(args || {}),
          result: null,
          message: `Transaction submitted. Waiting for confirmation...`,
          progress: 0,
        },
      })
    );

    // Wait for transaction confirmation
    this.waitForTransactionConfirmation(txHash, operationType, args).catch((error) => {
      console.error("WagmiContractClient: Error in waitForTransactionConfirmation:", error);
    });
  }

  private async waitForTransactionConfirmation(
    txHash: Hash,
    operationType: string,
    args?: any
  ): Promise<void> {
    if (!this.publicClient) return;

    try {
      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: 60000, // 60 seconds timeout
      });

      // Emit confirming status with comprehensive data
      window.dispatchEvent(
        new CustomEvent("transactionStatus", {
          detail: {
            type: operationType,
            status: "confirming",
            hash: txHash,
            args: FightDataNormalizer.normalizeBigInts(args || {}),
            result: FightDataNormalizer.normalizeBigInts({
              receipt: receipt.transactionHash,
              blockNumber: receipt.blockNumber,
            }),
            message: `Transaction confirmed! Processing ${operationType}...`,
            progress: 50,
          },
        })
      );

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Handle operation-specific completion logic
      if (operationType === "fightEnemy" || operationType === "fleeRound") {
        // For fight operations, check for FightSummary event
        this.handleFightSummaryEvent(receipt);
      }

      // Emit completed status with comprehensive data
      window.dispatchEvent(
        new CustomEvent("transactionStatus", {
          detail: {
            type: operationType,
            status: "completed",
            hash: txHash,
            args: FightDataNormalizer.normalizeBigInts(args || {}),
            result: FightDataNormalizer.normalizeBigInts({
              receipt: receipt.transactionHash,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed,
              status: receipt.status,
            }),
            message: `${operationType} completed successfully!`,
            progress: 100,
          },
        })
      );

      // Emit character data refresh event for UI updates
      if (
        operationType === "createCharacter" ||
        operationType === "healCharacter" ||
        operationType === "resurrectCharacter" ||
        operationType === "fightEnemy" ||
        operationType === "fleeRound"
      ) {
        window.dispatchEvent(
          new CustomEvent("characterDataRefresh", {
            detail: { operationType, txHash, shouldRefresh: true },
          })
        );
      }
    } catch (error) {
      console.error("Transaction confirmation failed:", error);

      // Create user-friendly error message
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Handle user rejection errors with simple, user-friendly messages
      let userFriendlyMessage = errorMessage;
      if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("User rejected the request")
      ) {
        userFriendlyMessage = "Transaction was cancelled. You can try again when ready.";
      } else if (errorMessage.includes("insufficient funds")) {
        userFriendlyMessage = "Insufficient funds for this transaction. Please check your balance.";
      } else if (errorMessage.includes("gas")) {
        userFriendlyMessage = "Transaction failed due to gas issues. Please try again.";
      } else if (errorMessage.includes("network")) {
        userFriendlyMessage = "Network error occurred. Please check your connection and try again.";
      } else if (errorMessage.includes("timeout")) {
        userFriendlyMessage = "Transaction timed out. Please try again.";
      }

      // Emit failed status
      window.dispatchEvent(
        new CustomEvent("transactionStatus", {
          detail: {
            type: operationType,
            status: "failed",
            transactionHash: txHash,
            message: userFriendlyMessage,
            progress: 0,
            error: {
              code: 5000,
              message: userFriendlyMessage,
              originalError: error,
            },
          },
        })
      );
    }
  }

  private handleFightSummaryEvent(receipt: any): void {
    if (!this.publicClient || !receipt) return;

    try {
      // Find FightSummary event in logs
      const fightSummaryLog = receipt.logs.find((log: any) => {
        try {
          const decoded = decodeEventLog({
            abi: this.getContractABI(),
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === "FightSummary";
        } catch {
          return false;
        }
      });

      if (fightSummaryLog) {
        const fightSummaryDecoded = decodeEventLog({
          abi: this.getContractABI(),
          data: fightSummaryLog.data,
          topics: fightSummaryLog.topics,
        });

        // Check for EquipmentDropped event in the same transaction
        let equipmentDropped;
        const equipmentDropLog = receipt.logs.find((log: any) => {
          try {
            const decoded = decodeEventLog({
              abi: this.getContractABI(),
              data: log.data,
              topics: log.topics,
            });
            return decoded.eventName === "EquipmentDropped";
          } catch {
            return false;
          }
        });

        if (equipmentDropLog) {
          const equipmentDecoded = decodeEventLog({
            abi: this.getContractABI(),
            data: equipmentDropLog.data,
            topics: equipmentDropLog.topics,
          });

          // Transform bonuses array to equipment object
          const args = equipmentDecoded.args as any;
          if (args && args.bonuses) {
            const bonuses = args.bonuses as [number, number, number, number];
            equipmentDropped = {
              combat: bonuses[0],
              endurance: bonuses[1],
              defense: bonuses[2],
              luck: bonuses[3],
            };
          }
        }

        // Build fight summary data for UI
        const args = fightSummaryDecoded.args as any;
        if (!args) return;

        // Convert raw contract data to normalized format
        const rawFightData: RawFightSummaryEvent = {
          enemyId: args.enemyId,
          enemyLevel: args.enemyLevel,
          roundsElapsed: args.roundsElapsed,
          playerStartEndurance: args.playerStartEndurance,
          playerEndurance: args.playerEndurance,
          enemyStartEndurance: args.enemyStartEndurance,
          enemyEndurance: args.enemyEndurance,
          victory: args.victory,
          unresolved: args.unresolved,
          roundNumbers: args.roundNumbers || [],
          playerDamages: args.playerDamages || [],
          enemyDamages: args.enemyDamages || [],
          playerCriticals: args.playerCriticals || [],
          enemyCriticals: args.enemyCriticals || [],
          xpGained: args.xpGained,
          difficultyMultiplier: args.difficultyMultiplier,
        };

        // Normalize equipment drop if present
        const rawEquipmentDrop: RawEquipmentDrop | undefined = equipmentDropped
          ? {
              bonuses: Array.isArray(equipmentDropped)
                ? equipmentDropped
                : [
                    equipmentDropped.combat || 0,
                    equipmentDropped.endurance || 0,
                    equipmentDropped.defense || 0,
                    equipmentDropped.luck || 0,
                  ],
              description: `Equipment: +${equipmentDropped.combat} Combat, +${equipmentDropped.defense} Defense, +${equipmentDropped.luck} Luck`,
            }
          : undefined;

        // Use the normalizer to create comprehensive fight summary data
        const fightSummaryData = FightDataNormalizer.normalizeFightSummary(
          rawFightData,
          rawEquipmentDrop
        );

        console.log(
          "WagmiContractClient: Emitting fight summary with equipment drops:",
          fightSummaryData
        );

        // Emit fight summary event with complete data (normalize BigInt values)
        window.dispatchEvent(
          new CustomEvent("fightSummary", {
            detail: FightDataNormalizer.normalizeBigInts(fightSummaryData),
          })
        );
      }
    } catch (error) {
      console.error("Failed to handle FightSummary event:", error);
    }
  }

  // Error status handling for immediate UI feedback
  private emitErrorStatus(operationType: string, error: any): void {
    if (typeof window === "undefined") return;

    // Extract error message and code
    let errorMessage = "Unknown error occurred";
    let errorCode = 5000;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Try to extract error code from various error formats
    if (error?.code) {
      errorCode = error.code;
    } else if (error?.error?.code) {
      errorCode = error.error.code;
    } else if (error?.data?.code) {
      errorCode = error.data.code;
    } else if (error?.reason) {
      const match = error.reason.match(/revert\s+(\d+)/);
      if (match) errorCode = parseInt(match[1]);
    } else if (error?.message) {
      const match = error.message.match(/revert\s+(\d+)/);
      if (match) errorCode = parseInt(match[1]);
    }

    // Handle user rejection errors with simple, user-friendly messages
    let userFriendlyMessage = errorMessage;
    if (
      errorMessage.includes("User rejected") ||
      errorMessage.includes("User rejected the request")
    ) {
      userFriendlyMessage = "Transaction was cancelled. You can try again when ready.";
    } else if (errorMessage.includes("insufficient funds")) {
      userFriendlyMessage = "Insufficient funds for this transaction. Please check your balance.";
    } else if (errorMessage.includes("gas")) {
      userFriendlyMessage = "Transaction failed due to gas issues. Please try again.";
    } else if (errorMessage.includes("network")) {
      userFriendlyMessage = "Network error occurred. Please check your connection and try again.";
    }

    // Emit error status immediately with comprehensive data
    window.dispatchEvent(
      new CustomEvent("transactionStatus", {
        detail: {
          type: operationType,
          status: "error",
          hash: null,
          args: {},
          result: null,
          message: userFriendlyMessage, // Use user-friendly message instead of technical details
          progress: 0,
          error: FightDataNormalizer.normalizeBigInts({
            code: errorCode,
            message: userFriendlyMessage, // Use user-friendly message here too
            originalError: error,
          }),
        },
      })
    );
  }
}
