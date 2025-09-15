import { fireEvent, render, screen } from "@testing-library/react";
import { LeaderboardDisplay } from "../../components/LeaderboardDisplay";

// Mock the context provider
vi.mock("../../providers/ChainBrawlerProvider", () => ({
  useChainBrawlerContext: vi.fn(),
}));

describe("LeaderboardDisplay", () => {
  const mockConfig = {
    address: "0x1234567890abcdef1234567890abcdef12345678",
  };

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
      {
        address: "0xfedcba0987654321fedcba0987654321fedcba09",
        rank: 3n,
        score: 4000n,
        level: 20,
        kills: 40,
        isCurrentPlayer: false,
      },
    ],
    lastUpdated: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render leaderboard information when available", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: mockLeaderboard,
      menu: {
        canViewLeaderboard: true,
      },
      config: mockConfig,
      actions: {
        loadLeaderboard: vi.fn(),
      },
      isLoading: false,
      error: null,
    });

    render(<LeaderboardDisplay />);

    expect(screen.getByText("Leaderboard")).toBeInTheDocument();
    expect(screen.getByText("Current Epoch: 5")).toBeInTheDocument();
    expect(screen.getByText("Time Remaining: 3600 seconds")).toBeInTheDocument();
    expect(screen.getByText("Rank:")).toBeInTheDocument();
    expect(screen.getByText("#15")).toBeInTheDocument();
    expect(screen.getByText("Score:")).toBeInTheDocument();
    expect(screen.getByText("2500")).toBeInTheDocument();
    expect(screen.getByText("Total Players:")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("should display top players with correct information", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: mockLeaderboard,
      menu: {
        canViewLeaderboard: true,
      },
      config: mockConfig,
      actions: {
        loadLeaderboard: vi.fn(),
      },
      isLoading: false,
      error: null,
    });

    render(<LeaderboardDisplay />);

    // Check top players section
    expect(screen.getByText("Top Players")).toBeInTheDocument();

    // Check first player
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("0xabcd...ef12")).toBeInTheDocument();
    expect(screen.getByText("Score: 5000")).toBeInTheDocument();
    expect(screen.getByText("Level: 25")).toBeInTheDocument();
    expect(screen.getByText("Kills: 50")).toBeInTheDocument();

    // Check current player (should have special styling)
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("0x1234...5678")).toBeInTheDocument();
    expect(screen.getByText("Score: 4500")).toBeInTheDocument();
  });

  it("should call loadLeaderboard when refresh button is clicked", async () => {
    const mockLoadLeaderboard = vi.fn();
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: mockLeaderboard,
      menu: {
        canViewLeaderboard: true,
      },
      config: mockConfig,
      actions: {
        loadLeaderboard: mockLoadLeaderboard,
      },
      isLoading: false,
      error: null,
    });

    render(<LeaderboardDisplay />);

    const refreshButton = screen.getByText("Refresh");
    fireEvent.click(refreshButton);

    expect(mockLoadLeaderboard).toHaveBeenCalledWith(mockConfig.address);
  });

  it("should show loading state when loading", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: null,
      menu: {
        canViewLeaderboard: true,
      },
      config: mockConfig,
      actions: {
        loadLeaderboard: vi.fn(),
      },
      isLoading: true,
      error: null,
    });

    render(<LeaderboardDisplay />);

    const refreshButton = screen.getByText("Loading...");
    expect(refreshButton).toBeDisabled();
  });

  it("should display error message when error exists", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: null,
      menu: {
        canViewLeaderboard: true,
      },
      config: mockConfig,
      actions: {
        loadLeaderboard: vi.fn(),
      },
      isLoading: false,
      error: "Failed to load leaderboard",
    });

    render(<LeaderboardDisplay />);

    expect(screen.getByText("Error: Failed to load leaderboard")).toBeInTheDocument();
  });

  it("should not render when menu does not allow viewing leaderboard", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: mockLeaderboard,
      menu: {
        canViewLeaderboard: false,
      },
      config: mockConfig,
      actions: {
        loadLeaderboard: vi.fn(),
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(<LeaderboardDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it("should display last updated timestamp", async () => {
    const mockDate = new Date("2024-01-15T10:30:00.000Z");
    const mockLeaderboardWithDate = {
      ...mockLeaderboard,
      lastUpdated: mockDate.getTime(),
    };

    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: mockLeaderboardWithDate,
      menu: {
        canViewLeaderboard: true,
      },
      config: mockConfig,
      actions: {
        loadLeaderboard: vi.fn(),
      },
      isLoading: false,
      error: null,
    });

    render(<LeaderboardDisplay />);

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it("should handle empty top players list", async () => {
    const emptyLeaderboard = {
      ...mockLeaderboard,
      topPlayers: [],
    };

    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      leaderboard: emptyLeaderboard,
      menu: {
        canViewLeaderboard: true,
      },
      config: mockConfig,
      actions: {
        loadLeaderboard: vi.fn(),
      },
      isLoading: false,
      error: null,
    });

    render(<LeaderboardDisplay />);

    expect(screen.getByText("Top Players")).toBeInTheDocument();
    // Should not have any player items
    expect(screen.queryByText("Score: 5000")).not.toBeInTheDocument();
  });
});
