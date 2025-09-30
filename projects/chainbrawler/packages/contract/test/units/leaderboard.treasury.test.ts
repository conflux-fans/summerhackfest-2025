import { expect } from "chai";
import hre from "hardhat";

describe("LeaderboardTreasury & Manager flows (unit)", function () {
  this.timeout(20000);

  it("should deposit to treasury, publish & distribute via manager, and allow emergency withdraw", async () => {
    const [admin, publisher, player1, player2] = await hre.viem.getWalletClients();

    // Deploy treasury and manager
    const treasury = await hre.viem.deployContract("LeaderboardTreasury", []);
    const t = treasury as any;

    const treasuryAddr = (treasury as any).target || (treasury as any).address;
    const manager = await hre.viem.deployContract("LeaderboardManager", [treasuryAddr]);
    const m = manager as any;

    // Admin deposits 1 CFX into treasury
    const depositAmount = 1n * 10n ** 18n;
    await t.write.deposit([], { value: depositAmount, account: admin.account });

    // Check balance via public getter
    const bal = await t.read.getBalance();
    expect(bal).to.equal(depositAmount);

    // Grant manager roles: set manager's PUBLISHER_ROLE and give treasury MANAGER_ROLE to manager
    const PUBLISHER_ROLE = await m.read.PUBLISHER_ROLE();
    await m.write.grantRole([PUBLISHER_ROLE, publisher.account.address], {
      account: admin.account,
    });

    const MANAGER_ROLE = await t.read.MANAGER_ROLE();
    const managerAddr = (manager as any).target || (manager as any).address;
    await t.write.grantRole([MANAGER_ROLE, managerAddr], { account: admin.account });

    // Prepare winners and amounts
    const winners = [player1.account.address, player2.account.address];
    const amounts = [300000000000000000n, 200000000000000000n]; // 0.3 CFX & 0.2 CFX

    // Publisher calls publishAndDistribute on manager
    const dummyRoot = "0x" + "11".repeat(32);
    const epoch = 1n;
    await m.write.publishAndDistribute([dummyRoot, epoch, winners, amounts], {
      account: publisher.account,
    });

    // After distribution, treasury balance should reduce by sum(amounts)
    const remaining = await t.read.getBalance();
    const distributed = amounts[0] + amounts[1];
    expect(remaining).to.equal(depositAmount - distributed);

    // Test emergency withdraw: admin withdraws remaining balance to player1
    const withdrawTo = player1.account.address;
    const toWithdraw = remaining;
    await t.write.emergencyWithdraw([withdrawTo, toWithdraw], { account: admin.account });

    const finalBal = await t.read.getBalance();
    expect(finalBal).to.equal(0n);
  });
});
