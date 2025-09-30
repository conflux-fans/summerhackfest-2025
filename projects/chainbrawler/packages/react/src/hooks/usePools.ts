// React hook for pools data
// Based on REFACTORING_PLAN.md

import { useChainBrawlerContext } from "../providers/ChainBrawlerProvider";

export function usePools() {
  const { pools, isLoading, error, actions } = useChainBrawlerContext();

  return {
    pools,
    isLoading,
    error,
    loadPools: actions?.loadPools,
    refreshPools: actions?.refreshPools,
  };
}
