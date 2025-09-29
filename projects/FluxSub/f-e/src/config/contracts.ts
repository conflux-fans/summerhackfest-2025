// FluxSub Smart Contract Addresses
export const CONTRACTS = {
  testnet: {
    FluxSubFactory: "0x...", // Replace with deployed address
    FluxSub: "0x...",        // Replace with deployed address
  },
  mainnet: {
    FluxSubFactory: "0xb62B847c8F00d15b0d05A5902B6C995B2E6B87dC",
    FluxSub: "0xe475f7E4caC5ED0229dbc0e040a88A09c625dF74",
  },
  espace: {
    FluxSubFactory: "0xb62B847c8F00d15b0d05A5902B6C995B2E6B87dC", // Same addresses for eSpace
    FluxSub: "0xe475f7E4caC5ED0229dbc0e040a88A09c625dF74",
  }
};

// Network configuration
export const NETWORKS = {
  testnet: {
    name: "Conflux Testnet",
    chainId: 1,
    rpcUrl: "https://test.confluxrpc.com",
    explorerUrl: "https://testnet.confluxscan.io",
  },
  mainnet: {
    name: "Conflux Mainnet", 
    chainId: 1029,
    rpcUrl: "https://main.confluxrpc.com",
    explorerUrl: "https://confluxscan.io",
  },
  espace: {
    name: "Conflux eSpace Mainnet",
    chainId: 1030,
    rpcUrl: "https://evm.confluxrpc.com",
    explorerUrl: "https://evm.confluxscan.io",
  }
};

// Current network (change this to switch between testnet/mainnet/espace)
export const CURRENT_NETWORK = 'espace';

// Get current contract addresses
export const getCurrentContracts = () => CONTRACTS[CURRENT_NETWORK];
export const getCurrentNetwork = () => NETWORKS[CURRENT_NETWORK];
