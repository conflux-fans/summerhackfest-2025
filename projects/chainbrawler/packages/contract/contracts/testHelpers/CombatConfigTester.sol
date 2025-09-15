// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "../CombatConfig.sol";

contract CombatConfigTester {
    function baseStatsByClass(uint8 classId) external pure returns (uint256, uint256, uint256, uint256) {
        return CombatConfig.baseStatsByClass(classId);
    }

    function enemyBaseById(uint256 id) external pure returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        return CombatConfig.enemyBaseById(id);
    }

    function levelScalingBP(uint256 playerLevel) external pure returns (uint256) {
        return CombatConfig.levelScalingBP(playerLevel);
    }
}
