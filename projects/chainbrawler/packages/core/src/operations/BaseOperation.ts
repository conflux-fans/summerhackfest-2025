// Base operation class for all ChainBrawler operations
// Based on UX_STATE_MANAGEMENT_SPEC.md

import type { ContractClient } from "../contract/ContractClient";
import { ChainBrawlerError, type OperationResult } from "../types";
import { UXErrorHandler } from "../utils/errorHandler";

export abstract class BaseOperation {
  protected errorHandler: UXErrorHandler;

  constructor(
    protected store: any, // UXStore - avoiding circular dependency
    protected contractClient: ContractClient, // Contract client interface
    protected eventEmitter: any, // Event emitter interface
    logger?: any
  ) {
    this.errorHandler = new UXErrorHandler(store, logger);
  }

  // Handle contract calls with error handling
  protected async handleContractCall<T>(
    contractCall: () => Promise<T>
  ): Promise<OperationResult<T>> {
    try {
      const result = await contractCall();
      return { success: true, data: result };
    } catch (error) {
      const chainBrawlerError = this.errorHandler.handleContractError(error);

      // Log error for debugging
      console.error("Contract call failed:", {
        code: chainBrawlerError.code,
        message: chainBrawlerError.message,
        originalError: chainBrawlerError.originalError,
      });

      return {
        success: false,
        error: chainBrawlerError.message,
        code: chainBrawlerError.code,
      };
    }
  }

  // Start operation tracking
  protected startOperation(type: string, data?: any): void {
    this.store.updateOperation({
      isActive: true,
      operationType: type,
      status: "pending",
      startTime: Date.now(),
      progress: "Starting operation...",
      isWriteOperation: this.isWriteOperation(type),
      ...data,
    });
  }

  // Determine if an operation is a write operation
  protected isWriteOperation(type: string): boolean {
    const writeOperations = [
      "createCharacter",
      "healCharacter",
      "resurrectCharacter",
      "fightEnemy",
      "continueFight",
      "fleeRound",
      "claimPrize",
    ];
    return writeOperations.includes(type);
  }

  // Update operation status
  protected updateOperationStatus(
    status: "pending" | "processing" | "completed" | "error",
    data?: any
  ): void {
    const currentOperation = this.store.getOperation();
    if (currentOperation) {
      this.store.updateOperation({
        ...currentOperation,
        status,
        ...data,
      });
    }
  }

  // Complete operation
  protected completeOperation(result?: any): void {
    this.store.updateOperation({
      isActive: false,
      operationType: "",
      status: "completed",
      progress: "Operation completed",
      ...result,
    });
  }

  // Fail operation
  protected failOperation(error: string): void {
    this.store.updateOperation({
      isActive: false,
      operationType: "",
      status: "error",
      error,
      progress: "Operation failed",
    });
  }

  // Clear operation
  protected clearOperation(): void {
    this.store.updateOperation(null);
  }

  // Validate operation can start
  protected canStartOperation(type: string): boolean {
    const currentOperation = this.store.getOperation();
    const isLoading = this.store.isLoading();
    const error = this.store.getError();

    if (currentOperation?.isActive) {
      return false;
    }

    if (isLoading) {
      return false;
    }

    if (error) {
      return false;
    }

    return true;
  }

  // Get operation progress
  protected getOperationProgress(): string {
    const operation = this.store.getOperation();
    return operation?.progress || "";
  }
}
