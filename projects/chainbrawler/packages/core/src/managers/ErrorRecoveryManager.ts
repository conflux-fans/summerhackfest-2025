import { type ChainBrawlerError, ErrorType } from "../types/ErrorType";
import { StatusMessageType } from "../types/StatusMessageType";
import { MenuStateCalculator } from "../utils/MenuStateCalculator";

export class ErrorRecoveryManager {
  constructor(
    private store: any,
    private errorHandler: any
  ) {}

  // Handle contract errors with proper categorization
  handleContractError(error: any, context?: Record<string, any>): ChainBrawlerError {
    const errorCode = this.extractErrorCode(error);
    const message = this.getErrorMessage(errorCode);
    const type = this.categorizeError(errorCode);
    const retryable = this.isRetryableError(errorCode);

    const chainBrawlerError: ChainBrawlerError = {
      type,
      code: errorCode || 5000,
      message,
      originalError: error,
      retryable,
      context,
    };

    // Update UX state with error
    this.store.setError(chainBrawlerError.message);
    this.store.setStatusMessage(`Error: ${chainBrawlerError.message}`);

    // Log error for debugging
    console.error("Contract error occurred", {
      code: chainBrawlerError.code,
      message: chainBrawlerError.message,
      type: chainBrawlerError.type,
      retryable: chainBrawlerError.retryable,
      context,
    });

    return chainBrawlerError;
  }

  // Extract error code from various error formats
  private extractErrorCode(error: any): number {
    if (error?.code) return error.code;
    if (error?.error?.code) return error.error.code;
    if (error?.data?.code) return error.data.code;
    if (error?.reason) {
      const match = error.reason.match(/revert\s+(\d+)/);
      if (match) return parseInt(match[1]);
    }
    if (error?.message) {
      const match = error.message.match(/revert\s+(\d+)/);
      if (match) return parseInt(match[1]);
    }
    return 5000; // Unknown error
  }

  // Get user-friendly error message based on error code
  private getErrorMessage(errorCode: number): string {
    const errorMessages: Record<number, string> = {
      1001: "Character already exists",
      1002: "Invalid character class",
      1003: "Character does not exist",
      1004: "Character is not alive",
      1005: "Character is in combat",
      1006: "Character is not in combat",
      1007: "Invalid enemy ID",
      1008: "Invalid enemy level",
      1009: "Healing cooldown active",
      1010: "Resurrection cooldown active",
      1011: "Insufficient funds",
      1012: "Transaction failed",
      1013: "Contract not initialized",
      1014: "Invalid operation",
      1015: "Character not ready",
      1502: "No funds to withdraw",
      1503: "Transfer failed",
      1704: "Insufficient contract balance",
      1708: "No root available",
      1711: "Already claimed",
      1719: "Invalid proof",
    };

    return errorMessages[errorCode] || `Error ${errorCode}: Unknown error occurred`;
  }

  // Categorize error based on error code
  private categorizeError(errorCode: number): ErrorType {
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

  // Check if error is retryable
  private isRetryableError(errorCode: number): boolean {
    const retryableErrors = [
      1012, // Transaction failed
      1503, // Transfer failed
      1704, // Insufficient contract balance
      1708, // No root available
    ];
    return retryableErrors.includes(errorCode);
  }

  // Clear error state
  clearError(): void {
    this.store.setError(null);
    this.store.setStatusMessage(StatusMessageType.READY);
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
        code: 5000,
        message: "Max retries exceeded",
        originalError: null,
        retryable: false,
      }
    );
  }

  // Recover from character-related errors
  async recoverFromCharacterError(error: ChainBrawlerError): Promise<void> {
    switch (error.code) {
      case 1003: // Character does not exist
        // Refresh character data
        await this.refreshCharacterData();
        break;
      case 1004: {
        // Character is not alive
        // Update character state
        const character = this.store.getCharacter();
        if (character) {
          this.store.updateCharacter({ ...character, isAlive: false });
        }
        break;
      }
      case 1005: // Character is in combat
        // Refresh combat state
        await this.refreshCombatState();
        break;
      default:
        // Generic recovery
        await this.performGenericRecovery();
    }
  }

  private async refreshCharacterData(): Promise<void> {
    try {
      // Get the current player address from the store
      const state = this.store.getState();
      const playerAddress = state.playerAddress;

      if (!playerAddress) {
        return;
      }

      // Get the SDK instance from the store to access character operations
      const sdk = (this.store as any).sdk;
      if (!sdk) {
        return;
      }

      // Refresh character data
      const character = await sdk.actions.getCharacter(playerAddress);
      if (character) {
        this.store.updateCharacter(character);
        this.store.updateMenu(this.calculateMenuState(character));
      }
    } catch (error) {
      // Silent fail - don't throw errors during recovery
    }
  }

  private async refreshCombatState(): Promise<void> {
    try {
      // Get the current player address from the store
      const state = this.store.getState();
      const playerAddress = state.playerAddress;

      if (!playerAddress) {
        return;
      }

      // Get the SDK instance from the store to access combat operations
      const sdk = (this.store as any).sdk;
      if (!sdk) {
        return;
      }

      // Check combat state
      const inCombat = await sdk.actions.isCharacterInCombat?.(playerAddress);
      if (inCombat !== undefined) {
        const character = this.store.getCharacter();
        if (character) {
          this.store.updateCharacter({ ...character, inCombat });
        }
      }
    } catch (error) {
      // Silent fail - don't throw errors during recovery
    }
  }

  private calculateMenuState(character: any): any {
    return MenuStateCalculator.calculateMenuState(character, {
      operation: this.store.getOperation(),
      healingCooldownRemaining: 0, // TODO: Get from contract
    });
  }

  private async performGenericRecovery(): Promise<void> {
    // Clear error state
    this.clearError();

    // Refresh all data
    await Promise.all([
      this.refreshCharacterData(),
      // Add other refresh methods as needed
    ]);
  }
}
