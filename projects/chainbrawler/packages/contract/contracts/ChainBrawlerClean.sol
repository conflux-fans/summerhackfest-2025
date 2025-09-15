// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import { ChainBrawlerState } from "./ChainBrawlerState.sol";
import { CombatEngine } from "./CombatEngine.sol";
import { BitPackedCharacterLib } from "./BitPackedCharacterLib.sol";
import { CombatConfig } from "./CombatConfig.sol";
import { IChainBrawlerUI } from "./IChainBrawlerUI.sol";
import { ITreasuryInfo } from "./interfaces/ITreasuryInfo.sol";
import { ILeaderboardInfo } from "./interfaces/ILeaderboardInfo.sol";
import { ICharacterValidation } from "./interfaces/ICharacterValidation.sol";
import { GameError } from "./Errors.sol";
import { CombatState } from "./CombatStructs.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ChainBrawlerClean
 * @author ChainBrawler Team
 * @notice Clean production version of ChainBrawler without test helpers
 * @dev Focused on core game functionality with UI-friendly interfaces
 */
contract ChainBrawlerClean is
    ChainBrawlerState,
    CombatEngine,
    AccessControl,
    ReentrancyGuard,
    IChainBrawlerUI,
    ITreasuryInfo,
    ILeaderboardInfo,
    ICharacterValidation
{
    using BitPackedCharacterLib for BitPackedCharacterLib.BitPackedCharacter;

    // ==================== Constants
    uint256 private constant CREATION_FEE = 15 ether;
    uint256 private constant HEALING_FEE = 5 ether;
    uint256 private constant RESURRECTION_FEE = 10 ether;
    uint256 private constant HEALING_COOLDOWN = 60 seconds;
    uint256 private constant REGEN_WINDOW = 24 hours;
    /// @notice Maximum drop rate in basis points (10000 = 100%)
    uint256 public constant MAX_DROP_RATE_BP = 10000;

    // Level up and experience constants
    uint256 private constant EARLY_LEVEL_XP_BONUS_NUMERATOR = 150; // 150% = +50% bonus
    uint256 private constant EARLY_LEVEL_XP_BONUS_DENOMINATOR = 100;
    uint256 private constant EARLY_LEVEL_XP_BONUS_MAX_LEVEL = 3;
    uint256 private constant MAX_REASONABLE_LEVEL = 100; // Safety limit for level ups
    uint256 private constant MAX_BATCH_SIZE = 100; // Maximum batch size for operations

    // Storage and events were moved into ChainBrawlerState. This contract now
    // focuses on UI-friendly functions and delegates heavy logic to CombatEngine/CombatLogic.

    // ==================== UI-Friendly Character Data Structure (inherited from IChainBrawlerUI)

    // ==================== Modifiers
    modifier onlyOwner() {
        // Keep modifier name for compatibility; require admin role instead
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert GameError(1001);
        _;
    }

    modifier characterExists(address player) {
        if (packedCharacters[player].coreStats == 0) revert GameError(1201);
        _;
    }

    modifier characterIsAlive(address player) {
        if (!isAlive(player)) revert GameError(1202);
        _;
    }

    modifier validAddress(address addr) {
        if (addr == address(0)) revert GameError(1203);
        _;
    }

    modifier notInCombat(address player) {
        bool _inCombatLocal = ((packedCharacters[player].coreStats >> BitPackedCharacterLib.IN_COMBAT_SHIFT) &
            BitPackedCharacterLib.IN_COMBAT_MASK) == 1;
        if (_inCombatLocal) revert GameError(1204);
        _;
    }

    modifier inCombat(address player) {
        bool _inCombatFlag = ((packedCharacters[player].coreStats >> BitPackedCharacterLib.IN_COMBAT_SHIFT) &
            BitPackedCharacterLib.IN_COMBAT_MASK) == 1;
        if (!_inCombatFlag) revert GameError(1205);
        _;
    }

    modifier paysFee(uint256 fee) {
        if (msg.value < fee) revert GameError(1101);
        _;
    }

    /// @notice Initialize the ChainBrawlerClean contract with default parameters
    // solhint-disable-next-line no-empty-blocks
    constructor() {
        treasuryState.treasury = msg.sender;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Default epoch & refund parameters
        epochState.currentEpoch = 1;
        epochState.epochDuration = 7 days; // Production: 7 days per epoch
        epochState.epochStartTime = block.timestamp; // Initialize current epoch start time
        gasRefundConfig.capPerFight = 300000000000000; // 0.0003 CFX
        gasRefundConfig.perEpochRefundCapPerAccount = gasRefundConfig.capPerFight * 10;
        gasRefundConfig.lowLevelThreshold = 5;
    }

    /// @notice Links to on-chain leaderboard treasury/manager (optional)
    address public leaderboardTreasury;
    /// @notice Links to on-chain leaderboard manager (optional)
    address public leaderboardManager;

    // ====== Epoch / Refund admin helpers (defaults set here)
    // Defaults are configurable via admin setters below.

    // Note: test-only setters (e.g. setPackedCharacter, setPackedEnemy, setTestAllowExtraRound)
    // have been removed from the production contract to reduce deployed bytecode size.
    // Tests should deploy `ChainBrawlerTestHelpers` (a test-only subclass) which exposes
    // helper functions and forwards to the production logic. Keeping only production
    // functionality here reduces contract size and surface area.

    // ==================== Core Game Functions

    /// @notice Create a new character for the player
    /// @param characterClass The character class to create (0-3)
    function createCharacter(uint256 characterClass) external payable paysFee(CREATION_FEE) nonReentrant {
        if (packedCharacters[msg.sender].coreStats != 0) revert GameError(1206);
        if (!(characterClass < 4)) revert GameError(1207);

        (uint256 baseCombat, uint256 baseEndurance, uint256 baseDefense, uint256 baseLuck) = getClassBase(
            characterClass
        );

        // Create a simple character using direct bit manipulation (simplified version)
        uint256 coreStats = 0;
        uint256 progressionStats = 0;

        // Pack basic data (level=1, alive=true, current endurance=max endurance)
        coreStats |= (1 & BitPackedCharacterLib.LEVEL_MASK) << BitPackedCharacterLib.LEVEL_SHIFT;
        coreStats |= (1 & BitPackedCharacterLib.IS_ALIVE_MASK) << BitPackedCharacterLib.IS_ALIVE_SHIFT;
        coreStats |=
            (baseEndurance & BitPackedCharacterLib.CURRENT_ENDURANCE_MASK) <<
            BitPackedCharacterLib.CURRENT_ENDURANCE_SHIFT;
        coreStats |=
            (baseEndurance & BitPackedCharacterLib.MAX_ENDURANCE_MASK) << BitPackedCharacterLib.MAX_ENDURANCE_SHIFT;
        coreStats |= (baseCombat & BitPackedCharacterLib.COMBAT_SKILL_MASK) << BitPackedCharacterLib.COMBAT_SKILL_SHIFT;
        coreStats |= (baseDefense & BitPackedCharacterLib.DEFENSE_MASK) << BitPackedCharacterLib.DEFENSE_SHIFT;
        coreStats |= (baseLuck & BitPackedCharacterLib.LUCK_MASK) << BitPackedCharacterLib.LUCK_SHIFT;

        // Store the chosen character class in a dedicated compact slot so the UI can render the correct class.
        coreStats |=
            (characterClass & BitPackedCharacterLib.CHARACTER_CLASS_MASK) <<
            BitPackedCharacterLib.CHARACTER_CLASS_SHIFT;

        packedCharacters[msg.sender].coreStats = coreStats;

        // Initialize progression stats (don't set lastHealTime - new characters should not have healing cooldown)
        packedCharacters[msg.sender].progressionStats = progressionStats;

        // Add player to global tracking list
        _addPlayerIfNew(msg.sender);

        distributeFee(msg.value);
        // UI-friendly event including chosen class for frontend rendering
        emit CharacterCreated(msg.sender, characterClass);
    }

    /// @notice Heal the player's character to full health
    function healCharacter()
        external
        payable
        characterExists(msg.sender)
        characterIsAlive(msg.sender)
        notInCombat(msg.sender)
        nonReentrant
    {
        if (msg.value < HEALING_FEE) revert GameError(1101);

        // Apply any pending passive regeneration first
        _applyPassiveRegeneration(msg.sender);

        BitPackedCharacterLib.Character memory char = BitPackedCharacterLib.unpackCharacter(
            packedCharacters[msg.sender]
        );
        if (!(char.currentEndurance < char.maxEndurance)) revert GameError(1102);

        // Check healing cooldown by extracting lastHealTime directly
        uint256 lastHealTime = (packedCharacters[msg.sender].progressionStats >>
            BitPackedCharacterLib.LAST_HEAL_TIME_SHIFT) & BitPackedCharacterLib.LAST_HEAL_TIME_MASK;
        if (!(block.timestamp > lastHealTime + HEALING_COOLDOWN - 1)) revert GameError(1103);

        // Update current endurance to total max endurance (base + equipment bonus)
        uint256 coreStats = packedCharacters[msg.sender].coreStats;
        uint256 baseMaxEndurance = (coreStats >> BitPackedCharacterLib.MAX_ENDURANCE_SHIFT) &
            BitPackedCharacterLib.MAX_ENDURANCE_MASK;
        uint256 equippedEnduranceBonus = (coreStats >> BitPackedCharacterLib.EQUIPPED_ENDURANCE_SHIFT) &
            BitPackedCharacterLib.EQUIPPED_ENDURANCE_MASK;
        uint256 totalMaxEndurance = baseMaxEndurance + equippedEnduranceBonus;
        coreStats = BitPackedCharacterLib.setCurrentEnduranceSafe(coreStats, totalMaxEndurance);
        packedCharacters[msg.sender].coreStats = coreStats;

        // Update last heal time (for cooldown tracking)
        uint256 progressionStats = packedCharacters[msg.sender].progressionStats;
        progressionStats = (progressionStats &
            ~(BitPackedCharacterLib.LAST_HEAL_TIME_MASK << BitPackedCharacterLib.LAST_HEAL_TIME_SHIFT));
        progressionStats |=
            (block.timestamp & BitPackedCharacterLib.LAST_HEAL_TIME_MASK) << BitPackedCharacterLib.LAST_HEAL_TIME_SHIFT;

        // Also update last regen time so passive regeneration starts fresh
        progressionStats = (progressionStats &
            ~(BitPackedCharacterLib.LAST_REGEN_TIME_MASK << BitPackedCharacterLib.LAST_REGEN_TIME_SHIFT));
        progressionStats |=
            (block.timestamp & BitPackedCharacterLib.LAST_REGEN_TIME_MASK) <<
            BitPackedCharacterLib.LAST_REGEN_TIME_SHIFT;

        packedCharacters[msg.sender].progressionStats = progressionStats;

        distributeFee(msg.value);
        // Emit specific healed event for UI (emit total max endurance including equipment bonus)
        emit CharacterHealed(msg.sender, char.maxEndurance);
    }

    /// @notice Resurrect a dead character with half health
    function resurrectCharacter() external payable characterExists(msg.sender) paysFee(RESURRECTION_FEE) nonReentrant {
        BitPackedCharacterLib.Character memory char = BitPackedCharacterLib.unpackCharacter(
            packedCharacters[msg.sender]
        );
        if (char.isAlive) revert GameError(1208);

        // Resurrect with half of base max health (without equipment bonus)
        uint256 coreStats = packedCharacters[msg.sender].coreStats;
        uint256 baseMaxEndurance = (coreStats >> BitPackedCharacterLib.MAX_ENDURANCE_SHIFT) &
            BitPackedCharacterLib.MAX_ENDURANCE_MASK;
        uint256 halfHealth = baseMaxEndurance / 2;

        // Set alive = true
        coreStats |= (1 & BitPackedCharacterLib.IS_ALIVE_MASK) << BitPackedCharacterLib.IS_ALIVE_SHIFT;
        // Set current endurance = half base max (using safe setter)
        coreStats = BitPackedCharacterLib.setCurrentEnduranceSafe(coreStats, halfHealth);

        packedCharacters[msg.sender].coreStats = coreStats;

        distributeFee(msg.value);
        emit CharacterResurrected(msg.sender);
    }

    /// @notice Fight an enemy with specified level
    /// @param enemyId The ID of the enemy to fight
    /// @param enemyLevel The level of the enemy to fight
    function fightEnemy(
        uint256 enemyId,
        uint256 enemyLevel
    ) external virtual characterExists(msg.sender) characterIsAlive(msg.sender) notInCombat(msg.sender) {
        if (!(enemyLevel > 0 && enemyLevel < 251)) revert GameError(1301);

        // Apply passive regeneration before combat
        _applyPassiveRegeneration(msg.sender);

        _fightEnemyInternal(enemyId, enemyLevel, false);
    }

    /// @notice Continue an existing fight
    function continueFight() external inCombat(msg.sender) nonReentrant {
        _continueFightInternal();
    }

    /// @notice Attempt to flee from combat
    function fleeRound() external inCombat(msg.sender) nonReentrant {
        _fleeRoundInternal();
    }

    // ==================== UI-Friendly Data Access

    /**
     * Note: heavy, ABI-expensive getters (getCharacterData, getCharacterDataBatch,
     * getCharacterHP, getMinimalCharacter) were intentionally removed from the
     * production contract to reduce deployed bytecode size. Tests and the SDK
     * should use the low-overhead `getPackedCharacter` / `getPackedCharacters`
     * getters and unpack the values off-chain, or rely on the test-only
     * `ChainBrawlerTestHelpers` contract which re-exposes compatibility helpers.
     */

    // Low-level packed storage access is intentionally internal to keep the
    // external ABI surface small; test-only subclasses may re-expose these if
    // needed for debugging or deterministic tests.
    /// @notice Get packed character data for a player
    /// @param player The player address to get data for
    /// @return coreStats The packed core stats
    /// @return progressionStats The packed progression stats
    function _getPackedCharacter(address player) internal view returns (uint256 coreStats, uint256 progressionStats) {
        coreStats = packedCharacters[player].coreStats;
        progressionStats = packedCharacters[player].progressionStats;
    }

    /// @notice Internal deterministic unpacker for packed character words
    /// @param coreStats The packed core stats
    /// @param progressionStats The packed progression stats
    /// @return The decoded Character struct
    function _decodePackedCharacter(
        uint256 coreStats,
        uint256 progressionStats
    ) internal pure returns (BitPackedCharacterLib.Character memory) {
        BitPackedCharacterLib.BitPackedCharacter memory p = BitPackedCharacterLib.BitPackedCharacter({
            coreStats: coreStats,
            progressionStats: progressionStats
        });
        BitPackedCharacterLib.Character memory c = BitPackedCharacterLib.unpackCharacter(p);
        return c;
    }

    /**
     * @notice Convenience read that returns fully decoded character fields
     * @dev Calls `decodePackedCharacter` internally using the stored packed words
     *      for the provided player address. This provides an SDK-friendly
     *      single-call getter so clients don't need to call `getPackedCharacter`
     *      and decode off-chain.
     */
    /// @notice Get character data for a player
    /// @param player The player address to get character data for
    /// @return characterClass The character's class
    /// @return level The character's level
    /// @return experience The character's experience
    /// @return currentEndurance The character's current endurance
    /// @return maxEndurance The character's maximum endurance
    /// @return totalCombat The character's total combat stat
    /// @return totalDefense The character's total defense stat
    /// @return totalLuck The character's total luck stat
    /// @return aliveFlag Whether the character is alive
    /// @return equippedCombatBonus The equipped combat bonus
    /// @return equippedEnduranceBonus The equipped endurance bonus
    /// @return equippedDefenseBonus The equipped defense bonus
    /// @return equippedLuckBonus The equipped luck bonus
    /// @return totalKills The total number of kills
    function getCharacter(
        address player
    )
        external
        view
        returns (
            uint256 characterClass,
            uint256 level,
            uint256 experience,
            uint256 currentEndurance,
            uint256 maxEndurance,
            uint256 totalCombat,
            uint256 totalDefense,
            uint256 totalLuck,
            bool aliveFlag,
            uint256 equippedCombatBonus,
            uint256 equippedEnduranceBonus,
            uint256 equippedDefenseBonus,
            uint256 equippedLuckBonus,
            uint256 totalKills
        )
    {
        (uint256 coreStats, uint256 progressionStats) = (
            packedCharacters[player].coreStats,
            packedCharacters[player].progressionStats
        );
        BitPackedCharacterLib.Character memory c = _decodePackedCharacter(coreStats, progressionStats);
        characterClass =
            (coreStats >> BitPackedCharacterLib.CHARACTER_CLASS_SHIFT) & BitPackedCharacterLib.CHARACTER_CLASS_MASK;
        level = c.level;
        experience = c.experience;
        currentEndurance = c.currentEndurance;
        maxEndurance = c.maxEndurance;
        totalCombat = c.totalCombat;
        totalDefense = c.totalDefense;
        totalLuck = c.totalLuck;
        aliveFlag = c.isAlive;
        equippedCombatBonus = c.equippedCombatBonus;
        equippedEnduranceBonus = c.equippedEnduranceBonus;
        equippedDefenseBonus = c.equippedDefenseBonus;
        equippedLuckBonus = c.equippedLuckBonus;
        totalKills = c.totalKills;
    }

    // Batch getters and heavy UI helpers were removed from the production ABI.
    // Use per-player `getPackedCharacter` and `decodePackedCharacter` (on-chain)
    // or decode off-chain in the SDK.

    /// @notice Check if character is currently in combat
    /// @param player The player address to check
    /// @return Whether the character is in combat
    function isCharacterInCombat(address player) external view override validAddress(player) returns (bool) {
        return
            ((packedCharacters[player].coreStats >> BitPackedCharacterLib.IN_COMBAT_SHIFT) &
                BitPackedCharacterLib.IN_COMBAT_MASK) == 1;
    }

    /// @notice Get current combat state for a player
    /// @param player The player address to get combat state for
    /// @return enemyId The ID of the enemy being fought
    /// @return enemyLevel The level of the enemy being fought
    /// @return enemyCurrentEndurance The enemy's current endurance
    /// @return playerCurrentEndurance The player's current endurance
    /// @return roundsElapsed The number of rounds elapsed
    /// @return playerStartEndurance The player's starting endurance
    /// @return enemyStartEndurance The enemy's starting endurance
    /// @return lastUpdated The timestamp of last update
    /// @return difficultyMultiplier The difficulty multiplier
    function getCombatState(
        address player
    )
        external
        view
        override
        validAddress(player)
        returns (
            uint256 enemyId,
            uint256 enemyLevel,
            uint256 enemyCurrentEndurance,
            uint256 playerCurrentEndurance,
            uint256 roundsElapsed,
            uint256 playerStartEndurance,
            uint256 enemyStartEndurance,
            uint256 lastUpdated,
            uint256 difficultyMultiplier
        )
    {
        CombatState storage cs = combatStates[player];
        return (
            cs.enemyId,
            cs.enemyLevel,
            cs.enemyCurrentEndurance,
            cs.playerCurrentEndurance,
            cs.roundsElapsed,
            cs.playerStartEndurance,
            cs.enemyStartEndurance,
            cs.lastUpdated,
            cs.difficultyMultiplier
        );
    }

    /**
     * @notice Batch query for multiple characters (gas efficient)
     */
    // NOTE: `getCharacterDataBatch` removed. Use per-player `getPackedCharacter` and on-chain unpack helper for deterministic unpacking.

    // ==================== Constant Getters

    /// @notice Get the character creation fee
    /// @return The creation fee in wei
    function getCreationFee() external pure returns (uint256) {
        return CREATION_FEE;
    }

    /// @notice Get the character healing fee
    /// @return The healing fee in wei
    function getHealingFee() external pure returns (uint256) {
        return HEALING_FEE;
    }

    /// @notice Get the character resurrection fee
    /// @return The resurrection fee in wei
    function getResurrectionFee() external pure returns (uint256) {
        return RESURRECTION_FEE;
    }

    /// @notice Get the healing cooldown duration
    /// @return The healing cooldown in seconds
    function getHealingCooldown() external pure returns (uint256) {
        return HEALING_COOLDOWN;
    }

    /// @notice Get the regeneration window duration
    /// @return The regeneration window in seconds
    function getRegenWindow() external pure returns (uint256) {
        return REGEN_WINDOW;
    }

    /**
     * @notice Get time remaining until healing is available
     * @param player The player's address
     * @return timeRemaining Seconds until healing is available (0 if available now)
     */
    function getHealingCooldownRemaining(
        address player
    ) external view characterExists(player) returns (uint256 timeRemaining) {
        uint256 lastHealTime = (packedCharacters[player].progressionStats >>
            BitPackedCharacterLib.LAST_HEAL_TIME_SHIFT) & BitPackedCharacterLib.LAST_HEAL_TIME_MASK;

        if (lastHealTime == 0) return 0; // Never healed, no cooldown

        uint256 nextHealTime = lastHealTime + HEALING_COOLDOWN;
        if (block.timestamp > nextHealTime - 1) return 0; // Cooldown expired

        return nextHealTime - block.timestamp;
    }

    // ==================== Internal Implementation

    /// @notice Check if a player's character is alive
    /// @param player The player address to check
    /// @return Whether the character is alive
    function isAlive(address player) internal view returns (bool) {
        return BitPackedCharacterLib.unpackCharacter(packedCharacters[player]).isAlive;
    }

    /**
     * @notice Calculate pending passive regeneration for a character.
     * @dev Passive regeneration is computed using the `LAST_REGEN_TIME` and the
     *      `REGEN_WINDOW` constant. This function does not mutate state; callers
     *      may use it to display UI progress bars.
     * @param player The player's address
     * @return pendingRegen Amount of endurance to be regenerated (capped at missing endurance)
     */
    function getPendingPassiveRegeneration(
        address player
    ) public view characterExists(player) returns (uint256 pendingRegen) {
        BitPackedCharacterLib.Character memory char = BitPackedCharacterLib.unpackCharacter(packedCharacters[player]);

        // Dead characters don't regenerate
        if (!char.isAlive) return 0;

        // No regeneration if already at full health
        if (char.currentEndurance > char.maxEndurance - 1) return 0;

        // Extract lastRegenTime for passive regeneration tracking
        uint256 lastRegenTime = (packedCharacters[player].progressionStats >>
            BitPackedCharacterLib.LAST_REGEN_TIME_SHIFT) & BitPackedCharacterLib.LAST_REGEN_TIME_MASK;

        // If no last regen time set, fall back to last heal time; otherwise no passive regen
        if (lastRegenTime == 0) {
            uint256 lastHealTime = (packedCharacters[player].progressionStats >>
                BitPackedCharacterLib.LAST_HEAL_TIME_SHIFT) & BitPackedCharacterLib.LAST_HEAL_TIME_MASK;
            if (lastHealTime == 0) return 0;
            lastRegenTime = lastHealTime;
        }

        // Calculate time elapsed since last regeneration update
        uint256 elapsed = block.timestamp - lastRegenTime;

        // Calculate regeneration: full endurance over REGEN_WINDOW
        uint256 missing = char.maxEndurance - char.currentEndurance;
        uint256 regen = (char.maxEndurance * elapsed) / REGEN_WINDOW;

        // Cap regeneration to missing endurance
        return regen > missing ? missing : regen;
    }

    /**
     * @notice Apply passive regeneration to a character
     * @param player The player's address
     * @return regenApplied Amount of endurance regenerated
     */
    function _applyPassiveRegeneration(address player) internal returns (uint256 regenApplied) {
        regenApplied = getPendingPassiveRegeneration(player);

        if (regenApplied == 0) return 0;

        // Update current endurance with bounds validation
        uint256 coreStats = packedCharacters[player].coreStats;
        uint256 currentEndurance = (coreStats >> BitPackedCharacterLib.CURRENT_ENDURANCE_SHIFT) &
            BitPackedCharacterLib.CURRENT_ENDURANCE_MASK;
        uint256 newEndurance = currentEndurance + regenApplied;

        // Use safe setter to prevent currentEndurance > maxEndurance
        coreStats = BitPackedCharacterLib.setCurrentEnduranceSafe(coreStats, newEndurance);
        packedCharacters[player].coreStats = coreStats;

        // Update last regen time (separate from healing cooldown)
        uint256 progressionStats = packedCharacters[player].progressionStats;
        progressionStats = (progressionStats &
            ~(BitPackedCharacterLib.LAST_REGEN_TIME_MASK << BitPackedCharacterLib.LAST_REGEN_TIME_SHIFT));
        progressionStats |=
            (block.timestamp & BitPackedCharacterLib.LAST_REGEN_TIME_MASK) <<
            BitPackedCharacterLib.LAST_REGEN_TIME_SHIFT;
        packedCharacters[player].progressionStats = progressionStats;

        return regenApplied;
    }

    /**
     * @notice Get effective current endurance including pending passive regeneration.
     * @dev This is a read-only convenience used by frontends to show the
     *      player's apparent endurance without modifying contract state.
     * @param player The player's address
     * @return effectiveEndurance Current endurance plus any pending passive regeneration (capped at max endurance)
     */
    function getEffectiveCurrentEndurance(
        address player
    ) external view characterExists(player) returns (uint256 effectiveEndurance) {
        BitPackedCharacterLib.Character memory char = BitPackedCharacterLib.unpackCharacter(packedCharacters[player]);
        uint256 pendingRegen = getPendingPassiveRegeneration(player);

        effectiveEndurance = char.currentEndurance + pendingRegen;

        // Cap at max endurance
        if (effectiveEndurance > char.maxEndurance) {
            effectiveEndurance = char.maxEndurance;
        }

        return effectiveEndurance;
    }

    /// @notice Internal function to fight an enemy with specified level
    /// @param enemyId The ID of the enemy to fight
    /// @param enemyLevel The level of the enemy to fight
    /// @param allowExtraRound Whether to allow extra rounds in combat
    function _fightEnemyInternal(uint256 enemyId, uint256 enemyLevel, bool allowExtraRound) internal {
        // Call parent implementation with level parameter - no need to store currentEnemyLevel
        // as it's now stored in CombatState
        super._fightEnemyInternalWithLevel(enemyId, enemyLevel, allowExtraRound);
    }

    /// @notice Distribute fees to various system pools
    /// @param amount The total amount to distribute
    function distributeFee(uint256 amount) internal virtual {
        // Core system auto-funding: 20% dev, 80% operational split
        uint256 toDev = (amount * 20) / 100;
        uint256 operational = amount - toDev;

        // Auto-allocate operational funds to core systems:
        // 15% of operational → Gas Refunds (immediate funding for current epoch)
        // 10% of operational → Equipment Reward Pool (enhanced drop values)
        // 10% of operational → Next Epoch Reserve (sustainable epoch operations)
        // 5% of operational → Emergency Reserve (system stability)
        // 60% of operational → Prize Pool (remaining for leaderboard/prizes)
        uint256 toGasRefund = (operational * 15) / 100;
        uint256 toEquipmentRewards = (operational * 10) / 100;
        uint256 toNextEpochReserve = (operational * 10) / 100;
        uint256 toEmergencyReserve = (operational * 5) / 100;
        uint256 toPrize = operational - toGasRefund - toEquipmentRewards - toNextEpochReserve - toEmergencyReserve;

        // Allocate funds
        treasuryState.developerFund += toDev;
        treasuryState.prizePool += toPrize;
        treasuryState.gasRefundPool += toGasRefund;
        treasuryState.equipmentRewardPool += toEquipmentRewards;
        treasuryState.nextEpochReserve += toNextEpochReserve;
        treasuryState.emergencyReserve += toEmergencyReserve;

        emit FeeDistributed(toDev, toPrize, toGasRefund, toEquipmentRewards, toNextEpochReserve, toEmergencyReserve);
    }

    /// @notice Emitted when a fee is split between developer fund and operational systems
    /// @param toDev Amount sent to developer fund
    /// @param toPrize Amount sent to prize pool
    /// @param toGasRefund Amount sent to gas refund pool
    /// @param toEquipmentRewards Amount sent to equipment rewards pool
    /// @param toNextEpochReserve Amount sent to next epoch reserve
    /// @param toEmergencyReserve Amount sent to emergency reserve
    event FeeDistributed(
        uint256 indexed toDev,
        uint256 indexed toPrize,
        uint256 indexed toGasRefund,
        uint256 toEquipmentRewards,
        uint256 toNextEpochReserve,
        uint256 toEmergencyReserve
    );

    // Random seed helper intentionally omitted from production; tests may provide deterministic seeds via test-only subclasses.

    // ==================== Admin Functions

    // `setClassBase` removed from production ABI. Use off-chain tooling or
    // a test/admin helper contract for runtime mutation of class bases.

    /// @notice Get base stats for a character class
    /// @param classId The character class ID
    /// @return baseCombat The base combat stat
    /// @return baseEndurance The base endurance stat
    /// @return baseDefense The base defense stat
    /// @return baseLuck The base luck stat
    function getClassBase(
        uint256 classId
    ) public view returns (uint256 baseCombat, uint256 baseEndurance, uint256 baseDefense, uint256 baseLuck) {
        if (gameDataStorage.classBaseIsSet[classId]) {
            baseCombat = gameDataStorage.classBaseStorage[classId][0];
            baseEndurance = gameDataStorage.classBaseStorage[classId][1];
            baseDefense = gameDataStorage.classBaseStorage[classId][2];
            baseLuck = gameDataStorage.classBaseStorage[classId][3];
        } else {
            // Fall back to CombatConfig defaults
            (baseCombat, baseEndurance, baseDefense, baseLuck) = CombatConfig.baseStatsByClass(uint8(classId));
        }
    }

    // `setEnemyBase` is not part of the production ABI. Enemy definitions
    // come from `CombatConfig` or may be provided by admin/test-only helpers.

    /// @notice Internal getter for enemy base stats
    /// @param id The enemy ID
    /// @return baseCombat The base combat stat
    /// @return baseEndurance The base endurance stat
    /// @return baseDefense The base defense stat
    /// @return baseLuck The base luck stat
    /// @return xpReward The XP reward amount
    /// @return dropRate The drop rate
    function _getEnemyBase(
        uint256 id
    )
        internal
        view
        override
        returns (
            uint256 baseCombat,
            uint256 baseEndurance,
            uint256 baseDefense,
            uint256 baseLuck,
            uint256 xpReward,
            uint256 dropRate
        )
    {
        if (gameDataStorage.enemyBaseIsSet[id]) {
            baseCombat = gameDataStorage.enemyBaseStorage[id][0];
            baseEndurance = gameDataStorage.enemyBaseStorage[id][1];
            baseDefense = gameDataStorage.enemyBaseStorage[id][2];
            baseLuck = gameDataStorage.enemyBaseStorage[id][3];
            xpReward = gameDataStorage.enemyBaseStorage[id][4];
            dropRate = gameDataStorage.enemyBaseStorage[id][5];
        } else {
            // Fall back to CombatConfig defaults for enemy definitions
            (baseCombat, baseEndurance, baseDefense, baseLuck, xpReward, dropRate) = CombatConfig.baseStatsByEnemy(
                uint8(id)
            );
        }
    }

    /// @notice Get scaled enemy stats for a given level
    /// @param enemyId The enemy ID
    /// @param enemyLevel The enemy level
    /// @return enemyCombat The scaled combat stat
    /// @return enemyEndurance The scaled endurance stat
    /// @return enemyDefense The scaled defense stat
    /// @return enemyLuck The scaled luck stat
    function getScaledEnemyStats(
        uint256 enemyId,
        uint256 enemyLevel
    ) public view returns (uint256 enemyCombat, uint256 enemyEndurance, uint256 enemyDefense, uint256 enemyLuck) {
        return getScaledEnemyStatsInternal(enemyId, enemyLevel);
    }

    /// @notice Set the leaderboard treasury address
    /// @param _treasury The treasury address to set
    function setLeaderboardTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        leaderboardTreasury = _treasury;
    }

    /// @notice Set the leaderboard manager address
    /// @param _manager The manager address to set
    function setLeaderboardManager(address _manager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        leaderboardManager = _manager;
    }

    /// @notice Withdraw developer and emergency funds to treasury
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        uint256 dev = treasuryState.developerFund;
        uint256 emergency = treasuryState.emergencyReserve;
        uint256 total = dev + emergency;
        if (total == 0) revert GameError(1502);

        treasuryState.developerFund = 0;
        treasuryState.emergencyReserve = 0;

        // Transfer developer and emergency funds to treasury (developer multisig)
        (bool ok, ) = payable(treasuryState.treasury).call{ value: total }("");
        if (!ok) revert GameError(1503);
    }

    // ==================== Required Overrides

    /// @notice Get scaled enemy stats for internal use
    /// @param enemyId The enemy ID
    /// @param enemyLevel The enemy level
    /// @return enemyCombat The scaled combat stat
    /// @return enemyEndurance The scaled endurance stat
    /// @return enemyDefense The scaled defense stat
    /// @return enemyLuck The scaled luck stat
    function getScaledEnemyStatsInternal(
        uint256 enemyId,
        uint256 enemyLevel
    )
        internal
        view
        virtual
        override
        returns (uint256 enemyCombat, uint256 enemyEndurance, uint256 enemyDefense, uint256 enemyLuck)
    {
        (uint256 baseCombat, uint256 baseEndurance, uint256 baseDefense, uint256 baseLuck, , ) = _getEnemyBase(enemyId);

        // Use the provided enemy level (if 0, try to get from current combat state)
        uint256 effectiveEnemyLevel = enemyLevel;
        if (effectiveEnemyLevel == 0) {
            // Try to get from current combat state if in combat
            bool playerInCombat = ((packedCharacters[msg.sender].coreStats >> BitPackedCharacterLib.IN_COMBAT_SHIFT) &
                BitPackedCharacterLib.IN_COMBAT_MASK) == 1;
            if (playerInCombat) {
                CombatState storage cs = combatStates[msg.sender];
                effectiveEnemyLevel = cs.enemyLevel;
            }
        }
        if (effectiveEnemyLevel == 0) effectiveEnemyLevel = 1; // Default to level 1

        // Scale enemy stats based on enemy level
        uint256 enemyScalingBP = _getEnemyLevelScalingBP(effectiveEnemyLevel);
        enemyCombat = (baseCombat * enemyScalingBP) / 10000;
        enemyEndurance = (baseEndurance * enemyScalingBP) / 10000;
        enemyDefense = (baseDefense * enemyScalingBP) / 10000;
        enemyLuck = (baseLuck * enemyScalingBP) / 10000;
    }

    /// @notice Get effective level scaling basis points for a player level
    /// @param playerLevel The player's level
    /// @return The scaling basis points
    function _effectiveLevelScalingBP(uint256 playerLevel) internal pure returns (uint256) {
        // Use centralized CombatConfig level scaling (pure, no storage lookups)
        // Mapping-based overrides removed to reduce deployed bytecode.
        // Keep historic fallback behavior via CombatConfig helper.
        // Note: CombatConfig.levelScalingBP returns bp in percent-like units for migration; adapt to 10000 base
        uint256 bp = CombatConfig.levelScalingBP(playerLevel);
        // CombatConfig returns percent-like (e.g., 100 == 100%), convert to basis points
        return bp * 100;
    }

    /// @notice Get enemy level scaling basis points
    /// @param enemyLevel The enemy's level
    /// @return The scaling basis points
    function _getEnemyLevelScalingBP(uint256 enemyLevel) internal pure returns (uint256) {
        // Enemy scaling: Each level adds 15% to base stats
        // Level 1: 100%, Level 2: 115%, Level 3: 130%, etc.
        // Cap at level 250 for 3850% (very strong end-game enemies)
        if (enemyLevel < 2) return 10000; // 100% at level 1
        if (enemyLevel > 250) enemyLevel = 250; // Cap at level 250

        // 15% per level above 1: 10000 + (level - 1) * 1500
        return 10000 + ((enemyLevel - 1) * 1500);
    }

    /// @notice Check if a player should level up and handle the level up process
    /// @param player The player address to check for level up
    function checkLevelUp(address player) internal virtual override {
        BitPackedCharacterLib.Character memory char = BitPackedCharacterLib.unpackCharacter(packedCharacters[player]);
        uint256 requiredXP = getXPRequiredForLevel(char.level + 1);

        if (char.experience > requiredXP - 1) {
            _performLevelUp(player, char, requiredXP);
        }
    }

    /// @notice Perform the actual level up process for a player
    /// @param player The player address
    /// @param char The character data
    /// @param requiredXP The XP required for the level up
    function _performLevelUp(address player, BitPackedCharacterLib.Character memory char, uint256 requiredXP) internal {
        uint256 coreStats = packedCharacters[player].coreStats;
        uint256 progressionStats = packedCharacters[player].progressionStats;
        uint256 newLevel = char.level + 1;

        // Get character class and stat growth
        uint256 characterClass = (coreStats >> BitPackedCharacterLib.CHARACTER_CLASS_SHIFT) &
            BitPackedCharacterLib.CHARACTER_CLASS_MASK;
        (uint256 combatGrowth, uint256 enduranceGrowth, uint256 defenseGrowth, uint256 luckGrowth) = CombatConfig
            .charPerLevelByClass(uint8(characterClass));

        // Apply level and stat updates
        coreStats = _applyLevelUpStats(
            coreStats,
            newLevel,
            char,
            combatGrowth,
            enduranceGrowth,
            defenseGrowth,
            luckGrowth
        );
        progressionStats = _updateExperienceAfterLevelUp(progressionStats, char.experience, requiredXP);

        // Update storage and emit event
        packedCharacters[player].coreStats = coreStats;
        packedCharacters[player].progressionStats = progressionStats;
        emit LevelUp(player, newLevel);
    }

    /// @notice Apply stat updates during level up
    /// @param coreStats The current core stats
    /// @param newLevel The new character level
    /// @param char The character data
    /// @param combatGrowth Combat stat growth per level
    /// @param enduranceGrowth Endurance stat growth per level
    /// @param defenseGrowth Defense stat growth per level
    /// @param luckGrowth Luck stat growth per level
    /// @return The updated core stats
    function _applyLevelUpStats(
        uint256 coreStats,
        uint256 newLevel,
        BitPackedCharacterLib.Character memory char,
        uint256 combatGrowth,
        uint256 enduranceGrowth,
        uint256 defenseGrowth,
        uint256 luckGrowth
    ) internal pure returns (uint256) {
        // Update level
        coreStats = (coreStats & ~(BitPackedCharacterLib.LEVEL_MASK << BitPackedCharacterLib.LEVEL_SHIFT));
        coreStats |= (newLevel & BitPackedCharacterLib.LEVEL_MASK) << BitPackedCharacterLib.LEVEL_SHIFT;

        // Calculate new stats
        uint256 newCombat = char.totalCombat + combatGrowth;
        uint256 newDefense = char.totalDefense + defenseGrowth;
        uint256 newLuck = char.totalLuck + luckGrowth;
        uint256 newMaxEndurance = char.maxEndurance + enduranceGrowth;

        // Update all stats in core stats
        coreStats = _updateLevelUpStatBits(coreStats, newCombat, newDefense, newLuck, newMaxEndurance);

        // Update current endurance safely
        uint256 newCurrentEndurance = char.currentEndurance;
        if (newCurrentEndurance > newMaxEndurance) newCurrentEndurance = newMaxEndurance;
        coreStats = BitPackedCharacterLib.setCurrentEnduranceSafe(coreStats, newCurrentEndurance);

        return coreStats;
    }

    /// @notice Update stat bits in core stats during level up
    /// @param coreStats The current core stats
    /// @param newCombat The new combat stat
    /// @param newDefense The new defense stat
    /// @param newLuck The new luck stat
    /// @param newMaxEndurance The new max endurance stat
    /// @return The updated core stats
    function _updateLevelUpStatBits(
        uint256 coreStats,
        uint256 newCombat,
        uint256 newDefense,
        uint256 newLuck,
        uint256 newMaxEndurance
    ) internal pure returns (uint256) {
        // Update combat stat
        coreStats = (coreStats &
            ~(BitPackedCharacterLib.COMBAT_SKILL_MASK << BitPackedCharacterLib.COMBAT_SKILL_SHIFT));
        coreStats |= (newCombat & BitPackedCharacterLib.COMBAT_SKILL_MASK) << BitPackedCharacterLib.COMBAT_SKILL_SHIFT;

        // Update defense stat
        coreStats = (coreStats & ~(BitPackedCharacterLib.DEFENSE_MASK << BitPackedCharacterLib.DEFENSE_SHIFT));
        coreStats |= (newDefense & BitPackedCharacterLib.DEFENSE_MASK) << BitPackedCharacterLib.DEFENSE_SHIFT;

        // Update luck stat
        coreStats = (coreStats & ~(BitPackedCharacterLib.LUCK_MASK << BitPackedCharacterLib.LUCK_SHIFT));
        coreStats |= (newLuck & BitPackedCharacterLib.LUCK_MASK) << BitPackedCharacterLib.LUCK_SHIFT;

        // Update max endurance
        coreStats = (coreStats &
            ~(BitPackedCharacterLib.MAX_ENDURANCE_MASK << BitPackedCharacterLib.MAX_ENDURANCE_SHIFT));
        coreStats |=
            (newMaxEndurance & BitPackedCharacterLib.MAX_ENDURANCE_MASK) << BitPackedCharacterLib.MAX_ENDURANCE_SHIFT;

        return coreStats;
    }

    /// @notice Update experience after level up
    /// @param progressionStats The current progression stats
    /// @param currentExperience The current experience
    /// @param requiredXP The XP required for the level up
    /// @return The updated progression stats
    function _updateExperienceAfterLevelUp(
        uint256 progressionStats,
        uint256 currentExperience,
        uint256 requiredXP
    ) internal pure returns (uint256) {
        uint256 excessXP = currentExperience - requiredXP;
        progressionStats = (progressionStats &
            ~(BitPackedCharacterLib.EXPERIENCE_MASK << BitPackedCharacterLib.EXPERIENCE_SHIFT));
        progressionStats |=
            (excessXP & BitPackedCharacterLib.EXPERIENCE_MASK) << BitPackedCharacterLib.EXPERIENCE_SHIFT;
        return progressionStats;
    }

    /**
     * @notice Check level up during combat and return updated core stats and adjusted experience
     * @param player The player address
     * @param newExperience The proposed new experience value
     * @param currentCoreStats The current core stats
     * @return updatedCoreStats The core stats after level updates
     * @return adjustedExperience The experience value after level up processing
     */
    function checkLevelUpAndAdjustXP(
        address player,
        uint256 newExperience,
        uint256 currentCoreStats
    ) internal virtual override returns (uint256 updatedCoreStats, uint256 adjustedExperience) {
        uint256 currentLevel = (currentCoreStats >> BitPackedCharacterLib.LEVEL_SHIFT) &
            BitPackedCharacterLib.LEVEL_MASK;
        uint256 characterClass = (currentCoreStats >> BitPackedCharacterLib.CHARACTER_CLASS_SHIFT) &
            BitPackedCharacterLib.CHARACTER_CLASS_MASK;

        (uint256 newLevel, uint256 remainingExperience, uint256 workingCoreStats) = _processLevelUps(
            currentLevel,
            newExperience,
            currentCoreStats,
            characterClass
        );

        if (newLevel > currentLevel) {
            _updatePlayerStatsAfterLevelUp(player, workingCoreStats, remainingExperience, newLevel);
            return (workingCoreStats, remainingExperience);
        } else {
            _updatePlayerExperience(player, newExperience);
            return (currentCoreStats, newExperience);
        }
    }

    /// @notice Process multiple level ups for a player
    /// @param currentLevel The current character level
    /// @param newExperience The new experience to add
    /// @param currentCoreStats The current core stats
    /// @param characterClass The character class for stat growth
    /// @return newLevel The final level after all level ups
    /// @return remainingExperience The remaining experience after level ups
    /// @return workingCoreStats The updated core stats after level ups
    function _processLevelUps(
        uint256 currentLevel,
        uint256 newExperience,
        uint256 currentCoreStats,
        uint256 characterClass
    ) internal pure returns (uint256 newLevel, uint256 remainingExperience, uint256 workingCoreStats) {
        newLevel = currentLevel;
        remainingExperience = newExperience;
        workingCoreStats = currentCoreStats;

        (uint256 combatGrowth, uint256 enduranceGrowth, uint256 defenseGrowth, uint256 luckGrowth) = CombatConfig
            .charPerLevelByClass(uint8(characterClass));

        while (true) {
            uint256 requiredXP = getXPRequiredForLevel(newLevel + 1);
            if (remainingExperience < requiredXP || newLevel > MAX_REASONABLE_LEVEL - 1) {
                break;
            }

            remainingExperience -= requiredXP;
            ++newLevel;
            workingCoreStats = _applyLevelUpStatGrowth(
                workingCoreStats,
                newLevel,
                combatGrowth,
                enduranceGrowth,
                defenseGrowth,
                luckGrowth
            );
        }
    }

    /// @notice Apply stat growth during level up
    /// @param workingCoreStats The current core stats being updated
    /// @param newLevel The new level being applied
    /// @param combatGrowth Combat stat growth per level
    /// @param enduranceGrowth Endurance stat growth per level
    /// @param defenseGrowth Defense stat growth per level
    /// @param luckGrowth Luck stat growth per level
    /// @return The updated core stats with new stat values
    function _applyLevelUpStatGrowth(
        uint256 workingCoreStats,
        uint256 newLevel,
        uint256 combatGrowth,
        uint256 enduranceGrowth,
        uint256 defenseGrowth,
        uint256 luckGrowth
    ) internal pure returns (uint256) {
        uint256 currentCombat = (workingCoreStats >> BitPackedCharacterLib.COMBAT_SKILL_SHIFT) &
            BitPackedCharacterLib.COMBAT_SKILL_MASK;
        uint256 currentDefense = (workingCoreStats >> BitPackedCharacterLib.DEFENSE_SHIFT) &
            BitPackedCharacterLib.DEFENSE_MASK;
        uint256 currentLuck = (workingCoreStats >> BitPackedCharacterLib.LUCK_SHIFT) & BitPackedCharacterLib.LUCK_MASK;
        uint256 currentMaxEndurance = (workingCoreStats >> BitPackedCharacterLib.MAX_ENDURANCE_SHIFT) &
            BitPackedCharacterLib.MAX_ENDURANCE_MASK;
        uint256 currentEndurance = (workingCoreStats >> BitPackedCharacterLib.CURRENT_ENDURANCE_SHIFT) &
            BitPackedCharacterLib.CURRENT_ENDURANCE_MASK;

        uint256 newCombat = currentCombat + combatGrowth;
        uint256 newDefense = currentDefense + defenseGrowth;
        uint256 newLuck = currentLuck + luckGrowth;
        uint256 newMaxEndurance = currentMaxEndurance + enduranceGrowth;
        uint256 newCurrentEndurance = currentEndurance > newMaxEndurance ? newMaxEndurance : currentEndurance;

        return
            _updateAllCoreStats(
                workingCoreStats,
                newLevel,
                newCombat,
                newDefense,
                newLuck,
                newMaxEndurance,
                newCurrentEndurance
            );
    }

    /// @notice Update all core stats with new values
    /// @param coreStats The current core stats
    /// @param level The new level
    /// @param combat The new combat stat
    /// @param defense The new defense stat
    /// @param luck The new luck stat
    /// @param maxEndurance The new max endurance stat
    /// @param currentEndurance The new current endurance stat
    /// @return The updated core stats
    function _updateAllCoreStats(
        uint256 coreStats,
        uint256 level,
        uint256 combat,
        uint256 defense,
        uint256 luck,
        uint256 maxEndurance,
        uint256 currentEndurance
    ) internal pure returns (uint256) {
        coreStats = (coreStats & ~(BitPackedCharacterLib.LEVEL_MASK << BitPackedCharacterLib.LEVEL_SHIFT));
        coreStats |= (level & BitPackedCharacterLib.LEVEL_MASK) << BitPackedCharacterLib.LEVEL_SHIFT;

        coreStats = (coreStats &
            ~(BitPackedCharacterLib.COMBAT_SKILL_MASK << BitPackedCharacterLib.COMBAT_SKILL_SHIFT));
        coreStats |= (combat & BitPackedCharacterLib.COMBAT_SKILL_MASK) << BitPackedCharacterLib.COMBAT_SKILL_SHIFT;

        coreStats = (coreStats & ~(BitPackedCharacterLib.DEFENSE_MASK << BitPackedCharacterLib.DEFENSE_SHIFT));
        coreStats |= (defense & BitPackedCharacterLib.DEFENSE_MASK) << BitPackedCharacterLib.DEFENSE_SHIFT;

        coreStats = (coreStats & ~(BitPackedCharacterLib.LUCK_MASK << BitPackedCharacterLib.LUCK_SHIFT));
        coreStats |= (luck & BitPackedCharacterLib.LUCK_MASK) << BitPackedCharacterLib.LUCK_SHIFT;

        coreStats = (coreStats &
            ~(BitPackedCharacterLib.MAX_ENDURANCE_MASK << BitPackedCharacterLib.MAX_ENDURANCE_SHIFT));
        coreStats |=
            (maxEndurance & BitPackedCharacterLib.MAX_ENDURANCE_MASK) << BitPackedCharacterLib.MAX_ENDURANCE_SHIFT;

        return BitPackedCharacterLib.setCurrentEnduranceSafe(coreStats, currentEndurance);
    }

    /// @notice Update player stats after level up processing
    /// @param player The player address
    /// @param workingCoreStats The updated core stats
    /// @param remainingExperience The remaining experience after level ups
    /// @param newLevel The new level reached
    function _updatePlayerStatsAfterLevelUp(
        address player,
        uint256 workingCoreStats,
        uint256 remainingExperience,
        uint256 newLevel
    ) internal {
        packedCharacters[player].coreStats = workingCoreStats;
        _updatePlayerExperience(player, remainingExperience);
        emit LevelUp(player, newLevel);
    }

    /// @notice Update player experience in storage
    /// @param player The player address
    /// @param experience The new experience value
    function _updatePlayerExperience(address player, uint256 experience) internal {
        uint256 progressionStats = packedCharacters[player].progressionStats;
        progressionStats = (progressionStats &
            ~(BitPackedCharacterLib.EXPERIENCE_MASK << BitPackedCharacterLib.EXPERIENCE_SHIFT));
        progressionStats |=
            (experience & BitPackedCharacterLib.EXPERIENCE_MASK) << BitPackedCharacterLib.EXPERIENCE_SHIFT;
        packedCharacters[player].progressionStats = progressionStats;
    }

    /// @notice Calculate the XP required to reach a specific level
    /// @param level The target level to calculate XP for
    /// @return The amount of XP required to reach the specified level
    function getXPRequiredForLevel(uint256 level) public pure returns (uint256) {
        if (level < 2) return 0;
        return (100 * (level - 1) * level) / 2; // Triangular progression
    }

    /// @notice Distribute token rewards for equipment drops based on difficulty and quality
    /// @param player The player receiving the reward
    /// @param difficultyMultiplier The combat difficulty multiplier (10000 = 1x)
    /// @param qualityBonus The stat bonus received (1-5)
    function _distributeEquipmentReward(address player, uint256 difficultyMultiplier, uint256 qualityBonus) internal {
        if (treasuryState.equipmentRewardPool == 0) return;

        uint256 poolCFX = treasuryState.equipmentRewardPool / 1 ether;
        uint256 baseReward = _calculateBaseReward(poolCFX);
        uint256 difficultyReward = _calculateDifficultyReward(baseReward, difficultyMultiplier);
        uint256 finalReward = _applyQualityAndCaps(difficultyReward, qualityBonus, poolCFX);

        _transferReward(player, finalReward);
    }

    /// @notice Calculate base reward based on pool size
    /// @param poolCFX The pool size in CFX
    /// @return The base reward amount
    function _calculateBaseReward(uint256 poolCFX) internal pure returns (uint256) {
        // Progressive pool tiers designed for CFX economy
        uint256 poolMultiplier = 100; // Start at 100% (0.001 CFX base)

        if (poolCFX > 9999) {
            poolMultiplier = 2000; // 20x multiplier for massive pools
        } else if (poolCFX > 1999) {
            poolMultiplier = 1500; // 15x multiplier for major adoption
        } else if (poolCFX > 499) {
            poolMultiplier = 1000; // 10x multiplier for thriving ecosystem
        } else if (poolCFX > 99) {
            poolMultiplier = 500; // 5x multiplier for established community
        }

        return (1000000000000000 * poolMultiplier) / 100; // Scale 0.001 CFX base
    }

    /// @notice Calculate difficulty-based reward scaling
    /// @param baseReward The base reward amount
    /// @param difficultyMultiplier The combat difficulty multiplier
    /// @return The difficulty-scaled reward
    function _calculateDifficultyReward(
        uint256 baseReward,
        uint256 difficultyMultiplier
    ) internal pure returns (uint256) {
        // AGGRESSIVE difficulty scaling to discourage low-level grinding
        if (difficultyMultiplier < 5000) {
            // Very easy fights (< 0.5x): Only 10% of base reward
            return (baseReward * 1000) / 10000;
        } else if (difficultyMultiplier < 7500) {
            // Easy fights (0.5x-0.75x): 10-35% of base reward (linear scaling)
            uint256 factor = ((difficultyMultiplier - 5000) * 250) / 2500 + 100;
            return (baseReward * factor) / 1000;
        } else if (difficultyMultiplier < 10000) {
            // Below average (0.75x-1x): 35-100% of base reward
            uint256 factor = ((difficultyMultiplier - 7500) * 650) / 2500 + 350;
            return (baseReward * factor) / 1000;
        } else if (difficultyMultiplier < 15000) {
            // Above average (1x-1.5x): 100-200% of base reward
            return (baseReward * difficultyMultiplier) / 10000;
        } else if (difficultyMultiplier < 20000) {
            // Hard fights (1.5x-2x): 200-300% of base reward (bonus scaling)
            uint256 bonusMultiplier = 15000 + ((difficultyMultiplier - 15000) * 2);
            return (baseReward * bonusMultiplier) / 10000;
        } else {
            // Very hard fights (2x+): 300-400% of base reward (exponential bonus)
            uint256 cappedMultiplier = difficultyMultiplier > 30000 ? 30000 : difficultyMultiplier;
            uint256 exponentialBonus = 20000 + ((cappedMultiplier - 20000) * 2);
            return (baseReward * exponentialBonus) / 10000;
        }
    }

    /// @notice Apply quality multiplier and reward caps
    /// @param difficultyReward The difficulty-scaled reward
    /// @param qualityBonus The equipment quality bonus (1-5)
    /// @param poolCFX The pool size in CFX
    /// @return The final capped reward
    function _applyQualityAndCaps(
        uint256 difficultyReward,
        uint256 qualityBonus,
        uint256 poolCFX
    ) internal view returns (uint256) {
        // Scale by equipment quality (better stats = better rewards)
        uint256 qualityMultiplier = 60 + (qualityBonus * 28); // 88%, 116%, 144%, 172%, 200%
        uint256 finalReward = (difficultyReward * qualityMultiplier) / 100;

        // Progressive maximum reward caps based on pool size
        uint256 maxReward = _getMaxRewardCap(poolCFX);
        if (finalReward > maxReward) finalReward = maxReward;

        // Ensure we don't exceed available pool
        if (finalReward > treasuryState.equipmentRewardPool) {
            finalReward = treasuryState.equipmentRewardPool;
        }

        return finalReward;
    }

    /// @notice Get maximum reward cap based on pool size
    /// @param poolCFX The pool size in CFX
    /// @return The maximum reward cap
    function _getMaxRewardCap(uint256 poolCFX) internal pure returns (uint256) {
        if (poolCFX > 9999) {
            return 200000000000000000; // 0.2 CFX max for massive pools
        } else if (poolCFX > 1999) {
            return 150000000000000000; // 0.15 CFX max for major adoption
        } else if (poolCFX > 499) {
            return 100000000000000000; // 0.1 CFX max for thriving ecosystem
        } else if (poolCFX > 99) {
            return 50000000000000000; // 0.05 CFX max for established community
        } else {
            return 25000000000000000; // 0.025 CFX max for early growth
        }
    }

    /// @notice Transfer reward to player
    /// @param player The player receiving the reward
    /// @param finalReward The final reward amount
    function _transferReward(address player, uint256 finalReward) internal {
        if (finalReward > 0) {
            treasuryState.equipmentRewardPool -= finalReward;
            (bool success, ) = payable(player).call{ value: finalReward }("");
            if (!success) {
                // If transfer fails, add the amount back to the pool
                treasuryState.equipmentRewardPool += finalReward;
            }
        }
    }

    /// @notice Handle equipment drops and auto-equip based on deterministic randomness
    /// @param player The player who may receive equipment
    /// @param enemyId The ID of the defeated enemy
    /// @param enemyLevel The level of the defeated enemy
    /// @param difficultyMultiplier The combat difficulty multiplier (10000 = 1x)
    function _maybeDropAndAutoEquip(
        address player,
        uint256 enemyId,
        uint256 enemyLevel,
        uint256 /*xpGained*/,
        uint256 difficultyMultiplier
    ) internal virtual override {
        (, , , , uint256 xpReward, uint256 dropRate) = _getEnemyBase(enemyId);

        _recordEpochScore(player, enemyId, enemyLevel, xpReward, difficultyMultiplier);
        _processGasRefund(player, enemyLevel);
        _processEquipmentDrop(player, enemyId, dropRate, difficultyMultiplier);
    }

    /// @notice Record epoch score for a player fight
    /// @param player The player address
    /// @param enemyLevel The enemy level
    /// @param xpReward The XP reward from the enemy
    /// @param difficultyMultiplier The combat difficulty multiplier
    function _recordEpochScore(
        address player,
        uint256 /*enemyId*/,
        uint256 enemyLevel,
        uint256 xpReward,
        uint256 difficultyMultiplier
    ) internal {
        uint256 baseWeight = xpReward;
        if (baseWeight == 0) {
            baseWeight = enemyLevel == 0 ? 1 : enemyLevel;
        }

        uint256 adjustedWeight = (baseWeight * difficultyMultiplier) / 10000;
        epochState.scores[epochState.currentEpoch][player] += adjustedWeight;
        emit FightRecorded(epochState.currentEpoch, player, enemyLevel, true, adjustedWeight);
    }

    /// @notice Process gas refund for low-level fights
    /// @param player The player address
    /// @param enemyLevel The enemy level
    function _processGasRefund(address player, uint256 enemyLevel) internal {
        uint256 level = enemyLevel == 0 ? 1 : enemyLevel;
        if (level < gasRefundConfig.lowLevelThreshold + 1) {
            uint256 used = epochState.refundsUsed[epochState.currentEpoch][player];
            if (used < gasRefundConfig.perEpochRefundCapPerAccount && treasuryState.gasRefundPool > 0) {
                uint256 remainingAllowance = gasRefundConfig.perEpochRefundCapPerAccount - used;
                uint256 refundAmount = gasRefundConfig.capPerFight;
                if (refundAmount > remainingAllowance) refundAmount = remainingAllowance;
                if (refundAmount > treasuryState.gasRefundPool) refundAmount = treasuryState.gasRefundPool;

                if (refundAmount > 0) {
                    treasuryState.gasRefundPool -= refundAmount;
                    epochState.refundsUsed[epochState.currentEpoch][player] = used + refundAmount;
                    (bool success, ) = payable(player).call{ value: refundAmount }("");
                    if (success) {
                        emit GasRefundIssued(player, refundAmount);
                    } else {
                        treasuryState.gasRefundPool += refundAmount;
                        epochState.refundsUsed[epochState.currentEpoch][player] = used;
                    }
                }
            }
        }
    }

    /// @notice Process equipment drop based on drop rate and difficulty
    /// @param player The player address
    /// @param enemyId The enemy ID
    /// @param dropRate The base drop rate in basis points
    /// @param difficultyMultiplier The combat difficulty multiplier
    function _processEquipmentDrop(
        address player,
        uint256 enemyId,
        uint256 dropRate,
        uint256 difficultyMultiplier
    ) internal {
        if (dropRate == 0) return;

        uint256 adjustedDropRate = (dropRate * difficultyMultiplier) / 10000;
        if (adjustedDropRate > MAX_DROP_RATE_BP) adjustedDropRate = MAX_DROP_RATE_BP;

        bytes32 bh = blockhash(block.number - 1);
        uint256 seed = uint256(keccak256(abi.encodePacked(player, enemyId, bh, epochState.currentEpoch)));
        uint256 roll = seed % MAX_DROP_RATE_BP;

        if (roll < adjustedDropRate) {
            uint256 slot = (seed >> 8) % 4;
            uint256 bonus = 1 + ((seed >> 16) % 5);
            _applyEquipmentBonus(player, slot, bonus, difficultyMultiplier);
        }
    }

    /// @notice Apply equipment bonus to a specific stat slot
    /// @param player The player address
    /// @param slot The equipment slot (0-3 for combat, endurance, defense, luck)
    /// @param bonus The bonus amount to add
    /// @param difficultyMultiplier The combat difficulty multiplier
    function _applyEquipmentBonus(address player, uint256 slot, uint256 bonus, uint256 difficultyMultiplier) internal {
        uint256 equipmentCoreStats = packedCharacters[player].coreStats;

        uint256[4] memory currentBonuses = [
            (equipmentCoreStats >> BitPackedCharacterLib.EQUIPPED_COMBAT_SHIFT) &
                BitPackedCharacterLib.EQUIPPED_COMBAT_MASK,
            (equipmentCoreStats >> BitPackedCharacterLib.EQUIPPED_ENDURANCE_SHIFT) &
                BitPackedCharacterLib.EQUIPPED_ENDURANCE_MASK,
            (equipmentCoreStats >> BitPackedCharacterLib.EQUIPPED_DEFENSE_SHIFT) &
                BitPackedCharacterLib.EQUIPPED_DEFENSE_MASK,
            (equipmentCoreStats >> BitPackedCharacterLib.EQUIPPED_LUCK_SHIFT) & BitPackedCharacterLib.EQUIPPED_LUCK_MASK
        ];

        uint256[4] memory maxValues = [
            BitPackedCharacterLib.EQUIPPED_COMBAT_MASK,
            BitPackedCharacterLib.EQUIPPED_ENDURANCE_MASK,
            BitPackedCharacterLib.EQUIPPED_DEFENSE_MASK,
            BitPackedCharacterLib.EQUIPPED_LUCK_MASK
        ];

        uint256 newValue = currentBonuses[slot] + bonus;
        if (newValue > maxValues[slot]) newValue = maxValues[slot];
        currentBonuses[slot] = newValue;

        equipmentCoreStats = _clearEquipmentBits(equipmentCoreStats);
        equipmentCoreStats = _setEquipmentBits(equipmentCoreStats, currentBonuses);

        packedCharacters[player].coreStats = equipmentCoreStats;
        emit EquipmentDropped(player, currentBonuses);
        _distributeEquipmentReward(player, difficultyMultiplier, bonus);
    }

    /// @notice Clear all equipment bonus bits from core stats
    /// @param coreStats The current core stats
    /// @return The core stats with equipment bits cleared
    function _clearEquipmentBits(uint256 coreStats) internal pure returns (uint256) {
        coreStats =
            coreStats & ~(BitPackedCharacterLib.EQUIPPED_COMBAT_MASK << BitPackedCharacterLib.EQUIPPED_COMBAT_SHIFT);
        coreStats =
            coreStats &
            ~(BitPackedCharacterLib.EQUIPPED_ENDURANCE_MASK << BitPackedCharacterLib.EQUIPPED_ENDURANCE_SHIFT);
        coreStats =
            coreStats & ~(BitPackedCharacterLib.EQUIPPED_DEFENSE_MASK << BitPackedCharacterLib.EQUIPPED_DEFENSE_SHIFT);
        coreStats =
            coreStats & ~(BitPackedCharacterLib.EQUIPPED_LUCK_MASK << BitPackedCharacterLib.EQUIPPED_LUCK_SHIFT);
        return coreStats;
    }

    /// @notice Set equipment bonus bits in core stats
    /// @param coreStats The current core stats
    /// @param bonuses Array of equipment bonuses [combat, endurance, defense, luck]
    /// @return The core stats with equipment bits set
    function _setEquipmentBits(uint256 coreStats, uint256[4] memory bonuses) internal pure returns (uint256) {
        coreStats |= (bonuses[0] << BitPackedCharacterLib.EQUIPPED_COMBAT_SHIFT);
        coreStats |= (bonuses[1] << BitPackedCharacterLib.EQUIPPED_ENDURANCE_SHIFT);
        coreStats |= (bonuses[2] << BitPackedCharacterLib.EQUIPPED_DEFENSE_SHIFT);
        coreStats |= (bonuses[3] << BitPackedCharacterLib.EQUIPPED_LUCK_SHIFT);
        return coreStats;
    }

    // ==================== Leaderboard and Player Enumeration Functions

    // Track all players who have created characters
    address[] private allPlayers;
    mapping(address => bool) private playerExists;

    /**
     * @notice Get the total number of players who have created characters
     */
    /// @notice Get the total number of players who have created characters
    /// @return The total count of players
    function getTotalPlayerCount() external view returns (uint256) {
        return allPlayers.length;
    }

    /**
     * @notice Get player address by index
     */
    /// @notice Get player address by index
    /// @param index The index of the player to retrieve
    /// @return The address of the player at the specified index
    function getPlayerByIndex(uint256 index) external view returns (address) {
        return allPlayers[index];
    }

    /**
     * @notice Get current epoch number
     */
    /// @notice Get current epoch number
    /// @return The current epoch number
    function getCurrentEpoch() external view returns (uint256) {
        return epochState.currentEpoch;
    }

    /**
     * @notice Get epoch duration in seconds
     */
    /// @notice Get epoch duration in seconds
    /// @return The duration of each epoch in seconds
    function getEpochDuration() external view returns (uint256) {
        return epochState.epochDuration;
    }

    /**
     * @notice Get remaining time in current epoch (in seconds)
     */
    /// @notice Get remaining time in current epoch (in seconds)
    /// @return The remaining time in the current epoch, or 0 if epoch has ended
    function getEpochTimeRemaining() external view returns (uint256) {
        uint256 elapsed = block.timestamp - epochState.epochStartTime;
        if (elapsed > epochState.epochDuration - 1) {
            return 0; // Epoch has ended
        }
        return epochState.epochDuration - elapsed;
    }

    /**
     * @notice Get when current epoch started (block.timestamp)
     */
    /// @notice Get when current epoch started (block.timestamp)
    /// @return The timestamp when the current epoch started
    function getEpochStartTime() external view returns (uint256) {
        return epochState.epochStartTime;
    }

    /**
     * @notice Get player's score for a specific epoch
     */
    /// @notice Get player's score for a specific epoch
    /// @param player The player address to get the score for
    /// @param epoch The epoch number to get the score for
    /// @return The player's score for the specified epoch
    function getEpochScore(address player, uint256 epoch) external view returns (uint256) {
        return epochState.scores[epoch][player];
    }

    /**
     * @dev Add player to tracking when they create a character
     */
    /// @notice Add player to tracking when they create a character
    /// @param player The player address to add to tracking
    function _addPlayerIfNew(address player) internal {
        if (!playerExists[player]) {
            playerExists[player] = true;
            allPlayers.push(player);
        }
    }

    // ==================== Utility Functions

    /**
     * @notice Check if a character can be healed
     * @param player The player address to check
     * @return canHealResult Whether the character can be healed
     * @return reason The reason why healing is not available (empty if can heal)
     */
    function canHeal(address player) external view returns (bool canHealResult, string memory reason) {
        // Check if character exists by checking if coreStats is non-zero
        if (packedCharacters[player].coreStats == 0) {
            return (false, "Character does not exist");
        }

        // Unpack character data
        BitPackedCharacterLib.Character memory char = BitPackedCharacterLib.unpackCharacter(packedCharacters[player]);

        // Check if character is alive
        if (!char.isAlive) {
            return (false, "Character is not alive");
        }

        // Check if character is in combat
        if (combatStates[player].enemyId != 0) {
            return (false, "Character is in combat");
        }

        // Check if character is already at full health
        if (char.currentEndurance >= char.maxEndurance) {
            return (false, "Already at full health");
        }

        // Check healing cooldown - extract lastHealTime from progression stats
        uint256 lastHealTime = (packedCharacters[player].progressionStats >>
            BitPackedCharacterLib.LAST_HEAL_TIME_SHIFT) & BitPackedCharacterLib.LAST_HEAL_TIME_MASK;
        if (block.timestamp < lastHealTime + HEALING_COOLDOWN) {
            return (false, "Healing on cooldown");
        }

        return (true, "");
    }

    /**
     * @notice Check if a character can be resurrected
     * @param player The player address to check
     * @return canResurrectResult Whether the character can be resurrected
     * @return reason The reason why resurrection is not available (empty if can resurrect)
     */
    function canResurrect(address player) external view returns (bool canResurrectResult, string memory reason) {
        // Check if character exists by checking if coreStats is non-zero
        if (packedCharacters[player].coreStats == 0) {
            return (false, "Character does not exist");
        }

        // Unpack character data
        BitPackedCharacterLib.Character memory char = BitPackedCharacterLib.unpackCharacter(packedCharacters[player]);

        // Check if character is dead
        if (char.isAlive) {
            return (false, "Character is already alive");
        }

        return (true, "");
    }

    /**
     * @notice Get all pool data in a single call for efficiency
     * @return prizePool Current prize pool amount
     * @return equipmentPool Current equipment reward pool amount
     * @return gasRefundPool Current gas refund pool amount
     * @return developerPool Current developer fund amount
     * @return nextEpochPool Current next epoch reserve amount
     * @return emergencyPool Current emergency reserve amount
     */
    function getAllPoolData()
        external
        view
        returns (
            uint256 prizePool,
            uint256 equipmentPool,
            uint256 gasRefundPool,
            uint256 developerPool,
            uint256 nextEpochPool,
            uint256 emergencyPool
        )
    {
        return (
            treasuryState.prizePool,
            treasuryState.equipmentRewardPool,
            treasuryState.gasRefundPool,
            treasuryState.developerFund,
            treasuryState.nextEpochReserve,
            treasuryState.emergencyReserve
        );
    }

    // ==================== ITreasuryInfo Implementation
    function getPrizePool() external view returns (uint256) {
        return treasuryState.prizePool;
    }

    function getEquipmentRewardPool() external view returns (uint256) {
        return treasuryState.equipmentRewardPool;
    }

    function getGasRefundPool() external view returns (uint256) {
        return treasuryState.gasRefundPool;
    }

    function getDeveloperFund() external view returns (uint256) {
        return treasuryState.developerFund;
    }

    function getNextEpochReserve() external view returns (uint256) {
        return treasuryState.nextEpochReserve;
    }

    function getEmergencyReserve() external view returns (uint256) {
        return treasuryState.emergencyReserve;
    }

    // ==================== ILeaderboardInfo Implementation
    // Note: getCurrentEpoch, getEpochScore, and getTotalPlayerCount are already implemented above

    // ==================== ICharacterValidation Implementation
    function canFight(address player) external view returns (bool canFightResult, string memory reason) {
        if (packedCharacters[player].coreStats == 0) {
            return (false, "Character does not exist");
        }
        BitPackedCharacterLib.Character memory char = BitPackedCharacterLib.unpackCharacter(packedCharacters[player]);
        if (!char.isAlive) {
            return (false, "Character is not alive");
        }
        if (combatStates[player].enemyId != 0) {
            return (false, "Character is already in combat");
        }
        return (true, "");
    }

    function canContinueFight(address player) external view returns (bool canContinueResult, string memory reason) {
        if (packedCharacters[player].coreStats == 0) {
            return (false, "Character does not exist");
        }
        BitPackedCharacterLib.Character memory char = BitPackedCharacterLib.unpackCharacter(packedCharacters[player]);
        if (!char.isAlive) {
            return (false, "Character is not alive");
        }
        if (combatStates[player].enemyId == 0) {
            return (false, "Character is not in combat");
        }
        return (true, "");
    }

    // ==================== Required Overrides
    // and `getScaledEnemyStatsInternal` for level-based scaling.
}
