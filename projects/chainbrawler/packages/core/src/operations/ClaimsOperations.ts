// Claims operations - load, refresh, claim prizes
// Based on UX_STATE_MANAGEMENT_SPEC.md and CONTRACT_REFERENCE.md

import type { ClaimableReward, ClaimsData, OperationResult } from "../types";
import { BaseOperation } from "./BaseOperation";

export class ClaimsOperations extends BaseOperation {
  // Load claims data for a player
  async loadClaims(playerAddress: string): Promise<OperationResult<ClaimsData>> {
    if (!this.canStartOperation("loadClaims")) {
      return { success: false, error: "Cannot start operation" };
    }

    this.startOperation("loadClaims");
    this.store.setStatusMessage("Loading claims data...");

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

      const availableRewards: ClaimableReward[] = [];

      // Check last 5 epochs for claimable rewards
      for (let i = 0; i < 5; i++) {
        const epoch = currentEpoch - BigInt(i);
        if (epoch < 0n) continue;

        const reward = await this.checkEpochReward(playerAddress, epoch);
        if (reward) {
          availableRewards.push(reward);
        }
      }

      const claimsData: ClaimsData = {
        available: availableRewards,
        totalClaimable: availableRewards.reduce(
          (sum: bigint, reward: ClaimableReward) => sum + reward.amount,
          0n
        ),
        lastChecked: Date.now(),
      };

      this.store.updateClaims(claimsData);

      this.completeOperation();
      this.store.setStatusMessage("Claims data loaded successfully");

      return { success: true, data: claimsData };
    } catch (error) {
      this.failOperation("Failed to load claims");
      return { success: false, error: "Failed to load claims" };
    }
  }

  // Refresh claims data
  async refreshClaims(playerAddress: string): Promise<OperationResult<ClaimsData>> {
    return this.loadClaims(playerAddress);
  }

  // Claim a specific reward
  async claimPrize(
    epoch: bigint,
    index: bigint,
    amount: bigint,
    proof: string[]
  ): Promise<OperationResult<void>> {
    if (!this.canStartOperation("claimPrize")) {
      return { success: false, error: "Cannot start operation" };
    }

    this.startOperation("claimPrize");
    this.store.setStatusMessage("Claiming reward...");

    try {
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.claimPrize(epoch, index, amount, proof);
      });

      if (!result.success) {
        this.failOperation(result.error || "Claim failed");
        return { success: false, error: result.error || "Claim failed" };
      }

      // Refresh claims data
      const claims = this.store.getClaims();
      if (claims) {
        // Remove the claimed reward
        const updatedClaims = {
          ...claims,
          available: claims.available.filter(
            (reward: ClaimableReward) => !(reward.epoch === Number(epoch) && reward.index === index)
          ),
          totalClaimable: claims.available
            .filter(
              (reward: ClaimableReward) =>
                !(reward.epoch === Number(epoch) && reward.index === index)
            )
            .reduce((sum: bigint, reward: ClaimableReward) => sum + reward.amount, 0n),
        };
        this.store.updateClaims(updatedClaims);
      }

      this.completeOperation();
      this.store.setStatusMessage("Reward claimed successfully");

      return { success: true };
    } catch (error) {
      this.failOperation("Claim failed");
      return { success: false, error: "Claim failed" };
    }
  }

  // Check if a specific reward is claimed
  async isClaimed(epoch: bigint, index: bigint): Promise<OperationResult<boolean>> {
    try {
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.isClaimed(epoch, index);
      });

      if (!result.success) {
        return result;
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: "Failed to check claim status" };
    }
  }

  // Get merkle proof for a player
  async getMerkleProof(
    playerAddress: string,
    epoch: bigint
  ): Promise<OperationResult<{ amount: bigint; index: bigint; proof: string[] }>> {
    try {
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.getMerkleProofForPlayer(
          playerAddress as `0x${string}`,
          epoch
        );
      });

      if (!result.success) {
        return result;
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: "Failed to get merkle proof" };
    }
  }

  // Check epoch reward for a player
  private async checkEpochReward(
    playerAddress: string,
    epoch: bigint
  ): Promise<ClaimableReward | null> {
    try {
      // Check if already claimed
      const claimedResult = await this.isClaimed(epoch, 0n); // Simplified - would need proper index
      if (!claimedResult.success || claimedResult.data) {
        return null;
      }

      // Get merkle proof
      const proofResult = await this.getMerkleProof(playerAddress, epoch);
      if (!proofResult.success || !proofResult.data) {
        return null;
      }

      const { amount, index, proof } = proofResult.data;

      if (amount === 0n) {
        return null;
      }

      return {
        type: "epoch",
        amount,
        description: `Epoch ${epoch} leaderboard reward`,
        canClaim: true,
        epoch: Number(epoch),
        index,
        proof,
      };
    } catch (error) {
      console.error("Failed to check epoch reward:", error);
      return null;
    }
  }

  // Get claims data from store
  getClaimsData(): ClaimsData | null {
    return this.store.getClaims();
  }

  // Get claimable rewards
  getClaimableRewards(): ClaimableReward[] {
    const claims = this.store.getClaims();
    return claims?.available || [];
  }

  // Parse claims data from contract
  private parseClaimsData(contractData: any): ClaimsData {
    return {
      available: contractData.available || [],
      totalClaimable: contractData.totalClaimable || 0n,
      lastChecked: Date.now(),
    };
  }

  // Validate claim data
  validateClaimData(data: any): { valid: boolean; reason?: string } {
    if (!data || typeof data !== "object") {
      return { valid: false, reason: "Invalid claim data format" };
    }

    const requiredFields = ["available", "totalClaimable"];

    for (const field of requiredFields) {
      if (!(field in data)) {
        return { valid: false, reason: `Missing field: ${field}` };
      }
    }

    return { valid: true };
  }

  // Check if a reward can be claimed
  canClaimReward(reward: ClaimableReward): boolean {
    return reward.canClaim && !this.store.getOperation()?.isActive;
  }

  // Get claims status message
  getClaimsStatusMessage(): string {
    const claims = this.store.getClaims();

    if (!claims) {
      return "Claims data not loaded";
    }

    const claimableCount = claims.available.length;
    const totalValue = this.formatEther(claims.totalClaimable);

    return `${claimableCount} claimable rewards worth ${totalValue}`;
  }

  // Format ether value
  private formatEther(value: bigint): string {
    const ether = Number(value) / 1e18;
    return `${ether.toFixed(4)} CFX`;
  }
}
