import { Badge, Button, Group } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';
import React from 'react';
import { useAuthStore } from '../stores/authStore';

export function DevConnectButton() {
  const { isConnected, walletAddress, isAdmin, isAuthenticating, disconnect } = useAuthStore();
  const [isConnecting, setIsConnecting] = React.useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Fetch development session directly
      const response = await fetch('http://localhost:3001/api/dev/session');
      if (response.ok) {
        const session = await response.json();

        // Manually set the auth state using the store's internal set function
        useAuthStore.setState({
          isConnected: true,
          walletAddress: session.address,
          isAdmin: session.isAdmin,
          sessionId: session.sessionId,
          isAuthenticating: false,
          authRefused: false,
        });

        console.log('🔧 Connected using development session:', session);
      } else {
        throw new Error('No development session available');
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (isConnecting || isAuthenticating) {
    return (
      <Button size="sm" variant="filled" loading leftSection={<IconWallet size={16} />}>
        Connecting...
      </Button>
    );
  }

  if (isConnected && walletAddress) {
    return (
      <Group gap="xs">
        <Badge size="lg" color={isAdmin ? 'red' : 'green'} variant="light">
          <Group gap={4}>
            <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-red-500' : 'bg-green-500'}`} />
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            {isAdmin && ' (Admin)'}
          </Group>
        </Badge>
        <Button size="sm" variant="subtle" color="red" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </Group>
    );
  }

  return (
    <Button
      size="sm"
      variant="filled"
      leftSection={<IconWallet size={16} />}
      onClick={handleConnect}
    >
      Connect to DevKit
    </Button>
  );
}
