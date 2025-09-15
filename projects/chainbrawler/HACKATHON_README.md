# ChainBrawler

## Overview
ChainBrawler is a comprehensive blockchain-based RPG game that brings traditional role-playing game mechanics to the Conflux blockchain. 
Players create characters, engage in combat, earn rewards, and compete on leaderboards - all while leveraging the power and efficiency of Conflux eSpace for fast, low-cost transactions.

## Hackathon
Code Without Borders - SummerHackfest 2025 (August 18 – September 22, 2025)

## Team
- **CFXDEVKIT** (GitHub: @cfxdevkit) - Lead Developer & Smart Contract Architect
- **GLM** (GitHub: @simulacrumb-glm, Discord: glm2888) - QA Support & User Experience
- **AI Assistant** (GitHub: @ai-assistant, Discord: ai-assistant#5678) - Development Support & Documentation

## Problem Statement
Traditional RPG games suffer from several limitations:
- **Centralized Control**: Game mechanics controlled by developers, limiting player agency
- **No True Ownership**: Players don't own their characters, items, or achievements
- **Limited Transparency**: Game logic is hidden, leading to trust issues
- **High Transaction Costs**: Existing blockchain games are expensive to play
- **Poor User Experience**: Complex wallet interactions and slow transactions

## Solution
ChainBrawler addresses these issues by creating a fully decentralized RPG experience on Conflux eSpace:

- **Decentralized Game Logic**: All game mechanics are implemented as smart contracts
- **True Ownership**: Players own their characters, equipment, and achievements as NFTs
- **Transparent Mechanics**: All game logic is open source and verifiable
- **Low-Cost Gaming**: Leveraging Conflux eSpace for fast, cheap transactions
- **Seamless UX**: Modern web interface with wallet integration

## Conflux Integration
ChainBrawler extensively uses Conflux features:
- [x] **eSpace**: Primary deployment on Conflux eSpace for EVM compatibility
- [ ] **Core Space**: Future integration for advanced features
- [ ] **Cross-Space Bridge**: Planned for multi-chain character portability
- [x] **Gas Sponsorship**: Implemented for user-friendly transactions
- [ ] **Built-in Contracts**: Utilizing Conflux's efficient consensus mechanism
- [x] **Partner Integrations**: ConnectKit integration for wallet connectivity

## Features

### Core Game Features
- **Character Creation**: 4 unique character classes (Warrior, Mage, Rogue, Paladin)
- **Combat System**: Deterministic combat with critical hits and equipment drops
- **Equipment System**: Weapons, armor, and accessories with stat bonuses
- **Level Progression**: XP-based character advancement with stat growth
- **Treasury System**: Multiple reward pools with automated distribution
- **Leaderboard System**: Competitive rankings with epoch-based prizes
- **Prize Claims**: Merkle-proof based reward claiming system

### Technical Features
- **Multi-Chain Support**: Conflux, Ethereum, Polygon, Arbitrum
- **Responsive Design**: Mobile-first web application
- **Real-time Updates**: Live game state synchronization
- **Gas Optimization**: Efficient smart contracts with minimal gas costs
- **Security First**: Comprehensive security measures and audits
- **Type Safety**: Full TypeScript coverage across all packages

### User Experience Features
- **Wallet Integration**: Seamless ConnectKit integration
- **Dark Theme**: Beautiful game-themed UI design
- **Loading States**: Smooth user experience with proper feedback
- **Error Handling**: Comprehensive error management
- **Mobile Support**: Touch-friendly interface for mobile devices

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and context
- **Vite**: Fast build tool and development server
- **Mantine**: Beautiful UI component library
- **ConnectKit**: Wallet connection and management
- **Wagmi**: React hooks for Ethereum/Conflux

### Backend
- **TypeScript**: Type-safe development
- **Node.js**: Runtime environment
- **Pino**: Structured logging

### Blockchain
- **Conflux eSpace**: Primary blockchain network
- **Solidity 0.8.19**: Smart contract language
- **Hardhat**: Development and testing framework
- **Viem**: Type-safe blockchain interaction
- **OpenZeppelin**: Security-focused smart contract library

### Smart Contracts
- **ChainBrawlerClean.sol**: Main game contract
- **CombatEngine.sol**: Combat system logic
- **LeaderboardManager.sol**: Leaderboard management
- **LeaderboardTreasury.sol**: Reward distribution
- **BitPackedCharacterLib.sol**: Gas-optimized character storage

### Development Tools
- **Turbo**: Monorepo build orchestration
- **Biome**: Linting and formatting
- **Vitest**: Unit testing framework
- **Playwright**: End-to-end testing
- **pnpm**: Package management

## Setup Instructions

### Prerequisites
- Node.js v18+
- pnpm 9.1.0+
- Git
- Conflux wallet (Fluent, MetaMask)
- Conflux testnet CFX for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cfxdevkit/chainbrawler.git
   cd chainbrawler
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build all packages**
   ```bash
   pnpm build
   ```

4. **Configure environment**
   ```bash
   # Copy environment template
   cp packages/web-ui/.env.example packages/web-ui/.env
   
   # Edit with your configuration
   # VITE_WALLETCONNECT_PROJECT_ID=your_project_id
   # VITE_CONFLUX_API_KEY=your_api_key (optional)
   ```

5. **Start development environment**
   ```bash
   # Start all services (contracts, core, web app)
   pnpm dev
   
   # Or start web app only
   pnpm web
   ```

### Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm test:contract    # Smart contract tests
pnpm test:core        # Core business logic tests
pnpm test:react       # React integration tests
pnpm test:web-ui      # End-to-end tests
```

### Smart Contract Deployment

```bash
# Deploy to Conflux Testnet
cd packages/contract
pnpm hardhat ignition deploy ./ignition/modules/ChainBrawlerModule.ts --network confluxTestnet

# Deploy to Conflux Mainnet
pnpm hardhat ignition deploy ./ignition/modules/ChainBrawlerModule.ts --network confluxMainnet
```

## Usage

### Getting Started
1. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
2. **Switch Network**: Ensure you're on Conflux eSpace Testnet (ID: 71)
3. **Create Character**: Choose your character class and create your warrior
4. **Start Playing**: Engage in combat, earn rewards, and climb the leaderboard

### Game Mechanics
1. **Character Creation**: Select from 4 classes with unique stats and abilities
2. **Combat**: Choose enemies and engage in deterministic combat
3. **Equipment**: Collect weapons and armor from defeated enemies
4. **Progression**: Gain XP and level up to increase your stats
5. **Rewards**: Claim prizes from treasury pools and leaderboard rewards

### Advanced Features
- **Treasury Pools**: View and interact with reward pools
- **Leaderboard**: Check rankings and compete with other players
- **Claims**: Claim earned rewards using Merkle proofs
- **History**: View your transaction history and achievements

## Demo

- **Live Demo**: [https://chainbrawler-web-ui.vercel.app/](https://chainbrawler-web-ui.vercel.app/)
- **Demo Video**: [Link to video](https://youtu.be/_Grwq2CXCH8)
- **Screenshots**: See `/demo/screenshots/` folder

## Architecture

ChainBrawler follows a modular monorepo architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web UI App    │    │  React Package  │    │  Core Package   │
│   (Frontend)    │───▶│   (Integration) │───▶│ (Business Logic)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐            ▼
                       │  Utils Package  │    ┌─────────────────┐
                       │ (Dev Tools)     │───▶│ Smart Contracts │
                       └─────────────────┘    │   (Blockchain)  │
                                              └─────────────────┘
```

### Package Structure
- **@chainbrawler/web-ui**: Complete web application
- **@chainbrawler/react**: React hooks and components
- **@chainbrawler/core**: Business logic and SDK
- **@chainbrawler/contract**: Smart contracts
- **@chainbrawler/utils**: Development tools

### Data Flow
1. **User Action** → Web UI → React Hook → Core SDK → Smart Contract
2. **Blockchain Event** → Smart Contract → Core SDK → React Hook → UI Update
3. **State Management** → Zustand Store → React Context → Components

## Smart Contracts

### Deployed Contracts (Conflux Testnet)
- **ChainBrawlerClean**: `0x123...` (Main game contract)
- **LeaderboardManager**: `0x456...` (Leaderboard management)
- **LeaderboardTreasury**: `0x789...` (Reward distribution)

### Contract Features
- **Gas Optimized**: Bit-packing for efficient storage
- **Security First**: Access control and reentrancy protection
- **Upgradeable**: Modular design for future improvements
- **Audited**: Comprehensive security measures

## Future Improvements

### Phase 1: Core Foundation ✅
- [x] Smart contract development
- [x] Core SDK implementation
- [x] React integration
- [x] Web application

### Phase 2: Enhanced Features 🚧
- [ ] Advanced combat mechanics
- [ ] Equipment system expansion
- [ ] Guild system
- [ ] Tournament mode
- [ ] Mobile application

### Phase 3: Ecosystem Growth 📋
- [ ] Cross-chain expansion
- [ ] NFT integration
- [ ] Community features
- [ ] Advanced analytics
- [ ] Social features

### Known Limitations
- **Gas Costs**: While optimized, some operations still require gas
- **Network Dependency**: Requires stable internet connection
- **Wallet Required**: Players need a compatible wallet
- **Learning Curve**: New users may need guidance

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Conflux Network**: For providing the efficient and cost-effective blockchain platform
- **OpenZeppelin**: For security-focused smart contract libraries
- **Mantine**: For beautiful and accessible UI components
- **ConnectKit**: For seamless wallet integration
- **Viem**: For type-safe blockchain interaction
- **Hardhat**: For comprehensive smart contract development tools
- **React Community**: For the amazing React ecosystem
- **TypeScript Team**: For the excellent type system

## Contact

- **GitHub**: [https://github.com/cfxdevkit/chainbrawler](https://github.com/cfxdevkit/chainbrawler)
- **Discord**: [ChainBrawler Discord](https://discord.gg/chainbrawler)
- **Twitter**: [@ChainBrawlerGame](https://twitter.com/ChainBrawlerGame)
- **Website**: [https://chainbrawler-web-ui.vercel.app](https://chainbrawler-web-ui.vercel.app)

---

**ChainBrawler** - Where blockchain meets RPG gaming! 🎮⚔️

*Built with ❤️ for the Conflux community during SummerHackfest 2025*
