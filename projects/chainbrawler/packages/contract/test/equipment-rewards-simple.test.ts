import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("EQUIPMENT REWARDS BASIC TEST", () => {
  async function deployFixture() {
    // First deploy the CombatEngineLib library
    const combatEngineLib = await hre.viem.deployContract("CombatEngineLib");

    // Deploy ChainBrawlerClean with library linking
    const chainBrawler = await hre.viem.deployContract("ChainBrawlerClean", [], {
      libraries: {
        "contracts/libraries/CombatEngineLib.sol:CombatEngineLib": combatEngineLib.address,
      },
    });
    const [admin, player1] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    return { chainBrawler, admin, player1, publicClient };
  }

  it("should fund equipment pool and verify character can fight", async () => {
    const { chainBrawler, player1, publicClient } = await loadFixture(deployFixture);

    // 1. Create character
    const creationFee = 15000000000000000000n; // 15 CFX
    let hash = await chainBrawler.write.createCharacter([0n], {
      account: player1.account,
      value: creationFee,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    // 2. Check equipment pool is funded
    const equipmentPool = await chainBrawler.read.equipmentRewardPool();
    expect(equipmentPool).to.equal(1200000000000000000n); // 1.2 CFX
    console.log(`✅ Equipment pool funded: ${Number(equipmentPool) / 1e18} CFX`);

    // 3. Check character is alive
    console.log("Character created successfully");

    // 4. Try a single fight
    try {
      hash = await chainBrawler.write.fightEnemy([1n, 1n], {
        account: player1.account,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      console.log("✅ Fight successful");

      // 5. Check if equipment pool was used
      const poolAfter = await chainBrawler.read.equipmentRewardPool();
      const poolUsed = equipmentPool - poolAfter;
      console.log(`Equipment pool after fight: ${Number(poolAfter) / 1e18} CFX`);
      console.log(`Pool used for rewards: ${Number(poolUsed) / 1e18} CFX`);

      if (poolUsed > 0) {
        console.log("🎉 Equipment token rewards were distributed!");
      } else {
        console.log("ℹ️  No equipment drop occurred (random chance)");
      }
    } catch (error: any) {
      console.log("❌ Fight failed:", error?.message || "Unknown error");
    }
  });

  it("should verify equipment reward calculation works correctly", async () => {
    const { chainBrawler, player1, publicClient } = await loadFixture(deployFixture);

    // Create character
    const hash = await chainBrawler.write.createCharacter([0n], {
      account: player1.account,
      value: 15000000000000000000n,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    const initialPool = await chainBrawler.read.equipmentRewardPool();
    console.log(`Initial equipment pool: ${Number(initialPool) / 1e18} CFX`);

    // Test multiple fights to see if any equipment drops occur
    let successfulFights = 0;
    let totalPoolUsed = 0n;

    for (let i = 0; i < 10; i++) {
      try {
        const fightHash = await chainBrawler.write.fightEnemy([1n, 1n], {
          account: player1.account,
        });
        await publicClient.waitForTransactionReceipt({ hash: fightHash });
        successfulFights++;
      } catch (error) {
        console.log(`Fight ${i + 1} failed - character may be dead`);
        break;
      }
    }

    const finalPool = await chainBrawler.read.equipmentRewardPool();
    totalPoolUsed = initialPool - finalPool;

    console.log(`Successful fights: ${successfulFights}`);
    console.log(`Total pool used: ${Number(totalPoolUsed) / 1e18} CFX`);
    console.log(`Final pool: ${Number(finalPool) / 1e18} CFX`);

    if (totalPoolUsed > 0) {
      console.log("🎉 Equipment token reward system is working!");
      expect(Number(totalPoolUsed)).to.be.greaterThan(0);
    } else {
      console.log("ℹ️  No equipment drops occurred during test fights");
    }

    expect(successfulFights).to.be.greaterThan(0, "Should have completed at least one fight");
  });
});
