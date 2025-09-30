const path = require("path");
const snarkjs = require("snarkjs");

const {
  buildNamePoseidonInput,
  resolveExistingFile,
  DEFAULT_WASM_CANDIDATES,
  DEFAULT_ZKEY_CANDIDATES,
} = require("../tasks/zk-generate-name-poseidon-proof.js");

const FRONTEND_WASM = path.join(__dirname, "../frontend/public/zk/name_poseidon_zk.wasm");
const FRONTEND_ZKEY = path.join(__dirname, "../frontend/public/zk/name_poseidon_zk_final.zkey");

const wasmCandidates = [FRONTEND_WASM, ...DEFAULT_WASM_CANDIDATES];
const zkeyCandidates = [FRONTEND_ZKEY, ...DEFAULT_ZKEY_CANDIDATES];

function normalizeProof(proof) {
  if (!proof || !proof.pi_a || !proof.pi_b || !proof.pi_c) {
    throw new Error("Invalid proof structure returned by snarkjs");
  }

  return {
    a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])],
    b: [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
    ],
    c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])],
  };
}

function normalizePublicSignals(publicSignals) {
  if (!Array.isArray(publicSignals) || publicSignals.length < 4) {
    throw new Error(
      `Name poseidon public signals length mismatch (expected >=4, got ${publicSignals?.length})`,
    );
  }

  return publicSignals.slice(0, 4).map((value) => BigInt(value));
}

async function generateNamePoseidonProof(fullName, passphrase = "", options = {}) {
  const wasmPath = resolveExistingFile(
    "Poseidon circuit wasm",
    options.wasm,
    wasmCandidates,
  );
  const zkeyPath = resolveExistingFile(
    "Poseidon circuit zkey",
    options.zkey,
    zkeyCandidates,
  );

  const input = buildNamePoseidonInput(fullName, passphrase);
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmPath,
    zkeyPath,
  );

  return {
    proof: normalizeProof(proof),
    publicSignals: normalizePublicSignals(publicSignals),
    input,
    artifacts: {
      wasm: wasmPath,
      zkey: zkeyPath,
    },
  };
}

module.exports = {
  generateNamePoseidonProof,
};
