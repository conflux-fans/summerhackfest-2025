// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { BitMaps } from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import { GameError } from "./Errors.sol";

/**
 * @title LeaderboardTreasury
 * @author ChainBrawler Team
 * @notice Treasury contract for managing leaderboard rewards and claims
 */
contract LeaderboardTreasury is AccessControl, ReentrancyGuard {
    /// @notice Role for managing treasury operations
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    using BitMaps for BitMaps.BitMap;

    /// @notice Merkle roots per epoch
    mapping(uint256 => bytes32) public epochRoot;
    /// @notice Publish timestamp per epoch
    mapping(uint256 => uint256) public epochPublishedAt;
    /// @notice Who published the epoch root
    mapping(uint256 => address) public epochPublishedBy;
    /// @notice Per-epoch reserved funds to guarantee claims
    mapping(uint256 => uint256) public epochReserve;
    /// @notice Claimed bitmap per epoch (index -> claimed)
    mapping(uint256 => BitMaps.BitMap) private claimed;

    /// @notice Configurable dispute window before claims allowed (seconds)
    uint256 public disputeWindow = 3 days;

    /// @notice Configurable claim window - claims must be made within this period after publication
    uint256 public claimWindow = 60 days;

    /// @notice Emitted when an epoch root is published
    /// @param epoch The epoch number
    /// @param root The merkle root
    /// @param publishedAt The timestamp when published
    event EpochRootPublished(uint256 indexed epoch, bytes32 root, uint256 indexed publishedAt);
    /// @notice Emitted when an epoch is funded
    /// @param epoch The epoch number
    /// @param from The address that funded the epoch
    /// @param amount The amount funded
    event EpochFunded(uint256 indexed epoch, address indexed from, uint256 indexed amount);
    /// @notice Emitted when epoch reserve is consumed
    /// @param epoch The epoch number
    /// @param to The address that received the funds
    /// @param amount The amount consumed
    event EpochReserveConsumed(uint256 indexed epoch, address indexed to, uint256 indexed amount);
    /// @notice Emitted when a claim is made
    /// @param epoch The epoch number
    /// @param index The claim index
    /// @param account The account that claimed
    /// @param amount The amount claimed
    event Claimed(uint256 indexed epoch, uint256 indexed index, address indexed account, uint256 amount);
    /// @notice Emitted when dispute window is set
    /// @param secondsWindow The dispute window in seconds
    event DisputeWindowSet(uint256 indexed secondsWindow);
    /// @notice Emitted when claim window is set
    /// @param secondsWindow The claim window in seconds
    event ClaimWindowSet(uint256 indexed secondsWindow);
    /// @notice Emitted when unclaimed funds are rolled over
    /// @param fromEpoch The epoch the funds came from
    /// @param amount The amount rolled over
    event UnclaimedFundsRolled(uint256 indexed fromEpoch, uint256 indexed amount);

    /// @notice Emitted when funds are deposited
    /// @param from The address that deposited
    /// @param amount The amount deposited
    event Deposited(address indexed from, uint256 indexed amount);
    /// @notice Emitted when rewards are distributed
    /// @param to The address that received the reward
    /// @param amount The amount distributed
    event RewardDistributed(address indexed to, uint256 indexed amount);
    /// @notice Emitted when emergency withdrawal is made
    /// @param to The address that received the funds
    /// @param amount The amount withdrawn
    event EmergencyWithdrawal(address indexed to, uint256 indexed amount);

    /// @notice Initialize the LeaderboardTreasury
    // solhint-disable-next-line no-empty-blocks
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Receive function for direct CFX deposits
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Deposit funds to the treasury
    function deposit() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Deposit funds earmarked for a specific epoch
    /// @param epoch The epoch number
    function depositForEpoch(uint256 epoch) external payable {
        if (epoch == 0) revert GameError(1701);
        if (msg.value == 0) revert GameError(1702);
        epochReserve[epoch] += msg.value;
        emit EpochFunded(epoch, msg.sender, msg.value);
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Distribute rewards to multiple winners. Callable by authorized manager.
    /// @param winners Array of winner addresses
    /// @param amounts Array of reward amounts
    function distribute(
        address[] calldata winners,
        uint256[] calldata amounts
    ) external onlyRole(MANAGER_ROLE) nonReentrant {
        if (winners.length != amounts.length) revert GameError(1703);
        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; ++i) total += amounts[i];
        if (address(this).balance < total) revert GameError(1704);

        for (uint256 i = 0; i < winners.length; ++i) {
            address payable to = payable(winners[i]);
            uint256 amt = amounts[i];
            (bool ok, ) = to.call{ value: amt }("");
            if (!ok) revert GameError(1718);
            emit RewardDistributed(to, amt);
        }
    }

    /// @notice Publish a merkle root for an epoch. Only callable by MANAGER_ROLE.
    /// The treasury MUST be funded for that epoch before claims are allowed.
    /// @param epoch The epoch number
    /// @param root The merkle root
    function publishEpochRoot(uint256 epoch, bytes32 root) external onlyRole(MANAGER_ROLE) {
        if (epoch == 0) revert GameError(1701);
        if (root == bytes32(0)) revert GameError(1705);
        // Prevent accidental overwrite
        if (epochRoot[epoch] != bytes32(0)) revert GameError(1706);
        // Require some funding reserved for this epoch
        if (epochReserve[epoch] == 0) revert GameError(1707);
        epochRoot[epoch] = root;
        epochPublishedAt[epoch] = block.timestamp;
        epochPublishedBy[epoch] = msg.sender;
        emit EpochRootPublished(epoch, root, block.timestamp);
    }

    /// @notice Claim a payout using a merkle proof. Leaf encoding: keccak256(abi.encodePacked(epoch, index, account, amount))
    /// @param epoch The epoch number
    /// @param index The claim index
    /// @param account The account to claim for
    /// @param amount The amount to claim
    /// @param proof The merkle proof
    function claim(
        uint256 epoch,
        uint256 index,
        address account,
        uint256 amount,
        bytes32[] calldata proof
    ) external nonReentrant {
        bytes32 root = epochRoot[epoch];
        if (root == bytes32(0)) revert GameError(1708);

        uint256 publishedAt = epochPublishedAt[epoch];
        // Enforce dispute window: claims allowed only after publish + disputeWindow
        if (block.timestamp < publishedAt + disputeWindow) revert GameError(1709);

        // Enforce claim deadline: claims must be made within claimWindow after publication
        if (block.timestamp > publishedAt + claimWindow) revert GameError(1710);

        // Verify not already claimed
        if (isClaimed(epoch, index)) revert GameError(1711);

        bytes32 leaf = keccak256(abi.encodePacked(epoch, index, account, amount));
        bool ok = MerkleProof.verify(proof, root, leaf);
        if (!ok) revert GameError(1719);

        // Mark claimed
        _setClaimed(epoch, index);

        // Ensure epoch reserve can cover the claim, then deduct and transfer
        if (epochReserve[epoch] < amount) revert GameError(1712);
        epochReserve[epoch] -= amount;
        emit EpochReserveConsumed(epoch, account, amount);

        (bool sent, ) = payable(account).call{ value: amount }("");
        if (!sent) revert GameError(1718);
        emit Claimed(epoch, index, account, amount);
    }

    /// @notice Check if a claim has been made
    /// @param epoch The epoch number
    /// @param index The claim index
    /// @return Whether the claim has been made
    function isClaimed(uint256 epoch, uint256 index) public view returns (bool) {
        return claimed[epoch].get(index);
    }

    /// @notice Internal function to mark a claim as claimed
    /// @param epoch The epoch number
    /// @param index The claim index
    function _setClaimed(uint256 epoch, uint256 index) internal {
        claimed[epoch].set(index);
    }

    /// @notice Set the dispute window
    /// @param secondsWindow The dispute window in seconds
    function setDisputeWindow(uint256 secondsWindow) external onlyRole(DEFAULT_ADMIN_ROLE) {
        disputeWindow = secondsWindow;
        emit DisputeWindowSet(secondsWindow);
    }

    /// @notice Set the claim window (period after publication during which claims are allowed)
    /// @param secondsWindow The claim window in seconds
    function setClaimWindow(uint256 secondsWindow) external onlyRole(DEFAULT_ADMIN_ROLE) {
        claimWindow = secondsWindow;
        emit ClaimWindowSet(secondsWindow);
    }

    /// @notice Roll unclaimed funds from an expired epoch back to the general treasury
    /// Can only be called after the claim window has expired for the epoch
    /// @param epoch The epoch number
    function rollUnclaimedFunds(uint256 epoch) external onlyRole(MANAGER_ROLE) {
        bytes32 root = epochRoot[epoch];
        if (root == bytes32(0)) revert GameError(1708);

        uint256 publishedAt = epochPublishedAt[epoch];
        if (publishedAt == 0) revert GameError(1713);

        // Require claim window to have expired
        if (block.timestamp < publishedAt + claimWindow + 1) revert GameError(1714);

        uint256 unclaimedAmount = epochReserve[epoch];
        if (unclaimedAmount == 0) revert GameError(1715);

        // Transfer unclaimed funds back to general treasury balance
        epochReserve[epoch] = 0;

        emit UnclaimedFundsRolled(epoch, unclaimedAmount);

        // Funds are now available for future epoch funding or distributions
        // They remain in the contract's balance but are no longer earmarked for the specific epoch
    }

    /// @notice Emergency withdrawal by admin
    /// @param to The address to withdraw to
    /// @param amount The amount to withdraw
    function emergencyWithdraw(address payable to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (to == address(0)) revert GameError(1716);
        (bool ok, ) = to.call{ value: amount }("");
        if (!ok) revert GameError(1720);
        emit EmergencyWithdrawal(to, amount);
    }

    /// @notice Get the contract's balance
    /// @return The contract's balance in wei
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Check if an epoch's claim window has expired
    /// @param epoch The epoch number
    /// @return Whether the claim window has expired
    function isClaimWindowExpired(uint256 epoch) external view returns (bool) {
        uint256 publishedAt = epochPublishedAt[epoch];
        if (publishedAt == 0) return false; // Not published yet
        return block.timestamp > publishedAt + claimWindow;
    }

    /// @notice Get the amount of unclaimed funds for an epoch
    /// @param epoch The epoch number
    /// @return The amount of unclaimed funds
    function getUnclaimedAmount(uint256 epoch) external view returns (uint256) {
        return epochReserve[epoch];
    }

    /// @notice Get claim window deadline for an epoch
    /// @param epoch The epoch number
    /// @return The claim deadline timestamp
    function getClaimDeadline(uint256 epoch) external view returns (uint256) {
        uint256 publishedAt = epochPublishedAt[epoch];
        if (publishedAt == 0) return 0; // Not published yet
        return publishedAt + claimWindow;
    }
}
