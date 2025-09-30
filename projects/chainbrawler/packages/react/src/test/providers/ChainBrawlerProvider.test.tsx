import { render, screen } from "@testing-library/react";
import { ChainBrawlerProvider, useChainBrawlerContext } from "../../providers/ChainBrawlerProvider";

// Mock the useChainBrawler hook
vi.mock("../../hooks/useChainBrawler", () => ({
  useChainBrawler: vi.fn(),
}));

// Test component that uses the context
function TestComponent() {
  const context = useChainBrawlerContext();
  return (
    <div>
      <div data-testid="character">{context.character ? "Character exists" : "No character"}</div>
      <div data-testid="status">{context.statusMessage}</div>
      <div data-testid="loading">{context.isLoading ? "Loading" : "Not loading"}</div>
      <div data-testid="error">{context.error || "No error"}</div>
    </div>
  );
}

describe("ChainBrawlerProvider", () => {
  const mockConfig = {
    address: "0x123",
    chain: { id: 2030 },
    publicClient: null,
    walletClient: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide context values to children", async () => {
    const { useChainBrawler } = await import("../../hooks/useChainBrawler");
    const mockChainBrawlerData = {
      character: { exists: true, isAlive: true, class: 0, className: "Warrior" },
      menu: { canCreateCharacter: false, canAct: true },
      operation: null,
      pools: null,
      leaderboard: null,
      claims: null,
      statusMessage: "Character ready",
      isLoading: false,
      error: null,
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
    };

    vi.mocked(useChainBrawler).mockReturnValue(mockChainBrawlerData);

    render(
      <ChainBrawlerProvider config={mockConfig}>
        <TestComponent />
      </ChainBrawlerProvider>
    );

    expect(screen.getByTestId("character")).toHaveTextContent("Character exists");
    expect(screen.getByTestId("status")).toHaveTextContent("Character ready");
    expect(screen.getByTestId("loading")).toHaveTextContent("Not loading");
    expect(screen.getByTestId("error")).toHaveTextContent("No error");
  });

  it("should call useChainBrawler with the provided config", async () => {
    const { useChainBrawler } = await import("../../hooks/useChainBrawler");
    vi.mocked(useChainBrawler).mockReturnValue({
      character: null,
      menu: null,
      operation: null,
      pools: null,
      leaderboard: null,
      claims: null,
      statusMessage: "Ready",
      isLoading: false,
      error: null,
      actions: {},
    });

    render(
      <ChainBrawlerProvider config={mockConfig}>
        <TestComponent />
      </ChainBrawlerProvider>
    );

    expect(useChainBrawler).toHaveBeenCalledWith(mockConfig);
  });

  it("should handle loading state", async () => {
    const { useChainBrawler } = await import("../../hooks/useChainBrawler");
    const loadingData = {
      character: null,
      menu: null,
      operation: null,
      pools: null,
      leaderboard: null,
      claims: null,
      statusMessage: "Loading...",
      isLoading: true,
      error: null,
      actions: {},
    };

    vi.mocked(useChainBrawler).mockReturnValue(loadingData);

    render(
      <ChainBrawlerProvider config={mockConfig}>
        <TestComponent />
      </ChainBrawlerProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("Loading");
  });
});

describe("useChainBrawlerContext", () => {
  it("should throw error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useChainBrawlerContext must be used within a ChainBrawlerProvider");

    consoleSpy.mockRestore();
  });
});
