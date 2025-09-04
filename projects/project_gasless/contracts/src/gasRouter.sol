// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint amount) external returns (bool);
    function approve(address spender, uint amount) external returns (bool);
    function transfer(address to, uint amount) external returns (bool);
    function balanceOf(address account) external view returns (uint);
    function decimals() external view returns (uint8);
}

interface IDexRouter {
    function swapExactTokensForCFX(
        uint amountIn,
        uint amountOutMin,
        address tokenIn,
        address to
    ) external payable returns (uint amountOut);
}

contract GasTopUp {
    address public owner;
    IDexRouter public dexRouter;
    IPyth public pyth;

    // Fee settings
    uint public feeBasisPoints = 50; // 0.5%
    address public feeCollector;

    // Token whitelist (WBTC, ETH, USDT, USDC)
    mapping(address => bool) public supportedTokens;

    // Pyth price feed IDs
    mapping(address => bytes32) public tokenPriceFeeds; // token -> feedId
    bytes32 public cfxPriceFeed; // CFX/USD feedId

    event GasToppedUp(address indexed user, address token, uint tokenAmount, uint cfxReceived);
    event TokenSupported(address token, bool supported, bytes32 priceFeedId);
    event FeeUpdated(uint feeBps, address collector);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _router, address _pyth, bytes32 _cfxFeed) {
        owner = msg.sender;
        dexRouter = IDexRouter(_router);
        pyth = IPyth(_pyth);
        cfxPriceFeed = _cfxFeed;
        feeCollector = msg.sender;
    }

    // Owner can whitelist supported tokens + assign their price feed
    function setSupportedToken(address token, bool supported, bytes32 feedId) external onlyOwner {
        supportedTokens[token] = supported;
        if (supported) {
            tokenPriceFeeds[token] = feedId;
        }
        emit TokenSupported(token, supported, feedId);
    }

    // Owner can adjust fees
    function setFee(uint _bps, address _collector) external onlyOwner {
        require(_bps <= 500, "Fee too high"); // max 5%
        feeBasisPoints = _bps;
        feeCollector = _collector;
        emit FeeUpdated(_bps, _collector);
    }

    // Estimate top-up amount in CFX using Pyth price feeds
    function estimateTopUp(address token, uint amountIn, bytes[] calldata priceUpdateData)
        public
        payable
        returns (uint expectedCFX)
    {
        require(supportedTokens[token], "Unsupported token");

        // Update Pyth price feeds
        pyth.updatePriceFeeds{value: msg.value}(priceUpdateData);

        // Get token/USD price
        PythStructs.Price memory tokenPrice = pyth.getPriceNoOlderThan(tokenPriceFeeds[token], 60);
        PythStructs.Price memory cfxPrice = pyth.getPriceNoOlderThan(cfxPriceFeed, 60);

        require(tokenPrice.price > 0 && cfxPrice.price > 0, "Invalid price data");

        // Normalize decimals
        uint8 tokenDecimals = IERC20(token).decimals();
        uint tokenValueUSD = (amountIn * uint(tokenPrice.price)) / (10 ** tokenDecimals);

        // Convert USD value into CFX
        expectedCFX = (tokenValueUSD * (10 ** 18)) / uint(cfxPrice.price);
    }

    // Top-up function: swap user token -> CFX
    function topUpGas(
        address token,
        uint amountIn,
        uint minOut,
        bytes[] calldata priceUpdateData
    ) external payable {
        require(supportedTokens[token], "Unsupported token");
        require(amountIn > 0, "Amount must be > 0");

        // Estimate top-up
        uint expected = estimateTopUp(token, amountIn, priceUpdateData);
        require(expected >= 0.05 ether, "Too small for useful gas");

        // Take tokens from user
        require(IERC20(token).transferFrom(msg.sender, address(this), amountIn), "Transfer failed");

        // Approve router
        IERC20(token).approve(address(dexRouter), amountIn);

        // Swap on DEX
        uint amountOut = dexRouter.swapExactTokensForCFX(
            amountIn,
            minOut,
            token,
            address(this)
        );
        require(amountOut > 0, "Swap failed");

        // Fee
        uint fee = (amountOut * feeBasisPoints) / 10000;
        uint payout = amountOut - fee;

        if (fee > 0) {
            payable(feeCollector).transfer(fee);
        }

        // Send gas top-up to user
        payable(msg.sender).transfer(payout);

        emit GasToppedUp(msg.sender, token, amountIn, payout);
    }

    // Receive CFX from DEX router
    receive() external payable {}
}
