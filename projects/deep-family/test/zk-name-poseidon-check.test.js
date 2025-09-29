const { expect } = require("chai");
const path = require("path");

const {
  normaliseBytes32Array,
  validatePoseidonInput,
  computeExpectedSignals,
  comparePublicSignals,
  parseArgs,
  loadPublicSignals,
  loadJson,
} = require("../tasks/zk-name-poseidon-check.js");

describe("zk-name-poseidon-check helpers", function () {
  describe("normaliseBytes32Array", function () {
    it("accepts numeric arrays", function () {
      const bytes = Array(32).fill(0).map((_, i) => i);
      const normalised = normaliseBytes32Array(bytes, "fullNameHash");
      expect(normalised).to.deep.equal(bytes);
    });

    it("accepts string arrays", function () {
      const bytes = Array(32).fill("1");
      const normalised = normaliseBytes32Array(bytes, "saltHash");
      expect(normalised).to.deep.equal(Array(32).fill(1));
    });

    it("rejects invalid entries", function () {
      const bytes = Array(32).fill(0);
      bytes[5] = 999;
      expect(() => normaliseBytes32Array(bytes, "saltHash")).to.throw(/saltHash\[5\]/);
    });
  });

  describe("validatePoseidonInput", function () {
    it("normalises the expected shape", function () {
      const raw = {
        fullNameHash: Array(32).fill("2"),
        saltHash: Array(32).fill(3),
      };
      const validated = validatePoseidonInput(raw);
      expect(validated.fullNameHash[0]).to.equal(2);
      expect(validated.saltHash[0]).to.equal(3);
    });

    it("rejects malformed objects", function () {
      expect(() => validatePoseidonInput(null)).to.throw(/Input JSON/);
      expect(() => validatePoseidonInput({})).to.throw(/fullNameHash/);
    });
  });

  describe("computeExpectedSignals", function () {
    it("matches fixture public signals", async function () {
      const inputPath = path.join(__dirname, "../test_proof/name_poseidon_input.json");
      const publicPath = path.join(
        __dirname,
        "../test_proof/name_poseidon_public.json",
      );

      const input = validatePoseidonInput(loadJson(inputPath));
      const expected = await computeExpectedSignals(input);
      const fixture = loadPublicSignals(publicPath);

      expect(expected).to.deep.equal(fixture);
    });
  });

  describe("comparePublicSignals", function () {
    it("detects mismatches", function () {
      const { match, mismatches } = comparePublicSignals(["1", "2"], ["1", "3"]);
      expect(match).to.equal(false);
      expect(mismatches).to.deep.equal([
        { index: 1, expected: "2", actual: "3" },
      ]);
    });
  });

  describe("parseArgs", function () {
    it("parses supported CLI flags", function () {
      const parsed = parseArgs([
        "--input",
        "input.json",
        "--public",
        "public.json",
        "--wasm",
        "a.wasm",
        "--zkey",
        "b.zkey",
        "--prove",
      ]);

      expect(parsed).to.deep.equal({
        prove: true,
        help: false,
        input: "input.json",
        public: "public.json",
        wasm: "a.wasm",
        zkey: "b.zkey",
      });
    });

    it("throws on unknown flags", function () {
      expect(() => parseArgs(["--unknown"])).to.throw(/Unknown argument/);
    });
  });

  describe("loadPublicSignals", function () {
    it("supports plain arrays and object wrappers", function () {
      const arrayPath = path.join(__dirname, "../tmp_public_array.json");
      const objectPath = path.join(__dirname, "../tmp_public_object.json");

      const fs = require("fs");
      fs.writeFileSync(arrayPath, JSON.stringify(["1", "2"]));
      fs.writeFileSync(objectPath, JSON.stringify({ publicSignals: [1, 2] }));

      try {
        expect(loadPublicSignals(arrayPath)).to.deep.equal(["1", "2"]);
        expect(loadPublicSignals(objectPath)).to.deep.equal(["1", "2"]);
      } finally {
        fs.unlinkSync(arrayPath);
        fs.unlinkSync(objectPath);
      }
    });
  });
});
