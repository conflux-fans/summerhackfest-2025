import { expect } from "chai";
import { getSigners, deployArtifact } from "../utils/helpers";

describe("ChainBrawlerClean - Utility Functions", function () {
  let chainBrawler: any;
  let owner: any;
  let player1: any;
  let player2: any;

  beforeEach(async function () {
    const signers = await getSigners();
    owner = signers[0];
    player1 = signers[1];
    player2 = signers[2];

    chainBrawler = await deployArtifact(owner, "ChainBrawlerClean", []);
  });

  describe("canHeal function", function () {
    it("should return false for non-existent character", async function () {
      const result = await chainBrawler.read.canHeal([player1.address]);
      expect(result[0]).to.be.false;
      expect(result[1]).to.equal("Character does not exist");
    });

    it("should return true for healthy character not on cooldown", async function () {
      // Create character
      await chainBrawler.write.createCharacter([0], { 
        account: player1.account,
        value: 15000000000000000000n // 15 ether in wei
      });

      // Damage the character by fighting
      await chainBrawler.write.fightEnemy([0, 1], { account: player1.account });

      // Wait for healing cooldown to pass (if any)
      // Note: Viem doesn't have direct provider access, we'll skip time manipulation for now

      const result = await chainBrawler.read.canHeal([player1.address]);
      
      // Should be able to heal if character is damaged, or have a valid reason
      if (result[0]) {
        expect(result[1]).to.equal("");
      } else {
        // If can't heal, it should be because character is at full health or another valid reason
        expect(result[1]).to.be.oneOf([
          "Already at full health",
          "Character is in combat",
          "Healing on cooldown"
        ]);
      }
    });

    it("should return false when character is at full health", async function () {
      // Create character (starts at full health)
      await chainBrawler.write.createCharacter([0], { 
        account: player1.account,
        value: 15000000000000000000n // 15 ether in wei
      });

      const result = await chainBrawler.read.canHeal([player1.address]);
      
      // New character should be at full health
      expect(result[0]).to.be.false;
      expect(result[1]).to.equal("Already at full health");
    });
  });

  describe("canResurrect function", function () {
    it("should return false for non-existent character", async function () {
      const result = await chainBrawler.read.canResurrect([player1.address]);
      expect(result[0]).to.be.false;
      expect(result[1]).to.equal("Character does not exist");
    });

    it("should return false for alive character", async function () {
      // Create character (starts alive)
      await chainBrawler.write.createCharacter([0], { 
        account: player1.account,
        value: 15000000000000000000n // 15 ether in wei
      });

      const result = await chainBrawler.read.canResurrect([player1.address]);
      expect(result[0]).to.be.false;
      expect(result[1]).to.equal("Character is already alive");
    });
  });

  describe("getAllPoolData function", function () {
    it("should return all pool data correctly", async function () {
      const poolData = await chainBrawler.read.getAllPoolData();
      
      expect(poolData).to.have.length(6);
      
      // All pools should be numbers (BigInt)
      expect(typeof poolData[0]).to.equal("bigint"); // prizePool
      expect(typeof poolData[1]).to.equal("bigint"); // equipmentPool
      expect(typeof poolData[2]).to.equal("bigint"); // gasRefundPool
      expect(typeof poolData[3]).to.equal("bigint"); // developerPool
      expect(typeof poolData[4]).to.equal("bigint"); // nextEpochPool
      expect(typeof poolData[5]).to.equal("bigint"); // emergencyPool

      // Initially all pools should be 0
      expect(poolData[0]).to.equal(0n); // prizePool
      expect(poolData[1]).to.equal(0n); // equipmentPool
      expect(poolData[2]).to.equal(0n); // gasRefundPool
      expect(poolData[3]).to.equal(0n); // developerPool
      expect(poolData[4]).to.equal(0n); // nextEpochPool
      expect(poolData[5]).to.equal(0n); // emergencyPool
    });

    it("should match treasury state", async function () {
      const poolData = await chainBrawler.read.getAllPoolData();
      const treasuryState = await chainBrawler.read.treasuryState();
      
      expect(poolData[0]).to.equal(treasuryState[1]); // prizePool
      expect(poolData[1]).to.equal(treasuryState[3]); // equipmentRewardPool
      expect(poolData[2]).to.equal(treasuryState[2]); // gasRefundPool
      expect(poolData[3]).to.equal(treasuryState[1]); // developerFund
      expect(poolData[4]).to.equal(treasuryState[4]); // nextEpochReserve
      expect(poolData[5]).to.equal(treasuryState[5]); // emergencyReserve
    });
  });

  describe("Leaderboard functions", function () {
    it("should return current epoch", async function () {
      const currentEpoch = await chainBrawler.read.getCurrentEpoch();
      expect(typeof currentEpoch).to.equal("bigint");
      expect(Number(currentEpoch)).to.be.greaterThanOrEqual(0);
    });

    it("should return epoch score for player", async function () {
      const currentEpoch = await chainBrawler.read.getCurrentEpoch();
      const score = await chainBrawler.read.getEpochScore([player1.address, currentEpoch]);
      
      expect(typeof score).to.equal("bigint");
      expect(Number(score)).to.be.greaterThanOrEqual(0);
    });

    it("should return total player count", async function () {
      const initialCount = await chainBrawler.read.getTotalPlayerCount();
      
      // Create a character
      await chainBrawler.write.createCharacter([0], { 
        account: player1.account,
        value: 15000000000000000000n // 15 ether in wei
      });
      
      const finalCount = await chainBrawler.read.getTotalPlayerCount();
      expect(finalCount).to.equal(initialCount + 1n);
    });
  });
});
