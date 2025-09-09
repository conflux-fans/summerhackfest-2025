// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ONFT721Core} from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721Core.sol";
import {MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";
import {Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";

/**
 * @title DynamicWrappedONFT
 * @dev Dynamic wrapped ONFT for receiving bridged ERC721 NFTs on Base (or other chains).
 * Handles multiple original tokens by using hashed wrapped token IDs to avoid collisions.
 * Assumes bidirectional bridging with the adapter on the original chain (e.g., Conflux).
 * Metadata is not handled; extend with IERC721Metadata if needed.
 */
contract DynamicWrappedONFT is ONFT721Core, ERC721 {
    // Mappings from wrapped token ID to original details
    mapping(uint256 => address) public wrappedToOriginalToken;
    mapping(uint256 => uint256) public wrappedToOriginalId;
    mapping(uint256 => uint32) public wrappedToOriginalEid;

    event TokenMinted(address indexed to, uint256 wrappedId);
    event TokenBurned(address indexed from, uint256 wrappedId);

    constructor(address _lzEndpoint, address _delegate) ONFT721Core(_lzEndpoint, _delegate) ERC721("Wrapped Conflux NFTs", "WCFXNFT") {}
    /**
     * @dev Returns the token contract address (this contract).
     */
    function token() external view returns (address) {
        return address(this);
    }

    /**
     * @dev Indicates if approval is required for bridging (yes, for safeTransferFrom).
     */
    function approvalRequired() external pure returns (bool) {
        return true;
    }

    /**
     * @dev Computes a unique wrapped token ID based on original details to avoid collisions.
     * @param _originalToken Original ERC721 address on source chain.
     * @param _originalEid Source endpoint ID.
     * @param _originalId Original token ID.
     * @return uint256 Wrapped token ID.
     */
    function computeWrappedId(address _originalToken, uint32 _originalEid, uint256 _originalId) external pure returns (uint256) {
        return uint256(keccak256(abi.encode(_originalToken, _originalEid, _originalId)));
    }

    /**
     * @notice Bridge wrapped tokens back to the original chain (burn and send message).
     * User must approve this contract for each wrapped token ID beforehand.
     * All wrapped IDs must belong to the same original token and EID matching _dstEid.
     * @param _dstEid Destination endpoint ID (must match original EID).
     * @param _to Recipient address on destination.
     * @param _wrappedIds Array of wrapped token IDs to bridge.
     * @param _options LayerZero messaging options.
     * @param _fee Messaging fee details.
     * @param _refundAddress Refund address for excess fees.
     */
    function bridgeSend(
        uint32 _dstEid,
        address _to,
        uint256[] calldata _wrappedIds,
        bytes calldata _options,
        MessagingFee calldata _fee,
        address _refundAddress
    ) external payable {
        require(_wrappedIds.length > 0, "No tokens provided");

        // Validate all wrapped IDs share the same original token and EID
        address originalToken = wrappedToOriginalToken[_wrappedIds[0]];
        uint32 originalEid = wrappedToOriginalEid[_wrappedIds[0]];
        require(originalToken != address(0), "Invalid wrapped token");
        require(originalEid == _dstEid, "Destination EID mismatch");

        uint256[] memory originalIds = new uint256[](_wrappedIds.length);
        for (uint256 i = 0; i < _wrappedIds.length; i++) {
            require(wrappedToOriginalToken[_wrappedIds[i]] == originalToken, "Mismatched original tokens");
            require(wrappedToOriginalEid[_wrappedIds[i]] == _dstEid, "Mismatched original EIDs");
            originalIds[i] = wrappedToOriginalId[_wrappedIds[i]];

            // Debit (transfer to self and burn)
            _dynamicDebit(msg.sender, _wrappedIds[i]);
            emit TokenBurned(msg.sender, _wrappedIds[i]);
        }

        // Encode payload matching adapter format
        bytes memory payload = abi.encode(_to, originalIds, originalToken);
        _lzSend(_dstEid, payload, _options, _fee, _refundAddress);
    }

    /**
     * @notice Quote the fee for bridging wrapped tokens.
     * @param _dstEid Destination endpoint ID.
     * @param _to Recipient address.
     * @param _wrappedIds Array of wrapped token IDs (used for payload size estimation).
     * @param _options Messaging options.
     * @param _payInLzToken Pay in LZ token flag.
     * @return fee Estimated messaging fee.
     */
    function quoteBridgeSend(
        uint32 _dstEid,
        address _to,
        uint256[] calldata _wrappedIds,
        bytes calldata _options,
        bool _payInLzToken
    ) external view returns (MessagingFee memory fee) {
        // Dummy payload for size estimation (address doesn't matter)
        bytes memory payload = abi.encode(_to, _wrappedIds, address(0));
        fee = _quote(_dstEid, payload, _options, _payInLzToken);
    }

    // Internal debit: transfer to self, burn, clear mappings
    function _dynamicDebit(address _from, uint256 _wrappedId) internal {
        safeTransferFrom(_from, address(this), _wrappedId);
        _burn(_wrappedId);

        // Clear mappings
        delete wrappedToOriginalToken[_wrappedId];
        delete wrappedToOriginalId[_wrappedId];
        delete wrappedToOriginalEid[_wrappedId];
    }

    // Internal credit: mint and set mappings (called in _lzReceive)
    function _dynamicCredit(
        address _to,
        uint256 _wrappedId,
        address _originalToken,
        uint32 _originalEid,
        uint256 _originalId
    ) internal {
        _safeMint(_to, _wrappedId);
        wrappedToOriginalToken[_wrappedId] = _originalToken;
        wrappedToOriginalId[_wrappedId] = _originalId;
        wrappedToOriginalEid[_wrappedId] = _originalEid;
    }

    // Override to handle custom payload and mint wrapped tokens
    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _message,
        address _executor,
        bytes calldata _extraData
    ) internal virtual override {
        (address toAddress, uint256[] memory originalIds, address originalToken) = abi.decode(_message, (address, uint256[], address));

        for (uint256 i = 0; i < originalIds.length; i++) {
            uint256 wrappedId = _computeWrappedId(originalToken, _origin.srcEid, originalIds[i]);
            _dynamicCredit(toAddress, wrappedId, originalToken, _origin.srcEid, originalIds[i]);
            emit TokenMinted(toAddress, wrappedId);
        }
    }

    function _computeWrappedId(address _originalToken, uint32 _originalEid, uint256 _originalId) internal pure returns (uint256) {
        return uint256(keccak256(abi.encode(_originalToken, _originalEid, _originalId)));
    }

    // Revert standard single-token methods (use bridgeSend instead)
    function _debit(address _from, uint256 _tokenId, uint32 _dstEid) internal virtual override {
        revert("Use bridgeSend for dynamic bridging");
    }

    function _credit(address _to, uint256 _tokenId, uint32 _srcEid) internal virtual override {
        revert("Use bridgeSend for dynamic bridging");
    }
}