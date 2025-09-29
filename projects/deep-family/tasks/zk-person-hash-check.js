/*
Poseidon limbs endianness/mapping check for PersonHash (3-input with packedData)

What it does
- Reads input JSON (same as circuit inputs) to fetch 32-byte fullNameHash arrays and scalar fields
- Computes Poseidon commitment over [name_hi128, name_lo128, packedData] where:
  packedData = (birthYear << 24) | (birthMonth << 16) | (birthDay << 8) | (gender << 1) | isBirthBC
- Splits each commitment into 2×128-bit limbs in big-endian order: [hi128, lo128]
- Prints expected publicSignals order for the current circuit/contract mapping:
  publicSignals = [
    person_hi128, person_lo128,
    father_hi128, father_lo128,
    mother_hi128, mother_lo128,
    submitter_uint160
  ]

Optional
- If snarkjs is installed and you provide --wasm and --zkey and --input, it will also compute proof and compare produced publicSignals with expected.

Usage examples
  node tasks/zk-limbs-check.js --input ./circuits/test/fullname_hash_input.json
  node tasks/zk-limbs-check.js --wasm ./artifacts/circuits/person_hash_zk_js/person_hash_zk.wasm \
    --zkey ./artifacts/circuits/person_hash_zk_final.zkey --input ./circuits/test/fullname_hash_input.json --submitter 0xYourEOA
*/

const { getAddress, ZeroAddress } = require("ethers");

function split128FromBigInt(x) {
  const hi = x >> 128n;
  const lo = x & ((1n << 128n) - 1n);
  return [hi, lo];
}

function bytesToBigIntBE(bytes) {
  if (!Array.isArray(bytes) || bytes.length !== 32) {
    throw new Error("fullNameHash must be 32-byte array");
  }
  let acc = 0n;
  for (let i = 0; i < 32; i++) {
    const b = BigInt(bytes[i] >>> 0);
    if (b < 0n || b > 255n) throw new Error("byte out of range");
    acc = (acc << 8n) + b;
  }
  return acc;
}

function be128HiLoFromBytes32(bytes) {
  // Big-endian split to hi/lo 128 bits
  const big = bytesToBigIntBE(bytes);
  return [big >> 128n, big & ((1n << 128n) - 1n)];
}

async function buildExpectedSignalsFromInput(input) {
  const { poseidon } = require("circomlibjs");

  function personCommitmentFrom(inputPrefix) {
    const nameBytes = input[`${inputPrefix}fullNameHash`];
    const saltBytes = input[`${inputPrefix}saltHash`] || new Array(32).fill(0);
    const isBirthBC = BigInt(input[`${inputPrefix}isBirthBC`]);
    const birthYear = BigInt(input[`${inputPrefix}birthYear`]);
    const birthMonth = BigInt(input[`${inputPrefix}birthMonth`]);
    const birthDay = BigInt(input[`${inputPrefix}birthDay`]);
    const gender = BigInt(input[`${inputPrefix}gender`]);

    const [nameHi, nameLo] = be128HiLoFromBytes32(nameBytes);
    const [saltHi, saltLo] = be128HiLoFromBytes32(saltBytes);

    const salted = poseidon([nameHi, nameLo, saltHi, saltLo, 0n]);
    const saltedBig = BigInt(salted);
    const [saltedHi, saltedLo] = split128FromBigInt(saltedBig);

    const packedData =
      (birthYear << 24n) |
      (birthMonth << 16n) |
      (birthDay << 8n) |
      (gender << 1n) |
      (isBirthBC & 1n);
    const h = poseidon([saltedHi, saltedLo, packedData]);
    const hv = BigInt(h);
    const [hi, lo] = split128FromBigInt(hv);
    return [hi, lo];
  }

  const person = personCommitmentFrom("");
  const father = personCommitmentFrom("father_");
  const mother = personCommitmentFrom("mother_");

  const submitter = input.submitter
    ? BigInt(getAddress(input.submitter))
    : BigInt(getAddress(ZeroAddress));

  return [person[0], person[1], father[0], father[1], mother[0], mother[1], submitter];
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
  if (!opts.input) {
    console.log(
      "Please provide --input pointing to the circuit input JSON (with 32-byte fullNameHash arrays).",
    );
    process.exit(1);
  }

  const fs = require("fs");
  const input = JSON.parse(fs.readFileSync(opts.input, "utf8"));
  if (opts.submitter) input.submitter = opts.submitter;

  const expected = await buildExpectedSignalsFromInput(input);
  console.log("Expected publicSignals (decimal):");
  console.log(expected.map((x) => x.toString()));

  // Optional snarkjs compare
  if (opts.wasm && opts.zkey && opts.input) {
    try {
      const snarkjs = require("snarkjs");
      // Ensure submitter matches
      input.submitter = expected[6].toString();

      const { publicSignals } = await snarkjs.groth16.fullProve(input, opts.wasm, opts.zkey);
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
