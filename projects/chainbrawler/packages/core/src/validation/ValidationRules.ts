import type { CharacterData, OperationState, UXState } from "../types";

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export class ValidationRules {
  // Character validation rules
  static canCreateCharacter(state: UXState): ValidationResult {
    if (state.character?.exists) {
      return { valid: false, reason: "Character already exists" };
    }

    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    if (state.isLoading) {
      return { valid: false, reason: "System is initializing" };
    }

    if (state.error) {
      return { valid: false, reason: "System error occurred" };
    }

    return { valid: true };
  }

  static canFight(state: UXState): ValidationResult {
    if (!state.character?.exists) {
      return { valid: false, reason: "Character does not exist" };
    }

    if (!state.character.isAlive) {
      return { valid: false, reason: "Character is dead" };
    }

    if (state.character.inCombat) {
      return { valid: false, reason: "Character is already in combat" };
    }

    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    if (state.isLoading) {
      return { valid: false, reason: "System is initializing" };
    }

    if (state.error) {
      return { valid: false, reason: "System error occurred" };
    }

    return { valid: true };
  }

  static canHeal(state: UXState): ValidationResult {
    if (!state.character?.exists) {
      return { valid: false, reason: "Character does not exist" };
    }

    if (!state.character.isAlive) {
      return { valid: false, reason: "Character is dead" };
    }

    if (state.character.inCombat) {
      return { valid: false, reason: "Character is in combat" };
    }

    if (state.character.endurance.percentage >= 100) {
      return { valid: false, reason: "Character is already at full health" };
    }

    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    if (state.isLoading) {
      return { valid: false, reason: "System is initializing" };
    }

    if (state.error) {
      return { valid: false, reason: "System error occurred" };
    }

    return { valid: true };
  }

  static canResurrect(state: UXState): ValidationResult {
    if (!state.character?.exists) {
      return { valid: false, reason: "Character does not exist" };
    }

    if (state.character.isAlive) {
      return { valid: false, reason: "Character is already alive" };
    }

    if (state.character.inCombat) {
      return { valid: false, reason: "Character is in combat" };
    }

    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    if (state.isLoading) {
      return { valid: false, reason: "System is initializing" };
    }

    if (state.error) {
      return { valid: false, reason: "System error occurred" };
    }

    return { valid: true };
  }

  static canContinueFight(state: UXState): ValidationResult {
    if (!state.character?.exists) {
      return { valid: false, reason: "Character does not exist" };
    }

    if (!state.character.inCombat) {
      return { valid: false, reason: "Character is not in combat" };
    }

    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    if (state.isLoading) {
      return { valid: false, reason: "System is initializing" };
    }

    if (state.error) {
      return { valid: false, reason: "System error occurred" };
    }

    return { valid: true };
  }

  static canFlee(state: UXState): ValidationResult {
    if (!state.character?.exists) {
      return { valid: false, reason: "Character does not exist" };
    }

    if (!state.character.inCombat) {
      return { valid: false, reason: "Character is not in combat" };
    }

    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    if (state.isLoading) {
      return { valid: false, reason: "System is initializing" };
    }

    if (state.error) {
      return { valid: false, reason: "System error occurred" };
    }

    return { valid: true };
  }

  static canViewPools(state: UXState): ValidationResult {
    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    if (state.isLoading) {
      return { valid: false, reason: "System is initializing" };
    }

    return { valid: true };
  }

  static canViewLeaderboard(state: UXState): ValidationResult {
    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    if (state.isLoading) {
      return { valid: false, reason: "System is initializing" };
    }

    return { valid: true };
  }

  static canViewClaims(state: UXState): ValidationResult {
    if (!state.character?.exists) {
      return { valid: false, reason: "Character does not exist" };
    }

    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    if (state.isLoading) {
      return { valid: false, reason: "System is initializing" };
    }

    return { valid: true };
  }

  static canClaimPrize(state: UXState, reward: any): ValidationResult {
    if (!state.character?.exists) {
      return { valid: false, reason: "Character does not exist" };
    }

    if (!reward?.canClaim) {
      return { valid: false, reason: "Reward is not claimable" };
    }

    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    if (state.isLoading) {
      return { valid: false, reason: "System is initializing" };
    }

    if (state.error) {
      return { valid: false, reason: "System error occurred" };
    }

    return { valid: true };
  }

  // Operation validation rules
  static canStartOperation(type: string, state: UXState): ValidationResult {
    if (state.operation?.isActive) {
      return { valid: false, reason: "Another operation is in progress" };
    }

    if (state.isLoading) {
      return { valid: false, reason: "System is initializing" };
    }

    if (state.error) {
      return { valid: false, reason: "System error occurred" };
    }

    // Validate specific operation types
    switch (type) {
      case "createCharacter":
        return ValidationRules.canCreateCharacter(state);
      case "fightEnemy":
        return ValidationRules.canFight(state);
      case "healCharacter":
        return ValidationRules.canHeal(state);
      case "resurrectCharacter":
        return ValidationRules.canResurrect(state);
      case "continueFight":
        return ValidationRules.canContinueFight(state);
      case "fleeRound":
        return ValidationRules.canFlee(state);
      default:
        return { valid: true };
    }
  }

  // Character state validation
  static validateCharacterState(character: CharacterData | null): ValidationResult {
    if (!character) {
      return { valid: true }; // No character is valid
    }

    if (character.exists && character.class < 0) {
      return { valid: false, reason: "Invalid character class" };
    }

    if (character.exists && character.level < 1) {
      return { valid: false, reason: "Invalid character level" };
    }

    if (
      (character.exists && character.endurance.percentage < 0) ||
      character.endurance.percentage > 100
    ) {
      return { valid: false, reason: "Invalid endurance percentage" };
    }

    if (character.exists && character.stats.combat < 0) {
      return { valid: false, reason: "Invalid combat stat" };
    }

    if (character.exists && character.stats.defense < 0) {
      return { valid: false, reason: "Invalid defense stat" };
    }

    if (character.exists && character.stats.luck < 0) {
      return { valid: false, reason: "Invalid luck stat" };
    }

    return { valid: true };
  }

  // Operation state validation
  static validateOperationState(operation: OperationState | null): ValidationResult {
    if (!operation) {
      return { valid: true }; // No operation is valid
    }

    if (operation.isActive && !operation.operationType) {
      return { valid: false, reason: "Active operation missing type" };
    }

    if (operation.isActive && !operation.startTime) {
      return { valid: false, reason: "Active operation missing start time" };
    }

    if (operation.status === "error" && !operation.error) {
      return { valid: false, reason: "Error operation missing error message" };
    }

    return { valid: true };
  }

  // Input validation
  static validateCharacterClass(classId: number): ValidationResult {
    if (!Number.isInteger(classId)) {
      return { valid: false, reason: "Character class must be an integer" };
    }

    if (classId < 0 || classId > 3) {
      return { valid: false, reason: "Character class must be between 0 and 3" };
    }

    return { valid: true };
  }

  static validateEnemyId(enemyId: number): ValidationResult {
    if (!Number.isInteger(enemyId)) {
      return { valid: false, reason: "Enemy ID must be an integer" };
    }

    if (enemyId < 1 || enemyId > 6) {
      return { valid: false, reason: "Enemy ID must be between 1 and 6" };
    }

    return { valid: true };
  }

  static validateEnemyLevel(level: number): ValidationResult {
    if (!Number.isInteger(level)) {
      return { valid: false, reason: "Enemy level must be an integer" };
    }

    if (level < 1 || level > 100) {
      return { valid: false, reason: "Enemy level must be between 1 and 100" };
    }

    return { valid: true };
  }

  static validatePlayerAddress(address: string): ValidationResult {
    if (!address) {
      return { valid: false, reason: "Player address is required" };
    }

    if (!address.startsWith("0x")) {
      return { valid: false, reason: "Player address must start with 0x" };
    }

    if (address.length !== 42) {
      return { valid: false, reason: "Player address must be 42 characters long" };
    }

    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return { valid: false, reason: "Player address must be a valid hexadecimal string" };
    }

    return { valid: true };
  }
}
