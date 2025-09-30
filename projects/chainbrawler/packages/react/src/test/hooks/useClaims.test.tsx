import { renderHook } from "@testing-library/react";
import { useClaims } from "../../hooks/useClaims";

// Mock the context provider
vi.mock("../../providers/ChainBrawlerProvider", () => ({
  useChainBrawlerContext: vi.fn(),
}));

describe("useClaims", () => {
  const mockClaims = {
    totalClaimable: 1500n,
    available: [
      {
        description: "Prize Pool Reward - Epoch 3",
        amount: 1000n,
        type: "PRIZE_POOL",
        epoch: 3,
        index: 0,
        canClaim: true,
        proof: ["0xabcd1234..."],
      },
      {
        description: "Equipment Pool Reward",
        amount: 500n,
        type: "EQUIPMENT_POOL",
        epoch: 2,
        index: 1,
        canClaim: true,
        proof: ["0xefgh5678..."],
      },
      {
        description: "Expired Reward",
        amount: 200n,
        type: "PRIZE_POOL",
        epoch: 1,
        index: 2,
        canClaim: false,
        proof: null,
      },
    ],
    lastChecked: Date.now(),
  };

  const mockActions = {
    loadClaims: vi.fn(),
    refreshClaims: vi.fn(),
    claimPrize: vi.fn(),
    createCharacter: vi.fn(),
    getCharacter: vi.fn(),
    healCharacter: vi.fn(),
    resurrectCharacter: vi.fn(),
    loadPools: vi.fn(),
    refreshPools: vi.fn(),
    loadLeaderboard: vi.fn(),
    refreshLeaderboard: vi.fn(),
    clearError: vi.fn(),
    refreshAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return claims data from context", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaims,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useClaims());

    expect(result.current.claims).toEqual(mockClaims);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.loadClaims).toBe(mockActions.loadClaims);
    expect(result.current.refreshClaims).toBe(mockActions.refreshClaims);
    expect(result.current.claimPrize).toBe(mockActions.claimPrize);
  });

  it("should return loading state from context", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: null,
      isLoading: true,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useClaims());

    expect(result.current.claims).toBe(null);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.loadClaims).toBe(mockActions.loadClaims);
    expect(result.current.refreshClaims).toBe(mockActions.refreshClaims);
    expect(result.current.claimPrize).toBe(mockActions.claimPrize);
  });

  it("should return error state from context", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: null,
      isLoading: false,
      error: "Failed to load claims",
      actions: mockActions,
    });

    const { result } = renderHook(() => useClaims());

    expect(result.current.claims).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Failed to load claims");
    expect(result.current.loadClaims).toBe(mockActions.loadClaims);
    expect(result.current.refreshClaims).toBe(mockActions.refreshClaims);
    expect(result.current.claimPrize).toBe(mockActions.claimPrize);
  });

  it("should provide access to all claims-related actions", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaims,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useClaims());

    expect(typeof result.current.loadClaims).toBe("function");
    expect(typeof result.current.refreshClaims).toBe("function");
    expect(typeof result.current.claimPrize).toBe("function");
    expect(result.current.loadClaims).toBe(mockActions.loadClaims);
    expect(result.current.refreshClaims).toBe(mockActions.refreshClaims);
    expect(result.current.claimPrize).toBe(mockActions.claimPrize);
  });

  it("should handle null claims data", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: null,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useClaims());

    expect(result.current.claims).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should update when context changes", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    const mockContextFn = vi.mocked(useChainBrawlerContext);

    // Initial state
    mockContextFn.mockReturnValue({
      claims: null,
      isLoading: true,
      error: null,
      actions: mockActions,
    });

    const { result, rerender } = renderHook(() => useClaims());

    expect(result.current.claims).toBe(null);
    expect(result.current.isLoading).toBe(true);

    // Update context
    mockContextFn.mockReturnValue({
      claims: mockClaims,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    rerender();

    expect(result.current.claims).toEqual(mockClaims);
    expect(result.current.isLoading).toBe(false);
  });

  it("should maintain action references across re-renders", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaims,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result, rerender } = renderHook(() => useClaims());

    const initialLoadClaims = result.current.loadClaims;
    const initialRefreshClaims = result.current.refreshClaims;
    const initialClaimPrize = result.current.claimPrize;

    rerender();

    expect(result.current.loadClaims).toBe(initialLoadClaims);
    expect(result.current.refreshClaims).toBe(initialRefreshClaims);
    expect(result.current.claimPrize).toBe(initialClaimPrize);
  });

  it("should handle empty claims data", async () => {
    const emptyClaims = {
      totalClaimable: 0n,
      available: [],
      lastChecked: Date.now(),
    };

    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: emptyClaims,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useClaims());

    expect(result.current.claims).toEqual(emptyClaims);
    expect(result.current.claims.totalClaimable).toBe(0n);
    expect(result.current.claims.available).toHaveLength(0);
  });

  it("should handle complex claims data structures", async () => {
    const complexClaims = {
      ...mockClaims,
      available: [
        ...mockClaims.available,
        {
          description: "Special Event Reward",
          amount: 2000n,
          type: "SPECIAL_EVENT",
          epoch: 4,
          index: 3,
          canClaim: true,
          proof: ["0xijk9012...", "0xlmn3456..."],
        },
      ],
      totalClaimable: 3700n,
    };

    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: complexClaims,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useClaims());

    expect(result.current.claims).toEqual(complexClaims);
    expect(result.current.claims.available).toHaveLength(4);
    expect(result.current.claims.totalClaimable).toBe(3700n);
    expect(result.current.claims.available[3].type).toBe("SPECIAL_EVENT");
  });

  it("should handle undefined actions gracefully", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaims,
      isLoading: false,
      error: null,
      actions: {} as any,
    });

    const { result } = renderHook(() => useClaims());

    expect(result.current.claims).toEqual(mockClaims);
    expect(result.current.loadClaims).toBeUndefined();
    expect(result.current.refreshClaims).toBeUndefined();
    expect(result.current.claimPrize).toBeUndefined();
  });

  it("should handle claims with mixed claimable status", async () => {
    const mixedClaims = {
      totalClaimable: 1000n,
      available: [
        {
          description: "Claimable Reward 1",
          amount: 500n,
          type: "PRIZE_POOL",
          epoch: 3,
          index: 0,
          canClaim: true,
          proof: ["0xabcd..."],
        },
        {
          description: "Claimable Reward 2",
          amount: 500n,
          type: "EQUIPMENT_POOL",
          epoch: 3,
          index: 1,
          canClaim: true,
          proof: ["0xefgh..."],
        },
        {
          description: "Non-Claimable Reward 1",
          amount: 300n,
          type: "PRIZE_POOL",
          epoch: 2,
          index: 2,
          canClaim: false,
          proof: null,
        },
        {
          description: "Non-Claimable Reward 2",
          amount: 200n,
          type: "EQUIPMENT_POOL",
          epoch: 1,
          index: 3,
          canClaim: false,
          proof: null,
        },
      ],
      lastChecked: Date.now(),
    };

    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mixedClaims,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => useClaims());

    expect(result.current.claims).toEqual(mixedClaims);

    // Verify claimable vs non-claimable rewards
    const claimableRewards = result.current.claims.available.filter((reward) => reward.canClaim);
    const nonClaimableRewards = result.current.claims.available.filter(
      (reward) => !reward.canClaim
    );

    expect(claimableRewards).toHaveLength(2);
    expect(nonClaimableRewards).toHaveLength(2);
    expect(result.current.claims.totalClaimable).toBe(1000n);
  });
});
