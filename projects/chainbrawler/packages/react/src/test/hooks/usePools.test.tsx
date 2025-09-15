import { renderHook } from "@testing-library/react";
import { usePools } from "../../hooks/usePools";

// Mock the context provider
vi.mock("../../providers/ChainBrawlerProvider", () => ({
  useChainBrawlerContext: vi.fn(),
}));

describe("usePools", () => {
  const mockPools = {
    prizePool: { value: 1000n, formatted: "1000 CFX", description: "Prize pool", percentage: 50 },
    equipmentPool: {
      value: 500n,
      formatted: "500 CFX",
      description: "Equipment pool",
      percentage: 25,
    },
    gasRefundPool: {
      value: 200n,
      formatted: "200 CFX",
      description: "Gas refund pool",
      percentage: 10,
    },
    developerPool: {
      value: 100n,
      formatted: "100 CFX",
      description: "Developer pool",
      percentage: 5,
    },
    nextEpochPool: {
      value: 300n,
      formatted: "300 CFX",
      description: "Next epoch pool",
      percentage: 15,
    },
    emergencyPool: {
      value: 50n,
      formatted: "50 CFX",
      description: "Emergency pool",
      percentage: 2.5,
    },
    totalValue: 2150n,
    lastUpdated: Date.now(),
  };

  const mockActions = {
    loadPools: vi.fn(),
    refreshPools: vi.fn(),
    createCharacter: vi.fn(),
    getCharacter: vi.fn(),
    healCharacter: vi.fn(),
    resurrectCharacter: vi.fn(),
    loadLeaderboard: vi.fn(),
    refreshLeaderboard: vi.fn(),
    loadClaims: vi.fn(),
    refreshClaims: vi.fn(),
    claimPrize: vi.fn(),
    clearError: vi.fn(),
    refreshAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return pools data from context", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      pools: mockPools,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => usePools());

    expect(result.current.pools).toEqual(mockPools);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.loadPools).toBe(mockActions.loadPools);
    expect(result.current.refreshPools).toBe(mockActions.refreshPools);
  });

  it("should return loading state from context", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      pools: null,
      isLoading: true,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => usePools());

    expect(result.current.pools).toBe(null);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.loadPools).toBe(mockActions.loadPools);
    expect(result.current.refreshPools).toBe(mockActions.refreshPools);
  });

  it("should return error state from context", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      pools: null,
      isLoading: false,
      error: "Failed to load pools",
      actions: mockActions,
    });

    const { result } = renderHook(() => usePools());

    expect(result.current.pools).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Failed to load pools");
    expect(result.current.loadPools).toBe(mockActions.loadPools);
    expect(result.current.refreshPools).toBe(mockActions.refreshPools);
  });

  it("should provide access to loadPools and refreshPools actions", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      pools: mockPools,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => usePools());

    expect(typeof result.current.loadPools).toBe("function");
    expect(typeof result.current.refreshPools).toBe("function");
    expect(result.current.loadPools).toBe(mockActions.loadPools);
    expect(result.current.refreshPools).toBe(mockActions.refreshPools);
  });

  it("should handle null pools data", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      pools: null,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result } = renderHook(() => usePools());

    expect(result.current.pools).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should update when context changes", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    const mockContextFn = vi.mocked(useChainBrawlerContext);

    // Initial state
    mockContextFn.mockReturnValue({
      pools: null,
      isLoading: true,
      error: null,
      actions: mockActions,
    });

    const { result, rerender } = renderHook(() => usePools());

    expect(result.current.pools).toBe(null);
    expect(result.current.isLoading).toBe(true);

    // Update context
    mockContextFn.mockReturnValue({
      pools: mockPools,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    rerender();

    expect(result.current.pools).toEqual(mockPools);
    expect(result.current.isLoading).toBe(false);
  });

  it("should maintain action references across re-renders", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      pools: mockPools,
      isLoading: false,
      error: null,
      actions: mockActions,
    });

    const { result, rerender } = renderHook(() => usePools());

    const initialLoadPools = result.current.loadPools;
    const initialRefreshPools = result.current.refreshPools;

    rerender();

    expect(result.current.loadPools).toBe(initialLoadPools);
    expect(result.current.refreshPools).toBe(initialRefreshPools);
  });

  it("should handle undefined actions gracefully", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      pools: mockPools,
      isLoading: false,
      error: null,
      actions: {} as any,
    });

    const { result } = renderHook(() => usePools());

    expect(result.current.pools).toEqual(mockPools);
    expect(result.current.loadPools).toBeUndefined();
    expect(result.current.refreshPools).toBeUndefined();
  });
});
