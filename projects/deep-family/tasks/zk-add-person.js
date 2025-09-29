const { task } = require("hardhat/config");
const fs = require("fs");
const path = require("path");

// Usage:
// npx hardhat add-person-zk --proof ./proof.json --public ./public.json --father 0 --mother 0 --tag v1 --ipfs Qm...
// Notes:
// - The submitter binding requires the last publicSignals element to equal the msg.sender (signer) address as uint160.
// - Ensure your DeepFamily deployment is configured with a valid verifier address.

function toBigIntArray(arr) {
  return arr.map((x) => (typeof x === "string" ? BigInt(x) : BigInt(x)));
}

function loadJson(filePath) {
  const abs = path.resolve(process.cwd(), filePath);
  return JSON.parse(fs.readFileSync(abs, "utf8"));
}

function addressToUint160(address) {
  if (typeof address !== "string") {
    throw new Error("address must be a string");
  }

  return BigInt(address);
}

function normalizePublicSignals(pubJson, sender) {
  const rawSignals = pubJson.publicSignals || pubJson;
  const publicSignals = toBigIntArray(rawSignals);

  if (publicSignals.length !== 7) {
    throw new Error(`publicSignals length must be 7, got ${publicSignals.length}`);
  }

  const TWO_POW_128 = 1n << 128n;
  for (let i = 0; i < 6; i++) {
    if (publicSignals[i] < 0n || publicSignals[i] >= TWO_POW_128) {
      throw new Error(`publicSignals[${i}] not in [0, 2^128)`);
    }
  }

  const senderUint160 = addressToUint160(sender);
  const submitter = publicSignals[6];
  if (submitter !== senderUint160) {
    throw new Error(
      `submitter mismatch: publicSignals[6]=${submitter} expected ${senderUint160} (from ${sender})`,
    );
  }

  return publicSignals;
}

function normalizeProof(proofJson) {
  const proof = proofJson.proof || proofJson;

  if (proof.pi_a && proof.pi_b && proof.pi_c) {
    return {
      a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])],
      b: [
        [BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])],
        [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])],
      ],
      c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])],
    };
  }

  if (proof.a && proof.b && proof.c) {
    return {
      a: toBigIntArray(proof.a),
      b: [toBigIntArray(proof.b[0]), toBigIntArray(proof.b[1])],
      c: toBigIntArray(proof.c),
    };
  }

  throw new Error("Unknown proof format: expected pi_a/pi_b/pi_c or a/b/c");
}

task("add-person-zk", "Submit Groth16 proof to addPersonZK")
  .addParam("proof", "Path to proof.json from snarkjs")
  .addParam("public", "Path to public.json from snarkjs")
  .addOptionalParam("father", "Father version index", "0")
  .addOptionalParam("mother", "Mother version index", "0")
  .addParam("tag", "Version tag, e.g. v1")
  .addParam("ipfs", "Metadata IPFS CID / hash")
  .setAction(async (args, hre) => {
    const { deployments, ethers } = hre;
    const { get } = deployments;

    let deep;
    try {
      deep = await get("DeepFamily");
    } catch {
      await deployments.fixture(["Integrated"]);
      deep = await get("DeepFamily");
    }

    const deepFamily = await ethers.getContractAt("DeepFamily", deep.address);
    const [signer] = await ethers.getSigners();
    const sender = await signer.getAddress();

    const proofJson = loadJson(args.proof);
    const pubJson = loadJson(args.public);

    // snarkjs groth16 output formats can vary: ensure a,b,c arrays are in uint form
    const { a, b, c } = normalizeProof(proofJson);
    const publicSignals = normalizePublicSignals(pubJson, sender);

    console.log("Public signals breakdown:");
    console.log(
      "  Person hash (high, low):",
      publicSignals[0].toString(),
      publicSignals[1].toString(),
    );
    console.log(
      "  Father hash (high, low):",
      publicSignals[2].toString(),
      publicSignals[3].toString(),
    );
    console.log(
      "  Mother hash (high, low):",
      publicSignals[4].toString(),
      publicSignals[5].toString(),
    );
    console.log("  Submitter address:", publicSignals[6].toString());

    console.log("DeepFamily:", deep.address);
    console.log("Sender:", sender);
    console.log("Submitting addPersonZK ...");

    const tx = await deepFamily
      .connect(signer)
      .addPersonZK(
        a,
        b,
        c,
        publicSignals,
        Number(args.father),
        Number(args.mother),
        args.tag,
        args.ipfs,
      );

    console.log("Tx:", tx.hash);
    const receipt = await tx.wait();
    console.log("Mined in block:", receipt.blockNumber);

    try {
      const iface = new ethers.Interface([
        "event PersonHashZKVerified(bytes32 indexed personHash, address indexed prover)",
      ]);
      for (const log of receipt.logs || []) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === "PersonHashZKVerified") {
            console.log("ZK verified for:", parsed.args.personHash);
            break;
          }
        } catch (_) {}
      }
    } catch (_) {}
  });

module.exports = {
  toBigIntArray,
  loadJson,
  addressToUint160,
  normalizePublicSignals,
  normalizeProof,
};
