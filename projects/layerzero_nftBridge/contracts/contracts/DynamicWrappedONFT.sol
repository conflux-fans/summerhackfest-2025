// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ONFT721Core} from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721Core.sol";
import {MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";
import {Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {WrappedONFT} from "./WrappedONFT.sol";

/**
 * @title DynamicWrappedONFTFactory
 * @dev Factory and bridge handler for creating per-collection wrapped NFTs on Base.
 * Deploys separate wrapped contracts for each original collection using a factory pattern.
 * Handles bridging logic, minting/burning on the appropriate wrapper.
 * Anyone can register ERC721 tokens; bridging specifies the original token address.
 * Payload includes token address, metadata for round-trip bridging.
 */
contract DynamicWrappedONFTFactory is ONFT721Core {
    mapping(address => bool) public supportedTokens;
    mapping(address => address) public originalToWrapper;
    mapping(address => address) public wrapperToOriginal;
    address public immutable wrappedImplementation;
    event TokenRegistered(address indexed token);
    event TokenUnregistered(address indexed token);
    event WrappedMinted(address indexed wrapper, address indexed originalToken, uint256 originalId, uint256 wrappedId, address to);
    event WrappedBurned(address indexed wrapper, uint256 wrappedId);
    event WrapperDeployed(address indexed originalToken, address wrapper);

    constructor(address _lzEndpoint, address _delegate) ONFT721Core(_lzEndpoint, _delegate) {
        wrappedImplementation = address(new WrappedONFT());
    }

    /**
     * @notice Permissionless registration of ERC721 tokens (auto-whitelist if valid ERC721).
     * @param _token The ERC721 token address to register (original on source chain).
     */
    function registerToken(address _token) external {
        require(_token != address(0), "Invalid token address");
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
     * @notice Deploy a new wrapper for an original token.
     * @param _originalToken The original token address on source chain.
     * @param _name The name for the wrapped collection.
     * @param _symbol The symbol for the wrapped collection.
     * @return wrapper The address of the deployed wrapper.
     */
    function deployWrapper(address _originalToken, string memory _name, string memory _symbol) internal returns (address wrapper) {
        wrapper = Clones.clone(wrappedImplementation);
        WrappedONFT(wrapper).initialize(_name, _symbol, _originalToken, address(this));
        originalToWrapper[_originalToken] = wrapper;
        wrapperToOriginal[wrapper] = _originalToken;
        emit WrapperDeployed(_originalToken, wrapper);
    }

    function getWrapper(address _originalToken) external view returns (address) {
        return originalToWrapper[_originalToken];
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
        address wrapper = originalToWrapper[_originalToken];
        require(wrapper != address(0), "Wrapper not deployed");
        if (!supportedTokens[_originalToken]) {
            supportedTokens[_originalToken] = true;
            emit TokenRegistered(_originalToken);
        }
        string memory collName = WrappedONFT(wrapper).name();
        string memory collSymbol = WrappedONFT(wrapper).symbol();
        string[] memory tokenURIs = new string<a href="_tokenIds.length" target="_blank" rel="noopener noreferrer nofollow"></a>;
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            tokenURIs[i] = WrappedONFT(wrapper).tokenURI(_tokenIds[i]);
        }
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            _dynamicDebit(_originalToken, msg.sender, _tokenIds[i], _dstEid);
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
        address wrapper = originalToWrapper[_originalToken];
        require(wrapper != address(0), "Wrapper not deployed");
        string memory collName = WrappedONFT(wrapper).name();
        string memory collSymbol = WrappedONFT(wrapper).symbol();
        string[] memory tokenURIs = new string<a href="_tokenIds.length" target="_blank" rel="noopener noreferrer nofollow"></a>;
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            tokenURIs[i] = WrappedONFT(wrapper).tokenURI(_tokenIds[i]);
        }
        bytes memory payload = abi.encode(_to, _tokenIds, _originalToken, collName, collSymbol, tokenURIs);
        fee = _quote(_dstEid, payload, _options, _payInLzToken);
    }

    // Custom dynamic debit (not override)
    function _dynamicDebit(address _originalToken, address _from, uint256 _tokenId, uint32 _dstEid) internal virtual {
        address wrapper = originalToWrapper[_originalToken];
        WrappedONFT(wrapper).burn(_tokenId);
        emit WrappedBurned(wrapper, _tokenId);
    }

    // Custom dynamic credit (not override)
    function _dynamicCredit(address _originalToken, address _toAddress, uint256 _tokenId, uint32 _srcEid, string memory _tokenURI) internal virtual {
        address wrapper = originalToWrapper[_originalToken];
        WrappedONFT(wrapper).mint(_toAddress, _tokenId, _tokenURI);
        emit WrappedMinted(wrapper, _originalToken, _tokenId, _tokenId, _toAddress);
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
        address wrapper = originalToWrapper[originalToken];
        if (wrapper == address(0)) {
            wrapper = deployWrapper(originalToken, collName, collSymbol);
        }
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _dynamicCredit(originalToken, toAddress, tokenIds[i], _origin.srcEid, tokenURIs[i]);
        }
    }
}