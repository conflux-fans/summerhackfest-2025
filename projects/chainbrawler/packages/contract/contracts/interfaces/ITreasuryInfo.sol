// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/**
 * @title ITreasuryInfo
 * @author ChainBrawler Team
 * @notice Interface for treasury information queries
 * @dev Provides efficient access to all pool data and treasury state
 */
interface ITreasuryInfo {
    /**
     * @notice Get all pool data in a single call for efficiency
     * @return prizePool Current prize pool amount
     * @return equipmentPool Current equipment reward pool amount
     * @return gasRefundPool Current gas refund pool amount
     * @return developerPool Current developer fund amount
     * @return nextEpochPool Current next epoch reserve amount
     * @return emergencyPool Current emergency reserve amount
     */
    function getAllPoolData()
        external
        view
        returns (
            uint256 prizePool,
            uint256 equipmentPool,
            uint256 gasRefundPool,
            uint256 developerPool,
            uint256 nextEpochPool,
            uint256 emergencyPool
        );

    /**
     * @notice Get individual pool amounts
     */
    function getPrizePool() external view returns (uint256);
    function getEquipmentRewardPool() external view returns (uint256);
    function getGasRefundPool() external view returns (uint256);
    function getDeveloperFund() external view returns (uint256);
    function getNextEpochReserve() external view returns (uint256);
    function getEmergencyReserve() external view returns (uint256);
}
