import { act, renderHook } from "@testing-library/react";
import { useUXState } from "../../hooks/useUXState";

// Mock store
const createMockStore = (initialState = {}) => {
  let currentState = {
    character: null,
    menu: null,
    operation: null,
    pools: null,
    leaderboard: null,
    claims: null,
    statusMessage: "Ready",
    isLoading: false,
    error: null,
    ...initialState,
  };

  let subscribers: Array<(state: any) => void> = [];

  return {
    getState: vi.fn(() => currentState),
    subscribe: vi.fn((callback: (state: any) => void) => {
      subscribers.push(callback);
      return () => {
        subscribers = subscribers.filter((sub) => sub !== callback);
      };
    }),
    // Test helpers
    _setState: (newState: any) => {
      currentState = { ...currentState, ...newState };
      subscribers.forEach((sub) => sub(currentState));
    },
    _getSubscribers: () => subscribers,
  };
};

describe("useUXState", () => {
  it("should return initial state from store", () => {
    const initialState = {
      character: { exists: true, isAlive: true, class: 0, className: "Warrior" },
      statusMessage: "Character loaded",
    };
    const mockStore = createMockStore(initialState);

    const { result } = renderHook(() => useUXState(mockStore as any));

    expect(result.current).toEqual({
      character: initialState.character,
      menu: null,
      operation: null,
      pools: null,
      leaderboard: null,
      claims: null,
      statusMessage: "Character loaded",
      isLoading: false,
      error: null,
    });
    expect(mockStore.getState).toHaveBeenCalled();
  });

  it("should subscribe to store updates on mount", () => {
    const mockStore = createMockStore();

    renderHook(() => useUXState(mockStore as any));

    expect(mockStore.subscribe).toHaveBeenCalledWith(expect.any(Function));
    expect(mockStore._getSubscribers()).toHaveLength(1);
  });

  it("should update state when store notifies changes", () => {
    const mockStore = createMockStore();

    const { result } = renderHook(() => useUXState(mockStore as any));

    expect(result.current.statusMessage).toBe("Ready");
    expect(result.current.isLoading).toBe(false);

    // Simulate store state change
    act(() => {
      mockStore._setState({
        statusMessage: "Loading character...",
        isLoading: true,
      });
    });

    expect(result.current.statusMessage).toBe("Loading character...");
    expect(result.current.isLoading).toBe(true);
  });

  it("should handle multiple state updates", () => {
    const mockStore = createMockStore();

    const { result } = renderHook(() => useUXState(mockStore as any));

    // First update
    act(() => {
      mockStore._setState({
        character: { exists: true, isAlive: true, class: 0, className: "Warrior" },
        statusMessage: "Character created",
      });
    });

    expect(result.current.character).toEqual({
      exists: true,
      isAlive: true,
      class: 0,
      className: "Warrior",
    });
    expect(result.current.statusMessage).toBe("Character created");

    // Second update
    act(() => {
      mockStore._setState({
        pools: {
          prizePool: {
            value: 1000n,
            formatted: "1000 CFX",
            description: "Prize pool",
            percentage: 50,
          },
          totalValue: 1000n,
          lastUpdated: Date.now(),
        },
        statusMessage: "Pools loaded",
      });
    });

    expect(result.current.pools).toBeDefined();
    expect(result.current.statusMessage).toBe("Pools loaded");
  });

  it("should unsubscribe from store on unmount", () => {
    const mockStore = createMockStore();
    const mockUnsubscribe = vi.fn();
    mockStore.subscribe.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useUXState(mockStore as any));

    expect(mockStore.subscribe).toHaveBeenCalled();

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("should resubscribe when store changes", () => {
    const mockStore1 = createMockStore({ statusMessage: "Store 1" });
    const mockStore2 = createMockStore({ statusMessage: "Store 2" });

    const mockUnsubscribe1 = vi.fn();
    const mockUnsubscribe2 = vi.fn();

    mockStore1.subscribe.mockReturnValue(mockUnsubscribe1);
    mockStore2.subscribe.mockReturnValue(mockUnsubscribe2);

    const { result, rerender } = renderHook(({ store }) => useUXState(store), {
      initialProps: { store: mockStore1 as any },
    });

    expect(result.current.statusMessage).toBe("Store 1");
    expect(mockStore1.subscribe).toHaveBeenCalled();

    // Change to different store
    rerender({ store: mockStore2 as any });

    expect(mockUnsubscribe1).toHaveBeenCalled();
    expect(mockStore2.subscribe).toHaveBeenCalled();
    expect(mockStore2.getState).toHaveBeenCalled();
    // The state should update to reflect the new store's state
    expect(result.current.statusMessage).toBe("Store 2");
  });

  it("should handle loading states correctly", () => {
    const mockStore = createMockStore();

    const { result } = renderHook(() => useUXState(mockStore as any));

    expect(result.current.isLoading).toBe(false);

    act(() => {
      mockStore._setState({ isLoading: true });
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      mockStore._setState({ isLoading: false });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should handle error states correctly", () => {
    const mockStore = createMockStore();

    const { result } = renderHook(() => useUXState(mockStore as any));

    expect(result.current.error).toBe(null);

    act(() => {
      mockStore._setState({ error: "Connection failed" });
    });

    expect(result.current.error).toBe("Connection failed");

    act(() => {
      mockStore._setState({ error: null });
    });

    expect(result.current.error).toBe(null);
  });

  it("should handle complex state objects", () => {
    const mockStore = createMockStore();
    const { result } = renderHook(() => useUXState(mockStore as any));

    const complexLeaderboard = {
      currentEpoch: 5n,
      epochTimeRemaining: 3600n,
      playerRank: 15n,
      playerScore: 2500n,
      totalPlayers: 100n,
      topPlayers: [
        { address: "0x123", rank: 1n, score: 5000n, level: 25, kills: 50, isCurrentPlayer: false },
      ],
      lastUpdated: Date.now(),
    };

    act(() => {
      mockStore._setState({
        leaderboard: complexLeaderboard,
        statusMessage: "Leaderboard loaded",
      });
    });

    expect(result.current.leaderboard).toEqual(complexLeaderboard);
    expect(result.current.statusMessage).toBe("Leaderboard loaded");
  });
});
