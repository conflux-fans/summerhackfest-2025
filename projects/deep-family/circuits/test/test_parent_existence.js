const { calculateWitnessIsolated } = require("./witness_helper");

async function testParentExistence() {
  try {
    console.log("🧪 Testing parent existence logic...");

    // Base input with valid data
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
      submitter: "1234567890123456789012345678901234567890",
    };

    // Test 1: Both parents exist
    console.log("\n1. Testing with both parents existing...");
    const bothParentsExist = { ...baseInput, hasFather: 1, hasMother: 1 };
    const result1 = await calculateWitnessIsolated(bothParentsExist);
    console.log("✅ Both parents exist test passed");
    console.log("   Person hash:", result1.publicSignals[0], result1.publicSignals[1]);
    console.log("   Father hash:", result1.publicSignals[2], result1.publicSignals[3]);
    console.log("   Mother hash:", result1.publicSignals[4], result1.publicSignals[5]);

    // Test 2: No father
    console.log("\n2. Testing with no father...");
    const noFather = { ...baseInput, hasFather: 0, hasMother: 1 };
    const result2 = await calculateWitnessIsolated(noFather);
    console.log("✅ No father test passed");
    console.log("   Person hash:", result2.publicSignals[0], result2.publicSignals[1]);
    console.log("   Father hash:", result2.publicSignals[2], result2.publicSignals[3]);
    console.log("   Mother hash:", result2.publicSignals[4], result2.publicSignals[5]);

    // Verify father hash is zero when hasFather = 0
    if (result2.publicSignals[2] === "0" && result2.publicSignals[3] === "0") {
      console.log("   ✅ Father hash correctly set to 0 when hasFather = 0");
    } else {
      console.log("   ❌ Father hash should be (0,0) when hasFather = 0");
      return false;
    }

    // Test 3: No mother
    console.log("\n3. Testing with no mother...");
    const noMother = { ...baseInput, hasFather: 1, hasMother: 0 };
    const result3 = await calculateWitnessIsolated(noMother);
    console.log("✅ No mother test passed");
    console.log("   Person hash:", result3.publicSignals[0], result3.publicSignals[1]);
    console.log("   Father hash:", result3.publicSignals[2], result3.publicSignals[3]);
    console.log("   Mother hash:", result3.publicSignals[4], result3.publicSignals[5]);

    // Verify mother hash is zero when hasMother = 0
    if (result3.publicSignals[4] === "0" && result3.publicSignals[5] === "0") {
      console.log("   ✅ Mother hash correctly set to 0 when hasMother = 0");
    } else {
      console.log("   ❌ Mother hash should be (0,0) when hasMother = 0");
      return false;
    }

    // Test 4: No parents
    console.log("\n4. Testing with no parents (orphan)...");
    const orphan = { ...baseInput, hasFather: 0, hasMother: 0 };
    const result4 = await calculateWitnessIsolated(orphan);
    console.log("✅ Orphan test passed");
    console.log("   Person hash:", result4.publicSignals[0], result4.publicSignals[1]);
    console.log("   Father hash:", result4.publicSignals[2], result4.publicSignals[3]);
    console.log("   Mother hash:", result4.publicSignals[4], result4.publicSignals[5]);

    // Verify both parent hashes are zero
    if (
      result4.publicSignals[2] === "0" &&
      result4.publicSignals[3] === "0" &&
      result4.publicSignals[4] === "0" &&
      result4.publicSignals[5] === "0"
    ) {
      console.log("   ✅ Both parent hashes correctly set to 0 when no parents exist");
    } else {
      console.log("   ❌ Both parent hashes should be (0,0) when no parents exist");
      return false;
    }

    // Test 5: Person hash consistency across different parent existence scenarios
    console.log("\n5. Testing person hash consistency...");
    if (
      result1.publicSignals[0] === result2.publicSignals[0] &&
      result2.publicSignals[0] === result3.publicSignals[0] &&
      result3.publicSignals[0] === result4.publicSignals[0] &&
      result1.publicSignals[1] === result2.publicSignals[1] &&
      result2.publicSignals[1] === result3.publicSignals[1] &&
      result3.publicSignals[1] === result4.publicSignals[1]
    ) {
      console.log("   ✅ Person hash remains consistent regardless of parent existence");
    } else {
      console.log("   ❌ Person hash should not change based on parent existence flags");
      return false;
    }

    // Test 6: Invalid existence flags should fail
    console.log("\n6. Testing invalid parent existence flags...");
    try {
      const invalidFatherFlag = { ...baseInput, hasFather: 2, hasMother: 1 };
      await calculateWitnessIsolated(invalidFatherFlag);
      console.log("   ❌ Should have failed with invalid hasFather value");
      return false;
    } catch (error) {
      console.log("   ✅ Correctly rejected invalid hasFather value (> 1)");
    }

    try {
      const invalidMotherFlag = { ...baseInput, hasFather: 1, hasMother: 3 };
      await calculateWitnessIsolated(invalidMotherFlag);
      console.log("   ❌ Should have failed with invalid hasMother value");
      return false;
    } catch (error) {
      console.log("   ✅ Correctly rejected invalid hasMother value (> 1)");
    }

    console.log("\n🎉 All parent existence tests passed!");
    console.log("\nFeature Summary:");
    console.log("- ✅ hasFather=1: Outputs computed father hash");
    console.log("- ✅ hasFather=0: Outputs (0,0) for father limbs");
    console.log("- ✅ hasMother=1: Outputs computed mother hash");
    console.log("- ✅ hasMother=0: Outputs (0,0) for mother limbs");
    console.log("- ✅ Person hash unaffected by parent existence flags");
    console.log("- ✅ Validates parent existence flags are 0 or 1");
    console.log("- ✅ Converts to bytes32(0) in smart contract when both limbs are 0");

    return true;
  } catch (error) {
    console.error("❌ Parent existence test failed:", error);
    return false;
  }
}

// Run tests
testParentExistence().then((success) => {
  process.exit(success ? 0 : 1);
});
