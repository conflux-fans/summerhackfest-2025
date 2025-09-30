import { expect } from "chai";
import hre from "hardhat";

describe("LeaderboardManager publishAndFund", function () {
  this.timeout(20000);

  it("funds treasury and publishes root", async () => {
    const [admin, publisher] = await hre.viem.getWalletClients();

    const treasury = await hre.viem.deployContract("LeaderboardTreasury", []);
    const t = treasury as any;

    const treasuryAddr = (treasury as any).target || (treasury as any).address;
    const manager = await hre.viem.deployContract("LeaderboardManager", [treasuryAddr]);
    const m = manager as any;

    // Grant roles: publisher on manager, manager role on treasury
    const PUBLISHER_ROLE = await m.read.PUBLISHER_ROLE();
    await m.write.grantRole([PUBLISHER_ROLE, publisher.account.address], {
      account: admin.account,
    });
    const MANAGER_ROLE = await t.read.MANAGER_ROLE();
    const managerAddr = (manager as any).target || (manager as any).address;
    await t.write.grantRole([MANAGER_ROLE, managerAddr], { account: admin.account });

    // Call publishAndFund with 0.5 CFX
    const fund = 500000000000000000n;
    const dummyRoot = "0x" + "22".repeat(32);
    await m.write.publishAndFund([dummyRoot, 1n], { value: fund, account: publisher.account });

    // Verify treasury balance and root stored
    const bal = await t.read.getBalance();
    expect(bal).to.equal(fund);
    const root = await t.read.epochRoot([1n]);
    expect(root).to.equal(dummyRoot);
  });
});
