// React component for leaderboard display
// Based on REFACTORING_PLAN.md

import React from "react";
import { useChainBrawlerContext } from "../providers/ChainBrawlerProvider";

export function LeaderboardDisplay() {
  const { leaderboard, menu, actions, isLoading, error, config } = useChainBrawlerContext();

  if (!menu?.canViewLeaderboard) {
    return null;
  }

  const handleLoadLeaderboard = () => {
    actions.loadLeaderboard(config.address);
  };

  return (
    <div className="leaderboard-display">
      <div className="leaderboard-header">
        <h3>Leaderboard</h3>
        <button onClick={handleLoadLeaderboard} disabled={isLoading} className="refresh-button">
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {leaderboard && (
        <div className="leaderboard-content">
          <div className="epoch-info">
            <h4>Current Epoch: {leaderboard.currentEpoch.toString()}</h4>
            <p>Time Remaining: {leaderboard.epochTimeRemaining.toString()} seconds</p>
          </div>

          <div className="player-stats">
            <h4>Your Stats</h4>
            <p>
              <strong>Rank:</strong> #{leaderboard.playerRank.toString()}
            </p>
            <p>
              <strong>Score:</strong> {leaderboard.playerScore.toString()}
            </p>
            <p>
              <strong>Total Players:</strong> {leaderboard.totalPlayers.toString()}
            </p>
          </div>

          <div className="top-players">
            <h4>Top Players</h4>
            <div className="players-list">
              {leaderboard.topPlayers.map((player: any, index: number) => (
                <div
                  key={player.address}
                  className={`player-item ${player.isCurrentPlayer ? "current-player" : ""}`}
                >
                  <div className="player-rank">#{player.rank.toString()}</div>
                  <div className="player-info">
                    <div className="player-address">
                      {player.address.slice(0, 6)}...{player.address.slice(-4)}
                    </div>
                    <div className="player-score">Score: {player.score.toString()}</div>
                    <div className="player-level">Level: {player.level}</div>
                    <div className="player-kills">Kills: {player.kills}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="leaderboard-footer">
            <p className="last-updated">
              Last updated: {new Date(leaderboard.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
