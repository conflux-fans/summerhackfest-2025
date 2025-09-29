# Smart Contracts Reference

## DeepFamily.sol - Core Protocol Contract

**Location**: `contracts/DeepFamily.sol`
**Description**: Main family tree protocol implementing multi-version person management, ZK-proof verification, community endorsement, NFT minting, and story sharding.

### Critical Constants

| Constant | Value | Purpose & Impact |
|----------|-------|------------------|
| `MAX_LONG_TEXT_LENGTH` | 256 | Max length for tags, IPFS CIDs, names, places, stories |
| `MAX_QUERY_PAGE_SIZE` | 100 | Gas-optimized pagination limit for all query functions |
| `MAX_CHUNK_CONTENT_LENGTH` | 1000 | Story chunk size limit (1KB per shard) |
| `MAX_STORY_CHUNKS` | 100 | Maximum biography shards per NFT (100KB total) |
| `_HASH_LIMBS_REQUIRED` | 6 | Required limbs for person/father/mother hashes in ZK proofs |

### Core Data Structures

#### PersonBasicInfo
```solidity
struct PersonBasicInfo {
    bytes32 fullNameCommitment; // Poseidon(keccak(fullName), keccak(passphrase), 0) - Prevents identity inference
    bool isBirthBC;              // Birth era flag
    uint16 birthYear;            // Birth year (0=unknown)
    uint8 birthMonth;            // Birth month (1-12, 0=unknown)
    uint8 birthDay;              // Birth day (1-31, 0=unknown)
    uint8 gender;                // Gender (0=unknown, 1=male, 2=female, 3=other)
}
```

**Salted Passphrase Unlinkability**: The `fullNameCommitment` uses a user-controlled passphrase to prevent:
- **Identity Inference**: Others cannot compute personHash from known basic information
- **Pollution Attacks**: Malicious users cannot create fake versions pointing to real people
- **Dual Tree Models**: Supports public trees (shared passphrase) and private trees (unique passphrase)

#### PersonVersion
```solidity
struct PersonVersion {
    bytes32 personHash;          // keccak256(Poseidon(fullNameCommitment, packedData))
    bytes32 fatherHash;          // Father's person hash
    bytes32 motherHash;          // Mother's person hash
    uint256 versionIndex;        // Version index (starts from 1)
    uint256 fatherVersionIndex;  // Father's version reference (0=unspecified)
    uint256 motherVersionIndex;  // Mother's version reference (0=unspecified)
    address addedBy;             // Contributor address (packed with timestamp)
    uint96 timestamp;            // Addition timestamp (packed with addedBy)
    string tag;                  // Version tag/description
    string metadataCID;          // IPFS metadata CID
}
```

#### PersonCoreInfo
```solidity
struct PersonCoreInfo {
    PersonBasicInfo basicInfo;         // Hash-based identity
    PersonSupplementInfo supplementInfo; // Human-readable data
}

struct PersonSupplementInfo {
    string fullName;      // Full name (revealed for NFT)
    string birthPlace;    // Birth place
    bool isDeathBC;       // Death era flag
    uint16 deathYear;     // Death year (0=unknown)
    uint8 deathMonth;     // Death month (0-12, 0=unknown)
    uint8 deathDay;       // Death day (0-31, 0=unknown)
    string deathPlace;    // Death place
    string story;         // Life story summary
}
```

#### Story Sharding Structures
```solidity
struct StoryChunk {
    uint256 chunkIndex;   // Chunk index (starts from 0)
    bytes32 chunkHash;    // keccak256(content)
    string content;       // Chunk content (≤1KB)
    uint256 timestamp;    // Creation/update timestamp
    address lastEditor;   // Last editor address
}

struct StoryMetadata {
    uint256 totalChunks;     // Current total chunks
    bytes32 fullStoryHash;   // Combined hash of all chunks
    uint256 lastUpdateTime;  // Last update timestamp
    bool isSealed;           // Immutability flag
    uint256 totalLength;     // Total character count
}
```

### Core Hash Computation

The system uses a sophisticated hash calculation in `getPersonHash()`:

```solidity
function getPersonHash(PersonBasicInfo memory basicInfo) public pure returns (bytes32) {
    // 1. Extract limbs from Poseidon fullNameCommitment
    uint256 limb0 = uint256(basicInfo.fullNameCommitment) >> 128;
    uint256 limb1 = uint256(basicInfo.fullNameCommitment) & ((1 << 128) - 1);

    // 2. Pack birth data efficiently
    uint256 packedData = (uint256(basicInfo.birthYear) << 24) |
                        (uint256(basicInfo.birthMonth) << 16) |
                        (uint256(basicInfo.birthDay) << 8) |
                        (uint256(basicInfo.gender) << 1) |
                        (basicInfo.isBirthBC ? 1 : 0);

    // 3. Compute Poseidon hash with 3 inputs
    uint256[3] memory inputs = [limb0, limb1, packedData];
    uint256 poseidonResult = PoseidonT4.hash(inputs);

    // 4. Wrap with keccak256 for domain separation
    return keccak256(abi.encodePacked(bytes32(poseidonResult)));
}
```

### Core Functions

#### ZK-Proof Person Addition
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

**Verification Process**:
1. Validates `publicSignals[6] == uint256(uint160(msg.sender))`
2. Calls `PersonHashVerifier.verifyProof(a, b, c, publicSignals)`
3. Reconstructs person/father/mother hashes from limb pairs
4. Wraps Poseidon outputs with keccak256
5. Routes to `_addPersonInternal()` for family tree update

#### Community Endorsement
```solidity
function endorseVersion(bytes32 personHash, uint256 versionIndex) external
```

**Endorsement Mechanics**:
- Endorsers pay `recentReward` amount in DEEP tokens
- Funds flow to NFT holder if minted, otherwise to original contributor
- Each account can endorse only one version per person
- Switching endorsements rebalances vote counts

#### NFT Minting with Name Proof
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
) external nonReentrant
```

**Minting Requirements**:
1. Caller must have endorsed this version
2. `NamePoseidonVerifier.verifyProof()` must succeed
3. `publicSignals[0:1]` must match `coreInfo.basicInfo.fullNameCommitment`
4. `publicSignals[2:3]` must match `keccak256(coreInfo.supplementInfo.fullName)`
5. `getPersonHash(coreInfo.basicInfo)` must equal `personHash`

#### Story Sharding System
```solidity
function addStoryChunk(uint256 tokenId, uint256 chunkIndex, string calldata content, bytes32 expectedHash) external
function updateStoryChunk(uint256 tokenId, uint256 chunkIndex, string calldata newContent, bytes32 expectedHash) external
function sealStory(uint256 tokenId) external
```

**Story Management**:
- Only NFT holders can add/update chunks
- Chunks must be added sequentially starting from index 0
- Content hash validation prevents corruption
- Sealing makes stories permanently immutable

### Query Functions (Paginated)

#### Version Queries
```solidity
function countPersonVersions(bytes32 personHash) external view returns (uint256)
function getVersionDetails(bytes32 personHash, uint256 versionIndex) external view returns (PersonVersion memory, uint256, uint256)
function listPersonVersions(bytes32 personHash, uint256 offset, uint256 limit) external view returns (PersonVersion[] memory, uint256, bool, uint256)
```

#### Family Tree Queries
```solidity
function listChildren(bytes32 parentHash, uint256 parentVersionIndex, uint256 offset, uint256 limit) external view returns (bytes32[] memory, uint256[] memory, uint256, bool, uint256)
```

#### NFT Queries
```solidity
function getNFTDetails(uint256 tokenId) external view returns (bytes32, uint256, PersonVersion memory, PersonCoreInfo memory, uint256, string memory)
```

#### Story Queries
```solidity
function getStoryMetadata(uint256 tokenId) external view returns (StoryMetadata memory)
function getStoryChunk(uint256 tokenId, uint256 chunkIndex) external view returns (StoryChunk memory)
function listStoryChunks(uint256 tokenId, uint256 offset, uint256 limit) external view returns (StoryChunk[] memory, uint256, bool, uint256)
```

### Events System

#### Core Events
```solidity
event PersonVersionAdded(bytes32 indexed personHash, uint256 indexed versionIndex, address indexed addedBy, uint256 timestamp, bytes32 fatherHash, uint256 fatherVersionIndex, bytes32 motherHash, uint256 motherVersionIndex, string tag);

event PersonVersionEndorsed(bytes32 indexed personHash, address indexed endorser, uint256 versionIndex, uint256 endorsementFee, uint256 timestamp);

event PersonNFTMinted(bytes32 indexed personHash, uint256 indexed tokenId, address indexed owner, uint256 versionIndex, string tokenURI, uint256 timestamp);

event PersonHashZKVerified(bytes32 indexed personHash, address indexed prover);

event TokenRewardDistributed(address indexed miner, bytes32 indexed personHash, uint256 indexed versionIndex, uint256 reward);
```

#### Story Events
```solidity
event StoryChunkAdded(uint256 indexed tokenId, uint256 indexed chunkIndex, bytes32 chunkHash, address indexed editor, uint256 contentLength);

event StoryChunkUpdated(uint256 indexed tokenId, uint256 indexed chunkIndex, bytes32 oldHash, bytes32 newHash, address indexed editor);

event StorySealed(uint256 indexed tokenId, uint256 totalChunks, bytes32 fullStoryHash, address indexed sealer);
```

### Key Storage Mappings

```solidity
mapping(bytes32 => PersonVersion[]) public personVersions;                    // Person hash => versions array
mapping(bytes32 => mapping(bytes32 => bool)) public versionExists;            // Duplicate prevention
mapping(bytes32 => mapping(address => uint256)) public endorsedVersionIndex; // User endorsements
mapping(bytes32 => mapping(uint256 => uint256)) public versionEndorsementCount; // Vote counts
mapping(bytes32 => mapping(uint256 => ChildRef[])) public childrenOf;         // Parent-child relationships
mapping(uint256 => bytes32) public tokenIdToPerson;                           // NFT => person mapping
mapping(uint256 => uint256) public tokenIdToVersionIndex;                     // NFT => version mapping
mapping(uint256 => PersonCoreInfo) public nftCoreInfo;                        // NFT core data
mapping(bytes32 => mapping(uint256 => uint256)) public versionToTokenId;      // Version => NFT mapping
```

### Access Control & Security

#### Permission Model
- **Open Submission**: Anyone can add person versions with valid ZK proofs
- **Endorsement Gating**: Requires DEEP token balance and allowance
- **NFT Holder Rights**: Exclusive story management and tokenURI updates
- **Immutability**: Sealed stories cannot be modified by anyone

#### Security Features
- **50+ Custom Errors**: Explicit revert reasons for all failure cases
- **Reentrancy Guards**: Protection on all external value transfers
- **Input Validation**: Comprehensive parameter checking with constraints
- **ETH Rejection**: Contract rejects direct ETH transfers (receive/fallback revert)
- **ZK Proof Validation**: Dual verifier system prevents unauthorized submissions

## DeepFamilyToken.sol - DEEP ERC20 Mining Token

**Location**: `contracts/DeepFamilyToken.sol`
**Description**: Standard ERC20 token with progressive halving mining mechanics for family tree protocol incentives.

### Mining Constants

```solidity
uint256 public constant MAX_SUPPLY = 100_000_000_000e18;  // 100 billion cap
uint256 public constant INITIAL_REWARD = 113_777e18;      // Initial reward
uint256 public constant MIN_REWARD = 1e15;               // Minimum reward (0.001 tokens)
uint256 public constant FIXED_LENGTH = 100_000_000;      // Fixed cycle length after 9th cycle

uint256[] public cycleLengths = [1, 10, 100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000];
```

### Progressive Halving Mechanics

**Cycle Progression**:
- Cycles: 1 → 10 → 100 → 1K → 10K → 100K → 1M → 10M → 100M → Fixed 100M
- Each cycle completion halves reward via bit shifting: `INITIAL_REWARD >> cycleIndex`
- Mining stops when halved reward < `MIN_REWARD` (0.001 DEEP)
- Final supply: ~100 billion DEEP (slightly less due to MIN_REWARD cutoff)

**Reward Calculation**:
```solidity
function getReward(uint256 recordCount) public view returns (uint256) {
    uint256 cycleIndex;
    uint256 countLeft = recordCount;

    // Determine cycle index based on record count
    for (uint256 i = 0; i < cycleLengths.length; i++) {
        uint256 len = cycleLengths[i];
        if (countLeft <= len) {
            cycleIndex = i;
            break;
        }
        countLeft -= len;

        // Handle post-9th cycle fixed lengths
        if (i == cycleLengths.length - 1) {
            uint256 extraCycles = (countLeft - 1) / FIXED_LENGTH + 1;
            cycleIndex = i + extraCycles;
            break;
        }
    }

    uint256 reward = INITIAL_REWARD >> cycleIndex;
    return reward < MIN_REWARD ? 0 : reward;
}
```

### Core Functions

#### Initialization
```solidity
function initialize(address _deepFamilyContract) external onlyOwner
```
- Owner-only, single-use function
- Registers authorized DeepFamily contract address
- Prevents unauthorized minting after deployment

#### Mining
```solidity
function mint(address miner) external onlyDeepFamilyContract returns (uint256 reward)
```
- **Callable only by DeepFamily contract**
- Checks reward calculation for next addition index
- Enforces MAX_SUPPLY cap with partial reward if needed
- Updates `totalAdditions` counter and `recentReward` for endorsement pricing
- Returns 0 if reward would be below MIN_REWARD threshold

#### View Functions
```solidity
function recentReward() external view returns (uint256)  // Latest minted amount
function getReward(uint256 recordCount) public view returns (uint256)  // Reward for specific index
```

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `deepFamilyContract` | address | Authorized minting contract |
| `initialized` | bool | Prevents re-initialization |
| `totalAdditions` | uint256 | Count of successful reward-generating additions |
| `recentReward` | uint256 | Latest minted amount (used for endorsement fees) |

### Events

```solidity
event MiningReward(address indexed miner, uint256 reward, uint256 totalAdditions);
```

### Access Control

**Restricted Functions**:
- `mint()`: Protected by `onlyDeepFamilyContract` modifier
- `initialize()`: Owner-only, single-use initialization

**Security Features**:
- Supply cap enforcement (halts at 100B tokens)
- Minimum reward threshold prevents dust issuance
- Custom error types for precise debugging
- OpenZeppelin's secure ERC20 base implementation

## ZK Verifier Contracts

### PersonHashVerifier.sol
**Purpose**: Validates person identity and family relationships for `addPersonZK()`
**Public Signals**: 7 values (person/father/mother hash limbs + submitter address)
**Verification**: Groth16 proof with circuit `person_hash_zk.circom`

### NamePoseidonVerifier.sol
**Purpose**: Proves knowledge of full name and salt for NFT minting
**Public Signals**: 4 values (Poseidon commitment limbs + name hash limbs)
**Verification**: Groth16 proof with circuit `name_poseidon_zk.circom`

Both verifiers are auto-generated from circom circuits and implement the standard interface:
```solidity
function verifyProof(
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[] memory publicSignals
) public view returns (bool)
```

## Contract Security Summary

### Comprehensive Error Handling
All contracts implement extensive custom error types for precise debugging:

**DeepFamily.sol Errors** (50+ types):
```solidity
// Input validation errors
error InvalidPersonHash();
error InvalidVersionIndex();
error InvalidFullName();
error InvalidZKProof();

// Business logic errors
error DuplicateVersion();
error MustEndorseVersionFirst();
error VersionAlreadyMinted();

// Access control errors
error MustBeNFTHolder();
error StoryAlreadySealed();
error TokenContractNotSet();
```

### Security Patterns
- **Reentrancy Guards**: All external value transfers protected via OpenZeppelin's `nonReentrant`
- **Input Validation**: Comprehensive parameter checking with custom constraints
- **Access Control**: Role-based permissions with explicit error types
- **Immutability Controls**: Sealed stories and initialized contracts prevent further modification
- **Domain Separation**: keccak256 wrapper prevents hash collision attacks

### Gas Optimization Features
- **Struct Packing**: Optimized storage layout (`address` + `uint96` timestamp in single slot)
- **Paginated Queries**: All list functions support efficient pagination with `MAX_QUERY_PAGE_SIZE`
- **Event-Driven Architecture**: Frontend synchronization via indexed blockchain events
- **Limb-Based Hashing**: 128-bit limb representation enables efficient ZK verification
- **Batch-Ready Design**: Functions designed for future batch operation implementations