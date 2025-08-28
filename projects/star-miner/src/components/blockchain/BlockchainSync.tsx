'use client';

import { useState, useEffect } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { useContracts } from '@/hooks/useContracts';
import { useGameStateContext } from '@/contexts/GameStateContext';

interface BlockchainSyncProps {
  className?: string;
}

export default function BlockchainSync({ className = '' }: BlockchainSyncProps) {
  const { isConnected, address } = useWalletContext();
  const { loadGameState, syncGameState, saveGameState, registerPlayer, playerRegistered, isLoading } = useContracts();
  const gameState = useGameStateContext();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false); // Default unchecked

  // Auto-sync when wallet connects
  useEffect(() => {
    if (isConnected && playerRegistered && !isSyncing) {
      handleLoadFromBlockchain();
    }
  }, [isConnected, playerRegistered]);

  // Auto-save every 5 minutes (only if enabled)
  useEffect(() => {
    if (!isConnected || !playerRegistered || !autoSaveEnabled) return;

    const interval = setInterval(() => {
      handleSaveToBlockchain();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isConnected, playerRegistered, autoSaveEnabled]);

  // Register player if not registered
  const handleRegisterPlayer = async () => {
    if (!isConnected) return;

    setIsSyncing(true);
    setSyncStatus('syncing');
    
    try {
      await registerPlayer();
      setSyncStatus('success');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to register player:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Load game state from blockchain
  const handleLoadFromBlockchain = async () => {
    if (!isConnected || !playerRegistered) return;

    console.log('🔄 Loading game state from blockchain...');
    setIsSyncing(true);
    setSyncStatus('syncing');
    
    try {
      const blockchainState = await loadGameState();
      
      if (blockchainState && blockchainState.isActive) {
        // Update local game state with blockchain data
        gameState.updateFromBlockchain(blockchainState);
        
        // Process idle rewards if any
        if (blockchainState.idleRewards > 0n) {
          gameState.incrementStardust(blockchainState.idleRewards);
        }
      }
      
      setSyncStatus('success');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to load from blockchain:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Save game state to blockchain
  const handleSaveToBlockchain = async () => {
    if (!isConnected || !playerRegistered) return;

    setIsSyncing(true);
    setSyncStatus('syncing');
    
    try {
      await saveGameState(gameState.stardust, gameState.totalClicks);
      
      setSyncStatus('success');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to save to blockchain:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Full sync (save then load)
  const handleFullSync = async () => {
    if (!isConnected || !playerRegistered) return;

    setIsSyncing(true);
    setSyncStatus('syncing');
    
    try {
      const syncedState = await syncGameState(gameState);
      
      if (syncedState && syncedState.isActive) {
        // Update game state from sync
        gameState.updateFromBlockchain(syncedState);
      }
      
      setSyncStatus('success');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to sync with blockchain:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-2">⛓️ Blockchain Sync</h3>
          <p className="text-slate-400 text-sm">Connect wallet to sync game progress</p>
        </div>
      </div>
    );
  }

  if (!playerRegistered) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-3">⛓️ Blockchain Sync</h3>
          <p className="text-slate-400 text-sm mb-4">Register to sync your progress on-chain</p>
          <button
            onClick={handleRegisterPlayer}
            disabled={isSyncing || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isSyncing ? 'Registering...' : 'Register Player'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <span>⛓️</span>
        Blockchain Sync
        {syncStatus === 'syncing' && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        )}
      </h3>

      {/* Sync Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Status:</span>
          <span className={`font-medium ${
            syncStatus === 'success' ? 'text-green-400' :
            syncStatus === 'error' ? 'text-red-400' :
            syncStatus === 'syncing' ? 'text-yellow-400' :
            'text-slate-400'
          }`}>
            {syncStatus === 'success' ? '✅ Synced' :
             syncStatus === 'error' ? '❌ Error' :
             syncStatus === 'syncing' ? '🔄 Syncing...' :
             '⏸️ Idle'}
          </span>
        </div>
        
        {lastSyncTime && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-slate-400">Last sync:</span>
            <span className="text-slate-300">
              {lastSyncTime.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Sync Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleLoadFromBlockchain}
          disabled={isSyncing}
          className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors disabled:cursor-not-allowed"
        >
          📥 Load
        </button>
        
        <button
          onClick={handleSaveToBlockchain}
          disabled={isSyncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors disabled:cursor-not-allowed"
        >
          📤 Save
        </button>
      </div>

      <button
        onClick={handleFullSync}
        disabled={isSyncing}
        className="w-full mt-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors disabled:cursor-not-allowed"
      >
        🔄 Full Sync
      </button>

      {/* Auto-save Settings */}
      <div className="mt-3 pt-3 border-t border-slate-600">
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span>Auto-save every 5 minutes</span>
        </label>
        <div className="text-xs text-slate-500 mt-1 ml-6">
          {autoSaveEnabled ? 'Automatically saves to blockchain' : 'Manual save only'}
        </div>
      </div>
    </div>
  );
}