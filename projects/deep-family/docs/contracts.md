# 📄 Smart Contracts Reference

## 🏛️ DeepFamily.sol (1,384 lines) - Core Protocol Contract

**Description**: The main genealogy protocol contract implementing multi-version person management, community endorsement system, NFT minting, and story sharding functionality.

### 🔧 Critical Constants

| Constant | Value | Purpose & Impact |
|----------|-------|------------------|
| `MAX_LONG_TEXT_LENGTH` | 256 | Maximum length for tags, IPFS CIDs, and variable strings |
| `MAX_QUERY_PAGE_SIZE` | 100 | Gas-optimized pagination limit for query functions |
| `MAX_CHUNK_CONTENT_LENGTH` | 1000 | Story chunk size limit (1KB per shard) |
| `MAX_STORY_CHUNKS` | 100 | Maximum biography shards per NFT (100KB total) |

### 📊 Data Structures

#### **PersonBasicInfo**
```solidity
struct PersonBasicInfo {
    bytes32 fullNameHash;  // keccak256 hash of full name
    bool isBirthBC;        // BC/AD birth designation
    uint16 birthYear;      // Birth year (0 = unknown)
    uint8 birthMonth;      // Month (1-12, 0 = unknown)
    uint8 birthDay;        // Day (1-31, 0 = unknown)
    uint8 gender;          // 0=unknown, 1=male, 2=female, 3=other
}
```

#### **PersonVersion**
```solidity
struct PersonVersion {
    bytes32 personHash;           // Unique person identifier
    bytes32 fatherHash;           // Father's hash reference
    bytes32 motherHash;           // Mother's hash reference
    uint256 versionIndex;         // Version sequence number (1-based)
    uint256 fatherVersionIndex;   // Father's specific version (0=unspecified)
    uint256 motherVersionIndex;   // Mother's specific version (0=unspecified)
    address addedBy;              // Version contributor address
    uint96 timestamp;             // Addition timestamp (packed storage)
    string tag;                   // Version description/label
    string metadataCID;           // IPFS metadata reference
}
```

#### **PersonCoreInfo**
```solidity
struct PersonCoreInfo {
    PersonBasicInfo basicInfo;           // Layer 1 hash-based data
    PersonSupplementInfo supplementInfo; // Layer 2 rich metadata
}
```

#### **StoryChunk & StoryMetadata**
```solidity
struct StoryChunk {
    uint256 chunkIndex;    // Sequential chunk number
    bytes32 chunkHash;     // Content integrity hash
    string content;        // Biography content (≤1KB)
    uint256 timestamp;     // Creation/modification time
    address lastEditor;    // Last contributor
}

struct StoryMetadata {
    uint256 totalChunks;     // Current chunk count
    bytes32 fullStoryHash;   // Aggregate story hash
    uint256 lastUpdateTime;  // Last modification timestamp
    bool isSealed;           // Immutability flag
    uint256 totalLength;     // Total character count
}
```

### 🔄 Core Functions

#### **Person Management**
- **`addPersonZK(proof, publicSignals, personInfo, tag, metadataCID)`**
  - Zero-knowledge proof-based person addition
  - Validates Groth16 proof via `IPersonHashVerifier`
  - Mining reward distribution for complete family data

#### **Community Endorsement**
- **`endorseVersion(personHash, versionIndex)`**
  - Fee-based endorsement requiring current mining reward payment
  - Dynamic fee distribution: pre-NFT → creator, post-NFT → NFT holder
  - Anti-spam mechanism through dynamic pricing

#### **NFT System**
- **`mintPersonNFT(personHash, versionIndex, coreInfo, tokenURI)`**
  - Requires prior endorsement of target version
  - One-time NFT creation per version
  - On-chain core metadata storage

#### **Story Sharding**
- **`addStoryChunk(tokenId, chunkIndex, content)`** - Append biography segment
- **`updateStoryChunk(tokenId, chunkIndex, content)`** - Modify existing chunk (if not sealed)
- **`sealStory(tokenId)`** - Make story immutable permanently

#### **Query Functions** (Gas-Optimized with Pagination)
- **`listPersonVersions(personHash, offset, limit)`** - Version enumeration
- **`listChildren(parentHash, parentVersion, offset, limit)`** - Child references
- **`getVersionDetails(personHash, versionIndex)`** - Complete version data + endorsements
- **`getNFTDetails(tokenId)`** - Aggregated NFT information
- **`listStoryChunks(tokenId, offset, limit)`** - Biography pagination

### 📡 Events System

| Event | Emitted When | Key Data |
|-------|-------------|----------|
| `PersonVersionAdded` | New version created | `personHash`, `versionIndex`, `addedBy`, `parentHashes` |
| `PersonVersionEndorsed` | Version endorsed | `personHash`, `versionIndex`, `endorser`, `fee` |
| `PersonNFTMinted` | NFT created | `tokenId`, `personHash`, `versionIndex`, `owner` |
| `StoryChunkAdded` | Biography chunk added | `tokenId`, `chunkIndex`, `content`, `editor` |
| `StoryChunkUpdated` | Chunk modified | `tokenId`, `chunkIndex`, `newContent`, `editor` |
| `StorySealed` | Story made immutable | `tokenId`, `totalChunks`, `fullStoryHash` |
| `TokenRewardDistributed` | Mining reward paid | `recipient`, `amount`, `totalAdditions` |

### 🔐 Access Control & Security

**Permission Model**:
- **Open Submission**: Anyone can add person versions with valid proofs
- **Endorsement Gating**: Requires DEEP token balance and allowance
- **NFT Holder Rights**: Exclusive story chunk management after minting
- **Immutability**: Sealed stories cannot be modified by anyone

**Security Features**:
- **50+ Custom Errors**: Explicit revert reasons for comprehensive debugging
- **Reentrancy Guards**: Protection on all external value transfer functions
- **Input Validation**: Comprehensive parameter checking with custom error types
- **ETH Rejection**: Contract rejects direct ETH transfers (receive/fallback revert)

## 🪙 DeepFamilyToken.sol (201 lines) - DEEP ERC20 Mining Token

**Description**: Standard ERC20 token with progressive halving mining mechanics, designed for genealogy protocol incentives.

### 🔢 Economic Constants

| Constant | Value | Economic Impact |
|----------|-------|-----------------|
| `MAX_SUPPLY` | 100,000,000,000e18 | Hard cap: 100 billion DEEP tokens |
| `INITIAL_REWARD` | 113,777e18 | Starting mining reward per qualified addition |
| `MIN_REWARD` | 1e17 (0.1 DEEP) | Minimum reward threshold (halving termination) |
| `FIXED_LENGTH` | 100,000,000 | Fixed cycle length after 9th halving cycle |

### ⚡ Progressive Halving Mechanics

**Cycle Progression**: Advanced tokenomics with variable-length cycles
```
Cycle Lengths: [1, 10, 100, 1k, 10k, 100k, 1M, 10M, 100M, then fixed 100M]
Reward Schedule: 113,777 → 56,888.5 → 28,444.25 → ... → 0.1 (termination)
```

**Mining Logic**:
- Reward granted only for complete family relationships (both parents exist)
- Binary halving at each cycle completion
- Early termination when reward drops below `MIN_REWARD`
- Theoretical supply: ~100B DEEP (actual: slightly less due to early termination)

### 🔄 Core Functions

#### **Administrative**
- **`initialize(deepFamilyContractAddress)`**
  - One-time contract binding during deployment
  - Sets authorized minting address
  - Can only be called once by owner

#### **Mining System**
- **`mint(minerAddress)`**
  - **Access**: Only callable by authorized DeepFamily contract
  - **Logic**: Calculates current reward based on `totalAdditions` counter
  - **Returns**: Actual reward amount distributed
  - **Side Effects**: Updates `totalAdditions`, emits `MiningReward` event

#### **View Functions**
- **`getReward(additionIndex)`** - Calculate prospective reward for specific addition number
- **`recentReward()`** - Current mining reward amount (used for endorsement pricing)
- **`getCurrentCycle()`** - Current halving cycle information
- **`getSupplyProjection()`** - Projected total supply at completion

### 📊 State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `deepFamilyContract` | address | Authorized minting contract |
| `totalAdditions` | uint256 | Number of successful reward-generating records |
| `cycleLengths` | uint256[] | Halving cycle length progression |
| `initialized` | bool | One-time initialization flag |

### 📡 Events

| Event | Parameters | Purpose |
|-------|------------|---------|
| `MiningReward` | `miner`, `reward`, `totalAdditions` | Track reward distribution |
| `ContractInitialized` | `deepFamilyContract` | Contract binding confirmation |

### 🔐 Access Control

**Restricted Functions**:
- **`mint()`**: Only authorized DeepFamily contract
- **`initialize()`**: Only owner, one-time only

**Security Features**:
- **Single Authorization**: Only one contract can mint tokens
- **Immutable Binding**: Contract address cannot be changed after initialization
- **Supply Protection**: Hard cap enforcement prevents over-issuance
- **Reward Validation**: Automatic calculation prevents manual manipulation

## 🔍 PersonHashVerifier.sol (210 lines) - Zero-Knowledge Verifier

**Description**: Groth16 zk-SNARK verifier for privacy-preserving person data submission.

### 🔐 ZK Integration Interface

**Core Function**:
```solidity
interface IPersonHashVerifier {
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[7] calldata publicSignals
    ) external view returns (bool);
}
```

**Verification Process**:
- **Input**: Groth16 proof components (a, b, c) + 7 public signals
- **Validation**: Cryptographic verification of zero-knowledge proof
- **Output**: Boolean confirmation of proof validity
- **Integration**: Used by `DeepFamily.addPersonZK()` for privacy-preserving submissions

### 🧮 Public Signal Structure (7 Elements)

| Index | Signal | Description |
|-------|--------|-------------|
| 0-6 | `personHashLimbs` | Person hash split across 7 field elements for circuit compatibility |

**Hash Verification**:
- Original `personHash` reconstructed from 7 limbs within zk-circuit
- Ensures submitted hash matches private input data
- Enables privacy-preserving identity verification

### 🔧 Circuit Integration Status

**Current State**: Interface implemented, ready for production zk-circuits
**Planned Features**:
- Private attribute confirmation (birth year ranges, gender verification)
- Relationship proof without revealing specific parent identities
- Bulk family tree verification with privacy preservation

---

## 🛡️ Contract Security Summary

### **Comprehensive Error Handling**
All contracts implement extensive custom error types for precise debugging and user feedback:

**DeepFamily.sol Errors** (50+ types):
- `InvalidPersonHash()`, `InvalidVersionIndex()`, `DuplicateVersion()`
- `MustEndorseVersionFirst()`, `VersionAlreadyMinted()`, `StoryAlreadySealed()`
- `InvalidZKProof()`, `VerifierNotSet()`, `TokenContractNotSet()`

**Security Patterns**:
- **Reentrancy Guards**: All external value transfers protected
- **Input Validation**: Comprehensive parameter checking
- **Access Control**: Role-based permissions with OpenZeppelin primitives
- **Immutability Controls**: Sealed stories and initialized contracts cannot be modified

### **Gas Optimization Features**
- **Struct Packing**: Optimized storage layout (e.g., `timestamp` as `uint96`)
- **Paginated Queries**: All list functions support efficient pagination
- **Event-Driven Architecture**: Frontend updates via blockchain events
- **Batch Operations**: Multiple related actions combined where possible
