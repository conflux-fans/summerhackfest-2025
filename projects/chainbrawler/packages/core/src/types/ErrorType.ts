export enum ErrorType {
  NETWORK_ERROR = "Network connection failed",
  CONTRACT_ERROR = "Contract interaction failed",
  VALIDATION_ERROR = "Invalid operation",
  COOLDOWN_ERROR = "Operation on cooldown",
  CHARACTER_ERROR = "Character state error",
  TRANSACTION_ERROR = "Transaction failed",
  POOL_ERROR = "Pool operation failed",
  LEADERBOARD_ERROR = "Leaderboard operation failed",
  CLAIM_ERROR = "Prize claim failed",
  UNKNOWN_ERROR = "Unknown error occurred",
}

export interface ChainBrawlerError {
  type: ErrorType;
  code: number;
  message: string;
  originalError?: any;
  retryable: boolean;
  context?: Record<string, any>;
}
