'use client'

import React, { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
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
  const gameState = useGameState();
  const { buyUpgrade } = gameState;
  const [activeTab, setActiveTab] = useState<'stardust' | 'credits'>('stardust');

  const stardustUpgrades = Object.entries(UPGRADE_CONFIGS).filter(
    ([_, config]) => config.costType === 'stardust'
  );
  
  const creditUpgrades = Object.entries(UPGRADE_CONFIGS).filter(
    ([_, config]) => config.costType === 'credits'
  );

  const handlePurchase = (upgradeId: string) => {
    buyUpgrade(upgradeId);
  };

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
          <Button
            onClick={() => {/* TODO: Open credits purchase modal */}}
            variant="primary"
            className="w-full bg-cyan-600 hover:bg-cyan-500"
          >
            Purchase Credits with CFX
          </Button>
        </div>
      )}
      
      {/* Wallet Connection */}
      {!gameState.walletConnected && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <Button
            onClick={() => {/* TODO: Connect wallet */}}
            variant="primary"
            className="w-full"
          >
            Connect Wallet for Blockchain Features
          </Button>
        </div>
      )}
    </div>
  );
};