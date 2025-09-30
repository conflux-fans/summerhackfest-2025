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

import { formatTimeRemaining, type LeaderboardData } from "@chainbrawler/core";
import React from "react";

interface LeaderboardDisplayProps {
  leaderboard: LeaderboardData | null;
  isLoading: boolean;
  error: string | null;
  onLoadLeaderboard: () => Promise<void>;
  onRefreshLeaderboard: () => Promise<void>;
}

export function LeaderboardDisplay({
  leaderboard,
  isLoading,
  error,
  onLoadLeaderboard,
  onRefreshLeaderboard,
}: LeaderboardDisplayProps) {
  const handleLoadLeaderboard = async () => {
    try {
      await onLoadLeaderboard();
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  };

  const handleRefreshLeaderboard = async () => {
    try {
      await onRefreshLeaderboard();
    } catch (error) {
      console.error("Failed to refresh leaderboard:", error);
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
        <h3>Leaderboard</h3>
        <div>
          <button
            onClick={handleLoadLeaderboard}
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
            onClick={handleRefreshLeaderboard}
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
        <div style={{ textAlign: "center", color: "#666" }}>Loading leaderboard data...</div>
      )}

      {error && <div style={{ color: "red", marginBottom: "1rem" }}>Error: {error}</div>}

      {leaderboard && (
        <div>
          <div
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div>
                <strong>Current Epoch:</strong> {leaderboard.currentEpoch?.toString() || "0"}
              </div>
              <div>
                <strong>Your Rank:</strong> #{leaderboard.playerRank?.toString() || "0"}
              </div>
              <div>
                <strong>Your Score:</strong> {leaderboard.playerScore?.toString() || "0"}
              </div>
            </div>

            {leaderboard.epochTimeRemaining && Number(leaderboard.epochTimeRemaining) > 0 ? (
              <div style={{ marginTop: "1rem" }}>
                <strong>Time Remaining:</strong>{" "}
                {formatTimeRemaining(leaderboard.epochTimeRemaining)}
              </div>
            ) : null}

            <div style={{ marginTop: "1rem" }}>
              <strong>Total Players:</strong> {leaderboard.totalPlayers?.toString() || "0"}
            </div>
          </div>

          {leaderboard.topPlayers && leaderboard.topPlayers.length > 0 && (
            <div>
              <h4>Top Players</h4>
              <div style={{ background: "#f9f9f9", padding: "1rem", borderRadius: "4px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto",
                    gap: "1rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <div>Rank</div>
                  <div>Address</div>
                  <div>Score</div>
                  <div>Level</div>
                </div>
                {leaderboard.topPlayers.slice(0, 10).map((player, index) => (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto auto",
                      gap: "1rem",
                      padding: "0.5rem 0",
                      backgroundColor: player.isCurrentPlayer ? "#e3f2fd" : "transparent",
                      borderRadius: "4px",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>
                      #{player.rank?.toString() || index + 1}
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                      {player.address?.slice(0, 6)}...{player.address?.slice(-4)}
                      {player.isCurrentPlayer && (
                        <span style={{ color: "#2196F3", marginLeft: "0.5rem" }}>(You)</span>
                      )}
                    </div>
                    <div>{player.score?.toString() || "0"}</div>
                    <div>{player.level || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {leaderboard.lastUpdated && (
            <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
              Last updated: {new Date(leaderboard.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
