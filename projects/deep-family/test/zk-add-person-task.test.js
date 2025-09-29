const { expect } = require("chai");

const {
  normalizePublicSignals,
  normalizeProof,
  addressToUint160,
} = require("../tasks/zk-add-person.js");

describe("zk-add-person task helpers", function () {
  describe("normalizePublicSignals", function () {
    it("returns bigint array when signals and submitter match", async function () {
      const sender = "0x00000000000000000000000000000000000000aa";
      const pubJson = {
        publicSignals: ["1", "2", "3", "4", "5", "6", sender],
      };

      const result = normalizePublicSignals(pubJson, sender);

      expect(result).to.have.lengthOf(7);
      result.forEach((value) => {
        expect(typeof value).to.equal("bigint");
      });
      expect(result[6]).to.equal(addressToUint160(sender));
    });

    it("throws when submitter does not match sender", async function () {
      const sender = "0x00000000000000000000000000000000000000aa";
      const pubJson = {
        publicSignals: ["1", "2", "3", "4", "5", "6", "7"],
      };

      expect(() => normalizePublicSignals(pubJson, sender)).to.throw(
        /submitter mismatch/,
      );
    });

    it("throws when limbs exceed 2^128", async function () {
      const sender = "0x00000000000000000000000000000000000000aa";
      const tooLarge = (1n << 130n).toString();
      const pubJson = {
        publicSignals: [tooLarge, "2", "3", "4", "5", "6", sender],
      };

      expect(() => normalizePublicSignals(pubJson, sender)).to.throw(
        /publicSignals\[0\] not in \[0, 2\^128\)/,
      );
    });
  });

  describe("normalizeProof", function () {
    it("supports snarkjs proof property format", async function () {
      const proofJson = {
        proof: {
          pi_a: ["0x1", "0x2"],
          pi_b: [
            ["0x3", "0x4"],
            ["0x5", "0x6"],
          ],
          pi_c: ["0x7", "0x8"],
        },
      };

      const { a, b, c } = normalizeProof(proofJson);

      expect(a).to.deep.equal([1n, 2n]);
      expect(b).to.deep.equal([
        [3n, 4n],
        [5n, 6n],
      ]);
      expect(c).to.deep.equal([7n, 8n]);
    });

    it("supports a/b/c direct format", async function () {
      const proofJson = {
        a: ["1", "2"],
        b: [
          ["3", "4"],
          ["5", "6"],
        ],
        c: ["7", "8"],
      };

      const { a, b, c } = normalizeProof(proofJson);

      expect(a).to.deep.equal([1n, 2n]);
      expect(b).to.deep.equal([
        [3n, 4n],
        [5n, 6n],
      ]);
      expect(c).to.deep.equal([7n, 8n]);
    });
  });
});
