# 💰 DEEP Token Economics

## 🏦 Token Supply & Distribution

### **Economic Parameters**
| Parameter | Value | Impact |
|-----------|-------|---------|
| **Total Supply Cap** | 100,000,000,000 DEEP | Hard maximum, prevents infinite inflation |
| **Initial Mining Reward** | 113,777 DEEP | Starting reward per qualified family addition |
| **Minimum Reward Threshold** | 0.1 DEEP | Halving termination point |
| **Token Symbol** | DEEP | ERC20 standard compliance |
| **Decimal Places** | 18 | Standard Ethereum token precision |

### **Progressive Halving Mechanism**

**Unique Variable-Length Cycle System**:
```
Cycle Lengths: [1, 10, 100, 1k, 10k, 100k, 1M, 10M, 100M, then fixed 100M]
Reward Schedule: 113,777 → 56,888.5 → 28,444.25 → 14,222.125 → ... → 0.1
```

**Cycle Progression Logic**:
- **Early Acceleration**: Short cycles (1, 10, 100) for rapid initial distribution
- **Growing Stability**: Medium cycles (1k, 10k, 100k) for ecosystem development
- **Long-term Sustainability**: Extended cycles (1M, 10M, 100M) for mature adoption
- **Infinite Stability**: Fixed 100M cycle length after 9th halving

**Termination Conditions**:
1. **Reward Threshold**: Mining stops when reward < 0.1 DEEP
2. **Supply Cap**: Hard termination at 100B total supply
3. **Economic Result**: Actual supply ≈ 99.99B DEEP (slightly under theoretical convergence)

## ⚡ Mining Mechanics

### **Qualified Addition Requirements**
Mining rewards are **only** distributed when:
1. **Complete Family Data**: Both father and mother hashes must exist in the system
2. **Valid Parent References**: Parent versions must be previously recorded
3. **Unique Contribution**: No duplicate person versions allowed
4. **Valid Zero-Knowledge Proof**: (when using ZK submission path)

### **Mining Reward Calculation**
```solidity
function getCurrentReward(uint256 additionIndex) public view returns (uint256) {
    uint256 currentCycle = getCurrentCycle(additionIndex);
    uint256 halvingCount = currentCycle;

    uint256 reward = INITIAL_REWARD;
    for (uint256 i = 0; i < halvingCount; i++) {
        reward = reward / 2;
    }

    return reward >= MIN_REWARD ? reward : 0;
}
```

### **Economic Incentive Structure**
- **Family Completeness**: Rewards encourage building complete family trees, not isolated entries
- **Quality over Quantity**: Higher rewards for early contributors who establish foundational genealogical data
- **Diminishing Returns**: Later contributions receive smaller rewards, maintaining economic sustainability
- **Network Effects**: Complete families unlock mining for descendant additions

## 🤝 Community Endorsement Economics

### **Fee-Based Endorsement Model**
Users validate data quality by paying the **current mining reward** as a fee to endorse specific person versions.

**Endorsement Mechanics**:
```solidity
function endorseVersion(bytes32 personHash, uint256 versionIndex) external {
    uint256 endorsementFee = token.recentReward(); // Current mining reward
    require(token.transferFrom(msg.sender, address(this), endorsementFee));

    // Fee distribution based on NFT status
    if (versionToTokenId[personHash][versionIndex] == 0) {
        // Pre-NFT: 100% to version creator
        token.transfer(versionCreator, endorsementFee);
    } else {
        // Post-NFT: 100% to current NFT holder
        address nftOwner = ownerOf(versionToTokenId[personHash][versionIndex]);
        token.transfer(nftOwner, endorsementFee);
    }
}
```

### **Dynamic Fee Distribution**

| NFT Status | Fee Recipient | Economic Rationale |
|------------|---------------|-------------------|
| **Pre-NFT** (Version not minted) | 100% → Version Creator | Incentivize accurate initial data contribution |
| **Post-NFT** (NFT minted) | 100% → Current NFT Holder | Reward NFT ownership and curation responsibility |

**Economic Benefits**:
- **Anti-Spam Design**: High endorsement cost (= current mining reward) prevents frivolous endorsements
- **Quality Signaling**: Expensive endorsements indicate genuine community confidence
- **Value Accrual**: NFT holders benefit from ongoing community validation
- **Creator Incentives**: Original contributors rewarded for quality submissions

## 🎨 NFT Value Economics

### **NFT Minting Requirements**
1. **Prior Endorsement**: Must endorse the target version first (pay endorsement fee)
2. **One-Time Creation**: Each person version can mint exactly one NFT
3. **Rich Metadata**: NFT includes on-chain biographical data and story shards

### **NFT Economic Benefits**
- **Fee Stream Capture**: All future endorsements flow to NFT holder
- **Story Control**: Exclusive rights to add/edit biographical content (until sealed)
- **Cultural Value**: Recognition as steward of historical family information
- **Market Participation**: Standard ERC721 enables secondary market trading

### **Story Sharding Economics**
- **Content Expansion**: Up to 100KB biographical content per NFT
- **Incremental Development**: Add story chunks over time without gas limit issues
- **Permanent Sealing**: Lock content for historical preservation (irreversible)
- **Cultural Heritage**: Build comprehensive family histories with community validation

## 🛡️ Economic Security & Attack Resistance

### **Sybil Attack Protection**

| Attack Vector | Economic Mitigation | Technical Enforcement |
|---------------|---------------------|----------------------|
| **Mass Person Creation** | No reward without complete family data | `require(fatherExists && motherExists)` |
| **Fake Parent Relationships** | Community endorsement required for NFT value | Social consensus through fee-based validation |
| **Endorsement Spam** | High cost = current mining reward | Dynamic pricing prevents cheap spam |
| **Version Griefing** | New versions required, no edits | Immutable versions + social migration |

### **Economic Alignment Mechanisms**

**Mining Incentives**:
- ✅ **Encourages**: Complete family tree construction
- ✅ **Rewards**: Early ecosystem contributors with higher rewards
- ❌ **Discourages**: Isolated person entries without family context
- ❌ **Prevents**: Infinite token inflation through hard cap

**Endorsement Incentives**:
- ✅ **Encourages**: Community validation of accurate data
- ✅ **Rewards**: NFT holders with ongoing fee streams
- ❌ **Discourages**: Spam endorsements through dynamic pricing
- ❌ **Prevents**: Version squatting through endorsement requirements

### **Long-term Economic Sustainability**

**Deflationary Pressure Mechanisms**:
1. **Decreasing Issuance**: Halving mechanism reduces new token supply over time
2. **Utility Demand**: Endorsement fees create continuous token demand
3. **NFT Value**: Token fees flow to NFT ecosystem, creating value sinks
4. **Network Effects**: Growing genealogical data increases overall system value

**Economic Phases**:
- **Phase 1** (Early): High rewards attract initial contributors and data
- **Phase 2** (Growth): Moderate rewards + endorsement activity drive quality improvements
- **Phase 3** (Maturity): Low issuance + high utility demand = sustainable token economics
- **Phase 4** (Completion): Zero new issuance, pure utility-driven token economy

## 📊 Economic Projections

### **Supply Distribution Timeline**

| Phase | Cycle Range | Approximate Duration | Tokens Issued | Cumulative Supply |
|-------|-------------|---------------------|---------------|------------------|
| **Bootstrap** | Cycles 1-3 | ~111 qualified additions | ~12.6M DEEP | ~12.6M DEEP |
| **Growth** | Cycles 4-6 | ~111k qualified additions | ~31.5M DEEP | ~44.1M DEEP |
| **Expansion** | Cycles 7-9 | ~111M qualified additions | ~24.6M DEEP | ~68.7M DEEP |
| **Maturity** | Cycle 10+ | Ongoing | ~31.3M DEEP | ~100B DEEP |

### **Network Value Drivers**

**Direct Value Creation**:
- **Genealogical Data**: Comprehensive global family tree database
- **Cultural Heritage**: Preserved biographical stories and family histories
- **Community Validation**: Social consensus on data accuracy and quality
- **NFT Ecosystem**: Tradeable cultural and historical assets

**Indirect Value Benefits**:
- **Network Effects**: More family data increases value for all participants
- **Research Utility**: Academic and historical research applications
- **Identity Services**: Decentralized identity and relationship verification
- **Cultural Preservation**: Permanent historical record preservation

---

## 🎯 Tokenomics Summary

### **Economic Innovation**
- **Progressive Halving**: Unique variable-length cycle system optimizes distribution timing
- **Quality Mining**: Rewards tied to complete family data rather than simple submissions
- **Dynamic Endorsements**: Anti-spam pricing that scales with mining rewards
- **Dual-Value Model**: Both token utility and NFT cultural value

### **Sustainable Incentives**
- **Early Contributor Rewards**: Higher rewards for foundational ecosystem building
- **Community Validation**: Economic fees ensure data quality through social consensus
- **Long-term Value**: NFT fee streams and cultural heritage create lasting economic value
- **Attack Resistance**: Multiple economic barriers prevent abuse and gaming

### **Global Impact Potential**
- **Democratized Family tree**: Economic incentives make global family history accessible
- **Cultural Preservation**: Token rewards encourage documentation of family stories
- **Community Building**: Shared economic interests unite global family tree community
- **Historical Legacy**: Blockchain permanence ensures intergenerational knowledge transfer