// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/**
 * @title CombatConfig
 * @author ChainBrawler Team
 * @notice Centralized combat tunables used by `CombatMath` and `CombatEngine`.
 * @dev Contains tables and constants used by `CombatMath` and `CombatEngine`.
 */
library CombatConfig {
    // Damage table tunables (mock values copied from authoritative implementation)
    uint256 internal constant DAMAGE_TABLE_CENTER = 5;
    uint256 internal constant DAMAGE_TABLE_SIZE = 11;

    // Weight constants used by CombatMath - Fixed for proper Lone Wolf mechanics
    uint256 internal constant WEIGHT_COMBAT = 9; // Primary damage factor (reduced from 10)
    uint256 internal constant WEIGHT_ENDURANCE = 0; // Remove endurance differential impact
    uint256 internal constant WEIGHT_DEFENSE = 3; // Moderate defense impact
    uint256 internal constant WEIGHT_LUCK = 2; // Increased luck variance (from 1)
    uint256 internal constant WEIGHT_NORMALIZER = 14; // Adjusted for new weights

    // Basis-point scaling
    uint256 internal constant BP_BASE = 1000;
    uint256 internal constant LEVEL_BP_PER_LEVEL = 10;
    // Deterministic per-level growths by class
    /**
     * @notice Returns the stat growth per level for a given character class
     * @return combatPerLevel Combat stat growth per level
     * @return endurancePerLevel Endurance stat growth per level
     * @return defensePerLevel Defense stat growth per level
     * @return luckPerLevel Luck stat growth per level
     */
    function charPerLevelByClass(
        uint8 /*classId*/
    )
        internal
        pure
        returns (uint256 combatPerLevel, uint256 endurancePerLevel, uint256 defensePerLevel, uint256 luckPerLevel)
    {
        combatPerLevel = 2;
        endurancePerLevel = 5;
        defensePerLevel = 1;
        luckPerLevel = 0;
    }

    // Base stat profiles per class. Returns (combat, endurance, defense, luck)
    // Classes: 0=Warrior,1=Tank,2=Defender,3=Rogue
    /**
     * @notice Returns the base stats for a given character class
     * @param classId The character class ID (0=Warrior,1=Tank,2=Defender,3=Rogue)
     * @return baseCombat Base combat stat
     * @return baseEndurance Base endurance stat
     * @return baseDefense Base defense stat
     * @return baseLuck Base luck stat
     */
    function baseStatsByClass(
        uint8 classId
    ) internal pure returns (uint256 baseCombat, uint256 baseEndurance, uint256 baseDefense, uint256 baseLuck) {
        // Flat arrays make it simple to scan and edit base values for each class.
        // Indexes: 0=Warrior,1=Tank,2=Defender,3=Rogue
        uint256[] memory bc = new uint256[](4);
        uint256[] memory be = new uint256[](4);
        uint256[] memory bd = new uint256[](4);
        uint256[] memory bl = new uint256[](4);

        // Tune class base values below
        bc[0] = 12;
        be[0] = 90;
        bd[0] = 4;
        bl[0] = 2; // Warrior - Balanced fighter (baseline)
        bc[1] = 10;
        be[1] = 120;
        bd[1] = 6;
        bl[1] = 1; // Tank - Lower attack, higher defense/HP
        bc[2] = 11;
        be[2] = 100;
        bd[2] = 7;
        bl[2] = 1; // Defender - Moderate attack, high defense
        bc[3] = 13;
        be[3] = 80;
        bd[3] = 3;
        bl[3] = 4; // Rogue - Higher attack/luck, lower defense/HP

        uint256 idx = uint256(classId);
        if (idx > bc.length - 1) {
            idx = bc.length - 1; // fallback to last class (Rogue)
        }
        baseCombat = bc[idx];
        baseEndurance = be[idx];
        baseDefense = bd[idx];
        baseLuck = bl[idx];
    }

    // XP multiplier for enemies per tier
    /**
     * @notice Returns the XP multiplier for enemy rewards
     * @return The XP multiplier as a percentage (110 = 110%)
     */
    function enemyXpMult() internal pure returns (uint256) {
        return 110; // 110% scaling
    }

    // XP required per level formula constants: multiplier numerator/denominator
    // getXPRequiredForLevel uses: (level^3 * XP_LEVEL_EXP_NUM) / XP_LEVEL_EXP_DEN
    uint256 internal constant XP_LEVEL_EXP_NUM = 22;
    uint256 internal constant XP_LEVEL_EXP_DEN = 10;

    // Centralized scaling helper: returns a basis-point scaling factor for a given player level
    // For migration we keep the same simple rule: no scaling for level <= 3, then +5% per level above 3
    /**
     * @notice Returns the basis-point scaling factor for a given player level
     * @param playerLevel The player's current level
     * @return bp The scaling factor in basis points (100 = 100% = no change)
     */
    function levelScalingBP(uint256 playerLevel) internal pure returns (uint256 bp) {
        if (playerLevel < 4) {
            return 100; // 100% == no change
        }
        return 100 + ((playerLevel - 3) * 5);
    }

    // Maximum supported class id (0..maxClass()). Keep as migration-time reference.
    /**
     * @notice Returns the maximum supported character class ID
     * @return The maximum class ID (currently 3, representing 4 classes: 0-3)
     */
    function maxClass() internal pure returns (uint8) {
        return 3;
    }

    /**
     * @notice Returns the damage table for attackers
     * @return Array of damage values for different combat outcomes
     */
    function damageTableAttacker() internal pure returns (uint8[] memory) {
        uint8[] memory t = new uint8[](DAMAGE_TABLE_SIZE);
        t[0] = 1;
        t[1] = 2;
        t[2] = 4;
        t[3] = 6;
        t[4] = 8;
        t[5] = 10;
        t[6] = 12;
        t[7] = 14;
        t[8] = 16;
        t[9] = 18;
        t[10] = 20;
        return t;
    }

    /**
     * @notice Returns the damage table for defenders
     * @return Array of damage values for different combat outcomes
     */
    function damageTableDefender() internal pure returns (uint8[] memory) {
        uint8[] memory t = new uint8[](DAMAGE_TABLE_SIZE);
        t[0] = 20;
        t[1] = 18;
        t[2] = 16;
        t[3] = 14;
        t[4] = 12;
        t[5] = 10;
        t[6] = 8;
        t[7] = 6;
        t[8] = 4;
        t[9] = 2;
        t[10] = 1;
        return t;
    }

    // Simple enemy base profiles by id. Returns (combat, endurance, defense, luck, xpReward, dropRate)
    /**
     * @notice Returns the base stats for a given enemy ID
     * @param id The enemy ID (1-16)
     * @return baseCombat Base combat stat
     * @return baseEndurance Base endurance stat
     * @return baseDefense Base defense stat
     * @return baseLuck Base luck stat
     * @return xpReward XP reward for defeating this enemy
     * @return dropRate Drop rate in basis points (e.g., 300 = 3%)
     */
    function enemyBaseById(
        uint256 id
    )
        internal
        pure
        returns (
            uint256 baseCombat,
            uint256 baseEndurance,
            uint256 baseDefense,
            uint256 baseLuck,
            uint256 xpReward,
            uint256 dropRate
        )
    {
        uint256 maxEnemies = 16;

        if (id == 0 || id > maxEnemies) {
            return _getDefaultEnemyStats(id);
        }

        return _getConfiguredEnemyStats(id);
    }

    /// @notice Get default stats for out-of-range enemy IDs
    /// @param id The enemy ID
    /// @return baseCombat Base combat stat
    /// @return baseEndurance Base endurance stat
    /// @return baseDefense Base defense stat
    /// @return baseLuck Base luck stat
    /// @return xpReward XP reward for defeating this enemy
    /// @return dropRate Drop rate in basis points
    function _getDefaultEnemyStats(
        uint256 id
    )
        internal
        pure
        returns (
            uint256 baseCombat,
            uint256 baseEndurance,
            uint256 baseDefense,
            uint256 baseLuck,
            uint256 xpReward,
            uint256 dropRate
        )
    {
        baseCombat = 10 + (id * 2);
        baseEndurance = 20 + (id * 5);
        baseDefense = 5 + (id / 2);
        baseLuck = 2 + (id / 5);
        xpReward = 50 + (id * 5);
        dropRate = 100 + (id * 2);
    }

    /// @notice Get configured stats for valid enemy IDs (1-16)
    /// @param id The enemy ID (1-16)
    /// @return baseCombat Base combat stat
    /// @return baseEndurance Base endurance stat
    /// @return baseDefense Base defense stat
    /// @return baseLuck Base luck stat
    /// @return xpReward XP reward for defeating this enemy
    /// @return dropRate Drop rate in basis points
    function _getConfiguredEnemyStats(
        uint256 id
    )
        internal
        pure
        returns (
            uint256 baseCombat,
            uint256 baseEndurance,
            uint256 baseDefense,
            uint256 baseLuck,
            uint256 xpReward,
            uint256 dropRate
        )
    {
        uint256[] memory bc = new uint256[](17);
        uint256[] memory be = new uint256[](17);
        uint256[] memory bd = new uint256[](17);
        uint256[] memory bl = new uint256[](17);
        uint256[] memory xp = new uint256[](17);
        uint256[] memory dr = new uint256[](17);

        _populateEarlyGameEnemies(bc, be, bd, bl, xp, dr);
        _populateMidGameEnemies(bc, be, bd, bl, xp, dr);
        _populateHighLevelEnemies(bc, be, bd, bl, xp, dr);

        return (bc[id], be[id], bd[id], bl[id], xp[id], dr[id]);
    }

    /// @notice Populate early game enemy stats (1-5)
    /// @param bc Combat stats array
    /// @param be Endurance stats array
    /// @param bd Defense stats array
    /// @param bl Luck stats array
    /// @param xp XP reward array
    /// @param dr Drop rate array
    function _populateEarlyGameEnemies(
        uint256[] memory bc,
        uint256[] memory be,
        uint256[] memory bd,
        uint256[] memory bl,
        uint256[] memory xp,
        uint256[] memory dr
    ) internal pure {
        // Early game enemies (1-5) - for character levels 1-5
        bc[1] = 13;
        be[1] = 30;
        bd[1] = 2;
        bl[1] = 2;
        xp[1] = 50;
        dr[1] = 300; // Goblin
        bc[2] = 15;
        be[2] = 30;
        bd[2] = 3;
        bl[2] = 2;
        xp[2] = 60;
        dr[2] = 500; // Orc
        bc[3] = 17;
        be[3] = 35;
        bd[3] = 3;
        bl[3] = 3;
        xp[3] = 70;
        dr[3] = 700; // Skeleton
        bc[4] = 19;
        be[4] = 40;
        bd[4] = 4;
        bl[4] = 3;
        xp[4] = 80;
        dr[4] = 900; // Wolf
        bc[5] = 21;
        be[5] = 45;
        bd[5] = 4;
        bl[5] = 4;
        xp[5] = 90;
        dr[5] = 1100; // Bear
    }

    /// @notice Populate mid game enemy stats (6-10)
    /// @param bc Combat stats array
    /// @param be Endurance stats array
    /// @param bd Defense stats array
    /// @param bl Luck stats array
    /// @param xp XP reward array
    /// @param dr Drop rate array
    function _populateMidGameEnemies(
        uint256[] memory bc,
        uint256[] memory be,
        uint256[] memory bd,
        uint256[] memory bl,
        uint256[] memory xp,
        uint256[] memory dr
    ) internal pure {
        // Mid game enemies (6-10) - for character levels 6-10
        bc[6] = 26;
        be[6] = 50;
        bd[6] = 5;
        bl[6] = 4;
        xp[6] = 100;
        dr[6] = 1300; // Troll
        bc[7] = 28;
        be[7] = 55;
        bd[7] = 5;
        bl[7] = 5;
        xp[7] = 110;
        dr[7] = 1500; // Ogre
        bc[8] = 30;
        be[8] = 60;
        bd[8] = 6;
        bl[8] = 5;
        xp[8] = 120;
        dr[8] = 1700; // Giant Spider
        bc[9] = 32;
        be[9] = 65;
        bd[9] = 6;
        bl[9] = 6;
        xp[9] = 130;
        dr[9] = 1900; // Wyvern
        bc[10] = 34;
        be[10] = 70;
        bd[10] = 7;
        bl[10] = 6;
        xp[10] = 140;
        dr[10] = 2100; // Drake
    }

    /// @notice Populate high level enemy stats (11-16)
    /// @param bc Combat stats array
    /// @param be Endurance stats array
    /// @param bd Defense stats array
    /// @param bl Luck stats array
    /// @param xp XP reward array
    /// @param dr Drop rate array
    function _populateHighLevelEnemies(
        uint256[] memory bc,
        uint256[] memory be,
        uint256[] memory bd,
        uint256[] memory bl,
        uint256[] memory xp,
        uint256[] memory dr
    ) internal pure {
        // High level enemies (11-16) - for character levels 11-16
        bc[11] = 36;
        be[11] = 75;
        bd[11] = 7;
        bl[11] = 7;
        xp[11] = 150;
        dr[11] = 2300; // Minotaur
        bc[12] = 38;
        be[12] = 80;
        bd[12] = 8;
        bl[12] = 7;
        xp[12] = 160;
        dr[12] = 2500; // Hydra
        bc[13] = 40;
        be[13] = 85;
        bd[13] = 8;
        bl[13] = 8;
        xp[13] = 170;
        dr[13] = 2700; // Demon
        bc[14] = 42;
        be[14] = 90;
        bd[14] = 9;
        bl[14] = 8;
        xp[14] = 180;
        dr[14] = 2800; // Lich
        bc[15] = 44;
        be[15] = 95;
        bd[15] = 9;
        bl[15] = 9;
        xp[15] = 190;
        dr[15] = 2900; // Ancient Dragon
        bc[16] = 46;
        be[16] = 100;
        bd[16] = 10;
        bl[16] = 10;
        xp[16] = 200;
        dr[16] = 3000; // Titan
    }

    // Backwards-compatible wrapper used by production contracts.
    // Some contract code refers to `baseStatsByEnemy(uint8)`; provide a thin
    // inline forwarder to the canonical `enemyBaseById` implementation.
    /**
     * @notice Backwards-compatible wrapper for baseStatsByEnemy
     * @param id The enemy ID (1-16)
     * @return baseCombat Base combat stat
     * @return baseEndurance Base endurance stat
     * @return baseDefense Base defense stat
     * @return baseLuck Base luck stat
     * @return xpReward XP reward for defeating this enemy
     * @return dropRate Drop rate in basis points (e.g., 300 = 3%)
     */
    function baseStatsByEnemy(
        uint8 id
    )
        internal
        pure
        returns (
            uint256 baseCombat,
            uint256 baseEndurance,
            uint256 baseDefense,
            uint256 baseLuck,
            uint256 xpReward,
            uint256 dropRate
        )
    {
        return enemyBaseById(uint256(id));
    }
}
