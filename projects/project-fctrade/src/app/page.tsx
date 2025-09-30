'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  connectWallet,
  checkIfWalletIsConnected,
  getUserCFXBalance,
  formatTokenAmount,
  parseTokenAmount,
  formatAddress,
  listenToWalletChanges,
  removeWalletListeners,
  switchToConfiguredNetwork,
  getFCTokenContract,
  getOrderBookContract,
  getUserFCBalance,
  getOpenOrders,
  getOwner,
  withdrawFees,
  getAccumulatedCfxFees,
  transferOwnership,
  getBlockExplorerBaseUrl,
} from './utils/web3';

interface Order {
  id: number;
  user: string;
  isBuyOrder: boolean;
  price: ethers.BigNumber;
  fcAmount: ethers.BigNumber;
  filledFcAmount: ethers.BigNumber;
  timestamp: number;
}

// 定义一个常量
const MAX_APPROVE_AMOUNT = ethers.utils.parseUnits('100000000', 18);
const PRICE_DECIMALS = 6; // e.g., price 1.2 is stored as 1200000
const PRICE_BASE_BN = ethers.BigNumber.from(10).pow(PRICE_DECIMALS);
const PRICE_BASE_NUMBER = 10 ** PRICE_DECIMALS;

export default function Home() {
  const [account, setAccount] = useState<string>('');
  const [contractOwner, setContractOwner] = useState<string>('');
  
  const [userFCBalance, setUserFCBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [userCFXBalance, setUserCFXBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [accumulatedCfxFees, setAccumulatedCfxFees] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>('');
  
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | string[] >('');
  const [activeTradeOrder, setActiveTradeOrder] = useState<Order | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [marketBuyAmount, setMarketBuyAmount] = useState('');
  const [marketSellAmount, setMarketSellAmount] = useState('');

  // For market order preview
  const [marketBuyBreakdown, setMarketBuyBreakdown] = useState<{ price: ethers.BigNumber, amount: ethers.BigNumber }[]>([]);
  const [marketBuyTotalCost, setMarketBuyTotalCost] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [marketSellBreakdown, setMarketSellBreakdown] = useState<{ price: ethers.BigNumber, amount: ethers.BigNumber }[]>([]);
  const [marketSellTotalGain, setMarketSellTotalGain] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));

  const [recentTxInfo, setRecentTxInfo] = useState<null | {
    hash: string;
    type: string;
    amount: string;
    price: string;
    time: number;
  }>(null);

  const [recentTxVisible, setRecentTxVisible] = useState(false);

  const loadData = async (userAddress?: string, ownerAddress?: string) => {
    const addressToLoad = userAddress || account;
    const currentOwner = ownerAddress || contractOwner;

    try {
      // Fetch all data in parallel
      const [buy, sell] = await Promise.all([
        getOpenOrders(true),
        getOpenOrders(false),
      ]);

      if (addressToLoad) {
          const [fc, cfx] = await Promise.all([
            getUserFCBalance(addressToLoad),
            getUserCFXBalance(addressToLoad),
          ]);
          setUserFCBalance(fc);
          setUserCFXBalance(cfx);

          if (currentOwner && addressToLoad.toLowerCase() === currentOwner.toLowerCase()) {
            const feesCFX = await getAccumulatedCfxFees();
            setAccumulatedCfxFees(feesCFX);
          }
      }

      // Sort orders
      buy.sort((a: Order, b: Order) => b.price.toNumber() - a.price.toNumber());
      sell.sort((a: Order, b: Order) => a.price.toNumber() - b.price.toNumber());

      setBuyOrders(buy);
      setSellOrders(sell);
      
    } catch (error) {
      console.error("Error loading data:", error);
      setMessage('Failed to load on-chain data. Is the network correct?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const connectedAccount = await checkIfWalletIsConnected();
      const owner = await getOwner();
      if(owner) {
        setContractOwner(owner);
      }

      if (connectedAccount) {
        setAccount(connectedAccount);
        await loadData(connectedAccount, owner || undefined);
      } else {
        await loadData(undefined, owner || undefined); // Load public orders even if not connected
      }
      setLoading(false);
    };

    init();

    listenToWalletChanges(async (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await loadData(accounts[0], contractOwner);
      } else {
        setAccount('');
        setUserFCBalance(ethers.BigNumber.from(0));
        setUserCFXBalance(ethers.BigNumber.from(0));
      }
    });

    const interval = setInterval(() => {
      loadData(account, contractOwner);
    }, 15000); // Refresh every 15 seconds

    return () => {
      removeWalletListeners();
      clearInterval(interval);
    };
  }, [account, contractOwner]);

  useEffect(() => {
    if (!marketBuyAmount || isNaN(parseFloat(marketBuyAmount)) || parseFloat(marketBuyAmount) <= 0) {
      setMarketBuyBreakdown([]);
      setMarketBuyTotalCost(ethers.BigNumber.from(0));
      return;
    }

    const fcAmountToBuy = parseTokenAmount(marketBuyAmount);
    let remainingAmountToBuy = fcAmountToBuy;
    let totalCfxCost = ethers.BigNumber.from(0);
    const breakdown: { price: ethers.BigNumber, amount: ethers.BigNumber }[] = [];

    for (const order of sellOrders) {
      if (remainingAmountToBuy.lte(0)) break;
      if (account && order.user.toLowerCase() === account.toLowerCase()) continue;

      const availableAmount = order.fcAmount.sub(order.filledFcAmount);
      if (availableAmount.lte(0)) continue;

      const amountToFill = remainingAmountToBuy.gt(availableAmount) ? availableAmount : remainingAmountToBuy;
      
      if (amountToFill.gt(0)) {
        breakdown.push({ price: order.price, amount: amountToFill });
        totalCfxCost = totalCfxCost.add(amountToFill.mul(order.price).div(PRICE_BASE_BN));
      }
      
      remainingAmountToBuy = remainingAmountToBuy.sub(amountToFill);
    }
    
    setMarketBuyBreakdown(breakdown);
    setMarketBuyTotalCost(totalCfxCost);

  }, [marketBuyAmount, sellOrders, account]);

  useEffect(() => {
    if (!marketSellAmount || isNaN(parseFloat(marketSellAmount)) || parseFloat(marketSellAmount) <= 0) {
      setMarketSellBreakdown([]);
      setMarketSellTotalGain(ethers.BigNumber.from(0));
      return;
    }

    const fcAmountToSell = parseTokenAmount(marketSellAmount);
    let remainingAmountToSell = fcAmountToSell;
    let totalCfxGain = ethers.BigNumber.from(0);
    const breakdown: { price: ethers.BigNumber, amount: ethers.BigNumber }[] = [];

    for (const order of buyOrders) {
      if (remainingAmountToSell.lte(0)) break;
      if (account && order.user.toLowerCase() === account.toLowerCase()) continue;

      const availableAmount = order.fcAmount.sub(order.filledFcAmount);
      if (availableAmount.lte(0)) continue;

      const amountToFill = remainingAmountToSell.gt(availableAmount) ? availableAmount : remainingAmountToSell;
      
      if (amountToFill.gt(0)) {
        breakdown.push({ price: order.price, amount: amountToFill });
        totalCfxGain = totalCfxGain.add(amountToFill.mul(order.price).div(PRICE_BASE_BN));
      }
      
      remainingAmountToSell = remainingAmountToSell.sub(amountToFill);
    }

    setMarketSellBreakdown(breakdown);
    setMarketSellTotalGain(totalCfxGain);

  }, [marketSellAmount, buyOrders, account]);

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      await switchToConfiguredNetwork();
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      await loadData(connectedAccount, contractOwner);
      setMessage('Wallet connected successfully');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setMessage(error.reason || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFillOrder = async () => {
    if (!activeTradeOrder || !tradeAmount) {
      setMessage('Please select an order and enter an amount');
      return;
    }
    if (isNaN(parseFloat(tradeAmount))) {
      setMessage('Invalid amount');
      return;
    }
    const fcAmountToTrade = parseTokenAmount(tradeAmount);
    if(fcAmountToTrade.lte(0)) {
        setMessage('Amount must be positive');
        return;
    }
    
    try {
        setLoading(true);
        const orderBookContract = await getOrderBookContract();
        if(!orderBookContract) {
            setMessage('Contract not initialized');
            setLoading(false);
            return;
        }
        
        let tx;
        if(activeTradeOrder.isBuyOrder) {
            // User is SELLING FC to a buy order
            const fcContract = await getFCTokenContract();
            if(!fcContract) {
                setMessage('FC Token contract not initialized');
                setLoading(false);
                return;
            }
            const allowance = await fcContract.allowance(account, orderBookContract.address);
            if (allowance.lt(fcAmountToTrade)) {
                setMessage('Approving FC token...');
                const approveTx = await fcContract.approve(orderBookContract.address, MAX_APPROVE_AMOUNT);
                await approveTx.wait();
                setMessage('Approval successful, filling order...');
            }
            tx = await orderBookContract.fillBuyOrder(activeTradeOrder.id, fcAmountToTrade);
            await tx.wait();
        } else {
            // User is BUYING FC from a sell order
            const cfxAmount = fcAmountToTrade.mul(activeTradeOrder.price).div(PRICE_BASE_BN);
            tx = await orderBookContract.fillSellOrder(activeTradeOrder.id, fcAmountToTrade, { value: cfxAmount });
            await tx.wait();
        }
        const price = (activeTradeOrder.price.toNumber() / PRICE_BASE_NUMBER).toFixed(3);
        const action = activeTradeOrder.isBuyOrder ? '卖出' : '买入';
        const now = Date.now();
        setRecentTxInfo({
          hash: tx.hash,
          type: action,
          amount: tradeAmount,
          price,
          time: now,
        });
        const successMessage = [
          `Trade successful!`,
          `- ${action} ${tradeAmount} FC @ ${price} CFX`
        ];
        setMessage(successMessage);
        await loadData(account, contractOwner);
        setActiveTradeOrder(null);
        setTradeAmount('');

    } catch(error: any) {
        console.error('Failed to fill order', error);
        setMessage(error.reason || 'Failed to fill order');
    } finally {
        setLoading(false);
    }
  }

  const handleMarketBuy = async () => {
    if (!marketBuyAmount) return;
    if (isNaN(parseFloat(marketBuyAmount))) {
      setMessage('Invalid amount');
      return;
    }

    const fcAmountToBuy = parseTokenAmount(marketBuyAmount);
    if (fcAmountToBuy.lte(0)) {
        setMessage("Amount must be positive.");
        return;
    }

    setLoading(true);
    setMessage("Preparing market buy...");

    try {
        let remainingAmountToBuy = fcAmountToBuy;
        let totalCfxCost = ethers.BigNumber.from(0);
        let maxPriceForFill = ethers.BigNumber.from(0);
        const filledBreakdown: { price: ethers.BigNumber, amount: ethers.BigNumber }[] = [];

        for (const order of sellOrders) {
            if (remainingAmountToBuy.lte(0)) break;
            if (account && order.user.toLowerCase() === account.toLowerCase()) continue;

            const availableAmount = order.fcAmount.sub(order.filledFcAmount);
            if (availableAmount.lte(0)) continue;

            const amountToFill = remainingAmountToBuy.gt(availableAmount) ? availableAmount : remainingAmountToBuy;
            
            if (amountToFill.gt(0)) {
              filledBreakdown.push({ price: order.price, amount: amountToFill });
            }
            
            totalCfxCost = totalCfxCost.add(amountToFill.mul(order.price).div(PRICE_BASE_BN));
            remainingAmountToBuy = remainingAmountToBuy.sub(amountToFill);

            if (amountToFill.gt(0)) {
                maxPriceForFill = order.price;
            }
        }

        if (remainingAmountToBuy.gt(0)) {
            setMessage("Not enough liquidity to fill the order.");
            setLoading(false);
            return;
        }

        // Add a 1% slippage tolerance to the total cost to prevent reverts due to rounding issues.
        const finalCfxCost = totalCfxCost.mul(100).div(100);

        const orderBookContract = await getOrderBookContract();
        if (!orderBookContract) {
            setMessage("Contract not found");
            setLoading(false);
            return;
        }

        setMessage(`Executing market buy for ${marketBuyAmount} FC...`);
        const tx = await orderBookContract.sweepSellOrders(maxPriceForFill, fcAmountToBuy, { value: finalCfxCost.toHexString() });
        await tx.wait();

        const totalFilledAmount = filledBreakdown.reduce((acc, fill) => acc.add(fill.amount), ethers.BigNumber.from(0));
        const avgPrice = totalCfxCost.mul(PRICE_BASE_BN).div(totalFilledAmount);

        const successMessage = ["Market buy successful!"];
        const summaryMessage = `Total: ${parseFloat(formatTokenAmount(totalFilledAmount)).toFixed(3)} FC @ avg price of ~${(avgPrice.toNumber() / PRICE_BASE_NUMBER).toFixed(3)} CFX`;
        const breakdownMessage = filledBreakdown.map(fill =>
          `- Bought ${parseFloat(formatTokenAmount(fill.amount)).toFixed(3)} FC @ ${(fill.price.toNumber() / PRICE_BASE_NUMBER).toFixed(3)} CFX`
        );
        setMessage([...successMessage, summaryMessage, "--- Breakdown ---", ...breakdownMessage]);
        
        setMarketBuyAmount('');
        await loadData(account, contractOwner);

        setRecentTxInfo({
          hash: tx.hash,
          type: '市价买入',
          amount: marketBuyAmount,
          price: (avgPrice.toNumber() / PRICE_BASE_NUMBER).toFixed(3),
          time: Date.now(),
        });

    } catch (error: any) {
        console.error("Market buy failed:", error);
        setMessage(error.reason || "Market buy failed.");
    } finally {
        setLoading(false);
    }
  };

  const handleMarketSell = async () => {
    if (!marketSellAmount) return;
    if (isNaN(parseFloat(marketSellAmount))) {
      setMessage('Invalid amount');
      return;
    }

    const fcAmountToSell = parseTokenAmount(marketSellAmount);
    if (fcAmountToSell.lte(0)) {
        setMessage("Amount must be positive.");
        return;
    }

    setLoading(true);
    setMessage("Preparing market sell...");

    try {
        let remainingAmountToSell = fcAmountToSell;
        let minPriceForFill = ethers.constants.MaxUint256;
        const filledBreakdown: { price: ethers.BigNumber, amount: ethers.BigNumber }[] = [];
        let totalCfxGain = ethers.BigNumber.from(0);

        for (const order of buyOrders) {
            if (remainingAmountToSell.lte(0)) break;
            if (account && order.user.toLowerCase() === account.toLowerCase()) continue;

            const availableAmount = order.fcAmount.sub(order.filledFcAmount);
            if (availableAmount.lte(0)) continue;

            const amountToFill = remainingAmountToSell.gt(availableAmount) ? availableAmount : remainingAmountToSell;
            
            if (amountToFill.gt(0)) {
              filledBreakdown.push({ price: order.price, amount: amountToFill });
              totalCfxGain = totalCfxGain.add(amountToFill.mul(order.price).div(PRICE_BASE_BN));
            }
            
            remainingAmountToSell = remainingAmountToSell.sub(amountToFill);

            if (amountToFill.gt(0)) {
                minPriceForFill = order.price;
            }
        }

        if (remainingAmountToSell.gt(0)) {
            setMessage("Not enough liquidity to fill the order.");
            setLoading(false);
            return;
        }
        
        const orderBookContract = await getOrderBookContract();
        const fcContract = await getFCTokenContract();
        if (!orderBookContract || !fcContract) {
            setMessage("Contract not found");
            setLoading(false);
            return;
        }

        const allowance = await fcContract.allowance(account, orderBookContract.address);
        if (allowance.lt(fcAmountToSell)) {
            setMessage('Approving FC token for market sell...');
            const approveTx = await fcContract.approve(orderBookContract.address, MAX_APPROVE_AMOUNT);
            await approveTx.wait();
            setMessage('Approval successful, executing sell...');
        }
        
        setMessage(`Executing market sell for ${marketSellAmount} FC...`);
        const tx = await orderBookContract.sweepBuyOrders(minPriceForFill, fcAmountToSell);
        await tx.wait();

        const totalFilledAmount_sell = filledBreakdown.reduce((acc, fill) => acc.add(fill.amount), ethers.BigNumber.from(0));
        const avgPrice_sell = totalCfxGain.mul(PRICE_BASE_BN).div(totalFilledAmount_sell);
        
        const successMessage_sell = ["Market sell successful!"];
        const summaryMessage_sell = `Total: ${parseFloat(formatTokenAmount(totalFilledAmount_sell)).toFixed(3)} FC @ avg price of ~${(avgPrice_sell.toNumber() / PRICE_BASE_NUMBER).toFixed(3)} CFX`;
        const breakdownMessage_sell = filledBreakdown.map(fill =>
          `- Sold ${parseFloat(formatTokenAmount(fill.amount)).toFixed(3)} FC @ ${(fill.price.toNumber() / PRICE_BASE_NUMBER).toFixed(3)} CFX`
        );
        setMessage([...successMessage_sell, summaryMessage_sell, "--- Breakdown ---", ...breakdownMessage_sell]);

        setMarketSellAmount('');
        await loadData(account, contractOwner);

        setRecentTxInfo({
          hash: tx.hash,
          type: '市价卖出',
          amount: marketSellAmount,
          price: (avgPrice_sell.toNumber() / PRICE_BASE_NUMBER).toFixed(3),
          time: Date.now(),
        });

    } catch (error: any) {
        console.error("Market sell failed:", error);
        setMessage(error.reason || "Market sell failed.");
    } finally {
        setLoading(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!newOwnerAddress || !ethers.utils.isAddress(newOwnerAddress)) {
      setMessage("Please enter a valid Ethereum address.");
      return;
    }
    setLoading(true);
    setMessage(`Transferring ownership to ${newOwnerAddress}...`);
    try {
      await transferOwnership(newOwnerAddress);
      setMessage(`Ownership successfully transferred to ${newOwnerAddress}. You might need to refresh the page to see the changes.`);
      setNewOwnerAddress('');
      // After transferring, the current user might no longer be the owner.
      // We refetch the owner and all data.
      const newOwner = await getOwner();
      if(newOwner) {
        setContractOwner(newOwner);
      }
      await loadData(account, newOwner || undefined);

    } catch (error: any) {
      console.error('Failed to transfer ownership:', error);
      setMessage(error.reason || 'Failed to transfer ownership.');
    } finally {
      setLoading(false);
    }
  }

  const handleWithdrawFees = async () => {
    setLoading(true);
    setMessage('Withdrawing fees...');
    try {
      await withdrawFees();
      setMessage('Fees withdrawn successfully!');
      // Refresh fee data after withdrawal
      const feesCFX = await getAccumulatedCfxFees();
      setAccumulatedCfxFees(feesCFX);
    } catch (error: any) {
      console.error('Failed to withdraw fees:', error);
      setMessage(error.reason || 'Failed to withdraw fees.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (recentTxInfo) setRecentTxVisible(true);
  }, [recentTxInfo]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
       

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {!account ? (
            <button
              onClick={handleConnectWallet}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Address:</p>
                <p className="text-gray-800 text-lg font-mono">{formatAddress(account)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">FC Balance: <span className="font-semibold text-gray-800">{parseFloat(formatTokenAmount(userFCBalance)).toFixed(2)}</span></p>
                <p className="text-sm text-gray-600">CFX Balance: <span className="font-semibold text-gray-800">{parseFloat(formatTokenAmount(userCFXBalance)).toFixed(2)}</span></p>
              </div>
            </div>
          )}
        </div>

        {account && account.toLowerCase() === contractOwner.toLowerCase() && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Admin Zone</h2>
            <div className="space-y-3 mb-4">
              <p className="text-sm text-gray-600">Collected Fees (CFX): <span className="font-semibold text-gray-800">{parseFloat(formatTokenAmount(accumulatedCfxFees)).toFixed(4)}</span></p>
            </div>
            <button
              onClick={handleWithdrawFees}
              disabled={loading || accumulatedCfxFees.isZero()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Withdraw Fees'}
            </button>
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Transfer Ownership</h3>
              <div className="flex items-center gap-4">
                <input 
                  type="text"
                  value={newOwnerAddress}
                  onChange={(e) => setNewOwnerAddress(e.target.value)}
                  placeholder="New owner address"
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                />
                <button
                  onClick={handleTransferOwnership}
                  disabled={loading || !newOwnerAddress}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Transferring...' : 'Transfer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main trading interface */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Order Book</h2>
          <p className="text-sm text-gray-600">Click on an individual order to fill it at a specific, fixed price.</p>
        </div>
        <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 font-mono max-w-2xl mx-auto">
          {(() => {
            const allTotals = [...buyOrders, ...sellOrders].map(o => {
                const remainingFc = o.fcAmount.sub(o.filledFcAmount);
                return remainingFc.mul(o.price).div(PRICE_BASE_BN);
            });
        
            let maxTotal = ethers.BigNumber.from(0);
            allTotals.forEach(total => {
                if (total.gt(maxTotal)) {
                    maxTotal = total;
                }
            });

            const spread = (sellOrders.length > 0 && buyOrders.length > 0)
                ? sellOrders[0].price.sub(buyOrders[0].price)
                : ethers.BigNumber.from(0);
            const lastPrice = sellOrders.length > 0 ? sellOrders[0].price : (buyOrders.length > 0 ? buyOrders[0].price : ethers.BigNumber.from(0));
            
            const OrderRow = ({ order, isBuy }: { order: Order, isBuy: boolean }) => {
              const remainingFc = order.fcAmount.sub(order.filledFcAmount);
              if (remainingFc.isZero()) return null;

              const totalCfx = remainingFc.mul(order.price).div(PRICE_BASE_BN);
              const price = (order.price.toNumber() / PRICE_BASE_NUMBER).toFixed(3);
              const depth = maxTotal.isZero() ? 0 : totalCfx.mul(100).div(maxTotal).toNumber();
              
              const isClickable = account && order.user.toLowerCase() !== account.toLowerCase();

              return (
                <div 
                  className={`relative flex justify-between items-center text-sm p-1 ${isClickable ? 'cursor-pointer hover:bg-gray-700' : 'cursor-not-allowed'}`}
                  onClick={() => {
                    if (isClickable) {
                      setActiveTradeOrder(order);
                    } else if (account && order.user.toLowerCase() === account.toLowerCase()) {
                      setMessage("You cannot trade your own order.");
                    }
                  }}
                >
                  <div 
                    className={`absolute top-0 bottom-0 right-0 ${isBuy ? 'bg-green-600' : 'bg-red-600'} opacity-20`}
                    style={{ width: `${depth}%` }}
                  ></div>
                  <div className={`w-1/3 z-10 ${isBuy ? 'text-green-400' : 'text-red-400'}`}>{price}</div>
                  <div className="w-1/3 text-right z-10">{parseFloat(formatTokenAmount(remainingFc)).toFixed(3)}</div>
                  <div className="w-1/3 text-right z-10">{parseFloat(formatTokenAmount(totalCfx)).toFixed(3)}</div>
                </div>
              );
            };

            return (
              <>
                <div className="flex justify-between text-xs text-gray-400 mb-2 px-1">
                  <span className="w-1/3">Price (CFX)</span>
                  <span className="w-1/3 text-right">Amount (FC)</span>
                  <span className="w-1/3 text-right">Total (CFX)</span>
                </div>
                
                <div className="sell-orders space-y-px">
                  {sellOrders.slice(0, 15).reverse().map(order => (
                    <OrderRow key={`sell-${order.id}`} order={order} isBuy={false} />
                  ))}
                </div>

                <div className="py-2 my-1 text-center border-t border-b border-gray-700">
                    <p className={`text-xl font-bold ${spread.gte(0) ? 'text-green-400' : 'text-red-400'}`}>
                        {(lastPrice.toNumber() / PRICE_BASE_NUMBER).toFixed(3)}
                    </p>
                </div>
                
                <div className="buy-orders space-y-px">
                  {buyOrders.slice(0, 15).map(order => (
                    <OrderRow key={`buy-${order.id}`} order={order} isBuy={true} />
                  ))}
                </div>
              </>
            );
          })()}
        </div>
        
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Market Trade</h2>
          <p className="text-sm text-gray-500 mb-4">
            Instantly buy or sell at the best available prices. Your order will be filled by one or more orders from the order book.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Market Buy */}
            <div>
              <div className="relative">
                <input 
                  type="number"
                  value={marketBuyAmount}
                  onChange={(e) => setMarketBuyAmount(e.target.value)}
                  placeholder="Amount of FC to buy"
                  className="w-full p-2 border rounded-md text-blue-600 placeholder-blue-400"
                  disabled={!account || loading}
                />
              </div>
              {marketBuyBreakdown.length > 0 && (
                <div className="mt-2 text-xs text-gray-600 space-y-1 p-2 border rounded-md">
                  <p className="font-semibold">Estimated fill:</p>
                  {marketBuyBreakdown.map((fill, index) => (
                    <p key={index}>- {parseFloat(formatTokenAmount(fill.amount)).toFixed(3)} FC @ {(fill.price.toNumber() / PRICE_BASE_NUMBER).toFixed(3)} CFX</p>
                  ))}
                  <p className="font-bold pt-1">Total Cost: ~{parseFloat(formatTokenAmount(marketBuyTotalCost)).toFixed(3)} CFX</p>
                </div>
              )}
              <button 
                onClick={handleMarketBuy}
                disabled={!account || loading || !marketBuyAmount}
                className="w-full mt-2 bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                Market Buy FC
              </button>
            </div>

            {/* Market Sell */}
            <div>
              <div className="relative">
                <input 
                  type="number"
                  value={marketSellAmount}
                  onChange={(e) => setMarketSellAmount(e.target.value)}
                  placeholder="Amount of FC to sell"
                  className="w-full p-2 border rounded-md text-blue-600 placeholder-blue-400"
                  disabled={!account || loading}
                />
              </div>
              {marketSellBreakdown.length > 0 && (
                <div className="mt-2 text-xs text-gray-600 space-y-1 p-2 border rounded-md">
                  <p className="font-semibold">Estimated fill:</p>
                  {marketSellBreakdown.map((fill, index) => (
                    <p key={index}>- {parseFloat(formatTokenAmount(fill.amount)).toFixed(3)} FC @ {(fill.price.toNumber() / PRICE_BASE_NUMBER).toFixed(3)} CFX</p>
                  ))}
                  <p className="font-bold pt-1">Total Gain: ~{parseFloat(formatTokenAmount(marketSellTotalGain)).toFixed(3)} CFX</p>
                </div>
              )}
              <button 
                onClick={handleMarketSell}
                disabled={!account || loading || !marketSellAmount}
                className="w-full mt-2 bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Market Sell FC
              </button>
            </div>
          </div>
        </div>

        {/* Trade Modal */}
        {activeTradeOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-gray-800">
                    <h3 className="text-xl font-bold mb-1">
                        {activeTradeOrder.isBuyOrder ? `卖出 FC` : `买入 FC`}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">You are filling an existing order at a fixed price.</p>
                    <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-500">价格</label>
                          <div className="bg-gray-100 p-2 rounded-md text-right font-mono">
                            {(activeTradeOrder.price.toNumber() / PRICE_BASE_NUMBER).toFixed(3)} CFX
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-500">数量 (FC)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={tradeAmount}
                              onChange={(e) => setTradeAmount(e.target.value)}
                              placeholder={`最大可交易: ${formatTokenAmount(activeTradeOrder.fcAmount.sub(activeTradeOrder.filledFcAmount))}`}
                              className="w-full p-2 border rounded-md text-blue-600 placeholder-blue-400"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between -mx-1">
                            {[25, 50, 75, 100].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => {
                                      const available = activeTradeOrder.fcAmount.sub(activeTradeOrder.filledFcAmount);
                                      const amountToSet = available.mul(p).div(100);
                                      setTradeAmount(formatTokenAmount(amountToSet));
                                    }}
                                    className="flex-1 mx-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 rounded"
                                >
                                    {p}%
                                </button>
                            ))}
                        </div>

                        <div className="text-sm text-gray-600 pt-2">
                          <p>成交额: <span className="font-mono">{((parseFloat(tradeAmount) || 0) * (activeTradeOrder.price.toNumber() / PRICE_BASE_NUMBER)).toFixed(3)} CFX</span></p>
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                            <button onClick={() => setActiveTradeOrder(null)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">取消</button>
                            <button 
                              onClick={handleFillOrder} 
                              disabled={loading || !tradeAmount || parseFloat(tradeAmount) <= 0} 
                              className={`px-4 py-2 rounded-md text-white font-semibold disabled:opacity-50 ${activeTradeOrder.isBuyOrder ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                              {loading ? '处理中...' : (activeTradeOrder.isBuyOrder ? '卖出 FC' : '买入 FC')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Message Toast */}
        {message && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              <div className="space-y-1">
                {message.map((line, index) => <p key={index} className="text-left">{line}</p>)}
              </div>
            )}
          </div>
        )}

        {/* 页面底部展示最近交易信息 */}
        {recentTxInfo && recentTxVisible && (
          <div
            className="fixed left-0 right-0 bottom-0 text-sm text-gray-600 cursor-pointer"
            onClick={() => setRecentTxVisible(false)}
            title="点击关闭"
          >
            <div className="flex-1 space-x-4">
              <span className="font-bold">最近交易：</span>
              <span>{recentTxInfo.type}</span>
              <span>{recentTxInfo.amount} FC</span>
              <span>@ {recentTxInfo.price} CFX</span>
              <span>{new Date(recentTxInfo.time).toLocaleString()}</span>
            </div>
            <div className="flex-1 text-right">
              <a
                href={`${getBlockExplorerBaseUrl()}/tx/${recentTxInfo.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all"
                onClick={e => e.stopPropagation()}
              >
                查看交易哈希
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 