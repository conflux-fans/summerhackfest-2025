pragma circom 2.1.6;

include "circomlib/circuits/bitify.circom";
include "keccak256-circom/circuits/keccak.circom";

// Simplified fixed-size Keccak wrapper
template SimpleKeccak(nBytes) {
    signal input in[nBytes];   // Input byte array (0..255)
    signal output out[32];     // Output 32-byte hash
    
    // Convert bytes to bits
    component byte2bits[nBytes];
    for (var i = 0; i < nBytes; i++) {
        byte2bits[i] = Num2Bits(8);
        byte2bits[i].in <== in[i];
    }
    
    // Call Keccak
    component keccak = Keccak(nBytes * 8, 256);
    for (var i = 0; i < nBytes; i++) {
        for (var j = 0; j < 8; j++) {
            keccak.in[i * 8 + j] <== byte2bits[i].out[j];
        }
    }
    
    // Convert bits back to bytes
    component bits2byte[32];
    for (var i = 0; i < 32; i++) {
        bits2byte[i] = Bits2Num(8);
        for (var j = 0; j < 8; j++) {
            bits2byte[i].in[j] <== keccak.out[i * 8 + j];
        }
        out[i] <== bits2byte[i].out;
    }
}