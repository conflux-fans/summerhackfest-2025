// Rate limiting utility to prevent hitting RPC API limits
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 50, windowMs: number = 60000) {
    // 50 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  getWaitTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;

    const oldestRequest = Math.min(...requests);
    const timeUntilOldestExpires = oldestRequest + this.windowMs - Date.now();

    return Math.max(0, timeUntilOldestExpires);
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  resetAll(): void {
    this.requests.clear();
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter(30, 60000); // 30 requests per minute

// Rate limiting wrapper for RPC calls
export async function withRateLimit<T>(
  key: string,
  fn: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  if (rateLimiter.canMakeRequest(key)) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`Rate limited request failed for ${key}:`, error);
      if (fallback) {
        return await fallback();
      }
      throw error;
    }
  } else {
    const waitTime = rateLimiter.getWaitTime(key);
    console.warn(`Rate limit exceeded for ${key}. Wait ${Math.ceil(waitTime / 1000)}s`);

    if (fallback) {
      return await fallback();
    }

    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds`);
  }
}

// RPC endpoint rotation to distribute load
export class RPCRotator {
  private endpoints: string[];
  private currentIndex: number = 0;

  constructor(endpoints: string[]) {
    this.endpoints = endpoints;
  }

  getNextEndpoint(): string {
    const endpoint = this.endpoints[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.endpoints.length;
    return endpoint;
  }

  addEndpoint(endpoint: string): void {
    if (!this.endpoints.includes(endpoint)) {
      this.endpoints.push(endpoint);
    }
  }

  removeEndpoint(endpoint: string): void {
    this.endpoints = this.endpoints.filter((ep) => ep !== endpoint);
    if (this.currentIndex >= this.endpoints.length) {
      this.currentIndex = 0;
    }
  }
}

// Predefined RPC endpoint rotators for different networks
export const confluxTestnetRotator = new RPCRotator([
  "https://evmtestnet.confluxrpc.com",
  "https://evmtestnet.confluxrpc.com",
  "https://evmtestnet.confluxrpc.com",
]);

export const confluxMainnetRotator = new RPCRotator([
  "https://evm.confluxrpc.com",
  "https://evm.confluxrpc.com",
  "https://evm.confluxrpc.com",
]);

export const ethereumRotator = new RPCRotator([
  "https://rpc.ankr.com/eth",
  "https://ethereum.publicnode.com",
  "https://eth-mainnet.g.alchemy.com/v2/demo",
  "https://mainnet.infura.io/v3/demo",
]);

export const polygonRotator = new RPCRotator([
  "https://rpc.ankr.com/polygon",
  "https://polygon.publicnode.com",
  "https://polygon-mainnet.g.alchemy.com/v2/demo",
  "https://polygon-mainnet.infura.io/v3/demo",
]);

// Legacy function for backward compatibility
export const rateLimitedRead = async (
  _key: string,
  fn: () => Promise<any>,
  _cacheTimeout?: number
) => {
  // For now, just execute the function without rate limiting to avoid breaking existing code
  // TODO: Implement proper rate limiting with cache timeout
  return fn();
};
