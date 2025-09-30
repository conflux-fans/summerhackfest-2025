# DeepFamily - Decentralized Global Family Tree Protocol

## Overview
DeepFamily creates the decentralized family tree infrastructure, using zero-knowledge proofs and blockchain immutability to build a collaborative, verifiable, and perpetual family history recording system.

## Hackathon
Code Without Borders - SummerHackfest 2025 (August 18 – September 29, 2025)

## Team
- HappCode (GitHub: @HappyCodeBase)

## Problem Statement
Traditional family tree research faces several practical hurdles:
- **Fragmented Data**: Birth certificates, immigration records, and DNA matches are trapped across national archives, paid portals, and paper binders that do not interoperate.
- **Privacy & Verification Trade-off**: Families must hand over full names and documents to third-party sites just to prove a relationship, forfeiting privacy for validation.
- **Data Loss & Platform Dependency**: Paper family books fade or burn, while centralized genealogy sites can revoke exports, raise prices, or sunset products—erasing years of collaborative research.
- **Geographic & Economic Barriers**: Overseas relatives struggle with paywalled document copies, time-zone delays from archive staff, and scarce translations of records or interfaces.
- **Zero Economic Incentives**: Contributors manually transcribe records with no shared upside, so trees stagnate with missing branches and unverifiable anecdotes.

## Solution
DeepFamily leverages blockchain immutability, zero-knowledge proofs, and incentive design to tackle these problems:
- **Zero-Knowledge Privacy System**: Salted passphrase unlinkability using Poseidon hash function prevents identity inference and pollution attacks while enabling Groth16 proofs for private family member addition
- **Dual Tree Models**: Public collaborative trees (no/shared passphrase) vs. private protected trees (unique passphrase) giving users complete control over privacy levels
- **Smart Economic Incentives**: DEEP tokens only awarded when both parent relationships exist, encouraging complete family data
- **Community Endorsement Economy**: Pay current mining reward to endorse trusted versions, with automatic fee distribution to NFT holders or original contributors
- **Selective Disclosure**: Complete privacy protection during member addition, full disclosure when minting community NFTs for value creation
- **Decentralized Permanence**: Blockchain anchors plus IPFS storage keep family histories tamper-resistant and accessible beyond any single application
- **Story Sharding System**: Rich biographical content stored in up to 100×1KB on-chain chunks with immutable sealing for historical preservation

## Conflux Integration
DeepFamily is designed to leverage Conflux features for optimal performance and user experience:
- [x] **eSpace**: Smart contracts deployed and tested on Conflux eSpace for EVM compatibility
- [ ] **Core Space**: Planned deployment for maximum decentralization benefits
- [ ] **Cross-Space Bridge**: Future integration for multi-space asset management
- [ ] **Gas Sponsorship**: Planned implementation for seamless user onboarding
- [ ] **Built-in Contracts**: Future integration for enhanced functionality
- [ ] **Partner Integrations**: Planned Privy/Pyth integrations for improved UX

## Features
- **Salted Passphrase Unlinkability**: Poseidon hash function prevents identity inference and family tree pollution attacks while enabling collaborative or private tree construction
- **Advanced Zero-Knowledge Privacy**: Groth16 proof system enables private family member addition without revealing personal information, with dual tree models for public collaboration or complete anonymity
- **Multi-Version System**: Each person can have multiple verified data versions with community endorsement and duplicate prevention
- **Community Endorsement Economy**: Fee-based validation system where endorsement costs equal current mining reward, with automatic distribution to NFT holders or contributors
- **NFT Value Creation**: Community-endorsed versions can mint exactly one ERC721 token with full biographical disclosure and rich on-chain metadata
- **Story Sharding & Sealing**: Biographical content stored in up to 100×1KB on-chain chunks (100KB total) with immutable sealing for permanent historical preservation
- **Smart Mining Rewards**: DEEP tokens only awarded when both parent relationships exist, encouraging complete family trees
- **Interactive D3.js Visualization**: Responsive family tree rendering with multiple layouts, animations, and mobile-optimized design
- **Multi-language Support**: English, Simplified/Traditional Chinese, Japanese, and Korean interfaces for a broader audience
- **Gas-Optimized Queries**: Paginated blockchain queries with 100-record limits for efficient interaction

## Technology Stack
- **Modern Frontend**: React 18 + TypeScript with lazy loading, Vite build system, TailwindCSS + gradient animations, Lucide icons, React Router + i18n
- **Advanced Visualization**: D3.js interactive family trees with responsive design, multiple layouts, hover effects, and mobile optimization
- **Blockchain Infrastructure**: Conflux eSpace (primary) with multi-network support (Ethereum, Polygon, Arbitrum, Optimism, BSC) and unified deployment system
- **Production Smart Contracts**: Solidity ^0.8.20, OpenZeppelin v5.0, ~1,800 lines of core logic with comprehensive test coverage
- **Zero-Knowledge System**: Groth16 proofs with Circom circuits, SnarkJS integration, Poseidon hashing, and production-ready cryptographic primitives
- **Development Ecosystem**: Hardhat toolchain, Node.js 18+, Ethers v6, cross-platform scripts, automated deployment, and quality assurance tools
- **Storage & Metadata**: IPFS integration for decentralized metadata storage with blockchain immutability
- **Quality Assurance**: TypeScript, Solhint, Prettier, Husky pre-commit hooks, comprehensive test coverage, and automated linting

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

2. Install dependencies
   ```bash
   npm run setup
   # Installs root + frontend dependencies
   ```

3. Configure environment
   ```bash
   cp .env.example .env
   # Required for deployment and verification
   PRIVATE_KEY=0x... # Your deployer wallet private key
   ```

4. Compile smart contracts
   ```bash
   npm run build
   ```

5. Run complete development environment
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
```

## Architecture

DeepFamily implements a revolutionary dual-layer blockchain architecture that balances privacy, collaboration, and value creation:

### Layer 1: Privacy Protection (Hash-Based Relationships)
- **Salted Hash System**: Poseidon hash function creates unlinkable identity commitments preventing inference attacks
- **Dual Tree Models**: Public trees (shared passphrase) enable family collaboration, private trees (unique passphrase) ensure complete anonymity
- **Zero-Knowledge Integration**: Groth16 proofs validate family relationships without revealing personal data
- **Multi-Version Support**: Each person supports multiple data versions with duplicate prevention and provenance tracking
- **Smart Mining Rewards**: DEEP tokens only awarded when both parent relationships exist, encouraging complete family connections

### Layer 2: Value Confirmation (NFT + Token Economics)
- **Selective Disclosure**: Users control when to reveal full information by minting community NFTs
- **Story Sharding System**: Rich biographical content in up to 100×1KB on-chain chunks with immutable sealing
- **Community Endorsement**: Economic validation through fee-based endorsement system with automatic distribution
- **NFT Value Creation**: Each version mints exactly one ERC721 token with complete metadata and community validation
- **Progressive Economics**: 10 halving cycles with expanding periods (1→10→100→1K→10K→100K→1M→10M→100M→Fixed) and 100B supply cap

### Core Components
- **DeepFamily.sol**: Comprehensive protocol managing family trees, multi-version system, endorsements, NFT minting, and story sharding
- **DeepFamilyToken.sol**: Advanced DEEP ERC20 with sophisticated progressive halving mining mechanism
- **PersonHashVerifier.sol**: Production-ready Groth16 zero-knowledge proof verifier for privacy-preserving submissions
- **NamePoseidonVerifier.sol**: Zero-knowledge proof verifier for name ownership validation during NFT minting

## Smart Contracts

### Conflux eSpace Testnet
- DeepFamily: `0x34A1D09B3Ccc66C510586f40fb621b75974B9326`
- DeepFamilyToken: `0xac4D17f2061585e32F0519da76e4c9E7F39DFB65`
- PersonHashVerifier: `0x9459B46A1D372CeFB9DB2b79eda9ca170ce7F5Fe`
- NamePoseidonVerifier: `0x55E2Cd040614aF369141a492B78E57E979fDb584`

### Conflux eSpace Mainnet
- DeepFamily: `TBD`
- DeepFamilyToken: `TBD`
- PersonHashVerifier: `TBD`
- NamePoseidonVerifier: `TBD`

## Future Improvements

### Technical Enhancements
- **Mobile Applications**: React Native iOS/Android apps with offline family tree browsing and PWA capabilities
- **Graph Protocol Integration**: Advanced indexing and querying for complex genealogical relationships and family network analysis

### Feature Expansions
- **Enhanced Visualization**: 3D family tree rendering with improved navigation and zoom capabilities
- **Advanced Search & Filtering**: Smart search algorithms for finding distant relatives and family connections
- **Data Import/Export**: Integration with existing genealogy formats and family tree services
- **Improved User Experience**: Enhanced mobile responsiveness and accessibility features
- **Family Stories & Media**: Support for photos, documents, and multimedia content in family histories


### Known Limitations
- Zero-knowledge circuits require production-grade security audit and gas optimization for mainnet deployment
- Current architecture may need optimization for global adoption scale and enhanced user onboarding experience

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Conflux Network**: For providing scalable blockchain infrastructure with low fees
- **OpenZeppelin**: For battle-tested smart contract security primitives
- **D3.js Community**: For powerful data visualization libraries
- **React Ecosystem**: For modern frontend development tools



## Additional Documentation

For comprehensive technical documentation, see:
- [Smart Contracts Reference](docs/contracts.md) - Complete API documentation
- [Frontend Integration](docs/frontend.md) - React dApp development guide
- [ZK Proofs](docs/zk-proofs.md) - Privacy implementation details

**🌳 Building a shared digital family heritage for humanity 🌳**
