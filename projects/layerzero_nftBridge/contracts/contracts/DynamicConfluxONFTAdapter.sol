// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ONFT721Core} from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721Core.sol";
import {MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";
import {Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

/**
 * @title DynamicConfluxONFTAdapter
 * @dev Fully dynamic adapter for bridging multiple ERC721 NFTs from Conflux eSpace.
 * Anyone can register ERC721 tokens (with interface check); bridging specifies the token address.
 * Payload includes token address for round-trip bridging.
 * Updated to pass collection metadata (name, symbol) and individual NFT metadata (tokenURI) in the LayerZero payload.
 */
contract DynamicConfluxONFTAdapter is ONFT721Core, IERC721Receiver {
    mapping(address => bool) public supportedTokens;

    event TokenRegistered(address indexed token);
    event TokenUnregistered(address indexed token);

    constructor(address _lzEndpoint, address _delegate) ONFT721Core(_lzEndpoint, _delegate) {}

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
        uint256[] calldata _tokenIds,
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
        string memory collName;
        string memory collSymbol;
        string[] memory tokenURIs = new string[](_tokenIds.length);
        try IERC721Metadata(_originalToken).name() returns (string memory n) {
            collName = n;
        } catch {}
        try IERC721Metadata(_originalToken).symbol() returns (string memory s) {
            collSymbol = s;
        } catch {}
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            _dynamicDebit(_originalToken, msg.sender, _tokenIds[i], _dstEid);
            try IERC721Metadata(_originalToken).tokenURI(_tokenIds[i]) returns (string memory u) {
                tokenURIs[i] = u;
            } catch {}
        }
        bytes memory payload = abi.encode(_to, _tokenIds, _originalToken, collName, collSymbol, tokenURIs);
        _lzSend(_dstEid, payload, _options, _fee, _refundAddress);
    }

    function quoteBridgeSend(
        address _originalToken,
        uint32 _dstEid,
        address _to,
        uint256[] calldata _tokenIds,
        bytes calldata _options,
        bool _payInLzToken
    ) external view returns (MessagingFee memory fee) {
        string memory collName;
        string memory collSymbol;
        string[] memory tokenURIs = new string[](_tokenIds.length);
        try IERC721Metadata(_originalToken).name() returns (string memory n) {
            collName = n;
        } catch {}
        try IERC721Metadata(_originalToken).symbol() returns (string memory s) {
            collSymbol = s;
        } catch {}
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            try IERC721Metadata(_originalToken).tokenURI(_tokenIds[i]) returns (string memory u) {
                tokenURIs[i] = u;
            } catch {}
        }
        bytes memory payload = abi.encode(_to, _tokenIds, _originalToken, collName, collSymbol, tokenURIs);
        fee = _quote(_dstEid, payload, _options, _payInLzToken);
    }

    // Custom dynamic debit (not override)
    function _dynamicDebit(address _originalToken, address _from, uint256 _tokenId, uint32 _dstEid) internal virtual {
        IERC721(_originalToken).safeTransferFrom(_from, address(this), _tokenId);
    }

    // Custom dynamic credit (not override)
    function _dynamicCredit(address _originalToken, address _toAddress, uint256 _tokenId, uint32 _srcEid) internal virtual {
        IERC721(_originalToken).safeTransferFrom(address(this), _toAddress, _tokenId);
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
        (address toAddress, uint256[] memory tokenIds, address originalToken, string memory collName, string memory collSymbol, string[] memory tokenURIs) = abi.decode(_message, (address, uint256[], address, string, string, string[]));
        if (!supportedTokens[originalToken]) {
            supportedTokens[originalToken] = true;
            emit TokenRegistered(originalToken);
        }
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _dynamicCredit(originalToken, toAddress, tokenIds[i], _origin.srcEid);
        }
    }
}