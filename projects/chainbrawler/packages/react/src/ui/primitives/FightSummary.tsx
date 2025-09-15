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

import { type FightSummaryData, getFightOutcome } from "@chainbrawler/core";
import React from "react";

interface FightSummaryProps {
  fightSummary: FightSummaryData | null;
  onContinueFight: () => Promise<void>;
  onFleeRound: () => Promise<void>;
  onClose: () => void;
  isVisible: boolean;
}

export function FightSummary({
  fightSummary,
  onContinueFight,
  onFleeRound,
  onClose,
  isVisible,
}: FightSummaryProps) {
  if (!isVisible || !fightSummary) return null;

  const outcome = getFightOutcome(fightSummary);
  const enemyName = fightSummary.enemyName || `Enemy ${fightSummary.enemyId}`;

  // Ensure all numeric values are properly converted from BigInt
  const playerHealth = Number(fightSummary.playerHealthRemaining);
  const enemyHealth = Number(fightSummary.enemyHealthRemaining);
  const playerStartHealth = Number(fightSummary.playerStartEndurance);
  const enemyStartHealth = Number(fightSummary.enemyStartEndurance);
  const xpGained = Number(fightSummary.xpGained);
  const enemyLevel = Number(fightSummary.enemyLevel);
  const roundsElapsed = Number(fightSummary.roundsElapsed);

  // Convert equipment drop values
  const equipmentDrop = fightSummary.equipmentDropped
    ? {
        combat: Number(fightSummary.equipmentDropped.combat),
        endurance: Number(fightSummary.equipmentDropped.endurance),
        defense: Number(fightSummary.equipmentDropped.defense),
        luck: Number(fightSummary.equipmentDropped.luck),
      }
    : null;

  // Convert round data
  const rounds = {
    count: Number(fightSummary.rounds.count),
    numbers: fightSummary.rounds.numbers.map(Number),
    playerDamages: fightSummary.rounds.playerDamages.map(Number),
    enemyDamages: fightSummary.rounds.enemyDamages.map(Number),
    playerCriticals: fightSummary.rounds.playerCriticals.map(Boolean),
    enemyCriticals: fightSummary.rounds.enemyCriticals.map(Boolean),
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "700px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{outcome.icon}</div>
          <h2
            style={{
              margin: 0,
              color: outcome.color,
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            {outcome.text}
          </h2>
          <p style={{ margin: "0.5rem 0 0 0", color: "#666" }}>
            vs {enemyName} (Level {enemyLevel})
          </p>
        </div>

        {/* Fight Details */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginTop: 0, color: "#333" }}>Fight Summary</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ padding: "1rem", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>Rounds</h4>
              <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>
                {roundsElapsed} rounds
              </p>
            </div>

            <div style={{ padding: "1rem", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>XP Gained</h4>
              <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "#4CAF50" }}>
                +{xpGained} XP
              </p>
            </div>
          </div>

          {/* Health Status */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ padding: "1rem", backgroundColor: "#e3f2fd", borderRadius: "4px" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#1976d2" }}>Your Health</h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: "100%",
                    height: "20px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(playerHealth / playerStartHealth) * 100}%`,
                      height: "100%",
                      backgroundColor: playerHealth > 0 ? "#4CAF50" : "#F44336",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <span style={{ fontWeight: "bold", minWidth: "40px" }}>
                  {playerHealth}/{playerStartHealth}
                </span>
              </div>
            </div>

            <div style={{ padding: "1rem", backgroundColor: "#ffebee", borderRadius: "4px" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#d32f2f" }}>Enemy Health</h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: "100%",
                    height: "20px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(enemyHealth / enemyStartHealth) * 100}%`,
                      height: "100%",
                      backgroundColor: enemyHealth > 0 ? "#F44336" : "#4CAF50",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <span style={{ fontWeight: "bold", minWidth: "40px" }}>
                  {enemyHealth}/{enemyStartHealth}
                </span>
              </div>
            </div>
          </div>

          {/* Equipment Drop */}
          {equipmentDrop && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#fff3e0",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}
            >
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#f57c00" }}>🎁 Equipment Dropped!</h4>
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold", color: "#FF9800" }}>Combat</div>
                  <div style={{ fontSize: "1.2rem" }}>+{equipmentDrop.combat}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold", color: "#4CAF50" }}>Endurance</div>
                  <div style={{ fontSize: "1.2rem" }}>+{equipmentDrop.endurance}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold", color: "#2196F3" }}>Defense</div>
                  <div style={{ fontSize: "1.2rem" }}>+{equipmentDrop.defense}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold", color: "#9C27B0" }}>Luck</div>
                  <div style={{ fontSize: "1.2rem" }}>+{equipmentDrop.luck}</div>
                </div>
              </div>
            </div>
          )}

          {/* Round Details */}
          {rounds.count > 0 && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}
            >
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>Round Details</h4>
              <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                {rounds.numbers.map((roundNum, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.25rem 0",
                      borderBottom: index < rounds.count - 1 ? "1px solid #e0e0e0" : "none",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>Round {roundNum}:</span>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <span style={{ color: "#4CAF50" }}>
                        You: {rounds.playerDamages[index]} damage
                        {rounds.playerCriticals[index] && " 💥"}
                      </span>
                      <span style={{ color: "#F44336" }}>
                        Enemy: {rounds.enemyDamages[index]} damage
                        {rounds.enemyCriticals[index] && " 💥"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          {fightSummary.unresolved && !fightSummary.playerDied && (
            <>
              <button
                onClick={onContinueFight}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#9C27B0",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                Continue Fight
              </button>
              <button
                onClick={onFleeRound}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#607D8B",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                Flee
              </button>
            </>
          )}

          <button
            onClick={onClose}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: fightSummary.unresolved ? "#666" : "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            {fightSummary.unresolved ? "Cancel" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
