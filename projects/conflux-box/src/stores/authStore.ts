// Auth store - Copied from original working pattern
import { create } from 'zustand';
import { DevKitApiService } from '../services/api';

interface AuthChallenge {
  message: string;
  nonce: string;
}

interface AuthResult {
  sessionId: string;
  address: string;
  isAdmin: boolean;
}

interface AuthState {
  isConnected: boolean;
  walletAddress: string | null;
  isAdmin: boolean;
  sessionId: string | null;
  isAuthenticating: boolean;
  authRefused: boolean;
  connect: (address: string, signMessage: (message: string) => Promise<string>) => Promise<void>;
  disconnect: () => void;
  clearRefusal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isConnected: false,
  walletAddress: null,
  isAdmin: false,
  sessionId: null,
  isAuthenticating: false,
  authRefused: false,

  connect: async (address: string, signMessage: (message: string) => Promise<string>) => {
    set({ isAuthenticating: true, authRefused: false });

    try {
      // Step 1: Get authentication challenge
      const challengeResponse = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!challengeResponse.ok) {
        throw new Error('Failed to get authentication challenge');
      }

      const challenge = (await challengeResponse.json()) as AuthChallenge;

      // Step 2: Sign the challenge message
      const signature = await signMessage(challenge.message);

      // Step 3: Verify signature and get session
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, signature }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify signature');
      }

      const authResult = (await verifyResponse.json()) as AuthResult;

      // Step 4: Set session in API service and store
      DevKitApiService.setSession(authResult.sessionId);

      set({
        isConnected: true,
        walletAddress: address,
        isAdmin: authResult.isAdmin,
        sessionId: authResult.sessionId,
        isAuthenticating: false,
      });
    } catch (error) {
      console.error('Failed to authenticate:', error);
      DevKitApiService.clearSession();

      // Check if user refused to sign (common error messages)
      const errorMessage = (error as Error)?.message?.toLowerCase() || '';
      const isUserRefusal =
        errorMessage.includes('rejected') ||
        errorMessage.includes('denied') ||
        errorMessage.includes('cancelled') ||
        errorMessage.includes('user rejected');

      set({
        isConnected: false,
        walletAddress: null,
        isAdmin: false,
        sessionId: null,
        isAuthenticating: false,
        authRefused: isUserRefusal,
      });
      throw error;
    }
  },

  disconnect: () => {
    DevKitApiService.clearSession();
    set({
      isConnected: false,
      walletAddress: null,
      isAdmin: false,
      sessionId: null,
      isAuthenticating: false,
      authRefused: false,
    });
  },

  clearRefusal: () => {
    set({ authRefused: false });
  },
}));
