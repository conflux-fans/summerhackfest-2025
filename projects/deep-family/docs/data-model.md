# 🗃️ DeepFamily Data Model

## 🔑 Core Hash System

DeepFamily uses a hash-based identity system to ensure privacy while maintaining data integrity and enabling efficient queries.

### **Primary Hash Types**

| Hash Type | Generation Method | Purpose & Usage |
|-----------|------------------|-----------------|
| `personHash` | `keccak256(abi.encodePacked(PersonBasicInfo))` | Unique person identifier across all versions |
| `fatherHash` | `keccak256(father's PersonBasicInfo)` | Parent relationship reference (genealogical edge) |
| `motherHash` | `keccak256(mother's PersonBasicInfo)` | Parent relationship reference (genealogical edge) |
| `nameHash` | `keccak256(abi.encodePacked(fullName))` | Name-based indexing for search functionality |
| `versionHash` | `keccak256(PersonVersion struct data)` | Duplicate version prevention mechanism |

### **Hash-Based Privacy Model**
- **On-Chain Storage**: Only cryptographic hashes, never plaintext personal data
- **Identity Protection**: Personal information remains private until optional NFT disclosure
- **Relationship Mapping**: Family connections established through hash references
- **Search Capability**: Name-based discovery without exposing full personal data

## 📊 Data Structures

### **PersonBasicInfo** - Foundation Identity Data

```solidity
struct PersonBasicInfo {
    bytes32 fullNameHash;  // keccak256 of complete name
    bool isBirthBC;        // BC (Before Christ) or AD designation
    uint16 birthYear;      // Year of birth (0 = unknown/private)
    uint8 birthMonth;      // Month (1-12, 0 = unknown/private)
    uint8 birthDay;        // Day (1-31, 0 = unknown/private)
    uint8 gender;          // 0=unknown, 1=male, 2=female, 3=other
}
```

**Design Considerations**:
- **Compact Storage**: Optimized field sizes for gas efficiency
- **Privacy Flexibility**: 0 values allow private/unknown data
- **Historical Support**: BC/AD designation for ancient genealogies
- **Cultural Inclusivity**: Gender field supports diverse identity expressions

**Hash Generation**:
```solidity
personHash = keccak256(abi.encodePacked(
    fullNameHash, isBirthBC, birthYear, birthMonth, birthDay, gender
))
```

### **PersonVersion** - Versioned Genealogical Records

```solidity
struct PersonVersion {
    bytes32 personHash;           // Links to PersonBasicInfo identity
    bytes32 fatherHash;           // Father's person hash (0x0 = unknown)
    bytes32 motherHash;           // Mother's person hash (0x0 = unknown)
    uint256 versionIndex;         // Sequential version number (1-based)
    uint256 fatherVersionIndex;   // Specific father version (0 = latest/unspecified)
    uint256 motherVersionIndex;   // Specific mother version (0 = latest/unspecified)
    address addedBy;              // Version contributor address
    uint96 timestamp;             // Block timestamp (packed for gas optimization)
    string tag;                   // Version description/source label
    string metadataCID;           // IPFS reference for extended metadata
}
```

**Multi-Version System**:
- **Version Coexistence**: Multiple data interpretations for same person
- **Immutable Records**: Versions cannot be modified after creation
- **Provenance Tracking**: Full audit trail of contributors and timestamps
- **Parent Versioning**: Specific parent version references for genealogical accuracy

### **PersonCoreInfo** - NFT-Enhanced Data

```solidity
struct PersonCoreInfo {
    PersonBasicInfo basicInfo;           // Layer 1 hash-based foundation
    PersonSupplementInfo supplementInfo; // Layer 2 rich biographical data
}

struct PersonSupplementInfo {
    string fullName;        // Plaintext name (revealed at NFT minting)
    string birthPlace;      // Birth location
    bool isDeathBC;         // Death date BC/AD designation
    uint16 deathYear;       // Death year (0 = unknown/alive)
    uint8 deathMonth;       // Death month (0-12)
    uint8 deathDay;         // Death day (0-31)
    string deathPlace;      // Death location
    string story;           // Biography summary (detailed content via sharding)
}
```

**Privacy Evolution**:
- **Progressive Disclosure**: From private hashes → community validation → public NFT data
- **Selective Information**: Users control which data becomes public through NFT minting
- **Rich Metadata**: Comprehensive biographical information when disclosed

## 📚 Story Sharding System

### **StoryChunk** - Biographical Content Segments

```solidity
struct StoryChunk {
    uint256 chunkIndex;    // Sequential position (0-based)
    bytes32 chunkHash;     // Content integrity verification hash
    string content;        // Biographical text (≤1KB per chunk)
    uint256 timestamp;     // Creation/modification time
    address lastEditor;    // Last contributor (must be NFT holder)
}
```

### **StoryMetadata** - Aggregate Story Management

```solidity
struct StoryMetadata {
    uint256 totalChunks;     // Current number of story chunks
    bytes32 fullStoryHash;   // Integrity hash of complete story
    uint256 lastUpdateTime;  // Most recent modification timestamp
    bool isSealed;           // Immutability flag (permanent when true)
    uint256 totalLength;     // Total character count across all chunks
}
```

**Story Integrity System**:
```solidity
// Complete story hash calculation
fullStoryHash = keccak256(abi.encodePacked(
    chunkHash[0], chunkHash[1], ..., chunkHash[n-1]
))
```

**Sharding Benefits**:
- **Scalable Content**: Up to 100KB of biographical content per person
- **Gas Efficiency**: Small chunks avoid gas limit issues
- **Incremental Editing**: Modify individual sections without rewriting entire biography
- **Content Integrity**: Hash verification ensures data authenticity
- **Immutable History**: Sealed stories preserve historical records permanently

## 🤝 Community Endorsement Model

### **Endorsement Mapping Structure**
```solidity
// Each user can endorse one version per person
mapping(bytes32 => mapping(address => uint256)) public endorsedVersionIndex;

// Track endorsement counts per version
mapping(bytes32 => mapping(uint256 => uint256)) public versionEndorsementCount;
```

**Endorsement Mechanics**:
- **Fee-Based Validation**: Pay current mining reward as fee to endorse
- **Quality Signaling**: Higher endorsement count indicates community trust
- **Dynamic Pricing**: Endorsement cost tied to current reward (anti-spam)
- **Fee Distribution**: Payments flow to version creators or NFT holders

## 🔍 Indexing & Query System

### **Name-Based Indexing**
```solidity
mapping(bytes32 => bytes32[]) public nameHashToPersonHashes;
```
- **Search Functionality**: Discover persons by name without revealing full data
- **Hash-Based Privacy**: Search operates on name hashes, not plaintext
- **Multiple Matches**: Handle persons with identical names

### **Parent-Child Relationships**
```solidity
mapping(bytes32 => mapping(bytes32 => ChildRef[])) public childRefs;

struct ChildRef {
    bytes32 childHash;
    uint256 childVersionIndex;
}
```
- **Genealogical Navigation**: Efficient parent → children queries
- **Version-Specific**: Track relationships to specific version numbers
- **Bidirectional Links**: Both parent → child and child → parent references

### **NFT Integration Mappings**
```solidity
mapping(uint256 => bytes32) public tokenIdToPerson;           // NFT → person
mapping(uint256 => uint256) public tokenIdToVersionIndex;    // NFT → version
mapping(bytes32 => mapping(uint256 => uint256)) public versionToTokenId; // version → NFT
```

**NFT-Data Linkage**:
- **Unique NFTs**: One NFT per version maximum
- **Bidirectional Links**: Efficient NFT ↔ person/version lookups
- **Story Integration**: NFT holders manage biographical content

## 🔄 Data Flow Patterns

### **Person Creation Flow**
1. **Input Processing**: User provides `PersonBasicInfo` + optional parent data
2. **Hash Generation**: Calculate `personHash` from basic info
3. **Version Creation**: Create `PersonVersion` with relationship references
4. **Mining Check**: Validate parent existence for reward eligibility
5. **Storage**: Store version in `personVersions[personHash]` array
6. **Indexing**: Update name hash and parent-child reference mappings

### **Community Validation Flow**
1. **Version Discovery**: Users find versions through name or relationship queries
2. **Endorsement**: Pay current mining reward to endorse trusted version
3. **Fee Distribution**: Payment flows to version creator (pre-NFT) or NFT holder (post-NFT)
4. **Quality Signal**: Increment endorsement count for version

### **Value Creation Flow**
1. **NFT Minting**: Endorsed versions can mint unique NFT tokens
2. **Data Disclosure**: Rich biographical information stored on-chain
3. **Story Creation**: NFT holders add biographical content via sharding system
4. **Content Sealing**: Make biographical content permanently immutable

## 📈 Data Scalability Features

### **Gas Optimization Techniques**
- **Struct Packing**: `timestamp` as `uint96` saves storage slot
- **Paginated Queries**: All list functions support offset/limit parameters
- **Efficient Mappings**: Optimized storage layout for frequent access patterns
- **Event-Driven Updates**: Frontend synchronization via blockchain events

### **Storage Pattern Efficiency**
- **Array Management**: Dynamic arrays with efficient indexing
- **Mapping Hierarchies**: Nested mappings for O(1) lookups
- **Reference Counting**: Track relationships without expensive iterations
- **Lazy Loading**: Query functions fetch only requested data ranges

---

## 🎯 Data Model Benefits

### **Privacy by Design**
- **Hash-First Architecture**: Personal data protected until voluntary disclosure
- **Selective Transparency**: Users control information revelation through NFT minting
- **Cryptographic Integrity**: All data verified through hash-based validation

### **Community-Driven Quality**
- **Multi-Version Support**: Accommodate diverse genealogical interpretations
- **Social Validation**: Endorsement system builds community consensus
- **Economic Incentives**: Token rewards encourage accurate, complete data

### **Technical Excellence**
- **Gas Efficiency**: Optimized data structures and query patterns
- **Scalable Architecture**: Sharding and pagination support large datasets
- **Immutable History**: Blockchain guarantees permanent genealogical preservation
