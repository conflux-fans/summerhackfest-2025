# Zero-Knowledge Proofs in DeepFamily

## Overview

DeepFamily implements a privacy-preserving family tree system using two distinct ZK proof circuits based on Groth16. The system enables:

- **Privacy-Protected Data Submission**: Users can add family tree data via `addPersonZK()` without revealing personal information
- **Salted Passphrase Unlinkability**: Prevents identity inference and pollution attacks through user-controlled passphrases
- **Dual Tree Architecture**: Supports both public collaborative trees and private protected trees
- **Name-Binding Verification**: NFT minting requires proving ownership of full name via `mintPersonNFT()`

## Architecture

### Two ZK Verification Systems

DeepFamily employs two independent verifier contracts for different purposes:

1. **PersonHashVerifier** (circuits/person_hash_zk.circom)
   - Validates person identity and family relationships
   - Used by `addPersonZK()` function
   - 7 public signals: person/father/mother hashes (6 limbs) + submitter address

2. **NamePoseidonVerifier** (circuits/name_poseidon_zk.circom)
   - Proves knowledge of full name and salt for Poseidon commitment
   - Used by `mintPersonNFT()` function
   - 4 public signals: Poseidon digest (2 limbs) + keccak(fullName) hash (2 limbs)

### Salted Passphrase Unlinkability System

**Core Innovation**: The system uses salted passphrases to prevent identity inference and pollution attacks:

```solidity
// Step 1: Create fullNameCommitment with user passphrase
fullNameCommitment = Poseidon(keccak(fullName), keccak(passphrase), 0)

// Step 2: Generate final personHash
personHash = keccak256(Poseidon(fullNameCommitment, packedBirthData))
```

**Security Benefits**:
- **Identity Inference Prevention**: Without the passphrase, others cannot compute personHash from known basic information
- **Pollution Attack Protection**: Malicious users cannot create fake versions pointing to real people
- **Dual Tree Models**:
  - **Public Trees**: Use shared passphrases for collaborative family building
  - **Private Trees**: Use unique passphrases for complete protection and relationship correctness

### Core Hash Computation

The system uses this salted dual-hash approach in the contract's `getPersonHash()` function:

```solidity
// Contract implementation in DeepFamily.sol:464
function getPersonHash(PersonBasicInfo memory basicInfo) public pure returns (bytes32) {
    // 1. Split fullNameCommitment (Poseidon digest) into limbs
    uint256 limb0 = uint256(basicInfo.fullNameCommitment) >> 128;
    uint256 limb1 = uint256(basicInfo.fullNameCommitment) & ((1 << 128) - 1);

    // 2. Pack birth data
    uint256 packedData = (uint256(basicInfo.birthYear) << 24) |
                        (uint256(basicInfo.birthMonth) << 16) |
                        (uint256(basicInfo.birthDay) << 8) |
                        (uint256(basicInfo.gender) << 1) |
                        (basicInfo.isBirthBC ? 1 : 0);

    // 3. Compute Poseidon hash
    uint256[3] memory inputs = [limb0, limb1, packedData];
    uint256 poseidonResult = PoseidonT4.hash(inputs);

    // 4. Wrap with keccak256 for domain separation
    return keccak256(abi.encodePacked(bytes32(poseidonResult)));
}
```

## Circuit 1: Person Hash ZK (person_hash_zk.circom)

### Purpose
Enables privacy-preserving submission of family tree data through `addPersonZK()`.

### Circuit Structure

#### PersonHasher Template
```circom
template PersonHasher() {
    signal input fullNameHash[32];  // keccak256(fullName) as bytes
    signal input saltHash[32];      // keccak256(passphrase) as bytes
    signal input isBirthBC;         // Birth BC flag (0/1)
    signal input birthYear;         // Birth year (uint16)
    signal input birthMonth;        // Birth month (1-12)
    signal input birthDay;          // Birth day (1-31)
    signal input gender;            // Gender (0-7)

    signal output limb0;            // High 128 bits of final Poseidon
    signal output limb1;            // Low 128 bits of final Poseidon
}
```

#### Hash Computation Flow
1. **Name Commitment**: `Poseidon(keccak(fullName)_limbs, keccak(salt)_limbs, 0)`
2. **Data Packing**: `birthYear * 2^24 + birthMonth * 2^16 + birthDay * 2^8 + gender * 2 + isBirthBC`
3. **Final Hash**: `Poseidon(nameCommitment_limbs, packedData)`
4. **Limb Output**: Split 256-bit result into two 128-bit limbs

#### Input Validation
- Birth year: 16-bit constraint (0-65535)
- Birth month: LessEqThan(12) constraint
- Birth day: 5-bit constraint (0-31)
- Gender: 3-bit constraint (0-7)
- All hash bytes: 8-bit constraints

### PersonHashTest Main Circuit

#### Inputs
```circom
// Person to be added
signal input fullNameHash[32], saltHash[32];
signal input isBirthBC, birthYear, birthMonth, birthDay, gender;

// Father data (can be dummy if hasFather=0)
signal input father_fullNameHash[32], father_saltHash[32];
signal input father_isBirthBC, father_birthYear, father_birthMonth, father_birthDay, father_gender;

// Mother data (can be dummy if hasMother=0)
signal input mother_fullNameHash[32], mother_saltHash[32];
signal input mother_isBirthBC, mother_birthYear, mother_birthMonth, mother_birthDay, mother_gender;

// Control flags
signal input hasFather, hasMother;  // 0 or 1
signal input submitter;             // Address as uint160
```

#### Public Signals (7 outputs)
```javascript
[
  person_limb0,    // Person hash high 128 bits
  person_limb1,    // Person hash low 128 bits
  father_limb0,    // Father hash high 128 bits (0 if hasFather=0)
  father_limb1,    // Father hash low 128 bits (0 if hasFather=0)
  mother_limb0,    // Mother hash high 128 bits (0 if hasMother=0)
  mother_limb1,    // Mother hash low 128 bits (0 if hasMother=0)
  submitter_out    // Submitter address
]
```

#### Conditional Logic
```circom
// If hasFather=1, output father limbs; if hasFather=0, output (0,0)
signal father_limb0_selected <== hasFather * fatherHasher.limb0;
signal father_limb1_selected <== hasFather * fatherHasher.limb1;
```

## Circuit 2: Name Poseidon ZK (name_poseidon_zk.circom)

### Purpose
Proves knowledge of full name and salt that produce a specific Poseidon commitment for NFT minting.

### Circuit Structure

#### NamePoseidonBinding Template
```circom
template NamePoseidonBinding() {
    signal input fullNameHash[32]; // keccak256(fullName) bytes
    signal input saltHash[32];     // keccak256(passphrase) bytes

    signal output poseidonHi;      // High 128 bits of Poseidon digest
    signal output poseidonLo;      // Low 128 bits of Poseidon digest
    signal output nameHashHi;      // High 128 bits of keccak(fullName)
    signal output nameHashLo;      // Low 128 bits of keccak(fullName)
}
```

#### Computation
1. Convert input hashes to limbs with byte validation
2. Compute `Poseidon(nameHash_limbs, saltHash_limbs, 0)`
3. Output both Poseidon commitment and original name hash as limbs

#### Public Signals (4 outputs)
```javascript
[
  poseidonHi,      // Poseidon commitment high 128 bits
  poseidonLo,      // Poseidon commitment low 128 bits
  nameHashHi,      // keccak(fullName) high 128 bits
  nameHashLo       // keccak(fullName) low 128 bits
]
```

## Smart Contract Integration

### addPersonZK Function

```solidity
function addPersonZK(
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c,
    uint256[7] calldata publicSignals,
    uint256 fatherVersionIndex,
    uint256 motherVersionIndex,
    string calldata tag,
    string calldata metadataCID
) external
```

#### Verification Process
1. **Submitter Check**: `publicSignals[6] == uint256(uint160(msg.sender))`
2. **Proof Verification**: `PersonHashVerifier.verifyProof(a, b, c, publicSignals)`
3. **Hash Reconstruction**: Pack limbs back to bytes32 and wrap with keccak256
4. **Family Tree Update**: Add person version with verified parent relationships

### mintPersonNFT Function

```solidity
function mintPersonNFT(
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c,
    uint256[4] calldata publicSignals,
    bytes32 personHash,
    uint256 versionIndex,
    string calldata _tokenURI,
    PersonCoreInfo calldata coreInfo
) external
```

#### Verification Process
1. **Endorsement Check**: Caller must have endorsed this version
2. **Name Proof Verification**: `NamePoseidonVerifier.verifyProof(a, b, c, publicSignals)`
3. **Commitment Validation**: `publicSignals[0:1]` must match `coreInfo.basicInfo.fullNameCommitment`
4. **Name Hash Validation**: `publicSignals[2:3]` must match `keccak256(coreInfo.supplementInfo.fullName)`
5. **Person Hash Validation**: `getPersonHash(coreInfo.basicInfo)` must match `personHash`

## Security Features

### Circuit Security
- **Input Validation**: All numeric inputs are range-constrained
- **Byte Validation**: Hash inputs validated as proper 8-bit bytes
- **Deterministic Hashing**: Uses Poseidon for SNARK-friendly operations
- **No Information Leakage**: Only hash commitments and limbs are public

### Contract Security
- **Limb Range Checks**: Each limb must be < 2^128 (contracts/DeepFamily.sol:438)
- **Submitter Authentication**: Prevents proof replay across addresses
- **Version Consistency**: Parent version indices must exist if parent hashes provided
- **Domain Separation**: keccak256 wrapper prevents cross-domain hash collisions

### Privacy Protection
- **Salt-Based Commitments**: Names protected by user-controlled salts
- **Conditional Parent Disclosure**: Parents only revealed if family relationships exist
- **Hash-Only Storage**: No plaintext personal data stored on-chain

## Data Flow

### Adding Person with ZK Proof
1. User generates fullNameHash = keccak256(fullName)
2. User generates saltHash = keccak256(passphrase)
3. Circuit computes person/parent Poseidon commitments
4. Contract verifies proof and extracts final keccak256-wrapped hashes
5. Family tree updated with cryptographic commitments

### Minting NFT with Name Proof
1. User proves knowledge of name/salt for existing Poseidon commitment
2. Contract validates commitment matches person's fullNameCommitment
3. Contract validates provided fullName hashes to expected value
4. NFT minted with verified on-chain core information

### Poseidon Hash Benefits
- **SNARK-Friendly**: ~1000x fewer constraints vs keccak256 in circuits
- **Collision Resistant**: 128-bit security level with proper domain separation
- **Compact**: Single field element output vs 32-byte keccak256

## Development & Testing

### Circuit Compilation
```bash
circom circuits/person_hash_zk.circom --r1cs --wasm --sym
circom circuits/name_poseidon_zk.circom --r1cs --wasm --sym
```

### Trusted Setup
```bash
# Powers of tau (universal)
snarkjs powersoftau new bn128 18 pot18_0000.ptau

# Phase 2 (circuit-specific)
snarkjs groth16 setup person_hash_zk.r1cs pot18_final.ptau person_hash_zk_0000.zkey
snarkjs zkey contribute person_hash_zk_0000.zkey person_hash_zk_final.zkey
```

### Frontend Integration
ZK artifacts located in `frontend/public/zk/`:
- `person_hash_zk.wasm` - Circuit execution
- `person_hash_zk_final.zkey` - Proving key
- `person_hash_zk.vkey.json` - Verification key
- `name_poseidon_zk.wasm` - Name binding circuit
- `name_poseidon_zk_final.zkey` - Name binding proving key
- `name_poseidon_zk.vkey.json` - Name binding verification key

## Future Enhancements

### Scalability
- **Batch Proofs**: Multiple person additions in single proof
- **Layer 2 Deployment**: Deploy verifiers on L2 for reduced costs
- **Proof Aggregation**: Combine multiple proofs for batch verification

### Privacy Improvements
- **Recursive Proofs**: Chain proofs for complex family tree operations
- **Anonymous Endorsements**: Hide endorser identities while maintaining credibility
- **Selective Disclosure**: Prove specific attributes without revealing full data

---

*This documentation reflects the actual ZK proof implementation in DeepFamily based on circuit analysis and contract code review.*