// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Storage {
    uint256 private data;

    function get() public view returns (uint256) {
        return data;
    }

    function set(uint256 x) public {
        data = x;
    }
}
