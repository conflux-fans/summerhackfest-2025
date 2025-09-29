# CLAUDE.md

## Project Overview

DeepFamily is a blockchain-based decentralized global digital family tree protocol leveraging zero-knowledge proofs, NFTs, ERC20 token economics, and community governance to create a collaborative, verifiable, and perpetual family history recording system.

## Two-Layer Value System

The system implements a two-layer value model that balances privacy protection with community validation:

### Layer 1: Privacy Protection (Hash Storage)
- **Zero-Knowledge Proofs**: Uses Groth16 proofs to add family tree members privately
- **Salted Passphrase Unlinkability**: Uses cryptographic hash combinations with unique passphrases to prevent identity inference
- **Anti-Pollution Protection**: Unique passphrases prevent malicious users from creating fake versions pointing to real people
- **Dual Tree Models**: Supports both public collaborative trees (shared passphrase) and private protected trees (unique passphrase)
- **Family Tree Networks**: Build relationships through personHash/fatherHash/motherHash connections
- **Token Incentives**: Receive DEEP tokens only when both parent relationships exist (complete family data)

### Layer 2: Value Confirmation (NFT Assets)
- **Public Disclosure**: Community-endorsed versions can be minted as NFTs, revealing full personal information
- **Story Sharding**: Detailed biographical data stored in up to 100×1KB on-chain chunks
- **Community Validation**: Must endorse a version before minting its NFT
- **Value Recognition**: NFTs represent community-validated family tree data

### Key Advantages
- **Progressive Privacy Model**: Private submission → Community endorsement → Optional public disclosure
- **Smart Incentives**: Tokens reward complete family data, NFTs reward quality information
- **Risk Management**: Private layer allows exploration, public layer ensures quality
- **Value Discovery**: Natural evolution from private data to community-validated assets

## Smart Contract Architecture

### DeepFamily.sol - Main Protocol
- Multi-version person data with ZK proof validation
- Community endorsement system with automatic fee distribution
- NFT minting with on-chain biographical storage
- Story sharding system for detailed life narratives
- Mining rewards for complete family connections
- Comprehensive security with 50+ custom errors

### DeepFamilyToken.sol - DEEP Token
- ERC20 with progressive halving mining mechanism
- 100 billion supply cap with 10 halving cycles
- Expanding cycle lengths: 1→10→100→1K→10K→100K→1M→10M→100M→Fixed 100M
- Authorized minting only by DeepFamily contract

### ZK Verifier Contracts
- **PersonHashVerifier**: Validates family relationships for private submissions
- **NamePoseidonVerifier**: Proves name ownership for NFT minting
- Both use Groth16 proofs with circom circuits

## Key Features

### Zero-Knowledge Privacy System
- **Private Family Tree Construction**: Add members without revealing personal information
- **Salted Passphrase Unlinkability**: Prevents identity inference and pollution attacks through unique passphrases
- **Dual Tree Architecture**: Public collaborative trees vs. private protected trees for relationship correctness
- **Selective Disclosure**: Users choose when to reveal information through NFT minting
- **Dual-Hash Design**: Poseidon commitments + keccak256 wrapping for security
- **Limb-Based Verification**: Efficient on-chain ZK proof validation

### Economic Incentives
- **Smart Mining**: Rewards only for complete family data (both parents exist)
- **Community Endorsement**: Pay current mining reward to endorse trusted versions
- **Fee Distribution**: Endorsement fees flow to NFT holders or original contributors
- **Progressive Halving**: Advanced tokenomics with 10 halving cycles

### Data Management
- **Multi-Version System**: Each person supports multiple data versions with duplicate prevention
- **Family Relationships**: Complete parent-child relationship tracking with version references
- **Story Sharding**: Biographical data in sequentially indexed, hash-verified chunks
- **Immutable Sealing**: Stories can be permanently locked for historical preservation

### Scalability & Security
- **Paginated Queries**: Gas-optimized queries with 100-record limits
- **Reentrancy Protection**: Comprehensive security against attacks
- **Access Control**: Role-based permissions with explicit error handling
- **ETH Rejection**: Contract rejects direct ETH transfers

## Technology Stack

### Smart Contracts
- **Solidity**: ^0.8.20 with OpenZeppelin v5 security primitives
- **Zero-Knowledge**: Groth16 proofs, circom circuits, Poseidon hashing
- **Testing**: Hardhat, comprehensive test coverage, gas optimization
- **Deployment**: Multi-network support with hardhat-deploy

### Frontend
- **React**: 18 with TypeScript for type safety
- **Build**: Vite for fast development and optimized builds
- **Styling**: TailwindCSS for responsive design
- **Visualization**: D3.js for interactive family tree displays
- **Web3**: Ethers v6 for blockchain interaction

### Development Tools
- **Testing**: Comprehensive unit and integration tests
- **Linting**: Solhint, Prettier, ESLint with pre-commit hooks
- **Coverage**: Solidity coverage analysis
- **Documentation**: Auto-generated docs from NatSpec comments

## Project Structure

```
DeepFamily/
├── contracts/              # Smart Contracts
│   ├── DeepFamily.sol         # Main family tree protocol
│   ├── DeepFamilyToken.sol    # DEEP ERC20 token
│   └── verifiers/             # ZK proof verifiers
├── circuits/               # ZK Circuit Development
│   ├── person_hash_zk.circom  # Family relationship proofs
│   └── name_poseidon_zk.circom # Name binding proofs
├── frontend/               # React dApp
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── FlexibleDAGView.tsx   # Flexible family tree
│   │   │   ├── ForceDAGView.tsx      # Force-directed tree
│   │   │   └── NodeDetailModal.tsx   # Person details
│   │   ├── pages/             # Application routes
│   │   ├── context/           # State management
│   │   ├── abi/              # Contract ABIs
│   │   └── lib/              # Utility libraries
├── test/                   # Smart contract tests
├── deploy/                 # Deployment scripts
├── tasks/                  # Hardhat tasks
├── scripts/                # Utility scripts
│   ├── seed-demo.js           # Demo data seeding
│   └── check-root.js          # Root node validation
└── docs/                   # Technical documentation
```

## Development Commands

### Core Development
```bash
npm run setup                # Install all dependencies
npm run build                # Compile contracts and generate types
npm run test                 # Run comprehensive test suite
npm run dev:all              # Start complete development environment
npm run frontend:dev         # Frontend development server only
```

### Testing & Quality
```bash
npm run test:coverage        # Generate coverage reports
npm run test:gas            # Gas usage analysis
npm run lint                # Code quality checks
npm run size                # Contract size analysis
```

### Multi-Network Deployment
```bash
npm run deploy:holesky      # Holesky testnet (recommended)
npm run deploy:polygonAmoy  # Polygon testnet
npm run deploy:confluxTestnet # Conflux testnet
npm run deploy:mainnet      # Ethereum mainnet
npm run deploy:polygon      # Polygon mainnet
npm run deploy:arbitrum     # Arbitrum networks
```

### Contract Verification
```bash
npm run verify:holesky      # Verify on Holesky
npm run verify:polygon      # Verify on Polygon
npm run verify:arbitrum     # Verify on Arbitrum
```

## Network Support

### Supported Networks
- **Ethereum**: Mainnet, Sepolia, Holesky
- **Layer 2**: Polygon, Arbitrum, Optimism
- **Alternative**: BSC, Conflux eSpace

### Environment Configuration
Required `.env` variables:
```bash
PRIVATE_KEY=                # Deployer wallet private key (secure!)
INFURA_API_KEY=            # Network RPC access
ETHERSCAN_API_KEY=         # Ethereum contract verification
POLYGONSCAN_API_KEY=       # Polygon contract verification
ARBISCAN_API_KEY=          # Arbitrum contract verification
BSCSCAN_API_KEY=           # BSC contract verification
```

## Testing & Development Standards

### Comprehensive Testing
- **Unit Tests**: Individual contract function testing
- **Integration Tests**: Cross-contract interaction testing
- **ZK Proof Tests**: Circuit validation and proof generation
- **Economic Tests**: Token mining and halving mechanism validation
- **Security Tests**: Reentrancy, access control, edge case testin

## Security Considerations

### Smart Contract Security
- **Reentrancy Protection**: All external calls protected
- **Access Control**: Role-based permissions with explicit error types
- **Input Validation**: Comprehensive parameter checking
- **Overflow Protection**: SafeMath patterns and Solidity 0.8+ built-ins

### ZK Proof Security
- **Trusted Setup**: Uses community-audited Powers of Tau
- **Circuit Validation**: All constraints properly implemented
- **Proof Verification**: On-chain Groth16 verification
- **Domain Separation**: keccak256 wrapper prevents hash collisions

### Frontend Security
- **Wallet Integration**: Secure Web3 provider handling
- **Input Sanitization**: All user inputs validated
- **State Management**: Immutable state patterns
- **Error Handling**: Graceful error recovery and user feedback

## **Development Guidelines**
- English documentation
- Synchronized test updates with new features
- Pre-production auditing required
- **STRICTLY FORBIDDEN**: Never include any AI identifiers, signatures, or acknowledgments in commit messages
  - No "Generated with Claude", "Co-Authored-By: Claude", "By AI", "AI-generated", "Assisted by", etc.
  - No references to artificial intelligence, automation tools, or AI assistance
  - Commit messages must appear as if written by a human developer
