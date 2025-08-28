'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, Contract, parseEther, formatEther, formatUnits } from 'ethers';
import { useWalletContext } from '@/contexts/WalletContext';
import { CONTRACT_ADDRESSES } from '@/lib/utils/constants';

// Contract ABIs (simplified for essential functions)
const CREDITS_ABI = [
  "function purchaseCredits() external payable",
  "function claimRewards() external",
  "function getClaimableRewards(address user) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function stardustBalance(address user) external view returns (uint256)",
  "event CreditsPurchased(address indexed user, uint256 cfxAmount, uint256 creditsAmount, uint256 timestamp)",
  "event RewardsClaimed(address indexed user, uint256 cfxAmount, uint256 timestamp)"
];

const GAMESTATE_ABI = [
  "function registerPlayer() external",
  "function saveGameState(uint256 stardust, uint256 totalClicks) external",
  "function purchaseUpgrade(string memory upgradeId) external",
  "function getPlayerState(address player) external view returns (tuple(uint256 stardust, uint256 stardustPerSecond, uint256 totalClicks, uint256 lastUpdateTime, uint256 prestigeLevel, bool isActive), uint256 idleRewards)",
  "function getUpgradeCost(string memory upgradeId, address player) external view returns (uint256)",
  "function activatePrestige() external",
  "event GameStateSaved(address indexed player, uint256 stardust, uint256 stardustPerSecond, uint256 timestamp)",
  "event UpgradePurchased(address indexed player, string upgradeId, uint256 level, uint256 cost, string costType, uint256 timestamp)"
];

const P2E_ABI = [
  "function exchangeStardustForCFX(uint256 stardustAmount) external",
  "function getExchangeInfo(address player) external view returns (uint256 rate, uint256 dailyLimit, uint256 remainingDaily, uint256 poolBalance, uint256 playerStardust)",
  "function getMaxClaimable(address player) external view returns (uint256)",
  "function getPlayerRewardStats(address player) external view returns (uint256 totalClaimed, uint256 dailyClaimed, uint256 lastClaim, uint256 availableStardust)",
  "event StardustExchanged(address indexed player, uint256 stardustAmount, uint256 cfxAmount, uint256 timestamp)"
];

interface ContractState {
  isLoading: boolean;
  error: string | null;
  creditsBalance: bigint;
  stardustBalance: bigint;
  playerRegistered: boolean;
}

export const useContracts = () => {
  const { isConnected, address, isCorrectNetwork } = useWalletContext();
  const [contractState, setContractState] = useState<ContractState>({
    isLoading: false,
    error: null,
    creditsBalance: BigInt(0),
    stardustBalance: BigInt(0),
    playerRegistered: false,
  });

  // Get contract instances
  const getProvider = useCallback(() => {
    if (typeof window === 'undefined' || !window.ethereum) return null;
    return new BrowserProvider(window.ethereum);
  }, []);

  const getContract = useCallback(async (contractType: 'credits' | 'gamestate' | 'p2e') => {
    const provider = getProvider();
    if (!provider) throw new Error('Provider not available');

    const signer = await provider.getSigner();
    const network = process.env.NEXT_PUBLIC_CONFLUX_NETWORK || 'testnet';
    const addresses = CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES];

    let address: string;
    let abi: string[];

    switch (contractType) {
      case 'credits':
        address = addresses.starMinerCredits;
        abi = CREDITS_ABI;
        break;
      case 'gamestate':
        address = addresses.gameStateManager;
        abi = GAMESTATE_ABI;
        break;
      case 'p2e':
        address = addresses.p2eRewards;
        abi = P2E_ABI;
        break;
      default:
        throw new Error('Invalid contract type');
    }

    if (!address) {
      throw new Error(`Contract address not configured for ${contractType}`);
    }

    return new Contract(address, abi, signer);
  }, [getProvider]);

  // Purchase Credits with CFX
  const purchaseCredits = useCallback(async (cfxAmount: string) => {
    if (!isConnected || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }

    setContractState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const contract = await getContract('credits');
      const value = parseEther(cfxAmount);
      
      const tx = await contract.purchaseCredits({ value });
      await tx.wait();
      
      // Refresh balances
      await refreshBalances();
      
      return tx.hash;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Transaction failed';
      setContractState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setContractState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isConnected, isCorrectNetwork, getContract]);

  // Register player
  const registerPlayer = useCallback(async () => {
    if (!isConnected || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }

    setContractState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const contract = await getContract('gamestate');
      const tx = await contract.registerPlayer();
      await tx.wait();
      
      setContractState(prev => ({ ...prev, playerRegistered: true }));
      
      return tx.hash;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Registration failed';
      setContractState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setContractState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isConnected, isCorrectNetwork, getContract]);

  // Purchase upgrade
  const purchaseUpgrade = useCallback(async (upgradeId: string) => {
    if (!isConnected || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }

    setContractState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const contract = await getContract('gamestate');
      const tx = await contract.purchaseUpgrade(upgradeId);
      await tx.wait();
      
      // Refresh balances
      await refreshBalances();
      
      return tx.hash;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Upgrade purchase failed';
      setContractState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setContractState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isConnected, isCorrectNetwork, getContract]);

  // Get upgrade cost
  const getUpgradeCost = useCallback(async (upgradeId: string) => {
    if (!isConnected || !address) return BigInt(0);

    try {
      const contract = await getContract('gamestate');
      const cost = await contract.getUpgradeCost(upgradeId, address);
      return BigInt(cost.toString());
    } catch (error) {
      console.error('Failed to get upgrade cost:', error);
      return BigInt(0);
    }
  }, [isConnected, address, getContract]);

  // Exchange Stardust for CFX
  const exchangeStardustForCFX = useCallback(async (stardustAmount: string) => {
    if (!isConnected || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }

    setContractState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const contract = await getContract('p2e');
      const amount = BigInt(stardustAmount);
      
      const tx = await contract.exchangeStardustForCFX(amount);
      await tx.wait();
      
      // Refresh balances
      await refreshBalances();
      
      return tx.hash;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Exchange failed';
      setContractState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setContractState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isConnected, isCorrectNetwork, getContract]);

  // Get exchange info
  const getExchangeInfo = useCallback(async () => {
    if (!isConnected || !address) return null;

    try {
      const contract = await getContract('p2e');
      const info = await contract.getExchangeInfo(address);
      
      return {
        rate: BigInt(info.rate.toString()),
        dailyLimit: BigInt(info.dailyLimit.toString()),
        remainingDaily: BigInt(info.remainingDaily.toString()),
        poolBalance: BigInt(info.poolBalance.toString()),
        playerStardust: BigInt(info.playerStardust.toString()),
      };
    } catch (error) {
      console.error('Failed to get exchange info:', error);
      return null;
    }
  }, [isConnected, address, getContract]);

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    if (!isConnected || !address) return;

    try {
      const creditsContract = await getContract('credits');
      const [creditsBalance, stardustBalance] = await Promise.all([
        creditsContract.balanceOf(address),
        creditsContract.stardustBalance(address),
      ]);

      // Convert credits from wei (18 decimals) to whole credits
      const creditsInWholeUnits = BigInt(formatUnits(creditsBalance.toString(), 18).split('.')[0]);

      setContractState(prev => ({
        ...prev,
        creditsBalance: creditsInWholeUnits,
        stardustBalance: BigInt(stardustBalance.toString()),
      }));
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    }
  }, [isConnected, address, getContract]);

  // Check if player is registered
  const checkPlayerRegistration = useCallback(async () => {
    if (!isConnected || !address) return;

    try {
      const contract = await getContract('gamestate');
      const [playerState] = await contract.getPlayerState(address);
      
      setContractState(prev => ({
        ...prev,
        playerRegistered: playerState.isActive,
      }));
    } catch (error) {
      console.error('Failed to check player registration:', error);
    }
  }, [isConnected, address, getContract]);

  // Save game state to blockchain
  const saveGameState = useCallback(async (stardust: bigint, totalClicks: number) => {
    if (!isConnected || !isCorrectNetwork || !contractState.playerRegistered) return;

    try {
      const contract = await getContract('gamestate');
      const tx = await contract.saveGameState(stardust, totalClicks);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [isConnected, isCorrectNetwork, contractState.playerRegistered, getContract]);

  // Load game state from blockchain
  const loadGameState = useCallback(async () => {
    if (!isConnected || !address) return null;

    try {
      const contract = await getContract('gamestate');
      const [playerState, idleRewards] = await contract.getPlayerState(address);
      
      return {
        stardust: BigInt(playerState.stardust.toString()),
        stardustPerSecond: BigInt(playerState.stardustPerSecond.toString()),
        totalClicks: Number(playerState.totalClicks.toString()),
        lastUpdateTime: Number(playerState.lastUpdateTime.toString()),
        prestigeLevel: Number(playerState.prestigeLevel.toString()),
        isActive: playerState.isActive,
        idleRewards: BigInt(idleRewards.toString()),
      };
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }, [isConnected, address, getContract]);

  // Sync local game state with blockchain
  const syncGameState = useCallback(async (localGameState: any) => {
    if (!isConnected || !isCorrectNetwork || !contractState.playerRegistered) return;

    try {
      // Save current local state to blockchain
      await saveGameState(localGameState.stardust, localGameState.totalClicks);
      
      // Load updated state from blockchain
      const blockchainState = await loadGameState();
      
      return blockchainState;
    } catch (error) {
      console.error('Failed to sync game state:', error);
      return null;
    }
  }, [isConnected, isCorrectNetwork, contractState.playerRegistered, saveGameState, loadGameState]);

  // Auto-refresh balances when wallet connects
  useEffect(() => {
    if (isConnected && isCorrectNetwork && address) {
      refreshBalances();
      checkPlayerRegistration();
    }
  }, [isConnected, isCorrectNetwork, address, refreshBalances, checkPlayerRegistration]);

  return {
    ...contractState,
    purchaseCredits,
    registerPlayer,
    purchaseUpgrade,
    getUpgradeCost,
    exchangeStardustForCFX,
    getExchangeInfo,
    refreshBalances,
    saveGameState,
    loadGameState,
    syncGameState,
    isReady: isConnected && isCorrectNetwork,
  };
};