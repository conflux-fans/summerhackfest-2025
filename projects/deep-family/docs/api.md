# 🔌 DeepFamily API Reference

## 🛠️ Hardhat Tasks (16 CLI Tools)

DeepFamily provides comprehensive Hardhat tasks for protocol interaction, testing, and management.

### **Person Management Tasks**

| Task | Parameters | Description | Usage |
|------|------------|-------------|-------|
| `add-person` | `--fullname`, `--birthyear`, `--father`, `--mother` | Add person version (non-ZK path) | `npx hardhat add-person --fullname "John Smith" --birthyear 1980` |
| `endorse` | `--person`, `--version` | Endorse specific person version | `npx hardhat endorse --person 0x123... --version 1` |
| `mint-nft` | `--person`, `--version` | Mint NFT for endorsed version | `npx hardhat mint-nft --person 0x123... --version 1` |

### **Story Management Tasks**

| Task | Parameters | Description | Usage |
|------|------------|-------------|-------|
| `add-story-chunk` | `--token`, `--index`, `--content` | Add biography chunk to NFT | `npx hardhat add-story-chunk --token 1 --index 0 --content "Born in..."` |
| `update-story-chunk` | `--token`, `--index`, `--content` | Update existing chunk (if not sealed) | `npx hardhat update-story-chunk --token 1 --index 0 --content "Updated..."` |
| `seal-story` | `--token` | Make story permanently immutable | `npx hardhat seal-story --token 1` |
| `list-story-chunks` | `--token`, `--offset`, `--limit` | Enumerate story chunks | `npx hardhat list-story-chunks --token 1` |

### **Query & Analysis Tasks**

| Task | Parameters | Description | Usage |
|------|------------|-------------|-------|
| `list-persons` | `--name`, `--offset`, `--limit` | Find persons by name hash | `npx hardhat list-persons --name "John Smith"` |
| `list-versions` | `--person`, `--offset`, `--limit` | List versions for person | `npx hardhat list-versions --person 0x123...` |
| `list-children` | `--parent`, `--version`, `--offset`, `--limit` | Get child references | `npx hardhat list-children --parent 0x123... --version 1` |
| `get-version-details` | `--person`, `--version` | Complete version information | `npx hardhat get-version-details --person 0x123... --version 1` |

### **Network & Utility Tasks**

| Task | Parameters | Description | Usage |
|------|------------|-------------|-------|
| `networks:list` | None | Show configured networks | `npx hardhat networks:list` |
| `networks:check` | `--network` | Test network connectivity | `npx hardhat networks:check --network holesky` |
| `check-root` | None | Validate root node data | `npx hardhat check-root` |
| `token-info` | None | Display DEEP token statistics | `npx hardhat token-info` |

**Task Usage Notes**:
- All tasks support `--network` parameter for multi-chain deployment
- Use `--help` flag with any task for detailed parameter information
- Tasks automatically handle ABI loading and contract address resolution

## 📡 Smart Contract API

### **Core Transaction Functions**

#### **Person Management**

**`addPersonZK(proof, publicSignals, personInfo, tag, metadataCID)`**
```solidity
function addPersonZK(
    uint256[2] calldata a,
    uint256[2][2] calldata b,
    uint256[2] calldata c,
    uint256[7] calldata publicSignals,
    PersonBasicInfo calldata personInfo,
    string calldata tag,
    string calldata metadataCID
) external returns (uint256 versionIndex)
```
- **Purpose**: Add person version with zero-knowledge proof validation
- **Returns**: New version index number
- **Events**: `PersonVersionAdded`, optionally `TokenRewardDistributed`
- **Requirements**: Valid Groth16 proof, unique version data
- **Gas Cost**: ~200k gas (varies with parent existence)

#### **Community Endorsement**

**`endorseVersion(personHash, versionIndex)`**
```solidity
function endorseVersion(bytes32 personHash, uint256 versionIndex)
    external nonReentrant
```
- **Purpose**: Pay DEEP tokens as fee to endorse specific person version
- **Requirements**: ERC20 allowance for current `recentReward()` amount
- **Fee Distribution**: Pre-NFT → creator, Post-NFT → NFT holder
- **Events**: `PersonVersionEndorsed`
- **Gas Cost**: ~150k gas

#### **NFT System**

**`mintPersonNFT(personHash, versionIndex, coreInfo, tokenURI)`**
```solidity
function mintPersonNFT(
    bytes32 personHash,
    uint256 versionIndex,
    PersonCoreInfo calldata coreInfo,
    string calldata tokenURI
) external returns (uint256 tokenId)
```
- **Purpose**: Create NFT for previously endorsed person version
- **Requirements**: Must have endorsed the target version
- **Returns**: New ERC721 token ID
- **Events**: `PersonNFTMinted`
- **Gas Cost**: ~300k gas

#### **Story Sharding**

**`addStoryChunk(tokenId, chunkIndex, content)`**
```solidity
function addStoryChunk(uint256 tokenId, uint256 chunkIndex, string calldata content)
    external
```
- **Purpose**: Add biographical content chunk to NFT
- **Requirements**: Must be NFT holder, story not sealed, content ≤1KB
- **Events**: `StoryChunkAdded`
- **Gas Cost**: ~100k gas (varies with content length)

**`updateStoryChunk(tokenId, chunkIndex, content)`**
```solidity
function updateStoryChunk(uint256 tokenId, uint256 chunkIndex, string calldata content)
    external
```
- **Purpose**: Modify existing story chunk
- **Requirements**: Must be NFT holder, story not sealed, chunk exists
- **Events**: `StoryChunkUpdated`

**`sealStory(tokenId)`**
```solidity
function sealStory(uint256 tokenId) external
```
- **Purpose**: Make story permanently immutable
- **Requirements**: Must be NFT holder
- **Warning**: Irreversible operation
- **Events**: `StorySealed`

### **View Functions (Gas-Optimized Queries)**

#### **Person Discovery**

**`listPersonHashesByFullName(nameHash, offset, limit)`**
```solidity
function listPersonHashesByFullName(bytes32 nameHash, uint256 offset, uint256 limit)
    external view returns (
        bytes32[] memory personHashes,
        uint256 totalCount,
        bool hasMore,
        uint256 nextOffset
    )
```
- **Purpose**: Find persons by name hash with pagination
- **Gas Cost**: ~50k gas (varies with result count)

**`listPersonVersions(personHash, offset, limit)`**
```solidity
function listPersonVersions(bytes32 personHash, uint256 offset, uint256 limit)
    external view returns (
        PersonVersion[] memory versions,
        uint256 totalCount,
        bool hasMore,
        uint256 nextOffset
    )
```
- **Purpose**: Get all versions for specific person
- **Gas Cost**: ~30k gas per version returned

#### **Relationship Queries**

**`listChildren(parentHash, parentVersionIndex, offset, limit)`**
```solidity
function listChildren(
    bytes32 parentHash,
    uint256 parentVersionIndex,
    uint256 offset,
    uint256 limit
) external view returns (
    ChildRef[] memory children,
    uint256 totalCount,
    bool hasMore,
    uint256 nextOffset
)
```
- **Purpose**: Get child references for parent version
- **Returns**: Array of child hash + version index pairs

#### **Detailed Information**

**`getVersionDetails(personHash, versionIndex)`**
```solidity
function getVersionDetails(bytes32 personHash, uint256 versionIndex)
    external view returns (
        PersonVersion memory version,
        uint256 endorsementCount,
        uint256 tokenId,
        address[] memory endorsers
    )
```
- **Purpose**: Complete information for specific version
- **Includes**: Version data, endorsement statistics, NFT token ID (if minted)

**`getNFTDetails(tokenId)`**
```solidity
function getNFTDetails(uint256 tokenId) external view returns (
    PersonCoreInfo memory coreInfo,
    StoryMetadata memory storyMetadata,
    address owner,
    string memory tokenURI
)
```
- **Purpose**: Comprehensive NFT information
- **Includes**: On-chain biographical data, story statistics, ownership

## 📄 Pagination System

### **Pagination Pattern**
All list functions implement consistent pagination with gas optimization:

```solidity
struct PaginationResult {
    SomeItem[] items;      // Requested data slice
    uint256 totalCount;    // Total items available
    bool hasMore;          // Whether more items exist
    uint256 nextOffset;    // Next page starting point
}
```

### **Pagination Best Practices**

**Gas Optimization**:
```javascript
// Check total count before fetching data
const { totalCount } = await contract.listPersonVersions(personHash, 0, 0); // limit=0 for count only

// Fetch data in reasonable chunks
const pageSize = 50; // Reasonable gas limit
for (let offset = 0; offset < totalCount; offset += pageSize) {
    const { items, hasMore } = await contract.listPersonVersions(personHash, offset, pageSize);
    // Process items...
    if (!hasMore) break;
}
```

**Frontend Integration**:
- Use `limit=0` calls to get total counts for UI pagination controls
- Implement infinite scroll with reasonable page sizes (50-100 items)
- Cache results to avoid repeated queries for same data

## ⚠️ Error Handling System

DeepFamily implements comprehensive custom error handling for precise debugging and user feedback.

### **Common Error Types**

**Input Validation Errors**:
```solidity
error InvalidPersonHash();           // Hash doesn't match expected format
error InvalidVersionIndex();         // Version number out of range
error InvalidFullName();            // Name validation failed
error InvalidZKProof();             // Zero-knowledge proof verification failed
```

**Business Logic Errors**:
```solidity
error DuplicateVersion();           // Version already exists for person
error MustEndorseVersionFirst();    // NFT minting requires prior endorsement
error VersionAlreadyMinted();       // NFT already exists for this version
error BasicInfoMismatch();          // Person info doesn't match hash
```

**Story System Errors**:
```solidity
error StoryAlreadySealed();         // Cannot modify sealed story
error ChunkIndexOutOfRange();       // Invalid chunk number
error InvalidChunkContent();        // Content validation failed
error MustBeNFTHolder();           // Only NFT holder can modify story
```

**Token Integration Errors**:
```solidity
error TokenContractNotSet();       // DEEP token contract not initialized
error EndorsementFeeTransferFailed(); // ERC20 transfer failed
error InsufficientAllowance();     // Need ERC20 approval
```

### **Error Handling Examples**

**Frontend JavaScript**:
```javascript
try {
    await contract.endorseVersion(personHash, versionIndex);
} catch (error) {
    if (error.message.includes('MustEndorseVersionFirst')) {
        showError('Please endorse this version before minting NFT');
    } else if (error.message.includes('InsufficientAllowance')) {
        showError('Please approve DEEP token spending first');
    } else {
        showError('Transaction failed: ' + error.message);
    }
}
```

**Hardhat Task Error Handling**:
```javascript
task("endorse", "Endorse a person version")
    .addParam("person", "Person hash")
    .addParam("version", "Version index")
    .setAction(async (taskArgs, hre) => {
        try {
            const tx = await deepFamily.endorseVersion(taskArgs.person, taskArgs.version);
            console.log(`✅ Endorsed version ${taskArgs.version} for person ${taskArgs.person}`);
        } catch (error) {
            if (error.message.includes('EndorsementFeeTransferFailed')) {
                console.error('❌ Insufficient DEEP tokens or allowance');
            } else {
                console.error('❌ Endorsement failed:', error.message);
            }
        }
    });
```

## ⚡ Gas Optimization Guidelines

### **Query Optimization**
- **Count First**: Use `limit=0` to get total counts before fetching data
- **Reasonable Pages**: Limit queries to 50-100 items per call
- **Cache Results**: Store frequently accessed data locally
- **Batch Operations**: Combine multiple related calls when possible

### **Transaction Optimization**
- **Struct Packing**: Data structures optimized for minimal storage slots
- **Event Indexing**: Use events for efficient state synchronization
- **Allowance Management**: Set appropriate ERC20 allowances to avoid repeated approvals

### **Development Tips**
```javascript
// Efficient pattern for large datasets
async function getAllPersonVersions(personHash) {
    // First get count
    const { totalCount } = await contract.listPersonVersions(personHash, 0, 0);

    if (totalCount === 0) return [];

    // Fetch in optimal chunks
    const pageSize = Math.min(100, totalCount);
    const results = [];

    for (let offset = 0; offset < totalCount; offset += pageSize) {
        const { items } = await contract.listPersonVersions(personHash, offset, pageSize);
        results.push(...items);
    }

    return results;
}
```

## 🔗 Token Integration Patterns

### **DEEP Token Interaction**
```javascript
// Endorsement flow with proper allowance handling
async function endorseWithAllowance(personHash, versionIndex) {
    const currentReward = await deepFamilyToken.recentReward();
    const currentAllowance = await deepFamilyToken.allowance(userAddress, deepFamilyAddress);

    // Check and set allowance if needed
    if (currentAllowance.lt(currentReward)) {
        const approveTx = await deepFamilyToken.approve(deepFamilyAddress, currentReward);
        await approveTx.wait();
    }

    // Perform endorsement
    const endorseTx = await deepFamily.endorseVersion(personHash, versionIndex);
    return await endorseTx.wait();
}
```

### **Mining Reward Tracking**
```javascript
// Monitor mining rewards and supply
async function getTokenStats() {
    const totalSupply = await deepFamilyToken.totalSupply();
    const currentReward = await deepFamilyToken.recentReward();
    const totalAdditions = await deepFamilyToken.totalAdditions();
    const maxSupply = await deepFamilyToken.MAX_SUPPLY();

    return {
        totalSupply: ethers.utils.formatEther(totalSupply),
        currentReward: ethers.utils.formatEther(currentReward),
        totalAdditions: totalAdditions.toString(),
        remainingSupply: ethers.utils.formatEther(maxSupply.sub(totalSupply))
    };
}
```

---

## 🎯 API Usage Summary

### **Development Workflow**
1. **Use Hardhat Tasks**: For testing and initial development
2. **Integrate Smart Contract Calls**: For production dApp functionality
3. **Implement Proper Error Handling**: Use custom error types for user feedback
4. **Optimize Gas Usage**: Follow pagination and caching best practices
5. **Handle Token Integration**: Manage DEEP token allowances properly

### **Performance Considerations**
- **Query Functions**: ~30-50k gas each, safe for frequent calls
- **Transaction Functions**: ~100-300k gas, require careful UX design
- **Pagination**: Essential for large datasets, use reasonable page sizes
- **Event Monitoring**: Use blockchain events for real-time state synchronization

### **Security Best Practices**
- **Input Validation**: Always validate user inputs before contract calls
- **Error Handling**: Provide clear user feedback for all error conditions
- **Allowance Management**: Handle ERC20 approvals securely
- **Transaction Monitoring**: Wait for confirmations before updating UI state
