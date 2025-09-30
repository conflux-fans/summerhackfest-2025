// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/**
 * @title IChainBrawlerUI
 * @author ChainBrawler Team
 * @notice Clean, UI-focused interface for ChainBrawler
 * @dev This interface exposes only the functions needed for UI integration
 */
interface IChainBrawlerUI {
    // ==================== Data Structures

    struct CharacterData {
        // Base stats (without equipment)
        uint256 baseLevel;
        uint256 baseCombat;
        uint256 baseMaxEndurance;
        uint256 baseDefense;
        uint256 baseLuck;
        // Equipment bonuses
        uint256 equipmentCombatBonus;
        uint256 equipmentEnduranceBonus;
        uint256 equipmentDefenseBonus;
        uint256 equipmentLuckBonus;
        // Total stats (base + equipment)
        uint256 totalCombat;
        uint256 totalMaxEndurance;
        uint256 totalDefense;
        uint256 totalLuck;
        // Current state
        uint256 currentEndurance;
        bool isAlive;
        bool inCombat;
        // Progression
        uint256 experience;
        uint256 level;
        uint256 totalKills;
        uint256 characterClass;
    }

    // ==================== Events for UI Updates

    /// @notice Emitted when a new character is created
    /// @param player The player address
    /// @param characterClass The character class that was created
    event CharacterCreated(address indexed player, uint256 indexed characterClass);
    /// @notice Emitted when a character is healed
    /// @param player The player address
    /// @param newEndurance The new endurance value after healing
    event CharacterHealed(address indexed player, uint256 indexed newEndurance);
    /// @notice Emitted when a character is resurrected
    /// @param player The player address
    event CharacterResurrected(address indexed player);
    /// @notice Emitted when a character levels up
    /// @param player The player address
    /// @param newLevel The new level reached
    event LevelUp(address indexed player, uint256 indexed newLevel);
    /// @notice Emitted when equipment is dropped
    /// @param player The player address
    /// @param bonuses The equipment bonuses [combat, endurance, defense, luck]
    event EquipmentDropped(address indexed player, uint256[4] bonuses);

    // ==================== Core Game Functions

    /**
     * @notice Create a new character
     * @param characterClass The class ID (0-3)
     */
    function createCharacter(uint256 characterClass) external payable;

    /**
     * @notice Heal character to full health
     */
    function healCharacter() external payable;

    /**
     * @notice Resurrect dead character
     */
    function resurrectCharacter() external payable;

    /**
     * @notice Fight an enemy
     * @param enemyId The enemy ID to fight (type/species)
     * @param enemyLevel The level of the enemy (1-250)
     */
    function fightEnemy(uint256 enemyId, uint256 enemyLevel) external;

    /**
     * @notice Continue an ongoing fight
     */
    function continueFight() external;

    /**
     * @notice Flee from current fight
     */
    function fleeRound() external;

    // ==================== UI Data Access

    /**
     * Note: legacy, heavy single-item getters (getCharacterData, getCharacterHP,
     * getCharacterLevel, getMinimalCharacter, getCharacterClass, hasCharacter)
     * were removed from the production interface to reduce ABI size. Tests
     * and test-only helpers should re-expose these if needed. The interface
     * intentionally keeps only the low-overhead packed getters and small
     * utility reads required by the UI.
     */

    /**
     * @notice Check if character is currently in combat
     * @param player The player's address
     * @return True if in combat
     */
    function isCharacterInCombat(address player) external view returns (bool);

    /**
     * @notice Get current combat state for a player
     * @param player The player's address
     * @return enemyId The enemy being fought
     * @return enemyLevel The level of the enemy being fought
     * @return enemyCurrentEndurance Current enemy endurance
     * @return playerCurrentEndurance Current player endurance
     * @return roundsElapsed Number of rounds elapsed
     * @return playerStartEndurance Player's starting endurance
     * @return enemyStartEndurance Enemy's starting endurance
     * @return lastUpdated Timestamp of last update
     * @return difficultyMultiplier The difficulty multiplier
     */
    function getCombatState(
        address player
    )
        external
        view
        returns (
            uint256 enemyId,
            uint256 enemyLevel,
            uint256 enemyCurrentEndurance,
            uint256 playerCurrentEndurance,
            uint256 roundsElapsed,
            uint256 playerStartEndurance,
            uint256 enemyStartEndurance,
            uint256 lastUpdated,
            uint256 difficultyMultiplier
        );

    /**
     * @notice Check if a player has a character
     * @param player The player's address
     * @return True if character exists for given address
     */
    // hasCharacter / getCharacterClass / getMinimalCharacter are intentionally omitted
    // from the production interface. Use packed getters and decode off-chain or
    // deploy the test-only subclass which re-exposes these helpers.

    // Note: low-level packed getters and on-chain unpackers are intentionally
    // kept out of the external UI interface to minimize ABI surface. Production
    // contracts should expose `getCharacter(address)` as the authoritative,
    // SDK-friendly decoded accessor. Test-only subclasses may re-expose packed
    // getters for test convenience.

    /**
     * @notice Get full decoded character data for a player in a single call
     * @dev Convenience wrapper that returns the same flat tuple as
     *      `decodePackedCharacter(getPackedCharacter(player))`. This exists
     *      to provide an authoritative, SDK-friendly single-call getter.
     * @param player The player's address
     * @return characterClass Character class id (uint)
     * @return level Character level
     * @return experience Experience (progress toward next level)
     * @return currentEndurance Current endurance (HP-like) including equipment bonuses
     * @return maxEndurance Maximum endurance including equipment bonuses
     * @return totalCombat Total combat stat (base + equipment)
     * @return totalDefense Total defense stat (base + equipment)
     * @return totalLuck Total luck stat (base + equipment)
     * @return aliveFlag True if character is alive
     * @return equippedCombatBonus Combat bonus from equipment
     * @return equippedEnduranceBonus Endurance bonus from equipment
     * @return equippedDefenseBonus Defense bonus from equipment
     * @return equippedLuckBonus Luck bonus from equipment
     * @return totalKills Total kills recorded
     */
    function getCharacter(
        address player
    )
        external
        view
        returns (
            uint256 characterClass,
            uint256 level,
            uint256 experience,
            uint256 currentEndurance,
            uint256 maxEndurance,
            uint256 totalCombat,
            uint256 totalDefense,
            uint256 totalLuck,
            bool aliveFlag,
            uint256 equippedCombatBonus,
            uint256 equippedEnduranceBonus,
            uint256 equippedDefenseBonus,
            uint256 equippedLuckBonus,
            uint256 totalKills
        );

    // NOTE: Batch getters were removed from the production UI interface to
    // minimize ABI surface. Use per-player `getPackedCharacter` and decode off-chain.

    // ==================== Game Information

    /**
     * @notice Get required XP for a specific level
     * @param level The level to check
     * @return Required XP
     */
    function getXPRequiredForLevel(uint256 level) external pure returns (uint256);

    // Note: `getEnemyBase` is intentionally not part of the external UI
    // interface. Enemy definitions are derived from `CombatConfig` and
    // production contracts expose preview helpers like `getScaledEnemyStats`.

    // ==================== Constants

    /**
     * @notice Get creation fee
     * @return The creation fee in wei
     */
    function getCreationFee() external view returns (uint256);

    /**
     * @notice Get healing fee
     * @return The healing fee in wei
     */
    function getHealingFee() external view returns (uint256);

    /**
     * @notice Get resurrection fee
     * @return The resurrection fee in wei
     */
    function getResurrectionFee() external view returns (uint256);
}
