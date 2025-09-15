import { renderHook } from "@testing-library/react";
import { useLeaderboard } from "../../hooks/useLeaderboard";

// Mock the context provider
vi.mock("../../providers/ChainBrawlerProvider", () => ({
  useChainBrawlerContext: vi.fn(),
}));

describe("useLeaderboard", () => {
  const mockLeaderboard = {
    currentEpoch: 5n,
    epochTimeRemaining: 3600n,
    playerRank: 15n,
    playerScore: 2500n,
    totalPlayers: 100n,
    topPlayers: [
      {
        address: "0xabcdef1234567890abcdef1234567890abcdef12",
        rank: 1n,
        score: 5000n,
        level: 25,
        kills: 50,
        isCurrentPlayer: false,
      },
      {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        rank: 2n,
        score: 4500n,
        level: 22,
        kills: 45,
        isCurrentPlayer: true,
      },
    ],
    lastUpdated: Date.now(),
  };

  const mockActions = {
    loadLeaderboard: vi.fn(),
    refreshLeaderboard: vi.fn(),
    createCharacter: vi.fn(),
    getCharacter: vi.fn(),
    healCharacter: vi.fn(),
    resurrectCharacter: vi.fn(),
    loadPools: vi.fn(),
    refreshPools: vi.fn(),
    loadClaims: vi.fn(),
    refreshClaims: vi.fn(),
    claimPrize: vi.fn(),
    clearError: vi.fn(),
    refreshAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return leaderboard data from context", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: mockLeaderboard,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.leaderboard).toEqual(mockLeaderboard);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.loadLeaderboard).toBe(mockActions.loadLeaderboard);
    expect(result.current.refreshLeaderboard).toBe(mockActions.refreshLeaderboard);
  });

  it("should return loading state from context", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: null,
      isLoading: true,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.leaderboard).toBe(null);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.loadLeaderboard).toBe(mockActions.loadLeaderboard);
    expect(result.current.refreshLeaderboard).toBe(mockActions.refreshLeaderboard);
  });

  it("should return error state from context", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: null,
      isLoading: false,
      error: "Failed to load leaderboard",
      actions: mockActions,
    });

    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.leaderboard).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Failed to load leaderboard");
    expect(result.current.loadLeaderboard).toBe(mockActions.loadLeaderboard);
    expect(result.current.refreshLeaderboard).toBe(mockActions.refreshLeaderboard);
  });

  it("should provide access to loadLeaderboard and refreshLeaderboard actions", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: mockLeaderboard,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useLeaderboard());

    expect(typeof result.current.loadLeaderboard).toBe("function");
    expect(typeof result.current.refreshLeaderboard).toBe("function");
    expect(result.current.loadLeaderboard).toBe(mockActions.loadLeaderboard);
    expect(result.current.refreshLeaderboard).toBe(mockActions.refreshLeaderboard);
  });

  it("should handle null leaderboard data", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: null,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.leaderboard).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should update when context changes", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    const mockContextFn = vi.mocked(useChainBrawlerContext);

    // Initial state
    mockContextFn.mockReturnValue({
      leaderboard: null,
      isLoading: true,
      error: null,
      actions: mockActions,
    });

    const { result, rerender } = renderHook(() => useLeaderboard());

    expect(result.current.leaderboard).toBe(null);
    expect(result.current.isLoading).toBe(true);

    // Update context
    mockContextFn.mockReturnValue({
      leaderboard: mockLeaderboard,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    rerender();

    expect(result.current.leaderboard).toEqual(mockLeaderboard);
    expect(result.current.isLoading).toBe(false);
  });

  it("should maintain action references across re-renders", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: mockLeaderboard,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result, rerender } = renderHook(() => useLeaderboard());

    const initialLoadLeaderboard = result.current.loadLeaderboard;
    const initialRefreshLeaderboard = result.current.refreshLeaderboard;

    rerender();

    expect(result.current.loadLeaderboard).toBe(initialLoadLeaderboard);
    expect(result.current.refreshLeaderboard).toBe(initialRefreshLeaderboard);
  });

  it("should handle complex leaderboard data structures", async () => {
    const complexLeaderboard = {
      ...mockLeaderboard,
      topPlayers: [
        ...mockLeaderboard.topPlayers,
        {
          address: "0xfedcba0987654321fedcba0987654321fedcba09",
          rank: 3n,
          score: 4000n,
          level: 20,
          kills: 40,
          isCurrentPlayer: false,
        },
      ],
    };

    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: complexLeaderboard,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.leaderboard).toEqual(complexLeaderboard);
    expect(result.current.leaderboard.topPlayers).toHaveLength(3);
    expect(result.current.leaderboard.topPlayers[2].rank).toBe(3n);
  });

  it("should handle undefined actions gracefully", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: mockLeaderboard,
      isLoading: false,
      error: null,
      actions: {} as any,
    });

    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.leaderboard).toEqual(mockLeaderboard);
    expect(result.current.loadLeaderboard).toBeUndefined();
    expect(result.current.refreshLeaderboard).toBeUndefined();
  });

  it("should handle leaderboard with empty top players", async () => {
    const emptyLeaderboard = {
      ...mockLeaderboard,
      topPlayers: [],
      totalPlayers: 0n,
      playerRank: 0n,
      playerScore: 0n,
    };

    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: emptyLeaderboard,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.leaderboard).toEqual(emptyLeaderboard);
    expect(result.current.leaderboard.topPlayers).toHaveLength(0);
    expect(result.current.leaderboard.totalPlayers).toBe(0n);
  });
});
