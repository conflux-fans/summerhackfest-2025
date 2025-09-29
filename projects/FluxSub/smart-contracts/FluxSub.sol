// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FluxSub
 * @dev A decentralized subscription management contract for Conflux blockchain
 * @notice Allows merchants to create subscription services and users to subscribe
 */
contract FluxSub is ReentrancyGuard, Pausable, Ownable {
    
    // Events
    event SubscriptionCreated(
        uint256 indexed subscriptionId,
        address indexed merchant,
        string name,
        string description,
        uint256 amount,
        uint256 period,
        uint256 createdAt
    );
    
    event UserSubscribed(
        uint256 indexed subscriptionId,
        address indexed user,
        uint256 amount,
        uint256 nextCharge,
        uint256 subscribedAt
    );
    
    event SubscriptionCharged(
        uint256 indexed subscriptionId,
        address indexed user,
        uint256 amount,
        uint256 nextCharge
    );
    
    event SubscriptionCancelled(
        uint256 indexed subscriptionId,
        address indexed user,
        uint256 cancelledAt
    );
    
    event SubscriptionFunded(
        uint256 indexed subscriptionId,
        address indexed user,
        uint256 amount,
        uint256 newBalance
    );

    // Subscription service structure
    struct SubscriptionService {
        uint256 id;
        address merchant;
        string name;
        string description;
        uint256 amount;        // Amount per period in wei
        uint256 period;        // Period in seconds
        bool active;           // Service is active
        uint256 createdAt;     // When service was created
        uint256 totalSubscribers; // Total number of subscribers
    }

    // User subscription structure
    struct UserSubscription {
        uint256 subscriptionId;
        address user;
        address merchant;
        uint256 amount;
        uint256 period;
        uint256 nextCharge;    // Timestamp of next charge
        uint256 balance;       // Current balance in wei
        bool active;
        bool paused;
        uint256 subscribedAt;  // When user subscribed
        uint256 lastCharged;   // Last charge timestamp
    }

    // State variables
    uint256 public nextSubscriptionId = 1;
    uint256 public nextUserSubscriptionId = 1;
    
    // Mappings
    mapping(uint256 => SubscriptionService) public subscriptionServices;
    mapping(uint256 => UserSubscription) public userSubscriptions;
    mapping(address => uint256[]) public merchantSubscriptions;
    mapping(address => uint256[]) public userSubscriptionsList;
    mapping(uint256 => address[]) public subscriptionMembers; // subscriptionId => list of subscribers
    mapping(uint256 => mapping(address => uint256)) public subscriptionMemberIndex; // subscriptionId => user => index in members array

    // Modifiers
    modifier onlyMerchant(uint256 _subscriptionId) {
        require(
            subscriptionServices[_subscriptionId].merchant == msg.sender,
            "Only the merchant can perform this action"
        );
        _;
    }

    modifier validSubscription(uint256 _subscriptionId) {
        require(
            subscriptionServices[_subscriptionId].id != 0,
            "Subscription service does not exist"
        );
        require(
            subscriptionServices[_subscriptionId].active,
            "Subscription service is not active"
        );
        _;
    }

    modifier validUserSubscription(uint256 _userSubscriptionId) {
        require(
            userSubscriptions[_userSubscriptionId].user == msg.sender,
            "Not your subscription"
        );
        _;
    }

    /**
     * @dev Create a new subscription service
     * @param _name Name of the subscription service
     * @param _description Description of the service
     * @param _amount Amount per period in wei
     * @param _period Period in seconds (86400 = daily, 604800 = weekly, 2592000 = monthly, etc.)
     */
    function createSubscriptionService(
        string memory _name,
        string memory _description,
        uint256 _amount,
        uint256 _period
    ) external whenNotPaused returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_period > 0, "Period must be greater than 0");
        require(bytes(_name).length > 0, "Name cannot be empty");

        uint256 subscriptionId = nextSubscriptionId++;
        
        subscriptionServices[subscriptionId] = SubscriptionService({
            id: subscriptionId,
            merchant: msg.sender,
            name: _name,
            description: _description,
            amount: _amount,
            period: _period,
            active: true,
            createdAt: block.timestamp,
            totalSubscribers: 0
        });

        merchantSubscriptions[msg.sender].push(subscriptionId);

        emit SubscriptionCreated(
            subscriptionId,
            msg.sender,
            _name,
            _description,
            _amount,
            _period,
            block.timestamp
        );

        return subscriptionId;
    }

    /**
     * @dev Subscribe to a subscription service
     * @param _subscriptionId The ID of the subscription service
     * @param _initialFunding Initial funding amount in wei
     */
    function subscribe(
        uint256 _subscriptionId,
        uint256 _initialFunding
    ) external payable validSubscription(_subscriptionId) nonReentrant {
        require(msg.value >= _initialFunding, "Insufficient payment");
        require(_initialFunding > 0, "Initial funding must be greater than 0");

        SubscriptionService storage service = subscriptionServices[_subscriptionId];
        
        // Check if user is already subscribed
        for (uint256 i = 0; i < userSubscriptionsList[msg.sender].length; i++) {
            uint256 userSubId = userSubscriptionsList[msg.sender][i];
            if (userSubscriptions[userSubId].subscriptionId == _subscriptionId) {
                revert("Already subscribed to this service");
            }
        }

        uint256 userSubscriptionId = nextUserSubscriptionId++;
        uint256 nextChargeTime = block.timestamp + service.period;

        userSubscriptions[userSubscriptionId] = UserSubscription({
            subscriptionId: _subscriptionId,
            user: msg.sender,
            merchant: service.merchant,
            amount: service.amount,
            period: service.period,
            nextCharge: nextChargeTime,
            balance: _initialFunding,
            active: true,
            paused: false,
            subscribedAt: block.timestamp,
            lastCharged: 0
        });

        userSubscriptionsList[msg.sender].push(userSubscriptionId);
        subscriptionMembers[_subscriptionId].push(msg.sender);
        subscriptionMemberIndex[_subscriptionId][msg.sender] = subscriptionMembers[_subscriptionId].length - 1;
        
        service.totalSubscribers++;

        // Transfer payment to merchant
        payable(service.merchant).transfer(msg.value);

        emit UserSubscribed(
            _subscriptionId,
            msg.sender,
            _initialFunding,
            nextChargeTime,
            block.timestamp
        );
    }

    /**
     * @dev Fund a user's subscription
     * @param _userSubscriptionId The user's subscription ID
     */
    function fundSubscription(
        uint256 _userSubscriptionId
    ) external payable validUserSubscription(_userSubscriptionId) nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");

        UserSubscription storage userSub = userSubscriptions[_userSubscriptionId];
        require(userSub.active, "Subscription is not active");

        userSub.balance += msg.value;

        emit SubscriptionFunded(
            userSub.subscriptionId,
            msg.sender,
            msg.value,
            userSub.balance
        );
    }

    /**
     * @dev Charge a user's subscription (called by merchant)
     * @param _userSubscriptionId The user's subscription ID
     */
    function chargeSubscription(
        uint256 _userSubscriptionId
    ) external nonReentrant {
        UserSubscription storage userSub = userSubscriptions[_userSubscriptionId];
        
        require(
            subscriptionServices[userSub.subscriptionId].merchant == msg.sender,
            "Only the merchant can charge this subscription"
        );
        require(userSub.active, "Subscription is not active");
        require(!userSub.paused, "Subscription is paused");
        require(
            block.timestamp >= userSub.nextCharge,
            "Next charge time not reached"
        );
        require(userSub.balance >= userSub.amount, "Insufficient balance");

        userSub.balance -= userSub.amount;
        userSub.nextCharge += userSub.period;
        userSub.lastCharged = block.timestamp;

        // Transfer payment to merchant
        payable(msg.sender).transfer(userSub.amount);

        emit SubscriptionCharged(
            userSub.subscriptionId,
            userSub.user,
            userSub.amount,
            userSub.nextCharge
        );
    }

    /**
     * @dev Cancel a user's subscription
     * @param _userSubscriptionId The user's subscription ID
     */
    function cancelSubscription(
        uint256 _userSubscriptionId
    ) external validUserSubscription(_userSubscriptionId) {
        UserSubscription storage userSub = userSubscriptions[_userSubscriptionId];
        require(userSub.active, "Subscription is already cancelled");

        userSub.active = false;

        // Remove from subscription members list
        uint256 index = subscriptionMemberIndex[userSub.subscriptionId][msg.sender];
        uint256 lastIndex = subscriptionMembers[userSub.subscriptionId].length - 1;
        
        if (index != lastIndex) {
            address lastMember = subscriptionMembers[userSub.subscriptionId][lastIndex];
            subscriptionMembers[userSub.subscriptionId][index] = lastMember;
            subscriptionMemberIndex[userSub.subscriptionId][lastMember] = index;
        }
        
        subscriptionMembers[userSub.subscriptionId].pop();
        delete subscriptionMemberIndex[userSub.subscriptionId][msg.sender];

        // Refund remaining balance
        if (userSub.balance > 0) {
            uint256 refundAmount = userSub.balance;
            userSub.balance = 0;
            payable(msg.sender).transfer(refundAmount);
        }

        emit SubscriptionCancelled(
            userSub.subscriptionId,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Pause/unpause a subscription service
     * @param _subscriptionId The subscription service ID
     * @param _active New active status
     */
    function setSubscriptionServiceActive(
        uint256 _subscriptionId,
        bool _active
    ) external onlyMerchant(_subscriptionId) {
        subscriptionServices[_subscriptionId].active = _active;
    }

    /**
     * @dev Get subscription service details
     * @param _subscriptionId The subscription service ID
     */
    function getSubscriptionService(
        uint256 _subscriptionId
    ) external view returns (SubscriptionService memory) {
        return subscriptionServices[_subscriptionId];
    }

    /**
     * @dev Get user subscription details
     * @param _userSubscriptionId The user subscription ID
     */
    function getUserSubscription(
        uint256 _userSubscriptionId
    ) external view returns (UserSubscription memory) {
        return userSubscriptions[_userSubscriptionId];
    }

    /**
     * @dev Get all subscription services created by a merchant
     * @param _merchant The merchant address
     */
    function getMerchantSubscriptions(
        address _merchant
    ) external view returns (uint256[] memory) {
        return merchantSubscriptions[_merchant];
    }

    /**
     * @dev Get all user subscriptions for a user
     * @param _user The user address
     */
    function getUserSubscriptions(
        address _user
    ) external view returns (uint256[] memory) {
        return userSubscriptionsList[_user];
    }

    /**
     * @dev Get all members of a subscription service (sorted by subscription date)
     * @param _subscriptionId The subscription service ID
     */
    function getSubscriptionMembers(
        uint256 _subscriptionId
    ) external view returns (address[] memory) {
        return subscriptionMembers[_subscriptionId];
    }

    /**
     * @dev Get subscription members with their subscription details (sorted by date)
     * @param _subscriptionId The subscription service ID
     */
    function getSubscriptionMembersWithDetails(
        uint256 _subscriptionId
    ) external view returns (
        address[] memory members,
        uint256[] memory subscribedAt,
        uint256[] memory balances,
        bool[] memory active
    ) {
        address[] memory memberList = subscriptionMembers[_subscriptionId];
        uint256 length = memberList.length;
        
        members = new address[](length);
        subscribedAt = new uint256[](length);
        balances = new uint256[](length);
        active = new bool[](length);

        for (uint256 i = 0; i < length; i++) {
            address member = memberList[i];
            members[i] = member;
            
            // Find user subscription for this member
            for (uint256 j = 0; j < userSubscriptionsList[member].length; j++) {
                uint256 userSubId = userSubscriptionsList[member][j];
                if (userSubscriptions[userSubId].subscriptionId == _subscriptionId) {
                    UserSubscription memory userSub = userSubscriptions[userSubId];
                    subscribedAt[i] = userSub.subscribedAt;
                    balances[i] = userSub.balance;
                    active[i] = userSub.active;
                    break;
                }
            }
        }
    }

    /**
     * @dev Emergency pause function (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause function (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
