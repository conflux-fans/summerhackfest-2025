'use client';

import { useState, useEffect } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { useContracts } from '@/hooks/useContracts';
import { useGameStateContext } from '@/contexts/GameStateContext';
import { useToast } from '@/contexts/ToastContext';

interface P2ERewardsProps {
  className?: string;
}

export default function P2ERewards({ className = '' }: P2ERewardsProps) {
  const { isConnected, address } = useWalletContext();
  const { exchangeStardustForCFX, getExchangeInfo, isLoading: contractLoading } = useContracts();
  const gameState = useGameStateContext();
  const { stardust, incrementStardust } = gameState;
  const { showToast } = useToast();

  const [exchangeInfo, setExchangeInfo] = useState<any>(null);
  const [stardustToExchange, setStardustToExchange] = useState('');
  const [isExchanging, setIsExchanging] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [blockchainStardust, setBlockchainStardust] = useState<bigint>(BigInt(0));

  // Load exchange info
  useEffect(() => {
    if (!isConnected || !address) return;

    const loadExchangeInfo = async () => {
      try {
        const info = await getExchangeInfo();
        setExchangeInfo(info);
        
        // Also get blockchain stardust balance
        if (info && info.playerStardust !== undefined) {
          setBlockchainStardust(BigInt(info.playerStardust.toString()));
        }
      } catch (error) {
        console.error('Error loading exchange info:', error);
      }
    };

    loadExchangeInfo();
    
    // Set up interval to refresh blockchain stardust every 10 seconds
    const interval = setInterval(loadExchangeInfo, 10000);
    return () => clearInterval(interval);
  }, [isConnected, address, getExchangeInfo]);

  // Calculate CFX reward for given Stardust amount
  const calculateCFXReward = (stardustAmount: string): string => {
    if (!stardustAmount || isNaN(Number(stardustAmount)) || !exchangeInfo) return '0';
    const cfxAmount = Number(stardustAmount) / Number(exchangeInfo.rate);
    return cfxAmount.toFixed(6);
  };

  // Show info modal before exchange
  const handleExchangeClick = () => {
    setShowInfoModal(true);
  };

  // Handle Stardust to CFX exchange
  const handleExchange = async () => {
    if (!stardustToExchange || isExchanging) return;

    const stardustAmount = Number(stardustToExchange);
    const minimumStardust = 10000; // Minimum exchange amount

    if (stardustAmount < minimumStardust) {
      showToast('warning', 'Minimum Amount Required', `You need at least ${minimumStardust.toLocaleString()} ✨ to exchange`);
      return;
    }

    // Check blockchain stardust balance instead of local
    if (BigInt(stardustAmount) > blockchainStardust) {
      showToast('error', 'Insufficient Blockchain Balance', 'You need to save your game state to blockchain first!');
      return;
    }

    const cfxReward = calculateCFXReward(stardustToExchange);
    
    if (!exchangeInfo) {
      showToast('error', 'Exchange Unavailable', 'Exchange information not loaded. Please try again.');
      return;
    }

    const remainingDaily = Number(exchangeInfo.remainingDaily) / 1e18;
    
    if (Number(cfxReward) > remainingDaily) {
      showToast('warning', 'Daily Limit Exceeded', `You can claim up to ${remainingDaily.toFixed(6)} CFX today`);
      return;
    }

    setIsExchanging(true);
    setShowInfoModal(false);
    
    try {
      const txHash = await exchangeStardustForCFX(stardustAmount.toString());
      
      // Update local game state by reducing stardust
      incrementStardust(-BigInt(stardustAmount));
      
      // Immediately update blockchain stardust to reflect the exchange
      setBlockchainStardust(prev => prev - BigInt(stardustAmount));
      
      // Refresh exchange info
      const info = await getExchangeInfo();
      setExchangeInfo(info);
      if (info && info.playerStardust !== undefined) {
        setBlockchainStardust(BigInt(info.playerStardust.toString()));
      }
      setStardustToExchange('');

      showToast('success', 'Exchange Successful!', `Exchanged ${stardustAmount.toLocaleString()} ✨ for ${cfxReward} CFX`);
    } catch (error: any) {
      console.error('Exchange failed:', error);
      showToast('error', 'Exchange Failed', error.message || 'Unknown error occurred');
    } finally {
      setIsExchanging(false);
    }
  };

  if (!isConnected) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 ${className}`}>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-4">🎁 Play-to-Earn Rewards</h3>
          <p className="text-slate-400 mb-4">Connect your wallet to access P2E features</p>
          <div className="text-sm text-slate-500">
            Exchange your Stardust for real CFX rewards!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">🎁</span>
        Play-to-Earn Rewards
      </h3>

      {/* P2E Stats */}
      {exchangeInfo && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400">Reward Pool</div>
            <div className="text-lg font-bold text-blue-400">
              {(Number(exchangeInfo.poolBalance) / 1e18).toFixed(2)} CFX
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400">Daily Limit</div>
            <div className="text-lg font-bold text-green-400">
              {(Number(exchangeInfo.dailyLimit) / 1e18).toFixed(2)} CFX
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400">Remaining Today</div>
            <div className="text-lg font-bold text-yellow-400">
              {(Number(exchangeInfo.remainingDaily) / 1e18).toFixed(6)} CFX
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm text-slate-400">Exchange Rate</div>
            <div className="text-lg font-bold text-purple-400">
              {Number(exchangeInfo.rate).toLocaleString()} ✨ = 1 CFX
            </div>
          </div>
        </div>
      )}

      {/* Exchange Interface */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Stardust to Exchange (Min: 10,000 ✨)
          </label>
          <div className="relative">
            <input
              type="number"
              value={stardustToExchange}
              onChange={(e) => setStardustToExchange(e.target.value)}
              placeholder={`Enter amount (you have ${stardust.toLocaleString()} ✨)`}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              min="10000"
              max={Number(stardust)}
            />
            <button
              onClick={() => setStardustToExchange('10000')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white transition-colors"
            >
              Min
            </button>
          </div>
        </div>

        {stardustToExchange && exchangeInfo && (
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">You will receive:</span>
              <span className="text-xl font-bold text-green-400">
                {calculateCFXReward(stardustToExchange)} CFX
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleExchange}
          disabled={isExchanging || contractLoading || !stardustToExchange || Number(stardustToExchange) < 10000}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isExchanging ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Exchanging...
            </div>
          ) : (
            '🎁 Exchange for CFX Rewards'
          )}
        </button>

        {/* Blockchain Stardust Info */}
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-400">Blockchain Stardust:</span>
            <span className="text-sm font-bold text-blue-300">
              {blockchainStardust.toLocaleString()} ✨
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Only blockchain stardust can be exchanged for CFX, make sure to save your game state to blockchain before exchanging.
          </div>
        </div>

        <div className="text-xs text-slate-500 text-center">
          Daily limit resets every 24 hours. Rewards are paid instantly to your wallet.
        </div>
      </div>
    </div>
  );
}