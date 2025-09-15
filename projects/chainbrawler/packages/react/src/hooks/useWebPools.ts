// Web-specific React hook for pools data using WebAdapter
// Based on REFACTORING_PLAN.md

import { useWebChainBrawlerContext } from "../providers/WebChainBrawlerProvider";

export function useWebPools() {
  const { pools, isLoading, error, actions } = useWebChainBrawlerContext();

  return {
    pools,
    isLoading,
    error,
    loadPools: actions?.loadPools || (() => Promise.resolve()),
    refreshPools: actions?.refreshPools || (() => Promise.resolve()),
  };
}
