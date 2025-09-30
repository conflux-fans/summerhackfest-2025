"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getCurrentNetwork } from '../config/contracts';
import Button from './ui/Button';

interface NetworkSwitcherProps {
  onNetworkChange?: () => void;
}

export default function NetworkSwitcher({ onNetworkChange }: NetworkSwitcherProps) {
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expectedNetwork = getCurrentNetwork();

  useEffect(() => {
    checkNetwork();
  }, []);

  const checkNetwork = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setCurrentChainId(Number(network.chainId));
      setError(null);
    } catch (error) {
      console.error('Error checking network:', error);
      setError('Failed to check network');
    }
  };

  const switchNetwork = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    setIsSwitching(true);
    setError(null);
    
    try {
      // Try to switch to the correct network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${expectedNetwork.chainId.toString(16)}` }],
      });
      
      // Check network after switching
      await checkNetwork();
      onNetworkChange?.();
    } catch (switchError: any) {
      console.error('Error switching network:', switchError);
      
      // If the network doesn't exist, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${expectedNetwork.chainId.toString(16)}`,
                chainName: expectedNetwork.name,
                rpcUrls: [expectedNetwork.rpcUrl],
                blockExplorerUrls: [expectedNetwork.explorerUrl],
                nativeCurrency: {
                  name: 'CFX',
                  symbol: 'CFX',
                  decimals: 18,
                },
              },
            ],
          });
          
          // Check network after adding
          await checkNetwork();
          onNetworkChange?.();
        } catch (addError) {
          console.error('Error adding network:', addError);
          setError(`Failed to add network. Please add ${expectedNetwork.name} manually to your wallet.`);
        }
      } else {
        setError(`Failed to switch network. Please switch to ${expectedNetwork.name} manually.`);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  // Accept both Conflux Core (1029) and Conflux eSpace (1030)
  const validChainIds = [1029, 1030];
  const isCorrectNetwork = currentChainId !== null && validChainIds.includes(currentChainId);

  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  return (
    <div style={{
      padding: '1rem',
      background: isCorrectNetwork ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      border: `1px solid ${isCorrectNetwork ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
      borderRadius: '12px',
      marginBottom: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isCorrectNetwork ? '#10b981' : '#ef4444'
          }}></div>
          <div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-geist-sans)'
            }}>
              {isCorrectNetwork ? `Connected to Conflux Network` : 'Wrong Network'}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--gray-600)',
              fontFamily: 'var(--font-geist-sans)'
            }}>
              {currentChainId ? `Chain ID: ${currentChainId} (Conflux Core: 1029, eSpace: 1030)` : 'Checking network...'}
            </div>
          </div>
        </div>
        
        {!isCorrectNetwork && (
          <Button
            onClick={switchNetwork}
            disabled={isSwitching}
            color="blue"
            size="sm"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}
          >
            {isSwitching ? 'Switching...' : 'Switch Network'}
          </Button>
        )}
      </div>
      
      {error && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: '#ef4444',
          fontFamily: 'var(--font-geist-sans)'
        }}>
          {error}
        </div>
      )}
      
      {!isCorrectNetwork && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.8rem',
          color: 'var(--gray-600)',
          fontFamily: 'var(--font-geist-sans)'
        }}>
          Please switch to a <strong>Conflux network</strong> to use FluxSub.
          <div style={{ marginTop: '0.25rem', color: '#10b981' }}>
            ✅ Supported networks: Conflux Core (1029) or Conflux eSpace (1030)
          </div>
        </div>
      )}
      
      {isCorrectNetwork && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.8rem',
          color: '#10b981',
          fontFamily: 'var(--font-geist-sans)'
        }}>
          ✅ Perfect! You're connected to a supported Conflux network.
          {currentChainId === 1029 && (
            <div style={{ marginTop: '0.25rem', color: '#059669' }}>
              📡 Connected to Conflux Core (1029)
            </div>
          )}
          {currentChainId === 1030 && (
            <div style={{ marginTop: '0.25rem', color: '#059669' }}>
              🚀 Connected to Conflux eSpace (1030)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
