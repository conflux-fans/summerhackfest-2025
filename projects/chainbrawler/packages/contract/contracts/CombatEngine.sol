// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import { BitPackedCharacterLib } from "./BitPackedCharacterLib.sol";
import { CombatMath } from "./CombatMath.sol";
import { SafePacker } from "./SafePacker.sol";
import { ChainBrawlerState } from "./ChainBrawlerState.sol";
import { CombatEngineLib } from "./libraries/CombatEngineLib.sol";
import { CombatResult, CombatState } from "./CombatStructs.sol";
import { GameError } from "./Errors.sol";

/**
 * @title CombatEngine
 * @author ChainBrawler Team
 * @notice Core fight orchestration logic for ChainBrawler migration testing.
 * @dev Implements a deterministic, testable fight loop that performs up to a fixed
 *      number of rounds and persists incomplete `CombatState` for later resumption.
 *      Tests and derived contracts may override hooks such as
 *      `getScaledEnemyStatsInternal`, `checkLevelUp`, and `_maybeDropAndAutoEquip`.
 */
abstract contract CombatEngine is ChainBrawlerState {
    using BitPackedCharacterLib for BitPackedCharacterLib.BitPackedCharacter;

    // Implementing contracts must provide a way to read enemy base fields.
    // This replaces the older packed representation and unpack helper.
    /// @notice Get base enemy stats by ID
    /// @param id The enemy ID to get base stats for
    /// @return baseCombat The base combat stat
    /// @return baseEndurance The base endurance stat
    /// @return baseDefense The base defense stat
    /// @return baseLuck The base luck stat
    /// @return xpReward The XP reward for defeating this enemy
    /// @return dropRate The drop rate for this enemy
    function _getEnemyBase(
        uint256 id
    )
        internal
        view
        virtual
        returns (
            uint256 baseCombat,
            uint256 baseEndurance,
            uint256 baseDefense,
            uint256 baseLuck,
            uint256 xpReward,
            uint256 dropRate
        );

    // Default implementation: scale enemy stats by enemy level using CombatMath.
    /// @notice Get scaled enemy stats for a specific level
    /// @param enemyId The enemy ID to get stats for
    /// @param enemyLevel The level to scale the enemy to
    /// @return enemyCombat The scaled combat stat
    /// @return enemyEndurance The scaled endurance stat
    /// @return enemyDefense The scaled defense stat
    /// @return enemyLuck The scaled luck stat
    function getScaledEnemyStatsInternal(
        uint256 enemyId,
        uint256 enemyLevel
    )
        internal
        view
        virtual
        returns (uint256 enemyCombat, uint256 enemyEndurance, uint256 enemyDefense, uint256 enemyLuck)
    {
        (uint256 baseCombat, uint256 baseEndurance, uint256 baseDefense, uint256 baseLuck, , ) = _getEnemyBase(enemyId);
        (enemyCombat, enemyEndurance, enemyDefense, enemyLuck) = CombatMath.scaleEnemyForLevel(
            baseCombat,
            baseEndurance,
            baseDefense,
            baseLuck,
            enemyLevel
        );
        // Default: do not apply player-level basis-point scaling here. Implementations may layer additional scaling.
        return (enemyCombat, enemyEndurance, enemyDefense, enemyLuck);
    }

    // Storage and events are declared in ChainBrawlerState.

    // Hook implementations - concrete contract may override.
    /// @notice Check if player should level up (hook for concrete implementations)
    function checkLevelUp(address /*player*/) internal virtual {
        // Default implementation: no level up logic
        // Concrete implementations should override this function
        // This function intentionally does nothing in the base implementation
        return;
    }

    /**
     * @notice Check if player should level up and return updated core stats and adjusted experience
     * @param player The player address
     * @param coreStats The current core stats for level updates
     * @return updatedCoreStats The core stats after level up processing
     * @return adjustedExperience The experience value after level up processing
     */
    function checkLevelUpAndAdjustXP(
        address player,
        uint256 /*newExperience*/,
        uint256 coreStats
    ) internal virtual returns (uint256 updatedCoreStats, uint256 adjustedExperience) {
        // Default: no level up logic; return core stats and current stored experience.
        checkLevelUp(player);
        uint256 currentExperience = (packedCharacters[player].progressionStats >>
            BitPackedCharacterLib.EXPERIENCE_SHIFT) & BitPackedCharacterLib.EXPERIENCE_MASK;
        return (coreStats, currentExperience);
    }
    /// @notice Handle equipment drops and auto-equip (hook for concrete implementations)
    function _maybeDropAndAutoEquip(
        address /*player*/,
        uint256 /*enemyId*/,
        uint256 /*enemyLevel*/,
        uint256 /*xpGained*/,
        uint256 /*difficultyMultiplier*/
    ) internal virtual {
        // Default implementation: no equipment drops
        // Concrete implementations should override this function
        // This function intentionally does nothing in the base implementation
        return;
    }

    // Deterministic fight loop using StructuralTypes.CombatContext
    /// @notice Fight an enemy with default level scaling
    /// @param enemyId The ID of the enemy to fight
    /// @param allowExtraRound Whether to allow extra rounds in combat
    function _fightEnemyInternal(uint256 enemyId, bool allowExtraRound) internal virtual {
        _fightEnemyInternalWithLevel(enemyId, 0, allowExtraRound);
    }

    /// @notice Fight an enemy with specified level
    /// @param enemyId The ID of the enemy to fight
    /// @param enemyLevel The level of the enemy to fight
    /// @param allowExtraRound Whether to allow extra rounds in combat
    function _fightEnemyInternalWithLevel(uint256 enemyId, uint256 enemyLevel, bool allowExtraRound) internal virtual {
        (uint256 baseCombat, , , , , ) = _getEnemyBase(enemyId);
        if (baseCombat == 0) revert GameError(1601);

        (
            uint256 enemyCombat,
            uint256 enemyEndurance,
            uint256 enemyDefense,
            uint256 enemyLuck
        ) = getScaledEnemyStatsInternal(enemyId, enemyLevel);

        CombatResult memory result = CombatEngineLib.executeCombat(
            msg.sender,
            enemyId,
            enemyLevel,
            allowExtraRound,
            packedCharacters,
            combatStates,
            baseCombat,
            enemyCombat,
            enemyEndurance,
            enemyDefense,
            enemyLuck
        );

        if (result.unresolved) {
            _emitUnresolvedCombat(result);
            return;
        }

        uint256 xpGained = result.victory ? _handleVictory(result, enemyId, enemyLevel) : _handleDefeat(result);
        _updateRegenTime(result);
        _emitFightSummary(result, xpGained);
    }

    /// @notice Emit unresolved combat event
    /// @param result The combat result containing unresolved combat data
    function _emitUnresolvedCombat(CombatResult memory result) internal {
        emit FightSummary(
            msg.sender,
            result.enemyId,
            result.enemyLevel,
            result.roundsElapsed,
            result.playerStartEndurance,
            result.currentEndurance,
            result.enemyStartEndurance,
            result.enemyCurrentEndurance,
            false,
            true,
            result.roundNumbers,
            result.playerDamages,
            result.enemyDamages,
            result.playerCriticals,
            result.enemyCriticals
        );
    }

    /// @notice Handle victory in combat
    /// @param result The combat result containing victory data
    /// @param enemyId The ID of the defeated enemy
    /// @param enemyLevel The level of the defeated enemy
    /// @return xpGained The XP gained from the victory
    function _handleVictory(
        CombatResult memory result,
        uint256 enemyId,
        uint256 enemyLevel
    ) internal returns (uint256 xpGained) {
        uint256 totalKills = (result.progressionStats >> BitPackedCharacterLib.TOTAL_KILLS_SHIFT) &
            BitPackedCharacterLib.TOTAL_KILLS_MASK;
        result.progressionStats = SafePacker.writeClamped(
            result.progressionStats,
            BitPackedCharacterLib.TOTAL_KILLS_SHIFT,
            BitPackedCharacterLib.TOTAL_KILLS_MASK,
            totalKills + 1
        );

        xpGained = _calculateXPReward(result, enemyId);
        result = _processLevelUp(result, xpGained);

        packedCharacters[msg.sender].coreStats = result.coreStats;
        packedCharacters[msg.sender].progressionStats = result.progressionStats;

        _maybeDropAndAutoEquip(msg.sender, enemyId, enemyLevel, xpGained, result.difficultyMultiplier);
        emit FightXPReward(msg.sender, result.enemyId, result.enemyLevel, xpGained);
    }

    /// @notice Calculate XP reward for defeating an enemy
    /// @param result The combat result containing player data
    /// @param enemyId The ID of the defeated enemy
    /// @return xpGained The calculated XP reward
    function _calculateXPReward(CombatResult memory result, uint256 enemyId) internal view returns (uint256 xpGained) {
        (, , , , uint256 xpReward, ) = _getEnemyBase(enemyId);
        xpGained = xpReward;

        uint256 level = (result.coreStats >> BitPackedCharacterLib.LEVEL_SHIFT) & BitPackedCharacterLib.LEVEL_MASK;
        if (level < 4) {
            xpGained = (xpGained * 150) / 100; // +50% bonus for levels 1-3
        }

        xpGained = (xpGained * result.difficultyMultiplier) / 10000;
    }

    /// @notice Process level up for the player
    /// @param result The combat result containing player data
    /// @param xpGained The XP gained from the fight
    /// @return The updated combat result after level up processing
    function _processLevelUp(CombatResult memory result, uint256 xpGained) internal returns (CombatResult memory) {
        uint256 experience = (result.progressionStats >> BitPackedCharacterLib.EXPERIENCE_SHIFT) &
            BitPackedCharacterLib.EXPERIENCE_MASK;
        experience += xpGained;

        (result.coreStats, experience) = checkLevelUpAndAdjustXP(msg.sender, experience, result.coreStats);
        result.progressionStats = SafePacker.writeClamped(
            result.progressionStats,
            BitPackedCharacterLib.EXPERIENCE_SHIFT,
            BitPackedCharacterLib.EXPERIENCE_MASK,
            experience
        );

        return result;
    }

    /// @notice Handle defeat in combat
    /// @param result The combat result containing defeat data
    /// @return The XP gained (always 0 for defeat)
    function _handleDefeat(CombatResult memory result) internal returns (uint256) {
        result.coreStats = _resetEquipment(result.coreStats);
        result.coreStats = BitPackedCharacterLib.setCurrentEnduranceSafe(result.coreStats, 0);
        result.coreStats = SafePacker.writeClamped(
            result.coreStats,
            BitPackedCharacterLib.IS_ALIVE_SHIFT,
            BitPackedCharacterLib.IS_ALIVE_MASK,
            0
        );

        packedCharacters[msg.sender].coreStats = result.coreStats;
        packedCharacters[msg.sender].progressionStats = result.progressionStats;
        return 0;
    }

    /// @notice Reset all equipped bonuses to zero
    /// @param coreStats The current core stats
    /// @return The updated core stats with reset equipment
    function _resetEquipment(uint256 coreStats) internal pure returns (uint256) {
        coreStats = SafePacker.writeClamped(
            coreStats,
            BitPackedCharacterLib.EQUIPPED_COMBAT_SHIFT,
            BitPackedCharacterLib.EQUIPPED_COMBAT_MASK,
            0
        );
        coreStats = SafePacker.writeClamped(
            coreStats,
            BitPackedCharacterLib.EQUIPPED_ENDURANCE_SHIFT,
            BitPackedCharacterLib.EQUIPPED_ENDURANCE_MASK,
            0
        );
        coreStats = SafePacker.writeClamped(
            coreStats,
            BitPackedCharacterLib.EQUIPPED_DEFENSE_SHIFT,
            BitPackedCharacterLib.EQUIPPED_DEFENSE_MASK,
            0
        );
        coreStats = SafePacker.writeClamped(
            coreStats,
            BitPackedCharacterLib.EQUIPPED_LUCK_SHIFT,
            BitPackedCharacterLib.EQUIPPED_LUCK_MASK,
            0
        );
        return coreStats;
    }

    /// @notice Update regeneration time for the player
    /// @param result The combat result containing player data
    function _updateRegenTime(CombatResult memory result) internal {
        if (result.lastEnduranceChanged) {
            result.progressionStats = SafePacker.writeClamped(
                result.progressionStats,
                BitPackedCharacterLib.LAST_REGEN_TIME_SHIFT,
                BitPackedCharacterLib.LAST_REGEN_TIME_MASK,
                result.timestamp
            );
            packedCharacters[msg.sender].progressionStats = result.progressionStats;
        }
    }

    /// @notice Emit fight summary event
    /// @param result The combat result containing fight data
    function _emitFightSummary(CombatResult memory result, uint256 /*xpGained*/) internal {
        emit FightSummary(
            msg.sender,
            result.enemyId,
            result.enemyLevel,
            result.roundsElapsed,
            result.playerStartEndurance,
            result.currentEndurance,
            result.enemyStartEndurance,
            result.enemyCurrentEndurance,
            result.unresolved ? false : result.victory,
            result.unresolved,
            result.roundNumbers,
            result.playerDamages,
            result.enemyDamages,
            result.playerCriticals,
            result.enemyCriticals
        );
    }

    /// @notice Continue an existing fight from where it left off
    function _continueFightInternal() internal virtual {
        CombatState memory cs = combatStates[msg.sender];
        if (cs.enemyId == 0) revert GameError(1602);

        // Do not delete persisted state here. `_fightEnemyInternal` knows how to
        // detect and restore a persisted `CombatState` when present. Removing the
        // persisted state before calling caused the engine to reset the enemy to
        // full HP while using the stored player HP — producing duplicated damage
        // and inconsistent outcomes. Let the internal fight restore both sides.
        _fightEnemyInternal(cs.enemyId, false);
    }

    /// @notice Handle a flee round in combat
    function _fleeRoundInternal() internal virtual {
        CombatState memory cs = combatStates[msg.sender];
        if (cs.enemyId == 0) revert GameError(1602);

        BitPackedCharacterLib.BitPackedCharacter storage packedChar = packedCharacters[msg.sender];

        if (!_validatePlayerAlive(cs, packedChar)) return;

        cs = _updateCombatStateHP(cs, packedChar);
        FleeRoundData memory fleeData = _executeFleeRound(cs, packedChar);

        if (fleeData.playerAfter == 0) {
            _handleFleeDeath(cs, fleeData, packedChar);
        } else if (fleeData.enemyAfter == 0) {
            _handleFleeVictory(cs, fleeData, packedChar);
        } else {
            _handleFleeEscape(cs, fleeData, packedChar);
        }
    }

    struct FleeRoundData {
        uint256 coreStats;
        uint256 progressionStats;
        uint256 playerAfter;
        uint256 enemyAfter;
        uint256 playerDamage;
        uint256 enemyDamage;
        bool playerCritical;
        bool enemyCritical;
        uint256 level;
    }

    /// @notice Validate that the player is alive
    /// @param cs The combat state
    /// @param packedChar The packed character data
    /// @return True if player is alive, false otherwise
    function _validatePlayerAlive(
        CombatState memory cs,
        BitPackedCharacterLib.BitPackedCharacter storage packedChar
    ) internal returns (bool) {
        uint256 actualCurrentHP = (packedChar.coreStats >> BitPackedCharacterLib.CURRENT_ENDURANCE_SHIFT) &
            BitPackedCharacterLib.CURRENT_ENDURANCE_MASK;
        bool actualIsAlive = ((packedChar.coreStats >> BitPackedCharacterLib.IS_ALIVE_SHIFT) &
            BitPackedCharacterLib.IS_ALIVE_MASK) == 1;

        if (!actualIsAlive || actualCurrentHP == 0) {
            delete combatStates[msg.sender];
            packedChar.coreStats = SafePacker.writeClamped(
                packedChar.coreStats,
                BitPackedCharacterLib.IN_COMBAT_SHIFT,
                BitPackedCharacterLib.IN_COMBAT_MASK,
                0
            );

            emit FightSummary(
                msg.sender,
                cs.enemyId,
                cs.enemyLevel,
                cs.roundsElapsed,
                cs.playerStartEndurance,
                0,
                cs.enemyStartEndurance,
                cs.enemyCurrentEndurance,
                false,
                false,
                new uint256[](0),
                new uint256[](0),
                new uint256[](0),
                new bool[](0),
                new bool[](0)
            );
            return false;
        }
        return true;
    }

    /// @notice Update combat state with current player HP
    /// @param cs The combat state
    /// @param packedChar The packed character data
    /// @return The updated combat state
    function _updateCombatStateHP(
        CombatState memory cs,
        BitPackedCharacterLib.BitPackedCharacter storage packedChar
    ) internal view returns (CombatState memory) {
        uint256 actualCurrentHP = (packedChar.coreStats >> BitPackedCharacterLib.CURRENT_ENDURANCE_SHIFT) &
            BitPackedCharacterLib.CURRENT_ENDURANCE_MASK;
        cs.playerCurrentEndurance = actualCurrentHP;
        return cs;
    }

    /// @notice Execute a flee round in combat
    /// @param cs The combat state
    /// @param packedChar The packed character data
    /// @return fleeData The flee round data
    function _executeFleeRound(
        CombatState memory cs,
        BitPackedCharacterLib.BitPackedCharacter storage packedChar
    ) internal view returns (FleeRoundData memory fleeData) {
        fleeData.coreStats = packedChar.coreStats;
        fleeData.progressionStats = packedChar.progressionStats;
        fleeData.level = (fleeData.coreStats >> BitPackedCharacterLib.LEVEL_SHIFT) & BitPackedCharacterLib.LEVEL_MASK;

        uint256 combatSkill = ((fleeData.coreStats >> BitPackedCharacterLib.COMBAT_SKILL_SHIFT) &
            BitPackedCharacterLib.COMBAT_SKILL_MASK) +
            ((fleeData.coreStats >> BitPackedCharacterLib.EQUIPPED_COMBAT_SHIFT) &
                BitPackedCharacterLib.EQUIPPED_COMBAT_MASK);
        uint256 defense = ((fleeData.coreStats >> BitPackedCharacterLib.DEFENSE_SHIFT) &
            BitPackedCharacterLib.DEFENSE_MASK) +
            ((fleeData.coreStats >> BitPackedCharacterLib.EQUIPPED_DEFENSE_SHIFT) &
                BitPackedCharacterLib.EQUIPPED_DEFENSE_MASK);
        uint256 playerLuck = ((fleeData.coreStats >> BitPackedCharacterLib.LUCK_SHIFT) &
            BitPackedCharacterLib.LUCK_MASK) +
            ((fleeData.coreStats >> BitPackedCharacterLib.EQUIPPED_LUCK_SHIFT) &
                BitPackedCharacterLib.EQUIPPED_LUCK_MASK);

        (uint256 enemyCombat, , uint256 enemyDefense, uint256 enemyLuck) = getScaledEnemyStatsInternal(
            cs.enemyId,
            cs.enemyLevel
        );

        (
            fleeData.playerAfter,
            fleeData.enemyAfter,
            fleeData.playerDamage,
            fleeData.enemyDamage,
            ,
            fleeData.playerCritical,
            fleeData.enemyCritical
        ) = CombatMath.performRound(
            combatSkill,
            enemyCombat,
            enemyDefense,
            defense,
            cs.playerCurrentEndurance,
            cs.enemyCurrentEndurance,
            playerLuck,
            enemyLuck
        );

        fleeData.coreStats = BitPackedCharacterLib.setCurrentEnduranceSafe(fleeData.coreStats, fleeData.playerAfter);
        fleeData.coreStats = SafePacker.writeClamped(
            fleeData.coreStats,
            BitPackedCharacterLib.IS_ALIVE_SHIFT,
            BitPackedCharacterLib.IS_ALIVE_MASK,
            fleeData.playerAfter > 0 ? 1 : 0
        );
    }

    /// @notice Handle player death during flee
    /// @param cs The combat state
    /// @param fleeData The flee round data
    /// @param packedChar The packed character data
    /// @dev No XP is awarded for death scenarios, so no level-up processing needed
    function _handleFleeDeath(
        CombatState memory cs,
        FleeRoundData memory fleeData,
        BitPackedCharacterLib.BitPackedCharacter storage packedChar
    ) internal {
        fleeData.coreStats = (fleeData.coreStats &
            ~(BitPackedCharacterLib.IS_ALIVE_MASK << BitPackedCharacterLib.IS_ALIVE_SHIFT));
        fleeData.coreStats = SafePacker.writeClamped(
            fleeData.coreStats,
            BitPackedCharacterLib.IN_COMBAT_SHIFT,
            BitPackedCharacterLib.IN_COMBAT_MASK,
            0
        );

        packedChar.coreStats = fleeData.coreStats;
        packedChar.progressionStats = fleeData.progressionStats;
        delete combatStates[msg.sender];

        _emitFleeRoundSummary(cs, fleeData, false, false);
    }

    /// @notice Handle player victory during flee
    /// @param cs The combat state
    /// @param fleeData The flee round data
    /// @param packedChar The packed character data
    function _handleFleeVictory(
        CombatState memory cs,
        FleeRoundData memory fleeData,
        BitPackedCharacterLib.BitPackedCharacter storage packedChar
    ) internal {
        (, , , , uint256 xpGainedRaw, ) = _getEnemyBase(cs.enemyId);
        uint256 xpGained = fleeData.level < 4 ? (xpGainedRaw * 150) / 100 : xpGainedRaw;

        uint256 experience = (fleeData.coreStats >> BitPackedCharacterLib.EXPERIENCE_SHIFT) &
            BitPackedCharacterLib.EXPERIENCE_MASK;

        // Process level-ups after XP gain (CRITICAL BUG FIX: prevents currentEndurance > maxEndurance)
        uint256 adjustedExperience;
        (fleeData.coreStats, adjustedExperience) = checkLevelUpAndAdjustXP(
            msg.sender,
            experience + xpGained,
            fleeData.coreStats
        );

        // Update progression stats with adjusted experience (post level-up)
        fleeData.progressionStats = SafePacker.writeClamped(
            fleeData.progressionStats,
            BitPackedCharacterLib.EXPERIENCE_SHIFT,
            BitPackedCharacterLib.EXPERIENCE_MASK,
            adjustedExperience
        );

        uint256 totalKills = (fleeData.progressionStats >> BitPackedCharacterLib.TOTAL_KILLS_SHIFT) &
            BitPackedCharacterLib.TOTAL_KILLS_MASK;
        fleeData.progressionStats = SafePacker.writeClamped(
            fleeData.progressionStats,
            BitPackedCharacterLib.TOTAL_KILLS_SHIFT,
            BitPackedCharacterLib.TOTAL_KILLS_MASK,
            totalKills + 1
        );

        fleeData.coreStats = SafePacker.writeClamped(
            fleeData.coreStats,
            BitPackedCharacterLib.IN_COMBAT_SHIFT,
            BitPackedCharacterLib.IN_COMBAT_MASK,
            0
        );
        packedChar.coreStats = fleeData.coreStats;
        packedChar.progressionStats = fleeData.progressionStats;

        uint256 savedDifficultyMultiplier = cs.difficultyMultiplier;
        delete combatStates[msg.sender];

        _maybeDropAndAutoEquip(msg.sender, cs.enemyId, cs.enemyLevel, xpGained, savedDifficultyMultiplier);
        emit FightXPReward(msg.sender, cs.enemyId, cs.enemyLevel, xpGained);

        _emitFleeRoundSummary(cs, fleeData, true, false);
    }

    /// @notice Handle successful escape during flee
    /// @param cs The combat state
    /// @param fleeData The flee round data
    /// @param packedChar The packed character data
    function _handleFleeEscape(
        CombatState memory cs,
        FleeRoundData memory fleeData,
        BitPackedCharacterLib.BitPackedCharacter storage packedChar
    ) internal {
        fleeData.coreStats = SafePacker.writeClamped(
            fleeData.coreStats,
            BitPackedCharacterLib.IN_COMBAT_SHIFT,
            BitPackedCharacterLib.IN_COMBAT_MASK,
            0
        );
        packedChar.coreStats = fleeData.coreStats;
        packedChar.progressionStats = fleeData.progressionStats;
        delete combatStates[msg.sender];

        _emitFleeRoundSummary(cs, fleeData, false, false);
    }

    /// @notice Emit flee round summary event
    /// @param cs The combat state
    /// @param fleeData The flee round data
    /// @param victory Whether the player achieved victory
    /// @param unresolved Whether the combat is unresolved
    function _emitFleeRoundSummary(
        CombatState memory cs,
        FleeRoundData memory fleeData,
        bool victory,
        bool unresolved
    ) internal {
        uint256[] memory roundNumbers = new uint256[](1);
        uint256[] memory playerDamages = new uint256[](1);
        uint256[] memory enemyDamages = new uint256[](1);
        bool[] memory playerCriticals = new bool[](1);
        bool[] memory enemyCriticals = new bool[](1);

        roundNumbers[0] = cs.roundsElapsed + 1;
        playerDamages[0] = fleeData.playerDamage;
        enemyDamages[0] = fleeData.enemyDamage;
        playerCriticals[0] = fleeData.playerCritical;
        enemyCriticals[0] = fleeData.enemyCritical;

        emit FightSummary(
            msg.sender,
            cs.enemyId,
            cs.enemyLevel,
            cs.roundsElapsed + 1,
            cs.playerCurrentEndurance,
            fleeData.playerAfter,
            cs.enemyCurrentEndurance,
            fleeData.enemyAfter,
            unresolved ? false : victory,
            unresolved,
            roundNumbers,
            playerDamages,
            enemyDamages,
            playerCriticals,
            enemyCriticals
        );
    }
}
