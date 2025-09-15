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

import type { PoolsData } from "@chainbrawler/core";
import React from "react";

interface PoolsDisplayProps {
  pools: PoolsData | null;
  isLoading: boolean;
  error: string | null;
  onLoadPools: () => Promise<void>;
  onRefreshPools: () => Promise<void>;
}

export function PoolsDisplay({
  pools,
  isLoading,
  error,
  onLoadPools,
  onRefreshPools,
}: PoolsDisplayProps) {
  const handleLoadPools = async () => {
    try {
      await onLoadPools();
    } catch (error) {
      console.error("Failed to load pools:", error);
    }
  };

  const handleRefreshPools = async () => {
    try {
      await onRefreshPools();
    } catch (error) {
      console.error("Failed to refresh pools:", error);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3>Treasury Pools</h3>
        <div>
          <button
            onClick={handleLoadPools}
            disabled={isLoading}
            style={{
              padding: "0.25rem 0.5rem",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "0.5rem",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            Load
          </button>
          <button
            onClick={handleRefreshPools}
            disabled={isLoading}
            style={{
              padding: "0.25rem 0.5rem",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading && <div style={{ textAlign: "center", color: "#666" }}>Loading pools data...</div>}

      {error && <div style={{ color: "red", marginBottom: "1rem" }}>Error: {error}</div>}

      {pools && (
        <div>
          <div
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div>
                <strong>Prize Pool:</strong> {pools.prizePool?.formatted || "0 CFX"}
              </div>
              <div>
                <strong>Equipment Pool:</strong> {pools.equipmentPool?.formatted || "0 CFX"}
              </div>
              <div>
                <strong>Gas Refund Pool:</strong> {pools.gasRefundPool?.formatted || "0 CFX"}
              </div>
              <div>
                <strong>Developer Pool:</strong> {pools.developerPool?.formatted || "0 CFX"}
              </div>
              <div>
                <strong>Next Epoch Pool:</strong> {pools.nextEpochPool?.formatted || "0 CFX"}
              </div>
              <div>
                <strong>Emergency Pool:</strong> {pools.emergencyPool?.formatted || "0 CFX"}
              </div>
            </div>

            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
              <strong>Total Value:</strong>{" "}
              {pools.totalValue ? `${(Number(pools.totalValue) / 1e18).toFixed(2)} CFX` : "0 CFX"}
            </div>

            {pools.lastUpdated && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}>
                Last updated: {new Date(pools.lastUpdated).toLocaleString()}
              </div>
            )}
          </div>

          <div style={{ fontSize: "0.9rem", color: "#666" }}>
            <div>
              <strong>Prize Pool:</strong>{" "}
              {pools.prizePool?.description || "Rewards for top players each epoch"}
            </div>
            <div>
              <strong>Equipment Pool:</strong>{" "}
              {pools.equipmentPool?.description || "Funding for equipment drops"}
            </div>
            <div>
              <strong>Gas Refund Pool:</strong>{" "}
              {pools.gasRefundPool?.description || "Gas fee reimbursements"}
            </div>
            <div>
              <strong>Developer Pool:</strong>{" "}
              {pools.developerPool?.description || "Development funding"}
            </div>
            <div>
              <strong>Next Epoch Pool:</strong>{" "}
              {pools.nextEpochPool?.description || "Reserved for next epoch rewards"}
            </div>
            <div>
              <strong>Emergency Pool:</strong>{" "}
              {pools.emergencyPool?.description || "Emergency funds and contingency"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
