/**
 * Format large numbers with appropriate suffixes (K, M, B, T, etc.)
 */
export function formatNumber(value: bigint | number): string {
  const num = typeof value === 'bigint' ? Number(value) : value;
  
  if (num < 1000) {
    return num.toString();
  }
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const magnitude = Math.floor(Math.log10(num) / 3);
  const scaledNum = num / Math.pow(1000, magnitude);
  
  if (magnitude >= suffixes.length) {
    return num.toExponential(2);
  }
  
  return scaledNum.toFixed(scaledNum < 10 ? 2 : scaledNum < 100 ? 1 : 0) + suffixes[magnitude];
}

/**
 * Format time duration in human-readable format
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ${seconds % 60}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ${minutes % 60}m`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format CFX amount with proper decimals
 */
export function formatCFX(amount: bigint | string): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  const cfx = Number(value) / 1e18;
  
  if (cfx < 0.001) {
    return '< 0.001 CFX';
  }
  
  return `${cfx.toFixed(4)} CFX`;
}

/**
 * Parse user input to BigInt (handles decimal inputs)
 */
export function parseUserInput(input: string, decimals: number = 18): bigint {
  if (!input || input === '') return BigInt(0);
  
  const cleanInput = input.replace(/[^0-9.]/g, '');
  const parts = cleanInput.split('.');
  
  if (parts.length > 2) {
    throw new Error('Invalid number format');
  }
  
  const integerPart = parts[0] || '0';
  const decimalPart = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
  
  const fullNumber = integerPart + decimalPart;
  return BigInt(fullNumber);
}

/**
 * Calculate percentage between two values
 */
export function calculatePercentage(current: bigint, target: bigint): number {
  if (target === BigInt(0)) return 0;
  return Math.min(Number((current * BigInt(100)) / target), 100);
}

/**
 * Format percentage for display
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate random ID for temporary elements
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}