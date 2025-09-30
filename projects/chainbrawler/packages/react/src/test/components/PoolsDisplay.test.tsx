import { fireEvent, render, screen } from "@testing-library/react";
import { PoolsDisplay } from "../../components/PoolsDisplay";

// Mock the context provider
vi.mock("../../providers/ChainBrawlerProvider", () => ({
  useChainBrawlerContext: vi.fn(),
}));

describe("PoolsDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render pools information when available", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      pools: {
        prizePool: {
          value: 1000n,
          formatted: "1000 CFX",
          description: "Prize pool",
          percentage: 50,
        },
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
      },
      menu: {
        canViewPools: true,
        canCreateCharacter: false,
        canAct: false,
        canFight: false,
        canHeal: false,
        canResurrect: false,
        canContinueFight: false,
        canFlee: false,
        canViewLeaderboard: true,
        canViewClaims: true,
        canClaimPrize: false,
        availableActions: [],
        disabledActions: [],
        disabledReasons: {},
      },
      isLoading: false,
      error: null,
      actions: {
        loadPools: vi.fn(),
      },
    });

    render(<PoolsDisplay />);

    expect(screen.getByText("Treasury Pools")).toBeInTheDocument();
    expect(screen.getByText("Prize Pool")).toBeInTheDocument();
    expect(screen.getByText("1000 CFX")).toBeInTheDocument();
    expect(screen.getByText("50.00%")).toBeInTheDocument();

    expect(screen.getByText("Equipment Pool")).toBeInTheDocument();
    expect(screen.getByText("500 CFX")).toBeInTheDocument();
    expect(screen.getByText("25.00%")).toBeInTheDocument();

    expect(screen.getByText("Gas Refund Pool")).toBeInTheDocument();
    expect(screen.getByText("200 CFX")).toBeInTheDocument();
    expect(screen.getByText("10.00%")).toBeInTheDocument();
  });

  it("should call loadPools when refresh button is clicked", async () => {
    const mockLoadPools = vi.fn();
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      pools: {
        prizePool: {
          value: 1000n,
          formatted: "1000 CFX",
          description: "Prize pool",
          percentage: 50,
        },
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
      },
      menu: {
        canViewPools: true,
        canCreateCharacter: false,
        canAct: false,
        canFight: false,
        canHeal: false,
        canResurrect: false,
        canContinueFight: false,
        canFlee: false,
        canViewLeaderboard: true,
        canViewClaims: true,
        canClaimPrize: false,
        availableActions: [],
        disabledActions: [],
        disabledReasons: {},
      },
      isLoading: false,
      error: null,
      actions: {
        loadPools: mockLoadPools,
      },
    });

    render(<PoolsDisplay />);

    const refreshButton = screen.getByText("Refresh");
    fireEvent.click(refreshButton);

    expect(mockLoadPools).toHaveBeenCalled();
  });

  it("should show loading state when loading", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      pools: null,
      menu: {
        canViewPools: true,
        canCreateCharacter: false,
        canAct: false,
        canFight: false,
        canHeal: false,
        canResurrect: false,
        canContinueFight: false,
        canFlee: false,
        canViewLeaderboard: true,
        canViewClaims: true,
        canClaimPrize: false,
        availableActions: [],
        disabledActions: [],
        disabledReasons: {},
      },
      isLoading: true,
      error: null,
      actions: {
        loadPools: vi.fn(),
      },
    });

    render(<PoolsDisplay />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should not render when menu does not allow viewing pools", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      pools: null,
      menu: {
        canViewPools: false,
        canCreateCharacter: false,
        canAct: false,
        canFight: false,
        canHeal: false,
        canResurrect: false,
        canContinueFight: false,
        canFlee: false,
        canViewLeaderboard: true,
        canViewClaims: true,
        canClaimPrize: false,
        availableActions: [],
        disabledActions: [],
        disabledReasons: {},
      },
      isLoading: false,
      error: null,
      actions: {
        loadPools: vi.fn(),
      },
    });

    const { container } = render(<PoolsDisplay />);
    expect(container.firstChild).toBeNull();
  });
});
