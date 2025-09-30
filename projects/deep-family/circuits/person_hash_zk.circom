// person_hash_zk.circom
// Production version using fullNameHash (32 bytes) - solves variable length problem completely
pragma circom 2.1.6;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/mux1.circom";
include "lib/keccak256.circom";

// Convert uint16 to big-endian bytes
template Uint16ToBytes() {
    signal input v;
    signal output b0; // High byte
    signal output b1; // Low byte
    
    component bits = Num2Bits(16);
    bits.in <== v;
    
    b1 <== bits.out[0] + bits.out[1]*2 + bits.out[2]*4 + bits.out[3]*8 +
           bits.out[4]*16 + bits.out[5]*32 + bits.out[6]*64 + bits.out[7]*128;
    b0 <== bits.out[8] + bits.out[9]*2 + bits.out[10]*4 + bits.out[11]*8 +
           bits.out[12]*16 + bits.out[13]*32 + bits.out[14]*64 + bits.out[15]*128;
}

// Convert 32-byte hash to 2 128-bit limbs
template HashToLimbs() {
    signal input hashBytes[32];
    signal output limb0;
    signal output limb1;
    
    component byteCheck[32];
    for (var i = 0; i < 32; i++) {
        byteCheck[i] = Num2Bits(8);
        byteCheck[i].in <== hashBytes[i];
    }
    
    // High 128 bits
    signal acc0[17];
    acc0[0] <== 0;
    for (var i = 0; i < 16; i++) {
        acc0[i+1] <== acc0[i] * 256 + hashBytes[i];
    }
    limb0 <== acc0[16];
    
    // Low 128 bits
    signal acc1[17];
    acc1[0] <== 0;
    for (var j = 0; j < 16; j++) {
        acc1[j+1] <== acc1[j] * 256 + hashBytes[16 + j];
    }
    limb1 <== acc1[16];
}

// Fixed-length PersonHasher using fullNameHash (32 bytes)
template PersonHasher() {
    signal input fullNameHash[32];  // 32-byte hash of the full name
    signal input isBirthBC;
    signal input birthYear;
    signal input birthMonth;
    signal input birthDay;
    signal input gender;
    
    signal output hashBytes[32];
    
    // Constraint checks
    component birthMonthCheck = LessEqThan(8); // 8 bits can handle values up to 255
    birthMonthCheck.in[0] <== birthMonth;
    birthMonthCheck.in[1] <== 12;
    birthMonthCheck.out === 1;
    
    component birthDayCheck = LessEqThan(8); // 8 bits can handle values up to 255
    birthDayCheck.in[0] <== birthDay;
    birthDayCheck.in[1] <== 31;
    birthDayCheck.out === 1;
    
    component bcBit = Num2Bits(1);
    bcBit.in <== isBirthBC;
    
    // Validate all fullNameHash bytes
    component hashByteCheck[32];
    for (var i = 0; i < 32; i++) {
        hashByteCheck[i] = Num2Bits(8);
        hashByteCheck[i].in <== fullNameHash[i];
    }
    
    component yearToBytes = Uint16ToBytes();
    yearToBytes.v <== birthYear;
    
    // Construct preimage: fullNameHash[32] + uint8(isBirthBC) + uint16(birthYear) + uint8(birthMonth) + uint8(birthDay) + uint8(gender)
    // Total length: 32 + 1 + 2 + 1 + 1 + 1 = 38 bytes
    
    component keccak = SimpleKeccak(38);
    
    // fullNameHash (32 bytes)
    for (var i = 0; i < 32; i++) {
        keccak.in[i] <== fullNameHash[i];
    }
    
    // Other fields (6 bytes)
    keccak.in[32] <== isBirthBC;
    keccak.in[33] <== yearToBytes.b0;     // birthYear high byte
    keccak.in[34] <== yearToBytes.b1;     // birthYear low byte
    keccak.in[35] <== birthMonth;
    keccak.in[36] <== birthDay;
    keccak.in[37] <== gender;
    
    for (var i = 0; i < 32; i++) {
        hashBytes[i] <== keccak.out[i];
    }
}

// Main test circuit
template PersonHashTest() {
    // Person to be added
    signal input fullNameHash[32];
    signal input isBirthBC;
    signal input birthYear;
    signal input birthMonth;
    signal input birthDay;
    signal input gender;
    
    // Father
    signal input father_fullNameHash[32];
    signal input father_isBirthBC;
    signal input father_birthYear;
    signal input father_birthMonth;
    signal input father_birthDay;
    signal input father_gender;
    
    // Mother
    signal input mother_fullNameHash[32];
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
    
    // Calculate hash of person to be added
    component personHasher = PersonHasher();
    for (var i = 0; i < 32; i++) {
        personHasher.fullNameHash[i] <== fullNameHash[i];
    }
    personHasher.isBirthBC <== isBirthBC;
    personHasher.birthYear <== birthYear;
    personHasher.birthMonth <== birthMonth;
    personHasher.birthDay <== birthDay;
    personHasher.gender <== gender;
    
    // Calculate father hash using PersonHasher
    component fatherHasher = PersonHasher();
    for (var i = 0; i < 32; i++) {
        fatherHasher.fullNameHash[i] <== father_fullNameHash[i];
    }
    fatherHasher.isBirthBC <== father_isBirthBC;
    fatherHasher.birthYear <== father_birthYear;
    fatherHasher.birthMonth <== father_birthMonth;
    fatherHasher.birthDay <== father_birthDay;
    fatherHasher.gender <== father_gender;
    
    // Calculate mother hash using PersonHasher
    component motherHasher = PersonHasher();
    for (var i = 0; i < 32; i++) {
        motherHasher.fullNameHash[i] <== mother_fullNameHash[i];
    }
    motherHasher.isBirthBC <== mother_isBirthBC;
    motherHasher.birthYear <== mother_birthYear;
    motherHasher.birthMonth <== mother_birthMonth;
    motherHasher.birthDay <== mother_birthDay;
    motherHasher.gender <== mother_gender;
    
    // Convert to limbs
    component personLimbs = HashToLimbs();
    component fatherLimbs = HashToLimbs();
    component motherLimbs = HashToLimbs();
    
    for (var i = 0; i < 32; i++) {
        personLimbs.hashBytes[i] <== personHasher.hashBytes[i];
        fatherLimbs.hashBytes[i] <== fatherHasher.hashBytes[i];
        motherLimbs.hashBytes[i] <== motherHasher.hashBytes[i];
    }
    
    // Validate parent existence flags are 0 or 1
    component fatherBitCheck = Num2Bits(1);
    component motherBitCheck = Num2Bits(1);
    fatherBitCheck.in <== hasFather;
    motherBitCheck.in <== hasMother;
    
    // Use Mux1 to conditionally output parent hashes
    component fatherSelect0 = Mux1();
    component fatherSelect1 = Mux1();
    component motherSelect0 = Mux1();
    component motherSelect1 = Mux1();
    
    fatherSelect0.c[0] <== 0;  // Output 0 if father doesn't exist
    fatherSelect0.c[1] <== fatherLimbs.limb0;  // Output computed hash if father exists
    fatherSelect0.s <== hasFather;
    
    fatherSelect1.c[0] <== 0;
    fatherSelect1.c[1] <== fatherLimbs.limb1;
    fatherSelect1.s <== hasFather;
    
    motherSelect0.c[0] <== 0;  // Output 0 if mother doesn't exist
    motherSelect0.c[1] <== motherLimbs.limb0;  // Output computed hash if mother exists
    motherSelect0.s <== hasMother;
    
    motherSelect1.c[0] <== 0;
    motherSelect1.c[1] <== motherLimbs.limb1;
    motherSelect1.s <== hasMother;
    
    // Final outputs
    person_limb0 <== personLimbs.limb0;
    person_limb1 <== personLimbs.limb1;
    father_limb0 <== fatherSelect0.out;
    father_limb1 <== fatherSelect1.out;
    mother_limb0 <== motherSelect0.out;
    mother_limb1 <== motherSelect1.out;
    submitter_out <== submitter;
}

component main = PersonHashTest();