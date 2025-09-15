// Web-specific React hook for ChainBrawler SDK using WebAdapter
// Uses wagmi/core generated functions with RainbowKit integration

import type { ChainBrawlerConfig, UXState } from "@chainbrawler/core";
import { useEffect, useState } from "react";
import { WebAdapter } from "../adapters/WebAdapter";

export function useWebChainBrawler(config?: ChainBrawlerConfig) {
  const [adapter, setAdapter] = useState<WebAdapter | null>(null);
  const [state, setState] = useState<UXState>({
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
  });

  useEffect(() => {
    // Only create adapter if we have the required config
    if (config?.address && config?.publicClient && config?.wagmiConfig) {
      const adapter = new WebAdapter(config);
      setAdapter(adapter);

      // Subscribe to state changes
      const unsubscribe = adapter.subscribe((newState) => {
        setState(newState);
      });

      // Listen for character data refresh events
      const handleCharacterDataRefresh = async (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail?.shouldRefresh && config?.walletClient?.account?.address) {
          await adapter.refreshCharacterData(config.walletClient.account.address);
        }
      };

      window.addEventListener("characterDataRefresh", handleCharacterDataRefresh);

      // Adapter initializes automatically in constructor

      return () => {
        unsubscribe();
        window.removeEventListener("characterDataRefresh", handleCharacterDataRefresh);
        adapter.cleanup();
      };
    }
  }, [config?.address, config?.publicClient, config?.wagmiConfig, config?.walletClient]);

  // Update adapter when wallet client changes (wallet connection/disconnection)
  useEffect(() => {
    if (adapter && config?.walletClient !== undefined) {
      adapter.updateWalletClient(config.walletClient).catch(() => {
        // Silent fail - UX refresh will be retried on next interaction
      });
    }
  }, [adapter, config?.walletClient]);

  // Player address is now automatically handled by updateWalletClient
  // No need for separate effect since wallet client changes trigger player address updates

  const defaultActions = {
    createCharacter: () => Promise.resolve({ success: false, error: "Not initialized" }),
    getCharacter: () => Promise.resolve(null),
    healCharacter: () => Promise.resolve({ success: false, error: "Not initialized" }),
    resurrectCharacter: () => Promise.resolve({ success: false, error: "Not initialized" }),
    fightEnemy: () => Promise.resolve({ success: false, error: "Not initialized" }),
    continueFight: () => Promise.resolve({ success: false, error: "Not initialized" }),
    fleeRound: () => Promise.resolve({ success: false, error: "Not initialized" }),
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
