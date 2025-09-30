// Leaderboard operations - load, refresh, get player rank
// Based on UX_STATE_MANAGEMENT_SPEC.md and CONTRACT_REFERENCE.md

import type { LeaderboardData, LeaderboardPlayer, OperationResult } from "../types";
import { BaseOperation } from "./BaseOperation";

export class LeaderboardOperations extends BaseOperation {
  // Load leaderboard data for a player
  async loadLeaderboard(playerAddress: string): Promise<OperationResult<LeaderboardData>> {
    if (!this.canStartOperation("loadLeaderboard")) {
      return { success: false, error: "Cannot start operation" };
    }

    this.startOperation("loadLeaderboard");
    this.store.setStatusMessage("Loading leaderboard...");

    try {
      // Get current epoch
      const epochResult = await this.handleContractCall(async () => {
        return await this.contractClient.getCurrentEpoch();
      });

      if (!epochResult.success) {
        this.failOperation(epochResult.error || "Failed to get current epoch");
        return { success: false, error: epochResult.error || "Failed to get current epoch" };
      }

      const currentEpoch = epochResult.data;
      if (!currentEpoch) {
        this.failOperation("No current epoch data");
        return { success: false, error: "No current epoch data" };
      }

      // Get player score (with fallback for contract revert)
      let scoreResult;
      try {
        scoreResult = await this.handleContractCall(async () => {
          return await this.contractClient.getEpochScore(
            playerAddress as `0x${string}`,
            currentEpoch
          );
        });
        if (!scoreResult.success) {
          console.warn("getEpochScore failed, using fallback score of 0:", scoreResult.error);
          scoreResult = { success: true, data: 0n }; // Fallback to zero score
        }
      } catch (error) {
        console.warn("getEpochScore failed, using fallback score of 0:", error);
        scoreResult = { success: true, data: 0n }; // Fallback to zero score
      }

      // Get total player count
      const totalPlayersResult = await this.handleContractCall(async () => {
        return await this.contractClient.getTotalPlayerCount();
      });

      if (!totalPlayersResult.success) {
        this.failOperation(totalPlayersResult.error || "Failed to get total player count");
        return {
          success: false,
          error: totalPlayersResult.error || "Failed to get total player count",
        };
      }

      // Get player rank by building leaderboard
      const playerRankResult = await this.calculatePlayerRank(playerAddress, currentEpoch);

      // Get top players by building from available data
      const topPlayers = await this.buildTopPlayers(10, currentEpoch);

      // Mark current player in top players list
      topPlayers.forEach((player) => {
        player.isCurrentPlayer = player.address.toLowerCase() === playerAddress.toLowerCase();
      });

      // Calculate epoch time remaining using available contract functions
      const epochTimeRemaining = await this.calculateEpochTimeRemaining();

      const leaderboardData: LeaderboardData = {
        currentEpoch,
        playerScore: scoreResult.data || 0n,
        playerRank: playerRankResult.rank,
        totalPlayers: totalPlayersResult.data || 0n,
        topPlayers,
        epochTimeRemaining,
        lastUpdated: Date.now(),
      };

      this.store.updateLeaderboard(leaderboardData);

      this.completeOperation();
      this.store.setStatusMessage("Leaderboard loaded successfully");

      return { success: true, data: leaderboardData };
    } catch (error) {
      this.failOperation("Failed to load leaderboard");
      return { success: false, error: "Failed to load leaderboard" };
    }
  }

  // Refresh leaderboard data
  async refreshLeaderboard(playerAddress: string): Promise<OperationResult<LeaderboardData>> {
    return this.loadLeaderboard(playerAddress);
  }

  // Get player rank by calculating from all players
  async getPlayerRank(playerAddress: string, epoch: bigint): Promise<OperationResult<bigint>> {
    try {
      const result = await this.calculatePlayerRank(playerAddress, epoch);
      return { success: true, data: result.rank };
    } catch (error) {
      return { success: false, error: "Failed to get player rank" };
    }
  }

  // Get current epoch
  async getCurrentEpoch(): Promise<OperationResult<bigint>> {
    try {
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.getCurrentEpoch();
      });

      if (!result.success) {
        return result;
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: "Failed to get current epoch" };
    }
  }

  // Get player score for specific epoch
  async getEpochScore(playerAddress: string, epoch: bigint): Promise<OperationResult<bigint>> {
    try {
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.getEpochScore(playerAddress as `0x${string}`, epoch);
      });

      if (!result.success) {
        return result;
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: "Failed to get epoch score" };
    }
  }

  // Get total player count
  async getTotalPlayerCount(): Promise<OperationResult<bigint>> {
    try {
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.getTotalPlayerCount();
      });

      if (!result.success) {
        return result;
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: "Failed to get total player count" };
    }
  }

  // Build top players by iterating through all players
  private async buildTopPlayers(limit: number, epoch: bigint): Promise<LeaderboardPlayer[]> {
    try {
      // Get total player count first
      const totalPlayersResult = await this.handleContractCall(async () => {
        return await this.contractClient.getTotalPlayerCount();
      });

      if (!totalPlayersResult.success || !totalPlayersResult.data) {
        console.warn("Failed to get total player count, returning empty array");
        return [];
      }

      const totalPlayers = Number(totalPlayersResult.data);
      const players: LeaderboardPlayer[] = [];

      // Fetch player data in batches to avoid overwhelming the contract
      const batchSize = Math.min(50, totalPlayers); // Process max 50 players at a time
      const maxPlayersToCheck = Math.min(totalPlayers, 100); // Limit to first 100 players for performance

      for (let i = 0; i < maxPlayersToCheck; i += batchSize) {
        const batch = [];
        const endIndex = Math.min(i + batchSize, maxPlayersToCheck);

        // Create batch of promises for parallel execution
        for (let j = i; j < endIndex; j++) {
          batch.push(this.getPlayerData(BigInt(j), epoch));
        }

        // Execute batch in parallel
        const batchResults = await Promise.allSettled(batch);

        // Process batch results
        for (const result of batchResults) {
          if (result.status === "fulfilled" && result.value) {
            players.push(result.value);
          }
        }
      }

      // Sort by score (descending) and assign ranks
      players.sort((a, b) => Number(b.score - a.score));
      players.forEach((player, index) => {
        player.rank = BigInt(index + 1);
      });

      // Return top N players
      return players.slice(0, limit);
    } catch (error) {
      console.warn("buildTopPlayers failed:", error);
      return [];
    }
  }

  // Get individual player data
  private async getPlayerData(index: bigint, epoch: bigint): Promise<LeaderboardPlayer | null> {
    try {
      // Get player address
      const addressResult = await this.handleContractCall(async () => {
        return await this.contractClient.getPlayerByIndex(index);
      });

      if (!addressResult.success || !addressResult.data) {
        return null;
      }

      const playerAddress = addressResult.data;

      // Get player score
      let score = 0n;
      try {
        const scoreResult = await this.handleContractCall(async () => {
          return await this.contractClient.getEpochScore(playerAddress, epoch);
        });
        score = scoreResult.success ? scoreResult.data || 0n : 0n;
      } catch (error) {
        // Score might not exist for player, use 0
        score = 0n;
      }

      // Get character data for level and kills
      let level = 0;
      let kills = 0;
      try {
        const characterResult = await this.handleContractCall(async () => {
          return await this.contractClient.getCharacter(playerAddress);
        });

        if (characterResult.success && characterResult.data) {
          level = characterResult.data.level;
          kills = characterResult.data.totalKills;
        }
      } catch (error) {
        // Character might not exist, use defaults
      }

      return {
        address: playerAddress,
        score,
        rank: 0n, // Will be assigned after sorting
        level,
        kills,
        isCurrentPlayer: false, // Will be set later
      };
    } catch (error) {
      return null;
    }
  }

  // Calculate player rank by building leaderboard
  private async calculatePlayerRank(
    playerAddress: string,
    epoch: bigint
  ): Promise<{ rank: bigint; totalPlayers: number }> {
    try {
      // Get total player count
      const totalPlayersResult = await this.handleContractCall(async () => {
        return await this.contractClient.getTotalPlayerCount();
      });

      if (!totalPlayersResult.success || !totalPlayersResult.data) {
        return { rank: 0n, totalPlayers: 0 };
      }

      const totalPlayers = Number(totalPlayersResult.data);

      // Get current player's score
      let playerScore = 0n;
      try {
        const scoreResult = await this.handleContractCall(async () => {
          return await this.contractClient.getEpochScore(playerAddress as `0x${string}`, epoch);
        });
        playerScore = scoreResult.success ? scoreResult.data || 0n : 0n;
      } catch (error) {
        playerScore = 0n;
      }

      // Count how many players have a higher score
      let playersAhead = 0;
      const batchSize = 25; // Smaller batches for rank calculation

      for (let i = 0; i < totalPlayers; i += batchSize) {
        const batch = [];
        const endIndex = Math.min(i + batchSize, totalPlayers);

        for (let j = i; j < endIndex; j++) {
          batch.push(this.getPlayerScore(BigInt(j), epoch));
        }

        const batchResults = await Promise.allSettled(batch);

        for (const result of batchResults) {
          if (result.status === "fulfilled" && result.value > playerScore) {
            playersAhead++;
          }
        }
      }

      // Rank is number of players ahead + 1
      const rank = BigInt(playersAhead + 1);

      return { rank, totalPlayers };
    } catch (error) {
      console.warn("calculatePlayerRank failed:", error);
      return { rank: 0n, totalPlayers: 0 };
    }
  }

  // Get player score by index and epoch
  private async getPlayerScore(index: bigint, epoch: bigint): Promise<bigint> {
    try {
      // Get player address first
      const addressResult = await this.handleContractCall(async () => {
        return await this.contractClient.getPlayerByIndex(index);
      });

      if (!addressResult.success || !addressResult.data) {
        return 0n;
      }

      // Get player score
      const scoreResult = await this.handleContractCall(async () => {
        return await this.contractClient.getEpochScore(addressResult.data!, epoch);
      });

      return scoreResult.success ? scoreResult.data || 0n : 0n;
    } catch (error) {
      return 0n;
    }
  }

  // Get leaderboard data from store
  getLeaderboardData(): LeaderboardData | null {
    return this.store.getLeaderboard();
  }

  // Parse leaderboard data from contract
  private parseLeaderboardData(contractData: any, playerAddress: string): LeaderboardData {
    return {
      currentEpoch: contractData.currentEpoch,
      playerScore: contractData.playerScore,
      playerRank: contractData.playerRank,
      totalPlayers: contractData.totalPlayers,
      topPlayers: contractData.players.map((address: string, index: number) => ({
        address,
        score: contractData.scores[index],
        rank: contractData.ranks[index],
        level: 0, // Would need additional call to get character level
        kills: 0, // Would need additional call to get character kills
        isCurrentPlayer: address.toLowerCase() === playerAddress.toLowerCase(),
      })),
      epochTimeRemaining: 0n, // Would need additional calculation
      lastUpdated: Date.now(),
    };
  }

  // Validate leaderboard data
  validateLeaderboardData(data: any): { valid: boolean; reason?: string } {
    if (!data || typeof data !== "object") {
      return { valid: false, reason: "Invalid leaderboard data format" };
    }

    const requiredFields = [
      "currentEpoch",
      "playerScore",
      "playerRank",
      "totalPlayers",
      "topPlayers",
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        return { valid: false, reason: `Missing field: ${field}` };
      }
    }

    return { valid: true };
  }

  // Get leaderboard status message
  getLeaderboardStatusMessage(): string {
    const leaderboard = this.store.getLeaderboard();

    if (!leaderboard) {
      return "Leaderboard data not loaded";
    }

    return `Epoch ${leaderboard.currentEpoch} - Rank #${leaderboard.playerRank} - Score: ${leaderboard.playerScore}`;
  }

  // Calculate epoch time remaining using available contract functions
  private async calculateEpochTimeRemaining(): Promise<bigint> {
    try {
      // Try to use contract timing functions if available
      const timeRemainingResult = await this.handleContractCall(async () => {
        return await this.contractClient.getEpochTimeRemaining();
      });

      if (timeRemainingResult.success && timeRemainingResult.data !== undefined) {
        return timeRemainingResult.data;
      }
    } catch (error) {
      console.warn("Contract epoch time remaining not available, using fallback:", error);
    }

    // Fallback calculation if contract method isn't available
    const epochDurationSeconds = 24 * 60 * 60; // 24 hours in seconds
    const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds

    // Simple calculation: assume epoch started at beginning of current day
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const epochStartTime = Math.floor(dayStart.getTime() / 1000);

    const timeElapsed = currentTime - epochStartTime;
    const timeRemaining = Math.max(0, epochDurationSeconds - timeElapsed);

    return BigInt(timeRemaining);
  }
}
