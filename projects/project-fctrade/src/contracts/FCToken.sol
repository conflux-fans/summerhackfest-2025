// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FCToken
 * @dev A simple ERC20 token with a minting function restricted to the owner.
 */
contract FCToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("FC Token", "FC") {
        _transferOwnership(initialOwner);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
} 