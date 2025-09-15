/**
 * Enhanced Operation Tracker for ChainBrawler
 * Tracks the current operation state for UX purposes
 * Provides a way to prevent parallel operations and show loading states
 *
 * Ported from packages/sdk/src/modules/OperationTracker.ts
 */

export interface OperationStatus {
  operationId: string;
  operationType: string;
  status: "start" | "hash" | "receipt" | "completed" | "error";
  startTime: number;
  hash?: string;
  receipt?: any;
  error?: string;
  data?: any;
}

export interface CurrentOperation {
  operationId: string;
  operationType: string;
  status: "start" | "hash" | "receipt" | "completed" | "error";
  startTime: number;
  hash?: string;
  receipt?: any;
  isActive: boolean;
  isCompleted: boolean;
  requiresRefresh: boolean; // Track if operation needs post-tx refresh
  data?: any;
}

export class OperationTracker {
  private currentOperation: CurrentOperation | null = null;
  private operationHistory: OperationStatus[] = [];
  private maxHistorySize = 50;
  private listeners: ((operation: CurrentOperation | null) => void)[] = [];
  private refreshCallback?: (operationId: string, operationType: string) => Promise<void>;

  constructor(private emit: (event: string, ...args: any[]) => void) {}

  /**
   * Set refresh callback for post-transaction state updates
   */
  setRefreshCallback(callback: (operationId: string, operationType: string) => Promise<void>) {
    this.refreshCallback = callback;
  }

  /**
   * Start tracking a new operation
   */
  startOperation(operationType: string, data?: any): string {
    const operationId = `${operationType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    // End any existing operation with error if it's still active
    if (this.currentOperation?.isActive) {
      console.warn("Starting new operation while another is active", {
        current: this.currentOperation.operationType,
        new: operationType,
      });
      this.endOperation("error", "Interrupted by new operation");
    }

    // Determine if operation requires post-transaction refresh
    const writeOperations = [
      "createCharacter",
      "fightEnemy",
      "continueFight",
      "fleeRound",
      "healCharacter",
      "resurrectCharacter",
      "claimPrize",
    ];
    const requiresRefresh = writeOperations.some((op) => operationType.includes(op));

    this.currentOperation = {
      operationId,
      operationType,
      status: "start",
      startTime,
      isActive: true,
      isCompleted: false,
      requiresRefresh,
      data,
    };

    const operationStatus: OperationStatus = {
      operationId,
      operationType,
      status: "start",
      startTime,
      data,
    };

    this.addToHistory(operationStatus);
    this.notifyListeners();

    // Emit the start event with proper logging
    this.emit(`${operationType}:start`, {
      name: operationType,
      operationId,
      data,
    });

    console.log(`Operation started: ${operationType}`, { operationId, data });
    return operationId;
  }

  /**
   * Update operation with transaction hash
   */
  updateOperationHash(hash: string) {
    if (!this.currentOperation?.isActive) {
      console.warn("Trying to update hash for inactive operation");
      return;
    }

    this.currentOperation.status = "hash";
    this.currentOperation.hash = hash;

    const operationStatus: OperationStatus = {
      operationId: this.currentOperation.operationId,
      operationType: this.currentOperation.operationType,
      status: "hash",
      startTime: this.currentOperation.startTime,
      hash,
      data: this.currentOperation.data,
    };

    this.addToHistory(operationStatus);
    this.notifyListeners();

    this.emit(`${this.currentOperation.operationType}:hash`, {
      name: this.currentOperation.operationType,
      operationId: this.currentOperation.operationId,
      hash,
    });

    console.log(`Operation hash received: ${this.currentOperation.operationType}`, {
      operationId: this.currentOperation.operationId,
      hash,
    });
  }

  /**
   * Update operation with transaction receipt
   */
  updateOperationReceipt(receipt: any) {
    if (!this.currentOperation?.isActive) {
      console.warn("Trying to update receipt for inactive operation");
      return;
    }

    this.currentOperation.status = "receipt";
    this.currentOperation.receipt = receipt;

    const operationStatus: OperationStatus = {
      operationId: this.currentOperation.operationId,
      operationType: this.currentOperation.operationType,
      status: "receipt",
      startTime: this.currentOperation.startTime,
      hash: this.currentOperation.hash,
      receipt,
      data: this.currentOperation.data,
    };

    this.addToHistory(operationStatus);
    this.notifyListeners();

    this.emit(`${this.currentOperation.operationType}:receipt`, {
      name: this.currentOperation.operationType,
      operationId: this.currentOperation.operationId,
      hash: this.currentOperation.hash,
      receipt,
    });

    console.log(`Operation receipt received: ${this.currentOperation.operationType}`, {
      operationId: this.currentOperation.operationId,
      hash: this.currentOperation.hash,
    });
  }

  /**
   * Complete the current operation
   */
  completeOperation(data?: any) {
    if (!this.currentOperation?.isActive) {
      console.warn("Trying to complete inactive operation");
      return;
    }

    this.currentOperation.status = "completed";
    this.currentOperation.isActive = false;
    this.currentOperation.isCompleted = true;
    if (data) {
      this.currentOperation.data = data;
    }

    const operationStatus: OperationStatus = {
      operationId: this.currentOperation.operationId,
      operationType: this.currentOperation.operationType,
      status: "completed",
      startTime: this.currentOperation.startTime,
      hash: this.currentOperation.hash,
      receipt: this.currentOperation.receipt,
      data: this.currentOperation.data,
    };

    this.addToHistory(operationStatus);
    this.notifyListeners();

    this.emit(`${this.currentOperation.operationType}:completed`, {
      name: this.currentOperation.operationType,
      operationId: this.currentOperation.operationId,
      hash: this.currentOperation.hash,
      data: this.currentOperation.data,
    });

    console.log(`Operation completed: ${this.currentOperation.operationType}`, {
      operationId: this.currentOperation.operationId,
      hash: this.currentOperation.hash,
    });

    // Trigger refresh if needed
    if (this.currentOperation.requiresRefresh && this.refreshCallback) {
      this.refreshCallback(
        this.currentOperation.operationId,
        this.currentOperation.operationType
      ).catch((error) => console.error("Failed to refresh after operation", error));
    }

    // Clear current operation after a short delay
    setTimeout(() => {
      this.currentOperation = null;
      this.notifyListeners();
    }, 1000);
  }

  /**
   * End the current operation with error
   */
  endOperation(status: "error" | "completed", reason?: string, data?: any) {
    if (!this.currentOperation?.isActive) {
      console.warn("Trying to end inactive operation");
      return;
    }

    this.currentOperation.status = status;
    this.currentOperation.isActive = false;
    this.currentOperation.isCompleted = status === "completed";
    if (data) {
      this.currentOperation.data = data;
    }

    const operationStatus: OperationStatus = {
      operationId: this.currentOperation.operationId,
      operationType: this.currentOperation.operationType,
      status,
      startTime: this.currentOperation.startTime,
      hash: this.currentOperation.hash,
      receipt: this.currentOperation.receipt,
      error: reason,
      data: this.currentOperation.data,
    };

    this.addToHistory(operationStatus);
    this.notifyListeners();

    if (status === "error") {
      this.emit(`${this.currentOperation.operationType}:error`, {
        name: this.currentOperation.operationType,
        operationId: this.currentOperation.operationId,
        hash: this.currentOperation.hash,
        error: reason,
        data: this.currentOperation.data,
      });

      console.error(`Operation failed: ${this.currentOperation.operationType}`, {
        operationId: this.currentOperation.operationId,
        error: reason,
      });
    }

    // Clear current operation
    this.currentOperation = null;
    this.notifyListeners();
  }

  /**
   * Get current operation
   */
  getCurrentOperation(): CurrentOperation | null {
    return this.currentOperation ? { ...this.currentOperation } : null;
  }

  /**
   * Check if an operation is active
   */
  isOperationActive(): boolean {
    return this.currentOperation?.isActive || false;
  }

  /**
   * Check if a specific operation type is active
   */
  isOperationTypeActive(operationType: string): boolean {
    return Boolean(
      this.currentOperation?.isActive && this.currentOperation.operationType === operationType
    );
  }

  /**
   * Get operation history
   */
  getOperationHistory(): OperationStatus[] {
    return [...this.operationHistory];
  }

  /**
   * Clear completed operation (for dismissing fight summaries)
   */
  clearCompletedOperation() {
    if (this.currentOperation?.isCompleted) {
      this.currentOperation = null;
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to operation changes
   */
  onOperationChange(callback: (operation: CurrentOperation | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Add operation to history
   */
  private addToHistory(operation: OperationStatus) {
    this.operationHistory.push(operation);

    // Keep only the last maxHistorySize operations
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory = this.operationHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Notify listeners
   */
  private notifyListeners() {
    this.listeners.forEach((callback) => callback(this.currentOperation));
  }
}
