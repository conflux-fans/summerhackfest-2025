"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import contractService from '../services/ContractService';

interface WalletInfo {
  name: string;
  account: string;
}

interface WalletContextType {
  isConnected: boolean;
  walletInfo: WalletInfo | null;
  isContractServiceReady: boolean;
  updateTrigger: number;
  connectWallet: (name: string, account: string, provider?: any) => void;
  disconnectWallet: () => void;
  forceUpdate: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isContractServiceReady, setIsContractServiceReady] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Don't load wallet state from localStorage here - let the auto-connect hook handle it properly
  // This prevents showing "connected" state when the wallet isn't actually functional

  const connectWallet = async (name: string, account: string, provider?: any) => {
    console.log('WalletContext.connectWallet called with:', { name, account, provider: !!provider, providerType: typeof provider });
    console.log('Setting connection state to true...');
    setIsConnected(true);
    setWalletInfo({ name, account });
    setIsContractServiceReady(false);
    setUpdateTrigger(prev => prev + 1);
    
    // Initialize contract service if provider is available
    if (provider) {
      try {
        console.log('Initializing contract service with provider...', provider);
        const browserProvider = new BrowserProvider(provider, 'any');
        console.log('BrowserProvider created:', browserProvider);
        await contractService.initialize(browserProvider);
        console.log('✅ Contract service initialized successfully');
        setIsContractServiceReady(true);
        setUpdateTrigger(prev => prev + 1);
        console.log('✅ Contract service state updated to ready');
        
        // Force a re-render after a short delay to ensure state is updated
        setTimeout(() => {
          setUpdateTrigger(prev => prev + 1);
        }, 100);
      } catch (error) {
        console.error('❌ Failed to initialize contract service:', error);
        console.error('Error details:', error);
        setIsContractServiceReady(false);
        setUpdateTrigger(prev => prev + 1);
      }
    } else {
      console.warn('⚠️ No provider passed to connectWallet - contract service not initialized');
      setIsContractServiceReady(false);
      setUpdateTrigger(prev => prev + 1);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletInfo(null);
    setIsContractServiceReady(false);
    setUpdateTrigger(prev => prev + 1);
    localStorage.removeItem('lastConnectedWallet');
  };

  const forceUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  // Debug logging for context value
  console.log('WalletContext.Provider value:', { 
    isConnected, 
    walletInfo, 
    isContractServiceReady, 
    updateTrigger 
  });

  return (
    <WalletContext.Provider value={{
      isConnected,
      walletInfo,
      isContractServiceReady,
      updateTrigger,
      connectWallet,
      disconnectWallet,
      forceUpdate
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  // Force re-render when context changes
  const [, forceRender] = useState({});
  useEffect(() => {
    forceRender({});
  }, [context.updateTrigger]);
  
  return context;
}
