// React context provider for ChainBrawler
// Based on REFACTORING_PLAN.md

import type { ChainBrawlerConfig, UXState } from "@chainbrawler/core";
import React, { createContext, type ReactNode, useContext } from "react";
import { useChainBrawler } from "../hooks/useChainBrawler";

interface ChainBrawlerContextValue {
  // State
  character: UXState["character"];
  menu: UXState["menu"];
  operation: UXState["operation"];
  pools: UXState["pools"];
  leaderboard: UXState["leaderboard"];
  claims: UXState["claims"];
  statusMessage: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  actions: any; // SDK actions object

  // Config
  config: ChainBrawlerConfig;
}

const ChainBrawlerContext = createContext<ChainBrawlerContextValue | null>(null);

export interface ChainBrawlerProviderProps {
  config: ChainBrawlerConfig;
  children: ReactNode;
}

export function ChainBrawlerProvider({ config, children }: ChainBrawlerProviderProps) {
  const chainBrawler = useChainBrawler(config);

  const value: ChainBrawlerContextValue = {
    character: chainBrawler.character,
    menu: chainBrawler.menu,
    operation: chainBrawler.operation,
    pools: chainBrawler.pools,
    leaderboard: chainBrawler.leaderboard,
    claims: chainBrawler.claims,
    statusMessage: chainBrawler.statusMessage,
    isLoading: chainBrawler.isLoading,
    error: chainBrawler.error,
    actions: chainBrawler.actions,
    config,
  };

  return <ChainBrawlerContext.Provider value={value}>{children}</ChainBrawlerContext.Provider>;
}

export function useChainBrawlerContext(): ChainBrawlerContextValue {
  const context = useContext(ChainBrawlerContext);
  if (!context) {
    throw new Error("useChainBrawlerContext must be used within a ChainBrawlerProvider");
  }
  return context;
}
