// RPC utility functions for direct blockchain queries
export class RPCClient {
  static async fetchCoreBlockNumber(rpcUrl = 'http://localhost:12537'): Promise<number | null> {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'cfx_getStatus',
          params: [],
          id: 1,
          jsonrpc: '2.0',
        }),
      });

      const result = await response.json();
      if (result.result?.blockNumber) {
        return parseInt(result.result.blockNumber, 16);
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch Core block number:', error);
      return null;
    }
  }

  static async fetchEVMBlockNumber(rpcUrl = 'http://localhost:8545'): Promise<number | null> {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_blockNumber',
          params: [],
          id: 1,
          jsonrpc: '2.0',
        }),
      });

      const result = await response.json();
      if (result.result) {
        return parseInt(result.result, 16);
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch EVM block number:', error);
      return null;
    }
  }

  static async fetchBothBlockNumbers(
    coreRpcUrl = 'http://localhost:12537',
    evmRpcUrl = 'http://localhost:8545'
  ): Promise<{ core: number | null; evm: number | null }> {
    const [core, evm] = await Promise.all([
      RPCClient.fetchCoreBlockNumber(coreRpcUrl),
      RPCClient.fetchEVMBlockNumber(evmRpcUrl),
    ]);

    return { core, evm };
  }

  static getRpcUrls(network: 'local' | 'testnet' | 'mainnet' = 'local') {
    switch (network) {
      case 'testnet':
        return {
          core: 'https://test.confluxrpc.com',
          evm: 'https://evmtestnet.confluxrpc.com',
        };
      case 'mainnet':
        return {
          core: 'https://main.confluxrpc.com',
          evm: 'https://evm.confluxrpc.com',
        };
      default:
        return {
          core: 'http://localhost:12537',
          evm: 'http://localhost:8545',
        };
    }
  }

  static async fetchBlockNumbersByNetwork(
    network: 'local' | 'testnet' | 'mainnet' = 'local'
  ): Promise<{ core: number | null; evm: number | null }> {
    const urls = RPCClient.getRpcUrls(network);
    return RPCClient.fetchBothBlockNumbers(urls.core, urls.evm);
  }
}
