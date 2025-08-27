'use client'

import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, ClickEffect } from '@/types/game';
import { 
  createInitialGameState,
  processClick,
  purchaseUpgrade,
  calculateIdleRewards,
  calculateStardustPerClick,
  calculateStardustPerSecond,
  activatePrestige,
  canActivatePrestige
} from '@/lib/game/mechanics';
import { GAME_CONSTANTS } from '@/lib/utils/constants';

interface GameStore extends GameState {
  // UI state
  clickEffects: ClickEffect[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  incrementStardust: (amount: bigint) => void;
  handleClick: (x: number, y: number) => void;
  buyUpgrade: (upgradeId: string) => void;
  processIdleRewards: () => void;
  activatePrestigeMode: () => void;
  updateCredits: (amount: bigint) => void;
  resetCredits: () => void;
  updateWalletConnection: (connected: boolean, address: string) => void;
  addClickEffect: (effect: ClickEffect) => void;
  removeClickEffect: (effectId: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  resetGame: () => void;
  saveGame: () => void;
}

export const useGameState = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...createInitialGameState(),
      clickEffects: [],
      isLoading: false,
      error: null,

      // Actions
      incrementStardust: (amount: bigint) => {
        set((state) => ({
          stardust: state.stardust + amount,
        }));
      },

      handleClick: (x: number, y: number) => {
        const state = get();
        const newState = processClick(state);
        
        // Create click effect
        const effect: ClickEffect = {
          id: Math.random().toString(36),
          x,
          y,
          value: Number(state.stardustPerClick),
          timestamp: Date.now(),
        };

        set({
          ...newState,
          clickEffects: [...state.clickEffects, effect],
        });

        // Remove effect after animation
        setTimeout(() => {
          get().removeClickEffect(effect.id);
        }, 1000);
      },

      buyUpgrade: (upgradeId: string) => {
        const state = get();
        const newState = purchaseUpgrade(state, upgradeId);
        
        if (newState !== state) {
          set(newState);
          get().saveGame();
        }
      },

      processIdleRewards: () => {
        const state = get();
        const currentTime = Date.now();
        const timeElapsed = Math.floor((currentTime - state.lastSaveTime) / 1000);
        
        if (timeElapsed > 0) {
          const idleRewards = calculateIdleRewards(state.stardustPerSecond, timeElapsed);
          
          set({
            stardust: state.stardust + idleRewards,
            lastSaveTime: currentTime,
          });
        }
      },

      activatePrestigeMode: () => {
        const state = get();
        if (canActivatePrestige(state)) {
          const newState = activatePrestige(state);
          set(newState);
          get().saveGame();
        }
      },

      updateCredits: (amount: bigint) => {
        set({ credits: amount });
      },

      resetCredits: () => {
        set({ credits: BigInt(0) });
      },

      updateWalletConnection: (connected: boolean, address: string) => {
        set({
          walletConnected: connected,
          userAddress: address,
        });
      },

      addClickEffect: (effect: ClickEffect) => {
        set((state) => ({
          clickEffects: [...state.clickEffects, effect],
        }));
      },

      removeClickEffect: (effectId: string) => {
        set((state) => ({
          clickEffects: state.clickEffects.filter(effect => effect.id !== effectId),
        }));
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      resetGame: () => {
        set({
          ...createInitialGameState(),
          clickEffects: [],
          isLoading: false,
          error: null,
        });
      },

      saveGame: () => {
        set({ lastSaveTime: Date.now() });
      },
    }),
    {
      name: 'star-miner-game-state',
      // Only persist game data, not UI state
      partialize: (state) => ({
        stardust: state.stardust,
        stardustPerClick: state.stardustPerClick,
        stardustPerSecond: state.stardustPerSecond,
        totalClicks: state.totalClicks,
        upgrades: state.upgrades,
        credits: state.credits,
        walletConnected: state.walletConnected,
        userAddress: state.userAddress,
        prestigeLevel: state.prestigeLevel,
        achievements: state.achievements,
        lastSaveTime: state.lastSaveTime,
      }),
      // Custom serialization for BigInt
      serialize: (state) => {
        const serialized = JSON.stringify(state, (key, value) =>
          typeof value === 'bigint' ? value.toString() + 'n' : value
        );
        return serialized;
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str, (key, value) => {
          if (typeof value === 'string' && value.endsWith('n')) {
            return BigInt(value.slice(0, -1));
          }
          return value;
        });
        return parsed;
      },
    }
  )
);

// Custom hook for idle game loop
export const useIdleGameLoop = () => {
  const { processIdleRewards, stardustPerSecond, incrementStardust } = useGameState();

  React.useEffect(() => {
    // Process idle rewards on mount
    processIdleRewards();

    // Set up idle generation interval
    const interval = setInterval(() => {
      if (stardustPerSecond > 0) {
        incrementStardust(stardustPerSecond);
      }
    }, GAME_CONSTANTS.IDLE_CALCULATION_INTERVAL);

    // Set up auto-save interval
    const autoSaveInterval = setInterval(() => {
      useGameState.getState().saveGame();
    }, GAME_CONSTANTS.AUTO_SAVE_INTERVAL);

    return () => {
      clearInterval(interval);
      clearInterval(autoSaveInterval);
    };
  }, [stardustPerSecond, incrementStardust, processIdleRewards]);
};

// Helper hook for upgrade calculations
export const useUpgradeCalculations = () => {
  const gameState = useGameState();

  const recalculateRates = React.useCallback(() => {
    const newStardustPerClick = calculateStardustPerClick(gameState);
    const newStardustPerSecond = calculateStardustPerSecond(gameState);
    
    useGameState.setState({
      stardustPerClick: newStardustPerClick,
      stardustPerSecond: newStardustPerSecond,
    });
  }, [gameState]);

  React.useEffect(() => {
    recalculateRates();
  }, [gameState.upgrades, gameState.prestigeLevel, recalculateRates]);

  return { recalculateRates };
};