// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./StarMinerCredits.sol";

/**
 * @title GameStateManager
 * @dev Manages on-chain game state, upgrades, and progression tracking
 */
contract GameStateManager is Ownable, ReentrancyGuard {
    StarMinerCredits public creditsContract;
    
    struct PlayerState {
        uint256 stardust;
        uint256 stardustPerClick;
        uint256 stardustPerSecond;
        uint256 totalClicks;
        uint256 lastUpdateTime;
        uint256 prestigeLevel;
        bool isActive;
    }
    
    struct UpgradeConfig {
        string name;
        uint256 baseCost;
        uint256 costMultiplier; // Multiplied by 1000 for precision
        uint256 stardustPerClick;
        uint256 stardustPerSecond;
        string costType; // "stardust" or "credits"
        bool isActive;
    }
    
    // State mappings
    mapping(address => PlayerState) public playerStates;
    mapping(address => mapping(string => uint256)) public playerUpgrades;
    mapping(string => UpgradeConfig) public upgradeConfigs;
    mapping(address => mapping(uint256 => string)) public playerAchievements;
    mapping(address => uint256) public playerAchievementCount;
    
    // Game statistics
    mapping(address => uint256) public totalStardustEarned;
    mapping(address => uint256) public totalCreditsSpent;
    mapping(address => uint256) public totalPlayTime;
    mapping(address => uint256) public highestStardustPerSecond;
    mapping(address => uint256) public prestigeCount;
    uint256 public totalPlayers;
    uint256 public totalStardustGenerated;
    
    // Events
    event GameStateSaved(
        address indexed player,
        uint256 stardust,
        uint256 stardustPerSecond,
        uint256 timestamp
    );
    
    event UpgradePurchased(
        address indexed player,
        string upgradeId,
        uint256 level,
        uint256 cost,
        string costType,
        uint256 timestamp
    );
    
    event PlayerRegistered(address indexed player, uint256 timestamp);
    event PrestigeActivated(address indexed player, uint256 level, uint256 timestamp);
    
    constructor(address payable _creditsContract) {
        creditsContract = StarMinerCredits(_creditsContract);
        _initializeUpgrades();
    }
    
    /**
     * @dev Initialize default upgrade configurations
     */
    function _initializeUpgrades() private {
        // Tier 1: Basic Upgrades (Stardust only)
        upgradeConfigs["telescope"] = UpgradeConfig({
            name: "Telescope",
            baseCost: 10,
            costMultiplier: 1150, // 15% increase per level
            stardustPerClick: 1,
            stardustPerSecond: 0,
            costType: "stardust",
            isActive: true
        });
        
        upgradeConfigs["satellite"] = UpgradeConfig({
            name: "Satellite",
            baseCost: 100,
            costMultiplier: 1150,
            stardustPerClick: 5,
            stardustPerSecond: 1,
            costType: "stardust",
            isActive: true
        });
        
        upgradeConfigs["observatory"] = UpgradeConfig({
            name: "Observatory",
            baseCost: 1000,
            costMultiplier: 1150,
            stardustPerClick: 10,
            stardustPerSecond: 5,
            costType: "stardust",
            isActive: true
        });
        
        // Tier 2: Advanced Upgrades (Credits)
        upgradeConfigs["starship"] = UpgradeConfig({
            name: "Starship",
            baseCost: 10,
            costMultiplier: 1200, // 20% increase per level
            stardustPerClick: 50,
            stardustPerSecond: 25,
            costType: "credits",
            isActive: true
        });
        
        upgradeConfigs["spacestation"] = UpgradeConfig({
            name: "Space Station",
            baseCost: 50,
            costMultiplier: 1200,
            stardustPerClick: 100,
            stardustPerSecond: 50,
            costType: "credits",
            isActive: true
        });
        
        upgradeConfigs["wormhole"] = UpgradeConfig({
            name: "Wormhole Generator",
            baseCost: 200,
            costMultiplier: 1250, // 25% increase per level
            stardustPerClick: 500,
            stardustPerSecond: 250,
            costType: "credits",
            isActive: true
        });
        
        upgradeConfigs["blackhole"] = UpgradeConfig({
            name: "Black Hole",
            baseCost: 500,
            costMultiplier: 1250,
            stardustPerClick: 1000,
            stardustPerSecond: 500,
            costType: "credits",
            isActive: true
        });
        
        upgradeConfigs["galacticnetwork"] = UpgradeConfig({
            name: "Galactic Network",
            baseCost: 1000,
            costMultiplier: 1300, // 30% increase per level
            stardustPerClick: 5000,
            stardustPerSecond: 2500,
            costType: "credits",
            isActive: true
        });
        
        upgradeConfigs["universeengine"] = UpgradeConfig({
            name: "Universe Engine",
            baseCost: 2000,
            costMultiplier: 1500, // 50% increase per level
            stardustPerClick: 10000,
            stardustPerSecond: 5000,
            costType: "credits",
            isActive: true
        });
    }
    
    /**
     * @dev Register new player
     */
    function registerPlayer() external {
        if (!playerStates[msg.sender].isActive) {
            playerStates[msg.sender] = PlayerState({
                stardust: 0,
                stardustPerClick: 1, // Base click value
                stardustPerSecond: 0, // Base generation (starts at 0)
                totalClicks: 0,
                lastUpdateTime: block.timestamp,
                prestigeLevel: 0,
                isActive: true
            });
            totalPlayers++;
            emit PlayerRegistered(msg.sender, block.timestamp);
        }
    }
    
    /**
     * @dev Save game state and calculate idle rewards
     */
    function saveGameState(
        uint256 stardust,
        uint256 stardustPerClick,
        uint256 stardustPerSecond,
        uint256 totalClicks,
        string[] memory achievements
    ) external nonReentrant {
        require(playerStates[msg.sender].isActive, "Player not registered");
        
        PlayerState storage player = playerStates[msg.sender];
        
        // Calculate idle rewards
        uint256 timeDiff = block.timestamp - player.lastUpdateTime;
        uint256 idleRewards = (player.stardustPerSecond * timeDiff);
        
        // Update state with all localStorage values
        player.stardust = stardust + idleRewards;
        player.stardustPerClick = stardustPerClick;
        player.stardustPerSecond = stardustPerSecond;
        player.totalClicks = totalClicks;
        player.lastUpdateTime = block.timestamp;
        
        // Update achievements
        _updatePlayerAchievements(msg.sender, achievements);
        
        // Update statistics
        totalStardustEarned[msg.sender] += idleRewards;
        totalStardustGenerated += idleRewards;
        
        // Track highest stardust per second
        if (stardustPerSecond > highestStardustPerSecond[msg.sender]) {
            highestStardustPerSecond[msg.sender] = stardustPerSecond;
        }
        
        // Deposit total stardust for P2E rewards (not just idle rewards)
        if (player.stardust > 0) {
            creditsContract.depositStardust(msg.sender, player.stardust);
        }
        
        emit GameStateSaved(msg.sender, player.stardust, player.stardustPerSecond, block.timestamp);
    }
    
    /**
     * @dev Purchase upgrade
     */
    function purchaseUpgrade(string memory upgradeId) external nonReentrant {
        require(playerStates[msg.sender].isActive, "Player not registered");
        require(upgradeConfigs[upgradeId].isActive, "Upgrade not available");
        
        UpgradeConfig memory config = upgradeConfigs[upgradeId];
        uint256 currentLevel = playerUpgrades[msg.sender][upgradeId];
        
        // Calculate cost
        uint256 cost = _calculateUpgradeCost(config.baseCost, config.costMultiplier, currentLevel);
        
        // Check and deduct payment
        if (keccak256(bytes(config.costType)) == keccak256(bytes("stardust"))) {
            require(playerStates[msg.sender].stardust >= cost, "Insufficient stardust");
            playerStates[msg.sender].stardust -= cost;
        } else {
            require(creditsContract.balanceOf(msg.sender) >= cost, "Insufficient credits");
            creditsContract.burnCredits(msg.sender, cost);
            totalCreditsSpent[msg.sender] += cost;
        }
        
        // Apply upgrade
        playerUpgrades[msg.sender][upgradeId]++;
        playerStates[msg.sender].stardustPerClick += config.stardustPerClick;
        playerStates[msg.sender].stardustPerSecond += config.stardustPerSecond;
        
        emit UpgradePurchased(
            msg.sender,
            upgradeId,
            currentLevel + 1,
            cost,
            config.costType,
            block.timestamp
        );
    }
    
    /**
     * @dev Calculate upgrade cost with exponential scaling
     */
    function _calculateUpgradeCost(
        uint256 baseCost,
        uint256 multiplier,
        uint256 level
    ) private pure returns (uint256) {
        if (level == 0) return baseCost;
        
        uint256 cost = baseCost;
        for (uint256 i = 0; i < level; i++) {
            cost = (cost * multiplier) / 1000;
        }
        return cost;
    }
    
    /**
     * @dev Get upgrade cost for next level
     */
    function getUpgradeCost(string memory upgradeId, address player) external view returns (uint256) {
        UpgradeConfig memory config = upgradeConfigs[upgradeId];
        uint256 currentLevel = playerUpgrades[player][upgradeId];
        return _calculateUpgradeCost(config.baseCost, config.costMultiplier, currentLevel);
    }
    
    /**
     * @dev Get player's complete state
     */
    function getPlayerState(address player) external view returns (
        PlayerState memory state,
        uint256 idleRewards,
        string[] memory achievements
    ) {
        state = playerStates[player];
        if (state.isActive) {
            uint256 timeDiff = block.timestamp - state.lastUpdateTime;
            idleRewards = state.stardustPerSecond * timeDiff;
        }
        
        // Get player achievements
        achievements = _getPlayerAchievements(player);
    }
    
    /**
     * @dev Activate prestige (reset progress for bonuses)
     */
    function activatePrestige() external {
        require(playerStates[msg.sender].stardust >= 1000000, "Need 1M stardust for prestige");
        
        PlayerState storage player = playerStates[msg.sender];
        player.prestigeLevel++;
        player.stardust = 0;
        player.stardustPerClick = 1; // Reset to base
        player.stardustPerSecond = player.prestigeLevel; // Prestige bonus
        player.totalClicks = 0; // Reset clicks
        
        // Update prestige count
        prestigeCount[msg.sender]++;
        
        // Reset upgrades
        string[9] memory upgradeIds = ["telescope", "satellite", "observatory", "starship", "spacestation", "wormhole", "blackhole", "galacticnetwork", "universeengine"];
        for (uint256 i = 0; i < upgradeIds.length; i++) {
            playerUpgrades[msg.sender][upgradeIds[i]] = 0;
        }
        
        emit PrestigeActivated(msg.sender, player.prestigeLevel, block.timestamp);
    }
    
    // Admin functions
    function addUpgrade(
        string memory upgradeId,
        string memory name,
        uint256 baseCost,
        uint256 costMultiplier,
        uint256 stardustPerClick,
        uint256 stardustPerSecond,
        string memory costType
    ) external onlyOwner {
        upgradeConfigs[upgradeId] = UpgradeConfig({
            name: name,
            baseCost: baseCost,
            costMultiplier: costMultiplier,
            stardustPerClick: stardustPerClick,
            stardustPerSecond: stardustPerSecond,
            costType: costType,
            isActive: true
        });
    }
    
    function toggleUpgrade(string memory upgradeId) external onlyOwner {
        upgradeConfigs[upgradeId].isActive = !upgradeConfigs[upgradeId].isActive;
    }
    
    /**
     * @dev Reset player's complete game state (for restart functionality)
     */
    function resetPlayerState() external {
        require(playerStates[msg.sender].isActive, "Player not registered");
        
        PlayerState storage player = playerStates[msg.sender];
        
        // Reset all basic stats
        player.stardust = 0;
        player.stardustPerClick = 1; // Base click value
        player.stardustPerSecond = 0; // Base generation
        player.totalClicks = 0;
        player.prestigeLevel = 0;
        player.lastUpdateTime = block.timestamp;
        
        // Reset all upgrades
        string[9] memory upgradeIds = ["telescope", "satellite", "observatory", "starship", "spacestation", "wormhole", "blackhole", "galacticnetwork", "universeengine"];
        for (uint256 i = 0; i < upgradeIds.length; i++) {
            playerUpgrades[msg.sender][upgradeIds[i]] = 0;
        }
        
        // Reset achievements
        playerAchievementCount[msg.sender] = 0;
        
        // Reset statistics
        totalStardustEarned[msg.sender] = 0;
        totalCreditsSpent[msg.sender] = 0;
        totalPlayTime[msg.sender] = 0;
        highestStardustPerSecond[msg.sender] = 0;
        prestigeCount[msg.sender] = 0;
        
        emit GameStateSaved(msg.sender, 0, 0, block.timestamp);
    }
    
    /**
     * @dev Internal function to update player achievements
     */
    function _updatePlayerAchievements(address player, string[] memory achievements) private {
        // Clear existing achievements
        playerAchievementCount[player] = 0;
        
        // Add new achievements
        for (uint256 i = 0; i < achievements.length; i++) {
            playerAchievements[player][i] = achievements[i];
            playerAchievementCount[player]++;
        }
    }
    
    /**
     * @dev Internal function to get player achievements
     */
    function _getPlayerAchievements(address player) private view returns (string[] memory) {
        uint256 count = playerAchievementCount[player];
        string[] memory achievements = new string[](count);
        
        for (uint256 i = 0; i < count; i++) {
            achievements[i] = playerAchievements[player][i];
        }
        
        return achievements;
    }
    
    /**
     * @dev Get comprehensive player statistics
     */
    function getPlayerStats(address player) external view returns (
        uint256 totalStardustEarnedAmount,
        uint256 totalCreditsSpentAmount,
        uint256 totalClicksAmount,
        uint256 totalPlayTimeAmount,
        uint256 highestStardustPerSecondAmount,
        uint256 prestigeCountAmount,
        uint256 achievementsUnlocked
    ) {
        totalStardustEarnedAmount = totalStardustEarned[player];
        totalCreditsSpentAmount = totalCreditsSpent[player];
        totalClicksAmount = playerStates[player].totalClicks;
        totalPlayTimeAmount = totalPlayTime[player];
        highestStardustPerSecondAmount = highestStardustPerSecond[player];
        prestigeCountAmount = prestigeCount[player];
        achievementsUnlocked = playerAchievementCount[player];
    }
    
    /**
     * @dev Update player play time (called periodically by frontend)
     */
    function updatePlayTime(uint256 sessionTime) external {
        require(playerStates[msg.sender].isActive, "Player not registered");
        totalPlayTime[msg.sender] += sessionTime;
    }
    
    /**
     * @dev Get all upgrade levels for a player
     */
    function getPlayerUpgrades(address player) external view returns (
        string[] memory upgradeIds,
        uint256[] memory levels
    ) {
        string[9] memory allUpgradeIds = ["telescope", "satellite", "observatory", "starship", "spacestation", "wormhole", "blackhole", "galacticnetwork", "universeengine"];
        
        upgradeIds = new string[](9);
        levels = new uint256[](9);
        
        for (uint256 i = 0; i < 9; i++) {
            upgradeIds[i] = allUpgradeIds[i];
            levels[i] = playerUpgrades[player][allUpgradeIds[i]];
        }
    }
    
    /**
     * @dev Batch save complete game state (matches localStorage structure)
     */
    function saveCompleteGameState(
        uint256 stardust,
        uint256 stardustPerClick,
        uint256 stardustPerSecond,
        uint256 totalClicks,
        string[] memory upgradeIds,
        uint256[] memory upgradeLevels,
        uint256 prestigeLevel,
        string[] memory achievements
    ) external nonReentrant {
        require(playerStates[msg.sender].isActive, "Player not registered");
        require(upgradeIds.length == upgradeLevels.length, "Mismatched upgrade arrays");
        
        PlayerState storage player = playerStates[msg.sender];
        
        // Calculate idle rewards
        uint256 timeDiff = block.timestamp - player.lastUpdateTime;
        uint256 idleRewards = (player.stardustPerSecond * timeDiff);
        
        // Update complete state
        player.stardust = stardust + idleRewards;
        player.stardustPerClick = stardustPerClick;
        player.stardustPerSecond = stardustPerSecond;
        player.totalClicks = totalClicks;
        player.prestigeLevel = prestigeLevel;
        player.lastUpdateTime = block.timestamp;
        
        // Update all upgrades
        for (uint256 i = 0; i < upgradeIds.length; i++) {
            playerUpgrades[msg.sender][upgradeIds[i]] = upgradeLevels[i];
        }
        
        // Update achievements
        _updatePlayerAchievements(msg.sender, achievements);
        
        // Update statistics
        totalStardustEarned[msg.sender] += idleRewards;
        totalStardustGenerated += idleRewards;
        
        if (stardustPerSecond > highestStardustPerSecond[msg.sender]) {
            highestStardustPerSecond[msg.sender] = stardustPerSecond;
        }
        
        // Deposit total stardust for P2E rewards (not just idle rewards)
        if (player.stardust > 0) {
            creditsContract.depositStardust(msg.sender, player.stardust);
        }
        
        emit GameStateSaved(msg.sender, player.stardust, player.stardustPerSecond, block.timestamp);
    }
}