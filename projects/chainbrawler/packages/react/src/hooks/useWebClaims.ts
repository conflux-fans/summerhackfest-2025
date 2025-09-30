// Web-specific React hook for claims data using WebAdapter
// Based on REFACTORING_PLAN.md

import { useWebChainBrawlerContext } from "../providers/WebChainBrawlerProvider";

export function useWebClaims() {
  const { claims, isLoading, error, actions } = useWebChainBrawlerContext();

  return {
    claims,
    isLoading,
    error,
    loadClaims: actions?.loadClaims || (() => Promise.resolve()),
    refreshClaims: actions?.refreshClaims || (() => Promise.resolve()),
    claimPrize: actions?.claimPrize || (() => Promise.resolve()),
  };
}
