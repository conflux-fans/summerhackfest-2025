import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { createCombatMathFixture } from "./utils/fixtures";

describe("Dynamic Difficulty Multiplier System", function () {
  this.timeout(60000);

  describe("Combat Index Calculation", () => {
    it("should calculate combat index correctly for balanced fight", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      // Level 5 warrior (Combat: 20, Defense: 8, Luck: 2) vs Enemy 5 (Combat: 21, Defense: 4, Luck: 4)
      const playerCombat = 20;
      const playerDefense = 8;
      const playerLuck = 2;
      const enemyCombat = 21;
      const enemyDefense = 4;
      const enemyLuck = 4;

      const combatIndex = await combatMathTest.read.calculateCombatIndex([
        playerCombat,
        playerDefense,
        playerLuck,
        enemyCombat,
        enemyDefense,
        enemyLuck,
      ]);

      // Should be near 0 for balanced fight (slight edge to enemy)
      expect(Number(combatIndex)).to.be.closeTo(0, 3);
    });

    it("should calculate positive combat index for player stronger than enemy", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      // Strong player vs weak enemy
      const playerCombat = 30;
      const playerDefense = 15;
      const playerLuck = 10;
      const enemyCombat = 10;
      const enemyDefense = 5;
      const enemyLuck = 2;

      const combatIndex = await combatMathTest.read.calculateCombatIndex([
        playerCombat,
        playerDefense,
        playerLuck,
        enemyCombat,
        enemyDefense,
        enemyLuck,
      ]);

      // Should be positive (easier fight)
      expect(Number(combatIndex)).to.be.greaterThan(10);
    });

    it("should calculate negative combat index for enemy stronger than player", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      // Weak player vs strong enemy
      const playerCombat = 10;
      const playerDefense = 5;
      const playerLuck = 2;
      const enemyCombat = 30;
      const enemyDefense = 15;
      const enemyLuck = 10;

      const combatIndex = await combatMathTest.read.calculateCombatIndex([
        playerCombat,
        playerDefense,
        playerLuck,
        enemyCombat,
        enemyDefense,
        enemyLuck,
      ]);

      // Should be negative (harder fight)
      expect(Number(combatIndex)).to.be.lessThan(-10);
    });
  });

  describe("Difficulty Multiplier Calculation", () => {
    it("should return 12.5% multiplier for severe grinding (combat index +15)", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      const multiplier = await combatMathTest.read.calculateDifficultyMultiplier([15n]);
      expect(multiplier).to.equal(1250n); // 12.5% = 1250 basis points
    });

    it("should return 20% multiplier for moderate grinding (combat index +10)", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      const multiplier = await combatMathTest.read.calculateDifficultyMultiplier([10n]);
      expect(multiplier).to.equal(2000n); // 20% = 2000 basis points
    });

    it("should return 80% multiplier for balanced fights (combat index 0)", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      const multiplier = await combatMathTest.read.calculateDifficultyMultiplier([0n]);
      expect(multiplier).to.equal(8000n); // 80% = 8000 basis points
    });

    it("should return 200% multiplier for moderate challenge (combat index -5)", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      const multiplier = await combatMathTest.read.calculateDifficultyMultiplier([-5n]);
      expect(multiplier).to.equal(20000n); // 200% = 20000 basis points
    });

    it("should return 350% multiplier for high challenge (combat index -10)", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      const multiplier = await combatMathTest.read.calculateDifficultyMultiplier([-10n]);
      expect(multiplier).to.equal(35000n); // 350% = 35000 basis points
    });

    it("should return 500% multiplier for ultra challenge (combat index -15)", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      const multiplier = await combatMathTest.read.calculateDifficultyMultiplier([-15n]);
      expect(multiplier).to.equal(50000n); // 500% = 50000 basis points
    });

    it("should return 1000% multiplier for maximum challenge (combat index -25)", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      const multiplier = await combatMathTest.read.calculateDifficultyMultiplier([-25n]);
      expect(multiplier).to.equal(100000n); // 1000% = 100000 basis points
    });

    it("should cap at minimum 5% for extreme grinding", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      const multiplier = await combatMathTest.read.calculateDifficultyMultiplier([50n]);
      expect(multiplier).to.equal(500n); // Minimum 5% = 500 basis points
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero stats gracefully", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      const combatIndex = await combatMathTest.read.calculateCombatIndex([
        0,
        0,
        0, // Player with zero stats
        1,
        1,
        1, // Enemy with minimal stats
      ]);

      // Should calculate without reverting
      expect(typeof combatIndex).to.equal("bigint");
    });

    it("should handle extreme combat indices", async () => {
      const { combatMathTest } = await loadFixture(createCombatMathFixture);

      // Test extreme positive value
      const positiveMultiplier = await combatMathTest.read.calculateDifficultyMultiplier([100n]);
      expect(positiveMultiplier).to.equal(500n); // Should be capped at 5%

      // Test extreme negative value
      const negativeMultiplier = await combatMathTest.read.calculateDifficultyMultiplier([-100n]);
      expect(negativeMultiplier).to.equal(100000n); // Should be capped at 1000%
    });
  });
});
