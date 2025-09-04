// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GasTopUp is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IPyth public immutable pyth;
    bytes32 public immutable cfxUsdFeedId;

    struct TokenInfo {
        address tokenAddress;
        string ticker;
        bytes32 feedId;
    }

    TokenInfo[] public supportedTokens;
    mapping(address => bytes32) public tokenFeedIds; // For quick lookup
    mapping(address => string) public tokenTickers;  // For ticker by address

    uint256 public constant MAX_CFX_PER_SWAP = 10 * 10**18; // 10 CFX

    event TokenAdded(address indexed tokenAddress, string ticker, bytes32 feedId);
    event Swapped(address indexed user, address indexed tokenAddress, uint256 tokenAmount, uint256 cfxAmount);

constructor(address _pyth, bytes32 _cfxUsdFeedId, address _owner) Ownable(_owner) {
    pyth = IPyth(_pyth);
    cfxUsdFeedId = _cfxUsdFeedId;
}



    // Owner adds a whitelisted token with its ticker and Pyth feed ID
    function addToken(address tokenAddress, string calldata ticker, bytes32 feedId) external onlyOwner {
        require(feedId != bytes32(0), "Invalid feed ID");
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

    // User swaps token for CFX using Pyth prices
    function swapToCfx(
        address tokenAddress,
        uint256 amount,
        bytes[] calldata updateData,
        uint32 maxAge
    ) external payable nonReentrant {
        bytes32 tokenFeedId = tokenFeedIds[tokenAddress];
        require(tokenFeedId != bytes32(0), "Token not whitelisted");

        // Update Pyth prices and pay fee
        uint256 fee = pyth.getUpdateFee(updateData);
        require(msg.value >= fee, "Insufficient Pyth update fee");
        pyth.updatePriceFeeds{value: fee}(updateData);

        // Get prices (reverts if stale)
        PythStructs.Price memory tokenPrice = pyth.getPriceNoOlderThan(tokenFeedId, maxAge);
        PythStructs.Price memory cfxPrice = pyth.getPriceNoOlderThan(cfxUsdFeedId, maxAge);

        // Ensure positive prices
        require(tokenPrice.price > 0, "Invalid token price");
        require(cfxPrice.price > 0, "Invalid CFX price");

        // Transfer token from user to contract
        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), amount);

        // Calculate USD value of token amount
        uint8 tokenDecimals = IERC20Metadata(tokenAddress).decimals();
        int32 tokenExpo = tokenPrice.expo;
        require(tokenExpo < 0, "Unexpected positive expo");
        uint256 tokenUsd = (amount * uint64(tokenPrice.price) * (10 ** uint32(-tokenExpo))) / (10 ** tokenDecimals);

        // Calculate equivalent CFX amount
        int32 cfxExpo = cfxPrice.expo;
        require(cfxExpo < 0, "Unexpected positive expo");
        uint256 cfxUsdPerUnit = uint64(cfxPrice.price) * (10 ** uint32(-cfxExpo));
        uint256 cfxAmount = (tokenUsd * 10**18) / cfxUsdPerUnit;

        // Enforce max CFX limit
        require(cfxAmount <= MAX_CFX_PER_SWAP, "Exceeds max CFX per swap");

        require(address(this).balance >= cfxAmount, "Insufficient CFX in contract");

        // Transfer CFX to user
        (bool success, ) = msg.sender.call{value: cfxAmount}("");
        require(success, "CFX transfer failed");

        emit Swapped(msg.sender, tokenAddress, amount, cfxAmount);
    }

    // Estimate CFX output (approximate, based on last updated prices)
    function estimateCfxOut(
        address tokenAddress,
        uint256 amount
    ) external view returns (uint256 cfxAmount, uint64 tokenPublishTime, uint64 cfxPublishTime) {
        bytes32 tokenFeedId = tokenFeedIds[tokenAddress];
        require(tokenFeedId != bytes32(0), "Token not whitelisted");

        // Use unsafe to avoid revert if not recently updated
        PythStructs.Price memory tokenPrice = pyth.getPriceUnsafe(tokenFeedId);
        PythStructs.Price memory cfxPrice = pyth.getPriceUnsafe(cfxUsdFeedId);

        // Ensure positive prices
        require(tokenPrice.price > 0, "Invalid token price");
        require(cfxPrice.price > 0, "Invalid CFX price");

        // Return publish times for freshness check
        tokenPublishTime = uint64(tokenPrice.publishTime);
        cfxPublishTime = uint64(cfxPrice.publishTime);

        // Calculate USD value of token amount
        uint8 tokenDecimals = IERC20Metadata(tokenAddress).decimals();
        int32 tokenExpo = tokenPrice.expo;
        require(tokenExpo < 0, "Unexpected positive expo");
        uint256 tokenUsd = (amount * uint64(tokenPrice.price) * (10 ** uint32(-tokenExpo))) / (10 ** tokenDecimals);

        // Calculate equivalent CFX amount
        int32 cfxExpo = cfxPrice.expo;
        require(cfxExpo < 0, "Unexpected positive expo");
        uint256 cfxUsdPerUnit = uint64(cfxPrice.price) * (10 ** uint32(-cfxExpo));
        cfxAmount = (tokenUsd * 10**18) / cfxUsdPerUnit;

        // Note: Does not check max limit or contract balance, as this is estimate only
    }

    // Get list of supported tokens
    function getSupportedTokens() external view returns (TokenInfo[] memory) {
        return supportedTokens;
    }

    // Owner deposits CFX into the contract
    receive() external payable onlyOwner {}

    // Owner withdraws CFX
    function withdrawCfx(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdraw failed");
    }

    // Owner withdraws tokens (in case of emergency or excess)
    function withdrawToken(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);
    }
}