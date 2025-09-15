// Web-specific React context provider for ChainBrawler using WebAdapter
// Uses wagmi/core generated functions with RainbowKit integration

import type { ChainBrawlerConfig, UXState } from "@chainbrawler/core";
import React, { createContext, type ReactNode, useContext } from "react";
import { useWebChainBrawler } from "../hooks/useWebChainBrawler";

interface WebChainBrawlerContextValue {
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
  config?: ChainBrawlerConfig;
}

const WebChainBrawlerContext = createContext<WebChainBrawlerContextValue | null>(null);

export interface WebChainBrawlerProviderProps {
  config?: ChainBrawlerConfig;
  children: ReactNode;
}

export function WebChainBrawlerProvider({ config, children }: WebChainBrawlerProviderProps) {
  const chainBrawler = useWebChainBrawler(config);

  console.log("WebChainBrawlerProvider: chainBrawler state:", chainBrawler);

  const value: WebChainBrawlerContextValue = {
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

  return (
    <WebChainBrawlerContext.Provider value={value}>{children}</WebChainBrawlerContext.Provider>
  );
}

export function useWebChainBrawlerContext(): WebChainBrawlerContextValue {
  const context = useContext(WebChainBrawlerContext);
  if (!context) {
    throw new Error("useWebChainBrawlerContext must be used within a WebChainBrawlerProvider");
  }
  return context;
}
