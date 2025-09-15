'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameStateContext } from '@/contexts/GameStateContext';
import { useWalletContext } from '@/contexts/WalletContext';
import { useContracts } from '@/hooks/useContracts';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface RestartGameProps {
  className?: string;
}

export const RestartGame: React.FC<RestartGameProps> = ({ className = '' }) => {
  const { resetGame } = useGameStateContext();
  const { isConnected, isCorrectNetwork } = useWalletContext();
  const { resetPlayerState, playerRegistered, isLoading } = useContracts();
  const { showToast } = useToast();
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleRestartClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmRestart = async () => {
    setIsResetting(true);
    setShowConfirmModal(false);
    
    try {
      // Reset local game state first
      resetGame();
      
      // If wallet is connected and player is registered, also reset blockchain state
      if (isConnected && isCorrectNetwork && playerRegistered) {
        console.log('🔄 Resetting blockchain state...');
        const txHash = await resetPlayerState();
        showToast('success', 'Game Reset Complete!', `Local and blockchain state reset. TX: ${txHash?.slice(0, 10)}...`);
      } else {
        showToast('success', 'Game Reset Complete!', 'Local game state has been reset to initial values.');
      }
      
    } catch (error: any) {
      console.error('Failed to reset game:', error);
      showToast('error', 'Reset Failed', error.message || 'Failed to reset blockchain state');
      
      // Even if blockchain reset fails, local reset was successful
      showToast('info', 'Partial Reset', 'Local game was reset, but blockchain reset failed. You can try again later.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancelRestart = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className={`${className}`}>
        <Button
          onClick={handleRestartClick}
          disabled={isResetting || isLoading}
          variant="danger"
          size="sm"
          className="group bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm opacity-60 hover:opacity-100 px-2 py-2 hover:px-3 overflow-hidden whitespace-nowrap flex items-center justify-center"
          isLoading={isResetting}
        >
          <span className="flex items-center gap-0">
            <span className="text-lg">🔄</span>
            <span className="max-w-0 group-hover:max-w-[120px] hover:ml-1 transition-all duration-300 overflow-hidden">
              {isResetting ? 'Resetting...' : 'Restart Game'}
            </span>
          </span>
        </Button>
      </div>

      {/* Confirmation Modal - Rendered at document root */}
      {typeof window !== 'undefined' && showConfirmModal && createPortal(
        <Modal
          isOpen={showConfirmModal}
          onClose={handleCancelRestart}
          title="⚠️ Restart Game"
        >
          <div className="space-y-4">
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-400 text-xl">⚠️</span>
                <span className="text-red-400 font-semibold">Warning: This action cannot be undone!</span>
              </div>
              <div className="text-sm text-gray-300 space-y-2">
                <p><strong>This will reset ALL progress:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Stardust: Reset to 0</li>
                  <li>All upgrades: Reset to level 0</li>
                  <li>Total clicks: Reset to 0</li>
                  <li>Prestige level: Reset to 0</li>
                  <li>Achievements: Cleared</li>
                  <li>All statistics: Reset</li>
                </ul>
              </div>
            </div>

            {isConnected && isCorrectNetwork && playerRegistered && (
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400">ℹ️</span>
                  <span className="text-blue-400 font-semibold text-sm">Blockchain Reset</span>
                </div>
                <p className="text-xs text-gray-300">
                  Your blockchain progress will also be reset. This requires a transaction.
                </p>
              </div>
            )}

            {(!isConnected || !playerRegistered) && (
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-400">💡</span>
                  <span className="text-yellow-400 font-semibold text-sm">Local Reset Only</span>
                </div>
                <p className="text-xs text-gray-300">
                  Only local progress will be reset. Connect wallet to also reset blockchain progress.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCancelRestart}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRestart}
                variant="danger"
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isResetting}
                isLoading={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Everything'}
              </Button>
            </div>
          </div>
        </Modal>,
        document.body
      )}
    </>
  );
};