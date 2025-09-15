# DeepFamily - Decentralized Global On-Chain Family Tree Protocol

<div align="center">

![DeepFamily Logo](https://img.shields.io/badge/DeepFamily-v1.0.0-blue?style=for-the-badge&logo=ethereum)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-red?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)

**A blockchain-based decentralized global digital genealogy protocol**
*Leveraging NFTs, ERC20 tokenomics, and community governance for collaborative family history*

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🎯 Core Features](#-core-features) • [🏗️ Architecture](#️-architecture) • [🚀 Deployment](#-deployment) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 Vision & Mission

DeepFamily creates the world's first decentralized genealogy infrastructure, combining blockchain immutability with privacy-preserving technology to build a collaborative, verifiable, and perpetual family history recording system.

### 🎯 Core Principles
- 🔐 **Privacy-Preserving**: Dual-layer architecture with hash-based storage and zero-knowledge proofs
- 🌍 **Globally Accessible**: Borderless family connections powered by blockchain technology
- 💎 **Immutable Heritage**: Permanent on-chain storage ensures data preservation across generations
- 💰 **Incentivized Participation**: DEEP token rewards encourage quality contributions and family completeness
- 🤝 **Community-Driven**: Endorsement-based governance validates information quality and builds trust
- 🏗️ **Scalable Design**: Multi-version data model supports diverse cultural genealogy traditions

## 🎯 Core Features

### 🔐 Privacy & Security
- **Zero-Knowledge Proofs**: Groth16-based privacy-preserving data submission via `IPersonHashVerifier` interface
- **Hash-Only Storage**: Personal data stored as keccak256 hashes on-chain, with raw PII kept off-chain
- **Multi-Version Support**: Each person can have multiple verified versions with parent relationship tracking
- **Comprehensive Security**: 50+ custom errors, reentrancy protection, and access control mechanisms

### 🎨 NFT Ecosystem
- **Unique NFTs**: Each person version can mint exactly one ERC721 token with on-chain core metadata
- **Story Sharding**: Biographical data stored in up to 100 shards × 1KB each with immutable sealing
- **Value Recognition**: Endorsement-driven value accrual and fee distribution system
- **Rich Metadata**: On-chain name, birth/death years, and story hash with off-chain detailed content

### 💰 DEEP Token Economics
- **Smart Mining**: Rewards only granted when both parent relationships exist (complete family data)
- **Progressive Halving**: Advanced tokenomics with variable-length cycles and binary halving
  - Initial: 113,777 DEEP → Final: 0.1 DEEP minimum
  - Cycles: 1→10→100→1k→10k→100k→1M→10M→100M→fixed 100M
- **Capped Supply**: Maximum 100 billion DEEP tokens
- **Mining Incentives**: Encourages family tree completeness over isolated entries

### 🤝 Community Governance
- **Staked Endorsements**: Pay current mining reward to endorse trusted versions
- **Dynamic Fee Distribution**:
  - Pre-NFT: 100% to version creator
  - Post-NFT: 100% to current NFT holder
- **Quality Signaling**: Community endorsement count indicates version trustworthiness
- **Reputation System**: Build trust through verified contributions and endorsements

### 📊 Advanced Data Management
- **Name Indexing**: Hash-based reverse lookup for efficient person discovery
- **Paginated Queries**: Gas-optimized queries with 100-record limits
- **Composite APIs**: Single-call functions return complete relationship data
- **Version Control**: Full history preservation with immutable parent references

## 🏗️ Architecture

### 🔄 Dual-Layer Design

The system implements a sophisticated dual-layer architecture that balances privacy protection with value creation:

#### **Layer 1: Privacy Protection (Hash-Based Relationships)**
- **Hash Storage**: Only keccak256 hashes of personal information stored on-chain
- **Relationship Networks**: Build genealogical connections through `personHash`, `fatherHash`, `motherHash`
- **Low-Barrier Entry**: Safe participation without privacy risks
- **Token Incentives**: DEEP rewards for complete family data contributions

#### **Layer 2: Value Confirmation (NFT Assets)**
- **Selective Disclosure**: Community-endorsed information can be minted as NFTs
- **Value Solidification**: NFTs represent recognition of high-quality, verified data
- **Progressive Evolution**: Natural progression from private data → community validation → asset creation

### 📱 Technology Stack
- **Smart Contracts**: Solidity ^0.8.20, Hardhat, hardhat-deploy
- **Blockchain Layer**: ERC20 (DEEP token) + ERC721Enumerable (Family NFTs)
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + D3.js
- **Development**: Ethers v6, Hardhat testing, OpenZeppelin security primitives
- **Privacy**: Zero-knowledge proofs (Groth16), hash-based identity protection

### ⛓️ Smart Contract System

```
DeepFamily Contract Ecosystem
├── 📄 DeepFamily.sol 
│   ├── Multi-version person data management
│   ├── Community endorsement & fee distribution
│   ├── NFT minting with on-chain metadata
│   ├── Story sharding system (100×1KB chunks)
│   ├── Mining rewards for complete families
│   └── Paginated queries & gas optimization
│
├── 🪙 DeepFamilyToken.sol
│   ├── ERC20 with progressive halving
│   ├── 100 billion supply cap, 10 halving cycles
│   └── Authorized minting by DeepFamily contract only
│
└── 🔐 PersonHashVerifier.sol
    ├── Groth16 zero-knowledge proof verification
    ├── 7-limb hash validation for privacy
    └── Integration ready for production ZK circuits
```

### 🏗️ Project Structure
```
DeepFamily/
├── contracts/              # Smart Contracts (Solidity)
│   ├── DeepFamily.sol         # Main genealogy contract
│   ├── DeepFamilyToken.sol    # DEEP ERC20 token
│   └── PersonHashVerifier.sol # ZK proof verifier
├── frontend/               # React dApp
│   ├── src/
│   │   ├── components/        # UI components (33 files)
│   │   │   ├── FlexibleDAGView.tsx    # Flexible family tree
│   │   │   ├── ForceDAGView.tsx       # Force-directed tree
│   │   │   ├── NodeDetailModal.tsx    # Person details
│   │   │   └── ...
│   │   ├── pages/            # Application routes (9 pages)
│   │   ├── hooks/            # React hooks (8 hooks)
│   │   ├── context/          # State management (7 contexts)
│   │   ├── abi/              # Contract ABIs
│   │   └── utils/            # Helper utilities
├── test/                   # Hardhat Tests (8 test suites)
├── tasks/                  # Hardhat Tasks (16 custom tasks)
├── deploy/                 # Deployment Scripts
├── scripts/                # Utility Scripts
│   ├── seed-demo.js          # Demo data seeding
│   └── check-root.js         # Root node validation
├── docs/                   # Documentation (7 guides)
└── circuits/               # ZK Circuit Development
```

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** >= 18.0.0 (required by package.json engines)
- **npm** or **yarn** package manager
- **Git** version control

### 🔧 Environment Setup
1. Clone the repository
   ```bash
   git clone https://github.com/deepfamilylabs/DeepFamily.git
   cd DeepFamily
   ```
2. ZK Proving Key (.zkey) for Local Use

- Download `.zkey` (Groth16 proving key):
  https://github.com/deepfamilylabs/DeepFamily/releases/download/v1.0.0/person_hash_zk_final.zkey
- Place the file at: `frontend/public/zk/person_hash_zk_final.zkey`
  - The frontend loads artifacts from `frontend/public/zk/` and expects the exact filenames:
    - `person_hash_zk.wasm` (already included)
    - `person_hash_zk.vkey.json` (already included)
    - `person_hash_zk_final.zkey` (you need to download)

3. Install dependencies
   ```bash
   npm run setup
   # Installs root + frontend dependencies
   ```

4. Configure environment
   ```bash
   cp .env.example .env
   # Required for deployment and verification
   PRIVATE_KEY=0x... # Your deployer wallet private key
   ```

5. Compile smart contracts
   ```bash
   npm run build
   ```

6. Run complete development environment
   ```bash
   npm run dev:all
   # This starts: local node + contract deployment + demo data + frontend
   ```

### 🧪 Testing
```bash
# Run all contract tests
npm test

# Run with gas reporting
npm run test:gas

# Generate coverage report
npm run test:coverage

# Run specific test suites
npx hardhat test test/personVersion.test.js
npx hardhat test test/endorse.test.js
npx hardhat test test/mintNft.test.js
```

## Usage

### Complete Development Workflow
#### One-Command Full Stack
```bash
# Install all dependencies
npm run setup

# Compile smart contracts
npm run build

# Start complete development environment
npm run dev:all
# This starts: local node + contract deployment + demo data seeding + frontend
```

#### Manual Step-by-Step
```bash
# 1. Install dependencies
npm run setup

# 2. Compile contracts
npm run build

# 3. Start local Hardhat node
npm run dev:node

# 4. Deploy contracts
npm run dev:deploy

# 5. Seed demo data
npm run dev:seed

# 6. Start frontend development server
npm run frontend:dev
```


### 🌐 Access Points
- **Frontend dApp**: http://localhost:5173
- **Local Blockchain RPC**: http://localhost:8545
- **Contract Deployment**: Check terminal output for deployed addresses


## 🚀 Deployment Guide

### 🌐 Supported Networks
**Ethereum Family:**
- Mainnet, Sepolia, Holesky 

**Layer 2 Solutions:**
- Polygon: Mainnet, Amoy Testnet
- Arbitrum: Mainnet , Sepolia Testnet
- Optimism: Mainnet, Sepolia Testnet

**Alternative Chains:**
- BSC: Mainnet, Testnet
- Conflux eSpace: Mainnet, Testnet

### 📦 Multi-Network Deployment
```bash
# Deploy to specific network
npm run deploy:net --net=holesky
npm run deploy:net --net=polygonAmoy
npm run deploy:net --net=confluxTestnet

# Local development
npm run deploy:local

# Verify deployed contracts
npm run verify:net --net=holesky
```

## 📚 Core Docs
See detailed documents under `docs/`:
- [Architecture](docs/architecture.md)
- [Contracts Reference](docs/contracts.md)
- [Data Model](docs/data-model.md)
- [API & Tasks](docs/api.md)
- [Tokenomics](docs/tokenomics.md)
- [ZK Roadmap](docs/zk-roadmap.md)
- [Frontend Integration](docs/frontend.md)
3. Provide hosted service / decentralised index endpoints.

## 📘 Glossary
| Term | Meaning |
|------|---------|
| Person Hash | keccak256 of structured basic info (name + birth data + gender) |
| Version | A submitted record referencing optional parent version indices |
| Endorsement | Staked trust action paying current reward to version author / NFT holder |
| NFT | On-chain minted representation of a specific person version |
| Story Chunk | Sharded biography text segment (hashed & aggregated) |
| Full Story Hash | keccak256 of concatenated chunk hashes in order |
| Mining Reward | DEEP tokens minted when adding qualifying person version |

## 🤝 Contributing

### 🐛 Bug Reports
1. Search existing Issues
2. Open new issue with reproduction steps & env
3. Include logs & network details

### 💻 Code
1. Fork
2. Branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -am 'feat: add X'`
4. Push: `git push origin feat/your-feature`
5. Open PR

### 📋 Standards
- Prettier + Solhint + lint-staged pre-commit (husky)
- Conventional Commits
- Tests required for new features
- Update README / docs when changing core behaviors

## 🌍 Community

Links are placeholders until launch:
- **GitHub**: https://github.com/deepfamilylabs/DeepFamily

## 📄 License

MIT License (see [LICENSE](LICENSE) for full text). Excerpt:
```
MIT License

Copyright (c) 2025 DeepFamily
```
---

<div align="center">

**🌳 DeepFamily - Connect the Past, Record the Present, Preserve the Future 🌳**

[![GitHub Stars](https://img.shields.io/github/stars/deepfamilylabs/DeepFamily?style=social)](https://github.com/deepfamilylabs/DeepFamily.git)
[![GitHub Forks](https://img.shields.io/github/forks/deepfamilylabs/DeepFamily?style=social)](https://github.com/deepfamilylabs/DeepFamily.git)

*Building a shared digital family heritage for humanity*

</div>
