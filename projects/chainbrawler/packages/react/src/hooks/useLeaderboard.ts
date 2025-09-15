// React hook for leaderboard data
// Based on REFACTORING_PLAN.md

import { useChainBrawlerContext } from "../providers/ChainBrawlerProvider";

export function useLeaderboard() {
  const { leaderboard, isLoading, error, actions } = useChainBrawlerContext();

  return {
    leaderboard,
    isLoading,
    error,
    loadLeaderboard: actions?.loadLeaderboard,
    refreshLeaderboard: actions?.refreshLeaderboard,
  };
}
