// React component for character display
// Based on REFACTORING_PLAN.md

import React from "react";
import { useChainBrawlerContext } from "../providers/ChainBrawlerProvider";

export function CharacterDisplay() {
  const { character, menu, operation, statusMessage, actions } = useChainBrawlerContext();

  if (!character?.exists) {
    return (
      <div className="character-display">
        <h3>No Character</h3>
        <p>{statusMessage}</p>
        {menu?.canCreateCharacter && (
          <div className="character-creation">
            <h4>Create Character</h4>
            <div className="character-classes">
              {[0, 1, 2, 3].map((classId) => (
                <button
                  key={classId}
                  onClick={() => actions.createCharacter(classId)}
                  disabled={operation?.isActive}
                  className="class-button"
                >
                  Class {classId}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="character-display">
      <h3>Character</h3>
      <div className="character-info">
        <p>
          <strong>Class:</strong> {character.className}
        </p>
        <p>
          <strong>Level:</strong> {character.level}
        </p>
        <p>
          <strong>Experience:</strong> {character.experience}
        </p>
        <p>
          <strong>Endurance:</strong> {character.endurance.current}/{character.endurance.max}
        </p>
        <p>
          <strong>Status:</strong> {character.isAlive ? "Alive" : "Dead"}
        </p>
        {character.inCombat && (
          <p>
            <strong>In Combat:</strong> Yes
          </p>
        )}
      </div>

      <div className="character-stats">
        <h4>Stats</h4>
        <p>
          <strong>Combat:</strong> {character.stats.combat}
        </p>
        <p>
          <strong>Defense:</strong> {character.stats.defense}
        </p>
        <p>
          <strong>Luck:</strong> {character.stats.luck}
        </p>
      </div>

      <div className="character-equipment">
        <h4>Equipment</h4>
        <p>
          <strong>Equipment Count:</strong> {character.equipment?.length || 0}
        </p>
        {character.equipment && character.equipment.length > 0 && (
          <div>
            {character.equipment.map((item: any, index: number) => (
              <p key={index}>
                <strong>Item {index + 1}:</strong>
                (Combat: +{item.combat || 0}, Endurance: +{item.endurance || 0}, Defense: +
                {item.defense || 0}, Luck: +{item.luck || 0})
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
