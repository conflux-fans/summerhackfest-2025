// DevKit related types
export interface DevKitStatus {
  network: {
    connected: boolean;
    coreChainId: number;
    evmChainId: number;
    blockNumber: number;
    mining: boolean;
    version: string;
  };
  backend: {
    connected: boolean;
  };
  websocket: {
    connected: boolean;
  };
  accounts: Account[];
  contracts: Contract[];
}

export interface Account {
  index: number;
  addresses: {
    core: string;
    evm: string;
  };
  balance?: string;
  isAdmin?: boolean;
}

export interface Contract {
  id: string;
  name: string;
  address: string;
  network: 'core' | 'evm';
  type: string;
  deployedAt: string;
  abi?: any[];
}

export interface Transaction {
  hash: string;
  from: string;
  to?: string;
  value: string;
  gasUsed?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  network: 'core' | 'evm';
}

export interface NetworkInfo {
  coreChainId: number;
  evmChainId: number;
  connected: boolean;
  blockNumber: number;
  mining: boolean;
  nodeVersion?: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

// Form types
export interface CreateAccountForm {
  index?: number;
  network: 'core' | 'evm' | 'both';
}

export interface DeployContractForm {
  type: string;
  name: string;
  network: 'core' | 'evm';
  constructorArgs?: any[];
}

export interface SendTransactionForm {
  to: string;
  value: string;
  data?: string;
  network: 'core' | 'evm';
}

// Settings types
export interface AppSettings {
  theme: 'auto' | 'light' | 'dark';
  showAdvanced: boolean;
  enableNotifications: boolean;
  autoReconnect: boolean;
  apiEndpoint: string;
  wsEndpoint: string;
}

export interface DevSettings {
  blockInterval: number;
  autoMining: boolean;
  instantMining: boolean;
  networkMode: 'local' | 'testnet' | 'mainnet';
}
