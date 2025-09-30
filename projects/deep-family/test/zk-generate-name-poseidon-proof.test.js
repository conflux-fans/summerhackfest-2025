const { expect } = require("chai");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { keccak256, getBytes, toUtf8Bytes } = require("ethers");

const {
  keccakUtf8Bytes,
  zeroBytes32,
  buildNamePoseidonInput,
  resolveExistingFile,
} = require("../tasks/zk-generate-name-poseidon-proof.js");

function referenceKeccakBytes(value) {
  return Array.from(getBytes(keccak256(toUtf8Bytes(value))));
}

describe("zk-generate-name-poseidon-proof helpers", function () {
  describe("keccakUtf8Bytes", function () {
    it("returns deterministic 32-byte arrays", function () {
      const result = keccakUtf8Bytes("DeepFamily");
      expect(result).to.deep.equal(referenceKeccakBytes("DeepFamily"));
      expect(result).to.have.lengthOf(32);
      result.forEach((value) => {
        expect(Number.isInteger(value)).to.equal(true);
        expect(value).to.be.gte(0).and.to.be.lte(255);
      });
    });
  });

  describe("zeroBytes32", function () {
    it("returns defensive copies", function () {
      const first = zeroBytes32();
      expect(first.every((v) => v === 0)).to.equal(true);
      first[0] = 99;
      const second = zeroBytes32();
      expect(second[0]).to.equal(0);
    });
  });

  describe("buildNamePoseidonInput", function () {
    it("hashes the full name and zeroizes salt when passphrase omitted", function () {
      const input = buildNamePoseidonInput(" Alice Smith ", "");

      expect(input.fullNameHash).to.deep.equal(referenceKeccakBytes("Alice Smith"));
      expect(input.saltHash).to.deep.equal(zeroBytes32());
    });

    it("hashes the passphrase when provided", function () {
      const input = buildNamePoseidonInput("Alice", "hunter2");

      expect(input.saltHash).to.deep.equal(referenceKeccakBytes("hunter2"));
    });

    it("rejects empty names", function () {
      expect(() => buildNamePoseidonInput("   ", ""))
        .to.throw(/Full name must be a non-empty string/);
    });
  });

  describe("resolveExistingFile", function () {
    const tempDirs = [];

    afterEach(function () {
      while (tempDirs.length > 0) {
        const dir = tempDirs.pop();
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });

    it("prefers explicit paths", function () {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "poseidon-explicit-"));
      tempDirs.push(dir);
      const filePath = path.join(dir, "target.txt");
      fs.writeFileSync(filePath, "hello");

      const resolved = resolveExistingFile("target", filePath, []);
      expect(resolved).to.equal(filePath);
    });

    it("falls back to candidate list", function () {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "poseidon-candidate-"));
      tempDirs.push(dir);
      const filePath = path.join(dir, "candidate.txt");
      fs.writeFileSync(filePath, "hello");

      const resolved = resolveExistingFile("target", "", [filePath]);
      expect(resolved).to.equal(filePath);
    });

    it("throws when nothing is found", function () {
      expect(() => resolveExistingFile("missing", "", [])).to.throw(/Unable to locate missing/);
    });
  });
});
