import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { create } from 'zustand';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  messages: WebSocketMessage[];
  connect: (queryClient?: any) => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  clearMessages: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  connected: false,
  connecting: false,
  error: null,
  messages: [],

  connect: (queryClient?: any) => {
    const state = get();
    if (state.connected || state.connecting) return;

    set({ connecting: true, error: null });

    try {
      const ws = new WebSocket('ws://localhost:3002');

      ws.onopen = () => {
        console.log('WebSocket connected to DevKit backend');
        set({ connected: true, connecting: false, error: null });

        // Show connection notification
        notifications.show({
          title: 'WebSocket Connected',
          message: 'Real-time updates are now available',
          color: 'green',
          autoClose: 3000,
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message);

          // Add to message history
          set((state) => ({
            messages: [...state.messages.slice(-99), message], // Keep last 100 messages
          }));

          // Handle specific message types for React Query cache updates
          if (queryClient) {
            handleDevKitMessage(message, queryClient);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        set({ connected: false, connecting: false });

        // Show disconnection notification
        notifications.show({
          title: 'WebSocket Disconnected',
          message: 'Real-time updates are unavailable',
          color: 'yellow',
          autoClose: 3000,
        });

        // Auto-reconnect after 3 seconds if not a clean close
        if (event.code !== 1000) {
          setTimeout(() => {
            const currentState = get();
            if (!currentState.connected && !currentState.connecting) {
              currentState.connect(queryClient);
            }
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({
          connected: false,
          connecting: false,
          error: 'WebSocket connection failed',
        });

        notifications.show({
          title: 'WebSocket Error',
          message: 'Failed to connect to DevKit backend',
          color: 'red',
          autoClose: 5000,
        });
      };

      // Store WebSocket instance for sending messages
      (window as any).__devkit_ws = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      set({
        connected: false,
        connecting: false,
        error: 'Failed to create WebSocket connection',
      });
    }
  },

  disconnect: () => {
    const ws = (window as any).__devkit_ws;
    if (ws) {
      ws.close(1000, 'Client disconnect');
      (window as any).__devkit_ws = null;
    }
    set({ connected: false, connecting: false });
  },

  sendMessage: (message: any) => {
    const ws = (window as any).__devkit_ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },
}));

// Handle DevKit-specific WebSocket messages
function handleDevKitMessage(message: WebSocketMessage, queryClient: any) {
  switch (message.type) {
    case 'node-status':
      // Update DevKit status cache
      queryClient.setQueryData(['devkit-status'], message.data);
      queryClient.setQueryData(['public-status'], message.data);
      break;

    case 'node-started':
      // Reset mining statistics when node starts
      queryClient.setQueryData(['devkit-status'], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedData = { ...oldData };
        if (updatedData.mining) {
          updatedData.mining.blocksMined = 0;
        }

        // Reset block numbers to initial state
        if (!updatedData.network) updatedData.network = {};
        updatedData.network.blockNumber = 0;
        updatedData.network.evmBlockNumber = 0;

        return updatedData;
      });

      queryClient.setQueryData(['public-status'], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedData = { ...oldData };
        if (updatedData.mining) {
          updatedData.mining.blocksMined = 0;
        }

        // Reset block numbers to initial state
        if (!updatedData.network) updatedData.network = {};
        updatedData.network.blockNumber = 0;
        updatedData.network.evmBlockNumber = 0;

        return updatedData;
      });

      // Refresh all relevant queries
      queryClient.invalidateQueries({ queryKey: ['devkit-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['devkit-balance'] });

      notifications.show({
        title: 'DevKit Node Started',
        message: 'Node is running and mining statistics reset',
        color: 'green',
        autoClose: 3000,
      });
      break;

    case 'block-mined':
      // Update current status with new block number
      queryClient.setQueryData(['devkit-status'], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedData = { ...oldData };
        if (!updatedData.network) updatedData.network = {};

        if (message.data.chain === 'core') {
          updatedData.network.blockNumber = message.data.blockNumber;
        } else if (message.data.chain === 'evm') {
          updatedData.network.evmBlockNumber = message.data.blockNumber;
        }

        return updatedData;
      });

      queryClient.setQueryData(['public-status'], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedData = { ...oldData };
        if (!updatedData.network) updatedData.network = {};

        if (message.data.chain === 'core') {
          updatedData.network.blockNumber = message.data.blockNumber;
        } else if (message.data.chain === 'evm') {
          updatedData.network.evmBlockNumber = message.data.blockNumber;
        }

        return updatedData;
      });

      // Update block numbers cache
      queryClient.setQueryData(['block-numbers'], (oldData: any) => {
        const currentData = oldData || { core: null, evm: null };
        if (message.data.chain === 'core') {
          return { ...currentData, core: message.data.blockNumber };
        } else if (message.data.chain === 'evm') {
          return { ...currentData, evm: message.data.blockNumber };
        }
        return currentData;
      });

      // Invalidate account balances and status
      queryClient.invalidateQueries({ queryKey: ['devkit-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['devkit-balance'] });

      // Show notification for new block
      notifications.show({
        title: 'Block Mined',
        message: `New ${message.data.chain} block #${message.data.blockNumber}`,
        color: 'blue',
        autoClose: 2000,
      });
      break;

    case 'network-switched':
      // Update network cache and invalidate network-dependent data
      queryClient.setQueryData(['devkit-network'], message.data);
      queryClient.invalidateQueries({ queryKey: ['devkit-status'] });
      queryClient.invalidateQueries({ queryKey: ['devkit-accounts'] });

      notifications.show({
        title: 'Network Switched',
        message: `Switched to ${message.data.network}`,
        color: 'indigo',
        autoClose: 3000,
      });
      break;

    case 'balance-changed': {
      // Update specific account balance
      const accountIndex = message.data.accountIndex;
      if (accountIndex !== undefined) {
        queryClient.invalidateQueries({
          queryKey: ['devkit-balance', accountIndex],
        });
        queryClient.invalidateQueries({
          queryKey: ['devkit-account', accountIndex],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['devkit-accounts'] });
      break;
    }

    case 'transaction-confirmed':
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ['devkit-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['devkit-balance'] });

      notifications.show({
        title: 'Transaction Confirmed',
        message: `Transaction ${message.data.hash.slice(0, 10)}... confirmed`,
        color: 'green',
        autoClose: 4000,
      });
      break;

    case 'contract-deployed':
      // Show deployment notification
      notifications.show({
        title: 'Contract Deployed',
        message: `Contract deployed at ${message.data.address.slice(0, 10)}...`,
        color: 'teal',
        autoClose: 5000,
      });
      break;

    default:
      console.log('Unhandled WebSocket message type:', message.type);
  }
}

// Hook for easier use in components with React Query integration
export function useWebSocket() {
  const store = useWebSocketStore();
  const queryClient = useQueryClient();

  // Auto-connect on mount with React Query client
  useEffect(() => {
    if (!store.connected && !store.connecting) {
      store.connect(queryClient);
    }

    return () => {
      // Keep connection alive across component unmounts
    };
  }, [queryClient]);

  return store;
}

// Hook to get recent WebSocket messages of a specific type
export function useWebSocketMessages(messageType?: string, limit = 10) {
  const messages = useWebSocketStore((state) => state.messages);

  return useMemo(() => {
    let filtered = messages;

    if (messageType) {
      filtered = messages.filter((msg) => msg.type === messageType);
    }

    return filtered.slice(-limit).reverse(); // Most recent first
  }, [messages, messageType, limit]);
}
