// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;
import { GameError } from "./Errors.sol";
import { SafePacker } from "./SafePacker.sol";
// CombatConfig no longer read directly by this library; callers should supply base stats

/**
 * @title BitPackedCharacterLib
 * @author ChainBrawler Team
 * @notice Utility library for packing and unpacking character core and progression fields
 *         into two 256-bit storage words for gas-efficient migrations and tests.
 * @dev The shifts and masks are migration-specific and used by `ChainBrawler` and tests.
 */
library BitPackedCharacterLib {
    // Mock constants for bit shifts/masks used by ChainBrawler migration
    uint256 internal constant LEVEL_SHIFT = 0;
    uint256 internal constant LEVEL_MASK = 0xFF;
    uint256 internal constant IS_ALIVE_SHIFT = 8;
    uint256 internal constant IS_ALIVE_MASK = 0x1;
    uint256 internal constant IN_COMBAT_SHIFT = 9;
    uint256 internal constant IN_COMBAT_MASK = 0x1;
    uint256 internal constant CURRENT_ENDURANCE_SHIFT = 16;
    uint256 internal constant CURRENT_ENDURANCE_MASK = 0xFFFF;
    uint256 internal constant MAX_ENDURANCE_SHIFT = 32;
    uint256 internal constant MAX_ENDURANCE_MASK = 0xFFFF;

    uint256 internal constant COMBAT_SKILL_SHIFT = 48;
    uint256 internal constant COMBAT_SKILL_MASK = 0xFFFF;
    uint256 internal constant DEFENSE_SHIFT = 64;
    uint256 internal constant DEFENSE_MASK = 0xFFFF;
    uint256 internal constant LUCK_SHIFT = 80;
    uint256 internal constant LUCK_MASK = 0xFFFF;

    // Progression stats shifts/masks
    uint256 internal constant TOTAL_KILLS_SHIFT = 0;
    uint256 internal constant TOTAL_KILLS_MASK = 0xFFFF; // [0-15] 16 bits
    // Experience for level progression (resets on level up) - moved to fill points gap
    uint256 internal constant EXPERIENCE_SHIFT = 16;
    uint256 internal constant EXPERIENCE_MASK = 0xFFFFFFFFFFFFFFFF; // [16-79] 64 bits (moved from 64)
    // Last heal time for cooldown tracking - moved down
    uint256 internal constant LAST_HEAL_TIME_SHIFT = 80;
    uint256 internal constant LAST_HEAL_TIME_MASK = 0xFFFFFFFFFFFFFFFF; // [80-143] 64 bits (moved from 128)
    // Last regeneration time for passive regen tracking - moved down
    uint256 internal constant LAST_REGEN_TIME_SHIFT = 144;
    uint256 internal constant LAST_REGEN_TIME_MASK = 0xFFFFFFFFFFFFFFFF; // [144-207] 64 bits (moved from 192)

    // Equipped bonuses are now stored in `coreStats` to simplify storage layout.
    uint256 internal constant EQUIPPED_COMBAT_SHIFT = 96;
    uint256 internal constant EQUIPPED_COMBAT_MASK = 0xFF;
    uint256 internal constant EQUIPPED_ENDURANCE_SHIFT = 104;
    uint256 internal constant EQUIPPED_ENDURANCE_MASK = 0xFF;
    uint256 internal constant EQUIPPED_DEFENSE_SHIFT = 112;
    uint256 internal constant EQUIPPED_DEFENSE_MASK = 0xFF;
    uint256 internal constant EQUIPPED_LUCK_SHIFT = 120;
    uint256 internal constant EQUIPPED_LUCK_MASK = 0xFF;
    // Reserved slot for storing character metadata such as class id.
    // This lives in the `coreStats` word (separate from progressionStats) and
    // does not overlap with existing equipped bonus fields. Using an 8-bit
    // slot at shift 128 keeps the layout compact and migration-friendly.
    uint256 internal constant CHARACTER_CLASS_SHIFT = 128;
    uint256 internal constant CHARACTER_CLASS_MASK = 0xFF;

    struct BitPackedCharacter {
        uint256 coreStats;
        uint256 progressionStats;
    }

    /// @notice Generate base stats influenced by a seed. Callers supply per-class base stats.
    /// @param seed The seed for random stat generation
    /// @param baseCombat The base combat stat for the character class
    /// @param baseEndurance The base endurance stat for the character class
    /// @param baseDefense The base defense stat for the character class
    /// @param baseLuck The base luck stat for the character class
    /// @return A new BitPackedCharacter with generated stats
    function generateNewCharacter(
        address /*player*/,
        uint256 seed,
        uint256 baseCombat,
        uint256 baseEndurance,
        uint256 baseDefense,
        uint256 baseLuck
    ) internal pure returns (BitPackedCharacter memory) {
        BitPackedCharacter memory c;

        // Derive small variations per-stat using keccak(seed||salt).
        uint256 varCombat = uint256(keccak256(abi.encodePacked(seed, uint256(1)))) % 5; // 0..4
        uint256 varEndurance = uint256(keccak256(abi.encodePacked(seed, uint256(2)))) % 21; // 0..20
        uint256 varDefense = uint256(keccak256(abi.encodePacked(seed, uint256(3)))) % 5; // 0..4
        uint256 varLuck = uint256(keccak256(abi.encodePacked(seed, uint256(4)))) % 5; // 0..4

        uint256 finalCombat = baseCombat + varCombat;
        uint256 finalEndurance = baseEndurance + varEndurance;
        uint256 finalDefense = baseDefense + varDefense;
        uint256 finalLuck = baseLuck + varLuck;

        // Defensive checks: ensure derived values fit into assigned bit widths
        if (finalCombat > COMBAT_SKILL_MASK) revert GameError(2001);
        if (finalEndurance > MAX_ENDURANCE_MASK) revert GameError(2002);
        if (finalDefense > DEFENSE_MASK) revert GameError(2003);
        if (finalLuck > LUCK_MASK) revert GameError(2004);

        // Pack into coreStats. Current endurance starts at max. Level starts at 1.
        c.coreStats =
            (uint256(1) << LEVEL_SHIFT) |
            (1 << IS_ALIVE_SHIFT) |
            (finalEndurance << CURRENT_ENDURANCE_SHIFT) |
            (finalEndurance << MAX_ENDURANCE_SHIFT) |
            (finalCombat << COMBAT_SKILL_SHIFT) |
            (finalDefense << DEFENSE_SHIFT) |
            (finalLuck << LUCK_SHIFT) |
            // equipped bonuses (currently zero)
            (uint256(0) << EQUIPPED_COMBAT_SHIFT) |
            (uint256(0) << EQUIPPED_ENDURANCE_SHIFT) |
            (uint256(0) << EQUIPPED_DEFENSE_SHIFT) |
            (uint256(0) << EQUIPPED_LUCK_SHIFT);

        c.progressionStats = 0;
        return c;
    }

    // Character struct view of packed data
    struct Character {
        uint256 level;
        uint256 experience; // Resets on level up
        uint256 totalKills;
        bool isAlive;
        uint256 currentEndurance;
        uint256 maxEndurance;
        uint256 totalCombat;
        uint256 totalEndurance;
        uint256 totalDefense;
        uint256 totalLuck;
        uint256 equippedCombatBonus;
        uint256 equippedEnduranceBonus;
        uint256 equippedDefenseBonus;
        uint256 equippedLuckBonus;
    }

    /// @notice Safe endurance setter with bounds validation
    /// @param coreStats The current core stats packed value
    /// @param newEndurance The new endurance value to set
    /// @return The updated core stats with new endurance
    function setCurrentEnduranceSafe(uint256 coreStats, uint256 newEndurance) internal pure returns (uint256) {
        // Extract max endurance components
        uint256 baseMaxEndurance = (coreStats >> MAX_ENDURANCE_SHIFT) & MAX_ENDURANCE_MASK;
        uint256 equippedEnduranceBonus = (coreStats >> EQUIPPED_ENDURANCE_SHIFT) & EQUIPPED_ENDURANCE_MASK;
        uint256 totalMaxEndurance = baseMaxEndurance + equippedEnduranceBonus;

        // Cap to total max endurance (data integrity guarantee)
        if (newEndurance > totalMaxEndurance) {
            newEndurance = totalMaxEndurance;
        }

        // Use SafePacker for additional overflow protection
        return SafePacker.writeClamped(coreStats, CURRENT_ENDURANCE_SHIFT, CURRENT_ENDURANCE_MASK, newEndurance);
    }

    /// @notice Unpack a BitPackedCharacter into a Character struct
    /// @param p The BitPackedCharacter to unpack
    /// @return A Character struct with all unpacked fields
    function unpackCharacter(BitPackedCharacter memory p) internal pure returns (Character memory) {
        Character memory out;
        out.level = (p.coreStats >> LEVEL_SHIFT) & LEVEL_MASK;
        out.isAlive = ((p.coreStats >> IS_ALIVE_SHIFT) & IS_ALIVE_MASK) == 1;
        out.currentEndurance = (p.coreStats >> CURRENT_ENDURANCE_SHIFT) & CURRENT_ENDURANCE_MASK;

        // Extract base stats
        uint256 baseMaxEndurance = (p.coreStats >> MAX_ENDURANCE_SHIFT) & MAX_ENDURANCE_MASK;
        uint256 baseCombat = (p.coreStats >> COMBAT_SKILL_SHIFT) & COMBAT_SKILL_MASK;
        uint256 baseDefense = (p.coreStats >> DEFENSE_SHIFT) & DEFENSE_MASK;
        uint256 baseLuck = (p.coreStats >> LUCK_SHIFT) & LUCK_MASK;

        // Extract equipment bonuses
        out.equippedCombatBonus = (p.coreStats >> EQUIPPED_COMBAT_SHIFT) & EQUIPPED_COMBAT_MASK;
        out.equippedEnduranceBonus = (p.coreStats >> EQUIPPED_ENDURANCE_SHIFT) & EQUIPPED_ENDURANCE_MASK;
        out.equippedDefenseBonus = (p.coreStats >> EQUIPPED_DEFENSE_SHIFT) & EQUIPPED_DEFENSE_MASK;
        out.equippedLuckBonus = (p.coreStats >> EQUIPPED_LUCK_SHIFT) & EQUIPPED_LUCK_MASK;

        // Extract progression stats from progressionStats slot
        out.totalKills = (p.progressionStats >> TOTAL_KILLS_SHIFT) & TOTAL_KILLS_MASK;
        out.experience = (p.progressionStats >> EXPERIENCE_SHIFT) & EXPERIENCE_MASK;

        // Calculate total stats including equipment bonuses
        out.maxEndurance = baseMaxEndurance + out.equippedEnduranceBonus;
        out.totalCombat = baseCombat + out.equippedCombatBonus;
        out.totalDefense = baseDefense + out.equippedDefenseBonus;
        out.totalLuck = baseLuck + out.equippedLuckBonus;

        return out;
    }
}
