'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { WalletState, WalletProvider, WalletType, NetworkConfig } from '@/types/wallet';
import { CONFLUX_NETWORKS } from '@/lib/utils/constants';

declare global {
  interface Window {
    ethereum?: WalletProvider;
    conflux?: WalletProvider;
  }
}

const CONFLUX_TESTNET_CONFIG: NetworkConfig = {
  chainId: 71,
  chainName: 'Conflux eSpace Testnet',
  nativeCurrency: {
    name: 'CFX',
    symbol: 'CFX',
    decimals: 18,
  },
  rpcUrls: ['https://evmtestnet.confluxrpc.com'],
  blockExplorerUrls: ['https://evmtestnet.confluxscan.io'],
};

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isCorrectNetwork: false,
    isConnecting: false,
    error: null,
  });

  // Check if wallet is available
  const isWalletAvailable = useCallback((walletType: WalletType): boolean => {
    if (typeof window === 'undefined') return false;
    
    switch (walletType) {
      case 'metamask':
        return !!(window.ethereum && window.ethereum.isMetaMask);
      case 'fluent':
        return !!(window.conflux || (window.ethereum && !window.ethereum.isMetaMask));
      default:
        return false;
    }
  }, []);

  // Get wallet provider
  const getProvider = useCallback((walletType: WalletType): WalletProvider | null => {
    if (typeof window === 'undefined') return null;
    
    switch (walletType) {
      case 'metamask':
        return window.ethereum && window.ethereum.isMetaMask ? window.ethereum : null;
      case 'fluent':
        return window.conflux || window.ethereum || null;
      default:
        return null;
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async (walletType: WalletType) => {
    if (!isWalletAvailable(walletType)) {
      setWalletState(prev => ({
        ...prev,
        error: `${walletType === 'metamask' ? 'MetaMask' : 'Fluent Wallet'} is not installed`,
      }));
      return;
    }

    const provider = getProvider(walletType);
    if (!provider) {
      setWalletState(prev => ({
        ...prev,
        error: 'Wallet provider not found',
      }));
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request account access
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];

      // Get chain ID
      const chainId = await provider.request({
        method: 'eth_chainId',
      });

      const numericChainId = parseInt(chainId, 16);
      const isCorrectNetwork = numericChainId === CONFLUX_TESTNET_CONFIG.chainId;

      // Get balance
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      const balanceInEther = (parseInt(balance, 16) / 1e18).toString();

      setWalletState({
        isConnected: true,
        address,
        balance: balanceInEther,
        chainId: numericChainId,
        isCorrectNetwork,
        isConnecting: false,
        error: null,
      });

      // Set up event listeners
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);

    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
    }
  }, [isWalletAvailable, getProvider]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    // Remove event listeners
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }

    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      isCorrectNetwork: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  // Switch to Conflux eSpace network
  const switchNetwork = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) {
      setWalletState(prev => ({
        ...prev,
        error: 'Wallet not found',
      }));
      return;
    }

    try {
      // Try to switch to the network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CONFLUX_TESTNET_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CONFLUX_TESTNET_CONFIG.chainId.toString(16)}`,
                chainName: CONFLUX_TESTNET_CONFIG.chainName,
                nativeCurrency: CONFLUX_TESTNET_CONFIG.nativeCurrency,
                rpcUrls: CONFLUX_TESTNET_CONFIG.rpcUrls,
                blockExplorerUrls: CONFLUX_TESTNET_CONFIG.blockExplorerUrls,
              },
            ],
          });
        } catch (addError: any) {
          console.error('Failed to add network:', addError);
          setWalletState(prev => ({
            ...prev,
            error: 'Failed to add Conflux eSpace network',
          }));
        }
      } else {
        console.error('Failed to switch network:', switchError);
        setWalletState(prev => ({
          ...prev,
          error: 'Failed to switch to Conflux eSpace network',
        }));
      }
    }
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setWalletState(prev => ({
        ...prev,
        address: accounts[0],
      }));
      // Refresh balance
      refreshBalance();
    }
  }, [disconnect]);

  // Handle chain changes
  const handleChainChanged = useCallback((chainId: string) => {
    const numericChainId = parseInt(chainId, 16);
    const isCorrectNetwork = numericChainId === CONFLUX_TESTNET_CONFIG.chainId;
    
    setWalletState(prev => ({
      ...prev,
      chainId: numericChainId,
      isCorrectNetwork,
    }));
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!walletState.isConnected || !walletState.address) return;

    const provider = window.ethereum;
    if (!provider) return;

    try {
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [walletState.address, 'latest'],
      });

      const balanceInEther = (parseInt(balance, 16) / 1e18).toString();
      
      setWalletState(prev => ({
        ...prev,
        balance: balanceInEther,
      }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [walletState.isConnected, walletState.address]);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({
            method: 'eth_chainId',
          });

          const numericChainId = parseInt(chainId, 16);
          const isCorrectNetwork = numericChainId === CONFLUX_TESTNET_CONFIG.chainId;

          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest'],
          });

          const balanceInEther = (parseInt(balance, 16) / 1e18).toString();

          setWalletState({
            isConnected: true,
            address: accounts[0],
            balance: balanceInEther,
            chainId: numericChainId,
            isCorrectNetwork,
            isConnecting: false,
            error: null,
          });

          // Set up event listeners
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    };

    checkConnection();
  }, [handleAccountsChanged, handleChainChanged]);

  return {
    ...walletState,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
    isWalletAvailable,
  };
};