import type { CharacterData, OperationState, UXState } from "../types";
import { type ValidationResult, ValidationRules } from "./ValidationRules";

export class ValidationManager {
  constructor(private store: any) {}

  // Validate before starting an operation
  validateOperation(type: string, data?: any): ValidationResult {
    const state = this.store.getState();

    // First check if we can start any operation
    const canStart = ValidationRules.canStartOperation(type, state);
    if (!canStart.valid) {
      return canStart;
    }

    // Then validate specific input data
    switch (type) {
      case "createCharacter":
        if (data?.classId !== undefined) {
          return ValidationRules.validateCharacterClass(data.classId);
        }
        break;
      case "fightEnemy":
        if (data?.enemyId !== undefined) {
          const enemyIdValidation = ValidationRules.validateEnemyId(data.enemyId);
          if (!enemyIdValidation.valid) return enemyIdValidation;
        }
        if (data?.enemyLevel !== undefined) {
          const enemyLevelValidation = ValidationRules.validateEnemyLevel(data.enemyLevel);
          if (!enemyLevelValidation.valid) return enemyLevelValidation;
        }
        break;
      case "getCharacter":
        if (data?.playerAddress) {
          return ValidationRules.validatePlayerAddress(data.playerAddress);
        }
        break;
    }

    return { valid: true };
  }

  // Validate character state
  validateCharacterState(character: CharacterData | null): ValidationResult {
    return ValidationRules.validateCharacterState(character);
  }

  // Validate operation state
  validateOperationState(operation: OperationState | null): ValidationResult {
    return ValidationRules.validateOperationState(operation);
  }

  // Validate entire UX state
  validateUXState(state: UXState): ValidationResult {
    // Validate character state
    const characterValidation = this.validateCharacterState(state.character);
    if (!characterValidation.valid) {
      return characterValidation;
    }

    // Validate operation state
    const operationValidation = this.validateOperationState(state.operation);
    if (!operationValidation.valid) {
      return operationValidation;
    }

    // Validate menu state consistency
    if (state.menu) {
      const menuValidation = this.validateMenuState(state.menu, state.character);
      if (!menuValidation.valid) {
        return menuValidation;
      }
    }

    return { valid: true };
  }

  // Validate menu state consistency
  private validateMenuState(menu: any, character: CharacterData | null): ValidationResult {
    // Check if menu state is consistent with character state
    if (character?.exists && menu.canCreateCharacter) {
      return { valid: false, reason: "Menu allows character creation when character exists" };
    }

    if (!character?.exists && (menu.canFight || menu.canHeal || menu.canResurrect)) {
      return { valid: false, reason: "Menu allows character actions when no character exists" };
    }

    if (character?.isAlive && menu.canResurrect) {
      return { valid: false, reason: "Menu allows resurrection when character is alive" };
    }

    if (!character?.isAlive && (menu.canFight || menu.canHeal)) {
      return { valid: false, reason: "Menu allows actions when character is dead" };
    }

    if (character?.inCombat && (menu.canFight || menu.canHeal || menu.canResurrect)) {
      return { valid: false, reason: "Menu allows actions when character is in combat" };
    }

    if (!character?.inCombat && (menu.canContinueFight || menu.canFlee)) {
      return { valid: false, reason: "Menu allows combat actions when character is not in combat" };
    }

    return { valid: true };
  }

  // Get validation errors for display
  getValidationErrors(state: UXState): string[] {
    const errors: string[] = [];

    const characterValidation = this.validateCharacterState(state.character);
    if (!characterValidation.valid && characterValidation.reason) {
      errors.push(`Character: ${characterValidation.reason}`);
    }

    const operationValidation = this.validateOperationState(state.operation);
    if (!operationValidation.valid && operationValidation.reason) {
      errors.push(`Operation: ${operationValidation.reason}`);
    }

    if (state.menu) {
      const menuValidation = this.validateMenuState(state.menu, state.character);
      if (!menuValidation.valid && menuValidation.reason) {
        errors.push(`Menu: ${menuValidation.reason}`);
      }
    }

    return errors;
  }

  // Check if state is in a valid state for user interaction
  isStateValidForInteraction(state: UXState): boolean {
    const validation = this.validateUXState(state);
    return validation.valid;
  }

  // Get user-friendly validation message
  getValidationMessage(state: UXState): string {
    const errors = this.getValidationErrors(state);
    if (errors.length === 0) {
      return "System is ready";
    }

    return `Validation errors: ${errors.join(", ")}`;
  }
}
