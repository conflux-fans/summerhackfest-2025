// React hook for ChainBrawler SDK
// Based on REFACTORING_PLAN.md

import { type ChainBrawlerConfig, UXState } from "@chainbrawler/core";
import { useEffect, useState } from "react";
import { ReactAdapter } from "../adapters/ReactAdapter";
import { useUXState } from "./useUXState";

export function useChainBrawler(config: ChainBrawlerConfig) {
  const [adapter, setAdapter] = useState<ReactAdapter | null>(null);
  const [uxStore, setUxStore] = useState<any>(null);

  useEffect(() => {
    // Only create adapter if we have the required config
    if (config?.address && config?.publicClient) {
      const adapter = new ReactAdapter(config);
      setAdapter(adapter);
      setUxStore(adapter.getSDK().getStore());

      return () => {
        adapter.cleanup();
      };
    }
  }, [config?.address, config?.publicClient]);

  // Update adapter when wallet client changes
  useEffect(() => {
    if (adapter && config?.walletClient !== undefined) {
      adapter.updateWalletClient(config.walletClient);
    }
  }, [adapter, config?.walletClient]);

  // Use the UX state hook if we have a store, otherwise use default state
  const state = uxStore
    ? useUXState(uxStore)
    : {
        playerAddress: null,
        character: null,
        menu: null,
        operation: null,
        pools: null,
        leaderboard: null,
        claims: null,
        statusMessage: "Initializing...",
        isLoading: true,
        error: null,
      };

  const defaultActions = {
    createCharacter: () => Promise.resolve({ success: false, error: "Not initialized" }),
    getCharacter: () => Promise.resolve(null),
    healCharacter: () => Promise.resolve({ success: false, error: "Not initialized" }),
    resurrectCharacter: () => Promise.resolve({ success: false, error: "Not initialized" }),
    loadPools: () => Promise.resolve({ success: false, error: "Not initialized" }),
    refreshPools: () => Promise.resolve({ success: false, error: "Not initialized" }),
    loadLeaderboard: () => Promise.resolve({ success: false, error: "Not initialized" }),
    refreshLeaderboard: () => Promise.resolve({ success: false, error: "Not initialized" }),
    loadClaims: () => Promise.resolve({ success: false, error: "Not initialized" }),
    refreshClaims: () => Promise.resolve({ success: false, error: "Not initialized" }),
    claimPrize: () => Promise.resolve({ success: false, error: "Not initialized" }),
    clearError: () => {},
    refreshAll: () => Promise.resolve({ success: false, error: "Not initialized" }),
  };

  return {
    ...state,
    sdk: adapter?.getSDK(),
    actions: adapter?.getSDK()?.actions || defaultActions,
  };
}
