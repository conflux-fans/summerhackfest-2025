// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/**
 * @title ICharacterValidation
 * @author ChainBrawler Team
 * @notice Interface for character validation queries
 * @dev Provides gas-free validation for UX state management
 */
interface ICharacterValidation {
    /**
     * @notice Check if a character can be healed
     * @param player The player address to check
     * @return canHealResult Whether the character can be healed
     * @return reason The reason why healing is not available (empty if can heal)
     */
    function canHeal(address player) external view returns (bool canHealResult, string memory reason);

    /**
     * @notice Check if a character can be resurrected
     * @param player The player address to check
     * @return canResurrectResult Whether the character can be resurrected
     * @return reason The reason why resurrection is not available (empty if can resurrect)
     */
    function canResurrect(address player) external view returns (bool canResurrectResult, string memory reason);

    /**
     * @notice Check if a character can fight
     * @param player The player address to check
     * @return canFightResult Whether the character can fight
     * @return reason The reason why fighting is not available (empty if can fight)
     */
    function canFight(address player) external view returns (bool canFightResult, string memory reason);

    /**
     * @notice Check if a character can continue an ongoing fight
     * @param player The player address to check
     * @return canContinueResult Whether the character can continue fighting
     * @return reason The reason why continuing is not available (empty if can continue)
     */
    function canContinueFight(address player) external view returns (bool canContinueResult, string memory reason);
}
