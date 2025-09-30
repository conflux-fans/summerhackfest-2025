import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ClaimsDisplay } from "../../components/ClaimsDisplay";

// Mock the context provider
vi.mock("../../providers/ChainBrawlerProvider", () => ({
  useChainBrawlerContext: vi.fn(),
}));

describe("ClaimsDisplay", () => {
  const mockConfig = {
    address: "0x1234567890abcdef1234567890abcdef12345678",
  };

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render claims information when available", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaims,
      menu: {
        canViewClaims: true,
      },
      config: mockConfig,
      actions: {
        loadClaims: vi.fn(),
        claimPrize: vi.fn(),
      },
      isLoading: false,
      error: null,
    });

    render(<ClaimsDisplay />);

    expect(screen.getByText("Prize Claims")).toBeInTheDocument();
    expect(screen.getByText("Available Claims")).toBeInTheDocument();
    expect(screen.getByText("Total Claimable:")).toBeInTheDocument();
    expect(screen.getByText("1500 CFX")).toBeInTheDocument();
    expect(screen.getByText("Available Rewards:")).toBeInTheDocument();
  });

  it("should display available rewards with correct information", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaims,
      menu: {
        canViewClaims: true,
      },
      config: mockConfig,
      actions: {
        loadClaims: vi.fn(),
        claimPrize: vi.fn(),
      },
      isLoading: false,
      error: null,
    });

    render(<ClaimsDisplay />);

    // Check first reward
    expect(screen.getByText("Prize Pool Reward - Epoch 3")).toBeInTheDocument();
    expect(screen.getAllByText("Amount:")).toHaveLength(3); // There are 3 rewards
    expect(screen.getByText("1000 CFX")).toBeInTheDocument();
    expect(screen.getAllByText("Type:")).toHaveLength(3); // There are 3 rewards
    expect(screen.getAllByText("PRIZE_POOL")).toHaveLength(2); // There are 2 PRIZE_POOL rewards
    expect(screen.getAllByText("Epoch:")).toHaveLength(3); // There are 3 rewards

    // Check claimable button
    const claimButtons = screen.getAllByText("Claim");
    expect(claimButtons).toHaveLength(2);
    expect(claimButtons[0]).not.toBeDisabled();

    // Check non-claimable reward
    expect(screen.getByText("Expired Reward")).toBeInTheDocument();
    expect(screen.getByText("Cannot Claim")).toBeInTheDocument();
  });

  it("should call loadClaims when refresh button is clicked", async () => {
    const mockLoadClaims = vi.fn();
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaims,
      menu: {
        canViewClaims: true,
      },
      config: mockConfig,
      actions: {
        loadClaims: mockLoadClaims,
        claimPrize: vi.fn(),
      },
      isLoading: false,
      error: null,
    });

    render(<ClaimsDisplay />);

    const refreshButton = screen.getByText("Refresh");
    fireEvent.click(refreshButton);

    expect(mockLoadClaims).toHaveBeenCalledWith(mockConfig.address);
  });

  it("should call claimPrize when claim button is clicked", async () => {
    const mockClaimPrize = vi.fn();
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaims,
      menu: {
        canViewClaims: true,
      },
      config: mockConfig,
      actions: {
        loadClaims: vi.fn(),
        claimPrize: mockClaimPrize,
      },
      isLoading: false,
      error: null,
    });

    render(<ClaimsDisplay />);

    const claimButtons = screen.getAllByText("Claim");
    fireEvent.click(claimButtons[0]);

    await waitFor(() => {
      expect(mockClaimPrize).toHaveBeenCalledWith(3, 0, 1000n, ["0xabcd1234..."]);
    });
  });

  it("should not call claimPrize for non-claimable rewards", async () => {
    const mockClaimPrize = vi.fn();
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaims,
      menu: {
        canViewClaims: true,
      },
      config: mockConfig,
      actions: {
        loadClaims: vi.fn(),
        claimPrize: mockClaimPrize,
      },
      isLoading: false,
      error: null,
    });

    render(<ClaimsDisplay />);

    const cannotClaimButton = screen.getByText("Cannot Claim");
    expect(cannotClaimButton).toBeDisabled();

    fireEvent.click(cannotClaimButton);

    await waitFor(() => {
      expect(mockClaimPrize).not.toHaveBeenCalled();
    });
  });

  it("should show loading state when loading", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: null,
      menu: {
        canViewClaims: true,
      },
      config: mockConfig,
      actions: {
        loadClaims: vi.fn(),
        claimPrize: vi.fn(),
      },
      isLoading: true,
      error: null,
    });

    render(<ClaimsDisplay />);

    const refreshButton = screen.getByText("Loading...");
    expect(refreshButton).toBeDisabled();
  });

  it("should display error message when error exists", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: null,
      menu: {
        canViewClaims: true,
      },
      config: mockConfig,
      actions: {
        loadClaims: vi.fn(),
        claimPrize: vi.fn(),
      },
      isLoading: false,
      error: "Failed to load claims",
    });

    render(<ClaimsDisplay />);

    expect(screen.getByText("Error: Failed to load claims")).toBeInTheDocument();
  });

  it("should not render when menu does not allow viewing claims", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaims,
      menu: {
        canViewClaims: false,
      },
      config: mockConfig,
      actions: {
        loadClaims: vi.fn(),
        claimPrize: vi.fn(),
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(<ClaimsDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it("should show no claims message when no claims available", async () => {
    const emptyClaimsData = {
      ...mockClaims,
      totalClaimable: 0n,
      available: [],
    };

    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: emptyClaimsData,
      menu: {
        canViewClaims: true,
      },
      config: mockConfig,
      actions: {
        loadClaims: vi.fn(),
        claimPrize: vi.fn(),
      },
      isLoading: false,
      error: null,
    });

    render(<ClaimsDisplay />);

    expect(screen.getByText("No claims available at this time.")).toBeInTheDocument();
    expect(screen.getByText("Available Rewards:")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should display last checked timestamp", async () => {
    const mockDate = new Date("2024-01-15T10:30:00.000Z");
    const mockClaimsWithDate = {
      ...mockClaims,
      lastChecked: mockDate.getTime(),
    };

    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaimsWithDate,
      menu: {
        canViewClaims: true,
      },
      config: mockConfig,
      actions: {
        loadClaims: vi.fn(),
        claimPrize: vi.fn(),
      },
      isLoading: false,
      error: null,
    });

    render(<ClaimsDisplay />);

    expect(screen.getByText(/Last checked:/)).toBeInTheDocument();
  });

  it("should disable claim buttons when loading", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      claims: mockClaims,
      menu: {
        canViewClaims: true,
      },
      config: mockConfig,
      actions: {
        loadClaims: vi.fn(),
        claimPrize: vi.fn(),
      },
      isLoading: true,
      error: null,
    });

    render(<ClaimsDisplay />);

    const claimButtons = screen.getAllByText("Claim");
    claimButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
