import { expect } from "chai";
import hre from "hardhat";

describe("Mixed flow: atomic leaderboard payout + merkle refund epoch", function () {
  this.timeout(40000);

  it("performs atomic leaderboard payout and publishes a merkle refund epoch then processes claims", async () => {
    const [admin, publisher, player1, player2, player3] = await hre.viem.getWalletClients();

    // Deploy treasury and manager
    const treasury = await hre.viem.deployContract("LeaderboardTreasury", []);
    const t = treasury as any;
    const treasuryAddr = (treasury as any).target || (treasury as any).address;
    const manager = await hre.viem.deployContract("LeaderboardManager", [treasuryAddr]);
    const m = manager as any;

    // Grant roles
    const PUBLISHER_ROLE = await m.read.PUBLISHER_ROLE();
    await m.write.grantRole([PUBLISHER_ROLE, publisher.account.address], {
      account: admin.account,
    });
    const MANAGER_ROLE = await t.read.MANAGER_ROLE();
    const managerAddr = (manager as any).target || (manager as any).address;
    await t.write.grantRole([MANAGER_ROLE, managerAddr], { account: admin.account });

    // Fund treasury with 2 CFX
    const fund = 2n * 10n ** 18n;
    await t.write.deposit([], { value: fund, account: admin.account });

    // Atomic leaderboard payout to player1 & player2 (0.4 + 0.3 CFX)
    const winners = [player1.account.address, player2.account.address];
    const amounts = [400000000000000000n, 300000000000000000n];
    const dummyRoot = "0x" + "aa".repeat(32);
    await m.write.publishAndDistribute([dummyRoot, 1n, winners, amounts], {
      account: publisher.account,
    });

    // Treasury balance reduced accordingly
    const afterAtomic = await t.read.getBalance();
    expect(afterAtomic).to.equal(fund - (amounts[0] + amounts[1]));

    // Now prepare a merkle-based refund epoch (epoch 2) with 3 entries
    const ethers = require("ethers");
    const amt1 = 100000000000000000n; // 0.1 CFX to player1 (index 0)
    const amt2 = 50000000000000000n; // 0.05 CFX to player2 (index 1)
    const amt3 = 200000000000000000n; // 0.2 CFX to player3 (index 2)

    const leaf1 = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "uint256"],
      [2, 0, player1.account.address, amt1.toString()]
    );
    const leaf2 = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "uint256"],
      [2, 1, player2.account.address, amt2.toString()]
    );
    const leaf3 = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "uint256"],
      [2, 2, player3.account.address, amt3.toString()]
    );

    // buildTree helper (same logic as SDK helper): non-sorted pair concatenation, promote odd
    function buildTree(leaves: string[]) {
      const layers: string[][] = [];
      layers.push(leaves.slice());
      while (layers[layers.length - 1].length > 1) {
        const prev = layers[layers.length - 1];
        const next: string[] = [];
        for (let i = 0; i < prev.length; i += 2) {
          if (i + 1 === prev.length) {
            next.push(prev[i]);
          } else {
            const a = prev[i];
            const b = prev[i + 1];
            const aBytes = ethers.utils.arrayify(a);
            const bBytes = ethers.utils.arrayify(b);
            const combined =
              a < b
                ? ethers.utils.keccak256(ethers.utils.concat([aBytes, bBytes]))
                : ethers.utils.keccak256(ethers.utils.concat([bBytes, aBytes]));
            next.push(combined);
          }
        }
        layers.push(next);
      }
      const root = layers[layers.length - 1][0];

      // proofs per leaf
      const proofs = leaves.map((_, idx) => {
        const proof: string[] = [];
        let index = idx;
        for (let level = 0; level < layers.length - 1; level++) {
          const l = layers[level];
          const pair = index ^ 1;
          if (pair < l.length) proof.push(l[pair]);
          index = Math.floor(index / 2);
        }
        return proof;
      });

      return { root, proofs };
    }

    const leaves = [leaf1, leaf2, leaf3];
    const { root, proofs } = buildTree(leaves);

    // Publisher calls publishAndFund to fund epoch 2 with sum(amounts)
    const totalRefund = amt1 + amt2 + amt3;
    await m.write.publishAndFund([root, 2n], { value: totalRefund, account: publisher.account });

    // Set dispute window to 0 to allow immediate claims
    await t.write.setDisputeWindow([0n], { account: admin.account });

    // Claims using generated proofs
    await t.write.claim([2n, 0n, player1.account.address, amt1, proofs[0]], {
      account: player1.account,
    });
    await t.write.claim([2n, 1n, player2.account.address, amt2, proofs[1]], {
      account: player2.account,
    });
    await t.write.claim([2n, 2n, player3.account.address, amt3, proofs[2]], {
      account: player3.account,
    });

    // After publishAndFund (which adds totalRefund) and then claims (which remove it),
    // the treasury balance should equal the balance after the atomic payout step (afterAtomic).
    const finalBal = await t.read.getBalance();
    expect(finalBal).to.equal(afterAtomic);

    // Duplicate claim attempt for player1 should fail
    let threw = false;
    try {
      await t.write.claim([2n, 0n, player1.account.address, amt1, proofs[0]], {
        account: player1.account,
      });
    } catch (e: any) {
      threw = true;
    }
    expect(threw).to.equal(true);
  });
});
