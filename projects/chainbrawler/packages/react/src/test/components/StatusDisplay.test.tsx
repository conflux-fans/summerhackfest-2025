import { render, screen } from "@testing-library/react";
import { StatusDisplay } from "../../components/StatusDisplay";

// Mock the context provider
vi.mock("../../providers/ChainBrawlerProvider", () => ({
  useChainBrawlerContext: vi.fn(),
}));

describe("StatusDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render status message", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      statusMessage: "Character ready",
      isLoading: false,
      operation: null,
    });

    render(<StatusDisplay />);

    expect(screen.getByText("Character ready")).toBeInTheDocument();
  });

  it("should show loading indicator when loading", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      statusMessage: "Loading character...",
      isLoading: true,
      operation: null,
    });

    render(<StatusDisplay />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByText("Loading character...")).toBeInTheDocument();
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  it("should show operation status when operation is active", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      statusMessage: "Fighting in progress",
      isLoading: false,
      operation: {
        isActive: true,
        operationType: "FIGHT",
        progress: "Round 2 of 3",
      },
    });

    render(<StatusDisplay />);

    expect(screen.getByText("FIGHT in progress...")).toBeInTheDocument();
    expect(screen.getByText("Round 2 of 3")).toBeInTheDocument();
    expect(screen.getByText("Fighting in progress")).toBeInTheDocument();
  });

  it("should show operation without progress when progress is not provided", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      statusMessage: "Healing character",
      isLoading: false,
      operation: {
        isActive: true,
        operationType: "HEAL",
        progress: null,
      },
    });

    render(<StatusDisplay />);

    expect(screen.getByText("HEAL in progress...")).toBeInTheDocument();
    expect(screen.queryByText("operation-progress")).not.toBeInTheDocument();
    expect(screen.getByText("Healing character")).toBeInTheDocument();
  });

  it("should not show operation status when operation is inactive", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      statusMessage: "Ready to fight",
      isLoading: false,
      operation: {
        isActive: false,
        operationType: "FIGHT",
        progress: "Completed",
      },
    });

    render(<StatusDisplay />);

    expect(screen.queryByText("FIGHT in progress...")).not.toBeInTheDocument();
    expect(screen.queryByText("Completed")).not.toBeInTheDocument();
    expect(screen.getByText("Ready to fight")).toBeInTheDocument();
  });

  it("should show both loading and operation status when both are active", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      statusMessage: "Processing fight result",
      isLoading: true,
      operation: {
        isActive: true,
        operationType: "FIGHT_RESULT",
        progress: "Calculating rewards...",
      },
    });

    render(<StatusDisplay />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByText("FIGHT_RESULT in progress...")).toBeInTheDocument();
    expect(screen.getByText("Calculating rewards...")).toBeInTheDocument();
    expect(screen.getByText("Processing fight result")).toBeInTheDocument();
  });
});
