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

import { type ClaimableReward, type ClaimsData, formatEthAmount } from "@chainbrawler/core";
import React from "react";

interface ClaimsDisplayProps {
  claims: ClaimsData | null;
  isLoading: boolean;
  error: string | null;
  onLoadClaims: () => Promise<void>;
  onRefreshClaims: () => Promise<void>;
  onClaimPrize: (epoch: bigint, index: bigint, amount: bigint, proof: string[]) => Promise<void>;
}

export function ClaimsDisplay({
  claims,
  isLoading,
  error,
  onLoadClaims,
  onRefreshClaims,
  onClaimPrize,
}: ClaimsDisplayProps) {
  const handleLoadClaims = async () => {
    try {
      await onLoadClaims();
    } catch (error) {
      console.error("Failed to load claims:", error);
    }
  };

  const handleRefreshClaims = async () => {
    try {
      await onRefreshClaims();
    } catch (error) {
      console.error("Failed to refresh claims:", error);
    }
  };

  const handleClaimPrize = async (reward: ClaimableReward) => {
    if (!reward.epoch || !reward.index || !reward.amount || !reward.proof) {
      console.error("Invalid reward data for claiming");
      return;
    }

    try {
      await onClaimPrize(
        BigInt(reward.epoch),
        BigInt(reward.index),
        BigInt(reward.amount),
        reward.proof
      );
    } catch (error) {
      console.error("Failed to claim prize:", error);
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
        <h3>Prize Claims</h3>
        <div>
          <button
            onClick={handleLoadClaims}
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
            onClick={handleRefreshClaims}
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

      {isLoading && (
        <div style={{ textAlign: "center", color: "#666" }}>Loading claims data...</div>
      )}

      {error && <div style={{ color: "red", marginBottom: "1rem" }}>Error: {error}</div>}

      {claims && (
        <div>
          <div
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Total Claimable:</strong> {formatEthAmount(claims.totalClaimable || 0n)}
              </div>
              <div>
                <strong>Available Rewards:</strong> {claims.available?.length || 0}
              </div>
            </div>

            {claims.lastChecked && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}>
                Last checked: {new Date(claims.lastChecked).toLocaleString()}
              </div>
            )}
          </div>

          {claims.available && claims.available.length > 0 ? (
            <div>
              <h4>Available Rewards</h4>
              <div style={{ background: "#f9f9f9", padding: "1rem", borderRadius: "4px" }}>
                {claims.available.map((reward, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      marginBottom: "0.5rem",
                      backgroundColor: reward.canClaim ? "#e8f5e8" : "#f5f5f5",
                      borderRadius: "4px",
                      border: reward.canClaim ? "1px solid #4CAF50" : "1px solid #ddd",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold" }}>
                        {reward.description || `Epoch ${reward.epoch} Reward`}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#666" }}>
                        Amount: {String(formatEthAmount(reward.amount || 0n))}
                        {reward.epoch && ` | Epoch: ${reward.epoch}`}
                        {reward.index ? ` | Index: ${reward.index.toString()}` : ""}
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaimPrize(reward)}
                      disabled={!reward.canClaim}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: reward.canClaim ? "#4CAF50" : "#ccc",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: reward.canClaim ? "pointer" : "not-allowed",
                        opacity: reward.canClaim ? 1 : 0.6,
                      }}
                    >
                      {reward.canClaim ? "Claim" : "Claimed"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#666", padding: "2rem" }}>
              No claimable rewards available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
