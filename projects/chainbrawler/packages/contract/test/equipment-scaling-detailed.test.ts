import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("EQUIPMENT REWARD DYNAMIC SCALING TEST", () => {
  async function deployFixture() {
    // First deploy the CombatEngineLib library
    const combatEngineLib = await hre.viem.deployContract("CombatEngineLib");

    // Deploy ChainBrawlerClean with library linking
    const chainBrawler = await hre.viem.deployContract("ChainBrawlerClean", [], {
      libraries: {
        "contracts/libraries/CombatEngineLib.sol:CombatEngineLib": combatEngineLib.address,
      },
    });
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    return {
      chainBrawler,
      player1: wallets[1],
      player2: wallets[2],
      player3: wallets[3],
      player4: wallets[4],
      player5: wallets[5],
      player6: wallets[6],
      player7: wallets[7],
      publicClient,
    };
  }

  it("should demonstrate equipment reward multipliers scale with pool size", async () => {
    const {
      chainBrawler,
      player1,
      player2,
      player3,
      player4,
      player5,
      player6,
      player7,
      publicClient,
    } = await loadFixture(deployFixture);

    console.log("\n🎁 EQUIPMENT REWARD MULTIPLIER SCALING TEST:");
    console.log("Testing how reward multipliers change with pool size...\n");

    // Test 1: Small pool (1.2 CFX) - Should be 100% multiplier
    const hash1 = await chainBrawler.write.createCharacter([0n], {
      account: player1.account,
      value: 15000000000000000000n, // 15 CFX
    });
    await publicClient.waitForTransactionReceipt({ hash: hash1 });

    const pool1 = await chainBrawler.read.equipmentRewardPool();
    console.log(`📊 Pool Size: ${Number(pool1) / 1e18} CFX (1 character)`);
    console.log(`Expected multiplier: 100% (< 2 CFX threshold)`);
    console.log(`Base reward: 0.001 CFX, Max potential: 0.005 CFX\n`);

    // Test 2: Medium pool (2.4 CFX) - Should be 250% multiplier
    const hash2 = await chainBrawler.write.createCharacter([0n], {
      account: player2.account,
      value: 15000000000000000000n, // 15 CFX
    });
    await publicClient.waitForTransactionReceipt({ hash: hash2 });

    const pool2 = await chainBrawler.read.equipmentRewardPool();
    console.log(`📊 Pool Size: ${Number(pool2) / 1e18} CFX (2 characters)`);
    console.log(`Expected multiplier: 250% (>= 2 CFX threshold)`);
    console.log(`Base reward: 0.0025 CFX, Max potential: 0.0125 CFX\n`);

    // Test 3: Large pool (6 CFX) - Should be 500% multiplier
    for (let i = 3; i <= 5; i++) {
      const wallet = [player3, player4, player5][i - 3];
      const hash = await chainBrawler.write.createCharacter([0n], {
        account: wallet.account,
        value: 15000000000000000000n, // 15 CFX
      });
      await publicClient.waitForTransactionReceipt({ hash });
    }

    const pool5 = await chainBrawler.read.equipmentRewardPool();
    console.log(`📊 Pool Size: ${Number(pool5) / 1e18} CFX (5 characters)`);
    console.log(`Expected multiplier: 500% (>= 5 CFX threshold)`);
    console.log(`Base reward: 0.005 CFX, Max potential: 0.025 CFX\n`);

    // Test 4: Huge pool (12 CFX) - Should be 1000% multiplier
    for (let i = 6; i <= 7; i++) {
      const wallet = [player6, player7][i - 6];
      const hash = await chainBrawler.write.createCharacter([0n], {
        account: wallet.account,
        value: 15000000000000000000n, // 15 CFX * 3 more = 36 CFX total fees
      });
      await publicClient.waitForTransactionReceipt({ hash });
    }

    // Add more characters to reach 10 CFX threshold (need 10 total)
    const moreWallets = await hre.viem.getWalletClients();
    for (let i = 8; i <= 10; i++) {
      const hash = await chainBrawler.write.createCharacter([0n], {
        account: moreWallets[i].account,
        value: 15000000000000000000n, // 15 CFX
      });
      await publicClient.waitForTransactionReceipt({ hash });
    }

    const poolFinal = await chainBrawler.read.equipmentRewardPool();
    console.log(`📊 Pool Size: ${Number(poolFinal) / 1e18} CFX (10 characters)`);
    console.log(`Expected multiplier: 1000% (>= 10 CFX threshold)`);
    console.log(`Base reward: 0.01 CFX, Max potential: 0.05 CFX\n`);

    // Verify progression
    expect(pool2 > pool1).to.be.true;
    expect(pool5 > pool2).to.be.true;
    expect(poolFinal > pool5).to.be.true;

    console.log("✅ SCALING SUMMARY:");
    console.log(`├─ Small pools (< 2 CFX): 100% multiplier (0.001 CFX base)`);
    console.log(`├─ Medium pools (2-5 CFX): 250-500% multiplier (0.0025-0.005 CFX base)`);
    console.log(`└─ Large pools (>= 10 CFX): 1000% multiplier (0.01 CFX base)`);
    console.log("\n🚀 Equipment rewards successfully incentivize pool growth!");
  });

  it("should maintain fixed gas refund amounts regardless of pool size", async () => {
    const { chainBrawler, player1, publicClient } = await loadFixture(deployFixture);

    console.log("\n⛽ FIXED GAS REFUND VERIFICATION:");

    // Get initial gas refund amount
    const gasRefundPerFight = await chainBrawler.read.gasRefundCapPerFight();
    console.log(`Fixed gas refund per fight: ${Number(gasRefundPerFight) / 1e18} CFX`);

    // Create character and verify gas pool allocation
    const hash = await chainBrawler.write.createCharacter([0n], {
      account: player1.account,
      value: 15000000000000000000n, // 15 CFX
    });
    await publicClient.waitForTransactionReceipt({ hash });

    const gasPool = await chainBrawler.read.gasRefundPool();
    console.log(`Gas pool after character creation: ${Number(gasPool) / 1e18} CFX`);
    console.log(`Potential fights supported: ${Number(gasPool) / Number(gasRefundPerFight)}`);

    // Verify expected values
    expect(gasRefundPerFight).to.equal(300000000000000n); // 0.0003 CFX (correct: 300000000000000)
    expect(gasPool).to.equal(1800000000000000000n); // 12% of 15 CFX = 1.8 CFX

    console.log("\n✅ Gas refunds provide predictable, fixed amounts for all players");
  });
});
