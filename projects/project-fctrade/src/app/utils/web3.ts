import { ethers } from 'ethers';
// ABIs are now defined in this file as placeholders.
// import { FC_TOKEN_ABI, ORDERBOOK_ABI } from '../contracts/abi';

// --- ABI Definitions (Placeholders) ---
// Standard ERC20 ABI for FC Token
export const FC_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

// Placeholder for the new OrderBook contract ABI
export const ORDERBOOK_ABI = [
  // Functions for creating and cancelling orders
  "function createBuyOrder(uint256 fcAmount, uint256 price) payable",
  "function createSellOrder(uint256 fcAmount, uint256 price)",
  "function cancelOrder(uint256 orderId)",

  // Functions for filling orders
  "function fillBuyOrder(uint256 orderId, uint256 fcAmountToSell)",
  "function fillSellOrder(uint256 orderId, uint256 fcAmountToBuy) payable",

  // View functions to get order data
  "function getOpenOrders(bool _isBuyOrder) view returns (tuple(uint256 id, address owner, bool isBuyOrder, uint256 price, uint256 fcAmountTotal, uint256 filledFcAmount, bool isActive, uint256 timestamp)[])",
  "function getUserOpenOrders(address user) view returns (tuple(uint256 id, address owner, bool isBuyOrder, uint256 price, uint256 fcAmountTotal, uint256 filledFcAmount, bool isActive, uint256 timestamp)[])",

  // Sweep functions
  "function sweepSellOrders(uint256 _maxPrice, uint256 _maxFcToBuy) payable",
  "function sweepBuyOrders(uint256 _minPrice, uint256 _maxFcToSell)",

  // Admin functions from Ownable
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
  "function setFee(uint256 _newFeeBps)",
  "function withdrawFees()",
  "function accumulatedCfxFees() view returns (uint256)"
];

// Network configuration that reads from environment variables
// Defaults to Conflux eSpace Testnet if no values are provided
export const NETWORK_CONFIG = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '0x47', // Default to 71 (Testnet)
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME || 'Conflux eSpace Testnet',
  nativeCurrency: {
    name: 'CFX',
    symbol: 'CFX',
    decimals: 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_CONFLUX_RPC_URL || 'https://evmtestnet.confluxrpc.com'],
  blockExplorerUrls: [process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || 'https://evmtestnet.confluxscan.io'],
};

// Updated contract addresses for FC Token and the new OrderBook contract
export const CONTRACT_ADDRESSES = {
  FC_TOKEN: process.env.NEXT_PUBLIC_FC_TOKEN_ADDRESS || '',
  ORDERBOOK: process.env.NEXT_PUBLIC_ORDERBOOK_CONTRACT_ADDRESS || '',
};

// 检查是否安装了MetaMask
export const checkIfWalletIsConnected = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts[0];
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      return null;
    }
  }
  return null;
};

// 连接钱包
export const connectWallet = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    throw new Error('MetaMask is not installed');
  }
};

// 切换到Conflux测试网
export const switchToConfiguredNetwork = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    try {
      // 先请求账户授权
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4100) {
        alert('请在钱包弹窗中同意授权或切换网络，否则无法连接。');
        return;
      }
      // 如果网络不存在，添加网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG],
          });
        } catch (addError) {
          console.error('Error adding configured network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  }
};

// 获取Provider
export const getProvider = () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  return null;
};

// 获取Signer
export const getSigner = async () => {
  const provider = getProvider();
  if (provider) {
    return provider.getSigner();
  }
  return null;
};

// Get FC (ERC20) Token Contract
export const getFCTokenContract = async () => {
  const signer = await getSigner();
  if (signer && CONTRACT_ADDRESSES.FC_TOKEN) {
    return new ethers.Contract(CONTRACT_ADDRESSES.FC_TOKEN, FC_TOKEN_ABI, signer);
  }
  return null;
};

// Get OrderBook Contract
export const getOrderBookContract = async () => {
  const signer = await getSigner();
  if (signer && CONTRACT_ADDRESSES.ORDERBOOK) {
    return new ethers.Contract(CONTRACT_ADDRESSES.ORDERBOOK, ORDERBOOK_ABI, signer);
  }
  return null;
};

// Get owner from OrderBook Contract
export const getOwner = async () => {
  const contract = await getOrderBookContract();
  if (contract) {
    try {
      return await contract.owner();
    } catch (error) {
      console.error('Error getting owner:', error);
      return null;
    }
  }
  return null;
}

// Withdraw fees from OrderBook Contract
export const withdrawFees = async () => {
  const contract = await getOrderBookContract();
  if (contract) {
    try {
      const tx = await contract.withdrawFees();
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error withdrawing fees:', error);
      throw error;
    }
  }
  return false;
}

// Transfer ownership of the OrderBook Contract
export const transferOwnership = async (newOwner: string) => {
  const contract = await getOrderBookContract();
  if (contract) {
    try {
      const tx = await contract.transferOwnership(newOwner);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error transferring ownership:', error);
      throw error;
    }
  }
  return false;
};

// Get accumulated CFX fees from OrderBook Contract
export const getAccumulatedCfxFees = async () => {
  const contract = await getOrderBookContract();
  if (contract) {
    try {
      return await contract.accumulatedCfxFees();
    } catch (error) {
      console.error('Error getting accumulated CFX fees:', error);
      return ethers.BigNumber.from(0);
    }
  }
  return ethers.BigNumber.from(0);
}

// 格式化代币数量
export const formatTokenAmount = (amount: ethers.BigNumber, decimals: number = 18) => {
  return ethers.utils.formatUnits(amount, decimals);
};

// 解析代币数量
export const parseTokenAmount = (amount: string, decimals: number = 18) => {
  // Add safety check for empty string
  if (!amount) return ethers.BigNumber.from(0);
  try {
    return ethers.utils.parseUnits(amount, decimals);
  } catch (error) {
    console.error("Error parsing amount:", amount, error);
    return ethers.BigNumber.from(0);
  }
};

// 格式化地址
export const formatAddress = (address: string) => {
  if (!address || address.length < 11) return '...';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get user FC balance
export const getUserFCBalance = async (userAddress: string) => {
  const contract = await getFCTokenContract();
  if (contract) {
    try {
      const balance = await contract.balanceOf(userAddress);
      return balance;
    } catch (error) {
      console.error('Error getting FC balance:', error);
      return ethers.BigNumber.from(0);
    }
  }
  return ethers.BigNumber.from(0);
};

// Get user native CFX balance
export const getUserCFXBalance = async (userAddress: string) => {
  const provider = getProvider();
  if (provider) {
    try {
      const balance = await provider.getBalance(userAddress);
      return balance;
    } catch (error) {
      console.error('Error getting CFX balance:', error);
      return ethers.BigNumber.from(0);
    }
  }
  return ethers.BigNumber.from(0);
};

// A generic function to fetch open orders.
// Assumes the contract has a function `getOpenOrders(isBuyOrder)` that returns an array of orders.
// A more robust implementation might use pagination (e.g., `getOpenOrders(isBuyOrder, limit, offset)`).
export const getOpenOrders = async (isBuyOrder: boolean) => {
  const contract = await getOrderBookContract();
  if (contract) {
    try {
      // This function name is an assumption of the new contract's interface.
      const orders = await contract.getOpenOrders(isBuyOrder); 
      // It's good practice to map contract results to plain JS objects.
      return orders.map((order: any) => ({
        id: order.id.toNumber(),
        user: order.owner,
        isBuyOrder: order.isBuyOrder,
        price: order.price,
        fcAmount: order.fcAmountTotal,
        filledFcAmount: order.filledFcAmount,
        timestamp: order.timestamp.toNumber(),
      })).filter((order: any) => order.id > 0); // Filter out empty structs
    } catch (error) {
      console.error(`Error getting ${isBuyOrder ? 'buy' : 'sell'} orders:`, error);
      return [];
    }
  }
  return [];
};

export const getMyOpenOrders = async (userAddress: string) => {
  const contract = await getOrderBookContract();
  if (contract) {
    try {
      // This function name is an assumption of the new contract's interface.
      const orders = await contract.getUserOpenOrders(userAddress);
      return orders.map((order: any) => ({
        id: order.id.toNumber(),
        user: order.owner,
        isBuyOrder: order.isBuyOrder,
        price: order.price,
        fcAmount: order.fcAmountTotal,
        filledFcAmount: order.filledFcAmount,
        timestamp: order.timestamp.toNumber(),
      })).filter((order: any) => order.id > 0); // Filter out empty structs
    } catch (error) {
      console.error('Error getting my open orders:', error);
      return [];
    }
  }
  return [];
};

// 监听钱包变化
export const listenToWalletChanges = (callback: (accounts: string[]) => void) => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', callback);
    window.ethereum.on('chainChanged', () => window.location.reload());
  }
};

// 移除钱包监听
export const removeWalletListeners = () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    // A potential issue in the original code: removeAllListeners can be aggressive
    // if other parts of a larger app use it. For this standalone app, it's okay.
    window.ethereum.removeAllListeners();
  }
};

// 获取区块浏览器基础URL（由.envprod/.envtest中的NEXT_PUBLIC_BLOCK_EXPLORER_URL控制）
export const getBlockExplorerBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || 'https://evmtestnet.confluxscan.io';
  if (url.endsWith('/')) url = url.slice(0, -1);
  return url;
}; 