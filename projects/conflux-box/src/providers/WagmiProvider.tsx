import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import type React from 'react';
import { WagmiProvider } from 'wagmi';
import { config } from '../config/wagmi';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface WagmiProviderWrapperProps {
  children: React.ReactNode;
}

export function WagmiProviderWrapper({ children }: WagmiProviderWrapperProps) {
  return (
    <WagmiProvider config={config} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="auto"
          mode="light"
          options={{
            initialChainId: config.chains[0].id,
            disclaimer:
              'By connecting your wallet, you agree to use Conflux DevKit for development purposes.',
            hideBalance: true,
            hideTooltips: false,
            hideQuestionMarkCTA: false,
            hideNoWalletCTA: false,
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
