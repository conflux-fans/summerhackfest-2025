// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
/// @title GasTopUp
/// @notice Swap approved ERC20 tokens for native CFX using Pyth price feeds. Owner seeds CFX liquidity and may withdraw.
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
mapping(address => bytes32) public tokenFeedIds; // For quick lookup by token address
mapping(address => string) public tokenTickers;  // ticker by token address
uint256 public constant MAX_CFX_PER_SWAP = 10 * 10**18; // 10 CFX
event TokenAdded(address indexed tokenAddress, string ticker, bytes32 feedId);
event Swapped(address indexed user, address indexed tokenAddress, uint256 tokenAmount, uint256 cfxAmount);
event DepositCfx(address indexed owner, uint256 amount);
event WithdrawCfx(address indexed owner, uint256 amount);
event WithdrawToken(address indexed owner, address indexed tokenAddress, uint256 amount);
event Refund(address indexed user, uint256 amountRefunded);
constructor(address _pyth, bytes32 _cfxUsdFeedId) {
require(_pyth != address(0), "pyth address zero");
require(_cfxUsdFeedId != bytes32(0), "invalid feed id");
pyth = IPyth(_pyth);
cfxUsdFeedId = _cfxUsdFeedId;
}
// --- Owner management of supported tokens ---
/// @notice Add a token to whitelist with Pyth feed id
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
// --- Internal calculation and transfer ---
function _calculateAndTransferCfx(
address user,
address tokenAddress,
uint256 amount,
PythStructs.Price memory tokenPrice,
PythStructs.Price memory cfxPrice
) private returns (uint256 cfxAmount) {
require(tokenPrice.price > 0, "Invalid token price");
require(cfxPrice.price > 0, "Invalid CFX price");
require(amount > 0, "Amount zero");
// Pull token from user
IERC20(tokenAddress).safeTransferFrom(user, address(this), amount);
// Compute USD value of token amount
uint8 tokenDecimals = IERC20Metadata(tokenAddress).decimals();
int32 tokenExpo = tokenPrice.expo;
require(tokenExpo < 0, "Unexpected positive expo for token");
uint256 tokenUsd = (amount * uint256(uint64(tokenPrice.price)) * (10 ** uint32(-tokenExpo))) / (10 ** tokenDecimals);
// Compute CFX price in USD per 1 CFX
int32 cfxExpo = cfxPrice.expo;
require(cfxExpo < 0, "Unexpected positive expo for CFX");
uint256 cfxUsdPerUnit = uint256(uint64(cfxPrice.price)) * (10 ** uint32(-cfxExpo));
// cfxAmount in wei
cfxAmount = (tokenUsd * 10**18) / cfxUsdPerUnit;
require(cfxAmount <= MAX_CFX_PER_SWAP, "Exceeds max CFX per swap");
require(address(this).balance >= cfxAmount, "Insufficient CFX in contract");
// Transfer native CFX to user
(bool success, ) = user.call{value: cfxAmount}("");
require(success, "CFX transfer failed");
}
// --- User-facing swap function ---
function swapToCfx(
address tokenAddress,
uint256 amount,
bytes[] calldata updateData,
uint32 maxAge
) external payable nonReentrant {
bytes32 tokenFeedId = tokenFeedIds[tokenAddress];
require(tokenFeedId != bytes32(0), "Token not whitelisted");
// Update Pyth prices and pay required fee
uint256 fee = pyth.getUpdateFee(updateData);
require(msg.value >= fee, "Insufficient Pyth update fee");
pyth.updatePriceFeeds{value: fee}(updateData);
// refund any excess fee
uint256 refund = msg.value - fee;
if (refund > 0) {
(bool r, ) = msg.sender.call{value: refund}("");
require(r, "Refund failed");
emit Refund(msg.sender, refund);
}
// Read prices
PythStructs.Price memory tokenPrice = pyth.getPriceNoOlderThan(tokenFeedId, maxAge);
PythStructs.Price memory cfxPrice = pyth.getPriceNoOlderThan(cfxUsdFeedId, maxAge);
uint256 cfxAmount = _calculateAndTransferCfx(msg.sender, tokenAddress, amount, tokenPrice, cfxPrice);
emit Swapped(msg.sender, tokenAddress, amount, cfxAmount);
}
// --- View helpers ---
function getSupportedTokens() external view returns (TokenInfo[] memory) {
return supportedTokens;
}
function getPyth() external view returns (address) {
return address(pyth);
}
function getCfxUsdFeedId() external view returns (bytes32) {
return cfxUsdFeedId;
}
function estimateCfxOut(
    address tokenAddress,
    uint256 amount
) external view returns (uint256 cfxAmount, uint64 tokenPublishTime, uint64 cfxPublishTime) {
    bytes32 tokenFeedId = tokenFeedIds[tokenAddress];
    require(tokenFeedId != bytes32(0), "Token not whitelisted");

    PythStructs.Price memory tokenPrice = pyth.getPriceUnsafe(tokenFeedId);
    PythStructs.Price memory cfxPrice = pyth.getPriceUnsafe(cfxUsdFeedId);

    tokenPublishTime = uint64(tokenPrice.publishTime); // CAST HERE
    cfxPublishTime = uint64(cfxPrice.publishTime);     // CAST HERE

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

// --- Owner-only deposit & withdraw ---
/// @notice Explicit owner-only deposit of native CFX
function depositCfx() external payable onlyOwner {
require(msg.value > 0, "Must deposit > 0");
emit DepositCfx(msg.sender, msg.value);
}
/// @notice Owner-only: fallback deposit (sending CFX directly)
receive() external payable onlyOwner {
emit DepositCfx(msg.sender, msg.value);
}
/// @notice Owner-only withdraw native CFX from contract
function withdrawCfx(uint256 amount) external onlyOwner nonReentrant {
require(address(this).balance >= amount, "Insufficient balance");
(bool success, ) = msg.sender.call{value: amount}("");
require(success, "Withdraw failed");
emit WithdrawCfx(msg.sender, amount);
}
/// @notice Owner-only withdraw ERC20 tokens from contract
function withdrawToken(address tokenAddress, uint256 amount) external onlyOwner nonReentrant {
require(tokenAddress != address(0), "Invalid token");
IERC20(tokenAddress).safeTransfer(msg.sender, amount);
emit WithdrawToken(msg.sender, tokenAddress, amount);
}
}