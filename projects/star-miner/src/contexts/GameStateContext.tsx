'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

interface GameStateContextType extends GameState {
  // UI state
  clickEffects: ClickEffect[];
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  
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
  recalculateRates: () => void;
  updateFromBlockchain: (blockchainState: any) => void;
  updateMultipleFields: (updates: Partial<GameState>) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

interface GameStateProviderProps {
  children: ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
  // Initialize state from localStorage or default
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('star-miner-game-state');
        if (saved) {
          const parsed = JSON.parse(saved, (key, value) => {
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
          return { ...createInitialGameState(), ...parsed.state };
        }
      } catch (error) {
        console.error('Failed to load game state from localStorage:', error);
      }
    }
    return createInitialGameState();
  });

  // UI state
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Debounced save function
  const debouncedSaveRef = React.useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage
  const saveToStorage = useCallback((state: GameState) => {
    if (typeof window !== 'undefined') {
      try {
        const toSave = {
          stardust: state.stardust,
          stardustPerClick: state.stardustPerClick,
          stardustPerSecond: state.stardustPerSecond,
          totalClicks: state.totalClicks,
          upgrades: state.upgrades,
          credits: state.credits,
          prestigeLevel: state.prestigeLevel,
          achievements: state.achievements,
          lastSaveTime: state.lastSaveTime,
        };

        const serialized = JSON.stringify({ state: toSave }, (key, value) => {
          if (typeof value === 'bigint') {
            return value.toString() + 'n';
          }
          return value;
        });

        localStorage.setItem('star-miner-game-state', serialized);
      } catch (error) {
        console.error('Failed to save game state to localStorage:', error);
      }
    }
  }, []);

  // Actions
  const incrementStardust = useCallback((amount: bigint) => {
    setGameState(prev => {
      const newState = { ...prev, stardust: prev.stardust + amount };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  const handleClick = useCallback((x: number, y: number) => {
    setGameState(prev => {
      const newState = processClick(prev);
      
      // Create click effect
      const effect: ClickEffect = {
        id: Math.random().toString(36),
        x,
        y,
        value: Number(prev.stardustPerClick),
        timestamp: Date.now(),
      };

      setClickEffects(prevEffects => [...prevEffects, effect]);

      // Remove effect after animation
      setTimeout(() => {
        setClickEffects(prevEffects => prevEffects.filter(e => e.id !== effect.id));
      }, 1000);

      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  const buyUpgrade = useCallback((upgradeId: string) => {
    setGameState(prev => {
      const newState = purchaseUpgrade(prev, upgradeId);
      if (newState !== prev) {
        saveToStorage(newState);
        return newState;
      }
      return prev;
    });
  }, [saveToStorage]);

  const processIdleRewards = useCallback(() => {
    setGameState(prev => {
      const currentTime = Date.now();
      const timeElapsed = Math.floor((currentTime - prev.lastSaveTime) / 1000);
      
      if (timeElapsed > 0) {
        const idleRewards = calculateIdleRewards(prev.stardustPerSecond, timeElapsed);
        const newState = {
          ...prev,
          stardust: prev.stardust + idleRewards,
          lastSaveTime: currentTime,
        };
        saveToStorage(newState);
        return newState;
      }
      return prev;
    });
  }, [saveToStorage]);

  const activatePrestigeMode = useCallback(() => {
    setGameState(prev => {
      if (canActivatePrestige(prev)) {
        const newState = activatePrestige(prev);
        saveToStorage(newState);
        return newState;
      }
      return prev;
    });
  }, [saveToStorage]);

  const updateCredits = useCallback((amount: bigint) => {
    setGameState(prev => {
      const newState = { ...prev, credits: amount };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  const resetCredits = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, credits: BigInt(0) };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  const updateWalletConnection = useCallback((connected: boolean, address: string) => {
    setGameState(prev => {
      const newState = {
        ...prev,
        walletConnected: connected,
        userAddress: address,
      };
      // Note: Wallet connection state is not persisted to localStorage
      // It's managed by WalletContext
      return newState;
    });
  }, []);

  const addClickEffect = useCallback((effect: ClickEffect) => {
    setClickEffects(prev => [...prev, effect]);
  }, []);

  const removeClickEffect = useCallback((effectId: string) => {
    setClickEffects(prev => prev.filter(effect => effect.id !== effectId));
  }, []);

  const setErrorState = useCallback((error: string | null) => {
    setError(error);
  }, []);

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const resetGame = useCallback(() => {
    const newState = createInitialGameState();
    setGameState(newState);
    setClickEffects([]);
    setIsLoading(false);
    setError(null);
    saveToStorage(newState);
  }, [saveToStorage]);

  const saveGame = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev, lastSaveTime: Date.now() };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  const debouncedSave = useCallback(() => {
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current);
    }
    debouncedSaveRef.current = setTimeout(() => {
      saveGame();
    }, 100);
  }, [saveGame]);

  const recalculateRates = useCallback(() => {
    setGameState(prev => {
      const newStardustPerClick = calculateStardustPerClick(prev);
      const newStardustPerSecond = calculateStardustPerSecond(prev);
      
      const newState = {
        ...prev,
        stardustPerClick: newStardustPerClick,
        stardustPerSecond: newStardustPerSecond,
      };
      
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  const updateFromBlockchain = useCallback((blockchainState: any) => {
    setGameState(prev => {
      const newState = {
        ...prev,
        stardust: blockchainState.stardust,
        totalClicks: blockchainState.totalClicks,
        prestigeLevel: blockchainState.prestigeLevel,
        lastSaveTime: blockchainState.lastUpdateTime * 1000, // Convert to milliseconds
      };
      saveToStorage(newState);
      return newState;
    });

    // Process idle rewards if any
    if (blockchainState.idleRewards > 0n) {
      incrementStardust(blockchainState.idleRewards);
    }
  }, [saveToStorage, incrementStardust]);

  const updateMultipleFields = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => {
      const newState = { ...prev, ...updates };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
    
    // Debug: Log initial state after hydration
    console.log('🔄 Game state hydrated:', {
      stardust: gameState.stardust.toString(),
      credits: gameState.credits.toString(),
      prestigeLevel: gameState.prestigeLevel,
      upgrades: Object.keys(gameState.upgrades).length,
      totalClicks: gameState.totalClicks,
    });
  }, [gameState.stardust, gameState.credits, gameState.prestigeLevel, gameState.upgrades, gameState.totalClicks]);

  // Recalculate rates when upgrades or prestige level changes
  useEffect(() => {
    recalculateRates();
  }, [gameState.upgrades, gameState.prestigeLevel, recalculateRates]);

  // Idle game loop
  useEffect(() => {
    // Process idle rewards on mount
    processIdleRewards();

    // Set up idle generation interval
    const interval = setInterval(() => {
      if (gameState.stardustPerSecond > 0) {
        incrementStardust(gameState.stardustPerSecond);
      }
    }, GAME_CONSTANTS.IDLE_CALCULATION_INTERVAL);

    // Set up auto-save interval
    const autoSaveInterval = setInterval(() => {
      saveGame();
    }, GAME_CONSTANTS.AUTO_SAVE_INTERVAL);

    return () => {
      clearInterval(interval);
      clearInterval(autoSaveInterval);
    };
  }, [gameState.stardustPerSecond, incrementStardust, processIdleRewards, saveGame]);

  // Cleanup debounced save on unmount
  useEffect(() => {
    return () => {
      if (debouncedSaveRef.current) {
        clearTimeout(debouncedSaveRef.current);
      }
    };
  }, []);

  const contextValue: GameStateContextType = {
    ...gameState,
    clickEffects,
    isLoading,
    error,
    isHydrated,
    incrementStardust,
    handleClick,
    buyUpgrade,
    processIdleRewards,
    activatePrestigeMode,
    updateCredits,
    resetCredits,
    updateWalletConnection,
    addClickEffect,
    removeClickEffect,
    setError: setErrorState,
    setLoading: setLoadingState,
    resetGame,
    saveGame,
    debouncedSave,
    recalculateRates,
    updateFromBlockchain,
    updateMultipleFields,
  };

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameStateContext = (): GameStateContextType => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameStateContext must be used within a GameStateProvider');
  }
  return context;
};

// Legacy hooks for backward compatibility during migration
export const useIdleGameLoop = () => {
  // This is now handled internally by the GameStateProvider
  // Keep this hook for compatibility but it doesn't need to do anything
  return {};
};

export const useUpgradeCalculations = () => {
  const { recalculateRates } = useGameStateContext();
  return { recalculateRates };
};

export const useHydratedGameState = () => {
  return useGameStateContext();
};