// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title OrderBook
 * @dev An upgradeable order book contract for P2P trading of an ERC20 token (FC) against the native currency (CFX).
 * Supports creation, filling, cancellation, and sweeping of orders.
 * Charges a small fee on trades, which is collected by the contract owner.
 */
contract OrderBook is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // --- Events ---
    event OrderCreated(uint256 indexed orderId, address indexed user, bool isBuyOrder, uint256 fcAmount, uint256 price);
    event OrderFilled(uint256 indexed orderId, address indexed filler, uint256 fcAmountFilled, uint256 cfxAmount);
    event OrderCancelled(uint256 indexed orderId);
    event FeesWithdrawn(address indexed to, uint256 cfxAmount, uint256 fcAmount);
    event OrderSwept(address indexed sweeper, bool sweptBuyOrders, uint256 totalFcAmount, uint256 totalCfxAmount);


    // --- Structs ---
    struct Order {
        uint256 id;
        address owner;
        bool isBuyOrder; // true for buy order (CFX -> FC), false for sell order (FC -> CFX)
        uint256 price; // Price of 1 FC in CFX, with PRICE_PRECISION
        uint256 fcAmountTotal; // Total FC amount for the order
        uint256 filledFcAmount; // Filled FC amount
        bool isActive;
        uint256 timestamp; // Time the order was created
    }

    // --- Constants ---
    uint256 public constant PRICE_PRECISION = 1e6; // For storing price as integer, e.g., 1.2 CFX is stored as 1200000
    uint256 public constant MIN_FC_AMOUNT = 10 * 1e18; // Minimum order size: 10 FC

    // --- State Variables ---
    IERC20Upgradeable public fcToken;

    mapping(uint256 => Order) public orders;
    uint256 public orderIdCounter;

    uint256[] public buyOrderIds;
    uint256[] public sellOrderIds;
    mapping(address => uint256[]) public userOrders;

    uint256 public feeBps;
    uint256 public accumulatedCfxFees;
    uint256 public accumulatedFcFees;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _fcTokenAddress, address initialOwner) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        _transferOwnership(initialOwner);
        
        require(_fcTokenAddress != address(0), "OrderBook: Invalid FC token address");
        fcToken = IERC20Upgradeable(_fcTokenAddress);
        
        feeBps = 30; // Default fee 0.3%
        orderIdCounter = 1; // Start IDs from 1
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // --- Order Creation ---
    
    function createBuyOrder(uint256 _fcAmount, uint256 _price) external payable {
        require(_fcAmount >= MIN_FC_AMOUNT, "OrderBook: FC amount is below minimum");
        require(_price > 0, "OrderBook: Price must be positive");

        uint256 cfxToLock = (_fcAmount * _price) / PRICE_PRECISION;
        require(msg.value == cfxToLock, "OrderBook: Incorrect CFX amount sent");

        uint256 newOrderId = orderIdCounter++;

        orders[newOrderId] = Order({
            id: newOrderId,
            owner: msg.sender,
            isBuyOrder: true,
            price: _price,
            fcAmountTotal: _fcAmount,
            filledFcAmount: 0,
            isActive: true,
            timestamp: block.timestamp
        });

        buyOrderIds.push(newOrderId);
        userOrders[msg.sender].push(newOrderId);
        emit OrderCreated(newOrderId, msg.sender, true, _fcAmount, _price);
    }

    function createSellOrder(uint256 _fcAmount, uint256 _price) external {
        require(_fcAmount >= MIN_FC_AMOUNT, "OrderBook: FC amount is below minimum");
        require(_price > 0, "OrderBook: Price must be positive");

        uint256 newOrderId = orderIdCounter++;

        orders[newOrderId] = Order({
            id: newOrderId,
            owner: msg.sender,
            isBuyOrder: false,
            price: _price,
            fcAmountTotal: _fcAmount,
            filledFcAmount: 0,
            isActive: true,
            timestamp: block.timestamp
        });

        fcToken.safeTransferFrom(msg.sender, address(this), _fcAmount);
        
        sellOrderIds.push(newOrderId);
        userOrders[msg.sender].push(newOrderId);
        emit OrderCreated(newOrderId, msg.sender, false, _fcAmount, _price);
    }

    // --- Order Filling ---

    function fillSellOrder(uint256 _orderId, uint256 _fcAmountToBuy) external payable {
        Order storage order = orders[_orderId];
        require(order.isActive, "OrderBook: Order is not active");
        require(!order.isBuyOrder, "OrderBook: Cannot fill a buy order with this function");
        require(order.owner != msg.sender, "OrderBook: Cannot fill your own order");

        uint256 remainingFc = order.fcAmountTotal - order.filledFcAmount;
        require(_fcAmountToBuy <= remainingFc, "OrderBook: Not enough FC in order");
        require(_fcAmountToBuy > 0, "OrderBook: Amount must be positive");

        uint256 cfxToSend = (_fcAmountToBuy * order.price) / PRICE_PRECISION;
        require(msg.value >= cfxToSend, "OrderBook: Incorrect CFX amount sent");
        
        uint256 fee = (cfxToSend * feeBps) / 10000;
        accumulatedCfxFees += fee;
        
        order.filledFcAmount += _fcAmountToBuy;

        fcToken.safeTransfer(msg.sender, _fcAmountToBuy);
        payable(order.owner).transfer(cfxToSend - fee);

        if (msg.value > cfxToSend) {
            payable(msg.sender).transfer(msg.value - cfxToSend);
        }

        if (order.filledFcAmount == order.fcAmountTotal) {
            order.isActive = false;
        }
        
        emit OrderFilled(_orderId, msg.sender, _fcAmountToBuy, cfxToSend);
    }
    
    function fillBuyOrder(uint256 _orderId, uint256 _fcAmountToSell) external {
        Order storage order = orders[_orderId];
        require(order.isActive, "OrderBook: Order is not active");
        require(order.isBuyOrder, "OrderBook: Cannot fill a sell order with this function");
        require(order.owner != msg.sender, "OrderBook: Cannot fill your own order");

        uint256 remainingFc = order.fcAmountTotal - order.filledFcAmount;
        require(_fcAmountToSell <= remainingFc, "OrderBook: Exceeds order's remaining FC amount");
        require(_fcAmountToSell > 0, "OrderBook: Amount must be positive");
        
        fcToken.safeTransferFrom(msg.sender, address(this), _fcAmountToSell);

        uint256 cfxToReceive = (_fcAmountToSell * order.price) / PRICE_PRECISION;
        
        uint256 fee = (cfxToReceive * feeBps) / 10000;
        accumulatedCfxFees += fee;

        order.filledFcAmount += _fcAmountToSell;
        
        fcToken.safeTransfer(order.owner, _fcAmountToSell);
        payable(msg.sender).transfer(cfxToReceive - fee);

        if (order.filledFcAmount == order.fcAmountTotal) {
            order.isActive = false;
        }

        emit OrderFilled(_orderId, msg.sender, _fcAmountToSell, cfxToReceive);
    }

    // --- Order Sweeping ---

    /**
     * @dev Buys FC by sweeping through sell orders up to a maximum price.
     * Iterates through orders by creation time, not by best price.
     * @notice This function can be gas-intensive if the order list is long.
     * @param _maxPrice The maximum price in CFX per FC the user is willing to pay.
     * @param _maxFcToBuy The total amount of FC the user wants to buy.
     */
    function sweepSellOrders(uint256 _maxPrice, uint256 _maxFcToBuy) external payable {
        require(_maxFcToBuy > 0, "Sweep amount must be positive");
        uint256 totalFcBought = 0;
        uint256 totalCfxSpent = 0;

        for (uint i = 0; i < sellOrderIds.length; i++) {
            if (totalFcBought >= _maxFcToBuy) break;

            uint256 orderId = sellOrderIds[i];
            Order storage order = orders[orderId];

            if (!order.isActive || order.owner == msg.sender || order.price > _maxPrice) {
                continue;
            }

            uint256 fcLeftInOrder = order.fcAmountTotal - order.filledFcAmount;
            uint256 fcStillNeeded = _maxFcToBuy - totalFcBought;
            uint256 cfxLeftInWallet = msg.value - totalCfxSpent;

            uint256 fcToBuy = (fcLeftInOrder < fcStillNeeded) ? fcLeftInOrder : fcStillNeeded;
            
            uint256 cfxCostForChunk = (fcToBuy * order.price) / PRICE_PRECISION;

            if (cfxCostForChunk > cfxLeftInWallet) {
                fcToBuy = (cfxLeftInWallet * PRICE_PRECISION) / order.price;
                if(fcToBuy > fcLeftInOrder) fcToBuy = fcLeftInOrder;
                cfxCostForChunk = (fcToBuy * order.price) / PRICE_PRECISION;
            }

            if (fcToBuy == 0) continue;
            
            uint256 fee = (cfxCostForChunk * feeBps) / 10000;
            accumulatedCfxFees += fee;
            order.filledFcAmount += fcToBuy;
            
            payable(order.owner).transfer(cfxCostForChunk - fee);

            totalFcBought += fcToBuy;
            totalCfxSpent += cfxCostForChunk;
            
            if (order.filledFcAmount >= order.fcAmountTotal) {
                order.isActive = false;
            }
        }
        
        require(totalFcBought > 0, "No suitable orders to fill");

        if (totalFcBought > 0) {
            fcToken.safeTransfer(msg.sender, totalFcBought);
        }

        if (msg.value > totalCfxSpent) {
            payable(msg.sender).transfer(msg.value - totalCfxSpent);
        }
        
        emit OrderSwept(msg.sender, false, totalFcBought, totalCfxSpent);
    }
    
    /**
     * @dev Sells FC by sweeping through buy orders down to a minimum price.
     * Iterates through orders by creation time, not by best price.
     * @notice User must approve this contract to spend their FC tokens first.
     * @notice This function can be gas-intensive if the order list is long.
     * @param _minPrice The minimum price in CFX per FC the user is willing to accept.
     * @param _maxFcToSell The total amount of FC the user wants to sell.
     */
    function sweepBuyOrders(uint256 _minPrice, uint256 _maxFcToSell) external {
        require(_maxFcToSell > 0, "Sweep amount must be positive");
        
        fcToken.safeTransferFrom(msg.sender, address(this), _maxFcToSell);

        uint256 totalFcSold = 0;
        uint256 totalCfxReceived = 0;

        for (uint i = 0; i < buyOrderIds.length; i++) {
            if (totalFcSold >= _maxFcToSell) break;

            uint256 orderId = buyOrderIds[i];
            Order storage order = orders[orderId];

            if (!order.isActive || order.owner == msg.sender || order.price < _minPrice) {
                continue;
            }

            uint256 fcLeftToBuyInOrder = order.fcAmountTotal - order.filledFcAmount;
            uint256 fcLeftToSell = _maxFcToSell - totalFcSold;

            uint256 fcToSell = (fcLeftToBuyInOrder < fcLeftToSell) ? fcLeftToBuyInOrder : fcLeftToSell;

            if (fcToSell == 0) continue;

            uint256 cfxValue = (fcToSell * order.price) / PRICE_PRECISION;
            uint256 fee = (cfxValue * feeBps) / 10000;
            accumulatedCfxFees += fee;
            
            order.filledFcAmount += fcToSell;
            fcToken.safeTransfer(order.owner, fcToSell);

            totalFcSold += fcToSell;
            totalCfxReceived += (cfxValue - fee);

            if (order.filledFcAmount >= order.fcAmountTotal) {
                order.isActive = false;
            }
        }

        require(totalFcSold > 0, "No suitable orders to fill");

        if (totalCfxReceived > 0) {
            payable(msg.sender).transfer(totalCfxReceived);
        }

        uint256 fcToRefund = _maxFcToSell - totalFcSold;
        if (fcToRefund > 0) {
            fcToken.safeTransfer(msg.sender, fcToRefund);
        }
        
        emit OrderSwept(msg.sender, true, totalFcSold, totalCfxReceived);
    }

    // --- Order Cancellation ---

    function cancelOrder(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        require(order.owner == msg.sender, "OrderBook: Not your order");
        require(order.isActive, "OrderBook: Order not active");

        order.isActive = false;

        if (order.isBuyOrder) {
            uint256 remainingFc = order.fcAmountTotal - order.filledFcAmount;
            uint256 cfxToRefund = (remainingFc * order.price) / PRICE_PRECISION;
            if (cfxToRefund > 0) {
                 payable(msg.sender).transfer(cfxToRefund);
            }
        } else {
            uint256 fcToRefund = order.fcAmountTotal - order.filledFcAmount;
            if (fcToRefund > 0) {
                fcToken.safeTransfer(msg.sender, fcToRefund);
            }
        }

        emit OrderCancelled(_orderId);
    }
    
    // --- View Functions ---

    function getOrderById(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }
    
    function getOpenOrders(bool _isBuyOrder) public view returns (Order[] memory) {
        uint256[] memory idList = _isBuyOrder ? buyOrderIds : sellOrderIds;
        Order[] memory openOrders = new Order[](idList.length);
        uint counter = 0;

        for (uint i = 0; i < idList.length; i++) {
            if (orders[idList[i]].isActive) {
                openOrders[counter] = orders[idList[i]];
                counter++;
            }
        }

        Order[] memory result = new Order[](counter);
        for (uint i = 0; i < counter; i++) {
            result[i] = openOrders[i];
        }
        return result;
    }

    function getUserOpenOrders(address _user) external view returns (Order[] memory) {
        uint256[] memory idList = userOrders[_user];
        Order[] memory openOrders = new Order[](idList.length);
        uint counter = 0;

        for (uint i = 0; i < idList.length; i++) {
            if (orders[idList[i]].isActive) {
                openOrders[counter] = orders[idList[i]];
                counter++;
            }
        }
        
        Order[] memory result = new Order[](counter);
        for (uint i = 0; i < counter; i++) {
            result[i] = openOrders[i];
        }
        return result;
    }


    // --- Admin Functions ---

    function withdrawFees() external onlyOwner {
        uint256 cfxFees = accumulatedCfxFees;
        uint256 fcFees = accumulatedFcFees;
        
        accumulatedCfxFees = 0;
        accumulatedFcFees = 0;

        if (cfxFees > 0) {
            payable(owner()).transfer(cfxFees);
        }
        if (fcFees > 0) {
            fcToken.safeTransfer(owner(), fcFees);
        }
        
        emit FeesWithdrawn(owner(), cfxFees, fcFees);
    }

    function setFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 100, "OrderBook: Fee cannot exceed 1%"); // Safety cap
        feeBps = _newFeeBps;
    }
} 