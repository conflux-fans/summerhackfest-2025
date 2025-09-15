// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/**
 * @title StructuralTypes
 * @author ChainBrawler Team
 * @notice Library containing structural types used across the ChainBrawler system
 */
library StructuralTypes {
    struct CombatContext {
        // enemy-derived
        uint256 enemyBaseCombat;
        uint256 enemyBaseEndurance;
        uint256 enemyBaseDefense;
        uint256 enemyBaseLuck;
        uint256 enemyXpReward;
        uint256 enemyDropRate;
        // player-derived
        uint256 playerCombat;
        uint256 playerEndurance;
        // round state
        uint256 roundDamage;
        // Pack bools together for gas efficiency
        bool enemyIsBoss;
        bool isCritical;
    }

    struct CharacterRuntime {
        uint256 level;
        uint256 currentEndurance;
        uint256 maxEndurance;
        uint256 totalCombat;
        uint256 totalDefense;
        uint256 totalLuck;
    }
}
