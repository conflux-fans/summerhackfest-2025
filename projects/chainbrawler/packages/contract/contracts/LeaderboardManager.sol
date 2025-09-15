// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { GameError } from "./Errors.sol";

/**
 * @title ILeaderboardTreasury
 * @author ChainBrawler Team
 * @notice Interface for leaderboard treasury operations
 */
interface ILeaderboardTreasury {
    /// @notice Distribute rewards to winners
    /// @param winners Array of winner addresses
    /// @param amounts Array of reward amounts
    function distribute(address[] calldata winners, uint256[] calldata amounts) external;
    /// @notice Deposit funds to the treasury
    function deposit() external payable;
    /// @notice Publish epoch root for claims
    /// @param epoch The epoch number
    /// @param root The merkle root
    function publishEpochRoot(uint256 epoch, bytes32 root) external;
    /// @notice Deposit funds for a specific epoch
    /// @param epoch The epoch number
    function depositForEpoch(uint256 epoch) external payable;
}

/**
 * @title LeaderboardManager
 * @author ChainBrawler Team
 * @notice Manages leaderboard operations and reward distribution
 */
contract LeaderboardManager is AccessControl, ReentrancyGuard {
    /// @notice Role for publishing leaderboard results
    bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER_ROLE");

    /// @notice Treasury contract for reward distribution
    ILeaderboardTreasury public treasury;

    /// @notice Emitted when leaderboard results are published
    /// @param root The merkle root of the leaderboard
    /// @param epoch The epoch number
    /// @param totalRewards The total rewards distributed
    event Published(bytes32 indexed root, uint256 indexed epoch, uint256 indexed totalRewards);

    /// @notice Initialize the LeaderboardManager
    /// @param treasuryAddr The address of the treasury contract
    // solhint-disable-next-line no-empty-blocks
    constructor(address treasuryAddr) {
        if (treasuryAddr == address(0)) revert GameError(1717);
        treasury = ILeaderboardTreasury(treasuryAddr);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Set the treasury address
    /// @param treasuryAddr The new treasury address
    function setTreasury(address treasuryAddr) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (treasuryAddr == address(0)) revert GameError(1717);
        treasury = ILeaderboardTreasury(treasuryAddr);
    }

    /// @notice Publish a leaderboard root and distribute rewards via the treasury
    /// @dev Caller must be PUBLISHER_ROLE (off-chain authority that verifies results)
    /// @param root The merkle root of the leaderboard
    /// @param epoch The epoch number
    /// @param winners Array of winner addresses
    /// @param amounts Array of reward amounts
    function publishAndDistribute(
        bytes32 root,
        uint256 epoch,
        address[] calldata winners,
        uint256[] calldata amounts
    ) external onlyRole(PUBLISHER_ROLE) nonReentrant {
        // For simplicity we trust the publisher role; real implementations should verify merkle proofs off-chain
        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; ++i) total += amounts[i];
        emit Published(root, epoch, total);
        treasury.distribute(winners, amounts);
    }

    /// @notice Atomically fund the treasury and publish an epoch root. Payable.
    /// @param root The merkle root of the leaderboard
    /// @param epoch The epoch number
    function publishAndFund(bytes32 root, uint256 epoch) external payable onlyRole(PUBLISHER_ROLE) nonReentrant {
        if (msg.value == 0) revert GameError(1702);
        // Forward funds to treasury
        // Deposit funds earmarked for the epoch and then publish the root
        // Use depositForEpoch to ensure epochReserve is credited
        treasury.depositForEpoch{ value: msg.value }(epoch);
        treasury.publishEpochRoot(epoch, root);
        emit Published(root, epoch, msg.value);
    }
}
