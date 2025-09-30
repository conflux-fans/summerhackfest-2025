"use client";

import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import Button from './ui/Button';
import WalletModal from './WalletModal';
import { useWallet } from '../contexts/WalletContext';
import { useAutoConnect } from '../hooks/useAutoConnect';

interface SimpleConnectButtonProps {
  className?: string;
}

export default function SimpleConnectButton({ className = '' }: SimpleConnectButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, walletInfo, connectWallet, disconnectWallet } = useWallet();
  
  // Auto-connect hook - pass a wrapper function that matches the expected signature
  useAutoConnect((name: string, account: string, provider: any) => {
    connectWallet(name, account, provider);
  });
  
  // Debug logging
  console.log('SimpleConnectButton state:', { isConnected, walletInfo });

  const handleConnect = () => {
    console.log('🔗 Connect button clicked!');
    setIsModalOpen(true);
  };

  const handleWalletConnect = (name: string, account: string, providerDetail: any, provider: any) => {
    console.log('SimpleConnectButton.handleWalletConnect called with:', { name, account, providerDetail, provider });
    console.log('Calling connectWallet with provider:', !!provider);
    connectWallet(name, account, provider);
    setIsModalOpen(false);
  };

  const handleDisconnect = () => {
    console.log('Wallet disconnected');
    disconnectWallet();
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      console.log('✅ Address copied to clipboard:', address);
      // You could add a toast notification here if you have a toast system
    } catch (err) {
      console.error('❌ Failed to copy address:', err);
    }
  };

  if (isConnected && walletInfo) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 1.25rem',
        background: 'var(--gray-alpha-100)',
        borderRadius: '12px',
        border: '1px solid var(--gray-alpha-200)',
        fontFamily: 'var(--font-geist-sans)'
      }}>
        {/* Wallet Icon */}
        <div style={{
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--gray-alpha-200)'
        }}>
          👛
        </div>

        {/* Wallet Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          flex: 1
        }}>
          <button
            onClick={() => copyToClipboard(walletInfo.account)}
            style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--foreground)',
              marginBottom: '2px',
              fontFamily: 'var(--font-geist-sans)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--gray-alpha-200)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={`Click to copy: ${walletInfo.account}`}
          >
            {formatAddress(walletInfo.account)}
            <Copy size={12} style={{ opacity: 0.6 }} />
          </button>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--gray-600)',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            {walletInfo.name}
          </div>
        </div>

        {/* Connection Status Indicator */}
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#10b981',
          marginRight: '0.5rem'
        }}></div>

        {/* Disconnect Button */}
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleDisconnect}
          style={{
            fontSize: '0.8rem',
            padding: '0.5rem 0.75rem'
          }}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={handleConnect}
        color="blue"
        className={className}
      >
        🔗 Connect Wallet
      </Button>
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWalletConnect={handleWalletConnect}
      />
    </>
  );
}
