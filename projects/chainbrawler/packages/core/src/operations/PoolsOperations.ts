// Pools operations - load, refresh, calculate percentages
// Based on UX_STATE_MANAGEMENT_SPEC.md and CONTRACT_REFERENCE.md

import { ContractClient } from "../contract/ContractClient";
import type { OperationResult, PoolInfo, PoolsData } from "../types";
import { BaseOperation } from "./BaseOperation";

export class PoolsOperations extends BaseOperation {
  // Load all pools data
  async loadPools(): Promise<OperationResult<PoolsData>> {
    if (!this.canStartOperation("loadPools")) {
      return { success: false, error: "Cannot start operation" };
    }

    console.log("PoolsOperations: Starting loadPools operation");
    this.startOperation("loadPools");
    this.store.setStatusMessage("Loading pools data...");

    try {
      console.log("PoolsOperations: Calling contractClient.getAllPoolData...");
      const result = await this.handleContractCall(async () => {
        return await this.contractClient.getAllPoolData();
      });
      console.log("PoolsOperations: Contract call result:", result);

      if (!result.success) {
        console.log("PoolsOperations: Contract call failed:", result.error);
        this.failOperation(result.error || "Failed to load pools");
        return result;
      }

      console.log("PoolsOperations: Using pools data from contract client");
      const poolsData = result.data as PoolsData;
      console.log("PoolsOperations: Final pools data:", poolsData);

      console.log("PoolsOperations: Updating store...");
      this.store.updatePools(poolsData);

      console.log("PoolsOperations: Completing operation...");
      this.completeOperation();
      this.store.setStatusMessage("Pools data loaded successfully");

      console.log("PoolsOperations: Returning success result");
      return { success: true, data: poolsData };
    } catch (error) {
      console.error("PoolsOperations: Exception caught:", error);
      this.failOperation("Failed to load pools");
      return { success: false, error: "Failed to load pools" };
    }
  }

  // Refresh pools data
  async refreshPools(): Promise<OperationResult<PoolsData>> {
    return this.loadPools();
  }

  // Parse pools data from contract
  private parsePoolsData(contractData: any): PoolsData {
    const [prizePool, equipmentPool, gasRefundPool, developerPool, nextEpochPool, emergencyPool] =
      contractData;

    const pools = {
      prizePool: this.createPoolInfo(prizePool, "Rewards for top players each epoch"),
      equipmentPool: this.createPoolInfo(equipmentPool, "Funding for equipment drops"),
      gasRefundPool: this.createPoolInfo(gasRefundPool, "Gas fee reimbursements"),
      developerPool: this.createPoolInfo(developerPool, "Development funding"),
      nextEpochPool: this.createPoolInfo(nextEpochPool, "Reserved for next epoch rewards"),
      emergencyPool: this.createPoolInfo(emergencyPool, "Emergency funds and contingency"),
    };

    const totalValue =
      prizePool + equipmentPool + gasRefundPool + developerPool + nextEpochPool + emergencyPool;

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

  // Create pool info object
  private createPoolInfo(value: bigint, description: string): PoolInfo {
    return {
      value,
      formatted: this.formatEther(value),
      description,
      percentage: 0, // Will be calculated later
    };
  }

  // Format ether value
  private formatEther(value: bigint): string {
    // Convert wei to ether and format
    const ether = Number(value) / 1e18;
    return `${ether.toFixed(4)} CFX`;
  }

  // Calculate pool percentages
  calculatePoolPercentages(pools: PoolsData): PoolsData {
    const totalValue = pools.totalValue;

    if (totalValue === 0n) {
      return pools;
    }

    const updatedPools = { ...pools };

    Object.values(updatedPools).forEach((pool) => {
      if (typeof pool === "object" && "value" in pool && "percentage" in pool) {
        (pool as PoolInfo).percentage = Number((pool.value * 100n) / totalValue);
      }
    });

    return updatedPools;
  }

  // Get pools data from store
  getPoolsData(): PoolsData | null {
    return this.store.getPools();
  }

  // Validate pool data
  validatePoolData(data: any): { valid: boolean; reason?: string } {
    if (!data || typeof data !== "object") {
      return { valid: false, reason: "Invalid pool data format" };
    }

    const requiredFields = [
      "prizePool",
      "equipmentPool",
      "gasRefundPool",
      "developerPool",
      "nextEpochPool",
      "emergencyPool",
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        return { valid: false, reason: `Missing field: ${field}` };
      }
    }

    return { valid: true };
  }

  // Get pool status message
  getPoolStatusMessage(): string {
    const pools = this.store.getPools();

    if (!pools) {
      return "Pools data not loaded";
    }

    const totalValue = pools.totalValue;
    const formattedTotal = this.formatEther(totalValue);

    return `Total pool value: ${formattedTotal}`;
  }
}
