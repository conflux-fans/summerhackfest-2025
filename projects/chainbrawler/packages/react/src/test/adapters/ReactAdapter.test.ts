import { ReactAdapter } from "../../adapters/ReactAdapter";

// Mock the ChainBrawlerSDK
const mockStore = {
  getState: vi.fn(),
  setError: vi.fn(),
};

const mockSdk = {
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
  getState: vi.fn(),
  clearError: vi.fn(),
  store: mockStore,
};

vi.mock("@chainbrawler/core", () => ({
  ChainBrawlerSDK: vi.fn().mockImplementation(() => mockSdk),
  UXStore: vi.fn().mockImplementation(() => mockStore),
  ChainBrawlerConfig: {},
}));

describe("ReactAdapter", () => {
  const mockConfig = {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    chain: { id: 2030 },
    publicClient: null,
    walletClient: null,
  };

  let adapter: ReactAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new ReactAdapter(mockConfig);
  });

  it("should initialize with config and create SDK", async () => {
    expect(adapter).toBeInstanceOf(ReactAdapter);

    const { ChainBrawlerSDK } = await import("@chainbrawler/core");
    expect(ChainBrawlerSDK).toHaveBeenCalledWith(mockConfig);
  });

  it("should return SDK instance", () => {
    const sdk = adapter.getSDK();
    expect(sdk).toBe(mockSdk);
  });

  it("should delegate getState to SDK", () => {
    const mockState = { character: null, isLoading: false };
    mockStore.getState.mockReturnValue(mockState);

    const state = adapter.getState();

    expect(mockStore.getState).toHaveBeenCalled();
    expect(state).toBe(mockState);
  });

  it("should delegate cleanup to SDK", () => {
    adapter.cleanup();
    expect(mockSdk.cleanup).toHaveBeenCalled();
  });

  it("should delegate createCharacter to SDK actions", async () => {
    const mockResult = { success: true, data: {} };
    mockSdk.actions.createCharacter.mockResolvedValue(mockResult);

    const result = await adapter.createCharacter(0);

    expect(mockSdk.actions.createCharacter).toHaveBeenCalledWith(0);
    expect(result).toBe(mockResult);
  });

  it("should delegate getCharacter to SDK actions", async () => {
    const mockResult = { success: true, data: { exists: true, isAlive: true } };
    mockSdk.actions.getCharacter.mockResolvedValue(mockResult);

    const result = await adapter.getCharacter();

    expect(mockSdk.actions.getCharacter).toHaveBeenCalled();
    expect(result).toBe(mockResult);
  });

  it("should delegate healCharacter to SDK actions", async () => {
    const mockResult = { success: true, data: {} };
    mockSdk.actions.healCharacter.mockResolvedValue(mockResult);

    const result = await adapter.healCharacter();

    expect(mockSdk.actions.healCharacter).toHaveBeenCalled();
    expect(result).toBe(mockResult);
  });

  it("should delegate resurrectCharacter to SDK actions", async () => {
    const mockResult = { success: true, data: {} };
    mockSdk.actions.resurrectCharacter.mockResolvedValue(mockResult);

    const result = await adapter.resurrectCharacter();

    expect(mockSdk.actions.resurrectCharacter).toHaveBeenCalled();
    expect(result).toBe(mockResult);
  });

  it("should delegate loadPools to SDK actions", async () => {
    const mockResult = { success: true, data: {} };
    mockSdk.actions.loadPools.mockResolvedValue(mockResult);

    const result = await adapter.loadPools();

    expect(mockSdk.actions.loadPools).toHaveBeenCalled();
    expect(result).toBe(mockResult);
  });

  it("should delegate loadLeaderboard to SDK actions", async () => {
    const mockResult = { success: true, data: {} };
    const playerAddress = "0xabcdef1234567890abcdef1234567890abcdef12";
    mockSdk.actions.loadLeaderboard.mockResolvedValue(mockResult);

    const result = await adapter.loadLeaderboard(playerAddress);

    expect(mockSdk.actions.loadLeaderboard).toHaveBeenCalledWith(playerAddress);
    expect(result).toBe(mockResult);
  });

  it("should delegate loadClaims to SDK actions", async () => {
    const mockResult = { success: true, data: {} };
    const playerAddress = "0xabcdef1234567890abcdef1234567890abcdef12";
    mockSdk.actions.loadClaims.mockResolvedValue(mockResult);

    const result = await adapter.loadClaims(playerAddress);

    expect(mockSdk.actions.loadClaims).toHaveBeenCalledWith(playerAddress);
    expect(result).toBe(mockResult);
  });

  it("should delegate claimPrize to SDK actions", async () => {
    const mockResult = { success: true, data: {} };
    const epoch = 5n;
    const index = 0n;
    const amount = 1000n;
    const proof = ["0xabcd...", "0xefgh..."];
    mockSdk.actions.claimPrize.mockResolvedValue(mockResult);

    const result = await adapter.claimPrize(epoch, index, amount, proof);

    expect(mockSdk.actions.claimPrize).toHaveBeenCalledWith(epoch, index, amount, proof);
    expect(result).toBe(mockResult);
  });

  it("should delegate clearError to SDK", () => {
    adapter.clearError();
    expect(mockStore.setError).toHaveBeenCalledWith(null);
  });

  it("should call refreshAll with all refresh actions", async () => {
    const mockPoolsResult = { success: true, data: {} };
    const mockLeaderboardResult = { success: true, data: {} };
    const mockClaimsResult = { success: true, data: {} };

    // Mock the SDK to have a playerAddress
    (mockSdk as any).playerAddress = mockConfig.address;

    mockSdk.actions.refreshPools.mockResolvedValue(mockPoolsResult);
    mockSdk.actions.refreshLeaderboard.mockResolvedValue(mockLeaderboardResult);
    mockSdk.actions.refreshClaims.mockResolvedValue(mockClaimsResult);

    const result = await adapter.refreshAll();

    expect(mockSdk.actions.refreshPools).toHaveBeenCalled();
    expect(mockSdk.actions.refreshLeaderboard).toHaveBeenCalledWith(mockConfig.address);
    expect(mockSdk.actions.refreshClaims).toHaveBeenCalledWith(mockConfig.address);
    expect(result).toEqual({ success: true });
  });

  it("should handle refreshAll with rejected promises", async () => {
    const mockError = new Error("Network error");

    // Mock the SDK to have a playerAddress
    (mockSdk as any).playerAddress = mockConfig.address;

    mockSdk.actions.refreshPools.mockRejectedValue(mockError);
    mockSdk.actions.refreshLeaderboard.mockResolvedValue({ success: true });
    mockSdk.actions.refreshClaims.mockResolvedValue({ success: true });

    // refreshAll should reject if any of the promises reject
    try {
      await adapter.refreshAll();
      throw new Error("Expected refreshAll to reject");
    } catch (error: any) {
      expect(error.message).toBe("Network error");
    }

    expect(mockSdk.actions.refreshPools).toHaveBeenCalled();
    expect(mockSdk.actions.refreshLeaderboard).toHaveBeenCalledWith(mockConfig.address);
    expect(mockSdk.actions.refreshClaims).toHaveBeenCalledWith(mockConfig.address);
  });

  it("should store player address from config", async () => {
    // Mock the SDK to have a playerAddress
    (mockSdk as any).playerAddress = mockConfig.address;

    // Mock the actions to resolve
    mockSdk.actions.refreshPools.mockResolvedValue({ success: true });
    mockSdk.actions.refreshLeaderboard.mockResolvedValue({ success: true });
    mockSdk.actions.refreshClaims.mockResolvedValue({ success: true });

    // Verify that refreshAll uses the stored player address
    await adapter.refreshAll();

    expect(mockSdk.actions.refreshLeaderboard).toHaveBeenCalledWith(mockConfig.address);
    expect(mockSdk.actions.refreshClaims).toHaveBeenCalledWith(mockConfig.address);
  });

  it("should handle SDK actions that throw errors", async () => {
    const mockError = new Error("Action failed");
    mockSdk.actions.createCharacter.mockRejectedValue(mockError);

    await expect(adapter.createCharacter(0)).rejects.toThrow("Action failed");
    expect(mockSdk.actions.createCharacter).toHaveBeenCalledWith(0);
  });

  it("should handle claimPrize with different parameter types", async () => {
    const mockResult = { success: true, data: {} };
    mockSdk.actions.claimPrize.mockResolvedValue(mockResult);

    // Test with bigint parameters
    await adapter.claimPrize(10n, 5n, 2500n, ["0xproof1", "0xproof2"]);

    expect(mockSdk.actions.claimPrize).toHaveBeenCalledWith(10n, 5n, 2500n, [
      "0xproof1",
      "0xproof2",
    ]);
  });

  it("should handle empty proof array for claimPrize", async () => {
    const mockResult = { success: true, data: {} };
    mockSdk.actions.claimPrize.mockResolvedValue(mockResult);

    await adapter.claimPrize(1n, 0n, 100n, []);

    expect(mockSdk.actions.claimPrize).toHaveBeenCalledWith(1n, 0n, 100n, []);
  });
});
