const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function isolatedTest() {
  console.log("🔍 Testing circuit state isolation...");

  const baseInput = {
    fullNameHash: [
      27, 77, 65, 183, 140, 87, 191, 241, 252, 146, 63, 223, 38, 102, 117, 91, 194, 250, 225, 142,
      187, 73, 222, 222, 173, 64, 222, 91, 131, 137, 29, 123,
    ],
    isBirthBC: 0,
    birthYear: 1990,
    birthMonth: 12,
    birthDay: 25,
    gender: 2,
    father_fullNameHash: [
      185, 220, 101, 79, 108, 2, 139, 162, 132, 108, 213, 176, 144, 15, 239, 79, 151, 229, 207, 218,
      252, 248, 204, 70, 133, 174, 150, 72, 177, 104, 212, 129,
    ],
    father_isBirthBC: 0,
    father_birthYear: 1960,
    father_birthMonth: 5,
    father_birthDay: 15,
    father_gender: 1,
    mother_fullNameHash: [
      183, 107, 74, 178, 128, 112, 44, 205, 102, 207, 94, 144, 61, 132, 86, 88, 218, 165, 32, 123,
      15, 165, 129, 79, 218, 152, 129, 210, 167, 49, 102, 169,
    ],
    mother_isBirthBC: 0,
    mother_birthYear: 1965,
    mother_birthMonth: 8,
    mother_birthDay: 20,
    mother_gender: 2,
    submitter: "1234567890123456789012345678901234567890",
  };

  try {
    console.log("Testing single calculation...");
    const result1 = await testInputIsolated(baseInput);
    console.log("✅ First calculation successful");
    console.log(`Person hash: ${result1.publicSignals[0]}, ${result1.publicSignals[1]}`);

    console.log("\nTesting determinism with fresh witness calculator instance...");
    const result2 = await testInputIsolated(baseInput);
    console.log("✅ Second calculation successful");
    console.log(`Person hash: ${result2.publicSignals[0]}, ${result2.publicSignals[1]}`);

    // Check if results are identical
    let identical = true;
    for (let i = 0; i < 7; i++) {
      if (result1.publicSignals[i] !== result2.publicSignals[i]) {
        identical = false;
        console.log(
          `Difference at index ${i}: ${result1.publicSignals[i]} vs ${result2.publicSignals[i]}`,
        );
      }
    }

    if (identical) {
      console.log("🎉 Circuit is deterministic - same inputs produce same outputs");
    } else {
      console.log("❌ Circuit is non-deterministic - same inputs produce different outputs");
    }

    return identical;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

async function testInputIsolated(input) {
  // Create fresh witness calculator instance for each test
  const wasm = fs.readFileSync(
    path.join(__dirname, "../../artifacts/circuits/person_hash_zk_js/person_hash_zk.wasm"),
  );
  const wc = require("../../artifacts/circuits/person_hash_zk_js/witness_calculator.js");

  const witnessCalculator = await wc(wasm);
  const witness = await witnessCalculator.calculateWitness(input, 0);

  const publicSignals = [];
  for (let i = 1; i <= 7; i++) {
    publicSignals.push(witness[i].toString());
  }

  return { witness, publicSignals };
}

// Run test
isolatedTest().then((success) => {
  console.log(success ? "\n🎉 All isolation tests passed!" : "\n❌ Isolation tests failed!");
  process.exit(success ? 0 : 1);
});
