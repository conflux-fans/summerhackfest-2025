'use client'

import React, { useState, useEffect } from 'react';
import { useGameStateContext } from '@/contexts/GameStateContext';
import { useWalletContext } from '@/contexts/WalletContext';
import { useContracts } from '@/hooks/useContracts';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/utils/formatting';
import { UPGRADE_CONFIGS } from '@/lib/utils/constants';
import { getUpgradeCost, canAffordUpgrade } from '@/lib/game/mechanics';

interface UpgradeItemProps {
  upgradeId: string;
  config: any;
  level: number;
  cost: bigint;
  canAfford: boolean;
  onPurchase: (upgradeId: string) => void;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({
  upgradeId,
  config,
  level,
  cost,
  canAfford,
  onPurchase
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`bg-gray-800/50 rounded-lg p-4 border transition-all duration-200 ${
        canAfford 
          ? 'border-green-500/50 hover:border-green-400 hover:scale-102' 
          : 'border-gray-600 opacity-60'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{config.icon}</div>
          <div>
            <h3 className="text-white font-semibold">{config.name}</h3>
            <p className="text-sm text-gray-400">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm ${config.costType === 'credits' ? 'text-cyan-400' : 'text-yellow-400'}`}>
            {formatNumber(cost)} {config.costType === 'credits' ? '💎' : '✨'}
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-300 mb-3">
        <div>+{formatNumber(config.stardustPerClick)} per click</div>
        <div>+{formatNumber(config.stardustPerSecond)} per second</div>
      </div>
      
      <Button
        onClick={() => onPurchase(upgradeId)}
        disabled={!canAfford}
        variant={canAfford ? 'success' : 'secondary'}
        className="w-full"
        size="sm"
      >
        {canAfford ? 'Purchase' : 'Cannot Afford'}
      </Button>
      
      {/* Hover Details */}
      {isHovered && (
        <div className="absolute z-10 bg-gray-900 border border-gray-600 rounded-lg p-3 mt-2 shadow-xl max-w-xs">
          <p className="text-sm text-gray-300">{config.description}</p>
        </div>
      )}
    </div>
  );
};

export const UpgradeShop: React.FC = () => {
  const gameState = useGameStateContext();
  const { buyUpgrade, updateCredits, updateWalletConnection } = gameState;
  const { isConnected, isCorrectNetwork, address } = useWalletContext();
  const { purchaseCredits, isLoading: contractLoading, creditsBalance, refreshBalances } = useContracts();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'stardust' | 'credits'>('stardust');
  const [purchaseAmount, setPurchaseAmount] = useState('1');
  const [isPurchasing, setIsPurchasing] = useState(false);

  const stardustUpgrades = Object.entries(UPGRADE_CONFIGS).filter(
    ([_, config]) => config.costType === 'stardust'
  );
  
  const creditUpgrades = Object.entries(UPGRADE_CONFIGS).filter(
    ([_, config]) => config.costType === 'credits'
  );

  const handlePurchase = (upgradeId: string) => {
    // All upgrades use local game mechanics for better UX
    // Credits will be synced with blockchain when game state is saved
    buyUpgrade(upgradeId);
  };

  const handleCreditsPurchase = async () => {
    console.log('💳 Credit purchase attempt:', { isConnected, isCorrectNetwork, address });

    if (!isConnected || !isCorrectNetwork) {
      showToast('warning', 'Wallet Connection Required', 'Please connect your wallet and switch to Conflux eSpace Testnet');
      return;
    }

    setIsPurchasing(true);
    try {
      const txHash = await purchaseCredits(purchaseAmount);
      
      // Calculate credits purchased (1 CFX = 1000 Credits)
      const creditsPurchased = BigInt(Math.floor(parseFloat(purchaseAmount) * 1000));
      
      // Update local credits immediately for better UX
      updateCredits(gameState.credits + creditsPurchased);

      // Refresh blockchain balances in background
      await refreshBalances();

      showToast('success', 'Credits Purchased!', `Successfully purchased ${formatNumber(creditsPurchased)} 💎`);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      showToast('error', 'Purchase Failed', error.message || 'Unknown error occurred');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Sync blockchain credits balance with local game state only on initial connection
  useEffect(() => {
    if (isConnected && creditsBalance !== undefined) {
      // Only sync from blockchain if local credits are 0 (initial state)
      // This prevents overriding local changes during gameplay
      if (gameState.credits === BigInt(0)) {
        updateCredits(creditsBalance);
      }
    } else if (!isConnected) {
      // When wallet is not connected, credits should be 0
      updateCredits(BigInt(0));
    }
  }, [isConnected, creditsBalance, updateCredits, gameState.credits]);

  // Sync wallet connection status with local game state
  useEffect(() => {
    console.log('🔄 Wallet connection sync:', { isConnected, address });
    updateWalletConnection(isConnected, address || '');
  }, [isConnected, address, updateWalletConnection]);

  // console.log('🔄 Upgrade shop render:', { isConnected, isCorrectNetwork, address });
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🛒 Upgrade Shop
      </h2>
      
      {/* Tab Navigation */}
      <div className="flex mb-4 bg-gray-800 rounded-lg p-1">
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            activeTab === 'stardust'
              ? 'bg-yellow-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('stardust')}
        >
          ✨ Stardust Upgrades
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            activeTab === 'credits'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('credits')}
        >
          💎 Credit Upgrades
        </button>
      </div>
      
      {/* Upgrade List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {(activeTab === 'stardust' ? stardustUpgrades : creditUpgrades).map(
          ([upgradeId, config]) => {
            const level = gameState.upgrades[upgradeId]?.level || 0;
            const cost = getUpgradeCost(upgradeId, level);
            const canAfford = canAffordUpgrade(gameState, upgradeId);

            return (
              <UpgradeItem
                key={upgradeId}
                upgradeId={upgradeId}
                config={config}
                level={level}
                cost={cost}
                canAfford={canAfford}
                onPurchase={handlePurchase}
              />
            );
          }
        )}
      </div>
      
      {/* Credits Purchase Section */}
      {activeTab === 'credits' && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Need more Credits?</span>
            <span className="text-sm text-cyan-400">1 CFX = 1000 💎</span>
          </div>
          
          {/* CFX Amount Input */}
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">CFX Amount</label>
            <input
              type="number"
              min="0.01"
              max="100"
              step="0.01"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Enter CFX amount"
            />
            <div className="text-xs text-gray-500 mt-1">
              You will receive {formatNumber(BigInt(Math.floor(parseFloat(purchaseAmount || '0') * 1000)))} 💎
            </div>
          </div>
          
          <Button
            onClick={handleCreditsPurchase}
            disabled={!isConnected || !isCorrectNetwork || isPurchasing || contractLoading}
            variant="primary"
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
            isLoading={isPurchasing || contractLoading}
          >
            {!isConnected
              ? 'Connect Wallet to Purchase'
              : !isCorrectNetwork
                ? 'Switch to Conflux eSpace'
                : isPurchasing || contractLoading
                  ? 'Processing...'
                  : 'Purchase Credits with CFX'
            }
          </Button>
          
        </div>
      )}
      
      {/* Wallet Connection Legend - Only show when wallet is not connected */}
      {!isConnected && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400">ℹ️</span>
              <span className="text-sm font-semibold text-blue-400">Blockchain Features</span>
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>• Purchase credits with CFX</div>
              <div>• Sync game progress on blockchain</div>
              <div>• Earn P2E rewards</div>
              <div className="text-blue-400 mt-2">Connect your wallet to unlock these features!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};