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
  CHARACTER_CLASSES,
  type CharacterData,
  type MenuState,
  type OperationState,
} from "@chainbrawler/core";
import React, { useEffect, useState } from "react";
import { EnemySelection } from "../primitives/EnemySelection";
import { FightSummary } from "../primitives/FightSummary";
import { OperationStatus } from "../primitives/OperationStatus";

interface CharacterDisplayProps {
  character: CharacterData | null;
  menu: MenuState | null;
  operation: OperationState | null;
  onCreateCharacter: (classId: number) => Promise<void>;
  onHealCharacter: () => Promise<void>;
  onResurrectCharacter: () => Promise<void>;
  onFightEnemy: (enemyId: number, enemyLevel: number) => Promise<void>;
  onContinueFight: () => Promise<void>;
  onFleeRound: () => Promise<void>;
}

export function CharacterDisplay({
  character,
  menu,
  operation,
  onCreateCharacter,
  onHealCharacter,
  onResurrectCharacter,
  onFightEnemy,
  onContinueFight,
  onFleeRound,
}: CharacterDisplayProps) {
  const [showEnemySelection, setShowEnemySelection] = useState(false);
  const [fightSummary, setFightSummary] = useState<any>(null);
  const [showFightSummary, setShowFightSummary] = useState(false);
  const [operationStatus, setOperationStatus] = useState<any>(null);
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);

  // Determine if a write operation is in progress
  const isWriteOperationInProgress =
    isOperationInProgress || (operation?.isActive && operation?.isWriteOperation);

  // Listen for transaction status events
  useEffect(() => {
    const handleTransactionStatus = (event: CustomEvent) => {
      setOperationStatus(event.detail);
      // Only consider write operations for UI blocking
      const isWriteOp =
        event.detail.type &&
        [
          "createCharacter",
          "healCharacter",
          "resurrectCharacter",
          "fightEnemy",
          "continueFight",
          "fleeRound",
          "claimPrize",
        ].includes(event.detail.type);

      setIsOperationInProgress(
        isWriteOp &&
          event.detail.status !== "completed" &&
          event.detail.status !== "error" &&
          event.detail.status !== "failed"
      );

      // Auto-hide operation status after completion
      if (event.detail.status === "completed") {
        setTimeout(() => {
          setOperationStatus(null);
          setIsOperationInProgress(false);
        }, 2000);
      }

      // Keep error states visible until dismissed
      if (event.detail.status === "error" || event.detail.status === "failed") {
        setIsOperationInProgress(true);
      }
    };

    const handleFightSummary = (event: CustomEvent) => {
      console.log("Fight summary event received:", event.detail);
      setFightSummary(event.detail);
      setShowFightSummary(true);
    };

    const handleCharacterDataRefresh = (event: CustomEvent) => {
      console.log("Character data refresh event received:", event.detail);
      // Force a re-render by updating a dummy state
      setOperationStatus((prev: any) => ({ ...prev, refreshTrigger: Date.now() }));
    };

    const handleContinueFightComplete = (event: CustomEvent) => {
      console.log("Continue fight operation completed:", event.detail);
      if (event.detail?.type === "continueFight" && event.detail?.status === "completed") {
        // Close the fight summary when continue fight completes successfully
        setShowFightSummary(false);
        setFightSummary(null);
        console.log("Fight summary closed after continue fight completion");
      }
    };

    // Listen for real events
    window.addEventListener("transactionStatus", handleTransactionStatus as EventListener);
    window.addEventListener("fightSummary", handleFightSummary as EventListener);
    window.addEventListener("characterDataRefresh", handleCharacterDataRefresh as EventListener);
    window.addEventListener("transactionStatus", handleContinueFightComplete as EventListener);

    return () => {
      window.removeEventListener("transactionStatus", handleTransactionStatus as EventListener);
      window.removeEventListener("fightSummary", handleFightSummary as EventListener);
      window.removeEventListener(
        "characterDataRefresh",
        handleCharacterDataRefresh as EventListener
      );
      window.removeEventListener("transactionStatus", handleContinueFightComplete as EventListener);
    };
  }, []);

  const handleCreateCharacter = async (classId: number) => {
    if (isWriteOperationInProgress) return;
    try {
      await onCreateCharacter(classId);
    } catch (error) {
      console.error("Failed to create character:", error);
    }
  };

  const handleHealCharacter = async () => {
    if (isWriteOperationInProgress) return;
    try {
      await onHealCharacter();
    } catch (error) {
      console.error("Failed to heal character:", error);
    }
  };

  const handleResurrectCharacter = async () => {
    if (isWriteOperationInProgress) return;
    try {
      await onResurrectCharacter();
    } catch (error) {
      console.error("Failed to resurrect character:", error);
    }
  };

  const handleFightEnemy = async (enemyId: number, enemyLevel: number) => {
    if (isWriteOperationInProgress) return;
    try {
      await onFightEnemy(enemyId, enemyLevel);
      setShowEnemySelection(false);
    } catch (error) {
      console.error("Failed to fight enemy:", error);
    }
  };

  const handleContinueFight = async () => {
    if (isWriteOperationInProgress) return;
    try {
      await onContinueFight();
    } catch (error) {
      console.error("Failed to continue fight:", error);
    }
  };

  const handleFleeRound = async () => {
    if (isWriteOperationInProgress) return;
    try {
      await onFleeRound();
    } catch (error) {
      console.error("Failed to flee:", error);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
      <h3>Character</h3>

      {!character?.exists ? (
        <div>
          <p>No character created yet.</p>
          {menu?.canCreateCharacter && !operation?.isActive && (
            <div>
              <p>Select your class:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {CHARACTER_CLASSES.map((charClass) => (
                  <button
                    key={charClass.id}
                    onClick={() => handleCreateCharacter(charClass.id)}
                    disabled={isWriteOperationInProgress}
                    style={{
                      padding: "0.5rem",
                      backgroundColor: isWriteOperationInProgress ? "#ccc" : "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: isWriteOperationInProgress ? "not-allowed" : "pointer",
                      opacity: isWriteOperationInProgress ? 0.6 : 1,
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{charClass.name}</div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>{charClass.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
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
                <strong>Class:</strong> {character.className || "Unknown"}
              </div>
              <div>
                <strong>Level:</strong> {character.level || 0}
              </div>
              <div>
                <strong>Experience:</strong> {character.experience || 0}
              </div>
              <div>
                <strong>Status:</strong> {character.isAlive ? "Alive" : "Dead"}
              </div>
              <div>
                <strong>Health:</strong> {character.endurance?.current || 0} /{" "}
                {character.endurance?.max || 0}
              </div>
              <div>
                <strong>Combat:</strong> {character.stats?.combat || 0}
              </div>
              <div>
                <strong>Defense:</strong> {character.stats?.defense || 0}
              </div>
              <div>
                <strong>Luck:</strong> {character.stats?.luck || 0}
              </div>
            </div>

            {character.equipment && character.equipment.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <strong>Equipment:</strong>
                <div style={{ fontSize: "0.9rem" }}>
                  {character.equipment.map((item, index) => (
                    <div key={index}>
                      {item.name}: +{item.combat} Combat, +{item.defense} Defense, +{item.luck} Luck
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {menu?.canHeal && !(operation?.isActive && operation?.isWriteOperation) && (
              <button
                onClick={handleHealCharacter}
                disabled={isWriteOperationInProgress}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: isWriteOperationInProgress ? "#ccc" : "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isWriteOperationInProgress ? "not-allowed" : "pointer",
                  opacity: isWriteOperationInProgress ? 0.6 : 1,
                }}
              >
                Heal Character
              </button>
            )}

            {menu?.canResurrect && !(operation?.isActive && operation?.isWriteOperation) && (
              <button
                onClick={handleResurrectCharacter}
                disabled={isWriteOperationInProgress}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: isWriteOperationInProgress ? "#ccc" : "#FF9800",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isWriteOperationInProgress ? "not-allowed" : "pointer",
                  opacity: isWriteOperationInProgress ? 0.6 : 1,
                }}
              >
                Resurrect Character
              </button>
            )}

            {menu?.canFight && !(operation?.isActive && operation?.isWriteOperation) && (
              <button
                onClick={() => setShowEnemySelection(true)}
                disabled={isWriteOperationInProgress}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: isWriteOperationInProgress ? "#ccc" : "#F44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isWriteOperationInProgress ? "not-allowed" : "pointer",
                  opacity: isWriteOperationInProgress ? 0.6 : 1,
                }}
              >
                Fight Enemy
              </button>
            )}

            {menu?.canContinueFight && !(operation?.isActive && operation?.isWriteOperation) && (
              <button
                onClick={handleContinueFight}
                disabled={isWriteOperationInProgress}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: isWriteOperationInProgress ? "#ccc" : "#9C27B0",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isWriteOperationInProgress ? "not-allowed" : "pointer",
                  opacity: isWriteOperationInProgress ? 0.6 : 1,
                }}
              >
                Continue Fight
              </button>
            )}

            {menu?.canFlee && !(operation?.isActive && operation?.isWriteOperation) && (
              <button
                onClick={handleFleeRound}
                disabled={isWriteOperationInProgress}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: isWriteOperationInProgress ? "#ccc" : "#607D8B",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isWriteOperationInProgress ? "not-allowed" : "pointer",
                  opacity: isWriteOperationInProgress ? 0.6 : 1,
                }}
              >
                Flee from Combat
              </button>
            )}
          </div>

          {/* Show disabled actions with reasons */}
          {menu?.disabledActions && menu.disabledActions.length > 0 && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#2a2a2a",
                border: "1px solid #444",
                borderRadius: "6px",
              }}
            >
              <h4 style={{ color: "#ccc", marginTop: 0, marginBottom: "0.5rem" }}>
                Unavailable Actions
              </h4>
              {menu.disabledActions.map((action) => (
                <div
                  key={action}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.25rem 0",
                    borderBottom: "1px solid #444",
                  }}
                >
                  <span
                    style={{
                      color: "#aaa",
                      textTransform: "capitalize",
                      fontWeight: "500",
                    }}
                  >
                    {action.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span
                    style={{
                      color: "#f44336",
                      fontStyle: "italic",
                      fontSize: "0.9rem",
                    }}
                  >
                    {menu.disabledReasons?.[action] || "Not available"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <EnemySelection
        onFightEnemy={handleFightEnemy}
        onClose={() => setShowEnemySelection(false)}
        isVisible={showEnemySelection}
      />

      <FightSummary
        fightSummary={fightSummary}
        onContinueFight={handleContinueFight}
        onFleeRound={handleFleeRound}
        onClose={() => setShowFightSummary(false)}
        isVisible={showFightSummary}
      />

      <OperationStatus
        operation={operationStatus}
        isVisible={isWriteOperationInProgress || false}
        onDismiss={() => {
          setOperationStatus(null);
          setIsOperationInProgress(false);
        }}
      />
    </div>
  );
}
