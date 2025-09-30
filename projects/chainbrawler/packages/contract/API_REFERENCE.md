# ChainBrawler Contract API Reference

## Contract Overview

The ChainBrawler contract system consists of several interconnected smart contracts that implement a complete on-chain RPG game. This reference covers all public functions, events, and data structures.

## Main Contracts

### ChainBrawlerClean

The main game contract that orchestrates all game functionality.

#### Character Management

```solidity
// Create a new character
function createCharacter(uint256 classId) external payable;

// Get character data
function getCharacter(address player) external view returns (CharacterData memory);

// Heal character
function healCharacter() external payable;

// Resurrect character
function resurrectCharacter() external payable;

// Check if character can heal
function canHeal(address player) external view returns (bool canHeal, string memory reason);

// Check if character can resurrect
function canResurrect(address player) external view returns (bool canResurrect, string memory reason);
```

#### Combat System

```solidity
// Start fighting an enemy
function fightEnemy(uint256 enemyId, uint256 enemyLevel) external;

// Continue a paused fight
function continueFight() external;

// Attempt to flee from combat
function fleeRound() external;

// Check if character is in combat
function isCharacterInCombat(address player) external view returns (bool);

// Get current combat state
function getCombatState(address player) external view returns (CombatState memory);

// Get scaled enemy stats
function getScaledEnemyStats(uint256 enemyId, uint256 enemyLevel) external view returns (EnemyStats memory);
```

#### Game Information

```solidity
// Get XP required for level
function getXPRequiredForLevel(uint256 level) external view returns (uint256);

// Get creation fee
function getCreationFee() external view returns (uint256);

// Get healing fee
function getHealingFee() external view returns (uint256);

// Get resurrection fee
function getResurrectionFee() external view returns (uint256);
```

#### Leaderboard Integration

```solidity
// Set leaderboard treasury
function setLeaderboardTreasury(address treasury) external;

// Set leaderboard manager
function setLeaderboardManager(address manager) external;

// Get all pool data
function getAllPoolData() external view returns (PoolsData memory);
```

### LeaderboardManager

Manages leaderboard operations and reward distribution.

```solidity
// Publish leaderboard results
function publishLeaderboard(bytes32 root, uint256 epoch, uint256 totalRewards) external;

// Distribute rewards to winners
function distributeRewards(address[] calldata winners, uint256[] calldata amounts) external;

// Get treasury address
function getTreasury() external view returns (address);
```

### LeaderboardTreasury

Handles prize distribution and Merkle-based claims.

```solidity
// Deposit funds to treasury
function deposit() external payable;

// Deposit funds for specific epoch
function depositForEpoch(uint256 epoch) external payable;

// Publish epoch root for claims
function publishEpochRoot(uint256 epoch, bytes32 root) external;

// Claim prize using Merkle proof
function claimPrize(uint256 epoch, uint256 index, uint256 amount, bytes32[] calldata proof) external;

// Check if prize is claimed
function isClaimed(uint256 epoch, uint256 index) external view returns (bool);

// Get Merkle proof for player
function getMerkleProofForPlayer(address player, uint256 epoch) external view returns (MerkleProofData memory);

// Check if claim window is expired
function isClaimWindowExpired(uint256 epoch) external view returns (bool);

// Get unclaimed amount for epoch
function getUnclaimedAmount(uint256 epoch) external view returns (uint256);

// Get claim deadline
function getClaimDeadline(uint256 epoch) external view returns (uint256);
```

## Data Structures

### CharacterData

```solidity
struct CharacterData {
    bool exists;
    bool isAlive;
    uint256 class;
    string className;
    uint256 level;
    uint256 experience;
    EnduranceData endurance;
    StatsData stats;
    EquipmentData[] equipment;
    bool inCombat;
    CombatState combatState;
    uint256 totalKills;
}

struct EnduranceData {
    uint256 current;
    uint256 max;
    uint256 percentage;
}

struct StatsData {
    uint256 combat;
    uint256 defense;
    uint256 luck;
}

struct EquipmentData {
    string name;
    uint256 combat;
    uint256 endurance;
    uint256 defense;
    uint256 luck;
}
```

### CombatState

```solidity
struct CombatState {
    uint256 enemyId;
    uint256 enemyLevel;
    uint256 enemyCurrentEndurance;
    uint256 playerCurrentEndurance;
    uint256 roundsElapsed;
    uint256 playerStartEndurance;
    uint256 enemyStartEndurance;
    uint256 lastUpdated;
    uint256 difficultyMultiplier;
}
```

### CombatResult

```solidity
struct CombatResult {
    bool victory;
    bool unresolved;
    bool lastEnduranceChanged;
    uint256 coreStats;
    uint256 progressionStats;
    uint256 timestamp;
    uint256 difficultyMultiplier;
    uint256 currentEndurance;
    uint256 enemyCurrentEndurance;
    uint256 playerStartEndurance;
    uint256 enemyStartEndurance;
    uint256 roundsElapsed;
    uint256 enemyId;
    uint256 enemyLevel;
    uint256[] roundNumbers;
    uint256[] playerDamages;
    uint256[] enemyDamages;
    bool[] playerCriticals;
    bool[] enemyCriticals;
}
```

### EnemyStats

```solidity
struct EnemyStats {
    uint256 combat;
    uint256 endurance;
    uint256 defense;
    uint256 luck;
    uint256 xpReward;
    uint256 dropRate;
    string name;
    uint256 difficulty;
}
```

### PoolsData

```solidity
struct PoolsData {
    PoolInfo prizePool;
    PoolInfo equipmentPool;
    PoolInfo gasRefundPool;
    PoolInfo developerPool;
    PoolInfo nextEpochPool;
    PoolInfo emergencyPool;
    uint256 totalValue;
    uint256 lastUpdated;
}

struct PoolInfo {
    uint256 value;
    string formatted;
    string description;
    uint256 percentage;
}
```

### LeaderboardData

```solidity
struct LeaderboardData {
    uint256 currentEpoch;
    uint256 playerScore;
    uint256 playerRank;
    uint256 totalPlayers;
    LeaderboardPlayer[] topPlayers;
    uint256 epochTimeRemaining;
    uint256 lastUpdated;
}

struct LeaderboardPlayer {
    address player;
    uint256 score;
    uint256 rank;
    uint256 level;
    uint256 kills;
    bool isCurrentPlayer;
}
```

### MerkleProofData

```solidity
struct MerkleProofData {
    uint256 index;
    uint256 amount;
    bytes32[] proof;
    bool isValid;
}
```

## Events

### Character Events

```solidity
// Character created
event CharacterCreated(address indexed player, uint256 classId, uint256 level);

// Character updated
event CharacterUpdated(address indexed player, uint256 level, uint256 experience);

// Character healed
event CharacterHealed(address indexed player, uint256 newEndurance, uint256 cost);

// Character resurrected
event CharacterResurrected(address indexed player, uint256 newEndurance, uint256 cost);
```

### Combat Events

```solidity
// Fight started
event FightStarted(address indexed player, uint256 enemyId, uint256 enemyLevel);

// Fight completed
event FightCompleted(
    address indexed player,
    uint256 enemyId,
    uint256 enemyLevel,
    bool victory,
    uint256 xpGained,
    uint256 roundsElapsed
);

// Equipment dropped
event EquipmentDropped(
    address indexed player,
    uint256 enemyId,
    uint256 enemyLevel,
    uint256[4] bonuses
);
```

### Leaderboard Events

```solidity
// Leaderboard published
event Published(bytes32 indexed root, uint256 indexed epoch, uint256 indexed totalRewards);

// Epoch root published
event EpochRootPublished(uint256 indexed epoch, bytes32 root, uint256 indexed publishedAt);

// Epoch funded
event EpochFunded(uint256 indexed epoch, address indexed from, uint256 indexed amount);

// Prize claimed
event PrizeClaimed(address indexed claimer, uint256 indexed epoch, uint256 amount);
```

### Pool Events

```solidity
// Pool updated
event PoolUpdated(string poolName, uint256 newValue, uint256 timestamp);

// Fee distributed
event FeeDistributed(string poolName, uint256 amount, uint256 timestamp);
```

## Error Codes

### Game Errors

```solidity
// Character errors
error CharacterAlreadyExists();
error CharacterNotFound();
error CharacterDead();
error CharacterAlive();
error CharacterInCombat();
error CharacterNotInCombat();

// Combat errors
error CombatNotStarted();
error CombatAlreadyStarted();
error CombatCompleted();
error InvalidEnemyId();
error InvalidEnemyLevel();

// Fee errors
error InsufficientFee();
error ExcessiveFee();

// Cooldown errors
error HealingCooldownActive();
error ResurrectionCooldownActive();

// Level errors
error InvalidLevel();
error LevelTooHigh();
error InsufficientXP();

// Equipment errors
error InvalidEquipment();
error EquipmentNotFound();
error EquipmentNotEquipped();
```

### Access Control Errors

```solidity
error Unauthorized();
error InvalidRole();
error RoleAlreadyGranted();
error RoleNotGranted();
```

### Treasury Errors

```solidity
error InsufficientFunds();
error ClaimWindowExpired();
error AlreadyClaimed();
error InvalidProof();
error InvalidEpoch();
```

## Constants

### Game Constants

```solidity
// Fees
uint256 public constant CREATION_FEE = 15 ether;
uint256 public constant HEALING_FEE = 5 ether;
uint256 public constant RESURRECTION_FEE = 10 ether;

// Cooldowns
uint256 public constant HEALING_COOLDOWN = 60 seconds;
uint256 public constant REGEN_WINDOW = 24 hours;

// Limits
uint256 public constant MAX_DROP_RATE_BP = 10000; // 100%
uint256 public constant MAX_REASONABLE_LEVEL = 100;
uint256 public constant MAX_BATCH_SIZE = 100;

// XP Constants
uint256 public constant EARLY_LEVEL_XP_BONUS_NUMERATOR = 150; // 150%
uint256 public constant EARLY_LEVEL_XP_BONUS_DENOMINATOR = 100;
uint256 public constant EARLY_LEVEL_XP_BONUS_MAX_LEVEL = 3;
```

### Character Classes

```solidity
enum CharacterClass {
    WARRIOR,    // 0 - High combat, low luck
    MAGE,       // 1 - High luck, low defense
    ROGUE,      // 2 - Balanced stats
    PALADIN     // 3 - High defense, low combat
}
```

## Usage Examples

### Character Creation

```solidity
// Create a warrior character
await chainBrawler.createCharacter(0, { value: ethers.utils.parseEther("15") });

// Create a mage character
await chainBrawler.createCharacter(1, { value: ethers.utils.parseEther("15") });
```

### Combat System

```solidity
// Start fighting enemy ID 1 at level 5
await chainBrawler.fightEnemy(1, 5);

// Continue a paused fight
await chainBrawler.continueFight();

// Attempt to flee
await chainBrawler.fleeRound();
```

### Character Management

```solidity
// Heal character
await chainBrawler.healCharacter({ value: ethers.utils.parseEther("5") });

// Resurrect character
await chainBrawler.resurrectCharacter({ value: ethers.utils.parseEther("10") });

// Get character data
const character = await chainBrawler.getCharacter(playerAddress);
```

### Leaderboard Operations

```solidity
// Publish leaderboard results
await leaderboardManager.publishLeaderboard(merkleRoot, epoch, totalRewards);

// Claim prize
await leaderboardTreasury.claimPrize(epoch, index, amount, proof);

// Check if claimed
const isClaimed = await leaderboardTreasury.isClaimed(epoch, index);
```

### Pool Management

```solidity
// Get all pool data
const pools = await chainBrawler.getAllPoolData();

// Deposit to treasury
await leaderboardTreasury.deposit({ value: ethers.utils.parseEther("100") });

// Deposit for specific epoch
await leaderboardTreasury.depositForEpoch(epoch, { value: ethers.utils.parseEther("50") });
```

## Gas Estimates

### Character Operations
- `createCharacter()`: ~200,000 gas
- `healCharacter()`: ~100,000 gas
- `resurrectCharacter()`: ~120,000 gas

### Combat Operations
- `fightEnemy()`: ~150,000 gas
- `continueFight()`: ~100,000 gas
- `fleeRound()`: ~80,000 gas

### Leaderboard Operations
- `publishLeaderboard()`: ~50,000 gas
- `claimPrize()`: ~30,000 gas
- `deposit()`: ~25,000 gas

## Security Considerations

### Access Control
- All admin functions are protected by roles
- Emergency pause functionality available
- Role-based permissions for different operations

### Reentrancy Protection
- All external functions use ReentrancyGuard
- State updates before external calls
- Safe external call patterns

### Input Validation
- All inputs are validated before processing
- Bounds checking on all parameters
- Custom error messages for clarity

### Economic Security
- Fee validation and collection
- Overflow/underflow protection
- Safe math operations throughout
