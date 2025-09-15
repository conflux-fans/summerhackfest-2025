// Helper script for isolated witness calculation
const fs = require("fs");
const path = require("path");

async function calculateWitnessIsolated(inputData) {
  try {
    const wasm = fs.readFileSync(
      path.join(__dirname, "../../artifacts/circuits/person_hash_zk_js/person_hash_zk.wasm"),
    );
    const wc = require("../../artifacts/circuits/person_hash_zk_js/witness_calculator.js");

    const witnessCalculator = await wc(wasm);
    const witness = await witnessCalculator.calculateWitness(inputData, 0);

    const publicSignals = [];
    for (let i = 1; i <= 7; i++) {
      publicSignals.push(witness[i].toString());
    }

    console.log(JSON.stringify({ success: true, publicSignals }));
  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  }
}

// If called directly (from child process)
if (require.main === module) {
  const inputData = JSON.parse(process.argv[2]);
  calculateWitnessIsolated(inputData);
}

module.exports = { calculateWitnessIsolated };
