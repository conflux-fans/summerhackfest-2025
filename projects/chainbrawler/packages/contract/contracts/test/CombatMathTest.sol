// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "../CombatMath.sol";

/**
 * @title CombatMathTest
 * @notice Test contract to expose CombatMath library functions for testing
 */
contract CombatMathTest {
    /**
     * Test wrapper for calculateCombatIndex
     */
    function calculateCombatIndex(
        uint256 playerCombat,
        uint256 playerDefense,
        uint256 playerLuck,
        uint256 enemyCombat,
        uint256 enemyDefense,
        uint256 enemyLuck
    ) external pure returns (int256) {
        return
            CombatMath.calculateCombatIndex(
                playerCombat,
                playerDefense,
                playerLuck,
                enemyCombat,
                enemyDefense,
                enemyLuck
            );
    }

    /**
     * Test wrapper for calculateDifficultyMultiplier
     */
    function calculateDifficultyMultiplier(int256 combatIndex) external pure returns (uint256) {
        return CombatMath.calculateDifficultyMultiplier(combatIndex);
    }
}
