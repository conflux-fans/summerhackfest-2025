// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/**
 * @title ILeaderboardInfo
 * @author ChainBrawler Team
 * @notice Interface for leaderboard information queries
 * @dev Provides efficient access to leaderboard and epoch data
 */
interface ILeaderboardInfo {
    /**
     * @notice Get current epoch number
     * @return The current epoch number
     */
    function getCurrentEpoch() external view returns (uint256);

    /**
     * @notice Get player's score for a specific epoch
     * @param player The player address to get the score for
     * @param epoch The epoch number to get the score for
     * @return The player's score for the specified epoch
     */
    function getEpochScore(address player, uint256 epoch) external view returns (uint256);

    /**
     * @notice Get total number of players who have created characters
     * @return The total count of players
     */
    function getTotalPlayerCount() external view returns (uint256);
}
