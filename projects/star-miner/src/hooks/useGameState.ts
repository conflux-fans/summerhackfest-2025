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
  debouncedSave: () => void;
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
        // Auto-save on stardust changes
        get().saveGame();
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
          // Auto-save idle rewards
          get().saveGame();
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
        // Automatically save when credits are updated
        get().saveGame();
      },

      resetCredits: () => {
        set({ credits: BigInt(0) });
        // Auto-save when credits are reset
        get().saveGame();
      },

      updateWalletConnection: (connected: boolean, address: string) => {
        set({
          walletConnected: connected,
          userAddress: address,
        });
        // Auto-save wallet connection changes
        get().saveGame();
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
        const currentState = get();
        set({ lastSaveTime: Date.now() });
        // Debug: Log what's being saved
        // console.log('💾 Saving game state:', {
        //   stardust: currentState.stardust.toString(),
        //   credits: currentState.credits.toString(),
        //   prestigeLevel: currentState.prestigeLevel,
        //   upgrades: Object.keys(currentState.upgrades).length,
        //   totalClicks: currentState.totalClicks,
        // });
      },

      debouncedSave: (() => {
        let timeoutId: NodeJS.Timeout | null = null;
        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => {
            get().saveGame();
          }, 100); // Debounce saves by 100ms
        };
      })(),
    }),
    {
      name: 'star-miner-game-state',
      // Only persist game data, not UI state
      // Credits are persisted locally and synced with blockchain on save
      // Wallet connection state is NOT persisted - managed by useWallet hook
      partialize: (state) => ({
        stardust: state.stardust,
        stardustPerClick: state.stardustPerClick,
        stardustPerSecond: state.stardustPerSecond,
        totalClicks: state.totalClicks,
        upgrades: state.upgrades,
        credits: state.credits, // Persisted locally, synced on save
        // walletConnected: state.walletConnected, // Removed - not persisted
        // userAddress: state.userAddress, // Removed - not persisted
        prestigeLevel: state.prestigeLevel,
        achievements: state.achievements,
        lastSaveTime: state.lastSaveTime,
      }),
      // Custom serialization for BigInt
      serialize: (state) => {
        const serialized = JSON.stringify(state, (key, value) => {
          if (typeof value === 'bigint') {
            return value.toString() + 'n';
          }
          return value;
        });
        return serialized;
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str, (key, value) => {
          // Only convert to BigInt if it's a string ending with 'n' and not prestigeLevel
          if (typeof value === 'string' && value.endsWith('n') && key !== 'prestigeLevel') {
            return BigInt(value.slice(0, -1));
          }
          // Handle prestigeLevel specifically as a number
          if (key === 'prestigeLevel' && typeof value === 'string' && value.endsWith('n')) {
            return parseInt(value.slice(0, -1));
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
    // Auto-save when rates are recalculated
    useGameState.getState().saveGame();
  }, [gameState]);

  React.useEffect(() => {
    recalculateRates();
  }, [gameState.upgrades, gameState.prestigeLevel, recalculateRates]);

  return { recalculateRates };
};
// Hydration-safe hook to ensure state is loaded properly
export const useHydratedGameState = () => {
  const [isHydrated, setIsHydrated] = React.useState(false);
  const gameState = useGameState();

  React.useEffect(() => {
    // Force hydration on client side
    setIsHydrated(true);
    
    // Debug: Log initial state after hydration
    console.log('🔄 Game state hydrated:', {
      stardust: gameState.stardust.toString(),
      credits: gameState.credits.toString(),
      prestigeLevel: gameState.prestigeLevel,
      upgrades: Object.keys(gameState.upgrades).length,
      totalClicks: gameState.totalClicks,
    });
  }, []);

  return {
    ...gameState,
    isHydrated,
  };
};