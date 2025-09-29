// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./FluxSub.sol";

/**
 * @title FluxSubFactory
 * @dev Factory contract for creating FluxSub instances
 * @notice Allows for easy deployment and management of multiple FluxSub contracts
 */
contract FluxSubFactory {
    
    // Events
    event FluxSubCreated(
        address indexed fluxSubAddress,
        address indexed creator,
        uint256 createdAt
    );

    // State variables
    address[] public fluxSubContracts;
    mapping(address => bool) public isFluxSubContract;
    mapping(address => address[]) public userContracts;

    /**
     * @dev Create a new FluxSub contract
     * @return The address of the newly created FluxSub contract
     */
    function createFluxSub() external returns (address) {
        FluxSub newFluxSub = new FluxSub();
        address fluxSubAddress = address(newFluxSub);
        
        fluxSubContracts.push(fluxSubAddress);
        isFluxSubContract[fluxSubAddress] = true;
        userContracts[msg.sender].push(fluxSubAddress);

        emit FluxSubCreated(fluxSubAddress, msg.sender, block.timestamp);
        
        return fluxSubAddress;
    }

    /**
     * @dev Get all created FluxSub contracts
     * @return Array of FluxSub contract addresses
     */
    function getAllFluxSubContracts() external view returns (address[] memory) {
        return fluxSubContracts;
    }

    /**
     * @dev Get FluxSub contracts created by a specific user
     * @param _user The user address
     * @return Array of FluxSub contract addresses created by the user
     */
    function getUserFluxSubContracts(
        address _user
    ) external view returns (address[] memory) {
        return userContracts[_user];
    }

    /**
     * @dev Get the total number of created FluxSub contracts
     * @return The number of contracts
     */
    function getFluxSubContractsCount() external view returns (uint256) {
        return fluxSubContracts.length;
    }

    /**
     * @dev Check if an address is a valid FluxSub contract
     * @param _address The address to check
     * @return True if the address is a FluxSub contract
     */
    function isValidFluxSubContract(address _address) external view returns (bool) {
        return isFluxSubContract[_address];
    }
}
