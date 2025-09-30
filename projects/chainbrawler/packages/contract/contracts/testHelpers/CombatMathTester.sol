// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "../CombatMath.sol";

contract CombatMathTester {
    function performRound(
        uint256 combatSkill,
        uint256 enemyCombat,
        uint256 enemyDefense,
        uint256 defense,
        uint256 currentEndurance,
        uint256 enemyCurrentEndurance,
        uint256 playerLuck,
        uint256 enemyLuck
    ) external pure returns (uint256, uint256, uint256, uint256, bool, bool, bool) {
        return
            CombatMath.performRound(
                combatSkill,
                enemyCombat,
                enemyDefense,
                defense,
                currentEndurance,
                enemyCurrentEndurance,
                playerLuck,
                enemyLuck
            );
    }

    function scaleEnemyForLevel(
        uint256 baseCombat,
        uint256 baseEndurance,
        uint256 baseDefense,
        uint256 baseLuck,
        uint256 level
    ) external pure returns (uint256, uint256, uint256, uint256) {
        return CombatMath.scaleEnemyForLevel(baseCombat, baseEndurance, baseDefense, baseLuck, level);
    }
}
