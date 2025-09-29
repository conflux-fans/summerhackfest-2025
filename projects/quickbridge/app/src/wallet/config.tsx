import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { arbitrum, mainnet, base, optimism, polygon } from '@reown/appkit/networks'; // Added optimism, polygon, bnbChain (for BSC)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks'; // Updated import for defineChain to support AppKit-specific fields
// Replace with your actual projectId from Reown Dashboard
const projectId = '23908c335a70d4fbe35271c97eb55029';
const metadata = {
name: 'My Meson-Ready App',
description: 'App with Reown Wallet Connect and Meson API integration',
url: 'http://localhost:5173', // Your app's URL (update for production)
icons: ['https://avatars.githubusercontent.com/u/179229932'],
};
// Define custom Conflux eSpace Mainnet (EVM-compatible, not predefined in Reown networks)
// Added caipNetworkId and chainNamespace for proper AppKit support
const confluxESpace = defineChain({
id: 1030,
caipNetworkId: 'eip155:1030',
chainNamespace: 'eip155',
name: 'Conflux eSpace',
nativeCurrency: { name: 'Conflux', symbol: 'CFX', decimals: 18 },
rpcUrls: {
default: { http: ['https://evm.confluxrpc.com'] },
  },
blockExplorers: {
default: { name: 'ConfluxScan', url: 'https://evm.confluxscan.io' },
  },
});
// Networks array now includes all for Meson cross-chain support (matches MesonSwaps.tsx)
const networks = [mainnet, arbitrum, base, optimism, polygon, confluxESpace];
const queryClient = new QueryClient();
const wagmiAdapter = new WagmiAdapter({
networks,
projectId,
ssr: true, // Enables SSR support to avoid hydration issues
});
createAppKit({
adapters: [wagmiAdapter],
networks,
projectId,
metadata,
features: {
analytics: true, // Optional
  },
});
export function WalletProvider({ children }: { children: React.ReactNode }) {
return (
<WagmiProvider config={wagmiAdapter.wagmiConfig}>
<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
</WagmiProvider>
  );
}