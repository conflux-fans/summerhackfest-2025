// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import { CombatConfig } from "./CombatConfig.sol";

/**
 * @title CombatMath
 * @author ChainBrawler Team
 * @notice Pure, deterministic math helpers used by the combat engine.
 * @dev Tests rely on deterministic output from `performRound` given identical inputs.
 */
library CombatMath {
    /// @notice Perform a single combat round computation
    /// @param combatSkill The player's combat skill
    /// @param enemyCombat The enemy's combat skill
    /// @param enemyDefense The enemy's defense
    /// @param defense The player's defense
    /// @param currentEndurance The player's current endurance
    /// @param enemyCurrentEndurance The enemy's current endurance
    /// @param playerLuck The player's luck stat
    /// @param enemyLuck The enemy's luck stat
    /// @return newPlayerEndurance The player's endurance after the round
    /// @return newEnemyEndurance The enemy's endurance after the round
    /// @return playerDamage The damage dealt by the player
    /// @return enemyDamage The damage dealt by the enemy
    /// @return playerDied Whether the player died
    /// @return playerCritical Whether the player got a critical hit
    /// @return enemyCritical Whether the enemy got a critical hit
    function performRound(
        uint256 combatSkill,
        uint256 enemyCombat,
        uint256 enemyDefense,
        uint256 defense,
        uint256 currentEndurance,
        uint256 enemyCurrentEndurance,
        uint256 playerLuck,
        uint256 enemyLuck
    )
        internal
        pure
        returns (
            uint256 newPlayerEndurance,
            uint256 newEnemyEndurance,
            uint256 playerDamage,
            uint256 enemyDamage,
            bool playerDied,
            bool playerCritical,
            bool enemyCritical
        )
    {
        // Calculate base damage using weighted stat differences
        (playerDamage, enemyDamage) = _calculateBaseDamage(
            combatSkill,
            enemyCombat,
            enemyDefense,
            defense,
            currentEndurance,
            enemyCurrentEndurance,
            playerLuck,
            enemyLuck
        );

        // Determine critical hits
        (playerCritical, enemyCritical) = _determineCriticals(
            combatSkill,
            playerLuck,
            enemyLuck,
            currentEndurance,
            enemyCurrentEndurance
        );

        // Apply critical hit bonuses
        (playerDamage, enemyDamage) = _applyCriticalBonuses(playerDamage, enemyDamage, playerCritical, enemyCritical);

        // Apply damage to endurance and determine outcomes
        (newPlayerEndurance, newEnemyEndurance, playerDied) = _applyDamage(
            currentEndurance,
            enemyCurrentEndurance,
            playerDamage,
            enemyDamage
        );

        // Adjust enemy damage if enemy died
        if (newEnemyEndurance == 0) {
            enemyDamage = 0;
        }

        return (
            newPlayerEndurance,
            newEnemyEndurance,
            playerDamage,
            enemyDamage,
            playerDied,
            playerCritical,
            enemyCritical
        );
    }

    /// @notice Calculate base damage using weighted stat differences
    /// @param combatSkill Player combat skill
    /// @param enemyCombat Enemy combat skill
    /// @param enemyDefense Enemy defense
    /// @param defense Player defense
    /// @param currentEndurance Player current endurance
    /// @param enemyCurrentEndurance Enemy current endurance
    /// @param playerLuck Player luck stat
    /// @param enemyLuck Enemy luck stat
    /// @return playerDamage Base damage dealt by player
    /// @return enemyDamage Base damage dealt by enemy
    function _calculateBaseDamage(
        uint256 combatSkill,
        uint256 enemyCombat,
        uint256 enemyDefense,
        uint256 defense,
        uint256 currentEndurance,
        uint256 enemyCurrentEndurance,
        uint256 playerLuck,
        uint256 enemyLuck
    ) internal pure returns (uint256 playerDamage, uint256 enemyDamage) {
        // Calculate weighted stat differences
        int256 combatDiff = int256(combatSkill) - int256(enemyCombat);
        int256 enduranceDiff = int256(currentEndurance) - int256(enemyCurrentEndurance);
        int256 defenseDiff = int256(defense) - int256(enemyDefense);
        int256 luckDiff = int256(playerLuck) - int256(enemyLuck);

        int256 weightedSum = (int256(CombatConfig.WEIGHT_COMBAT) * combatDiff) +
            (int256(CombatConfig.WEIGHT_ENDURANCE) * enduranceDiff) +
            (int256(CombatConfig.WEIGHT_DEFENSE) * defenseDiff) +
            (int256(CombatConfig.WEIGHT_LUCK) * luckDiff);

        int256 diff = weightedSum / int256(CombatConfig.WEIGHT_NORMALIZER);
        int256 idxSigned = int256(CombatConfig.DAMAGE_TABLE_CENTER) + diff;

        // Clamp index to valid range
        if (idxSigned < 0) {
            idxSigned = 0;
        }
        if (idxSigned > int256(CombatConfig.DAMAGE_TABLE_SIZE) - 1) {
            idxSigned = int256(CombatConfig.DAMAGE_TABLE_SIZE) - 1;
        }
        uint256 idx = uint256(idxSigned);

        // Get damage from tables
        uint8[] memory atkTable = CombatConfig.damageTableAttacker();
        uint8[] memory defTable = CombatConfig.damageTableDefender();

        uint256 basePlayerDamage = uint256(atkTable[idx]);
        uint256 baseEnemyDamage = uint256(defTable[idx]);

        // Ensure minimum damage of 1
        playerDamage = basePlayerDamage > 0 ? basePlayerDamage : 1;
        enemyDamage = baseEnemyDamage > 0 ? baseEnemyDamage : 1;
    }

    /// @notice Determine critical hits for both player and enemy
    /// @param combatSkill Player combat skill
    /// @param playerLuck Player luck stat
    /// @param enemyLuck Enemy luck stat
    /// @param currentEndurance Player current endurance
    /// @param enemyCurrentEndurance Enemy current endurance
    /// @return playerCritical Whether player got a critical hit
    /// @return enemyCritical Whether enemy got a critical hit
    function _determineCriticals(
        uint256 combatSkill,
        uint256 playerLuck,
        uint256 enemyLuck,
        uint256 currentEndurance,
        uint256 enemyCurrentEndurance
    ) internal pure returns (bool playerCritical, bool enemyCritical) {
        bytes32 seed = keccak256(
            abi.encodePacked(combatSkill, playerLuck, enemyLuck, currentEndurance, enemyCurrentEndurance)
        );
        uint256 rand = uint256(seed) % 100;
        playerCritical = rand < playerLuck;

        uint256 rand2 = uint256(keccak256(abi.encodePacked(seed, rand))) % 100;
        enemyCritical = rand2 < enemyLuck;
    }

    /// @notice Apply critical hit bonuses to damage
    /// @param playerDamage Base player damage
    /// @param enemyDamage Base enemy damage
    /// @param playerCritical Whether player got a critical hit
    /// @param enemyCritical Whether enemy got a critical hit
    /// @return newPlayerDamage Player damage with critical bonus applied
    /// @return newEnemyDamage Enemy damage with critical bonus applied
    function _applyCriticalBonuses(
        uint256 playerDamage,
        uint256 enemyDamage,
        bool playerCritical,
        bool enemyCritical
    ) internal pure returns (uint256 newPlayerDamage, uint256 newEnemyDamage) {
        newPlayerDamage = playerDamage;
        newEnemyDamage = enemyDamage;

        if (playerCritical) {
            newPlayerDamage = (playerDamage * 150) / 100; // 50% bonus
        }
        if (enemyCritical) {
            newEnemyDamage = (enemyDamage * 150) / 100; // 50% bonus
        }
    }

    /// @notice Apply damage to endurance and determine outcomes
    /// @param currentEndurance Player current endurance
    /// @param enemyCurrentEndurance Enemy current endurance
    /// @param playerDamage Damage dealt by player
    /// @param enemyDamage Damage dealt by enemy
    /// @return newPlayerEndurance Player endurance after damage
    /// @return newEnemyEndurance Enemy endurance after damage
    /// @return playerDied Whether player died
    function _applyDamage(
        uint256 currentEndurance,
        uint256 enemyCurrentEndurance,
        uint256 playerDamage,
        uint256 enemyDamage
    ) internal pure returns (uint256 newPlayerEndurance, uint256 newEnemyEndurance, bool playerDied) {
        // Apply damage to enemy
        if (enemyCurrentEndurance < playerDamage + 1) {
            newEnemyEndurance = 0;
        } else {
            newEnemyEndurance = enemyCurrentEndurance - playerDamage;
        }

        // Apply damage to player if enemy is still alive
        if (newEnemyEndurance > 0) {
            if (currentEndurance < enemyDamage + 1) {
                newPlayerEndurance = 0;
                playerDied = true;
            } else {
                newPlayerEndurance = currentEndurance - enemyDamage;
                playerDied = false;
            }
        } else {
            // Enemy died, player doesn't take damage
            newPlayerEndurance = currentEndurance;
            playerDied = false;
        }
    }

    /// @notice Calculate combat difficulty index between player and enemy stats
    /// @param playerCombat Player's total combat stat
    /// @param playerDefense Player's total defense stat
    /// @param playerLuck Player's total luck stat
    /// @param enemyCombat Enemy's combat stat
    /// @param enemyDefense Enemy's defense stat
    /// @param enemyLuck Enemy's luck stat
    /// @return combatIndex Signed difficulty index (positive = player stronger, negative = enemy stronger)
    function calculateCombatIndex(
        uint256 playerCombat,
        uint256 playerDefense,
        uint256 playerLuck,
        uint256 enemyCombat,
        uint256 enemyDefense,
        uint256 enemyLuck
    ) internal pure returns (int256 combatIndex) {
        // Use same weighted calculation as performRound for consistency
        int256 combatDiff = int256(playerCombat) - int256(enemyCombat);
        int256 defenseDiff = int256(playerDefense) - int256(enemyDefense);
        int256 luckDiff = int256(playerLuck) - int256(enemyLuck);

        int256 weightedSum = (int256(CombatConfig.WEIGHT_COMBAT) * combatDiff) +
            (int256(CombatConfig.WEIGHT_DEFENSE) * defenseDiff) +
            (int256(CombatConfig.WEIGHT_LUCK) * luckDiff);

        combatIndex = weightedSum / int256(CombatConfig.WEIGHT_NORMALIZER);
        return combatIndex;
    }

    /// @notice Calculate dynamic difficulty multiplier based on combat index
    /// @param combatIndex Combat difficulty index (positive = easier, negative = harder)
    /// @return multiplierBP Reward multiplier in basis points (10000 = 100%, 50000 = 500%)
    function calculateDifficultyMultiplier(int256 combatIndex) internal pure returns (uint256 multiplierBP) {
        // Aggressive development formula optimized for leaderboard competition
        // Flip sign: negative index (harder fights) = better rewards
        int256 adjustedIndex = -combatIndex;
        int256 multiplier;

        if (adjustedIndex > 14) {
            // Ultra high challenge: 500-1000% rewards
            multiplier = 50000 + ((adjustedIndex - 15) * 10000);
            if (multiplier > 100000) multiplier = 100000; // Cap at 1000%
        } else if (adjustedIndex > 4) {
            // High challenge: 200-500% rewards
            multiplier = 20000 + ((adjustedIndex - 5) * 3000);
        } else if (adjustedIndex > -3) {
            // Balanced to moderate challenge: 80-200% rewards
            multiplier = 8000 + (adjustedIndex * 1714);
        } else if (adjustedIndex > -11) {
            // Moderate grinding: 20-80% rewards
            multiplier = 2000 + ((adjustedIndex + 10) * 750);
        } else {
            // Severe grinding: 5-20% rewards
            multiplier = 500 + ((adjustedIndex + 20) * 150);
            if (multiplier < 500) multiplier = 500; // Minimum 5%
        }

        return uint256(multiplier);
    }

    /// @notice Scale enemy stats for a given player level using the contract's scaling rule
    /// @param baseCombat The enemy's base combat stat
    /// @param baseEndurance The enemy's base endurance stat
    /// @param baseDefense The enemy's base defense stat
    /// @param baseLuck The enemy's base luck stat
    /// @param level The level to scale the enemy to
    /// @return enemyCombat The scaled combat stat
    /// @return enemyEndurance The scaled endurance stat
    /// @return enemyDefense The scaled defense stat
    /// @return enemyLuck The scaled luck stat
    function scaleEnemyForLevel(
        uint256 baseCombat,
        uint256 baseEndurance,
        uint256 baseDefense,
        uint256 baseLuck,
        uint256 level
    ) internal pure returns (uint256 enemyCombat, uint256 enemyEndurance, uint256 enemyDefense, uint256 enemyLuck) {
        if (level == 0) return (baseCombat, baseEndurance, baseDefense, baseLuck);
        uint256 multiplier = CombatConfig.BP_BASE + (CombatConfig.LEVEL_BP_PER_LEVEL * (level - 1));
        enemyCombat = (baseCombat * multiplier) / CombatConfig.BP_BASE;
        enemyEndurance = (baseEndurance * multiplier) / CombatConfig.BP_BASE;
        enemyDefense = (baseDefense * multiplier) / CombatConfig.BP_BASE;
        enemyLuck = (baseLuck * multiplier) / CombatConfig.BP_BASE;
        return (enemyCombat, enemyEndurance, enemyDefense, enemyLuck);
    }
}
