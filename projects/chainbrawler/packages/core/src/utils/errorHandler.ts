// Error handling utilities
// Based on UX_STATE_MANAGEMENT_SPEC.md

import { type ChainBrawlerError, ErrorType } from "../types";
import {
  DEFAULT_ERROR_CODE,
  extractErrorCode,
  getErrorMessage,
  isRetryableError,
  UNKNOWN_ERROR_CODE,
} from "./errorCodes";

export class UXErrorHandler {
  constructor(
    private store: any, // UXStore - avoiding circular dependency
    private logger?: any // Logger interface
  ) {}

  // Handle contract errors with proper categorization
  handleContractError(error: any, context?: Record<string, any>): ChainBrawlerError {
    const errorCode = extractErrorCode(error);
    const finalErrorCode = errorCode || UNKNOWN_ERROR_CODE;
    const message = getErrorMessage(finalErrorCode);
    const type = this.categorizeError(finalErrorCode);
    const retryable = isRetryableError(finalErrorCode);

    const chainBrawlerError: ChainBrawlerError = {
      type,
      code: finalErrorCode,
      message,
      originalError: error,
      retryable,
      context,
    };

    // Update UX state with error
    this.store.setError(chainBrawlerError.message);
    this.store.setStatusMessage(`Error: ${chainBrawlerError.message}`);

    // Log error for debugging
    if (this.logger) {
      this.logger.error("Contract error occurred", {
        code: chainBrawlerError.code,
        message: chainBrawlerError.message,
        type: chainBrawlerError.type,
        retryable: chainBrawlerError.retryable,
        context,
      });
    }

    return chainBrawlerError;
  }

  // Categorize error based on error code
  private categorizeError(errorCode: number): ErrorType {
    if (errorCode === UNKNOWN_ERROR_CODE) return ErrorType.UNKNOWN_ERROR;
    if (errorCode >= 1000 && errorCode < 1100) return ErrorType.VALIDATION_ERROR;
    if (errorCode >= 1100 && errorCode < 1200) return ErrorType.CONTRACT_ERROR;
    if (errorCode >= 1200 && errorCode < 1300) return ErrorType.CHARACTER_ERROR;
    if (errorCode >= 1300 && errorCode < 1400) return ErrorType.CONTRACT_ERROR;
    if (errorCode >= 1400 && errorCode < 1500) return ErrorType.VALIDATION_ERROR;
    if (errorCode >= 1500 && errorCode < 1600) return ErrorType.POOL_ERROR;
    if (errorCode >= 1600 && errorCode < 1700) return ErrorType.CONTRACT_ERROR;
    if (errorCode >= 1700 && errorCode < 1800) return ErrorType.LEADERBOARD_ERROR;
    if (errorCode >= 2000) return ErrorType.CONTRACT_ERROR;

    return ErrorType.UNKNOWN_ERROR;
  }

  // Clear error state
  clearError(): void {
    this.store.setError(null);
    this.store.setStatusMessage("Ready for action");
  }

  // Retry operation with exponential backoff
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: ChainBrawlerError | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.handleContractError(error);

        if (!lastError.retryable || attempt === maxRetries - 1) {
          throw lastError;
        }

        // Exponential backoff
        const delay = baseDelay * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw (
      lastError || {
        type: ErrorType.UNKNOWN_ERROR,
        code: UNKNOWN_ERROR_CODE,
        message: "Max retries exceeded",
        originalError: null,
        retryable: false,
      }
    );
  }
}
