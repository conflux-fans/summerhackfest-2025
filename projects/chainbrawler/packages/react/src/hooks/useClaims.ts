// React hook for claims data
// Based on REFACTORING_PLAN.md

import { useChainBrawlerContext } from "../providers/ChainBrawlerProvider";

export function useClaims() {
  const { claims, isLoading, error, actions } = useChainBrawlerContext();

  return {
    claims,
    isLoading,
    error,
    loadClaims: actions?.loadClaims,
    refreshClaims: actions?.refreshClaims,
    claimPrize: actions?.claimPrize,
  };
}
