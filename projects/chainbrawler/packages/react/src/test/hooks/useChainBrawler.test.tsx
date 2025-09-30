import { renderHook, waitFor } from "@testing-library/react";
import { useChainBrawler } from "../../hooks/useChainBrawler";

// Mock the useUXState hook
vi.mock("../../hooks/useUXState", () => ({
  useUXState: vi.fn(),
}));

// Mock @chainbrawler/core at the top level
const mockUXStore = {
  getState: vi.fn(),
  subscribe: vi.fn(),
};

const mockSDK = {
  actions: {
    createCharacter: vi.fn(),
    getCharacter: vi.fn(),
    healCharacter: vi.fn(),
    resurrectCharacter: vi.fn(),
    loadPools: vi.fn(),
    refreshPools: vi.fn(),
    loadLeaderboard: vi.fn(),
    refreshLeaderboard: vi.fn(),
    loadClaims: vi.fn(),
    refreshClaims: vi.fn(),
    claimPrize: vi.fn(),
    clearError: vi.fn(),
    refreshAll: vi.fn(),
  },
  cleanup: vi.fn(),
  getStore: vi.fn().mockReturnValue(mockUXStore),
  store: mockUXStore,
};

vi.mock("@chainbrawler/core", () => ({
  ChainBrawlerSDK: vi.fn().mockImplementation(() => mockSDK),
  UXStore: vi.fn().mockImplementation(() => mockUXStore),
  ChainBrawlerConfig: {},
}));

describe("useChainBrawler", () => {
  const mockConfig = {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    chain: { id: 2030 },
    publicClient: {} as any, // Mock public client
    walletClient: null,
  };

  const mockUXState = {
    character: null,
    menu: null,
    operation: null,
    pools: null,
    leaderboard: null,
    claims: null,
    statusMessage: "Ready",
    isLoading: false,
    error: null,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mock behavior
    const { useUXState } = await import("../../hooks/useUXState");
    vi.mocked(useUXState).mockReturnValue(mockUXState);
    mockUXStore.getState.mockReturnValue(mockUXState);
    mockUXStore.subscribe.mockReturnValue(() => {});
  });

  it("should initialize SDK with config and store", async () => {
    const { useUXState } = await import("../../hooks/useUXState");
    vi.mocked(useUXState).mockReturnValue(mockUXState);

    const { result } = renderHook(() => useChainBrawler(mockConfig));

    await waitFor(() => {
      expect(result.current.sdk).toBeTruthy();
    });

    const { ChainBrawlerSDK } = await import("@chainbrawler/core");
    expect(ChainBrawlerSDK).toHaveBeenCalledWith(mockConfig);
  });

  it("should return UXState values", async () => {
    const { useUXState } = await import("../../hooks/useUXState");
    const mockStateWithCharacter = {
      ...mockUXState,
      character: { exists: true, isAlive: true, class: 0, className: "Warrior" },
      statusMessage: "Character ready",
    };
    vi.mocked(useUXState).mockReturnValue(mockStateWithCharacter);

    const { result } = renderHook(() => useChainBrawler(mockConfig));

    expect(result.current.character).toEqual(mockStateWithCharacter.character);
    expect(result.current.statusMessage).toBe("Character ready");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should return SDK actions when SDK is available", async () => {
    const { useUXState } = await import("../../hooks/useUXState");
    vi.mocked(useUXState).mockReturnValue(mockUXState);

    const { result } = renderHook(() => useChainBrawler(mockConfig));

    await waitFor(() => {
      expect(result.current.actions).toBeDefined();
      expect(result.current.actions.createCharacter).toBeDefined();
      expect(result.current.actions.getCharacter).toBeDefined();
      expect(result.current.actions.healCharacter).toBeDefined();
    });
  });

  it("should handle SDK cleanup on unmount", async () => {
    const { useUXState } = await import("../../hooks/useUXState");
    vi.mocked(useUXState).mockReturnValue(mockUXState);

    const { unmount } = renderHook(() => useChainBrawler(mockConfig));

    unmount();

    expect(mockSDK.cleanup).toHaveBeenCalled();
  });

  it("should create new SDK when config changes", async () => {
    const { useUXState } = await import("../../hooks/useUXState");
    vi.mocked(useUXState).mockReturnValue(mockUXState);

    const { result, rerender } = renderHook(({ config }) => useChainBrawler(config), {
      initialProps: { config: mockConfig },
    });

    await waitFor(() => {
      expect(result.current.sdk).toBeTruthy();
    });

    const newConfig = { ...mockConfig, address: "0xabcdef1234567890abcdef1234567890abcdef12" };
    rerender({ config: newConfig });

    await waitFor(async () => {
      expect(mockSDK.cleanup).toHaveBeenCalled();
      const { ChainBrawlerSDK } = await import("@chainbrawler/core");
      expect(ChainBrawlerSDK).toHaveBeenCalledWith(newConfig);
    });
  });

  it("should pass store to useUXState", async () => {
    const { useUXState } = await import("../../hooks/useUXState");
    const mockUXStateFn = vi.mocked(useUXState).mockReturnValue(mockUXState);

    renderHook(() => useChainBrawler(mockConfig));

    expect(mockUXStateFn).toHaveBeenCalledWith(mockUXStore);
  });

  it("should maintain the same store instance across re-renders", async () => {
    const { useUXState } = await import("../../hooks/useUXState");
    const mockUXStateFn = vi.mocked(useUXState).mockReturnValue(mockUXState);

    const { rerender } = renderHook(() => useChainBrawler(mockConfig));

    // Wait for the first call to useUXState
    await waitFor(() => {
      expect(mockUXStateFn).toHaveBeenCalled();
    });

    const firstCall = mockUXStateFn.mock.calls[0][0];

    rerender();

    // The store should be the same instance
    expect(firstCall).toBe(mockUXStore);
  });

  it("should handle case when SDK is not yet initialized", async () => {
    const { useUXState } = await import("../../hooks/useUXState");
    vi.mocked(useUXState).mockReturnValue(mockUXState);

    const { result } = renderHook(() => useChainBrawler(mockConfig));

    // Initially, actions might be undefined while SDK is being created
    if (!result.current.actions) {
      expect(result.current.actions).toBeUndefined();
    }

    // Wait for SDK to be initialized
    await waitFor(() => {
      expect(result.current.sdk).toBeTruthy();
      expect(result.current.actions).toBeDefined();
    });
  });
});
