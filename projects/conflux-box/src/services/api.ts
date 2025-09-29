// API service for communicating with DevKit Backend Core - Copied from original working pattern
import axios from 'axios';

// Use Vite proxy in development (/api -> localhost:3001) and an env-provided URL in production
const _env = (import.meta as any).env || {};
const API_BASE_URL = _env.PROD ? _env.VITE_API_BASE_URL || 'http://localhost:3001/api' : '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include auth header
api.interceptors.request.use((config) => {
  if (typeof localStorage !== 'undefined') {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      config.headers.Authorization = `Bearer ${sessionId}`;
    }
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases with user-friendly messages
    if (error.response) {
      const { status, data } = error.response;
      let message = 'An unexpected error occurred';

      switch (status) {
        case 400:
          message = data?.error || 'Invalid request parameters';
          break;
        case 401:
          message = 'Authentication required. Please reconnect your wallet.';
          // Auto-disconnect on auth failure
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('sessionId');
          }
          break;
        case 403:
          message = 'Admin access required for this operation';
          break;
        case 404:
          message = 'Requested resource not found';
          break;
        case 429:
          message = 'Too many requests. Please wait a moment and try again.';
          break;
        case 501:
          message = data?.error || 'Feature not yet implemented';
          break;
        case 503:
          message = 'DevKit backend service is unavailable';
          break;
        default:
          message = data?.error || `Server error (${status})`;
      }

      // Create enhanced error object
      const enhancedError = new Error(message);
      (enhancedError as any).status = status;
      (enhancedError as any).originalError = error;
      (enhancedError as any).isNetworkError = false;
      return Promise.reject(enhancedError);
    } else if (error.request) {
      // Network error
      const networkError = new Error(
        'Unable to connect to DevKit backend. Please check if the backend service is running.'
      );
      (networkError as any).status = 0;
      (networkError as any).originalError = error;
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    } else {
      // Request setup error
      return Promise.reject(error);
    }
  }
);

export class DevKitApiService {
  // Health check
  static async getHealth() {
    const response = await api.get('/health');
    return response.data;
  }

  // Public status
  static async getPublicStatus() {
    const response = await api.get('/status');
    return response.data;
  }

  // Authenticated DevKit status
  static async getDevKitStatus() {
    const response = await api.get('/devkit/status');
    return response.data;
  }

  // Get all accounts
  static async getAllAccounts() {
    const response = await api.get('/devkit/accounts');
    return response.data;
  }

  // Get account info
  static async getAccount(index: number) {
    const response = await api.get(`/devkit/accounts/${index}`);
    return response.data;
  }

  // Get account balance
  static async getAccountBalance(index: number) {
    const response = await api.get(`/devkit/accounts/${index}/balance`);
    return response.data;
  }

  // Deploy contract
  static async deployContract(
    abi: any,
    bytecode: string,
    args: any[] = [],
    chain: 'core' | 'evm' = 'core',
    accountIndex: number = 0
  ) {
    const response = await api.post('/devkit/deploy', {
      abi,
      bytecode,
      args,
      chain,
      accountIndex,
    });
    return response.data;
  }

  // Node control methods
  static async startNode() {
    const response = await api.post('/devkit/node/start');
    return response.data;
  }

  static async stopNode() {
    const response = await api.post('/devkit/node/stop');
    return response.data;
  }

  // Mining control methods
  static async startMining() {
    const response = await api.post('/devkit/mining/start');
    return response.data;
  }

  static async stopMining() {
    const response = await api.post('/devkit/mining/stop');
    return response.data;
  }

  static async setMiningInterval(interval: number) {
    const response = await api.post('/devkit/mining/interval', { interval });
    return response.data;
  }

  static async mineBlocks(blocks: number) {
    const response = await api.post('/devkit/mining/mine', { blocks });
    return response.data;
  }

  // Contract interaction
  static async readContract(
    address: string,
    abi: any,
    method: string,
    args: any[] = [],
    chain: 'core' | 'evm' = 'core'
  ) {
    // Client-side validation to avoid backend 400 responses and give clearer error messages
    if (!address || !abi || !method) {
      throw new Error('Address, ABI, and function name are required');
    }

    const response = await api.post('/devkit/contracts/read', {
      address,
      abi,
      functionName: method,
      args,
      chain,
    });
    return response.data;
  }

  static async writeContract(
    address: string,
    abi: any,
    method: string,
    args: any[] = [],
    chain: 'core' | 'evm' = 'core',
    accountIndex: number = 0
  ) {
    if (!address || !abi || !method) {
      throw new Error('Address, ABI, and function name are required');
    }

    const response = await api.post('/devkit/contracts/write', {
      address,
      abi,
      functionName: method,
      args,
      chain,
      accountIndex,
    });
    return response.data;
  }

  // Transaction methods
  static async sendTransaction(
    to: string,
    value: string,
    data?: string,
    chain: 'core' | 'evm' = 'core',
    accountIndex: number = 0
  ) {
    const response = await api.post('/devkit/transactions/send', {
      to,
      value,
      data,
      chain,
      accountIndex,
    });
    return response.data;
  }

  // Set session (for auth)
  static setSession(sessionId: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sessionId', sessionId);
    }
  }

  // Network switching methods
  static async switchNetwork(network: 'local' | 'testnet' | 'mainnet') {
    const response = await api.post('/devkit/network/switch', { network });
    return response.data;
  }

  static async getCurrentNetwork() {
    const response = await api.get('/devkit/network/current');
    return response.data;
  }

  // Update development settings
  static async updateDevSettings(settings: {
    devBlockIntervalMs?: number;
    devPackTxImmediately?: boolean;
  }) {
    const response = await api.post('/devkit/node/dev-settings', settings);
    return response.data;
  }

  // Sign message with DevKit account
  static async signWithDevKitAccount(
    accountIndex: number,
    message: string,
    chain: 'core' | 'evm' = 'core'
  ) {
    const response = await api.post(`/devkit/accounts/${accountIndex}/sign`, {
      message,
      chain,
    });
    return response.data;
  }

  // Get contract information
  static async getContractInfo(address: string, chain: 'core' | 'evm' = 'core') {
    const response = await api.get(`/devkit/contracts/${address}`, {
      params: { chain },
    });
    return response.data;
  }

  // Advanced transaction sending with data
  static async sendAdvancedTransaction(
    to: string,
    value: string,
    data?: string,
    chain: 'core' | 'evm' = 'core',
    accountIndex: number = 0,
    gasLimit?: string,
    gasPrice?: string
  ) {
    const response = await api.post('/devkit/transactions/send', {
      to,
      value,
      data,
      chain,
      accountIndex,
      gasLimit,
      gasPrice,
    });
    return response.data;
  }

  // Get transaction history (if backend supports it)
  static async getTransactionHistory(
    accountIndex?: number,
    chain: 'core' | 'evm' = 'core',
    limit: number = 50
  ) {
    const params: any = { chain, limit };
    if (accountIndex !== undefined) {
      params.accountIndex = accountIndex;
    }

    const response = await api.get('/devkit/transactions/history', { params });
    return response.data;
  }

  // Get network stats
  static async getNetworkStats() {
    const response = await api.get('/devkit/network/stats');
    return response.data;
  }

  // Reset development environment
  static async resetDevEnvironment() {
    const response = await api.post('/devkit/dev/reset');
    return response.data;
  }

  // Clear session
  static clearSession() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('sessionId');
    }
  }

  // Get WebSocket connection info
  static async getWebSocketInfo() {
    const response = await api.get('/devkit/websocket/info');
    return response.data;
  }
}
