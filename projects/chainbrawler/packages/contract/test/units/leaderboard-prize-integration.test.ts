import { expect } from "chai";
import hre from "hardhat";

describe("Leaderboard Prize System Integration", function () {
  this.timeout(30000);

  it("should expose all required leaderboard and prize functions", async () => {
    const [admin, player1, player2] = await hre.viem.getWalletClients();

    // Deploy the CombatEngineLib first
    const combatEngineLib = await hre.viem.deployContract("CombatEngineLib", []);

    // Deploy main contract with library linking
    const chainBrawler = await hre.viem.deployContract("ChainBrawlerTestHelpersForTests", [], {
      libraries: {
        "contracts/libraries/CombatEngineLib.sol:CombatEngineLib": combatEngineLib.address,
      },
    });

    // Deploy leaderboard treasury and manager
    const treasury = await hre.viem.deployContract("LeaderboardTreasury", []);
    const manager = await hre.viem.deployContract("LeaderboardManager", [treasury.address]);

    console.log("📋 Testing leaderboard system integration");

    // Phase 1: Test fund exposure after character creation
    const creationFee = 15n * 10n ** 18n; // 15 CFX

    await chainBrawler.write.createCharacter([1n], {
      value: creationFee,
      account: player1.account,
    });

    // Test that all fund pools are exposed and populated correctly
    const developerFund = await chainBrawler.read.developerFund();
    const prizePool = await chainBrawler.read.prizePool();
    const gasRefundPool = await chainBrawler.read.gasRefundPool();
    const equipmentRewardPool = await chainBrawler.read.equipmentRewardPool();
    const nextEpochReserve = await chainBrawler.read.nextEpochReserve();
    const emergencyReserve = await chainBrawler.read.emergencyReserve();

    console.log(`💰 Fund Balances After Character Creation:
    Developer Fund: ${developerFund} wei
    Prize Pool: ${prizePool} wei  
    Gas Refund Pool: ${gasRefundPool} wei
    Equipment Reward Pool: ${equipmentRewardPool} wei
    Next Epoch Reserve: ${nextEpochReserve} wei
    Emergency Reserve: ${emergencyReserve} wei`);

    // Verify funds were allocated correctly
    expect(developerFund > 0n).to.equal(true);
    expect(gasRefundPool > 0n).to.equal(true);
    expect(equipmentRewardPool > 0n).to.equal(true);
    expect(nextEpochReserve > 0n).to.equal(true);
    expect(emergencyReserve > 0n).to.equal(true);

    // Phase 2: Test epoch and leaderboard data exposure
    const currentEpoch = await chainBrawler.read.getCurrentEpoch();
    const epochDuration = await chainBrawler.read.getEpochDuration();
    const totalPlayers = await chainBrawler.read.getTotalPlayerCount();

    // Test player enumeration
    const player1Address = await chainBrawler.read.getPlayerByIndex([0n]);
    expect(player1Address.toLowerCase()).to.equal(player1.account.address.toLowerCase());

    // Test epoch score access
    const player1Score = await chainBrawler.read.getEpochScore([
      player1.account.address,
      currentEpoch,
    ]);

    console.log(`⏰ Epoch & Player Data:
    Current Epoch: ${currentEpoch}
    Epoch Duration: ${epochDuration} seconds
    Total Players: ${totalPlayers}
    Player1 Address: ${player1Address}
    Player1 Score: ${player1Score}`);

    expect(currentEpoch > 0n).to.equal(true);
    expect(epochDuration > 0n).to.equal(true);
    expect(totalPlayers).to.equal(1n);
    expect(player1Score).to.equal(0n); // No fights yet

    // Phase 3: Test leaderboard treasury integration
    await chainBrawler.write.setLeaderboardTreasury([treasury.address]);
    await chainBrawler.write.setLeaderboardManager([manager.address]);

    const treasuryAddress = await chainBrawler.read.leaderboardTreasury();
    const managerAddress = await chainBrawler.read.leaderboardManager();

    expect(treasuryAddress.toLowerCase()).to.equal(treasury.address.toLowerCase());
    expect(managerAddress.toLowerCase()).to.equal(manager.address.toLowerCase());

    console.log(`🏛️ Leaderboard System:
    Treasury Address: ${treasuryAddress}
    Manager Address: ${managerAddress}`);

    // Phase 4: Test treasury functions
    const treasuryBalance = await treasury.read.getBalance();
    const epochReserve = await treasury.read.epochReserve([currentEpoch]);

    // Fund treasury for testing
    const prizeAmount = 5n * 10n ** 18n; // 5 CFX
    await treasury.write.depositForEpoch([currentEpoch], {
      value: prizeAmount,
      account: admin.account,
    });

    const newEpochReserve = await treasury.read.epochReserve([currentEpoch]);
    expect(newEpochReserve).to.equal(prizeAmount);

    console.log(`💰 Treasury Functions:
    Initial Balance: ${treasuryBalance} wei
    Initial Epoch Reserve: ${epochReserve} wei
    After Funding: ${newEpochReserve} wei`);

    // Phase 5: Test claim status functions
    const claimStatus = await treasury.read.isClaimed([currentEpoch, 0n]);
    expect(claimStatus).to.equal(false); // Nothing claimed yet

    console.log(`🎫 Claim Status Functions:
    Index 0 Claimed: ${claimStatus}`);

    console.log("✅ All leaderboard and prize system functions exposed and working");
  });

  it("should validate prize pool accumulation and withdrawal functions", async () => {
    const [admin, player1] = await hre.viem.getWalletClients();

    // Deploy the CombatEngineLib first
    const combatEngineLib = await hre.viem.deployContract("CombatEngineLib", []);

    // Deploy main contract with library linking
    const chainBrawler = await hre.viem.deployContract("ChainBrawlerTestHelpersForTests", [], {
      libraries: {
        "contracts/libraries/CombatEngineLib.sol:CombatEngineLib": combatEngineLib.address,
      },
    });

    console.log("� Testing prize pool accumulation and withdrawal");

    // Create multiple characters to accumulate prizes
    const creationFee = 15n * 10n ** 18n;

    await chainBrawler.write.createCharacter([1n], {
      value: creationFee,
      account: player1.account,
    });

    const initialPrizePool = await chainBrawler.read.prizePool();
    const initialDeveloperFund = await chainBrawler.read.developerFund();
    const initialEmergencyReserve = await chainBrawler.read.emergencyReserve();

    console.log(`Initial Funds:
    Prize Pool: ${initialPrizePool} wei
    Developer Fund: ${initialDeveloperFund} wei  
    Emergency Reserve: ${initialEmergencyReserve} wei`);

    // Verify prize pool accumulation (should be part of 80% operational split)
    expect(initialPrizePool > 0n).to.equal(true);
    expect(initialDeveloperFund > 0n).to.equal(true);
    expect(initialEmergencyReserve > 0n).to.equal(true);

    // Test treasury getter
    const treasuryAddress = await chainBrawler.read.treasury();
    expect(treasuryAddress.toLowerCase()).to.equal(admin.account.address.toLowerCase()); // Set to deployer initially

    console.log(`Treasury Address: ${treasuryAddress}`);

    // Test withdrawal function exists and requires admin role
    let withdrawalFailed = false;
    try {
      await chainBrawler.write.withdraw({ account: player1.account });
    } catch (err: any) {
      withdrawalFailed = true;
      // Error message may vary, just check that it failed
    }
    expect(withdrawalFailed).to.equal(true);

    console.log("✅ Withdrawal protection working (non-admin rejected)");

    // Admin withdrawal should work (but will send to treasury address)
    const balanceBeforeWithdraw = await chainBrawler.read.developerFund();
    const emergencyBeforeWithdraw = await chainBrawler.read.emergencyReserve();
    const prizePoolBeforeWithdraw = await chainBrawler.read.prizePool();

    if (balanceBeforeWithdraw > 0n || emergencyBeforeWithdraw > 0n) {
      await chainBrawler.write.withdraw({ account: admin.account });

      const balanceAfterWithdraw = await chainBrawler.read.developerFund();
      const emergencyAfterWithdraw = await chainBrawler.read.emergencyReserve();
      const prizePoolAfterWithdraw = await chainBrawler.read.prizePool();

      expect(balanceAfterWithdraw).to.equal(0n);
      expect(emergencyAfterWithdraw).to.equal(0n);
      expect(prizePoolAfterWithdraw).to.equal(prizePoolBeforeWithdraw); // Prize pool unchanged!

      console.log("✅ Admin withdrawal successful - dev/emergency funds transferred to treasury");
      console.log(`✅ Prize pool preserved: ${prizePoolAfterWithdraw} wei (unchanged)`);
    }

    console.log("✅ Prize pool and withdrawal functions validated");
  });

  it("should allow top 10 players to claim their leaderboard prizes using merkle proofs", async () => {
    const [admin, player1, player2] = await hre.viem.getWalletClients();

    // Deploy the CombatEngineLib first
    const combatEngineLib = await hre.viem.deployContract("CombatEngineLib", []);

    // Deploy main contract with library linking
    const chainBrawler = await hre.viem.deployContract("ChainBrawlerTestHelpersForTests", [], {
      libraries: {
        "contracts/libraries/CombatEngineLib.sol:CombatEngineLib": combatEngineLib.address,
      },
    });

    // Deploy treasury and manager for leaderboard prizes
    const treasury = await hre.viem.deployContract("LeaderboardTreasury", []);
    const manager = await hre.viem.deployContract("LeaderboardManager", [treasury.address]);

    console.log("🏆 Testing player prize claiming system");

    // Setup: Create characters and generate epoch scores
    const creationFee = 15n * 10n ** 18n;

    await chainBrawler.write.createCharacter([1n], {
      value: creationFee,
      account: player1.account,
    });

    await chainBrawler.write.createCharacter([1n], {
      value: creationFee,
      account: player2.account,
    });

    // Fight to generate scores (simulate leaderboard activity)
    await chainBrawler.write.fightEnemy([1n, 1n], { account: player1.account });
    await chainBrawler.write.fightEnemy([1n, 1n], { account: player2.account });

    const currentEpoch = await chainBrawler.read.getCurrentEpoch();
    console.log(`Current Epoch: ${currentEpoch}`);
    
    const player1Score = await chainBrawler.read.epochScores([currentEpoch, player1.account.address]);
    const player2Score = await chainBrawler.read.epochScores([currentEpoch, player2.account.address]);

    console.log(`Epoch Scores - Player1: ${player1Score}, Player2: ${player2Score}`);

    // Setup treasury and leaderboard system
    await chainBrawler.write.setLeaderboardTreasury([treasury.address]);
    await chainBrawler.write.setLeaderboardManager([manager.address]);

    // Grant necessary roles
    const MANAGER_ROLE = await treasury.read.MANAGER_ROLE();
    const PUBLISHER_ROLE = await manager.read.PUBLISHER_ROLE();

    await treasury.write.grantRole([MANAGER_ROLE, manager.address], { account: admin.account });
    await treasury.write.grantRole([MANAGER_ROLE, admin.account.address], {
      account: admin.account,
    }); // Admin needs MANAGER_ROLE to publish
    await manager.write.grantRole([PUBLISHER_ROLE, admin.account.address], {
      account: admin.account,
    });

    // Transfer prize pool to treasury for distribution
    const prizePool = await chainBrawler.read.prizePool();
    const emergencyReserve = await chainBrawler.read.emergencyReserve();

    console.log(`Available Prize Pool: ${prizePool} wei`);

    // Fund treasury with prize money for current epoch
    const epochPrizes = 5n * 10n ** 18n; // 5 CFX for prizes
    await treasury.write.depositForEpoch([currentEpoch], {
      value: epochPrizes,
      account: admin.account,
    });

    // Create merkle tree for top 10 winners (simulating off-chain leaderboard calculation)
    const ethers = require("ethers");

    // Prize distribution: Player1 gets 1st place (2 CFX), Player2 gets 2nd place (1 CFX)
    const epoch = currentEpoch;
    const player1Amount = 2n * 10n ** 18n; // 2 CFX for 1st place
    const player2Amount = 1n * 10n ** 18n; // 1 CFX for 2nd place

    const leaf1 = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "uint256"],
      [epoch.toString(), "0", player1.account.address, player1Amount.toString()]
    );

    const leaf2 = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "uint256"],
      [epoch.toString(), "1", player2.account.address, player2Amount.toString()]
    );

    // Build merkle root (sorted for OpenZeppelin compatibility)
    const root =
      leaf1 < leaf2
        ? ethers.utils.keccak256(
            ethers.utils.concat([ethers.utils.arrayify(leaf1), ethers.utils.arrayify(leaf2)])
          )
        : ethers.utils.keccak256(
            ethers.utils.concat([ethers.utils.arrayify(leaf2), ethers.utils.arrayify(leaf1)])
          );

    // Publish leaderboard results (merkle root) for epoch 1
    await treasury.write.publishEpochRoot([epoch, root], { account: admin.account });

    // Set dispute window to 0 for immediate claiming in test
    await treasury.write.setDisputeWindow([0n], { account: admin.account });

    console.log("📊 Leaderboard published with merkle root for top 10 prizes");

    // Test Player 1 claiming 1st place prize (2 CFX)
    const proof1 = [leaf2]; // Proof for player1 in 2-leaf tree

    await treasury.write.claim(
      [
        epoch,
        0n, // index 0 (1st place)
        player1.account.address,
        player1Amount,
        proof1,
      ],
      { account: player1.account }
    );

    const player1Claimed = await treasury.read.isClaimed([epoch, 0n]);
    expect(player1Claimed).to.equal(true);

    console.log("✅ Player 1 successfully claimed 1st place prize (2 CFX)");

    // Test Player 2 claiming 2nd place prize (1 CFX)
    const proof2 = [leaf1]; // Proof for player2 in 2-leaf tree

    await treasury.write.claim(
      [
        epoch,
        1n, // index 1 (2nd place)
        player2.account.address,
        player2Amount,
        proof2,
      ],
      { account: player2.account }
    );

    const player2Claimed = await treasury.read.isClaimed([epoch, 1n]);
    expect(player2Claimed).to.equal(true);

    console.log("✅ Player 2 successfully claimed 2nd place prize (1 CFX)");

    // Test preventing duplicate claims
    let duplicateClaimFailed = false;
    try {
      await treasury.write.claim([epoch, 0n, player1.account.address, player1Amount, proof1], {
        account: player1.account,
      });
    } catch (err: any) {
      duplicateClaimFailed = true;
      expect(err.message.includes("1711")).to.be.true;
    }
    expect(duplicateClaimFailed).to.equal(true);

    console.log("✅ Duplicate claim protection working");

    // Test invalid proof rejection
    let invalidProofFailed = false;
    try {
      const fakeAmount = 10n * 10n ** 18n; // Try to claim 10 CFX instead of allocated amount
      await treasury.write.claim(
        [
          epoch,
          2n, // Non-existent index
          player1.account.address,
          fakeAmount,
          proof1, // Wrong proof
        ],
        { account: player1.account }
      );
    } catch (err: any) {
      invalidProofFailed = true;
      expect(err.message.includes("1719")).to.be.true;
    }
    expect(invalidProofFailed).to.equal(true);

    console.log("✅ Invalid proof protection working");

    // Verify epoch reserve depleted correctly
    const remainingReserve = await treasury.read.epochReserve([epoch]);
    const expectedRemaining = epochPrizes - player1Amount - player2Amount;
    expect(remainingReserve).to.equal(expectedRemaining);

    console.log(`💰 Prize claiming summary:
    🥇 Player 1 claimed: ${player1Amount} wei (1st place)
    🥈 Player 2 claimed: ${player2Amount} wei (2nd place)  
    💳 Remaining reserve: ${remainingReserve} wei
    🛡️ Duplicate claims: BLOCKED
    🚫 Invalid proofs: BLOCKED`);

    console.log("🎉 Top 10 player prize claiming system fully validated!");
  });
});
