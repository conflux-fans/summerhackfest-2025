// person_hash_zk.circom
// Production version using fullNameHash (32 bytes) - solves variable length problem completely
pragma circom 2.1.6;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";


// Convert 32-byte hash to 2 128-bit limbs (secure)
template HashToLimbs() {
    signal input hashBytes[32];
    signal output limb0;
    signal output limb1;

    // Constrain each byte to 8-bit range to prevent commitment breaking attacks
    component byteCheck[32];
    for (var i = 0; i < 32; i++) {
        byteCheck[i] = Num2Bits(8);
        byteCheck[i].in <== hashBytes[i];
    }

    // Build limbs directly from validated byte bits (reuse byteCheck results)
    component limb0Bits = Bits2Num(128);
    component limb1Bits = Bits2Num(128);

    // High 128 bits (bytes 0-15) - match contract: simple big-endian
    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 8; j++) {
            limb0Bits.in[127 - (i * 8 + j)] <== byteCheck[i].out[7 - j];
        }
    }
    limb0 <== limb0Bits.out;

    // Low 128 bits (bytes 16-31) - match contract: simple big-endian
    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 8; j++) {
            limb1Bits.in[127 - (i * 8 + j)] <== byteCheck[16 + i].out[7 - j];
        }
    }
    limb1 <== limb1Bits.out;
}

// Fixed-length PersonHasher using fullNameHash (32 bytes)
template PersonHasher() {
    signal input fullNameHash[32];  // 32-byte keccak256 hash of the full name
    signal input saltHash[32];      // 32-byte keccak256 hash of the passphrase-derived salt
    signal input isBirthBC;
    signal input birthYear;
    signal input birthMonth;
    signal input birthDay;
    signal input gender;
    
    signal output limb0; // high 128 bits of Poseidon(out)
    signal output limb1; // low 128 bits of Poseidon(out)
    
    // Constraint checks
    // Birth year constrained to 16 bits (0-65535) to prevent packing overflow
    component birthYearCheck = Num2Bits(16);
    birthYearCheck.in <== birthYear;

    // Month: Must be 0-12 (using LessEqThan with 4 bits)
    component birthMonthCheck = LessEqThan(4);  // 4 bits sufficient for comparing with 12
    birthMonthCheck.in[0] <== birthMonth;
    birthMonthCheck.in[1] <== 12;
    birthMonthCheck.out === 1;

    // Day: 5 bits allows exactly 0-31
    component birthDayCheck = Num2Bits(5);
    birthDayCheck.in <== birthDay;
    
    // Validate binary and range constraints
    component bcBit = Num2Bits(1);
    bcBit.in <== isBirthBC;

    // Gender constrained to 3 bits (0-7)
    component genderCheck = Num2Bits(3);
    genderCheck.in <== gender;
    
    // Convert fullNameHash bytes to two 128-bit field limbs (also validates bytes)
    component nameLimbs = HashToLimbs();
    for (var i = 0; i < 32; i++) {
        nameLimbs.hashBytes[i] <== fullNameHash[i];
    }

    component saltLimbs = HashToLimbs();
    for (var i = 0; i < 32; i++) {
        saltLimbs.hashBytes[i] <== saltHash[i];
    }

    component fullNamePoseidon = Poseidon(5);
    fullNamePoseidon.inputs[0] <== nameLimbs.limb0;
    fullNamePoseidon.inputs[1] <== nameLimbs.limb1;
    fullNamePoseidon.inputs[2] <== saltLimbs.limb0;
    fullNamePoseidon.inputs[3] <== saltLimbs.limb1;
    fullNamePoseidon.inputs[4] <== 0; // Domain separator slot

    component poseidonNameBits = Num2Bits(256);
    poseidonNameBits.in <== fullNamePoseidon.out;

    component poseidonNameLow = Bits2Num(128);
    for (var i = 0; i < 128; i++) {
        poseidonNameLow.in[i] <== poseidonNameBits.out[i];
    }

    component poseidonNameHigh = Bits2Num(128);
    for (var i = 0; i < 128; i++) {
        poseidonNameHigh.in[i] <== poseidonNameBits.out[128 + i];
    }

    // Pack small fields into single field element (saves 4 Poseidon inputs)
    // Format: birthYear * 2^24 + birthMonth * 2^16 + birthDay * 2^8 + gender * 2^1 + isBirthBC
    signal packedData <== birthYear * 16777216 + birthMonth * 65536 + birthDay * 256 + gender * 2 + isBirthBC;

    // Poseidon commitment over SNARK-friendly field elements (reduced from 7 to 3 inputs)
    component poseidon = Poseidon(3);
    poseidon.inputs[0] <== poseidonNameHigh.out; // high 128 bits of salted name Poseidon digest
    poseidon.inputs[1] <== poseidonNameLow.out; // low 128 bits of salted name Poseidon digest
    poseidon.inputs[2] <== packedData;

    // Split Poseidon output into two 128-bit limbs for public signals
    component outBits = Num2Bits(256);
    outBits.in <== poseidon.out;

    component lowNum = Bits2Num(128);
    for (var k = 0; k < 128; k++) {
        lowNum.in[k] <== outBits.out[k]; // LSB first
    }

    component highNum = Bits2Num(128);
    for (var k = 0; k < 128; k++) {
        highNum.in[k] <== outBits.out[128 + k];
    }

    limb0 <== highNum.out;
    limb1 <== lowNum.out;
}

// Main test circuit
template PersonHashTest() {
    // Person to be added
    signal input fullNameHash[32];
    signal input saltHash[32];
    signal input isBirthBC;
    signal input birthYear;
    signal input birthMonth;
    signal input birthDay;
    signal input gender;
    
    // Father
    signal input father_fullNameHash[32];
    signal input father_saltHash[32];
    signal input father_isBirthBC;
    signal input father_birthYear;
    signal input father_birthMonth;
    signal input father_birthDay;
    signal input father_gender;
    
    // Mother
    signal input mother_fullNameHash[32];
    signal input mother_saltHash[32];
    signal input mother_isBirthBC;
    signal input mother_birthYear;
    signal input mother_birthMonth;
    signal input mother_birthDay;
    signal input mother_gender;
    
    // Parent existence flags
    signal input hasFather;
    signal input hasMother;
    
    // Submitter
    signal input submitter;
    
    // Outputs
    signal output person_limb0;
    signal output person_limb1;
    signal output father_limb0;
    signal output father_limb1;
    signal output mother_limb0;
    signal output mother_limb1;
    signal output submitter_out;
    
    // Calculate commitment of person to be added
    component personHasher = PersonHasher();
    for (var i = 0; i < 32; i++) {
        personHasher.fullNameHash[i] <== fullNameHash[i];
        personHasher.saltHash[i] <== saltHash[i];
    }
    personHasher.isBirthBC <== isBirthBC;
    personHasher.birthYear <== birthYear;
    personHasher.birthMonth <== birthMonth;
    personHasher.birthDay <== birthDay;
    personHasher.gender <== gender;
    
    // Calculate father commitment using PersonHasher
    component fatherHasher = PersonHasher();
    for (var j = 0; j < 32; j++) {
        fatherHasher.fullNameHash[j] <== father_fullNameHash[j];
        fatherHasher.saltHash[j] <== father_saltHash[j];
    }
    fatherHasher.isBirthBC <== father_isBirthBC;
    fatherHasher.birthYear <== father_birthYear;
    fatherHasher.birthMonth <== father_birthMonth;
    fatherHasher.birthDay <== father_birthDay;
    fatherHasher.gender <== father_gender;
    
    // Calculate mother commitment using PersonHasher
    component motherHasher = PersonHasher();
    for (var t = 0; t < 32; t++) {
        motherHasher.fullNameHash[t] <== mother_fullNameHash[t];
        motherHasher.saltHash[t] <== mother_saltHash[t];
    }
    motherHasher.isBirthBC <== mother_isBirthBC;
    motherHasher.birthYear <== mother_birthYear;
    motherHasher.birthMonth <== mother_birthMonth;
    motherHasher.birthDay <== mother_birthDay;
    motherHasher.gender <== mother_gender;
    
    // Validate parent existence flags are 0 or 1
    component fatherBitCheck = Num2Bits(1);
    component motherBitCheck = Num2Bits(1);
    fatherBitCheck.in <== hasFather;
    motherBitCheck.in <== hasMother;
    
    // Use arithmetic constraints for conditional parent output (more efficient than Mux1)
    // If hasFather = 1, output fatherHasher limbs; if hasFather = 0, output 0
    signal father_limb0_selected <== hasFather * fatherHasher.limb0;
    signal father_limb1_selected <== hasFather * fatherHasher.limb1;

    // If hasMother = 1, output motherHasher limbs; if hasMother = 0, output 0
    signal mother_limb0_selected <== hasMother * motherHasher.limb0;
    signal mother_limb1_selected <== hasMother * motherHasher.limb1;

    // Final outputs
    person_limb0 <== personHasher.limb0;
    person_limb1 <== personHasher.limb1;
    father_limb0 <== father_limb0_selected;
    father_limb1 <== father_limb1_selected;
    mother_limb0 <== mother_limb0_selected;
    mother_limb1 <== mother_limb1_selected;
    submitter_out <== submitter;
}

component main = PersonHashTest();
