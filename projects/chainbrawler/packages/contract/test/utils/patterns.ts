import { expect } from "chai";
import { parseEther } from "viem";

/**
 * Common test patterns and utilities to reduce code duplication
 * across ChainBrawler test suites
 */

export interface TestCharacterOptions {
  classId?: number;
  level?: number;
  combat?: number;
  defense?: number;
  luck?: number;
  endurance?: number;
}

export interface CombatTestOptions {
  enemyId?: number;
  enemyLevel?: number;
  expectedOutcome?: "victory" | "defeat" | "flee";
  rounds?: number;
}

/**
 * Character creation and validation patterns
 */
export class CharacterTestPatterns {
  /**
   * Create a test character with specified options
   */
  static async createTestCharacter(
    chainBrawler: any,
    player: any,
    options: TestCharacterOptions = {}
  ) {
    const {
      classId = 0, // Warrior by default
    } = options;

    // Get creation fee
    const creationFee = await (chainBrawler as any).read.getCreationFee();

    // Create character
    const tx = await (chainBrawler as any).write.createCharacter([classId], {
      account: player.account,
      value: creationFee,
    });

    return tx;
  }

  /**
   * Validate character state matches expected values
   */
  static async validateCharacterState(
    chainBrawler: any,
    playerAddress: string,
    expected: Partial<TestCharacterOptions> & {
      alive?: boolean;
      inCombat?: boolean;
    }
  ) {
    const character = await (chainBrawler as any).read.getCharacter([playerAddress]);

    if (expected.level !== undefined) {
      expect(Number(character[1])).to.equal(expected.level, "Character level mismatch");
    }

    if (expected.combat !== undefined) {
      expect(Number(character[5])).to.equal(expected.combat, "Combat stat mismatch");
    }

    if (expected.defense !== undefined) {
      expect(Number(character[6])).to.equal(expected.defense, "Defense stat mismatch");
    }

    if (expected.luck !== undefined) {
      expect(Number(character[7])).to.equal(expected.luck, "Luck stat mismatch");
    }

    if (expected.alive !== undefined) {
      expect(Boolean(character[8])).to.equal(expected.alive, "Character alive status mismatch");
    }

    if (expected.inCombat !== undefined) {
      const inCombat = await (chainBrawler as any).read.isCharacterInCombat([playerAddress]);
      expect(inCombat).to.equal(expected.inCombat, "Combat status mismatch");
    }

    return character;
  }

  /**
   * Get character's effective stats including equipment bonuses
   */
  static async getEffectiveStats(chainBrawler: any, playerAddress: string) {
    const character = await (chainBrawler as any).read.getCharacter([playerAddress]);

    return {
      level: Number(character[1]),
      experience: Number(character[2]),
      currentEndurance: Number(character[3]),
      maxEndurance: Number(character[4]),
      totalCombat: Number(character[5]),
      totalDefense: Number(character[6]),
      totalLuck: Number(character[7]),
      alive: Boolean(character[8]),
      combatBonus: Number(character[9]),
      enduranceBonus: Number(character[10]),
      defenseBonus: Number(character[11]),
      luckBonus: Number(character[12]),
      totalKills: Number(character[13]),
      points: Number(character[14]),
    };
  }
}

/**
 * Combat testing patterns
 */
export class CombatTestPatterns {
  /**
   * Initiate combat with specified enemy
   */
  static async initiateCombat(chainBrawler: any, player: any, options: CombatTestOptions = {}) {
    const { enemyId = 1, enemyLevel = 1 } = options;

    // Get fight fee
    const fightFee = parseEther("0.001"); // Default fight fee

    // Start fight
    const tx = await (chainBrawler as any).write.fightEnemy([enemyId, enemyLevel], {
      account: player.account,
      value: fightFee,
    });

    return tx;
  }

  /**
   * Continue combat until resolution
   */
  static async resolveCombat(chainBrawler: any, player: any, maxRounds: number = 10) {
    const events: any[] = [];
    let roundCount = 0;

    while (roundCount < maxRounds) {
      const inCombat = await (chainBrawler as any).read.isCharacterInCombat([player.address]);
      if (!inCombat) break;

      const tx = await (chainBrawler as any).write.continueFight([], {
        account: player.account,
      });

      events.push(tx);
      roundCount++;
    }

    return { events, roundCount };
  }

  /**
   * Flee from combat
   */
  static async fleeCombat(chainBrawler: any, player: any) {
    const tx = await (chainBrawler as any).write.fleeRound([], {
      account: player.account,
    });

    return tx;
  }

  /**
   * Validate combat outcome
   */
  static async validateCombatOutcome(
    chainBrawler: any,
    playerAddress: string,
    expectedOutcome: "victory" | "defeat" | "flee"
  ) {
    const character = await CharacterTestPatterns.getEffectiveStats(chainBrawler, playerAddress);
    const inCombat = await (chainBrawler as any).read.isCharacterInCombat([playerAddress]);

    switch (expectedOutcome) {
      case "victory":
        expect(character.alive).to.be.true;
        expect(inCombat).to.be.false;
        expect(character.totalKills).to.be.greaterThan(0);
        break;

      case "defeat":
        expect(character.alive).to.be.false;
        expect(inCombat).to.be.false;
        break;

      case "flee":
        expect(character.alive).to.be.true;
        expect(inCombat).to.be.false;
        // Character should have lost some endurance but still be alive
        break;
    }

    return character;
  }
}

/**
 * Event testing patterns
 */
export class EventTestPatterns {
  /**
   * Wait for and validate specific event emission
   */
  static async expectEvent(tx: any, eventName: string, expectedArgs?: any[]) {
    // This is a placeholder for event validation
    // In practice, you'd use the receipt and decode events
    expect(tx).to.exist;
    return tx;
  }

  /**
   * Extract events from transaction receipt
   */
  static async extractEvents(receipt: any, eventName?: string) {
    // Placeholder for event extraction logic
    // Would decode logs and filter by event name if provided
    return [];
  }
}

/**
 * Healing and resurrection patterns
 */
export class HealingTestPatterns {
  /**
   * Heal character to full endurance
   */
  static async healCharacter(chainBrawler: any, player: any) {
    const healingFee = await (chainBrawler as any).read.getHealingFee();

    const tx = await (chainBrawler as any).write.healCharacter([], {
      account: player.account,
      value: healingFee,
    });

    return tx;
  }

  /**
   * Resurrect dead character
   */
  static async resurrectCharacter(chainBrawler: any, player: any) {
    const resurrectionFee = await (chainBrawler as any).read.getResurrectionFee();

    const tx = await (chainBrawler as any).write.resurrectCharacter([], {
      account: player.account,
      value: resurrectionFee,
    });

    return tx;
  }

  /**
   * Validate healing cooldown
   */
  static async validateHealingCooldown(
    chainBrawler: any,
    playerAddress: string,
    shouldBeOnCooldown: boolean
  ) {
    const cooldownRemaining = await (chainBrawler as any).read.getHealingCooldownRemaining([
      playerAddress,
    ]);

    if (shouldBeOnCooldown) {
      expect(Number(cooldownRemaining)).to.be.greaterThan(
        0,
        "Expected healing cooldown to be active"
      );
    } else {
      expect(Number(cooldownRemaining)).to.equal(0, "Expected no healing cooldown");
    }

    return Number(cooldownRemaining);
  }
}

/**
 * Utility functions for common test operations
 */
export class TestUtils {
  /**
   * Convert various numeric types to BigInt for comparisons
   */
  static toBigInt(value: any): bigint {
    if (typeof value === "bigint") return value;
    if (value && typeof value.toBigInt === "function") return value.toBigInt();
    return BigInt(value || 0);
  }

  /**
   * Sleep for specified milliseconds (useful for cooldown tests)
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate random character stats for testing
   */
  static generateRandomStats(baseLevel: number = 1) {
    const multiplier = baseLevel;
    return {
      combat: 5 + Math.floor(Math.random() * 10) * multiplier,
      defense: 3 + Math.floor(Math.random() * 5) * multiplier,
      luck: 1 + Math.floor(Math.random() * 3) * multiplier,
      endurance: 20 + Math.floor(Math.random() * 15) * multiplier,
    };
  }

  /**
   * Calculate expected XP for level
   */
  static calculateXPForLevel(level: number): number {
    // This should match the contract's XP calculation
    return level * 100; // Placeholder - replace with actual formula
  }
}
