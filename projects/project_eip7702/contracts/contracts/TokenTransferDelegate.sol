// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract TokenTransferDelegate {
    event BatchExecuted(uint256 indexed nonce, Call[] calls);
    event CallExecuted(address indexed executor, address to, uint256 value, bytes data);

    uint256 public nonce;

    struct Call {
        address to;
        uint256 value;
        bytes data;
    }

    function execute(Call[] calldata calls, bytes calldata signature) external payable {
        bytes memory encodedCalls;
        for (uint256 i = 0; i < calls.length; i++) {
            encodedCalls = abi.encodePacked(encodedCalls, calls[i].to, calls[i].value, calls[i].data);
        }
        bytes32 digest = keccak256(abi.encodePacked(nonce, encodedCalls));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(digest);
        address recovered = ECDSA.recover(ethSignedMessageHash, signature);
        require(recovered == address(this), "Invalid signature");
        _executeBatch(calls);
    }

    function execute(Call[] calldata calls) external payable {
        require(msg.sender == address(this), "Invalid authority");
        _executeBatch(calls);
    }

    function _executeBatch(Call[] calldata calls) internal {
        uint256 currentNonce = nonce;
        nonce++; // Increment nonce to protect against replay attacks
        for (uint256 i = 0; i < calls.length; i++) {
            _executeCall(calls[i]);
        }
        emit BatchExecuted(currentNonce, calls);
    }

    function _executeCall(Call calldata callItem) internal {
        (bool success, ) = callItem.to.call{value: callItem.value}(callItem.data);
        require(success, "Call reverted");
        emit CallExecuted(address(this), callItem.to, callItem.value, callItem.data);
    }
}