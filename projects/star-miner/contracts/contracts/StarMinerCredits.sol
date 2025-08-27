// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title StarMinerCredits
 * @dev ERC20 token for premium in-game currency with CFX exchange functionality
 */
contract StarMinerCredits is ERC20, Ownable, ReentrancyGuard, Pausable {
    // Constants
    uint256 public constant CREDITS_PER_CFX = 1000; // 1 CFX = 1000 Credits
    uint256 public constant MIN_PURCHASE = 0.01 ether; // Minimum 0.01 CFX
    uint256 public constant MAX_PURCHASE = 100 ether; // Maximum 100 CFX per transaction
    
    // State variables
    mapping(address => uint256) public stardustBalance;
    mapping(address => uint256) public lastRewardClaim;
    mapping(address => uint256) public totalPurchased;
    
    uint256 public totalCFXCollected;
    uint256 public totalCreditsIssued;
    
    // Events
    event CreditsPurchased(
        address indexed user, 
        uint256 cfxAmount, 
        uint256 creditsAmount,
        uint256 timestamp
    );
    
    event StardustDeposited(
        address indexed user, 
        uint256 amount,
        uint256 timestamp
    );
    
    event RewardsClaimed(
        address indexed user, 
        uint256 cfxAmount,
        uint256 timestamp
    );
    
    event EmergencyWithdraw(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );
    
    constructor() ERC20("StarMiner Credits", "SMC") {}
    
    /**
     * @dev Purchase Credits with CFX
     * Rate: 1 CFX = 1000 Credits
     */
    function purchaseCredits() external payable nonReentrant whenNotPaused {
        require(msg.value >= MIN_PURCHASE, "Below minimum purchase");
        require(msg.value <= MAX_PURCHASE, "Above maximum purchase");
        
        uint256 creditsAmount = msg.value * CREDITS_PER_CFX;
        
        _mint(msg.sender, creditsAmount);
        
        totalPurchased[msg.sender] += msg.value;
        totalCFXCollected += msg.value;
        totalCreditsIssued += creditsAmount;
        
        emit CreditsPurchased(msg.sender, msg.value, creditsAmount, block.timestamp);
    }
    
    /**
     * @dev Deposit Stardust for P2E rewards calculation
     * Called by GameStateManager contract
     */
    function depositStardust(address user, uint256 amount) external onlyAuthorized {
        stardustBalance[user] += amount;
        emit StardustDeposited(user, amount, block.timestamp);
    }
    
    /**
     * @dev Claim P2E rewards based on Stardust balance
     * Rate: 10,000 Stardust = 1 CFX (adjustable)
     */
    function claimRewards() external nonReentrant whenNotPaused {
        uint256 claimableAmount = getClaimableRewards(msg.sender);
        require(claimableAmount > 0, "No rewards to claim");
        require(address(this).balance >= claimableAmount, "Insufficient contract balance");
        
        stardustBalance[msg.sender] = 0;
        lastRewardClaim[msg.sender] = block.timestamp;
        
        (bool success, ) = payable(msg.sender).call{value: claimableAmount}("");
        require(success, "Transfer failed");
        
        emit RewardsClaimed(msg.sender, claimableAmount, block.timestamp);
    }
    
    /**
     * @dev Calculate claimable CFX rewards from Stardust
     */
    function getClaimableRewards(address user) public view returns (uint256) {
        uint256 stardust = stardustBalance[user];
        if (stardust < 10000) return 0; // Minimum 10,000 Stardust to claim
        
        // Rate: 10,000 Stardust = 1 CFX
        uint256 cfxAmount = (stardust / 10000) * 1 ether;
        
        // Daily limit: 1 CFX per day
        if (block.timestamp < lastRewardClaim[user] + 1 days) {
            return 0;
        }
        
        // Cap at contract balance
        uint256 contractBalance = address(this).balance;
        return cfxAmount > contractBalance ? contractBalance : cfxAmount;
    }
    
    /**
     * @dev Burn Credits (for upgrade purchases)
     */
    function burnCredits(address user, uint256 amount) external onlyAuthorized {
        _burn(user, amount);
    }
    
    // Admin functions
    mapping(address => bool) public authorizedContracts;
    
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function setAuthorizedContract(address contractAddr, bool authorized) external onlyOwner {
        authorizedContracts[contractAddr] = authorized;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
        emit EmergencyWithdraw(owner(), balance, block.timestamp);
    }
    
    // Receive CFX for rewards pool
    receive() external payable {}
}