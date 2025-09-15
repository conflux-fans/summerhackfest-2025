// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import { BitPackedCharacterLib } from "./BitPackedCharacterLib.sol";
import { CombatState } from "./CombatStructs.sol";

/**
 * @title ChainBrawlerState
 * @author ChainBrawler Team
 * @notice Centralized storage and shared events for ChainBrawler contracts.
 * @dev This contract only contains storage declarations, structs and events.
 *      It is intended to be the first base contract in the inheritance chain
 *      so storage layout remains stable when splitting logic across files.
 */
contract ChainBrawlerState {
    using BitPackedCharacterLib for BitPackedCharacterLib.BitPackedCharacter;

    // ==================== Core Storage (moved from CombatEngine / ChainBrawlerClean)
    mapping(address => BitPackedCharacterLib.BitPackedCharacter) internal packedCharacters;
    // Enemy base storage now uses enemyBaseStorage / enemyBaseIsSet

    // ==================== Grouped State Variables
    /// @notice Treasury and fund management state
    struct TreasuryState {
        address treasury;
        uint256 developerFund;
        uint256 prizePool;
        uint256 gasRefundPool;
        uint256 equipmentRewardPool;
        uint256 nextEpochReserve;
        uint256 emergencyReserve;
    }

    /// @notice Epoch management state
    struct EpochState {
        uint256 currentEpoch;
        uint256 epochDuration;
        uint256 epochStartTime;
        mapping(uint256 => mapping(address => uint256)) scores;
        mapping(uint256 => mapping(address => uint256)) refundsUsed;
    }

    /// @notice Gas refund configuration
    struct GasRefundConfig {
        uint256 capPerFight;
        uint256 perEpochRefundCapPerAccount;
        uint256 lowLevelThreshold;
    }

    /// @notice Game data storage for classes, enemies, and scaling
    struct GameDataStorage {
        mapping(uint256 => uint256[4]) classBaseStorage;
        mapping(uint256 => bool) classBaseIsSet;
        mapping(uint256 => uint256[6]) enemyBaseStorage;
        mapping(uint256 => bool) enemyBaseIsSet;
        mapping(uint256 => uint256) levelScalingBPOverride;
    }

    // ==================== State Variables
    /// @notice Treasury and fund management state
    TreasuryState public treasuryState;

    /// @notice Epoch management state
    EpochState public epochState;

    /// @notice Gas refund configuration
    GasRefundConfig public gasRefundConfig;

    /// @notice Game data storage
    GameDataStorage internal gameDataStorage;

    /// @notice Combat states for active fights
    mapping(address => CombatState) internal combatStates;

    // ==================== Events
    /// @notice Aggregated fight summary used by off-chain tooling for final or intermediate fight states
    /// @param player The player who fought
    /// @param enemyId The ID of the enemy fought
    /// @param enemyLevel The level of the enemy fought
    /// @param roundsElapsed The number of rounds that occurred
    /// @param playerStartEndurance The player's starting endurance
    /// @param playerEndurance The player's ending endurance
    /// @param enemyStartEndurance The enemy's starting endurance
    /// @param enemyEndurance The enemy's ending endurance
    /// @param victory Whether the player won
    /// @param unresolved Whether the fight was unresolved
    /// @param roundNumbers Array of round numbers
    /// @param playerDamages Array of damage dealt by player each round
    /// @param enemyDamages Array of damage dealt by enemy each round
    /// @param playerCriticals Array of whether player got critical hits each round
    /// @param enemyCriticals Array of whether enemy got critical hits each round
    event FightSummary(
        address indexed player,
        uint256 enemyId,
        uint256 enemyLevel,
        uint256 roundsElapsed,
        uint256 playerStartEndurance,
        uint256 playerEndurance,
        uint256 enemyStartEndurance,
        uint256 enemyEndurance,
        bool victory,
        bool unresolved,
        uint256[] roundNumbers,
        uint256[] playerDamages,
        uint256[] enemyDamages,
        bool[] playerCriticals,
        bool[] enemyCriticals
    );

    /// @notice XP reward event for fight victories
    /// @param player The player who received XP
    /// @param enemyId The ID of the enemy defeated
    /// @param enemyLevel The level of the enemy defeated
    /// @param xpGained The amount of XP gained
    event FightXPReward(address indexed player, uint256 indexed enemyId, uint256 indexed enemyLevel, uint256 xpGained);

    /// @notice Dynamic difficulty multiplier tracking
    /// @param player The player who received the multiplier
    /// @param enemyId The ID of the enemy fought
    /// @param enemyLevel The level of the enemy fought
    /// @param combatIndex The combat index used for difficulty calculation
    /// @param multiplierBP The difficulty multiplier in basis points
    /// @param baseXP The base XP reward before multiplier
    /// @param adjustedXP The XP reward after applying multiplier
    /// @param baseDropRate The base drop rate before multiplier
    /// @param adjustedDropRate The drop rate after applying multiplier
    event DifficultyMultiplierApplied(
        address indexed player,
        uint256 indexed enemyId,
        uint256 indexed enemyLevel,
        int256 combatIndex,
        uint256 multiplierBP,
        uint256 baseXP,
        uint256 adjustedXP,
        uint256 baseDropRate,
        uint256 adjustedDropRate
    );

    /// @notice Treasury address updated
    /// @param previousTreasury The previous treasury address
    /// @param newTreasury The new treasury address
    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    /// @notice Enemies populated with new data
    /// @param ids Array of enemy IDs that were populated
    event EnemiesPopulated(uint256[] ids);
    /// @notice Enemy data updated
    /// @param id The ID of the updated enemy
    event EnemyUpdated(uint256 indexed id);
    /// @notice Class base data updated
    /// @param classId The ID of the updated class
    event ClassBaseUpdated(uint256 indexed classId);

    /// @notice Fight recorded for epoch scoring
    /// @param epoch The epoch when the fight occurred
    /// @param player The player who fought
    /// @param enemyLevel The level of the enemy fought
    /// @param isKill Whether the enemy was killed
    /// @param fightScore The score earned from the fight
    event FightRecorded(
        uint256 indexed epoch,
        address indexed player,
        uint256 indexed enemyLevel,
        bool isKill,
        uint256 fightScore
    );
    /// @notice Gas refund issued to player
    /// @param player The player who received the refund
    /// @param amount The amount of gas refund issued
    event GasRefundIssued(address indexed player, uint256 indexed amount);

    // ==================== Accessor Functions for Backward Compatibility
    /// @notice Get treasury address
    /// @return The treasury address
    function treasury() external view returns (address) {
        return treasuryState.treasury;
    }

    /// @notice Get developer fund balance
    /// @return The developer fund balance
    function developerFund() external view returns (uint256) {
        return treasuryState.developerFund;
    }

    /// @notice Get prize pool balance
    /// @return The prize pool balance
    function prizePool() external view returns (uint256) {
        return treasuryState.prizePool;
    }

    /// @notice Get current epoch
    /// @return The current epoch number
    function currentEpoch() external view returns (uint256) {
        return epochState.currentEpoch;
    }

    /// @notice Get epoch duration
    /// @return The epoch duration in seconds
    function epochDuration() external view returns (uint256) {
        return epochState.epochDuration;
    }

    /// @notice Get epoch start time
    /// @return The epoch start timestamp
    function epochStartTime() external view returns (uint256) {
        return epochState.epochStartTime;
    }

    /// @notice Get epoch scores
    /// @param epoch The epoch number
    /// @param player The player address
    /// @return The player's score for the epoch
    function epochScores(uint256 epoch, address player) external view returns (uint256) {
        return epochState.scores[epoch][player];
    }

    /// @notice Get epoch refunds used
    /// @param epoch The epoch number
    /// @param player The player address
    /// @return The amount of refunds used by the player in the epoch
    function epochRefundsUsed(uint256 epoch, address player) external view returns (uint256) {
        return epochState.refundsUsed[epoch][player];
    }

    /// @notice Get gas refund pool
    /// @return The gas refund pool balance
    function gasRefundPool() external view returns (uint256) {
        return treasuryState.gasRefundPool;
    }

    /// @notice Get equipment reward pool
    /// @return The equipment reward pool balance
    function equipmentRewardPool() external view returns (uint256) {
        return treasuryState.equipmentRewardPool;
    }

    /// @notice Get next epoch reserve
    /// @return The next epoch reserve balance
    function nextEpochReserve() external view returns (uint256) {
        return treasuryState.nextEpochReserve;
    }

    /// @notice Get emergency reserve
    /// @return The emergency reserve balance
    function emergencyReserve() external view returns (uint256) {
        return treasuryState.emergencyReserve;
    }

    /// @notice Get gas refund cap per fight
    /// @return The gas refund cap per fight
    function gasRefundCapPerFight() external view returns (uint256) {
        return gasRefundConfig.capPerFight;
    }

    /// @notice Get per epoch refund cap per account
    /// @return The per epoch refund cap per account
    function perEpochRefundCapPerAccount() external view returns (uint256) {
        return gasRefundConfig.perEpochRefundCapPerAccount;
    }

    /// @notice Get low level threshold
    /// @return The low level threshold
    function lowLevelThreshold() external view returns (uint256) {
        return gasRefundConfig.lowLevelThreshold;
    }

    // Minimal helpers (view accessors) to keep other modules small
    // Legacy `_getPackedEnemy` removed; use `_getEnemyBase` in inheriting contracts.
}
