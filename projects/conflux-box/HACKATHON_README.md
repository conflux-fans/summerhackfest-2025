# Conflux Box

## Overview

Conflux Box is a modern, beautiful frontend for Conflux blockchain development, built with Mantine UI and powered by preview versions of the upcoming Conflux DevKit packages. It provides developers with an intuitive interface to interact with both Conflux Core Space and eSpace networks, featuring real-time monitoring, account management, and smart contract deployment capabilities.

## Hackathon

**Code Without Borders - SummerHackfest 2025** (August 18 – September 22, 2025)

## Team

- **Solo Developer**: @cfxdevkit (GitHub: @cfxdevkit, Discord: spcfxda)

## Problem Statement

Conflux blockchain development lacked a modern, user-friendly interface that developers could use to easily interact with the network. Existing tools were often command-line based or required complex setup processes, creating barriers for developers wanting to build on Conflux. There was no reference implementation showing how to properly use the upcoming Conflux DevKit packages in a real-world application.

## Solution

Conflux Box addresses these challenges by providing:

- **Modern Developer Experience**: A clean, intuitive interface built with Mantine UI components
- **Dual-Chain Support**: Seamless interaction with both Conflux Core Space and eSpace networks
- **Real-time Integration**: Live blockchain monitoring and updates via WebSocket connections
- **DevKit Preview Integration**: Reference implementation using preview versions of `@conflux-devkit` packages
- **Complete Development Toolkit**: Account management, contract deployment, and network monitoring in one place

## Conflux Integration

Conflux Box showcases extensive integration with Conflux features:

- [x] **Core Space** - Full support for Conflux Core Space network operations
- [x] **eSpace** - Complete eSpace (EVM-compatible) network integration
- [x] **Cross-Space Bridge** - Network switching and dual-chain support
- [x] **Gas Sponsorship** - Integrated through DevKit backend services
- [x] **Built-in Contracts** - Access to Conflux native contracts
- [x] **Partner Integrations** - GinsenSwap DEX and Meson Bridge integration
- [x] **Protocol Ecosystem** - Built-in support for major Conflux DeFi protocols

### DevKit Package Usage

### DevKit Package Usage (Preview Versions)

- `@conflux-devkit/node@^0.1.0` - Core blockchain functionality and network interaction (preview)
- `@conflux-devkit/backend@^0.1.0` - Backend API services and WebSocket integration (preview)

**Note**: This project showcases preview versions of the upcoming Conflux DevKit packages, demonstrating their capabilities before official release.

## Features

- ✅ **Modern UI/UX**: Beautiful interface built with Mantine UI components
- ✅ **Real-time Network Monitoring**: Live blockchain status and network information
- ✅ **Dynamic Network Switching**: Switch between testnet, mainnet, and local networks
- ✅ **Account Management**: Create and manage development accounts with balance tracking
- ✅ **Smart Contract Tools**: Deploy contracts using pre-built templates
- ✅ **Contract Interaction**: Interact with deployed contracts through the UI
- ✅ **Protocol Integrations**: Built-in GinsenSwap DEX and Meson Bridge support
- ✅ **Dual-Chain Support**: Full Core Space and eSpace network compatibility
- ✅ **WebSocket Integration**: Real-time updates and live data synchronization
- ✅ **Type Safety**: Full TypeScript implementation throughout the stack

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Mantine UI v7.12.0 with Tabler Icons
- **State Management**: Zustand, React Query (TanStack Query)
- **Blockchain Integration**: Conflux DevKit packages, Wagmi, Viem
- **DeFi Integrations**: Meson Bridge SDK, GinsenSwap Protocol
- **Backend Services**: Node.js with published DevKit backend
- **Real-time Communication**: WebSocket integration
- **Testing**: Vitest with React Testing Library, jsdom
- **Code Quality**: Biome for linting and formatting, ESLint
- **Build Tool**: Vite for fast development and production builds

## Setup Instructions

### Prerequisites

- Node.js v18+
- npm or pnpm package manager
- Git for version control
- Conflux-compatible wallet (Fluent Wallet recommended)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/cfxdevkit/conflux-box.git
   cd conflux-box
   ```

2. **Install dependencies**

   ```bash
   # Using npm
   npm install

   # Or using pnpm (recommended)
   pnpm install
   ```

3. **Configure environment** (if needed)

   ```bash
   # Copy example environment file
   cp .env.example .env
   # Edit .env with your specific configuration if needed
   ```

4. **Start the application**

   **Option A: Start Both Services Together** (Recommended)

   ```bash
   # This starts both backend and frontend concurrently
   pnpm dev
   # OR
   npm run dev
   ```

   **Option B: Start Services Separately**

   Terminal 1 - Backend Service:

   ```bash
   # Start the DevKit backend service
   pnpm run backend
   # OR
   node backend-service.js
   ```

   Terminal 2 - Frontend Development Server:

   ```bash
   # Start the Vite development server
   pnpm run dev:frontend
   # OR
   npm run dev:frontend
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The backend service runs on `http://localhost:3001`

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Type checking
npm run type-check
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Getting Started

1. **Launch the Application**: Start both backend and frontend services as described above
2. **Network Selection**: Use the network dropdown to select testnet, mainnet, or local development network
3. **Monitor Network**: View real-time network information including chain IDs, block numbers, and connection status

### Account Management

1. **Navigate to Accounts**: Click on "Accounts" in the sidebar navigation
2. **Create Account**: Use the account creation interface to generate new development accounts
3. **View Balances**: Monitor account balances and transaction history
4. **Manage Keys**: Securely manage account keys and addresses

### Smart Contract Development

1. **Access Contracts**: Go to the "Contracts" section
2. **Choose Template**: Select from pre-built contract templates or upload custom contracts
3. **Deploy Contract**: Use the deployment wizard to deploy contracts to your selected network
4. **Interact**: Use the contract interaction interface to call contract methods

### Network Monitoring

1. **Dashboard View**: The main dashboard provides real-time network status
2. **Chain Information**: View current chain IDs, block numbers, and network health
3. **Real-time Updates**: All data updates automatically via WebSocket connections

## Demo

- **Live Demo**: [Deployment URL - To be added]
- **Demo Video**: [Video Link - To be created]
- **Screenshots**: Available in `/demo/screenshots/` folder

### Key Demo Features

- Network switching with dynamic chain ID updates
- Real-time blockchain monitoring
- Account creation and management workflow
- Smart contract deployment process
- DeFi protocol integrations (GinsenSwap, Meson Bridge)
- Protocol discovery and interaction interface
- Modern, responsive user interface

## Architecture

Conflux Box follows a modern, layered architecture:

```
┌─────────────────────────────────────────┐
│           Frontend (React + TS)         │
│     ├── Pages (Dashboard, Accounts)     │
│     ├── Components (UI, Forms)          │
│     ├── Hooks (DevKit integration)      │
│     └── Stores (State management)       │
├─────────────────────────────────────────┤
│        Backend (@conflux-devkit)        │
│     ├── API Routes (REST endpoints)     │
│     ├── WebSocket (Real-time data)      │
│     └── DevKit Services                 │
├─────────────────────────────────────────┤
│      Blockchain (Conflux Network)       │
│     ├── Core Space (CFX network)        │
│     ├── eSpace (EVM-compatible)         │
│     └── Cross-chain Bridge              │
└─────────────────────────────────────────┘
```

### Key Architectural Decisions

- **Published Package Integration**: Uses official Conflux DevKit packages instead of custom implementations
- **Real-time Architecture**: WebSocket integration for live blockchain data
- **Type-Safe Development**: Full TypeScript coverage for better developer experience
- **Modern State Management**: Zustand for local state, React Query for server state
- **Component-Based UI**: Mantine UI for consistent, accessible interface components

## Smart Contracts

Conflux Box supports deploying and interacting with smart contracts on both Conflux networks:

### Supported Networks

- **Testnet**:
  - Core Space Chain ID: 1
  - eSpace Chain ID: 71
- **Mainnet**:
  - Core Space Chain ID: 1029
  - eSpace Chain ID: 1030
- **Local Development**: Configurable via DevKit

### Contract Templates

The application includes pre-built templates for common contract types:

- ERC-20 Token contracts
- Simple storage contracts
- Multi-signature wallets
- Custom contract deployment

## Future Improvements

### Short-term (v1.1)

- Enhanced contract templates library
- Advanced debugging tools and transaction monitoring
- Mobile-responsive design improvements
- Multi-language support (i18n)

### Medium-term (v2.0)

- Plugin system for community extensions
- Advanced analytics and reporting
- Integration with additional Conflux ecosystem tools
- Cross-chain bridge interface

### Long-term (v3.0)

- IDE integration and development plugins
- Advanced smart contract analysis tools
- Community marketplace for templates and tools
- Enterprise features and team collaboration

### Known Limitations

- Currently supports single-user development workflows
- Limited to DevKit-supported contract types
- Requires manual network configuration for custom networks

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Conflux Network** - For the innovative blockchain platform and developer tools
- **Conflux DevKit Team** - For the published packages that power this application
- **Mantine UI** - For the beautiful and accessible React components
- **Open Source Community** - For the various libraries and tools that made this possible
- **SummerHackfest 2025** - For the opportunity to build and showcase this project

## Contributing

We welcome contributions from the Conflux community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get involved.

### Development

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Reporting Issues

- Use the GitHub Issues tab to report bugs or request features
- Provide detailed information including browser version and steps to reproduce
- Check existing issues before creating new ones

---

**Built with ❤️ for the Conflux ecosystem**

_Conflux Box - Making blockchain development beautiful and accessible_
