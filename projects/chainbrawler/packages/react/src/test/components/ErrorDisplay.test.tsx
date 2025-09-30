import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorDisplay } from "../../components/ErrorDisplay";

// Mock the context provider
vi.mock("../../providers/ChainBrawlerProvider", () => ({
  useChainBrawlerContext: vi.fn(),
}));

describe("ErrorDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when there is no error", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      error: null,
      actions: { clearError: vi.fn() },
    });

    const { container } = render(<ErrorDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it("should render error message when error exists", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      error: "Test error message",
      actions: { clearError: vi.fn() },
    });

    render(<ErrorDisplay />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("should call clearError when clear button is clicked", async () => {
    const mockClearError = vi.fn();
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      error: "Test error message",
      actions: { clearError: mockClearError },
    });

    render(<ErrorDisplay />);

    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);

    expect(mockClearError).toHaveBeenCalled();
  });
});
