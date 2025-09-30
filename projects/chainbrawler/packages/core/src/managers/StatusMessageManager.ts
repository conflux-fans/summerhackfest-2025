import { type CharacterData, type OperationState, UXState } from "../types";
import { StatusMessageType } from "../types/StatusMessageType";

export class StatusMessageManager {
  constructor(private store: any) {}

  getStatusMessage(): string {
    const state = this.store.getState();

    if (state.isLoading) {
      return StatusMessageType.INITIALIZING;
    }

    if (state.error) {
      return `${StatusMessageType.ERROR}: ${state.error}`;
    }

    if (state.operation?.isActive) {
      return this.getOperationStatusMessage(state.operation);
    }

    if (state.character?.exists) {
      return this.getCharacterStatusMessage(state.character);
    }

    return StatusMessageType.READY;
  }

  private getOperationStatusMessage(operation: OperationState): string {
    switch (operation.status) {
      case "pending":
        return StatusMessageType.OPERATION_PENDING;
      case "processing":
        return StatusMessageType.OPERATION_PROCESSING;
      case "completed":
        return StatusMessageType.OPERATION_COMPLETED;
      case "error":
        return `${StatusMessageType.OPERATION_ERROR}: ${operation.error}`;
      default:
        return StatusMessageType.READY;
    }
  }

  private getCharacterStatusMessage(character: CharacterData): string {
    if (character.inCombat) {
      return "Character in combat";
    }

    if (!character.isAlive) {
      return "Character is dead - resurrection required";
    }

    if (character.endurance.percentage < 50) {
      return "Character needs healing";
    }

    return StatusMessageType.CHARACTER_EXISTS;
  }

  setStatusMessage(message: string): void {
    this.store.setStatusMessage(message);
  }

  setOperationStatus(
    operationType: string,
    status: "pending" | "processing" | "completed" | "error",
    error?: string
  ): void {
    this.store.setOperation({
      isActive: status !== "completed" && status !== "error",
      operationType,
      status,
      startTime: Date.now(),
      error,
    });
  }

  clearOperation(): void {
    this.store.setOperation(null);
  }
}
