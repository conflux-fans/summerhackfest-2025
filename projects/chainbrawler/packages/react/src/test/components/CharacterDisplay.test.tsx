import { fireEvent, render, screen } from "@testing-library/react";
import { CharacterDisplay } from "../../components/CharacterDisplay";

// Mock the context provider
vi.mock("../../providers/ChainBrawlerProvider", () => ({
  useChainBrawlerContext: vi.fn(),
}));

describe("CharacterDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render character creation when no character exists", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      character: null,
      menu: {
        canCreateCharacter: true,
        canAct: false,
        canFight: false,
        canHeal: false,
        canResurrect: false,
        canContinueFight: false,
        canFlee: false,
        canViewPools: true,
        canViewLeaderboard: true,
        canViewClaims: true,
        canClaimPrize: false,
        availableActions: ["createCharacter"],
        disabledActions: [],
        disabledReasons: {},
      },
      operation: null,
      statusMessage: "Ready to create character",
      actions: {
        createCharacter: vi.fn(),
      },
    });

    render(<CharacterDisplay />);

    expect(screen.getByText("No Character")).toBeInTheDocument();
    expect(screen.getByText("Ready to create character")).toBeInTheDocument();
    expect(screen.getByText("Create Character")).toBeInTheDocument();
  });

  it("should render character classes for selection", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      character: null,
      menu: {
        canCreateCharacter: true,
        canAct: false,
        canFight: false,
        canHeal: false,
        canResurrect: false,
        canContinueFight: false,
        canFlee: false,
        canViewPools: true,
        canViewLeaderboard: true,
        canViewClaims: true,
        canClaimPrize: false,
        availableActions: ["createCharacter"],
        disabledActions: [],
        disabledReasons: {},
      },
      operation: null,
      statusMessage: "Ready to create character",
      actions: {
        createCharacter: vi.fn(),
      },
    });

    render(<CharacterDisplay />);

    expect(screen.getByText("Class 0")).toBeInTheDocument();
    expect(screen.getByText("Class 1")).toBeInTheDocument();
    expect(screen.getByText("Class 2")).toBeInTheDocument();
    expect(screen.getByText("Class 3")).toBeInTheDocument();
  });

  it("should call createCharacter when class button is clicked", async () => {
    const mockCreateCharacter = vi.fn();
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      character: null,
      menu: {
        canCreateCharacter: true,
        canAct: false,
        canFight: false,
        canHeal: false,
        canResurrect: false,
        canContinueFight: false,
        canFlee: false,
        canViewPools: true,
        canViewLeaderboard: true,
        canViewClaims: true,
        canClaimPrize: false,
        availableActions: ["createCharacter"],
        disabledActions: [],
        disabledReasons: {},
      },
      operation: null,
      statusMessage: "Ready to create character",
      actions: {
        createCharacter: mockCreateCharacter,
      },
    });

    render(<CharacterDisplay />);

    const classButton = screen.getByText("Class 0");
    fireEvent.click(classButton);

    expect(mockCreateCharacter).toHaveBeenCalledWith(0);
  });

  it("should render character data when character exists", async () => {
    const { useChainBrawlerContext } = await import("../../providers/ChainBrawlerProvider");
    vi.mocked(useChainBrawlerContext).mockReturnValue({
      character: {
        exists: true,
        isAlive: true,
        class: 0,
        className: "Warrior",
        level: 5,
        experience: 1000,
        endurance: {
          current: 80,
          max: 100,
          percentage: 80,
        },
        stats: {
          combat: 15,
          defense: 12,
          luck: 8,
        },
        equipment: [
          { combat: 5, endurance: 0, defense: 2, luck: 1 },
          { combat: 0, endurance: 10, defense: 0, luck: 0 },
        ],
        inCombat: false,
        totalKills: 25,
      },
      menu: {
        canCreateCharacter: false,
        canAct: true,
        canFight: true,
        canHeal: true,
        canResurrect: false,
        canContinueFight: false,
        canFlee: false,
        canViewPools: true,
        canViewLeaderboard: true,
        canViewClaims: true,
        canClaimPrize: false,
        availableActions: ["act", "fight", "heal"],
        disabledActions: [],
        disabledReasons: {},
      },
      operation: null,
      statusMessage: "Character ready",
      actions: {
        createCharacter: vi.fn(),
      },
    });

    render(<CharacterDisplay />);

    expect(screen.getByText("Character")).toBeInTheDocument();
    expect(screen.getByText("Class:")).toBeInTheDocument();
    expect(screen.getByText("Warrior")).toBeInTheDocument();
    expect(screen.getByText("Level:")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Experience:")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
    expect(screen.getByText("Endurance:")).toBeInTheDocument();
    expect(screen.getByText("80/100")).toBeInTheDocument();
    expect(screen.getByText("Combat:")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Defense:")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Luck:")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Equipment Count:")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
