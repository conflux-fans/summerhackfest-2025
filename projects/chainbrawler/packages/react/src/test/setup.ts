import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom";

// Clean up the DOM after each test to prevent memory leaks
afterEach(() => {
  cleanup();
});

// Mock the core package
vi.mock("@chainbrawler/core", () => ({
  ChainBrawlerSDK: vi.fn().mockImplementation(() => ({
    actions: {
      createCharacter: vi.fn().mockResolvedValue({ success: true, data: {} }),
      getCharacter: vi.fn().mockResolvedValue({ success: true, data: null }),
      healCharacter: vi.fn().mockResolvedValue({ success: true, data: {} }),
      resurrectCharacter: vi.fn().mockResolvedValue({ success: true, data: {} }),
      loadPools: vi.fn().mockResolvedValue({ success: true, data: {} }),
      refreshPools: vi.fn().mockResolvedValue({ success: true, data: {} }),
      loadLeaderboard: vi.fn().mockResolvedValue({ success: true, data: {} }),
      refreshLeaderboard: vi.fn().mockResolvedValue({ success: true, data: {} }),
      loadClaims: vi.fn().mockResolvedValue({ success: true, data: {} }),
      refreshClaims: vi.fn().mockResolvedValue({ success: true, data: {} }),
      claimPrize: vi.fn().mockResolvedValue({ success: true, data: {} }),
      clearError: vi.fn(),
      refreshAll: vi.fn().mockResolvedValue({ success: true, data: {} }),
    },
    cleanup: vi.fn(),
  })),
  UXStore: vi.fn().mockImplementation(() => ({
    getState: vi.fn().mockReturnValue({
      character: null,
      menu: null,
      operation: null,
      pools: null,
      leaderboard: null,
      claims: null,
      statusMessage: "Ready",
      isLoading: false,
      error: null,
    }),
    subscribe: vi.fn().mockReturnValue(() => {}),
    updateCharacter: vi.fn(),
    updateMenu: vi.fn(),
    updateOperation: vi.fn(),
    updatePools: vi.fn(),
    updateLeaderboard: vi.fn(),
    updateClaims: vi.fn(),
    setStatusMessage: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  })),
  ChainBrawlerConfig: {},
  UXState: {},
}));
