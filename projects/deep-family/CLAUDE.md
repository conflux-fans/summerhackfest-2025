# CLAUDE.md

## Project Overview

DeepFamily is a blockchain-based decentralized global digital genealogy protocol. Leveraging blockchain technology, NFTs, ERC20 token economics, and community governance, it creates a collaborative, verifiable, perpetual, and globally shared family history recording system.


## Dual-Layer Architecture Design

The system adopts a dual-layer architecture that balances privacy protection with value creation:

#### Layer 1: Privacy Protection Layer (Relational Data)
- **Hash Storage Mechanism**: Only hash values of personal information are stored on-chain, with original sensitive data kept off-chain
- **Relationship Establishment**: Build genealogical relationship networks through `personHash`, `fatherHash`, and `motherHash`
- **Low-Barrier Participation**: Anyone can safely contribute genealogical data without privacy leakage risks
- **Token Incentives**: Receive DEEP tokens for each `addPerson()` operation, encouraging data contribution

#### Layer 2: Value Confirmation Layer (NFT Assets)
- **Selective Disclosure**: High-quality information endorsed by the community can optionally be minted as NFTs
- **Value Solidification**: NFTs represent value recognition for specific version data

#### Architectural Advantages
- **Progressive Privacy Disclosure**: From private Hash → community validation → selective disclosure → NFT assetization
- **Layered Risk Management**: Layer 1 allows trial and error, Layer 2 ensures quality control
- **Tiered Incentive Mechanisms**: Tokens encourage data contribution, NFTs incentivize quality improvement
- **Value Discovery Mechanism**: Natural evolution from "information exploration" to "value confirmation"


### Smart Contract Architecture

**DeepFamily.sol** (Main Contract, 1447 lines)
- Multi-version person data with ZK proof support for privacy
- Community endorsement system with automatic fee distribution
- NFT minting with on-chain core information storage
- Story sharding system (100 shards × 1KB each)
- Mining rewards for complete family data
- Paginated queries with gas optimization

**DeepFamilyToken.sol** (ERC20 Contract, 208 lines)
- DEEP token with progressive halving mining (113,777 → 0.1)
- 100 billion supply cap with 10 halving cycles
- Authorized minting only by DeepFamily contract

### Key Features

#### Data Management
- **Multi-Version System**: Each person supports multiple data versions (indexed from 1) with duplicate prevention
- **Family Relationships**: Complete genealogical networks through personHash/fatherHash/motherHash with version references
- **Name Indexing**: Hash-based reverse indexing for rapid person discovery

#### Privacy & Security
- **Zero-Knowledge Proofs**: Groth16-based privacy-preserving data submission with limb-based hash processing
- **Access Control**: Role-based permissions (holders, endorsers) with 50+ custom error types
- **Reentrancy Protection**: Comprehensive security against attacks, rejects direct ETH transfers

#### Economic Incentives
- **Endorsement System**: Users endorse trusted versions, fees distributed between contributors and NFT holders
- **Mining Rewards**: DEEP tokens awarded for complete family data (113,777 → 0.1 progressive halving)
- **NFT Monetization**: One NFT per version with on-chain core information and updatable metadata

#### Scalability Solutions
- **Story Sharding**: Biographical data stored in up to 100×1KB shards with version control and sealing
- **Paginated Queries**: Gas-optimized queries with 100-record page limits and multi-dimensional indexing
- **Composite APIs**: Single-call functions return complete associated data

## Build System and Development Environment

### Overall Project Structure

```
DeepFamily/
├── contracts/              # Smart Contract Module
│   ├── DeepFamily.sol
│   ├── DeepFamilyToken.sol
├── frontend/               # React Frontend Application
│   ├── src/
│   │   ├── components/     # React Components
│   │   │   ├── FlexibleDAGView.tsx   # Flexible DAG FamilyTree
│   │   │   ├── ForceDAGView.tsx      # Force-Directed FamilyTree
│   │   │   ├── MerkleTreeView.tsx    # Merkle Tree FamilyTree
│   │   │   ├── NodeDetailModal.tsx   # Node Detail Modal
│   │   │   └── ...                   # Other UI Components
│   │   ├── pages/          # Route Pages
│   │   ├── types/          # TypeScript Type Definitions
│   │   ├── context/        # React Context
│   │   ├── abi/           # Contract ABI Files
│   │   └── lib/           # Utility Libraries
│   ├── scripts/           # Build Scripts
│   ├── package.json       # Frontend Dependencies
│   └── vite.config.ts     # Vite Configuration
├── test/                  # Smart Contract Tests
├── deploy/                # Deployment Scripts
├── tasks/                 # Hardhat Tasks
├── scripts/               # Utility Scripts
│   ├── check-root.js      # Check Root Node Script
│   └── seed-demo.js       # Demo Data Seeder
├── docs/                  # Project Documentation
└── package.json          # Main Project Dependencies
```

### Technology Stack

**Smart Contracts (Hardhat)**
- OpenZeppelin v5.0, Hardhat, Ethers v6, Solidity coverage & linting

**Frontend (React + Vite)**
- React 18, TypeScript, Vite, TailwindCSS, D3 familyTree
- Multi-DAG views, wallet integration, responsive design

**Indexing (The Graph)**
- GraphQL API, event indexing, real-time blockchain sync

### Development Commands

**Core Development**
```bash
npm run build                    # Compile contracts
npm run test                     # Run all tests
npm run dev:all                  # Start complete environment
npm run frontend:dev             # Frontend development server
```

**Deployment (Multi-chain)**
```bash
npm run deploy:conflux           # Conflux testnet
npm run deploy:holesky           # Holesky testnet (latest)
npm run deploy:mainnet           # Ethereum mainnet
npm run deploy:polygon           # Polygon networks
npm run deploy:arbitrum          # Arbitrum networks
```

**Code Quality & Testing**
```bash
npm run test:coverage            # Coverage analysis
npm run lint                     # Code standards check
npm run size                     # Contract size check
```

### Network Support & Configuration

**Supported Networks**: Ethereum (Sepolia/Holesky/Mainnet), Polygon, BSC, Arbitrum, Optimism, Conflux eSpace

**Environment Setup** (`.env` file):
```bash
PRIVATE_KEY=                     # Deployment key (secure!)
INFURA_API_KEY=                 # Network access
ETHERSCAN_API_KEY=              # Contract verification
# Additional keys for Polygon, BSC, Arbitrum, etc.
```


## Testing & Development Standards

**Comprehensive Testing Coverage**
- Integration testing (DeepFamily + Token system)
- Token economics (mining, halving, ERC20 compliance)  
- Security verification (reentrancy, access control)
- Governance mechanisms and gas optimization

**Development Guidelines**
- English documentation
- Synchronized test updates with new features
- Pre-production auditing required