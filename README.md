# DeepFamily - Decentralized Global Family Tree Protocol

## Overview
DeepFamily is a blockchain-based decentralized global digital family tree protocol that leverages blockchain technology, NFTs, ERC20 token economics, and community governance to create a collaborative, verifiable, perpetual, and globally shared family history recording system. The protocol implements a dual-layer architecture that balances privacy protection with value creation through hash-based storage and zero-knowledge proofs.

## Hackathon
Code Without Borders - SummerHackfest 2025 (August 18 – September 22, 2025)

## Team
- HappCode (GitHub: @HappyCodeBase, Discord: blocknonce#0422)

## Problem Statement
Traditional family tree research faces several critical challenges:
- **Fragmented Data**: Family history information is scattered across private databases and personal records
- **Privacy Concerns**: Sharing personal family information requires trust in centralized platforms
- **Data Loss Risk**: Family histories can be lost when platforms shut down or data gets corrupted
- **Limited Accessibility**: Family tree services are expensive and geographically restricted
- **Lack of Incentives**: No economic motivation for people to contribute accurate family data

## Solution
DeepFamily solves these problems through:
- **Decentralized Storage**: Immutable blockchain storage ensures permanent family history preservation
- **Privacy-First Design**: Hash-based identity system with optional zero-knowledge proofs protects personal data
- **Economic Incentives**: DEEP token rewards encourage quality contributions and complete family trees
- **Community Validation**: Fee-based endorsement system builds trust through economic signaling
- **Global Accessibility**: Borderless protocol accessible to anyone with internet connection
- **Progressive Disclosure**: Users control information revelation from private hashes to public NFTs

## Conflux Integration
DeepFamily is designed to leverage Conflux features for optimal performance and user experience:
- [x] **eSpace**: Smart contracts deployed and tested on Conflux eSpace for EVM compatibility
- [ ] **Core Space**: Planned deployment for maximum decentralization benefits
- [ ] **Cross-Space Bridge**: Future integration for multi-space asset management
- [ ] **Gas Sponsorship**: Planned implementation for seamless user onboarding
- [ ] **Built-in Contracts**: Future integration for enhanced functionality
- [ ] **Partner Integrations**: Planned Privy/Pyth integrations for improved UX

## Features
- **Multi-Version Family tree**: Each person can have multiple verified data versions with provenance tracking
- **Zero-Knowledge Privacy**: Groth16 proof system enables privacy-preserving data submission
- **Community Endorsement**: Fee-based validation system with dynamic fee distribution
- **NFT Ecosystem**: Community-endorsed versions can mint unique ERC721 tokens with rich metadata
- **Story Sharding**: Biographical content sharded into up to 100 chunks of 1KB (100KB total) with immutable sealing
- **Progressive Mining**: Advanced tokenomics with variable-length cycles and exponential reward decay
- **Interactive Visualization**: D3.js-powered family tree with multiple layout options
- **Multi-Language Support**: i18n implementation with English, Chinese (Simplified/Traditional) support

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, D3.js
- **Backend**: Hardhat, Node.js 18+, Ethers v6
- **Blockchain**: Conflux eSpace (primary), Ethereum, Polygon, Arbitrum, BSC
- **Smart Contracts**: Solidity ^0.8.20, OpenZeppelin v5.0
- **Privacy**: Zero-knowledge proofs (Groth16), SnarkJS
- **Storage**: IPFS integration for metadata
- **Development**: TypeScript, Prettier, Husky pre-commit hooks

## Setup Instructions

### Prerequisites
- Node.js v18.0.0+
- Git
- Conflux wallet (Fluent Wallet recommended) or MetaMask
- NPM or Yarn package manager

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/deepfamilylabs/DeepFamily.git
   cd DeepFamily
   ```
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

### Testing
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

# 6. Configure frontend environment
npm run frontend:config

# This automatically configures for local development
# For manual configuration: copy frontend/.env.example to frontend/.env and update values

# 7. Start frontend development server
npm run frontend:dev

## Architecture

DeepFamily implements a sophisticated dual-layer blockchain architecture:

### Layer 1: Privacy Protection (Hash-Based Relationships)
- Hash-only storage of personal identities as keccak256 hashes
- Genealogical connections via personHash → fatherHash + motherHash references
- Multi-version support with zero-knowledge proof integration
- Low-barrier participation without privacy risks

### Layer 2: Value Confirmation (NFT + Token Economics)
- Community-endorsed versions can mint unique ERC721 tokens
- Story sharding system for rich biographical content (100×1KB chunks)
- DEEP token rewards for complete family relationship data
- Dynamic endorsement system with fee distribution

### Core Components (1,795 lines of code)
- **DeepFamily.sol** (1,384 lines): Core protocol with family tree, endorsements, NFTs
- **DeepFamilyToken.sol** (201 lines): DEEP ERC20 with progressive halving mining
- **PersonHashVerifier.sol** (210 lines): Groth16 zero-knowledge proof verifier

## Smart Contracts

### Conflux eSpace Testnet
- DeepFamily: `0x63ea5897C88c9Dac09c3d5Af7a55f1442F08A7E9`
- DeepFamilyToken: `0x3472a50766E29Ae6BDf218BfcDD21aE2ad67db82`
- PersonHashVerifier: `0xF0442D0281bA02683C3466f53474F552Ac31621d`

### Conflux eSpace Mainnet
- DeepFamily: `TBD`
- DeepFamilyToken: `TBD`
- PersonHashVerifier: `TBD`

## Future Improvements

### Technical Enhancements
- **Mobile Application**: React Native app for mobile-first family tree experience
- **Advanced ZK Circuits**: Production-ready zero-knowledge proof system
- **Graph Protocol**: Advanced indexing for complex genealogical queries

### Feature Expansions
- **Advanced Visualization**: 3D family tree rendering

### Known Limitations
- Zero-knowledge circuits require production deployment and testing
- Gas costs may be significant for large family trees on mainnet

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Conflux Network**: For providing scalable blockchain infrastructure with low fees
- **OpenZeppelin**: For battle-tested smart contract security primitives
- **D3.js Community**: For powerful data visualization libraries
- **React Ecosystem**: For modern frontend development tools

---

## 📚 Additional Documentation

For comprehensive technical documentation, see:
- [Architecture Guide](architecture.md) - System design and dual-layer approach
- [Smart Contracts Reference](contracts.md) - Complete API documentation
- [Data Model](data-model.md) - Person, version, and relationship structures
- [Tokenomics](tokenomics.md) - DEEP token economics and mining mechanics
- [API Reference](api.md) - Hardhat tasks and interaction patterns
- [Frontend Integration](frontend.md) - React dApp development guide
- [Zero-Knowledge Proofs](zero-knowledge-proofs.md) - Privacy implementation details

**🌳 Building a shared digital family heritage for humanity 🌳**