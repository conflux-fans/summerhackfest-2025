// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "../ChainBrawlerClean.sol";

// Test-only subclass that exposes a few admin helpers for tests.
// This contract is placed under `contracts/testHelpers/` so Hardhat
// will compile it and produce artifacts for tests.
contract ChainBrawlerTestHelpersForTests is ChainBrawlerClean {
    // Allow test runner (admin) to set packed character storage directly
    function setPackedCharacter(
        address player,
        uint256 coreStats,
        uint256 progressionStats
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        packedCharacters[player].coreStats = coreStats;
        packedCharacters[player].progressionStats = progressionStats;
    }

    // Allow test runner to set treasury for withdraw checks
    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address prev = treasuryState.treasury;
        treasuryState.treasury = newTreasury;
        emit TreasuryUpdated(prev, newTreasury);
    }

    // Expose enemy base setter for tests (mirrors earlier test helpers)
    function setEnemyBase(
        uint256 id,
        uint256 baseCombat,
        uint256 baseEndurance,
        uint256 baseDefense,
        uint256 baseLuck,
        uint256 xpReward,
        uint256 dropRate
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        gameDataStorage.enemyBaseStorage[id][0] = baseCombat;
        gameDataStorage.enemyBaseStorage[id][1] = baseEndurance;
        gameDataStorage.enemyBaseStorage[id][2] = baseDefense;
        gameDataStorage.enemyBaseStorage[id][3] = baseLuck;
        gameDataStorage.enemyBaseStorage[id][4] = xpReward;
        gameDataStorage.enemyBaseStorage[id][5] = dropRate;
        gameDataStorage.enemyBaseIsSet[id] = true;
        emit EnemyUpdated(id);
    }
}
