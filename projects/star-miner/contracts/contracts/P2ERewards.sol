// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./StarMinerCredits.sol";

/**
 * @title P2ERewards
 * @dev Handles play-to-earn reward distribution and exchange mechanics
 */
contract P2ERewards is Ownable, ReentrancyGuard {
    StarMinerCredits public creditsContract;
    
    // Reward configuration
    uint256 public stardustToCFXRate = 10000; // 10,000 Stardust = 1 CFX
    uint256 public dailyRewardLimit = 1 ether; // 1 CFX per day max
    uint256 public minimumStardust = 10000; // Minimum to exchange
    
    // Reward pool management
    uint256 public rewardPool;
    uint256 public totalRewardsDistributed;
    uint256 public rewardPoolFeePercent = 5; // 5% of Credits purchases go to reward pool
    
    // Player tracking
    mapping(address => uint256) public dailyRewardsClaimed;
    mapping(address => uint256) public lastClaimDate;
    mapping(address => uint256) public totalRewardsClaimed;
    
    // Events
    event RewardPoolFunded(uint256 amount, uint256 timestamp);
    event StardustExchanged(
        address indexed player,
        uint256 stardustAmount,
        uint256 cfxAmount,
        uint256 timestamp
    );
    event RewardRateUpdated(uint256 newRate, uint256 timestamp);
    event DailyLimitUpdated(uint256 newLimit, uint256 timestamp);
    
    constructor(address payable _creditsContract) {
        creditsContract = StarMinerCredits(_creditsContract);
    }
    
    /**
     * @dev Exchange Stardust for CFX rewards
     */
    function exchangeStardustForCFX(uint256 stardustAmount) external nonReentrant {
        require(stardustAmount >= minimumStardust, "Below minimum exchange amount");
        require(creditsContract.stardustBalance(msg.sender) >= stardustAmount, "Insufficient stardust");
        
        // Check daily limit
        if (block.timestamp >= lastClaimDate[msg.sender] + 1 days) {
            dailyRewardsClaimed[msg.sender] = 0;
            lastClaimDate[msg.sender] = block.timestamp;
        }
        
        // Calculate CFX amount
        uint256 cfxAmount = (stardustAmount * 1 ether) / stardustToCFXRate;
        
        require(dailyRewardsClaimed[msg.sender] + cfxAmount <= dailyRewardLimit, "Daily limit exceeded");
        require(rewardPool >= cfxAmount, "Insufficient reward pool");
        
        // Update balances
        creditsContract.depositStardust(msg.sender, 0); // Reset stardust balance
        dailyRewardsClaimed[msg.sender] += cfxAmount;
        totalRewardsClaimed[msg.sender] += cfxAmount;
        rewardPool -= cfxAmount;
        totalRewardsDistributed += cfxAmount;
        
        // Transfer CFX
        (bool success, ) = payable(msg.sender).call{value: cfxAmount}("");
        require(success, "Transfer failed");
        
        emit StardustExchanged(msg.sender, stardustAmount, cfxAmount, block.timestamp);
    }
    
    /**
     * @dev Add funds to reward pool (called by Credits contract)
     */
    function fundRewardPool() external payable {
        rewardPool += msg.value;
        emit RewardPoolFunded(msg.value, block.timestamp);
    }
    
    /**
     * @dev Get exchange rate and limits for player
     */
    function getExchangeInfo(address player) external view returns (
        uint256 rate,
        uint256 dailyLimit,
        uint256 remainingDaily,
        uint256 poolBalance,
        uint256 playerStardust
    ) {
        rate = stardustToCFXRate;
        dailyLimit = dailyRewardLimit;
        poolBalance = rewardPool;
        playerStardust = creditsContract.stardustBalance(player);
        
        if (block.timestamp >= lastClaimDate[player] + 1 days) {
            remainingDaily = dailyLimit;
        } else {
            remainingDaily = dailyLimit - dailyRewardsClaimed[player];
        }
    }
    
    /**
     * @dev Calculate maximum CFX claimable for player
     */
    function getMaxClaimable(address player) external view returns (uint256) {
        uint256 stardustBalance = creditsContract.stardustBalance(player);
        if (stardustBalance < minimumStardust) return 0;
        
        uint256 cfxFromStardust = (stardustBalance * 1 ether) / stardustToCFXRate;
        
        uint256 remainingDaily;
        if (block.timestamp >= lastClaimDate[player] + 1 days) {
            remainingDaily = dailyRewardLimit;
        } else {
            remainingDaily = dailyRewardLimit - dailyRewardsClaimed[player];
        }
        
        uint256 maxClaimable = cfxFromStardust > remainingDaily ? remainingDaily : cfxFromStardust;
        return maxClaimable > rewardPool ? rewardPool : maxClaimable;
    }
    
    /**
     * @dev Get player's reward statistics
     */
    function getPlayerRewardStats(address player) external view returns (
        uint256 totalClaimed,
        uint256 dailyClaimed,
        uint256 lastClaim,
        uint256 availableStardust
    ) {
        totalClaimed = totalRewardsClaimed[player];
        dailyClaimed = dailyRewardsClaimed[player];
        lastClaim = lastClaimDate[player];
        availableStardust = creditsContract.stardustBalance(player);
    }
    
    /**
     * @dev Calculate time until next daily reset
     */
    function getTimeUntilReset(address player) external view returns (uint256) {
        if (block.timestamp >= lastClaimDate[player] + 1 days) {
            return 0; // Can claim now
        }
        return (lastClaimDate[player] + 1 days) - block.timestamp;
    }
    
    // Admin functions
    function setExchangeRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be positive");
        stardustToCFXRate = newRate;
        emit RewardRateUpdated(newRate, block.timestamp);
    }
    
    function setDailyLimit(uint256 newLimit) external onlyOwner {
        dailyRewardLimit = newLimit;
        emit DailyLimitUpdated(newLimit, block.timestamp);
    }
    
    function setMinimumStardust(uint256 newMinimum) external onlyOwner {
        minimumStardust = newMinimum;
    }
    
    function setRewardPoolFeePercent(uint256 newPercent) external onlyOwner {
        require(newPercent <= 20, "Fee cannot exceed 20%");
        rewardPoolFeePercent = newPercent;
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    function getContractStats() external view returns (
        uint256 totalPool,
        uint256 totalDistributed,
        uint256 exchangeRate,
        uint256 dailyLimit,
        uint256 minStardust
    ) {
        totalPool = rewardPool;
        totalDistributed = totalRewardsDistributed;
        exchangeRate = stardustToCFXRate;
        dailyLimit = dailyRewardLimit;
        minStardust = minimumStardust;
    }
    
    // Receive CFX for reward pool
    receive() external payable {
        rewardPool += msg.value;
        emit RewardPoolFunded(msg.value, block.timestamp);
    }

    /**
     * @dev Sync reward pool with contract balance (for existing funds)
     */
    function syncRewardPool() external onlyOwner {
        uint256 contractBalance = address(this).balance;
        uint256 currentPool = rewardPool;
        if (contractBalance > currentPool) {
            uint256 additionalFunds = contractBalance - currentPool;
            rewardPool = contractBalance;
            emit RewardPoolFunded(additionalFunds, block.timestamp);
        }
    }
}