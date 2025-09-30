import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../stores/authStore';

// Mock the API service
vi.mock('../services/api', () => ({
  DevKitApiService: {
    getAuthChallenge: vi.fn(),
    authenticate: vi.fn(),
    clearSession: vi.fn(),
  },
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      isConnected: false,
      walletAddress: null,
      isAdmin: false,
      sessionId: null,
      isAuthenticating: false,
      authRefused: false,
    });
  });

  it('should have default state', () => {
    const state = useAuthStore.getState();

    expect(state.isConnected).toBe(false);
    expect(state.walletAddress).toBe(null);
    expect(state.isAdmin).toBe(false);
    expect(state.sessionId).toBe(null);
    expect(state.isAuthenticating).toBe(false);
    expect(state.authRefused).toBe(false);
  });

  it('should disconnect', () => {
    const { disconnect } = useAuthStore.getState();

    // Set some connected state first
    useAuthStore.setState({
      isConnected: true,
      walletAddress: '0x123',
      sessionId: 'test-session',
      isAdmin: true,
    });

    // Then disconnect
    disconnect();

    const state = useAuthStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.walletAddress).toBe(null);
    expect(state.sessionId).toBe(null);
    expect(state.isAdmin).toBe(false);
  });

  it('should clear refusal', () => {
    const { clearRefusal } = useAuthStore.getState();

    // Set refused state
    useAuthStore.setState({ authRefused: true });
    expect(useAuthStore.getState().authRefused).toBe(true);

    // Clear refusal
    clearRefusal();
    expect(useAuthStore.getState().authRefused).toBe(false);
  });
});
