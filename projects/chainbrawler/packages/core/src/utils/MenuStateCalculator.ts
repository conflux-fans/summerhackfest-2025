/**
 * Centralized menu state calculation utility
 * Single source of truth for all menu state logic
 */

import type { CharacterData, MenuState } from "../types";

// Union type to handle both CharacterData and CharacterUXData
type CharacterLike =
  | CharacterData
  | {
      exists: boolean;
      isAlive: boolean;
      inCombat: boolean;
      healingCooldownRemaining?: number;
    }
  | null;

export interface MenuStateCalculatorOptions {
  operation?: {
    isActive: boolean;
    operationType: string;
  } | null;
  healingCooldownRemaining?: number;
}

export class MenuStateCalculator {
  /**
   * Calculate menu state based on character data
   * This is the single source of truth for menu state logic
   */
  static calculateMenuState(
    character: CharacterLike,
    options: MenuStateCalculatorOptions = {}
  ): MenuState {
    const { operation, healingCooldownRemaining = 0 } = options;

    if (!character || !character.exists) {
      return {
        canCreateCharacter: true,
        canAct: false,
        canFight: false,
        canHeal: false,
        canResurrect: false,
        canContinueFight: false,
        canFlee: false,
        canViewPools: true,
        canViewLeaderboard: true,
        canViewClaims: false,
        canClaimPrize: false,
        availableActions: ["createCharacter"],
        disabledActions: [],
        disabledReasons: {},
        healingCooldownRemaining: 0,
      };
    }

    // Calculate healing availability based on cooldown
    const canHeal = character.isAlive && !character.inCombat && healingCooldownRemaining === 0;

    return {
      canCreateCharacter: false,
      canAct: character.isAlive && !character.inCombat,
      canFight: character.isAlive && !character.inCombat,
      canHeal,
      canResurrect: !character.isAlive,
      canContinueFight: character.inCombat,
      canFlee: character.inCombat,
      canViewPools: true,
      canViewLeaderboard: true,
      canViewClaims: true,
      canClaimPrize: true,
      availableActions: MenuStateCalculator.getAvailableActions(character),
      disabledActions: MenuStateCalculator.getDisabledActions(character, healingCooldownRemaining),
      disabledReasons: MenuStateCalculator.getDisabledReasons(character, healingCooldownRemaining),
      healingCooldownRemaining,
    };
  }

  /**
   * Get available actions for a character
   */
  private static getAvailableActions(character: CharacterLike): string[] {
    const actions = ["viewPools", "viewLeaderboard", "viewClaims"];

    if (!character) return actions;

    if (character.isAlive && !character.inCombat) {
      actions.push("fight", "heal");
    }

    if (character.inCombat) {
      actions.push("continueFight", "flee");
    }

    if (!character.isAlive) {
      actions.push("resurrect");
    }

    return actions;
  }

  /**
   * Get disabled actions for a character
   */
  private static getDisabledActions(
    character: CharacterLike,
    healingCooldownRemaining: number
  ): string[] {
    const disabled: string[] = [];

    if (!character) return disabled;

    if (character.isAlive && !character.inCombat && healingCooldownRemaining > 0) {
      disabled.push("heal");
    }

    return disabled;
  }

  /**
   * Get disabled reasons for a character
   */
  private static getDisabledReasons(
    character: CharacterLike,
    healingCooldownRemaining: number
  ): Record<string, string> {
    const reasons: Record<string, string> = {};

    if (!character) return reasons;

    if (character.isAlive && !character.inCombat && healingCooldownRemaining > 0) {
      reasons.heal = `Healing cooldown: ${healingCooldownRemaining}s remaining`;
    }

    return reasons;
  }
}
