// Web-specific React hook for leaderboard data using WebAdapter
// Based on REFACTORING_PLAN.md

import { useWebChainBrawlerContext } from "../providers/WebChainBrawlerProvider";

export function useWebLeaderboard() {
  const { leaderboard, isLoading, error, actions } = useWebChainBrawlerContext();

  return {
    leaderboard,
    isLoading,
    error,
    loadLeaderboard: actions?.loadLeaderboard || (() => Promise.resolve()),
    refreshLeaderboard: actions?.refreshLeaderboard || (() => Promise.resolve()),
  };
}
