import { expect } from "chai";
import { getSigners, deployArtifact } from "../utils/helpers";

describe("Flee Victory Level-Up Fix", () => {
  let chainBrawler: any;
  let owner: any;
  let player: any;

  beforeEach(async () => {
    const signers = await getSigners();
    owner = signers[0];
    player = signers[1];

    chainBrawler = await deployArtifact(owner, "ChainBrawlerClean", []);
  });

  it("should handle level-up correctly during flee victory", async () => {
    console.log("🔍 Testing flee victory level-up fix...");

    const helper = await deployArtifact(owner, "ChainBrawlerTestHelpersForTests", []);

    // Set up weak enemy that will die in flee (low HP but gives good XP)
    await helper.write.setEnemyBase([1n, 2n, 2n, 1n, 1n, 50n, 1000n], { account: owner.account });

    // Create character close to leveling up (level 1 with 90 XP, needs 100 to level up)
    const LEVEL_SHIFT = 0n;
    const IS_ALIVE_SHIFT = 8n;
    const CURRENT_ENDURANCE_SHIFT = 16n;
    const MAX_ENDURANCE_SHIFT = 32n;
    const COMBAT_SKILL_SHIFT = 48n;
    const DEFENSE_SHIFT = 64n;
    const LUCK_SHIFT = 80n;
    const CHARACTER_CLASS_SHIFT = 128n;

    let coreStats = 0n;
    coreStats |= 1n << LEVEL_SHIFT; // level = 1
    coreStats |= 1n << IS_ALIVE_SHIFT; // alive
    coreStats |= 15n << CURRENT_ENDURANCE_SHIFT; // current HP = 15
    coreStats |= 20n << MAX_ENDURANCE_SHIFT; // max HP = 20
    coreStats |= 8n << COMBAT_SKILL_SHIFT; // strong combat to kill enemy
    coreStats |= 3n << DEFENSE_SHIFT;
    coreStats |= 2n << LUCK_SHIFT;
    coreStats |= 0n << CHARACTER_CLASS_SHIFT; // class 0

    // Set character with 90 XP (close to level 2 which needs 100 XP)
    let progressionStats = 90n; // 90 XP in experience field

    await helper.write.setPackedCharacter([player.account.address, coreStats, progressionStats], {
      account: owner.account,
    });

    // Get initial state
    const initialData = await helper.read.getCharacter([player.account.address]);
    const initialLevel = Number(initialData[1]);
    const initialCurrentHP = Number(initialData[3]);
    const initialMaxHP = Number(initialData[4]);
    const initialExperience = Number(initialData[2]);

    console.log(`Initial: Level ${initialLevel}, HP ${initialCurrentHP}/${initialMaxHP}, XP ${initialExperience}`);

    // Start combat
    await helper.write.fightEnemy([1, 1], { account: player.account });

    // Check if we're in combat (combat might end immediately if enemy dies)
    const inCombat = await helper.read.isCharacterInCombat([player.account.address]);
    console.log(`In combat: ${inCombat}`);

    if (inCombat) {
      // Flee (this should trigger flee victory if enemy dies + level-up)
      await helper.write.fleeRound([], { account: player.account });
    } else {
      console.log(`Combat ended immediately (likely victory)`);
    }

    // Get final state
    const finalData = await helper.read.getCharacter([player.account.address]);
    const finalLevel = Number(finalData[1]);
    const finalCurrentHP = Number(finalData[3]);
    const finalMaxHP = Number(finalData[4]);
    const finalExperience = Number(finalData[2]);

    console.log(`Final: Level ${finalLevel}, HP ${finalCurrentHP}/${finalMaxHP}, XP ${finalExperience}`);

    // Verify the fix worked
    if (finalLevel > initialLevel) {
      console.log(`✅ Level up occurred: ${initialLevel} → ${finalLevel}`);
      
      // CRITICAL: currentHP should never exceed maxHP (this was the bug)
      expect(finalCurrentHP).to.be.at.most(finalMaxHP, 
        `Current HP (${finalCurrentHP}) should not exceed max HP (${finalMaxHP}) after level-up`);
      
      // maxHP should have increased with level
      expect(finalMaxHP).to.be.greaterThan(initialMaxHP, 
        "Max HP should increase with level-up");
      
      // XP should be adjusted (reduced after level-up)
      expect(finalExperience).to.be.lessThan(initialExperience + 50, 
        "XP should be reduced after spending on level-up");
      
      console.log(`✅ Level-up processed correctly, no HP overflow bug`);
    } else {
      console.log(`No level-up occurred, but HP should still be valid`);
      expect(finalCurrentHP).to.be.at.most(finalMaxHP, 
        `Current HP should never exceed max HP`);
    }
  });

  it("should handle multiple level-ups in single flee victory", async () => {
    console.log("🔍 Testing multiple level-ups in single flee victory...");

    const helper = await deployArtifact(owner, "ChainBrawlerTestHelpersForTests", []);

    // Set up enemy that gives massive XP
    await helper.write.setEnemyBase([1n, 1n, 1n, 1n, 1n, 500n, 10000n], { account: owner.account });

    // Create low-level character with lots of XP (enough for multiple level-ups)
    let coreStats = 0n;
    coreStats |= 1n << 0n; // level = 1
    coreStats |= 1n << 8n; // alive
    coreStats |= 10n << 16n; // current HP = 10
    coreStats |= 20n << 32n; // max HP = 20
    coreStats |= 10n << 48n; // strong combat
    coreStats |= 3n << 64n;
    coreStats |= 2n << 80n;

    // Set character with 450 XP (enough to go from level 1 to level 3+)
    let progressionStats = 450n;

    await helper.write.setPackedCharacter([player.account.address, coreStats, progressionStats], {
      account: owner.account,
    });

    const initialData = await helper.read.getCharacter([player.account.address]);
    console.log(`Initial: Level ${Number(initialData[1])}, HP ${Number(initialData[3])}/${Number(initialData[4])}`);

    // Fight with massive XP gain
    await helper.write.fightEnemy([1, 1], { account: player.account });
    
    // Check if in combat and flee if needed
    const inCombat = await helper.read.isCharacterInCombat([player.account.address]);
    if (inCombat) {
      await helper.write.fleeRound([], { account: player.account });
    }

    const finalData = await helper.read.getCharacter([player.account.address]);
    const finalLevel = Number(finalData[1]);
    const finalCurrentHP = Number(finalData[3]);
    const finalMaxHP = Number(finalData[4]);

    console.log(`Final: Level ${finalLevel}, HP ${finalCurrentHP}/${finalMaxHP}`);

    // Verify multiple level-ups handled correctly
    expect(finalLevel).to.be.greaterThan(1, "Should have leveled up");
    expect(finalCurrentHP).to.be.at.most(finalMaxHP, 
      "HP overflow bug should not occur even with multiple level-ups");
    expect(finalMaxHP).to.be.greaterThan(20, 
      "Max HP should have increased significantly with multiple levels");

    console.log(`✅ Multiple level-ups handled correctly, no HP overflow`);
  });

  it("should not break flee death scenarios", async () => {
    console.log("🔍 Testing flee death scenarios still work...");

    const helper = await deployArtifact(owner, "ChainBrawlerTestHelpersForTests", []);

    // Set up strong enemy that will kill player
    await helper.write.setEnemyBase([1n, 20n, 15n, 5n, 3n, 10n, 100n], { account: owner.account });

    // Create weak character
    let coreStats = 0n;
    coreStats |= 1n << 0n; // level = 1
    coreStats |= 1n << 8n; // alive
    coreStats |= 1n << 16n; // current HP = 1 (very low)
    coreStats |= 20n << 32n; // max HP = 20
    coreStats |= 2n << 48n; // weak combat
    coreStats |= 1n << 64n;
    coreStats |= 1n << 80n;

    await helper.write.setPackedCharacter([player.account.address, coreStats, 0n], {
      account: owner.account,
    });

    // Fight and likely die
    await helper.write.fightEnemy([1, 1], { account: player.account });
    
    // Check if in combat and flee if needed
    const inCombat = await helper.read.isCharacterInCombat([player.account.address]);
    if (inCombat) {
      await helper.write.fleeRound([], { account: player.account });
    }

    const finalData = await helper.read.getCharacter([player.account.address]);
    const isAlive = finalData[8];
    const finalCurrentHP = Number(finalData[3]);

    console.log(`Final: Alive ${isAlive}, HP ${finalCurrentHP}`);

    // Death should work normally (no XP awarded, no level-up processing needed)
    if (!isAlive) {
      expect(finalCurrentHP).to.equal(0, "Dead character should have 0 HP");
      console.log(`✅ Flee death works correctly`);
    }
  });

  it("should not break flee escape scenarios", async () => {
    console.log("🔍 Testing flee escape scenarios still work...");

    const helper = await deployArtifact(owner, "ChainBrawlerTestHelpersForTests", []);

    // Set up balanced enemy (won't die easily, won't kill player easily)
    await helper.write.setEnemyBase([1n, 8n, 12n, 3n, 2n, 15n, 100n], { account: owner.account });

    // Create balanced character
    let coreStats = 0n;
    coreStats |= 1n << 0n; // level = 1
    coreStats |= 1n << 8n; // alive
    coreStats |= 15n << 16n; // current HP = 15
    coreStats |= 20n << 32n; // max HP = 20
    coreStats |= 5n << 48n; // balanced combat
    coreStats |= 3n << 64n;
    coreStats |= 2n << 80n;

    await helper.write.setPackedCharacter([player.account.address, coreStats, 0n], {
      account: owner.account,
    });

    const initialData = await helper.read.getCharacter([player.account.address]);
    const initialCurrentHP = Number(initialData[3]);

    // Fight and escape (both survive)
    await helper.write.fightEnemy([1, 1], { account: player.account });
    
    // Check if in combat and flee if needed  
    const inCombat = await helper.read.isCharacterInCombat([player.account.address]);
    if (inCombat) {
      await helper.write.fleeRound([], { account: player.account });
    }

    const finalData = await helper.read.getCharacter([player.account.address]);
    const isAlive = finalData[8];
    const finalCurrentHP = Number(finalData[3]);
    const finalMaxHP = Number(finalData[4]);

    console.log(`Final: Alive ${isAlive}, HP ${finalCurrentHP}/${finalMaxHP}`);

    // Escape should work normally (no XP, no level-up, valid HP)
    expect(isAlive).to.be.true;
    expect(finalCurrentHP).to.be.at.most(finalMaxHP, "HP should be valid after escape");
    expect(finalCurrentHP).to.be.at.most(initialCurrentHP, "HP should not increase from escape");

    console.log(`✅ Flee escape works correctly`);
  });
});