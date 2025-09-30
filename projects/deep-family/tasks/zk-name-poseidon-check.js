/*
Name Poseidon binding checker for NamePoseidonBinding circuit

Features:
- Loads an input JSON containing 32-byte arrays for fullNameHash and saltHash
- Computes Poseidon(fullNameHi, fullNameLo, saltHi, saltLo, 0)
- Prints the expected publicSignals order used by the circuit
- Optionally reads an existing publicSignals JSON to compare results
- Optionally generates a fresh proof (snarkjs groth16.fullProve) using
  discovered or user-supplied wasm/zkey artifacts

Usage examples:
  node tasks/zk-name-poseidon-check.js --input test_proof/name_poseidon_input.json
  node tasks/zk-name-poseidon-check.js --input test_proof/name_poseidon_input.json \
    --public test_proof/name_poseidon_public.json
  node tasks/zk-name-poseidon-check.js --input ./input.json --prove \
    --wasm ./circuits/name_poseidon_zk_js/name_poseidon_zk.wasm \
    --zkey ./circuits/name_poseidon_0001.zkey
*/

const fs = require("fs");
const path = require("path");

const {
  formatBytePreview,
  resolveExistingFile,
  DEFAULT_WASM_CANDIDATES,
  DEFAULT_ZKEY_CANDIDATES,
} = require("./zk-generate-name-poseidon-proof.js");

function split128FromBigInt(value) {
  const hi = value >> 128n;
  const lo = value & ((1n << 128n) - 1n);
  return { hi, lo };
}

function normaliseBytes32Array(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array of length 32`);
  }

  if (value.length !== 32) {
    throw new Error(`${label} must contain exactly 32 elements`);
  }

  return value.map((item, index) => {
    const numeric = typeof item === "string" ? Number(item) : item;
    if (!Number.isInteger(numeric) || numeric < 0 || numeric > 255) {
      throw new Error(`${label}[${index}] must be an integer in [0, 255], received ${item}`);
    }
    return numeric;
  });
}

function bytes32ToBigInt(bytes) {
  return bytes.reduce((acc, byte) => (acc << 8n) + BigInt(byte), 0n);
}

function bytes32ToLimbs(bytes) {
  const bigIntValue = bytes32ToBigInt(bytes);
  return split128FromBigInt(bigIntValue);
}

function validatePoseidonInput(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Input JSON must be an object with fullNameHash and saltHash fields");
  }

  const fullNameHash = normaliseBytes32Array(raw.fullNameHash, "fullNameHash");
  const saltHash = normaliseBytes32Array(raw.saltHash, "saltHash");

  return { fullNameHash, saltHash };
}

async function computeExpectedSignalsFromHashes(fullNameHash, saltHash) {
  const { poseidon } = require("circomlibjs");

  const nameLimbs = bytes32ToLimbs(fullNameHash);
  const saltLimbs = bytes32ToLimbs(saltHash);

  const poseidonDigest = poseidon([nameLimbs.hi, nameLimbs.lo, saltLimbs.hi, saltLimbs.lo, 0n]);

  const poseidonLimbs = split128FromBigInt(poseidonDigest);

  return [
    poseidonLimbs.hi.toString(),
    poseidonLimbs.lo.toString(),
    nameLimbs.hi.toString(),
    nameLimbs.lo.toString(),
  ];
}

async function computeExpectedSignals(input) {
  return computeExpectedSignalsFromHashes(input.fullNameHash, input.saltHash);
}

function loadJson(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

function parseArgs(rawArgs) {
  const args = {
    prove: false,
    help: false,
  };

  for (let i = 0; i < rawArgs.length; i++) {
    const current = rawArgs[i];
    switch (current) {
      case "--input":
        args.input = rawArgs[++i];
        break;
      case "--public":
        args.public = rawArgs[++i];
        break;
      case "--wasm":
        args.wasm = rawArgs[++i];
        break;
      case "--zkey":
        args.zkey = rawArgs[++i];
        break;
      case "--prove":
        args.prove = true;
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${current}`);
    }
  }

  return args;
}

function formatSignalsForLog(label, signals) {
  console.log(label);
  console.log(`  poseidonHi: ${signals[0]}`);
  console.log(`  poseidonLo: ${signals[1]}`);
  console.log(`  nameHashHi: ${signals[2]}`);
  console.log(`  nameHashLo: ${signals[3]}`);
}

function comparePublicSignals(expected, actual) {
  const result = {
    match: true,
    mismatches: [],
  };

  const maxLength = Math.max(expected.length, actual.length);
  for (let i = 0; i < maxLength; i++) {
    const expectedVal = expected[i]?.toString();
    const actualVal = actual[i]?.toString();

    if (expectedVal !== actualVal) {
      result.match = false;
      result.mismatches.push({ index: i, expected: expectedVal, actual: actualVal });
    }
  }

  return result;
}

function loadPublicSignals(filePath) {
  const raw = loadJson(filePath);
  if (Array.isArray(raw)) {
    return raw.map((x) => x.toString());
  }
  if (raw && Array.isArray(raw.publicSignals)) {
    return raw.publicSignals.map((x) => x.toString());
  }
  throw new Error("Public signals file must be an array or { publicSignals: [...] }");
}

function printUsage() {
  console.log(
    `Usage: node tasks/zk-name-poseidon-check.js --input <input.json> [options]\n\nOptions:\n  --public <file>    Compare against an existing publicSignals JSON\n  --prove            Generate a fresh proof using snarkjs (requires wasm/zkey)\n  --wasm <file>      Override path to Poseidon circuit wasm\n  --zkey <file>      Override path to Poseidon circuit zkey\n  -h, --help         Show this help message`,
  );
}

async function maybeGenerateProof(args, input) {
  if (!args.prove) {
    return null;
  }

  const wasmPath = resolveExistingFile("Poseidon circuit wasm", args.wasm, DEFAULT_WASM_CANDIDATES);
  const zkeyPath = resolveExistingFile("Poseidon circuit zkey", args.zkey, DEFAULT_ZKEY_CANDIDATES);

  console.log("\n🔄 Generating proof via snarkjs...");
  console.log("  wasm:", wasmPath);
  console.log("  zkey:", zkeyPath);

  const snarkjs = require("snarkjs");
  const { publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
  return publicSignals.map((x) => x.toString());
}

async function runCli(rawArgs = process.argv.slice(2)) {
  try {
    const args = parseArgs(rawArgs);

    if (args.help) {
      printUsage();
      return;
    }

    if (!args.input) {
      printUsage();
      throw new Error("--input <file> is required");
    }

    const inputJson = loadJson(args.input);
    const validInput = validatePoseidonInput(inputJson);

    console.log("🔍 Name Poseidon input summary:");
    console.log("  fullNameHash bytes:", formatBytePreview(validInput.fullNameHash));
    console.log("  saltHash bytes:", formatBytePreview(validInput.saltHash));

    const expected = await computeExpectedSignals(validInput);

    console.log("\n✅ Expected public signals:");
    formatSignalsForLog("", expected);
    console.log("  Array format:", JSON.stringify(expected));

    if (args.public) {
      const provided = loadPublicSignals(args.public);
      console.log("\n📄 Comparing with provided public signals file...");
      const comparison = comparePublicSignals(expected, provided);
      if (comparison.match) {
        console.log("  ✅ All signals match");
      } else {
        console.log("  ❌ Differences detected:");
        for (const mismatch of comparison.mismatches) {
          console.log(
            `    [${mismatch.index}] expected=${mismatch.expected} actual=${mismatch.actual}`,
          );
        }
        throw new Error("Provided publicSignals do not match expected values");
      }
    }

    const generated = await maybeGenerateProof(args, validInput);
    if (generated) {
      console.log("\n🧾 Public signals from generated proof:");
      formatSignalsForLog("", generated);
      const comparison = comparePublicSignals(expected, generated);
      if (comparison.match) {
        console.log("  ✅ Generated proof matches expected values");
      } else {
        console.log("  ❌ Generated proof differs:");
        for (const mismatch of comparison.mismatches) {
          console.log(
            `    [${mismatch.index}] expected=${mismatch.expected} actual=${mismatch.actual}`,
          );
        }
        throw new Error("Generated proof publicSignals do not match expected values");
      }
    }
  } catch (error) {
    console.error("\nError:", error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  split128FromBigInt,
  normaliseBytes32Array,
  bytes32ToBigInt,
  bytes32ToLimbs,
  validatePoseidonInput,
  computeExpectedSignalsFromHashes,
  computeExpectedSignals,
  loadJson,
  parseArgs,
  comparePublicSignals,
  loadPublicSignals,
  runCli,
};
