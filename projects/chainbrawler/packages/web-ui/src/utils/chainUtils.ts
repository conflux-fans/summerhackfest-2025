import { confluxESpace, confluxESpaceTestnet } from "viem/chains";

export interface AddChainParams {
  chainId: `0x${string}`;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

export const confluxTestnetChainParams: AddChainParams = {
  chainId: `0x${confluxESpaceTestnet.id.toString(16)}`, // Convert to hex
  chainName: confluxESpaceTestnet.name,
  nativeCurrency: {
    name: confluxESpaceTestnet.nativeCurrency.name,
    symbol: confluxESpaceTestnet.nativeCurrency.symbol,
    decimals: confluxESpaceTestnet.nativeCurrency.decimals,
  },
  rpcUrls: [...confluxESpaceTestnet.rpcUrls.default.http],
  blockExplorerUrls: confluxESpaceTestnet.blockExplorers.default
    ? [confluxESpaceTestnet.blockExplorers.default.url]
    : undefined,
};

export const confluxMainnetChainParams: AddChainParams = {
  chainId: `0x${confluxESpace.id.toString(16)}`, // Convert to hex
  chainName: confluxESpace.name,
  nativeCurrency: {
    name: confluxESpace.nativeCurrency.name,
    symbol: confluxESpace.nativeCurrency.symbol,
    decimals: confluxESpace.nativeCurrency.decimals,
  },
  rpcUrls: [...confluxESpace.rpcUrls.default.http],
  blockExplorerUrls: confluxESpace.blockExplorers.default
    ? [confluxESpace.blockExplorers.default.url]
    : undefined,
};

export async function addConfluxTestnetToWallet(): Promise<boolean> {
  try {
    if (!window.ethereum) {
      throw new Error("No wallet detected. Please install MetaMask or another Web3 wallet.");
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [confluxTestnetChainParams],
    });

    return true;
  } catch (error: any) {
    console.error("Failed to add Conflux testnet to wallet:", error);

    if (error.code === 4902) {
      // Chain already added
      return true;
    }

    throw new Error(`Failed to add Conflux testnet: ${error.message}`);
  }
}

export async function addConfluxMainnetToWallet(): Promise<boolean> {
  try {
    if (!window.ethereum) {
      throw new Error("No wallet detected. Please install MetaMask or another Web3 wallet.");
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [confluxMainnetChainParams],
    });

    return true;
  } catch (error: any) {
    console.error("Failed to add Conflux mainnet to wallet:", error);

    if (error.code === 4902) {
      // Chain already added
      return true;
    }

    throw new Error(`Failed to add Conflux mainnet: ${error.message}`);
  }
}

export async function switchToConfluxTestnet(): Promise<boolean> {
  try {
    if (!window.ethereum) {
      throw new Error("No wallet detected. Please install MetaMask or another Web3 wallet.");
    }

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: confluxTestnetChainParams.chainId }],
    });

    return true;
  } catch (error: any) {
    console.error("Failed to switch to Conflux testnet:", error);

    if (error.code === 4902) {
      // Chain not added, try to add it
      return await addConfluxTestnetToWallet();
    }

    throw new Error(`Failed to switch to Conflux testnet: ${error.message}`);
  }
}

export async function switchToConfluxMainnet(): Promise<boolean> {
  try {
    if (!window.ethereum) {
      throw new Error("No wallet detected. Please install MetaMask or another Web3 wallet.");
    }

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: confluxMainnetChainParams.chainId }],
    });

    return true;
  } catch (error: any) {
    console.error("Failed to switch to Conflux mainnet:", error);

    if (error.code === 4902) {
      // Chain not added, try to add it
      return await addConfluxMainnetToWallet();
    }

    throw new Error(`Failed to switch to Conflux mainnet: ${error.message}`);
  }
}

export function getConfluxTestnetInfo() {
  return {
    chainId: confluxESpaceTestnet.id,
    name: confluxESpaceTestnet.name,
    symbol: confluxESpaceTestnet.nativeCurrency.symbol,
    rpcUrl: confluxESpaceTestnet.rpcUrls.default.http[0],
    blockExplorer: confluxESpaceTestnet.blockExplorers.default?.url,
  };
}

export function getConfluxMainnetInfo() {
  return {
    chainId: confluxESpace.id,
    name: confluxESpace.name,
    symbol: confluxESpace.nativeCurrency.symbol,
    rpcUrl: confluxESpace.rpcUrls.default.http[0],
    blockExplorer: confluxESpace.blockExplorers.default?.url,
  };
}

// Helper function to get chain info by chain ID
export function getConfluxChainInfo(chainId: number) {
  if (chainId === confluxESpaceTestnet.id) {
    return getConfluxTestnetInfo();
  } else if (chainId === confluxESpace.id) {
    return getConfluxMainnetInfo();
  }
  throw new Error(`Unsupported Conflux chain ID: ${chainId}`);
}
