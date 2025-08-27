'use client'

import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { formatAddress, formatCFX } from '@/lib/utils/formatting';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: 'metamask' | 'fluent') => void;
  isConnecting: boolean;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect, isConnecting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-400 mb-4">
            Connect your wallet to access blockchain features and play-to-earn mechanics.
          </div>
          
          <Button
            onClick={() => onConnect('metamask')}
            disabled={isConnecting}
            className="w-full bg-orange-600 hover:bg-orange-500 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🦊</span>
            <span>MetaMask</span>
          </Button>
          
          <Button
            onClick={() => onConnect('fluent')}
            disabled={isConnecting}
            className="w-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🌊</span>
            <span>Fluent Wallet</span>
          </Button>
          
          <div className="text-xs text-gray-500 mt-4">
            Make sure you're on Conflux eSpace Testnet (Chain ID: 71)
          </div>
        </div>
      </div>
    </div>
  );
};

export const WalletConnect: React.FC = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    chainId,
    isCorrectNetwork,
    isConnecting,
    error,
    connect, 
    disconnect, 
    switchNetwork,
    refreshBalance
  } = useWallet();
  
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async (walletType: 'metamask' | 'fluent') => {
    try {
      await connect(walletType);
      setShowModal(false);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500"
          isLoading={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        
        <WalletModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConnect={handleConnect}
          isConnecting={isConnecting}
        />
        
        {error && (
          <div className="mt-2 text-sm text-red-400">
            {error}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Network Warning */}
      {!isCorrectNetwork && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 flex items-center gap-3">
          <span className="text-red-400">⚠️</span>
          <div className="flex-1">
            <div className="text-sm text-red-400 font-semibold">Wrong Network</div>
            <div className="text-xs text-red-300">Please switch to Conflux eSpace Testnet</div>
          </div>
          <Button
            onClick={switchNetwork}
            size="sm"
            className="bg-red-600 hover:bg-red-500"
          >
            Switch Network
          </Button>
        </div>
      )}
      
      {/* Wallet Info */}
      <div className="flex items-center gap-4">
        {/* Balance */}
        <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-600">
          <div className="text-xs text-gray-400">Balance</div>
          <div className="text-sm text-white font-semibold flex items-center gap-2">
            {balance ? `${parseFloat(balance).toFixed(4)} CFX` : '0 CFX'}
            <button
              onClick={refreshBalance}
              className="text-gray-400 hover:text-white transition-colors"
              title="Refresh balance"
            >
              🔄
            </button>
          </div>
        </div>
        
        {/* Address */}
        <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-600">
          <div className="text-xs text-gray-400">Address</div>
          <div className="text-sm text-white font-mono">
            {address ? formatAddress(address) : ''}
          </div>
        </div>
        
        {/* Chain ID */}
        <div className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-600">
          <div className="text-xs text-gray-400">Chain</div>
          <div className={`text-sm font-semibold ${isCorrectNetwork ? 'text-green-400' : 'text-red-400'}`}>
            {chainId || 'Unknown'}
          </div>
        </div>
        
        {/* Disconnect Button */}
        <Button
          onClick={handleDisconnect}
          variant="secondary"
          size="sm"
          className="bg-gray-600 hover:bg-gray-500"
        >
          Disconnect
        </Button>
      </div>
      
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected && isCorrectNetwork ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-xs text-gray-400">
          {isConnected && isCorrectNetwork ? 'Connected' : 'Not Connected'}
        </span>
      </div>
    </div>
  );
};

// Compact version for mobile/smaller spaces
export const WalletConnectCompact: React.FC = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    isCorrectNetwork,
    isConnecting,
    connect, 
    disconnect
  } = useWallet();
  
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async (walletType: 'metamask' | 'fluent') => {
    try {
      await connect(walletType);
      setShowModal(false);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => setShowModal(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-500"
          isLoading={isConnecting}
        >
          Connect
        </Button>
        
        <WalletModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConnect={handleConnect}
          isConnecting={isConnecting}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-400' : 'bg-red-400'}`} />
      <div className="text-sm text-white">
        {formatAddress(address || '')}
      </div>
      <div className="text-xs text-gray-400">
        {balance ? `${parseFloat(balance).toFixed(2)} CFX` : '0 CFX'}
      </div>
      <Button
        onClick={disconnect}
        size="sm"
        variant="secondary"
        className="text-xs px-2 py-1"
      >
        ✕
      </Button>
    </div>
  );
};