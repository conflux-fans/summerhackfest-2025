import { ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 0. Setup queryClient
export const queryClient = new QueryClient()

// 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID as string

// 2. Create metadata
const metadata = {
  name: 'My React App',
  description: 'A React app with WalletConnect integration',
  url: 'http://localhost:5173',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

// 3. Define Conflux networks
const confluxESpaceMainnet = {
  id: 1030,
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
    default: { name: 'ConfluxScan', url: 'https://evm.confluxscan.net' },
  },
}

const confluxESpaceTestnet = {
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
}

// 4. Define Ethereum Sepolia
const ethereumSepolia = {
  id: 11155111,
  name: 'Ethereum Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://ethereum-sepolia-rpc.publicnode.com'] },
    public: { http: ['https://ethereum-sepolia-rpc.publicnode.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
}

// 5. Set the networks
const networks = [confluxESpaceMainnet, confluxESpaceTestnet, ethereumSepolia]

// 6. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
})

// 7. Create modal (note the added `chainImages` mapping)
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  // map chainId -> image URL
  chainImages: {
    1030: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Conflux.svg',
    71: 'https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Conflux.svg',
    // optionally add sepolia icon as well:
    // 11155111: 'https://path.to/sepolia-icon.svg',
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-font-family': 'system-ui, sans-serif',
    '--w3m-border-radius-master': '0.375rem', // Matches rounded-md (~6px)
  },
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

// 8. Export AppKitProvider
export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
