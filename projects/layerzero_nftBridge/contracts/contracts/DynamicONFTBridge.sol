// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ONFT721Core} from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721Core.sol";
import {MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";
import {Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {WrappedONFT} from "./WrappedONFT.sol";

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

/**
 * @title DynamicONFTBridge
 * @dev Symmetric bridge for ERC721 NFTs across chains, supporting both native and wrapped collections dynamically.
 * Deploy this contract on both Conflux eSpace and Base for bidirectional bridging.
 * Automatically distinguishes between native (lock/unlock) and wrapped (mint/burn) collections.
 * Collections can originate from any chain; the first bridge defines the home chain.
 * Payload includes homeEid and canonicalAddr for proper handling.
 */
contract DynamicONFTBridge is ONFT721Core, IERC721Receiver {
    mapping(address => bool) public supportedTokens;
    mapping(address => address) public originalToWrapper; // canonicalAddr => local wrapper
    mapping(address => address) public wrapperToOriginal; // local wrapper => canonicalAddr
    mapping(address => uint32) public originalToHomeEid; // canonicalAddr => homeEid
    address public immutable wrappedImplementation;

    event TokenRegistered(address indexed token);
    event TokenUnregistered(address indexed token);
    event WrappedMinted(address indexed wrapper, address indexed canonicalAddr, uint256 tokenId, address to);
    event WrappedBurned(address indexed wrapper, uint256 tokenId);
    event WrapperDeployed(address indexed canonicalAddr, address wrapper);

    constructor(address _lzEndpoint, address _delegate) ONFT721Core(_lzEndpoint, _delegate) {
        wrappedImplementation = address(new WrappedONFT());
    }

    /**
     * @notice Implements IERC721Receiver to handle safe ERC721 transfers for locking natives.
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
     * @notice Permissionless registration of tokens (auto-whitelist if valid).
     * @param _token The token address to register (canonical or local).
     */
    function registerToken(address _token) external {
        require(_token != address(0), "Invalid token address");
        require(!supportedTokens[_token], "Already registered");
        supportedTokens[_token] = true;
        emit TokenRegistered(_token);
    }

    /**
     * @notice Owner can unregister tokens.
     * @param _token The token address to unregister.
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

    /**
     * @notice Deploy a new wrapper for a canonical token.
     * @param _canonicalAddr The canonical token address on home chain.
     * @param _name The name for the wrapped collection.
     * @param _symbol The symbol for the wrapped collection.
     * @return wrapper The address of the deployed wrapper.
     */
    function deployWrapper(address _canonicalAddr, string memory _name, string memory _symbol) internal returns (address wrapper) {
        wrapper = Clones.clone(wrappedImplementation);
        WrappedONFT(wrapper).initialize(_name, _symbol, _canonicalAddr, address(this));
        originalToWrapper[_canonicalAddr] = wrapper;
        wrapperToOriginal[wrapper] = _canonicalAddr;
        emit WrapperDeployed(_canonicalAddr, wrapper);
    }

    function getWrapper(address _canonicalAddr) external view returns (address) {
        return originalToWrapper[_canonicalAddr];
    }

    function token() external pure returns (address) {
        return address(0);
    }

    function approvalRequired() external pure virtual returns (bool) {
        return true;
    }

    function bridgeSend(
        address _localToken,
        uint32 _dstEid,
        address _to,
        uint256[] calldata _tokenIds,
        bytes calldata _options,
        MessagingFee calldata _fee,
        address _refundAddress
    ) external payable {
        require(_localToken != address(0), "Invalid token address");
        if (!supportedTokens[_localToken]) {
            // Auto-register if valid
            supportedTokens[_localToken] = true;
            emit TokenRegistered(_localToken);
        }

        address canonicalAddr;
        uint32 homeEid;
        address localCollection = _localToken;

        if (wrapperToOriginal[localCollection] != address(0)) {
            // Wrapped collection: burn
            canonicalAddr = wrapperToOriginal[localCollection];
            homeEid = originalToHomeEid[canonicalAddr];
            for (uint256 i = 0; i < _tokenIds.length; i++) {
                WrappedONFT(localCollection).burn(_tokenIds[i]);
                emit WrappedBurned(localCollection, _tokenIds[i]);
            }
        } else {
            // Native collection: lock
            require(isERC721(localCollection), "Not an ERC721 token");
            canonicalAddr = localCollection;
            homeEid = uint32(endpoint.eid());
            for (uint256 i = 0; i < _tokenIds.length; i++) {
                IERC721(localCollection).safeTransferFrom(msg.sender, address(this), _tokenIds[i]);
            }
        }

        string memory collName;
        string memory collSymbol;
        string[] memory tokenURIs = new string[](_tokenIds.length);
        try IERC721Metadata(localCollection).name() returns (string memory n) {
            collName = n;
        } catch {}
        try IERC721Metadata(localCollection).symbol() returns (string memory s) {
            collSymbol = s;
        } catch {}
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            try IERC721Metadata(localCollection).tokenURI(_tokenIds[i]) returns (string memory u) {
                tokenURIs[i] = u;
            } catch {}
        }
        bytes memory payload = abi.encode(_to, _tokenIds, homeEid, canonicalAddr, collName, collSymbol, tokenURIs);
        _lzSend(_dstEid, payload, _options, _fee, _refundAddress);
    }

    function quoteBridgeSend(
        address _localToken,
        uint32 _dstEid,
        address _to,
        uint256[] calldata _tokenIds,
        bytes calldata _options,
        bool _payInLzToken
    ) external view returns (MessagingFee memory fee) {
        require(_localToken != address(0), "Invalid token address");

        address localCollection = _localToken;

        // No need to check if wrapped or native for quote, just compute payload size
        string memory collName;
        string memory collSymbol;
        string[] memory tokenURIs = new string[](_tokenIds.length);
        try IERC721Metadata(localCollection).name() returns (string memory n) {
            collName = n;
        } catch {}
        try IERC721Metadata(localCollection).symbol() returns (string memory s) {
            collSymbol = s;
        } catch {}
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            try IERC721Metadata(localCollection).tokenURI(_tokenIds[i]) returns (string memory u) {
                tokenURIs[i] = u;
            } catch {}
        }
        // For quote, we don't need homeEid/canonicalAddr accurately, but payload structure must match
        bytes memory payload = abi.encode(_to, _tokenIds, uint32(0), address(0), collName, collSymbol, tokenURIs);
        fee = _quote(_dstEid, payload, _options, _payInLzToken);
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
        (address toAddress, uint256[] memory tokenIds, uint32 homeEid, address canonicalAddr, string memory collName, string memory collSymbol, string[] memory tokenURIs) = abi.decode(_message, (address, uint256[], uint32, address, string, string, string[]));

        if (!supportedTokens[canonicalAddr]) {
            supportedTokens[canonicalAddr] = true;
            emit TokenRegistered(canonicalAddr);
        }

        uint32 localEid = uint32(endpoint.eid());
        if (homeEid == localEid) {
            // Home chain: unlock native
            require(isERC721(canonicalAddr), "Not a native ERC721");
            for (uint256 i = 0; i < tokenIds.length; i++) {
                IERC721(canonicalAddr).safeTransferFrom(address(this), toAddress, tokenIds[i]);
            }
        } else {
            // Foreign chain: mint wrapped
            address wrapper = originalToWrapper[canonicalAddr];
            if (wrapper == address(0)) {
                wrapper = deployWrapper(canonicalAddr, collName, collSymbol);
                originalToHomeEid[canonicalAddr] = homeEid;
            }
            for (uint256 i = 0; i < tokenIds.length; i++) {
                WrappedONFT(wrapper).mint(toAddress, tokenIds[i], tokenURIs[i]);
                emit WrappedMinted(wrapper, canonicalAddr, tokenIds[i], toAddress);
            }
        }
    }
}