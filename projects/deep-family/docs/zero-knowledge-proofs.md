# Zero-Knowledge Proofs in DeepFamily

## Overview

DeepFamily implements a privacy-preserving genealogy system using Zero-Knowledge (ZK) proofs based on the Groth16 proving system. This allows users to verify the integrity of genealogical data while keeping sensitive personal information private on-chain.

## Architecture

### ZK Circuit Design

The core circuit `PersonHashTest` in `circuits/person_hash_zk.circom` implements:

- **Privacy-Preserving Person Hashing**: Computes keccak256 hashes of person data using full name hash + birth details
- **Parent Relationship Validation**: Conditional parent hash computation with existence flags
- **Limb-Based Output**: Converts 256-bit hashes to 128-bit limb pairs for efficient on-chain verification
- **Submitter Authentication**: Includes submitter address in proof to prevent replay attacks

### Circuit Components

#### PersonHasher Template
```circom
template PersonHasher() {
    signal input fullNameHash[32];  // Pre-hashed full name (32 bytes)
    signal input isBirthBC;         // Birth BC flag (0/1)
    signal input birthYear;         // Birth year (uint16)
    signal input birthMonth;        // Birth month (1-12)
    signal input birthDay;          // Birth day (1-31)
    signal input gender;            // Gender (1=male, 2=female)
    
    signal output hashBytes[32];    // Resulting keccak256 hash
}
```

The PersonHasher template:
1. Validates input constraints (month ≤ 12, day ≤ 31)
2. Constructs preimage: `fullNameHash[32] + uint8(isBirthBC) + uint16(birthYear) + uint8(birthMonth) + uint8(birthDay) + uint8(gender)`
3. Computes keccak256 hash of the 38-byte preimage

#### HashToLimbs Template
```circom
template HashToLimbs() {
    signal input hashBytes[32];
    signal output limb0;    // High 128 bits
    signal output limb1;    // Low 128 bits
}
```

Converts 32-byte hash to two 128-bit limbs for efficient on-chain storage and verification.

#### Parent Existence Logic
```circom
// Parent existence flags
signal input hasFather;
signal input hasMother;

// Conditional output using Mux1
component fatherSelect0 = Mux1();
fatherSelect0.c[0] <== 0;                    // Output 0 if father doesn't exist
fatherSelect0.c[1] <== fatherLimbs.limb0;    // Output computed hash if father exists
fatherSelect0.s <== hasFather;
```

When parents don't exist, the circuit outputs `(0, 0)` limbs, equivalent to `bytes32(0)` on-chain.

## Data Serialization

### Input Format
```typescript
interface PersonData {
  fullName: string      // UTF-8 string, hashed to 32 bytes
  birthYear: number     // uint16 (0-65535)
  birthMonth: number    // uint8 (1-12)
  birthDay: number      // uint8 (1-31)
  isBirthBC: boolean    // Boolean flag
  gender: number        // uint8 (1=male, 2=female)
}
```

### Hash Computation
The frontend uses ethers.js to compute hashes compatible with Solidity:

```typescript
// Full name hash (consistent with circuit)
export function hashFullName(fullName: string): number[] {
  const hash = keccak256(toUtf8Bytes(fullName))
  // Convert to byte array for circuit input
  return Array.from(new Uint8Array(...))
}
```

### Circuit Input Structure
```javascript
const circuitInput = {
  // Person to be added
  fullNameHash: hashFullName(person.fullName),
  isBirthBC: person.isBirthBC ? 1 : 0,
  birthYear: person.birthYear,
  birthMonth: person.birthMonth,
  birthDay: person.birthDay,
  gender: person.gender,
  
  // Father data (or default values if hasFather = 0)
  father_fullNameHash: hashFullName(fatherData.fullName),
  father_isBirthBC: fatherData.isBirthBC ? 1 : 0,
  father_birthYear: fatherData.birthYear,
  father_birthMonth: fatherData.birthMonth,
  father_birthDay: fatherData.birthDay,
  father_gender: fatherData.gender,
  
  // Mother data (or default values if hasMother = 0)
  mother_fullNameHash: hashFullName(motherData.fullName),
  mother_isBirthBC: motherData.isBirthBC ? 1 : 0,
  mother_birthYear: motherData.birthYear,
  mother_birthMonth: motherData.birthMonth,
  mother_birthDay: motherData.birthDay,
  mother_gender: motherData.gender,
  
  // Parent existence flags
  hasFather: father ? 1 : 0,
  hasMother: mother ? 1 : 0,
  
  // Submitter address (without 0x prefix)
  submitter: submitterAddress.replace('0x', '')
}
```

## Proof Generation and Verification

### Frontend Integration

The ZK proof system is integrated through `frontend/src/lib/zk.ts`:

```typescript
export async function generatePersonProof(
  person: PersonData,
  father: PersonData | null,
  mother: PersonData | null,
  submitterAddress: string
): Promise<{ proof: Groth16Proof; publicSignals: string[] }>
```

### Proof Structure
```typescript
type Groth16Proof = {
  a: [string | bigint, string | bigint]
  b: [[string | bigint, string | bigint], [string | bigint, string | bigint]]
  c: [string | bigint, string | bigint]
}
```

### Public Signals Format
The circuit outputs 7 public signals:
```javascript
publicSignals = [
  person_limb0,    // Person hash high 128 bits
  person_limb1,    // Person hash low 128 bits
  father_limb0,    // Father hash high 128 bits (0 if no father)
  father_limb1,    // Father hash low 128 bits (0 if no father)
  mother_limb0,    // Mother hash high 128 bits (0 if no mother)
  mother_limb1,    // Mother hash low 128 bits (0 if no mother)
  submitter_out    // Submitter address as uint160
]
```

### Hash Consistency Verification

The system ensures 100% consistency between frontend-generated hashes and smart contract `getPersonHash()` function through comprehensive validation:

```javascript
// Verification script: tasks/zk-limbs-check.js
function getPersonHashJS(basic) {
  // Mirrors Solidity getPersonHash exactly:
  // abi.encodePacked(uint16(len), bytes(name), uint8(isBC), 
  //                 uint16(year), uint8(month), uint8(day), uint8(gender))
  return solidityPackedKeccak256([...], [...])
}
```

## Trusted Setup and Artifacts

### ZK Artifacts Structure
```
frontend/public/zk/
├── person_hash_zk.wasm          # Circuit execution (2.1MB)
├── person_hash_zk_final.zkey    # Proving key (218MB)
└── person_hash_zk.vkey.json     # Verification key (4KB)
```

### File Descriptions

1. **`.wasm` (WebAssembly Circuit)**
   - Compiled circuit for witness generation
   - Contains constraint system and execution logic
   - Loaded by snarkjs for proof generation

2. **`.zkey` (Proving Key)**
   - Generated through trusted setup ceremony
   - Contains proving parameters for Groth16
   - Critical for proof generation, must match circuit exactly

3. **`.vkey.json` (Verification Key)**
   - Public verification parameters
   - Used for proof verification (on-chain and off-chain)
   - Much smaller than proving key

### Trusted Setup Process

The current setup uses Powers of Tau ceremony:

```bash
# Phase 1: Universal setup (reusable)
snarkjs powersoftau new bn128 19 pot19_0000.ptau
snarkjs powersoftau contribute pot19_0000.ptau pot19_0001.ptau

# Phase 2: Circuit-specific setup
snarkjs powersoftau prepare phase2 pot19_final.ptau pot19_final.ptau
snarkjs groth16 setup person_hash_zk.r1cs pot19_final.ptau person_hash_zk_0000.zkey
snarkjs zkey contribute person_hash_zk_0000.zkey person_hash_zk_final.zkey
```

## Smart Contract Integration

### On-Chain Verification

The `DeepFamily.sol` contract verifies ZK proofs through:

```solidity
function addPersonZK(
    uint[2] memory _pA,
    uint[2][2] memory _pB,
    uint[2] memory _pC,
    uint[7] memory _publicSignals,
    uint256 _fatherVersionIndex,
    uint256 _motherVersionIndex,
    string memory _tag,
    string memory _metadataCID
) external nonReentrant
```

### Public Signals Validation

The contract validates:
1. **Limb Range Checks**: Each hash limb must be < 2^128
2. **Submitter Verification**: Public signal[6] must equal msg.sender
3. **Parent References**: Version indices must exist if parent hashes are non-zero
4. **Hash Consistency**: Computed hashes must match existing person versions

### Gas Optimization

The limb-based representation reduces on-chain storage:
- Traditional: 3 × 32 bytes = 96 bytes per hash set
- Limb-based: 7 × 32 bytes = 224 bytes (including submitter)
- Enables efficient batch operations and indexing

## Security Considerations

### Circuit Security
- **Input Validation**: All inputs are range-checked and constrained
- **Deterministic Hashing**: Uses keccak256 for cryptographic security
- **No Information Leakage**: Only hash outputs are public

### Trusted Setup Security
- **Powers of Tau**: Uses community-audited universal setup
- **Phase 2 Contribution**: Circuit-specific setup with entropy contribution
- **Verification**: All setup artifacts are verifiable

### Frontend Security
- **Cache Busting**: Prevents stale circuit file caching
- **Input Sanitization**: All user inputs are validated before circuit submission
- **Proof Validation**: Optional client-side verification before submission

## Performance Metrics

### Circuit Complexity
- **Constraints**: 455,324 constraints
- **Witness Size**: 455,324 elements
- **Proving Time**: ~2-3 seconds on modern hardware
- **Verification Time**: <100ms

### File Sizes
- **Circuit WASM**: 2.1MB (affects initial load)
- **Proving Key**: 218MB (significant bandwidth consideration)
- **Verification Key**: 4KB (minimal impact)

### Network Considerations
For production deployment, consider:
- **CDN Distribution**: Use CDN for large .zkey files
- **Progressive Loading**: Load circuits on-demand
- **Compression**: Enable gzip/brotli compression
- **Caching Strategy**: Implement aggressive caching for static ZK files

## Testing and Validation

### Circuit Testing
```javascript
// Test with parents
const testWithParents = {
  person: { fullName: "Alice", ... },
  father: { fullName: "Bob", ... },
  mother: { fullName: "Carol", ... }
}

// Test without parents
const testNoParents = {
  person: { fullName: "Alice", ... },
  father: null,
  mother: null
}
```

### Hash Consistency Tests
The system includes comprehensive hash consistency validation:
- Frontend-generated hashes vs. contract getPersonHash()
- Circuit output limbs vs. expected hash limbs
- Cross-validation between all hash computation methods

### Integration Testing
```typescript
// Complete workflow test
const { proof, publicSignals } = await generatePersonProof(...)
const isValid = await verifyProof(proof, publicSignals)
const tx = await submitAddPersonZK(signer, contractAddress, proof, ...)
```

## Development Workflow

### Adding New Circuit Features

1. **Modify Circuit**: Update `person_hash_zk.circom`
2. **Recompile**: Generate new `.wasm` and `.r1cs` files
3. **Trusted Setup**: Create new `.zkey` with existing `.ptau`
4. **Update Frontend**: Modify input structure in `zk.ts`
5. **Test Integration**: Validate end-to-end proof generation
6. **Deploy Artifacts**: Update `frontend/public/zk/` files

### Debugging ZK Proofs

Common issues and solutions:
- **Witness Length Mismatch**: Circuit and proving key out of sync
- **Constraint Failures**: Input validation or logic errors
- **Hash Inconsistency**: Frontend vs. contract hash computation differences

### Best Practices

1. **Version Control**: Track all ZK artifacts with clear versioning
2. **Testing**: Comprehensive test coverage for all circuit paths
3. **Documentation**: Maintain clear documentation of circuit logic
4. **Security**: Regular audits of circuit constraints and setup
5. **Performance**: Monitor proof generation times and optimize as needed

## Future Enhancements

### Potential Improvements
- **Batch Proofs**: Support multiple person additions in single proof
- **Recursive Proofs**: Chain proofs for complex family trees
- **Universal Setup**: Migrate to PLONK for elimination of trusted setup
- **Mobile Optimization**: WebAssembly optimizations for mobile browsers
- **Caching Layer**: Implement proof caching for repeated operations

### Scalability Considerations
- **Layer 2 Integration**: Deploy verification on L2 for reduced costs
- **Proof Aggregation**: Combine multiple proofs for batch verification
- **State Channels**: Off-chain proof generation with periodic on-chain settlement

---

*This documentation covers the complete ZK proof system implementation in DeepFamily. For specific technical details, refer to the source code in `circuits/`, `frontend/src/lib/zk.ts`, and related smart contracts.*