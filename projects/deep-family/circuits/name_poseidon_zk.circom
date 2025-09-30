// name_poseidon_zk.circom
// Minimal circuit to bind keccak(fullName) and keccak(passphrase) to a salted Poseidon digest used in PersonBasicInfo
pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/bitify.circom";

// Convert a 32-byte hash into two 128-bit limbs (big-endian hi|lo) while constraining each byte to 8 bits
template HashToLimbs() {
    signal input hashBytes[32];
    signal output limb0; // High 128 bits
    signal output limb1; // Low 128 bits

    component byteCheck[32];
    for (var i = 0; i < 32; i++) {
        byteCheck[i] = Num2Bits(8);
        byteCheck[i].in <== hashBytes[i];
    }

    component limb0Bits = Bits2Num(128);
    component limb1Bits = Bits2Num(128);

    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 8; j++) {
            limb0Bits.in[127 - (i * 8 + j)] <== byteCheck[i].out[7 - j];
        }
    }
    limb0 <== limb0Bits.out;

    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 8; j++) {
            limb1Bits.in[127 - (i * 8 + j)] <== byteCheck[16 + i].out[7 - j];
        }
    }
    limb1 <== limb1Bits.out;
}

// Main circuit: prove Poseidon(keccak(fullName), keccak(passphrase), domain) == fullNamePoseidon
// while exposing both the Poseidon digest and the keccak(fullName) hash as public signals.
template NamePoseidonBinding() {
    signal input fullNameHash[32]; // keccak256(fullName) bytes
    signal input saltHash[32];     // keccak256(passphrase) bytes (can be zero when passphrase omitted)

    signal output poseidonHi; // high 128 bits of Poseidon digest
    signal output poseidonLo; // low 128 bits of Poseidon digest
    signal output nameHashHi; // high 128 bits of keccak(fullName)
    signal output nameHashLo; // low 128 bits of keccak(fullName)

    component nameLimbs = HashToLimbs();
    for (var i = 0; i < 32; i++) {
        nameLimbs.hashBytes[i] <== fullNameHash[i];
    }

    component saltLimbs = HashToLimbs();
    for (var i = 0; i < 32; i++) {
        saltLimbs.hashBytes[i] <== saltHash[i];
    }

    component poseidon = Poseidon(5);
    poseidon.inputs[0] <== nameLimbs.limb0;
    poseidon.inputs[1] <== nameLimbs.limb1;
    poseidon.inputs[2] <== saltLimbs.limb0;
    poseidon.inputs[3] <== saltLimbs.limb1;
    poseidon.inputs[4] <== 0;

    component poseidonBits = Num2Bits(256);
    poseidonBits.in <== poseidon.out;

    component poseidonLowNum = Bits2Num(128);
    for (var i = 0; i < 128; i++) {
        poseidonLowNum.in[i] <== poseidonBits.out[i];
    }

    component poseidonHighNum = Bits2Num(128);
    for (var i = 0; i < 128; i++) {
        poseidonHighNum.in[i] <== poseidonBits.out[128 + i];
    }

    poseidonHi <== poseidonHighNum.out;
    poseidonLo <== poseidonLowNum.out;

    nameHashHi <== nameLimbs.limb0;
    nameHashLo <== nameLimbs.limb1;
}

component main = NamePoseidonBinding();
