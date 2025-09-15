// Simplified tests for CharacterOperations
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CharacterOperations } from "../operations/CharacterOperations";

describe("CharacterOperations - Simplified", () => {
  let mockStore: any;
  let mockContractClient: any;
  let mockEventEmitter: any;
  let mockSDK: any;
  let characterOps: CharacterOperations;

  beforeEach(() => {
    mockStore = {
      getOperation: vi.fn().mockReturnValue(null),
      isLoading: vi.fn().mockReturnValue(false),
      getError: vi.fn().mockReturnValue(null),
      updateOperation: vi.fn(),
      setStatusMessage: vi.fn(),
      updateCharacter: vi.fn(),
      updateMenu: vi.fn(),
      getCharacter: vi.fn().mockReturnValue(null),
    };

    mockContractClient = {
      createCharacter: vi.fn(),
      getCharacter: vi.fn(),
      healCharacter: vi.fn(),
      resurrectCharacter: vi.fn(),
      canHeal: vi.fn(),
      canResurrect: vi.fn(),
    };

    mockEventEmitter = {
      emit: vi.fn(),
    };

    mockSDK = {
      getPlayerAddress: vi.fn().mockReturnValue("0x1234567890123456789012345678901234567890"),
    };

    characterOps = new CharacterOperations(
      mockStore,
      mockContractClient,
      mockEventEmitter,
      mockSDK
    );
  });

  describe("Operation Validation", () => {
    it("should prevent operations when another is active", async () => {
      mockStore.getOperation.mockReturnValue({ isActive: true });

      const result = await characterOps.createCharacter(0);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot start operation");
      expect(mockContractClient.createCharacter).not.toHaveBeenCalled();
    });

    it("should prevent operations when loading", async () => {
      mockStore.isLoading.mockReturnValue(true);

      const result = await characterOps.createCharacter(0);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot start operation");
    });

    it("should prevent operations when there is an error", async () => {
      mockStore.getError.mockReturnValue("Previous error");

      const result = await characterOps.createCharacter(0);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot start operation");
    });
  });

  describe("Contract Error Handling", () => {
    it("should handle contract errors gracefully", async () => {
      mockContractClient.createCharacter.mockRejectedValue(new Error("Contract error"));

      const result = await characterOps.createCharacter(0);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Character creation failed");
    });
  });

  describe("Data Parsing", () => {
    it("should parse character data correctly", () => {
      const contractData = {
        characterClass: 1,
        level: 5,
        experience: 100,
        currentEndurance: 80,
        maxEndurance: 100,
        totalCombat: 15,
        totalDefense: 12,
        totalLuck: 8,
        aliveFlag: true,
        equippedCombatBonus: 2,
        equippedEnduranceBonus: 1,
        equippedDefenseBonus: 1,
        equippedLuckBonus: 0,
        totalKills: 3,
      };

      const result = (characterOps as any).parseCharacterData(contractData);

      expect(result).toEqual({
        exists: true,
        isAlive: true,
        class: 1,
        className: "Guardian",
        level: 5,
        experience: 100,
        endurance: { current: 80, max: 100, percentage: 80 },
        stats: { combat: 15, defense: 12, luck: 8 },
        equipment: [
          {
            combat: 2,
            endurance: 1,
            defense: 1,
            luck: 0,
          },
        ],
        inCombat: false,
        totalKills: 3,
      });
    });

    it("should handle non-existent character", () => {
      const contractData = {
        characterClass: 0,
        level: 0,
        experience: 0,
        currentEndurance: 0,
        maxEndurance: 0,
        totalCombat: 0,
        totalDefense: 0,
        totalLuck: 0,
        aliveFlag: false,
        equippedCombatBonus: 0,
        equippedEnduranceBonus: 0,
        equippedDefenseBonus: 0,
        equippedLuckBonus: 0,
        totalKills: 0,
      };

      const result = (characterOps as any).parseCharacterData(contractData);

      expect(result.exists).toBe(false);
    });
  });

  describe("Class Name Mapping", () => {
    it("should return correct class names", () => {
      expect((characterOps as any).getClassName(0)).toBe("Warrior");
      expect((characterOps as any).getClassName(1)).toBe("Guardian");
      expect((characterOps as any).getClassName(2)).toBe("Rogue");
      expect((characterOps as any).getClassName(3)).toBe("Mage");
      expect((characterOps as any).getClassName(4)).toBe("Class 4");
    });
  });

  describe("Menu State Calculation", () => {
    it("should calculate menu state for no character", () => {
      const menuState = (characterOps as any).calculateMenuState(null);

      expect(menuState.canCreateCharacter).toBe(true);
      expect(menuState.canAct).toBe(false);
      expect(menuState.canFight).toBe(false);
      expect(menuState.canHeal).toBe(false);
      expect(menuState.canResurrect).toBe(false);
      expect(menuState.canContinueFight).toBe(false);
      expect(menuState.canFlee).toBe(false);
      expect(menuState.canViewPools).toBe(true);
      expect(menuState.canViewLeaderboard).toBe(true);
      expect(menuState.canViewClaims).toBe(false);
      expect(menuState.canClaimPrize).toBe(false);
    });

    it("should calculate menu state for alive character", () => {
      const character = {
        exists: true,
        isAlive: true,
        inCombat: false,
      };

      const menuState = (characterOps as any).calculateMenuState(character);

      expect(menuState.canCreateCharacter).toBe(false);
      expect(menuState.canAct).toBe(true);
      expect(menuState.canFight).toBe(true);
      expect(menuState.canHeal).toBe(true);
      expect(menuState.canResurrect).toBe(false);
      expect(menuState.canContinueFight).toBe(false);
      expect(menuState.canFlee).toBe(false);
    });

    it("should calculate menu state for dead character", () => {
      const character = {
        exists: true,
        isAlive: false,
        inCombat: false,
      };

      const menuState = (characterOps as any).calculateMenuState(character);

      expect(menuState.canCreateCharacter).toBe(false);
      expect(menuState.canAct).toBe(false);
      expect(menuState.canFight).toBe(false);
      expect(menuState.canHeal).toBe(false);
      expect(menuState.canResurrect).toBe(true);
      expect(menuState.canContinueFight).toBe(false);
      expect(menuState.canFlee).toBe(false);
    });

    it("should calculate menu state for character in combat", () => {
      const character = {
        exists: true,
        isAlive: true,
        inCombat: true,
      };

      const menuState = (characterOps as any).calculateMenuState(character);

      expect(menuState.canCreateCharacter).toBe(false);
      expect(menuState.canAct).toBe(false);
      expect(menuState.canFight).toBe(false);
      expect(menuState.canHeal).toBe(false);
      expect(menuState.canResurrect).toBe(false);
      expect(menuState.canContinueFight).toBe(true);
      expect(menuState.canFlee).toBe(true);
    });
  });
});
