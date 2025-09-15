import { expect } from "chai";
import hre from "hardhat";
import { keccak256 } from "ethers/lib/utils";

// Helper to compute leaf same as contract: keccak256(abi.encodePacked(epoch, index, account, amount))
function leafHash(epoch: bigint, index: bigint, account: string, amount: bigint) {
  // Use simple concatenation compatible with keccak256(abi.encodePacked(...)) from solidity.
  // We'll construct the packed encoding as hex concatenation: epoch(32) + index(32) + account(20) + amount(32)
  const ethers = require("ethers");
  const abi = ethers.utils.defaultAbiCoder;
  // abi.encodePacked isn't directly available; use solidityKeccak256 helper
  return ethers.utils.solidityKeccak256(
    ["uint256", "uint256", "address", "uint256"],
    [epoch.toString(), index.toString(), account, amount.toString()]
  );
}

describe("LeaderboardTreasury Merkle claim flow", function () {
  this.timeout(20000);

  it("publishes a root, allows valid claim, rejects invalid or duplicate claims", async () => {
    const [admin, manager, player1] = await hre.viem.getWalletClients();

    const treasury = await hre.viem.deployContract("LeaderboardTreasury", []);
    const t = treasury as any;

    // Fund treasury for epoch 1 with 1 CFX (use depositForEpoch)
    const depositAmount = 1n * 10n ** 18n;
    await t.write.depositForEpoch([1n], { value: depositAmount, account: admin.account });

    // Grant MANAGER_ROLE to manager
    const MANAGER_ROLE = await t.read.MANAGER_ROLE();
    await t.write.grantRole([MANAGER_ROLE, manager.account.address], { account: admin.account });

    // Prepare a tiny merkle tree with two leaves (player1 index 0)
    // For simplicity build tree off-chain using ethers utilities
    const ethers = require("ethers");
    const amt1 = 100000000000000000n; // 0.1 CFX
    const leaf1 = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "uint256"],
      [1, 0, player1.account.address, amt1.toString()]
    );
    const leaf2 = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "uint256"],
      [1, 1, manager.account.address, 200000000000000000n.toString()]
    );
    // Use sorted-pair hashing (lexicographic) to match OpenZeppelin MerkleProof style
    const a = leaf1;
    const b = leaf2;
    const root =
      a < b
        ? ethers.utils.keccak256(
            ethers.utils.concat([ethers.utils.arrayify(a), ethers.utils.arrayify(b)])
          )
        : ethers.utils.keccak256(
            ethers.utils.concat([ethers.utils.arrayify(b), ethers.utils.arrayify(a)])
          );

    // Publish root for epoch 1
    await t.write.publishEpochRoot([1n, root], { account: manager.account });

    // Set dispute window to 0 to allow immediate claims in test
    await t.write.setDisputeWindow([0n], { account: admin.account });

    // Build proof for leaf1: for 2-leaf tree proof is [leaf2]
    const proof = [leaf2];

    // Valid claim should succeed
    await t.write.claim([1n, 0n, player1.account.address, amt1, proof], {
      account: player1.account,
    });

    // Duplicate claim should fail (already claimed)
    let threw = false;
    try {
      await t.write.claim([1n, 0n, player1.account.address, amt1, proof], {
        account: player1.account,
      });
    } catch (e: any) {
      threw = true;
    }
    expect(threw).to.equal(true);

    // Invalid proof should fail for another index
    let threwInvalid = false;
    try {
      await t.write.claim([1n, 2n, player1.account.address, amt1, proof], {
        account: player1.account,
      });
    } catch (e: any) {
      threwInvalid = true;
    }
    expect(threwInvalid).to.equal(true);
  });
});
