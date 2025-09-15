// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;

/**
 * @title CombatStructs
 * @notice Shared structs for combat system
 */

/**
 * @notice Persisted combat state used when fights become unresolved
 */
struct CombatState {
    uint256 enemyId;
    uint256 enemyLevel;
    uint256 enemyCurrentEndurance;
    uint256 playerCurrentEndurance;
    uint256 roundsElapsed;
    uint256 playerStartEndurance;
    uint256 enemyStartEndurance;
    uint256 lastUpdated;
    uint256 difficultyMultiplier; // Combat difficulty multiplier (10000 = 1x), calculated once per combat
}

/**
 * @notice Struct to return combat results from library function
 */
struct CombatResult {
    // Pack bools together for gas efficiency
    bool victory;
    bool unresolved;
    bool lastEnduranceChanged;
    // 32-byte aligned fields
    uint256 coreStats;
    uint256 progressionStats;
    uint256 timestamp;
    uint256 difficultyMultiplier;
    uint256 currentEndurance;
    uint256 enemyCurrentEndurance;
    uint256 playerStartEndurance;
    uint256 enemyStartEndurance;
    uint256 roundsElapsed;
    uint256 enemyId;
    uint256 enemyLevel;
    // Dynamic arrays (these don't affect packing)
    uint256[] roundNumbers;
    uint256[] playerDamages;
    uint256[] enemyDamages;
    bool[] playerCriticals;
    bool[] enemyCriticals;
}
