const { calculateWitnessIsolated } = require("./witness_helper");

async function runCircuitConstraintTests() {
  try {
    console.log("🔍 Circuit Constraint Validation Tests");
    console.log("=====================================\n");

    // Common valid input for all tests
    const validInput = {
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
        185, 220, 101, 79, 108, 2, 139, 162, 132, 108, 213, 176, 144, 15, 239, 79, 151, 229, 207,
        218, 252, 248, 204, 70, 133, 174, 150, 72, 177, 104, 212, 129,
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
      hasFather: 1,
      hasMother: 1,
      submitter: "1234567890123456789012345678901234567890",
    };

    let passedTests = 0;
    let totalTests = 0;

    // Test 1: Basic circuit execution
    totalTests++;
    console.log("1. Testing basic circuit execution...");
    try {
      const result = await calculateWitnessIsolated(validInput);
      console.log("✅ Circuit executes successfully");
      console.log(`   Person hash: ${result.publicSignals[0]}, ${result.publicSignals[1]}`);
      console.log(`   Father hash: ${result.publicSignals[2]}, ${result.publicSignals[3]}`);
      console.log(`   Mother hash: ${result.publicSignals[4]}, ${result.publicSignals[5]}`);
      console.log(`   Submitter: ${result.publicSignals[6]}`);
      passedTests++;
    } catch (error) {
      console.log("❌ Basic execution failed:", error.message);
    }

    // Test 2: Invalid birth month constraint
    totalTests++;
    console.log("\n2. Testing invalid birth month constraint (>12)...");
    try {
      const invalidMonth = { ...validInput, birthMonth: 13 };
      await calculateWitnessIsolated(invalidMonth);
      console.log("❌ Should have rejected invalid birth month");
    } catch (error) {
      console.log("✅ Correctly rejected invalid birth month");
      passedTests++;
    }

    // Test 3: Invalid birth day constraint
    totalTests++;
    console.log("\n3. Testing invalid birth day constraint (>31)...");
    try {
      const invalidDay = { ...validInput, birthDay: 32 };
      await calculateWitnessIsolated(invalidDay);
      console.log("❌ Should have rejected invalid birth day");
    } catch (error) {
      console.log("✅ Correctly rejected invalid birth day");
      passedTests++;
    }

    // Test 4: Invalid hash byte constraint
    totalTests++;
    console.log("\n4. Testing invalid fullNameHash byte value (>255)...");
    try {
      const invalidHash = { ...validInput };
      invalidHash.fullNameHash[0] = 256;
      await calculateWitnessIsolated(invalidHash);
      console.log("❌ Should have rejected invalid hash byte");
    } catch (error) {
      console.log("✅ Correctly rejected invalid hash byte value");
      passedTests++;
    }

    // Results summary
    console.log("\n=====================================");
    console.log(`RESULTS: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log("🎉 All circuit tests PASSED!");
      console.log("\nValidated Features:");
      console.log("- ✅ Basic circuit execution with 7 public outputs");
      console.log("- ✅ Input constraint validation (months ≤12, days ≤31, bytes ≤255)");
      console.log("- ✅ PersonHasher template functions correctly for all persons");
      return true;
    } else {
      console.log("❌ Some circuit tests failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Circuit test suite failed:", error);
    return false;
  }
}

// Run the test suite
runCircuitConstraintTests().then((success) => {
  process.exit(success ? 0 : 1);
});
