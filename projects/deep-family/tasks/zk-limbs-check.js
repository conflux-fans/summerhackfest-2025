/*
Minimal limbs endianness/mapping check for PersonHashWithKeccak circuit and DeepFamily.addPersonZK

What it does
- Computes person/father/mother hashes from basic info following Solidity getPersonHash rules
- Splits each bytes32 into 2×128-bit limbs in big-endian order: [hi128, lo128]
- Prints expected publicSignals order for the current circuit/contract mapping:
  publicSignals = [
    person_hi128, person_lo128,
    father_hi128, father_lo128,
    mother_hi128, mother_lo128,
    submitter_uint160
  ]

Optional
- If snarkjs is installed and you provide --wasm and --zkey and --input, it will also try to compute proof and compare produced publicSignals with expected.

Usage examples
  node tasks/zk-limbs-check.js
  node tasks/zk-limbs-check.js --submitter 0xYourEOA
  node tasks/zk-limbs-check.js --wasm ./artifacts/circuits/person_hash_keccak_js/person_hash_keccak.wasm \
    --zkey ./artifacts/circuits/person_hash_keccak_final.zkey --input ./tmp/input.json --submitter 0xYourEOA
*/

const { keccak256, toUtf8Bytes, getAddress, ZeroAddress } = require("ethers");

function solidityPackedKeccak(types, values) {
  // Lazy import to support ethers v6 API
  const { solidityPacked } = require("ethers");
  return keccak256(solidityPacked(types, values));
}

function split128BE(hashHex) {
  const h = hashHex.toLowerCase();
  if (!h.startsWith("0x") || h.length !== 66) {
    throw new Error(`Invalid bytes32 hex: ${hashHex}`);
  }
  const hiHex = "0x" + h.slice(2, 34);
  const loHex = "0x" + h.slice(34);
  return [BigInt(hiHex), BigInt(loHex)];
}

function getPersonHashJS(basic) {
  const nameBytes = toUtf8Bytes(basic.fullName);
  const nameLen = nameBytes.length;
  if (nameLen === 0 || nameLen > 256) throw new Error("fullName length must be 1..256");
  if (basic.birthMonth > 12) throw new Error("birthMonth <= 12");
  if (basic.birthDay > 31) throw new Error("birthDay <= 31");

  // abi.encodePacked(uint16(len), bytes(name), uint8(isBC), uint16(year), uint8(m), uint8(d), uint8(g))
  const hashHex = solidityPackedKeccak(
    ["uint16", "bytes", "uint8", "uint16", "uint8", "uint8", "uint8"],
    [
      nameLen,
      nameBytes,
      basic.isBirthBC ? 1 : 0,
      basic.birthYear,
      basic.birthMonth,
      basic.birthDay,
      basic.gender,
    ],
  );
  return hashHex;
}

function buildExpectedSignals(person, father, mother, submitter) {
  const p = split128BE(getPersonHashJS(person));
  const f = split128BE(getPersonHashJS(father));
  const m = split128BE(getPersonHashJS(mother));
  const s = BigInt(getAddress(submitter)); // address → 160-bit value in lower bits
  return [p[0], p[1], f[0], f[1], m[0], m[1], s];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const k = args[i];
    const v = args[i + 1];
    if (k === "--wasm") out.wasm = v;
    if (k === "--zkey") out.zkey = v;
    if (k === "--input") out.input = v;
    if (k === "--submitter") out.submitter = v;
  }
  return out;
}

async function main() {
  const opts = parseArgs();
  const submitter = opts.submitter || ZeroAddress; // default 0x000..00

  // Fixed sample data (you can adjust)
  const person = {
    fullName: "Alice",
    isBirthBC: false,
    birthYear: 1990,
    birthMonth: 12,
    birthDay: 31,
    gender: 1,
  };
  const father = {
    fullName: "Bob",
    isBirthBC: false,
    birthYear: 1960,
    birthMonth: 6,
    birthDay: 15,
    gender: 1,
  };
  const mother = {
    fullName: "Carol",
    isBirthBC: false,
    birthYear: 1962,
    birthMonth: 7,
    birthDay: 20,
    gender: 2,
  };

  const expected = buildExpectedSignals(person, father, mother, submitter);
  console.log("Expected publicSignals (decimal):");
  console.log(expected.map((x) => x.toString()));

  // Optional snarkjs compare
  if (opts.wasm && opts.zkey && opts.input) {
    try {
      const snarkjs = require("snarkjs");
      const fs = require("fs");

      const input = JSON.parse(fs.readFileSync(opts.input, "utf8"));
      // Ensure submitter matches
      input.submitter = expected[6].toString();

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, opts.wasm, opts.zkey);
      console.log("Circuit publicSignals (decimal):", publicSignals);

      const ok =
        publicSignals.length === expected.length &&
        publicSignals.every((v, i) => BigInt(v) === expected[i]);
      console.log("Match:", ok);
      if (!ok) process.exitCode = 1;
    } catch (e) {
      console.warn("snarkjs compare skipped:", e.message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
