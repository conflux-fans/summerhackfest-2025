// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;

import { BitPackedCharacterLib } from "../BitPackedCharacterLib.sol";
import { SafePacker } from "../SafePacker.sol";
import { CombatMath } from "../CombatMath.sol";
import { CombatState, CombatResult } from "../CombatStructs.sol";
import { GameError } from "../Errors.sol";

/**
 * @title CombatEngineLib
 * @author ChainBrawler Team
 * @notice Library containing complex combat processing logic extracted from CombatEngine contract
 * @dev This library reduces the main contract size by moving the largest and most complex function
 */
library CombatEngineLib {
    using BitPackedCharacterLib for BitPackedCharacterLib.BitPackedCharacter;

    /**
     * @notice Execute combat between player and enemy with detailed round processing
     * @param player The player address
     * @param enemyId The enemy ID to fight
     * @param enemyLevel The enemy level
     * @param allowExtraRound Whether to allow an extra combat round
     * @param packedCharacters Storage mapping for packed character data
     * @param combatStates Storage mapping for combat states
     * @param enemyBaseCombat Enemy base combat stat for validation
     * @param enemyCombat Scaled enemy combat stat
     * @param enemyEndurance Scaled enemy endurance stat
     * @param enemyDefense Scaled enemy defense stat
     * @param enemyLuck Scaled enemy luck stat
     * @return combatResult Struct containing combat outcome and updated character data
     */
    function executeCombat(
        address player,
        uint256 enemyId,
        uint256 enemyLevel,
        bool allowExtraRound,
        mapping(address => BitPackedCharacterLib.BitPackedCharacter) storage packedCharacters,
        mapping(address => CombatState) storage combatStates,
        uint256 enemyBaseCombat,
        uint256 enemyCombat,
        uint256 enemyEndurance,
        uint256 enemyDefense,
        uint256 enemyLuck
    ) external returns (CombatResult memory combatResult) {
        if (enemyBaseCombat == 0) revert GameError(1601);

        CombatSession memory session = _initializeCombat(
            player,
            enemyId,
            enemyLevel,
            packedCharacters,
            combatStates,
            enemyCombat,
            enemyEndurance,
            enemyDefense,
            enemyLuck
        );

        _executeCombatRounds(session, allowExtraRound);

        combatResult = _finalizeCombat(session, player, enemyId, enemyLevel, packedCharacters, combatStates);

        return combatResult;
    }

    struct CombatSession {
        uint256 coreStats;
        uint256 progressionStats;
        uint256 playerCombat;
        uint256 defense;
        uint256 playerLuck;
        uint256 currentEndurance;
        uint256 enemyCurrentEndurance;
        uint256 playerStartEndurance;
        uint256 enemyStartEndurance;
        uint256 roundsElapsed;
        uint256 enemyCombat;
        uint256 enemyDefense;
        uint256 enemyLuck;
        uint256[] roundNumbers;
        uint256[] playerDamages;
        uint256[] enemyDamages;
        bool[] playerCriticals;
        bool[] enemyCriticals;
        uint256 roundIndex;
        bool lastEnduranceChanged;
        uint256 timestamp;
    }

    /// @notice Initialize combat session with player and enemy data
    /// @param player The player address
    /// @param enemyId The enemy ID to fight\n    /// @param enemyLevel The enemy level (unused)
    /// @param packedCharacters Storage mapping for packed character data
    /// @param combatStates Storage mapping for combat states
    /// @param enemyCombat Scaled enemy combat stat
    /// @param enemyEndurance Scaled enemy endurance stat
    /// @param enemyDefense Scaled enemy defense stat
    /// @param enemyLuck Scaled enemy luck stat
    /// @return session The initialized combat session
    function _initializeCombat(
        address player,
        uint256 enemyId,
        uint256 /*enemyLevel*/,
        mapping(address => BitPackedCharacterLib.BitPackedCharacter) storage packedCharacters,
        mapping(address => CombatState) storage combatStates,
        uint256 enemyCombat,
        uint256 enemyEndurance,
        uint256 enemyDefense,
        uint256 enemyLuck
    ) internal returns (CombatSession memory session) {
        BitPackedCharacterLib.BitPackedCharacter storage packedChar = packedCharacters[player];

        session.coreStats = packedChar.coreStats;
        session.progressionStats = packedChar.progressionStats;
        session.coreStats = SafePacker.writeClamped(
            session.coreStats,
            BitPackedCharacterLib.IN_COMBAT_SHIFT,
            BitPackedCharacterLib.IN_COMBAT_MASK,
            1
        );

        session.timestamp = block.timestamp;
        session.lastEnduranceChanged = false;

        session.playerCombat =
            ((session.coreStats >> BitPackedCharacterLib.COMBAT_SKILL_SHIFT) &
                BitPackedCharacterLib.COMBAT_SKILL_MASK) +
            ((session.coreStats >> BitPackedCharacterLib.EQUIPPED_COMBAT_SHIFT) &
                BitPackedCharacterLib.EQUIPPED_COMBAT_MASK);
        session.defense =
            ((session.coreStats >> BitPackedCharacterLib.DEFENSE_SHIFT) & BitPackedCharacterLib.DEFENSE_MASK) +
            ((session.coreStats >> BitPackedCharacterLib.EQUIPPED_DEFENSE_SHIFT) &
                BitPackedCharacterLib.EQUIPPED_DEFENSE_MASK);
        session.playerLuck =
            ((session.coreStats >> BitPackedCharacterLib.LUCK_SHIFT) & BitPackedCharacterLib.LUCK_MASK) +
            ((session.coreStats >> BitPackedCharacterLib.EQUIPPED_LUCK_SHIFT) &
                BitPackedCharacterLib.EQUIPPED_LUCK_MASK);

        session.currentEndurance =
            ((session.coreStats >> BitPackedCharacterLib.CURRENT_ENDURANCE_SHIFT) &
                BitPackedCharacterLib.CURRENT_ENDURANCE_MASK) +
            ((session.coreStats >> BitPackedCharacterLib.EQUIPPED_ENDURANCE_SHIFT) &
                BitPackedCharacterLib.EQUIPPED_ENDURANCE_MASK);
        session.playerStartEndurance = session.currentEndurance;

        session.enemyCombat = enemyCombat;
        session.enemyDefense = enemyDefense;
        session.enemyLuck = enemyLuck;
        session.enemyCurrentEndurance = enemyEndurance;
        session.enemyStartEndurance = enemyEndurance;
        session.roundsElapsed = 0;

        _loadPersistedState(player, enemyId, combatStates, session);

        session.roundNumbers = new uint256[](11);
        session.playerDamages = new uint256[](11);
        session.enemyDamages = new uint256[](11);
        session.playerCriticals = new bool[](11);
        session.enemyCriticals = new bool[](11);
        session.roundIndex = 0;
    }

    /// @notice Load persisted combat state if available
    /// @param player The player address
    /// @param enemyId The enemy ID to check for persisted state
    /// @param combatStates Storage mapping for combat states
    /// @param session The combat session to update with persisted data
    function _loadPersistedState(
        address player,
        uint256 enemyId,
        mapping(address => CombatState) storage combatStates,
        CombatSession memory session
    ) internal {
        CombatState storage persisted = combatStates[player];
        if (persisted.enemyId == enemyId && persisted.lastUpdated != 0) {
            if (block.timestamp > persisted.lastUpdated + 30 days) {
                delete combatStates[player];
            } else {
                session.enemyCurrentEndurance = persisted.enemyCurrentEndurance;
                session.currentEndurance = persisted.playerCurrentEndurance;
                session.roundsElapsed = persisted.roundsElapsed;
                session.playerStartEndurance = persisted.playerStartEndurance;
                session.enemyStartEndurance = persisted.enemyStartEndurance;
                delete combatStates[player];
            }
        }
    }

    /// @notice Execute combat rounds until victory, defeat, or max rounds reached
    /// @param session The combat session containing round data
    /// @param allowExtraRound Whether to allow an extra round beyond the normal limit
    function _executeCombatRounds(CombatSession memory session, bool allowExtraRound) internal pure {
        uint256 round = 1;

        while (session.currentEndurance > 0 && session.enemyCurrentEndurance > 0 && round < 4) {
            _executeRound(session, round);
            session.roundsElapsed = round;
            unchecked {
                ++round;
            }
        }

        if (allowExtraRound && session.currentEndurance > 0 && session.enemyCurrentEndurance > 0) {
            _executeRound(session, session.roundsElapsed + 1);
            unchecked {
                ++session.roundsElapsed;
            }
        }
    }

    /// @notice Execute a single combat round
    /// @param session The combat session containing round data
    /// @param roundNumber The current round number
    function _executeRound(CombatSession memory session, uint256 roundNumber) internal pure {
        (
            uint256 newPlayerEndurance,
            uint256 newEnemyEndurance,
            uint256 playerDamage,
            uint256 enemyDamage,
            ,
            bool playerCritical,
            bool enemyCritical
        ) = CombatMath.performRound(
                session.playerCombat,
                session.enemyCombat,
                session.enemyDefense,
                session.defense,
                session.currentEndurance,
                session.enemyCurrentEndurance,
                session.playerLuck,
                session.enemyLuck
            );

        session.currentEndurance = newPlayerEndurance;
        session.enemyCurrentEndurance = newEnemyEndurance;

        session.roundNumbers[session.roundIndex] = roundNumber;
        session.playerDamages[session.roundIndex] = playerDamage;
        session.enemyDamages[session.roundIndex] = enemyDamage;
        session.playerCriticals[session.roundIndex] = playerCritical;
        session.enemyCriticals[session.roundIndex] = enemyCritical;

        ++session.roundIndex;
        session.lastEnduranceChanged = true;
    }

    /// @notice Finalize combat and return the result
    /// @param session The combat session containing final data
    /// @param player The player address
    /// @param enemyId The enemy ID that was fought
    /// @param enemyLevel The enemy level that was fought
    /// @param packedCharacters Storage mapping for packed character data
    /// @param combatStates Storage mapping for combat states
    /// @return combatResult The final combat result
    function _finalizeCombat(
        CombatSession memory session,
        address player,
        uint256 enemyId,
        uint256 enemyLevel,
        mapping(address => BitPackedCharacterLib.BitPackedCharacter) storage packedCharacters,
        mapping(address => CombatState) storage combatStates
    ) internal returns (CombatResult memory combatResult) {
        session.coreStats = BitPackedCharacterLib.setCurrentEnduranceSafe(session.coreStats, session.currentEndurance);

        int256 combatIndex = CombatMath.calculateCombatIndex(
            session.playerCombat,
            session.defense,
            session.playerLuck,
            session.enemyCombat,
            session.enemyDefense,
            session.enemyLuck
        );
        uint256 difficultyMultiplier = CombatMath.calculateDifficultyMultiplier(combatIndex);

        _persistCombatState(player, enemyId, enemyLevel, session, combatStates, packedCharacters, difficultyMultiplier);

        return _buildCombatResult(session, enemyId, enemyLevel, difficultyMultiplier);
    }

    /// @notice Persist combat state for later continuation if combat is unresolved
    /// @param player The player address
    /// @param enemyId The enemy ID being fought
    /// @param enemyLevel The enemy level being fought
    /// @param session The combat session containing state data
    /// @param combatStates Storage mapping for combat states
    /// @param packedCharacters Storage mapping for packed character data
    /// @param difficultyMultiplier The difficulty multiplier for the combat
    function _persistCombatState(
        address player,
        uint256 enemyId,
        uint256 enemyLevel,
        CombatSession memory session,
        mapping(address => CombatState) storage combatStates,
        mapping(address => BitPackedCharacterLib.BitPackedCharacter) storage packedCharacters,
        uint256 difficultyMultiplier
    ) internal {
        if (session.currentEndurance > 0 && session.enemyCurrentEndurance > 0) {
            combatStates[player] = CombatState({
                enemyId: enemyId,
                enemyLevel: enemyLevel,
                enemyCurrentEndurance: session.enemyCurrentEndurance,
                playerCurrentEndurance: session.currentEndurance,
                roundsElapsed: session.roundsElapsed,
                playerStartEndurance: session.playerStartEndurance,
                enemyStartEndurance: session.enemyStartEndurance,
                lastUpdated: block.timestamp,
                difficultyMultiplier: difficultyMultiplier
            });
            packedCharacters[player].coreStats = SafePacker.writeClamped(
                session.coreStats,
                BitPackedCharacterLib.IN_COMBAT_SHIFT,
                BitPackedCharacterLib.IN_COMBAT_MASK,
                1
            );
        } else {
            session.coreStats = SafePacker.writeClamped(
                session.coreStats,
                BitPackedCharacterLib.IN_COMBAT_SHIFT,
                BitPackedCharacterLib.IN_COMBAT_MASK,
                0
            );
            delete combatStates[player];
        }
    }

    /// @notice Build the final combat result structure
    /// @param session The combat session data
    /// @param enemyId The enemy identifier
    /// @param enemyLevel The enemy level
    /// @param difficultyMultiplier The difficulty multiplier for the combat
    /// @return combatResult The complete combat result
    function _buildCombatResult(
        CombatSession memory session,
        uint256 enemyId,
        uint256 enemyLevel,
        uint256 difficultyMultiplier
    ) internal pure returns (CombatResult memory combatResult) {
        bool victory = session.currentEndurance > 0 && session.enemyCurrentEndurance == 0;

        combatResult.victory = victory;
        combatResult.unresolved = (session.currentEndurance > 0 && session.enemyCurrentEndurance > 0);
        combatResult.coreStats = session.coreStats;
        combatResult.progressionStats = session.progressionStats;
        combatResult.lastEnduranceChanged = session.lastEnduranceChanged;
        combatResult.timestamp = session.timestamp;
        combatResult.difficultyMultiplier = difficultyMultiplier;
        combatResult.currentEndurance = session.currentEndurance;
        combatResult.enemyCurrentEndurance = session.enemyCurrentEndurance;
        combatResult.playerStartEndurance = session.playerStartEndurance;
        combatResult.enemyStartEndurance = session.enemyStartEndurance;
        combatResult.roundsElapsed = session.roundsElapsed;
        combatResult.enemyId = enemyId;
        combatResult.enemyLevel = enemyLevel;

        combatResult.roundNumbers = new uint256[](session.roundIndex);
        combatResult.playerDamages = new uint256[](session.roundIndex);
        combatResult.enemyDamages = new uint256[](session.roundIndex);
        combatResult.playerCriticals = new bool[](session.roundIndex);
        combatResult.enemyCriticals = new bool[](session.roundIndex);

        for (uint256 i = 0; i < session.roundIndex; ++i) {
            combatResult.roundNumbers[i] = session.roundNumbers[i];
            combatResult.playerDamages[i] = session.playerDamages[i];
            combatResult.enemyDamages[i] = session.enemyDamages[i];
            combatResult.playerCriticals[i] = session.playerCriticals[i];
            combatResult.enemyCriticals[i] = session.enemyCriticals[i];
        }
    }
}
