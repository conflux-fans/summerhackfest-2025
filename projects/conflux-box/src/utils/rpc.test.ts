import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RPCClient } from '../utils/rpc';

// Mock fetch for testing
global.fetch = vi.fn();

describe('RPCClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCoreBlockNumber', () => {
    it('should fetch core block number successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            result: {
              blockNumber: '0x123',
            },
            id: 1,
          }),
      };

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      const result = await RPCClient.fetchCoreBlockNumber('http://test-rpc');

      expect(result).toBe(0x123);
      expect(fetch).toHaveBeenCalledWith('http://test-rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'cfx_getStatus',
          params: [],
          id: 1,
          jsonrpc: '2.0',
        }),
      });
    });

    it('should return null on fetch error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await RPCClient.fetchCoreBlockNumber('http://test-rpc');

      expect(result).toBe(null);
    });

    it('should return null on invalid response', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            result: {},
            id: 1,
          }),
      };

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      const result = await RPCClient.fetchCoreBlockNumber('http://test-rpc');

      expect(result).toBe(null);
    });
  });

  describe('fetchEVMBlockNumber', () => {
    it('should fetch EVM block number successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            result: '0x456',
            id: 1,
          }),
      };

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any);

      const result = await RPCClient.fetchEVMBlockNumber('http://test-rpc');

      expect(result).toBe(0x456);
      expect(fetch).toHaveBeenCalledWith('http://test-rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'eth_blockNumber',
          params: [],
          id: 1,
          jsonrpc: '2.0',
        }),
      });
    });
  });

  describe('getRpcUrls', () => {
    it('should return correct URLs for testnet', () => {
      const urls = RPCClient.getRpcUrls('testnet');

      expect(urls).toEqual({
        core: 'https://test.confluxrpc.com',
        evm: 'https://evmtestnet.confluxrpc.com',
      });
    });

    it('should return correct URLs for mainnet', () => {
      const urls = RPCClient.getRpcUrls('mainnet');

      expect(urls).toEqual({
        core: 'https://main.confluxrpc.com',
        evm: 'https://evm.confluxrpc.com',
      });
    });

    it('should return correct URLs for local', () => {
      const urls = RPCClient.getRpcUrls('local');

      expect(urls).toEqual({
        core: 'http://localhost:12537',
        evm: 'http://localhost:8545',
      });
    });
  });
});
