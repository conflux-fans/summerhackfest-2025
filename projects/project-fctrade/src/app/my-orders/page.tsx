'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  connectWallet,
  checkIfWalletIsConnected,
  getUserCFXBalance,
  formatTokenAmount,
  parseTokenAmount,
  listenToWalletChanges,
  removeWalletListeners,
  switchToConfiguredNetwork,
  getFCTokenContract,
  getOrderBookContract,
  getUserFCBalance,
  getMyOpenOrders,
  getOpenOrders,
} from '../utils/web3';
import Link from 'next/link';

interface Order {
  id: number;
  user: string;
  isBuyOrder: boolean;
  price: ethers.BigNumber;
  fcAmount: ethers.BigNumber;
  filledFcAmount: ethers.BigNumber;
  timestamp: number;
}

const MIN_ORDER_AMOUNT_FC = 10;
const MAX_APPROVE_AMOUNT = ethers.utils.parseUnits('100000000', 18);
const PRICE_DECIMALS = 6;
const PRICE_BASE = 10 ** PRICE_DECIMALS;

export default function MyOrdersPage() {
  const [account, setAccount] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);
  
  const [userFCBalance, setUserFCBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [userCFXBalance, setUserCFXBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  
  const [myOpenOrders, setMyOpenOrders] = useState<Order[]>([]);
  
  const [buyAmount, setBuyAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [sellPrice, setSellPrice] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async (userAddress?: string) => {
    const addressToLoad = userAddress || account;
    if (!addressToLoad) return;

    try {
      setLoading(true);
      const contract = await getOrderBookContract();
      let owner = '';
      if (contract) {
        owner = await contract.owner();
      }
      const amIOwner = owner.toLowerCase() === addressToLoad.toLowerCase();
      setIsOwner(amIOwner);

      let ordersToSet: Order[] = [];
      if (amIOwner) {
        const [buyOrders, sellOrders] = await Promise.all([
          getOpenOrders(true),
          getOpenOrders(false),
        ]);
        ordersToSet = [...buyOrders, ...sellOrders].sort((a, b) => b.timestamp - a.timestamp);
      } else {
        ordersToSet = await getMyOpenOrders(addressToLoad);
      }
      
      const [fc, cfx] = await Promise.all([
        getUserFCBalance(addressToLoad),
        getUserCFXBalance(addressToLoad),
      ]);
      
      setMyOpenOrders(ordersToSet);
      setUserFCBalance(fc);
      setUserCFXBalance(cfx);
      
    } catch (error) {
      console.error("Error loading data:", error);
      setMessage('Failed to load on-chain data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const connectedAccount = await checkIfWalletIsConnected();
      if (connectedAccount) {
        setAccount(connectedAccount);
        await loadData(connectedAccount);
      }
      setLoading(false);
    };

    init();

    listenToWalletChanges(async (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await loadData(accounts[0]);
      } else {
        setAccount('');
        setIsOwner(false);
        setUserFCBalance(ethers.BigNumber.from(0));
        setUserCFXBalance(ethers.BigNumber.from(0));
        setMyOpenOrders([]);
      }
    });

    const interval = setInterval(() => {
      if(account) {
        loadData(account);
      }
    }, 15000);

    return () => {
      removeWalletListeners();
      clearInterval(interval);
    };
  }, [account]);

  const handleCreateOrder = async (isBuyOrder: boolean) => {
    const amountStr = isBuyOrder ? buyAmount : sellAmount;
    const priceStr = isBuyOrder ? buyPrice : sellPrice;

    if (!amountStr || !priceStr) {
      setMessage('Please enter amount and price');
      return;
    }
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < MIN_ORDER_AMOUNT_FC) {
      setMessage(`Minimum order amount is ${MIN_ORDER_AMOUNT_FC} FC`);
      return;
    }

    try {
      setLoading(true);
      const orderBookContract = await getOrderBookContract();
      if (!orderBookContract) {
        setMessage('Contract not initialized');
        setLoading(false);
        return;
      }
      
      const fcAmount = parseTokenAmount(amountStr);
      const price = ethers.BigNumber.from(Math.floor(parseFloat(priceStr) * PRICE_BASE));
      
      if (isBuyOrder) {
        const cfxAmount = fcAmount.mul(price).div(PRICE_BASE);
        const tx = await orderBookContract.createBuyOrder(fcAmount, price, { value: cfxAmount });
        await tx.wait();
        setMessage('Buy order created successfully');
      } else {
        const fcContract = await getFCTokenContract();
        if(!fcContract) {
          setMessage('FC Token contract not initialized');
          setLoading(false);
          return;
        }
        const allowance = await fcContract.allowance(account, orderBookContract.address);
        if (allowance.lt(fcAmount)) {
          setMessage('Approving FC token...');
          const approveTx = await fcContract.approve(orderBookContract.address, MAX_APPROVE_AMOUNT);
          await approveTx.wait();
          setMessage('Approval successful, creating order...');
        }
        const tx = await orderBookContract.createSellOrder(fcAmount, price);
        await tx.wait();
        setMessage('Sell order created successfully');
      }

      await loadData(account);
      setBuyAmount('');
      setBuyPrice('');
      setSellAmount('');
      setSellPrice('');
    } catch (error: any) {
      console.error('Error creating order:', error);
      setMessage(error.reason || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const orderBookContract = await getOrderBookContract();
      if (!orderBookContract) {
        setMessage('Contract not initialized');
        setLoading(false);
        return;
      }
      const tx = await orderBookContract.cancelOrder(orderId);
      await tx.wait();
      setMessage(`Order ${orderId} cancelled`);
      await loadData(account);
    } catch (error: any) {
      console.error(`Error cancelling order ${orderId}:`, error);
      setMessage(error.reason || 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main trading interface */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* BUY side */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Create a Buy Order</h2>
            {account && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="Price in CFX" className="w-full p-2 border rounded-md text-blue-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input type="number" value={buyAmount} onChange={e => setBuyAmount(e.target.value)} placeholder={`Amount of FC (Min ${MIN_ORDER_AMOUNT_FC})`} className="w-full p-2 border rounded-md text-blue-600" />
                  </div>
                  {buyAmount && buyPrice && <div className="text-sm text-gray-700">Total: {parseFloat(buyAmount) * parseFloat(buyPrice)} CFX</div>}
                  <button onClick={() => handleCreateOrder(true)} disabled={loading || !buyAmount || !buyPrice} className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 disabled:opacity-50">Place Buy Order</button>
                </div>
              </div>
            )}
          </div>
          
          {/* SELL side */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Create a Sell Order</h2>
            {account && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="Price in CFX" className="w-full p-2 border rounded-md text-blue-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input type="number" value={sellAmount} onChange={e => setSellAmount(e.target.value)} placeholder={`Amount of FC (Min ${MIN_ORDER_AMOUNT_FC})`} className="w-full p-2 border rounded-md text-blue-600" />
                  </div>
                  {sellAmount && sellPrice && <div className="text-sm text-gray-700">Total: {parseFloat(sellAmount) * parseFloat(sellPrice)} CFX</div>}
                  <button onClick={() => handleCreateOrder(false)} disabled={loading || !sellAmount || !sellPrice} className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700 disabled:opacity-50">Place Sell Order</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* My Open Orders */}
        {account && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">{isOwner ? 'All Open Orders' : 'My Open Orders'}</h2>
            {myOpenOrders.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                        <th className="px-3 py-2 text-left">ID</th>
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Price (CFX)</th>
                        <th className="px-3 py-2 text-left">Amount (FC)</th>
                        <th className="px-3 py-2 text-left">Filled</th>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myOpenOrders.map(order => (
                        <tr key={order.id} className="border-b">
                            <td className="px-3 py-2  text-gray-800">{order.id}</td>
                            <td className={`px-3 py-2 font-semibold ${order.isBuyOrder ? 'text-green-600' : 'text-red-600'}`}>
                            {order.isBuyOrder ? 'BUY' : 'SELL'}
                            </td>
                            <td className="px-3 py-2 text-gray-800">{(order.price.toNumber() / PRICE_BASE).toFixed(PRICE_DECIMALS - 2)}</td>
                            <td className="px-3 py-2  text-gray-800">{formatTokenAmount(order.fcAmount)}</td>
                            <td className="px-3 py-2  text-gray-800">
                            {order.fcAmount.isZero() ? '0.00' : (order.filledFcAmount.mul(10000).div(order.fcAmount).toNumber() / 100).toFixed(2)}%
                            </td>
                            <td className="px-3 py-2  text-gray-800">{new Date(order.timestamp * 1000).toLocaleDateString()}</td>
                            <td className="px-3 py-2  text-gray-800">
                            <button 
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={loading}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500">You have no open orders.</p>
            )}
          </div>
        )}
        
        {message && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
} 