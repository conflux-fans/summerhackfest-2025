// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "../SafePacker.sol";
import "../BitPackedCharacterLib.sol";

contract HelpersForTests {
    function clampToMask(uint256 value, uint256 mask) external pure returns (uint256) {
        return SafePacker.clampToMask(value, mask);
    }

    function writeClamped(uint256 packed, uint256 shift, uint256 mask, uint256 value) external pure returns (uint256) {
        return SafePacker.writeClamped(packed, shift, mask, value);
    }

    function generateNewCharacter(
        uint256 seed,
        uint256 baseCombat,
        uint256 baseEndurance,
        uint256 baseDefense,
        uint256 baseLuck
    ) external pure returns (uint256, uint256) {
        BitPackedCharacterLib.BitPackedCharacter memory c = BitPackedCharacterLib.generateNewCharacter(
            address(0),
            seed,
            baseCombat,
            baseEndurance,
            baseDefense,
            baseLuck
        );
        return (c.coreStats, c.progressionStats);
    }
}
