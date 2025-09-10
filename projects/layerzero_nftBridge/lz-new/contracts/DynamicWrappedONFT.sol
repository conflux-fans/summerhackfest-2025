// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ONFT721Core} from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721Core.sol";
import {MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";
import {Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

/**
 * @title DynamicWrappedONFT
 * @dev Fully dynamic adapter for bridging multiple ERC721 NFTs from Base to Conflux eSpace.
 * Anyone can register ERC721 tokens (with interface check); bridging specifies the token address.
 * Payload includes token address for round-trip bridging.
 * Updated to implement wrapping logic: mint wrapped NFTs on receive, burn on send.
 */
contract DynamicWrappedONFT is ONFT721Core, ERC721, IERC721Receiver {
    mapping(address => bool) public supportedTokens;
    mapping(uint256 => address) public wrappedToOriginalToken;
    mapping(uint256 => uint256) public wrappedToOriginalId;

    event TokenRegistered(address indexed token);
    event TokenUnregistered(address indexed token);
    event WrappedMinted(address indexed originalToken, uint256 originalId, uint256 wrappedId, address to);
    event WrappedBurned(uint256 wrappedId);

    constructor(address _lzEndpoint, address _delegate) ONFT721Core(_lzEndpoint, _delegate) ERC721("WrappedNFT", "WNFT") {}

    /**
     * @notice Implements IERC721Receiver to handle safe ERC721 transfers.
     * @return bytes4 The IERC721Receiver interface selector.
     */
    function onERC721Received(
        address /* operator */,
        address /* from */,
        uint256 /* tokenId */,
        bytes calldata /* data */
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /**
     * @notice Permissionless registration of ERC721 tokens (auto-whitelist if valid ERC721).
     * @param _token The ERC721 token address to register.
     */
    function registerToken(address _token) external {
        require(_token != address(0), "Invalid token address");
        require(isERC721(_token), "Not an ERC721 token");
        require(!supportedTokens[_token], "Already registered");
        supportedTokens[_token] = true;
        emit TokenRegistered(_token);
    }

    /**
     * @notice Owner can unregister tokens.
     * @param _token The ERC721 token address to unregister.
     */
    function unregisterToken(address _token) external onlyOwner {
        supportedTokens[_token] = false;
        emit TokenUnregistered(_token);
    }

    /**
     * @notice Check if a contract supports ERC721 interface.
     * @param _token The token address to check.
     * @return bool True if ERC721.
     */
    function isERC721(address _token) public view returns (bool) {
        try IERC721(_token).supportsInterface(0x80ac58cd) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }

    function token() external pure returns (address) {
        return address(0);
    }

    function approvalRequired() external pure virtual returns (bool) {
        return true;
    }

    function bridgeSend(
        address _originalToken,
        uint32 _dstEid,
        address _to,
        uint256[] calldata _wrappedIds,
        bytes calldata _options,
        MessagingFee calldata _fee,
        address _refundAddress
    ) external payable {
        if (!supportedTokens[_originalToken]) {
            // Auto-register if first time and valid ERC721
            require(isERC721(_originalToken), "Not an ERC721 token");
            supportedTokens[_originalToken] = true;
            emit TokenRegistered(_originalToken);
        }
        for (uint256 i = 0; i < _wrappedIds.length; i++) {
            _dynamicDebit(_originalToken, msg.sender, _wrappedIds[i], _dstEid);
        }
        bytes memory payload = abi.encode(_to, _wrappedIds, _originalToken);
        _lzSend(_dstEid, payload, _options, _fee, _refundAddress);
    }

    function quoteBridgeSend(
        address _originalToken,
        uint32 _dstEid,
        address _to,
        uint256[] calldata _wrappedIds,
        bytes calldata _options,
        bool _payInLzToken
    ) external view returns (MessagingFee memory fee) {
        bytes memory payload = abi.encode(_to, _wrappedIds, _originalToken);
        fee = _quote(_dstEid, payload, _options, _payInLzToken);
    }

    // Custom dynamic debit (not override)
    function _dynamicDebit(address _originalToken, address _from, uint256 _tokenId, uint32 _dstEid) internal virtual {
        // Burn the wrapped NFT
        _burn(_tokenId);
        emit WrappedBurned(_tokenId);
    }

    // Custom dynamic credit (not override)
    function _dynamicCredit(address _originalToken, address _toAddress, uint256 _tokenId, uint32 _srcEid) internal virtual {
        // Mint a new wrapped NFT
        _safeMint(_toAddress, _tokenId);
        wrappedToOriginalToken[_tokenId] = _originalToken;
        wrappedToOriginalId[_tokenId] = _tokenId; // Assuming same tokenId for simplicity; adjust if needed
        emit WrappedMinted(_originalToken, _tokenId, _tokenId, _toAddress);
    }

    // Required override for abstract _debit (revert since we use custom entrypoint)
    function _debit(address _from, uint256 _tokenId, uint32 _dstEid) internal virtual override {
        revert("Use bridgeSend for dynamic bridging");
    }

    // Required override for abstract _credit (revert since we use custom _lzReceive)
    function _credit(address _to, uint256 _tokenId, uint32 _srcEid) internal virtual override {
        revert("Use bridgeSend for dynamic bridging");
    }

    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _message,
        address _executor,
        bytes calldata _extraData
    ) internal virtual override {
        (address toAddress, uint256[] memory tokenIds, address originalToken) = abi.decode(_message, (address, uint256[], address));
        if (!supportedTokens[originalToken]) {
            supportedTokens[originalToken] = true;
            emit TokenRegistered(originalToken);
        }
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _dynamicCredit(originalToken, toAddress, tokenIds[i], _origin.srcEid);
        }
    }
}