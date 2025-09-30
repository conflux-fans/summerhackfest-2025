import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ethers } from 'ethers';
import { Wallet, NFT, VerificationResult } from '../types/navigation';

interface WalletContextType {
  wallet: Wallet;
  nfts: NFT[];
  verificationHistory: VerificationResult[];
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  verifyOwnership: (contractAddress: string, eventName?: string) => Promise<VerificationResult>;
  refreshNFTs: () => Promise<void>;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Mock data for demo
const mockNFTs: NFT[] = [
  {
    id: '1',
    tokenId: '42',
    name: 'VIP Access Pass #42',
    description: 'Premium access to exclusive events',
    image: 'https://via.placeholder.com/300x300/22D3EE/FFFFFF?text=NFT',
    contractAddress: '0x1234567890123456789012345678901234567890',
    rarity: 'Epic',
    traits: {
      'Tier': 'Gold',
      'Validity': '1 Year',
      'Benefits': 'Premium'
    },
    owner: '0x742d35cc61b8000000000000000000000000000',
    verified: true
  },
  {
    id: '2',
    tokenId: '128',
    name: 'Concert Ticket #128',
    description: 'Front row seat access',
    image: 'https://via.placeholder.com/300x300/84E9F2/000000?text=CONCERT',
    contractAddress: '0x2345678901234567890123456789012345678901',
    rarity: 'Legendary',
    traits: {
      'Section': 'Front Row',
      'Date': '2024-03-15',
      'Venue': 'Arena Hall'
    },
    owner: '0x742d35cc61b8000000000000000000000000000',
    verified: true
  },
  {
    id: '3',
    tokenId: '1',
    name: 'Exclusive Art Piece #1',
    description: 'A unique digital artwork with real-world access benefits',
    image: 'https://via.placeholder.com/300x300/22C55E/FFFFFF?text=ART',
    contractAddress: '0x3456789012345678901234567890123456789012',
    rarity: 'Legendary',
    traits: {
      'Artist': 'Digital Creator',
      'Style': 'Abstract',
      'Access': 'Gallery VIP',
      'Rarity': 'Legendary'
    },
    owner: '0x742d35cc61b8000000000000000000000000000',
    verified: false
  }
];

const mockVerificationHistory: VerificationResult[] = [
  {
    success: true,
    tokenId: '42',
    eventName: 'VIP Conference Access - Opening Night',
    location: 'Convention Center, Hall A',
    timestamp: '2024-01-28T15:30:00Z',
    method: 'signature'
  },
  {
    success: true,
    tokenId: '128',
    eventName: 'Front Row Concert Access',
    location: 'Arena Hall, Section A',
    timestamp: '2024-01-27T20:45:00Z',
    method: 'qr-code'
  },
  {
    success: false,
    eventName: 'Exclusive Member Event',
    location: 'Private Club, Downtown',
    timestamp: '2024-01-25T18:22:00Z',
    method: 'signature',
    reason: 'NFT does not meet minimum rarity requirement'
  }
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet>({
    address: '',
    connected: false,
    balance: '0',
    chainId: 1030 // Conflux eSpace
  });
  
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [verificationHistory, setVerificationHistory] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStoredWallet();
    loadVerificationHistory();
  }, []);

  const loadStoredWallet = async () => {
    try {
      const storedAddress = await SecureStore.getItemAsync('walletAddress');
      if (storedAddress) {
        setWallet(prev => ({
          ...prev,
          address: storedAddress,
          connected: true,
          balance: '1.25'
        }));
        setNfts(mockNFTs);
      }
    } catch (error) {
      console.error('Failed to load stored wallet:', error);
    }
  };

  const loadVerificationHistory = async () => {
    try {
      const stored = await SecureStore.getItemAsync('verificationHistory');
      if (stored) {
        setVerificationHistory(JSON.parse(stored));
      } else {
        setVerificationHistory(mockVerificationHistory);
      }
    } catch (error) {
      console.error('Failed to load verification history:', error);
      setVerificationHistory(mockVerificationHistory);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAddress = '0x742d35cc61b8000000000000000000000000000';
      
      setWallet({
        address: mockAddress,
        connected: true,
        balance: '1.25',
        chainId: 1030
      });
      
      setNfts(mockNFTs);
      
      // Store wallet address
      await SecureStore.setItemAsync('walletAddress', mockAddress);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setWallet({
        address: '',
        connected: false,
        balance: '0',
        chainId: 1030
      });
      
      setNfts([]);
      
      // Remove stored wallet address
      await SecureStore.deleteItemAsync('walletAddress');
      
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!wallet.connected) {
      throw new Error('Wallet not connected');
    }
    
    // Simulate signing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a mock signature
    const mockSignature = `0x${'a'.repeat(128)}${Math.random().toString(16).slice(2, 8)}`;
    
    return mockSignature;
  };

  const verifyOwnership = async (contractAddress: string, eventName?: string): Promise<VerificationResult> => {
    if (!wallet.connected) {
      throw new Error('Wallet not connected');
    }
    
    setLoading(true);
    
    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find NFT in the collection
      const ownedNFT = nfts.find(nft => 
        nft.contractAddress.toLowerCase() === contractAddress.toLowerCase()
      );
      
      const result: VerificationResult = {
        success: !!ownedNFT,
        tokenId: ownedNFT?.tokenId,
        eventName: eventName || 'NFT Ownership Verification',
        location: 'Mobile App Verification',
        timestamp: new Date().toISOString(),
        method: 'signature',
        reason: ownedNFT ? undefined : 'No NFTs owned in this collection'
      };
      
      // Add to verification history
      const newHistory = [result, ...verificationHistory];
      setVerificationHistory(newHistory);
      
      // Store updated history
      await SecureStore.setItemAsync('verificationHistory', JSON.stringify(newHistory));
      
      return result;
      
    } catch (error) {
      console.error('Verification failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshNFTs = async () => {
    if (!wallet.connected) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNfts(mockNFTs);
    } catch (error) {
      console.error('Failed to refresh NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: WalletContextType = {
    wallet,
    nfts,
    verificationHistory,
    connectWallet,
    disconnectWallet,
    signMessage,
    verifyOwnership,
    refreshNFTs,
    loading
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
