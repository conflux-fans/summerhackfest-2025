// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/// @title GasStation - Gasless swaps with meta-transactions
contract GasStation is Ownable, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    IPyth public immutable pyth;
    bytes32 public immutable cfxUsdFeedId;

    struct TokenInfo {
        address tokenAddress;
        string ticker;
        bytes32 feedId;
    }

    TokenInfo[] public supportedTokens;
    mapping(address => bytes32) public tokenFeedIds;
    mapping(address => string) public tokenTickers;
    mapping(address => uint256) public nonces;

    uint256 public constant MAX_CFX_PER_SWAP = 10 * 10**18; // 10 CFX
    uint256 public relayerFeePercent = 50; // 0.5% fee (50/10000)

    bytes32 private constant SWAP_TYPEHASH = keccak256(
        "SwapRequest(address user,address tokenAddress,uint256 amount,uint256 nonce,uint256 deadline)"
    );

    event TokenAdded(address indexed tokenAddress, string ticker, bytes32 feedId);
    event MetaSwapped(
        address indexed user,
        address indexed relayer,
        address indexed tokenAddress,
        uint256 tokenAmount,
        uint256 cfxAmount,
        uint256 relayerFee
    );
    event RelayerFeeUpdated(uint256 newFeePercent);

    constructor(address _pyth, bytes32 _cfxUsdFeedId) EIP712("GasStation", "1") {
        require(_pyth != address(0), "pyth address zero");
        require(_cfxUsdFeedId != bytes32(0), "invalid feed id");
        pyth = IPyth(_pyth);
        cfxUsdFeedId = _cfxUsdFeedId;
    }

    // --- Owner management ---
    function addToken(address tokenAddress, string calldata ticker, bytes32 feedId) external onlyOwner {
        require(feedId != bytes32(0), "Invalid feed ID");
        require(tokenAddress != address(0), "Invalid token address");
        require(tokenFeedIds[tokenAddress] == bytes32(0), "Token already added");

        supportedTokens.push(TokenInfo({
            tokenAddress: tokenAddress,
            ticker: ticker,
            feedId: feedId
        }));

        tokenFeedIds[tokenAddress] = feedId;
        tokenTickers[tokenAddress] = ticker;
        emit TokenAdded(tokenAddress, ticker, feedId);
    }

    // --- Meta-swap ---
    function metaSwap(
        address user,
        address tokenAddress,
        uint256 amount,
        uint256 deadline,
        bytes calldata signature,
        bytes[] calldata updateData,
        uint32 maxAge
    ) external payable nonReentrant {
        require(block.timestamp <= deadline, "Signature expired");
        require(tokenFeedIds[tokenAddress] != bytes32(0), "Token not whitelisted");

        // Verify user signature
        _verifySwapSignature(user, tokenAddress, amount, deadline, signature);
        nonces[user]++;

        // Update Pyth prices
        uint256 fee = pyth.getUpdateFee(updateData);
        require(msg.value >= fee, "Insufficient Pyth update fee");
        pyth.updatePriceFeeds{value: fee}(updateData);

        // Get prices
        PythStructs.Price memory tokenPrice = pyth.getPriceNoOlderThan(tokenFeedIds[tokenAddress], maxAge);
        PythStructs.Price memory cfxPrice = pyth.getPriceNoOlderThan(cfxUsdFeedId, maxAge);

        // Calculate CFX amount
        uint256 cfxAmount = _calculateCfxAmount(tokenAddress, amount, tokenPrice, cfxPrice);
        uint256 relayerFee = (cfxAmount * relayerFeePercent) / 10000;
        uint256 userCfxAmount = cfxAmount - relayerFee;

        require(address(this).balance >= cfxAmount, "Insufficient CFX in contract");

        // Pull tokens
        IERC20(tokenAddress).safeTransferFrom(user, address(this), amount);

        // Transfer CFX to user
        _sendCfx(user, userCfxAmount);

        // Pay relayer
        if (relayerFee > 0) _sendCfx(msg.sender, relayerFee);

        // Refund excess Pyth fee to relayer
        uint256 refund = msg.value - fee;
        if (refund > 0) _sendCfx(msg.sender, refund);

        emit MetaSwapped(user, msg.sender, tokenAddress, amount, userCfxAmount, relayerFee);
    }

    // --- Internal helpers ---
    function _verifySwapSignature(
        address user,
        address tokenAddress,
        uint256 amount,
        uint256 deadline,
        bytes calldata signature
    ) internal view {
        bytes32 structHash = keccak256(abi.encode(
            SWAP_TYPEHASH,
            user,
            tokenAddress,
            amount,
            nonces[user],
            deadline
        ));
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(signature);
        require(signer == user, "Invalid signature");
    }

    function _sendCfx(address to, uint256 amount) internal {
        (bool success, ) = to.call{value: amount}("");
        require(success, "CFX transfer failed");
    }

    function _calculateCfxAmount(
        address tokenAddress,
        uint256 amount,
        PythStructs.Price memory tokenPrice,
        PythStructs.Price memory cfxPrice
    ) internal view returns (uint256 cfxAmount) {
        require(tokenPrice.price > 0, "Invalid token price");
        require(cfxPrice.price > 0, "Invalid CFX price");
        require(amount > 0, "Amount zero");

        uint8 tokenDecimals = IERC20Metadata(tokenAddress).decimals();
        int32 tokenExpo = tokenPrice.expo;
        require(tokenExpo < 0, "Unexpected positive expo for token");
        uint256 tokenUsd = (amount * uint256(uint64(tokenPrice.price)) * (10 ** uint32(-tokenExpo))) / (10 ** tokenDecimals);

        int32 cfxExpo = cfxPrice.expo;
        require(cfxExpo < 0, "Unexpected positive expo for CFX");
        uint256 cfxUsdPerUnit = uint256(uint64(cfxPrice.price)) * (10 ** uint32(-cfxExpo));

        cfxAmount = (tokenUsd * 10**18) / cfxUsdPerUnit;
        require(cfxAmount <= MAX_CFX_PER_SWAP, "Exceeds max CFX per swap");
    }

    // --- Owner functions ---
    function setRelayerFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee too high"); // Max 10%
        relayerFeePercent = _feePercent;
        emit RelayerFeeUpdated(_feePercent);
    }

    function depositCfx() external payable onlyOwner {
        require(msg.value > 0, "Must deposit > 0");
    }

    function withdrawCfx(uint256 amount) external onlyOwner nonReentrant {
        require(address(this).balance >= amount, "Insufficient balance");
        _sendCfx(msg.sender, amount);
    }

    function withdrawToken(address tokenAddress, uint256 amount) external onlyOwner nonReentrant {
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);
    }

    // --- View helpers ---
    function getSupportedTokens() external view returns (TokenInfo[] memory) {
        return supportedTokens;
    }

    function estimateCfxOut(
        address tokenAddress,
        uint256 amount
    ) external view returns (uint256 cfxAmount, uint256 relayerFee, uint256 userAmount) {
        bytes32 tokenFeedId = tokenFeedIds[tokenAddress];
        require(tokenFeedId != bytes32(0), "Token not whitelisted");

        PythStructs.Price memory tokenPrice = pyth.getPriceUnsafe(tokenFeedId);
        PythStructs.Price memory cfxPrice = pyth.getPriceUnsafe(cfxUsdFeedId);

        cfxAmount = _calculateCfxAmount(tokenAddress, amount, tokenPrice, cfxPrice);
        relayerFee = (cfxAmount * relayerFeePercent) / 10000;
        userAmount = cfxAmount - relayerFee;
    }
}
