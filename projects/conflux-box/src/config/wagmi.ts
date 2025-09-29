import { defineChain } from 'viem';
import { createConfig, http } from 'wagmi';
import { confluxESpace, confluxESpaceTestnet } from 'wagmi/chains';

// Define local development chain
export const confluxLocalESpace = defineChain({
  id: 2030,
  name: 'Conflux eSpace (Local)',
  nativeCurrency: {
    name: 'CFX',
    symbol: 'CFX',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
  blockExplorers: {
    default: {
      name: 'ConfluxScan Local',
      url: 'http://localhost:8545',
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [confluxLocalESpace, confluxESpaceTestnet, confluxESpace],
  transports: {
    // Local development
    [confluxLocalESpace.id]: http('http://localhost:8545'),
    // Conflux eSpace testnet
    [confluxESpaceTestnet.id]: http('https://evmtestnet.confluxrpc.com'),
    // Conflux eSpace mainnet - use proxied endpoint to avoid CORS
    [confluxESpace.id]: http('/rpc/conflux'),
  },
});

export const networkConfigs = {
  local: {
    id: 'local',
    name: 'Local Development',
    description: 'Local DevKit node',
    chains: {
      core: {
        name: 'Core Space',
        chainId: 2029,
        rpcUrl: 'http://localhost:12537',
      },
      evm: {
        name: 'eSpace',
        chainId: 2030,
        rpcUrl: 'http://localhost:8545',
        wagmiChain: confluxLocalESpace,
      },
    },
    available: true,
    color: 'green',
  },
  testnet: {
    id: 'testnet',
    name: 'Conflux Testnet',
    description: 'Official test network',
    chains: {
      core: {
        name: 'Core Space',
        chainId: 1,
        rpcUrl: 'https://test.confluxrpc.com',
      },
      evm: {
        name: 'eSpace',
        chainId: 71,
        rpcUrl: 'https://evmtestnet.confluxrpc.com',
        wagmiChain: confluxESpaceTestnet,
      },
    },
    available: true,
    color: 'yellow',
  },
  mainnet: {
    id: 'mainnet',
    name: 'Conflux Mainnet',
    description: 'Production network',
    chains: {
      core: {
        name: 'Core Space',
        chainId: 1029,
        rpcUrl: 'https://main.confluxrpc.com',
      },
      evm: {
        name: 'eSpace',
        chainId: 1030,
        rpcUrl: 'https://evm.confluxrpc.com',
        wagmiChain: confluxESpace,
      },
    },
    available: true,
    color: 'blue',
  },
} as const;

export type NetworkType = keyof typeof networkConfigs;
export type ChainType = 'core' | 'evm';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
