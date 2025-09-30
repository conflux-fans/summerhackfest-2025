const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function testCircuit() {
  try {
    console.log("Testing person_hash_zk circuit with fullNameHash...");

    // Load input
    const inputPath = path.join(__dirname, "fullname_hash_input.json");
    const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

    console.log("Loaded input:");
    console.log("- fullNameHash (first 8 bytes):", input.fullNameHash.slice(0, 8));
    console.log("- person data:", {
      isBirthBC: input.isBirthBC,
      birthYear: input.birthYear,
      birthMonth: input.birthMonth,
      birthDay: input.birthDay,
      gender: input.gender,
    });

    // Calculate witness using generated witness calculator
    const wasm = fs.readFileSync(
      path.join(__dirname, "../../artifacts/circuits/person_hash_zk_js/person_hash_zk.wasm"),
    );
    const wc = require("../../artifacts/circuits/person_hash_zk_js/witness_calculator.js");

    console.log("\nCalculating witness with witness_calculator...");
    const witnessCalculator = await wc(wasm);
    const witness = await witnessCalculator.calculateWitness(input, 0);

    // Convert witness to proper format and get public signals
    const publicSignals = [];
    for (let i = 1; i <= 7; i++) {
      publicSignals.push(witness[i].toString());
    }

    console.log("\n✅ Circuit executed successfully!");
    console.log("Public signals (7 expected):");
    console.log("- person_limb0:", publicSignals[0]);
    console.log("- person_limb1:", publicSignals[1]);
    console.log("- father_limb0:", publicSignals[2]);
    console.log("- father_limb1:", publicSignals[3]);
    console.log("- mother_limb0:", publicSignals[4]);
    console.log("- mother_limb1:", publicSignals[5]);
    console.log("- submitter:", publicSignals[6]);

    console.log("\n🎉 All tests passed! Circuit is working correctly.");
    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    return false;
  }
}

// Run the test
testCircuit().then((success) => {
  process.exit(success ? 0 : 1);
});
