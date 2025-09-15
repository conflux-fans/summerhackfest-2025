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

import {
  calculateEnemyStats,
  ENEMY_TYPES,
  getDifficultyColor,
  getDifficultyLevel,
} from "@chainbrawler/core";
import React, { useEffect, useState } from "react";

interface EnemySelectionProps {
  onFightEnemy: (enemyId: number, enemyLevel: number) => Promise<void>;
  onClose: () => void;
  isVisible: boolean;
}

export function EnemySelection({ onFightEnemy, onClose, isVisible }: EnemySelectionProps) {
  const [selectedEnemyId, setSelectedEnemyId] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [enemyStats, setEnemyStats] = useState<ReturnType<typeof calculateEnemyStats> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate enemy stats based on ID and level
  useEffect(() => {
    const stats = calculateEnemyStats(selectedEnemyId, selectedLevel);
    setEnemyStats(stats);
  }, [selectedEnemyId, selectedLevel]);

  const handleFight = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onFightEnemy(selectedEnemyId, selectedLevel);
      onClose();
    } catch (error) {
      console.error("Failed to fight enemy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

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
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <h2 style={{ marginTop: 0, textAlign: "center" }}>Select Enemy</h2>

        {/* Enemy Selection */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ fontWeight: "bold", marginRight: "1rem" }}>Enemy Type:</label>
            <select
              value={selectedEnemyId}
              onChange={(e) => setSelectedEnemyId(Number(e.target.value))}
              style={{ padding: "0.5rem", minWidth: "200px" }}
              disabled={isLoading}
            >
              {ENEMY_TYPES.map((enemy) => (
                <option key={enemy.id} value={enemy.id}>
                  {enemy.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ fontWeight: "bold", marginRight: "1rem" }}>Level:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(Math.max(1, Math.min(100, Number(e.target.value))))}
              style={{ padding: "0.5rem", width: "100px" }}
              disabled={isLoading}
            />
            <span style={{ marginLeft: "0.5rem", color: "#666" }}>(1-100)</span>
          </div>
        </div>

        {/* Enemy Stats Display */}
        {enemyStats && (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#333" }}>{enemyStats.name}</h3>
            <p style={{ color: "#666", marginBottom: "1rem" }}>{enemyStats.description}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>Stats (Level {selectedLevel})</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>
                    <span style={{ fontWeight: "bold" }}>Health:</span>
                    <span style={{ color: "#F44336", marginLeft: "0.5rem" }}>
                      {enemyStats.scaledStats.health}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>Combat:</span>
                    <span style={{ color: "#FF9800", marginLeft: "0.5rem" }}>
                      {enemyStats.scaledStats.combat}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>Defense:</span>
                    <span style={{ color: "#2196F3", marginLeft: "0.5rem" }}>
                      {enemyStats.scaledStats.defense}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>Luck:</span>
                    <span style={{ color: "#4CAF50", marginLeft: "0.5rem" }}>
                      {enemyStats.scaledStats.luck}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ margin: "0 0 0.5rem 0" }}>Difficulty</h4>
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: "bold" }}>Multiplier:</span>
                  <span
                    style={{
                      color: getDifficultyColor(enemyStats.difficultyMultiplier),
                      marginLeft: "0.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {enemyStats.difficultyMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: "bold" }}>Rating:</span>
                  <span
                    style={{
                      color: getDifficultyColor(enemyStats.difficultyMultiplier),
                      marginLeft: "0.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {getDifficultyLevel(enemyStats.difficultyMultiplier)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={handleFight}
            disabled={isLoading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: isLoading ? "#ccc" : "#F44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Fighting..." : `Fight ${enemyStats?.name || "Enemy"}`}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
