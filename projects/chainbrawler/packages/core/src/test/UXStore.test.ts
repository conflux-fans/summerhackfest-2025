// Tests for UXStore
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UXStore } from "../state/UXStore";
import type {
  CharacterData,
  ClaimsData,
  LeaderboardData,
  MenuState,
  OperationState,
  PoolsData,
} from "../types";

describe("UXStore", () => {
  let store: UXStore;

  beforeEach(() => {
    store = new UXStore();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const state = store.getState();

      expect(state.character).toBeNull();
      expect(state.menu).toBeNull();
      expect(state.operation).toBeNull();
      expect(state.pools).toBeNull();
      expect(state.leaderboard).toBeNull();
      expect(state.claims).toBeNull();
      expect(state.statusMessage).toBe("Initializing...");
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe("Character Management", () => {
    it("should update character data", () => {
      const character: CharacterData = {
        exists: true,
        isAlive: true,
        class: 0,
        className: "Warrior",
        level: 1,
        experience: 0,
        endurance: { current: 100, max: 100, percentage: 100 },
        stats: { combat: 10, defense: 8, luck: 5 },
        equipment: [],
        inCombat: false,
        totalKills: 0,
      };

      store.updateCharacter(character);

      expect(store.getCharacter()).toEqual(character);
      expect(store.getState().character).toEqual(character);
    });

    it("should clear character data", () => {
      const character: CharacterData = {
        exists: true,
        isAlive: true,
        class: 0,
        className: "Warrior",
        level: 1,
        experience: 0,
        endurance: { current: 100, max: 100, percentage: 100 },
        stats: { combat: 10, defense: 8, luck: 5 },
        equipment: [],
        inCombat: false,
        totalKills: 0,
      };

      store.updateCharacter(character);
      store.updateCharacter(null);

      expect(store.getCharacter()).toBeNull();
    });
  });

  describe("Menu State Management", () => {
    it("should update menu state", () => {
      const menu: MenuState = {
        canCreateCharacter: false,
        canAct: true,
        canFight: true,
        canHeal: true,
        canResurrect: false,
        canContinueFight: false,
        canFlee: false,
        canViewPools: true,
        canViewLeaderboard: true,
        canViewClaims: true,
        canClaimPrize: true,
        availableActions: ["fight", "heal"],
        disabledActions: ["resurrect"],
        disabledReasons: { resurrect: "Character is alive" },
        healingCooldownRemaining: 0,
      };

      store.updateMenu(menu);

      expect(store.getMenu()).toEqual(menu);
    });
  });

  describe("Operation State Management", () => {
    it("should update operation state", () => {
      const operation: OperationState = {
        isActive: true,
        operationType: "createCharacter",
        status: "processing",
        startTime: Date.now(),
        progress: "Creating character...",
      };

      store.updateOperation(operation);

      expect(store.getOperation()).toEqual(operation);
    });

    it("should clear operation state", () => {
      const operation: OperationState = {
        isActive: true,
        operationType: "createCharacter",
        status: "processing",
        startTime: Date.now(),
      };

      store.updateOperation(operation);
      store.updateOperation(null);

      expect(store.getOperation()).toBeNull();
    });
  });

  describe("Pools Management", () => {
    it("should update pools data", () => {
      const pools: PoolsData = {
        prizePool: {
          value: 1000n,
          formatted: "1.0000 CFX",
          description: "Prize pool",
          percentage: 50,
        },
        equipmentPool: {
          value: 500n,
          formatted: "0.5000 CFX",
          description: "Equipment pool",
          percentage: 25,
        },
        gasRefundPool: {
          value: 300n,
          formatted: "0.3000 CFX",
          description: "Gas refund pool",
          percentage: 15,
        },
        developerPool: {
          value: 200n,
          formatted: "0.2000 CFX",
          description: "Developer pool",
          percentage: 10,
        },
        nextEpochPool: {
          value: 0n,
          formatted: "0.0000 CFX",
          description: "Next epoch pool",
          percentage: 0,
        },
        emergencyPool: {
          value: 0n,
          formatted: "0.0000 CFX",
          description: "Emergency pool",
          percentage: 0,
        },
        totalValue: 2000n,
        lastUpdated: Date.now(),
      };

      store.updatePools(pools);

      expect(store.getPools()).toEqual(pools);
    });
  });

  describe("Leaderboard Management", () => {
    it("should update leaderboard data", () => {
      const leaderboard: LeaderboardData = {
        currentEpoch: 1n,
        playerScore: 100n,
        playerRank: 5n,
        totalPlayers: 50n,
        topPlayers: [],
        epochTimeRemaining: 3600n,
        lastUpdated: Date.now(),
      };

      store.updateLeaderboard(leaderboard);

      expect(store.getLeaderboard()).toEqual(leaderboard);
    });
  });

  describe("Claims Management", () => {
    it("should update claims data", () => {
      const claims: ClaimsData = {
        available: [
          {
            type: "epoch",
            amount: 100n,
            description: "Epoch 1 reward",
            canClaim: true,
            epoch: 1,
            index: 0n,
            proof: [],
          },
        ],
        totalClaimable: 100n,
        lastChecked: Date.now(),
      };

      store.updateClaims(claims);

      expect(store.getClaims()).toEqual(claims);
    });
  });

  describe("Status and Error Management", () => {
    it("should update status message", () => {
      store.setStatusMessage("Test message");

      expect(store.getStatusMessage()).toBe("Test message");
    });

    it("should update loading state", () => {
      store.setLoading(false);

      expect(store.isLoading()).toBe(false);
    });

    it("should update error state", () => {
      store.setError("Test error");

      expect(store.getError()).toBe("Test error");
    });

    it("should clear error", () => {
      store.setError("Test error");
      store.clearError();

      expect(store.getError()).toBeNull();
    });
  });

  describe("Event Data Management", () => {
    it("should set last fight summary", () => {
      const fightSummary = {
        enemyId: 1,
        enemyLevel: 5,
        roundsElapsed: 3,
        victory: true,
        unresolved: false,
        xpGained: 50,
        playerDied: false,
        enemyDied: true,
        playerHealthRemaining: 80,
        enemyHealthRemaining: 0,
        playerStartEndurance: 100,
        enemyStartEndurance: 50,
        rounds: {
          count: 3,
          numbers: [1, 2, 3],
          playerDamages: [10, 15, 20],
          enemyDamages: [5, 8, 12],
          playerCriticals: [false, true, false],
          enemyCriticals: [false, false, false],
        },
        enemyName: "Goblin Warrior",
        difficultyMultiplier: 1.0,
      };

      store.setLastFightSummary(fightSummary);

      expect(store.getState().lastFightSummary).toEqual(fightSummary);
    });

    it("should set last equipment dropped", () => {
      const equipmentDrop = {
        bonuses: [5, 3, 2, 1],
        description: "Rare sword",
      };

      store.setLastEquipmentDropped(equipmentDrop);

      expect(store.getState().lastEquipmentDropped).toEqual(equipmentDrop);
    });

    it("should set last healing", () => {
      const healing = {
        newEndurance: 100,
        cost: 5n,
      };

      store.setLastHealing(healing);

      expect(store.getState().lastHealing).toEqual(healing);
    });

    it("should set last resurrection", () => {
      const resurrection = {
        newEndurance: 50,
        cost: 10n,
      };

      store.setLastResurrection(resurrection);

      expect(store.getState().lastResurrection).toEqual(resurrection);
    });
  });

  describe("Subscription System", () => {
    it("should notify listeners on state changes", () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      store.setStatusMessage("Test");

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(store.getState());

      unsubscribe();
    });

    it("should unsubscribe listeners", () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      unsubscribe();
      store.setStatusMessage("Test");

      expect(listener).toHaveBeenCalledTimes(0);
    });

    it("should handle multiple listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      store.subscribe(listener1);
      store.subscribe(listener2);

      store.setStatusMessage("Test");

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("should handle listener errors gracefully", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Listener error");
      });
      const normalListener = vi.fn();

      store.subscribe(errorListener);
      store.subscribe(normalListener);

      store.setStatusMessage("Test");

      expect(normalListener).toHaveBeenCalledTimes(1);
    });
  });

  describe("Batch Updates", () => {
    it("should perform batch updates", () => {
      const listener = vi.fn();
      store.subscribe(listener);

      store.batchUpdate({
        statusMessage: "Batch update",
        isLoading: false,
        error: null,
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(store.getStatusMessage()).toBe("Batch update");
      expect(store.isLoading()).toBe(false);
      expect(store.getError()).toBeNull();
    });
  });

  describe("Reset Functionality", () => {
    it("should reset to initial state", () => {
      store.updateCharacter({
        exists: true,
        isAlive: true,
        class: 0,
        className: "Warrior",
        level: 1,
        experience: 0,
        endurance: { current: 100, max: 100, percentage: 100 },
        stats: { combat: 10, defense: 8, luck: 5 },
        equipment: [],
        inCombat: false,
        totalKills: 0,
      });

      store.setStatusMessage("Test");
      store.setError("Test error");

      store.reset();

      const state = store.getState();
      expect(state.character).toBeNull();
      expect(state.statusMessage).toBe("Initializing...");
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });
});
