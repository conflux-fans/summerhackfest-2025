// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SimpleStorage {
    string private name;
    uint256 private value;

    constructor(string memory _name, uint256 _initialValue) {
        name = _name;
        value = _initialValue;
    }

    function getValue() public view returns (uint256) {
        return value;
    }

    function setValue(uint256 newValue) public {
        value = newValue;
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function setName(string memory newName) public {
        name = newName;
    }

    function increment() public {
        value += 1;
    }

    function decrement() public {
        value -= 1;
    }
}
