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
    
    // Game statistics
    mapping(address => uint256) public totalStardustEarned;
    mapping(address => uint256) public totalCreditsSpent;
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
        
        upgradeConfigs["blackhole"] = UpgradeConfig({
            name: "Black Hole",
            baseCost: 100,
            costMultiplier: 1250, // 25% increase per level
            stardustPerClick: 500,
            stardustPerSecond: 250,
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
                stardustPerSecond: 1, // Base generation
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
        uint256 totalClicks
    ) external nonReentrant {
        require(playerStates[msg.sender].isActive, "Player not registered");
        
        PlayerState storage player = playerStates[msg.sender];
        
        // Calculate idle rewards
        uint256 timeDiff = block.timestamp - player.lastUpdateTime;
        uint256 idleRewards = (player.stardustPerSecond * timeDiff);
        
        // Update state
        player.stardust = stardust + idleRewards;
        player.totalClicks = totalClicks;
        player.lastUpdateTime = block.timestamp;
        
        // Update global stats
        totalStardustEarned[msg.sender] += idleRewards;
        totalStardustGenerated += idleRewards;
        
        // Deposit stardust for P2E rewards
        if (idleRewards > 0) {
            creditsContract.depositStardust(msg.sender, idleRewards);
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
        uint256 idleRewards
    ) {
        state = playerStates[player];
        if (state.isActive) {
            uint256 timeDiff = block.timestamp - state.lastUpdateTime;
            idleRewards = state.stardustPerSecond * timeDiff;
        }
    }
    
    /**
     * @dev Activate prestige (reset progress for bonuses)
     */
    function activatePrestige() external {
        require(playerStates[msg.sender].stardust >= 1000000, "Need 1M stardust for prestige");
        
        PlayerState storage player = playerStates[msg.sender];
        player.prestigeLevel++;
        player.stardust = 0;
        player.stardustPerSecond = 1 + player.prestigeLevel; // Prestige bonus
        
        // Reset upgrades
        string[5] memory upgradeIds = ["telescope", "satellite", "observatory", "starship", "blackhole"];
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
}