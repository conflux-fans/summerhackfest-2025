import { Badge, Button, Group } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';
import { ConnectKitButton } from 'connectkit';
import React from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useAuthStore } from '../stores/authStore';

interface ConnectButtonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default';
}

export function ConnectButton({ size = 'sm', variant = 'filled' }: ConnectButtonProps) {
  const { address: wagmiAddress } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const {
    isConnected: isAuthenticated,
    walletAddress,
    isAdmin,
    isAuthenticating,
    authRefused,
    connect,
    disconnect,
    clearRefusal,
  } = useAuthStore();

  // Handle authentication after wallet connection
  const handleAuth = React.useCallback(
    async (address: string) => {
      if (address) {
        try {
          await connect(address, async (message: string) => {
            return await signMessageAsync({ message });
          });
        } catch (error) {
          console.error('Authentication failed:', error);
        }
      }
    },
    [connect, signMessageAsync]
  );

  // Handle logout with wallet disconnection
  const handleLogout = React.useCallback(
    (hide?: () => void) => {
      disconnect();
      wagmiDisconnect();
      hide?.();
    },
    [disconnect, wagmiDisconnect]
  );

  // Auto-authenticate when wallet connects (but not if user previously refused)
  React.useEffect(() => {
    if (wagmiAddress && !isAuthenticated && !isAuthenticating && !authRefused) {
      handleAuth(wagmiAddress);
    }
  }, [wagmiAddress, isAuthenticated, isAuthenticating, authRefused, handleAuth]);

  // Clear refusal state when wallet address changes (new wallet connected)
  React.useEffect(() => {
    if (wagmiAddress) {
      clearRefusal();
    }
  }, [wagmiAddress, clearRefusal]);

  return (
    <ConnectKitButton.Custom>
      {({ isConnected: ckIsConnected, isConnecting, show, address }) => {
        // Show loading state
        if (isConnecting || isAuthenticating) {
          return (
            <Button size={size} variant={variant} loading leftSection={<IconWallet size={16} />}>
              {isAuthenticating ? 'Authenticating...' : 'Connecting...'}
            </Button>
          );
        }

        // Show authenticated state
        if (isAuthenticated && walletAddress) {
          return (
            <Group gap="xs">
              <Badge size="lg" color={isAdmin ? 'red' : 'green'} variant="light">
                <Group gap={4}>
                  <div
                    className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-red-500' : 'bg-green-500'}`}
                  />
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </Group>
              </Badge>
              <Button size={size} variant="subtle" color="red" onClick={() => handleLogout()}>
                Disconnect
              </Button>
            </Group>
          );
        }

        // Show connect button
        if (!ckIsConnected) {
          return (
            <Button
              size={size}
              variant={variant}
              leftSection={<IconWallet size={16} />}
              onClick={show}
            >
              Connect Wallet
            </Button>
          );
        }

        // Wallet connected but not authenticated
        if (authRefused) {
          return (
            <Button
              size={size}
              variant="outline"
              color="red"
              leftSection={<IconWallet size={16} />}
              onClick={() => address && handleAuth(address)}
            >
              Sign to Authenticate
            </Button>
          );
        }

        // Wallet connected but not authenticated (auto-auth didn't trigger yet)
        return (
          <Button
            size={size}
            variant="outline"
            color="yellow"
            leftSection={<IconWallet size={16} />}
            onClick={() => address && handleAuth(address)}
          >
            Authenticate
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
