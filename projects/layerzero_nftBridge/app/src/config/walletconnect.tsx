import { ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, Chain } from 'viem';
import { base /*, baseSepolia, sepolia*/ } from 'wagmi/chains';
import { arbitrum } from 'wagmi/chains';
import { CONFLUX_CHAIN_ID, BASE_CHAIN_ID /*, ETH_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID*/ } from '../components/Pages/utils/constants';
// Setup queryClient
export const queryClient = new QueryClient();
// Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID as string;
if (!projectId) {
throw new Error('VITE_PROJECT_ID is not set');
}
// Create metadata
const metadata = {
name: 'NFT Bridge',
description: 'A React app for bridging ERC-721 NFTs across chains',
url: 'http://localhost:5173', // Update to your production URL
icons: ['https://avatars.githubusercontent.com/u/37784886'],
};
// Define Conflux eSpace networks
const confluxESpaceMainnet: Chain = {
id: CONFLUX_CHAIN_ID, // e.g., 1030
name: 'Conflux eSpace',
network: 'conflux-espace',
nativeCurrency: {
name: 'Conflux',
symbol: 'CFX',
decimals: 18,
  },
rpcUrls: {
default: { http: ['https://evm.confluxrpc.com'] },
public: { http: ['https://evm.confluxrpc.com'] },
  },
blockExplorers: {
default: { name: 'ConfluxScan', url: 'https://evm.confluxscan.io' },
  },
};
/*
const confluxESpaceTestnet: Chain = {
id: 71,
name: 'Conflux eSpace Testnet',
network: 'conflux-espace-testnet',
nativeCurrency: {
name: 'Conflux',
symbol: 'CFX',
decimals: 18,
  },
rpcUrls: {
default: { http: ['https://evmtestnet.confluxrpc.com'] },
public: { http: ['https://evmtestnet.confluxrpc.com'] },
  },
blockExplorers: {
default: { name: 'ConfluxScan', url: 'https://evmtestnet.confluxscan.net' },
  },
testnet: true,
};
*/
// Define supported chains
const networks: Chain[] = [confluxESpaceMainnet, base, arbitrum];
// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
networks,
projectId,
ssr: true,
transports: {
[confluxESpaceMainnet.id]: http('https://evm.confluxrpc.com'),
[base.id]: http('https://mainnet.base.org'),
[arbitrum.id]: http('https://arbitrum-one-rpc.publicnode.com'),
  },
});
// Create AppKit modal
createAppKit({
adapters: [wagmiAdapter],
networks,
projectId,
metadata,
chainImages: {
[confluxESpaceMainnet.id]: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Conflux.svg',
[base.id]: 'https://base.org/assets/base-icon-256x256.png',
[arbitrum.id]: 'https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg',
  },
themeMode: 'light',
themeVariables: {
'--w3m-font-family': 'system-ui, sans-serif',
  },
features: {
analytics: true,
email: false, // Disable email/embedded wallet
socials: false, // Disable social logins
  },
});
// Export AppKitProvider
export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}