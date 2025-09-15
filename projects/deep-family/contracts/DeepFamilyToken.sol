// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DeepFamily Token (DEEP)
 * @dev Genealogy mining token contract - Standard ERC20 token
 *
 * Core Features:
 * - Standard ERC20 compatible, supports wallets and DEX
 * - Only authorized deep family contract can mint tokens
 * - Progressive halving mining reward mechanism
 * - Designed cap of 100 billion, controlled by halving mechanism
 *
 * Halving cycles: 1 → 10 → 100 → 1k → 10k → 100k → 1M → 10M → 100M → Fixed 100M
 * Initial reward: 113,777 DEEP
 * Final supply: ~100 billion DEEP (slightly less than theoretical convergence due to MIN_REWARD early termination)
 */
contract DeepFamilyToken is ERC20, Ownable {
  // ========== Mining Parameter Constants ==========

  uint256 public constant MAX_SUPPLY = 100_000_000_000e18; // 100 billion cap
  uint256 public constant INITIAL_REWARD = 113_777e18; // Initial reward (integer, no over-issuance)
  uint256 public constant MIN_REWARD = 1e17; // Minimum reward (0.1 tokens)

  // Preset halving cycle lengths (fixed at 100_000_000 after 9th cycle)
  uint256[] public cycleLengths = [
    1,
    10,
    100,
    1_000,
    10_000,
    100_000,
    1_000_000,
    10_000_000,
    100_000_000
  ];
  // Fixed cycle length after 9th cycle
  uint256 public constant FIXED_LENGTH = 100_000_000;

  /// @dev Authorized DeepFamily contract address
  address public deepFamilyContract;

  /// @dev Whether contract has been initialized
  bool private initialized;

  /// @dev Number of successful reward-generating records
  uint256 public totalAdditions;

  /// @dev Most recent reward distributed by mint
  uint256 public recentReward;

  /// @dev Mining reward distribution event
  event MiningReward(address indexed miner, uint256 reward, uint256 totalAdditions);

  // ========== Custom Errors ==========

  error OnlyDeepFamilyContract();
  error ZeroAddress();
  error AlreadyInitialized();
  error NotInitialized();
  error AllowanceBelowZero();

  // ========== Modifiers ==========

  /// @dev Only allows calls from authorized DeepFamily contract
  modifier onlyDeepFamilyContract() {
    if (!initialized) revert NotInitialized();
    if (msg.sender != deepFamilyContract) revert OnlyDeepFamilyContract();
    _;
  }

  // ========== Constructor ==========

  constructor() ERC20("DeepFamily", "DEEP") Ownable(msg.sender) {}

  // ========== Initialization Functions ==========

  /**
   * @dev Initialize DeepFamily contract address (can only be called once)
   * @param _deepFamilyContract DeepFamily contract address
   */
  function initialize(address _deepFamilyContract) external onlyOwner {
    if (initialized) revert AlreadyInitialized();
    if (_deepFamilyContract == address(0)) revert ZeroAddress();

    deepFamilyContract = _deepFamilyContract;
    initialized = true;
  }

  /**
   * @dev Distribute mining rewards (only callable by DeepFamily contract)
   * @param miner Miner address
   * @return reward Actual amount of rewards distributed
   */
  function mint(address miner) external onlyDeepFamilyContract returns (uint256 reward) {
    if (miner == address(0)) revert ZeroAddress();

    // Calculate reward for next record (don't immediately increment counter to avoid 0 reward polluting totalAdditions)
    uint256 nextIndex = totalAdditions + 1;
    reward = getReward(nextIndex); // Returns 0 if < MIN_REWARD

    // Mining ended
    if (reward == 0) {
      recentReward = 0;
      return 0;
    }

    uint256 supply = totalSupply();

    // Pre-check if mining has ended (reached cap or reward below threshold)
    if (supply >= MAX_SUPPLY) {
      recentReward = 0;
      return 0;
    }

    // Prevent exceeding cap (protective truncation)
    if (supply + reward > MAX_SUPPLY) {
      reward = MAX_SUPPLY - supply;
    }

    // Only update counter when actually distributing
    totalAdditions = nextIndex;
    _mint(miner, reward);
    recentReward = reward;

    emit MiningReward(miner, reward, nextIndex);

    return reward;
  }

  /**
   * @dev Query the reward for a specific addition
   * @param recordCount Total number of addition records
   * @return reward Corresponding reward amount
   */
  function getReward(uint256 recordCount) public view returns (uint256) {
    uint256 cycleIndex;
    uint256 countLeft = recordCount;

    // Iterate through preset cycles
    for (uint256 i = 0; i < cycleLengths.length; i++) {
      uint256 len = cycleLengths[i];
      if (countLeft <= len) {
        cycleIndex = i;
        break;
      }
      countLeft -= len;

      // If reached the last preset cycle
      if (i == cycleLengths.length - 1) {
        uint256 extraCycles = (countLeft - 1) / FIXED_LENGTH + 1;
        cycleIndex = i + extraCycles;
        break;
      }
    }

    // Reward = Initial reward / 2^cycleIndex
    uint256 reward = INITIAL_REWARD >> cycleIndex; // Efficient division by 2^i
    if (reward < MIN_REWARD) {
      return 0; // Mining ends when reward falls below threshold
    }
    return reward;
  }

  // ========== ERC20 Allowance Extension Functions ==========

  /**
   * @dev Safely increase allowance amount
   * @param spender Address being authorized
   * @param addedValue Amount of allowance to add
   * @return Whether operation succeeded
   *
   * Note: This function avoids race condition issues of standard approve function
   */
  function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
    address owner = _msgSender();
    _approve(owner, spender, allowance(owner, spender) + addedValue);
    return true;
  }

  /**
   * @dev Safely decrease allowance amount
   * @param spender Address being authorized
   * @param subtractedValue Amount of allowance to subtract
   * @return Whether operation succeeded
   *
   * Note: Transaction will revert if resulting allowance would be below 0
   */
  function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
    address owner = _msgSender();
    uint256 currentAllowance = allowance(owner, spender);
    if (currentAllowance < subtractedValue) revert AllowanceBelowZero();
    unchecked {
      _approve(owner, spender, currentAllowance - subtractedValue);
    }
    return true;
  }
}
