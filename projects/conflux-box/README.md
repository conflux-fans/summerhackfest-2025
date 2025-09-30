# Conflux Box

A modern, beautiful frontend for Conflux blockchain development, built with **Mantine UI** and powered by the **published Conflux DevKit packages**.

## ✨ Features

- **Modern UI**: Built with Mantine UI components for a clean, professional interface
- **Dual-Chain Support**: Works with both Conflux Core and eSpace networks
- **Real-time Updates**: WebSocket integration for live blockchain data
- **Account Management**: Create and manage development accounts
- **Smart Contracts**: Deploy and interact with contracts
- **Network Monitoring**: Real-time network status and configuration
- **TypeScript**: Full type safety throughout the application

## 🏗️ Architecture

This project demonstrates how to use the published Conflux DevKit packages:

- **Frontend**: React + Vite + Mantine UI
- **Backend**: Uses `@conflux-devkit/backend` package
- **Blockchain**: Uses `@conflux-devkit/node` package
- **State Management**: Zustand + React Query

## 📦 Published Packages Used

- [`@conflux-devkit/node@^0.1.0`](https://www.npmjs.com/package/@conflux-devkit/node) - Core blockchain functionality
- [`@conflux-devkit/backend@^0.1.0`](https://www.npmjs.com/package/@conflux-devkit/backend) - Backend API and WebSocket services

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone or create new project
pnpm install

# Start the backend service (uses published @conflux-devkit/backend)
node backend-service.js
```

In another terminal:

```bash
# Start the frontend development server
pnpm run dev
```

### Using GitHub Codespaces (Recommended for Demo)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/cfxdevkit/conflux-box)

1. Click the badge above or go to your GitHub repository
2. Click "Code" → "Codespaces" → "Create codespace on main"
3. Wait for the environment to set up (Node 20, pnpm, and dependencies will be installed automatically)
4. Once ready, the devcontainer provides:

   - Node 20 with pnpm pre-installed
   - OpenSSL 3 available
   - All project dependencies installed
   - Port forwarding for development servers (3000, 3001, 3002)

**Note**: The Codespace setup is compatible but not yet fully integrated. You may need to manually start the backend service and frontend in separate terminals:

```bash
# Terminal 1: Start backend
node backend-service.js

# Terminal 2: Start frontend
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠️ Development

### Available Scripts

```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run preview      # Preview production build
pnpm run type-check   # Run TypeScript checks
pnpm run lint         # Run ESLint
pnpm run lint:fix     # Fix ESLint issues
```

### Backend Service

The `backend-service.js` file demonstrates how to use the published `@conflux-devkit/backend` package:

```javascript
import { BackendServer } from "@conflux-devkit/backend";

const server = new BackendServer({
  port: 3001,
  wsPort: 3002,
  devkitConfig: {
    chainId: 2029,
    evmChainId: 2030,
    // ... configuration
  },
});

await server.start();
```

### Frontend Integration

## Demo & Presentation

- Demo Video (YouTube): https://youtu.be/8l3teGlz9RE
- Presentation Slides (PDF): `submission/media/presentation/Conflux-Box.pdf`
- Presentation Slides (Google Slides - editable): https://docs.google.com/presentation/d/1Ek4gvAlHWE4aK_5ODvdpslF1DaGFcYmDYn6IsKOol58/edit?usp=sharing

The frontend uses the published `@conflux-devkit/node` package:

```typescript
import { DevKit, CoreClient, EspaceClient } from "@conflux-devkit/node";

const devkit = new DevKit({
  chainId: 2029,
  evmChainId: 2030,
  // ... configuration
});
```

## 🏗️ Project Structure

```
conflux-box/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # React hooks for DevKit integration
│   ├── services/      # API and DevKit services
│   ├── stores/        # Zustand stores
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
├── backend-service.js # Backend service using published package
└── package.json       # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file for custom configuration:

```bash
# Backend API endpoints
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3002

# Development mnemonic (for testing only!)
HARDHAT_VAR_DEPLOYER_MNEMONIC="test test test test test test test test test test test junk"

# Network configuration
VITE_CORE_CHAIN_ID=2029
VITE_EVM_CHAIN_ID=2030
```

### Network Configuration

The application supports multiple network modes:

- **Local Development**: Connects to local development nodes
- **Testnet**: Connects to Conflux testnet
- **Mainnet**: Connects to Conflux mainnet

## 🎨 UI Components

Built with Mantine UI for a modern, accessible interface:

- **Dashboard**: Overview of network status and accounts
- **Accounts**: Manage development accounts and view balances
- **Contracts**: Deploy and interact with smart contracts
- **Network**: Monitor and configure network settings
- **Settings**: Application and development preferences

## 🔌 API Integration

### REST API Endpoints

The backend provides these endpoints:

- `GET /api/devkit/status` - DevKit status
- `GET /api/devkit/accounts` - List accounts
- `POST /api/devkit/accounts` - Create account
- `GET /api/devkit/balance/:address` - Get balance
- `POST /api/devkit/transactions` - Send transaction

### WebSocket Events

Real-time updates via WebSocket:

- `devkit:status` - Status updates
- `devkit:transaction` - Transaction events
- `devkit:block` - New block notifications

## � AI Integration (Planned)

Conflux Box will integrate AI-driven workflows to enable advanced automation and developer productivity features. The backend and delegation structure are designed to support programmatic AI flows that can:

- Automate repetitive developer tasks (account scaffolding, contract template customization, test scenario generation)
- Provide intelligent code and contract suggestions using contextual project data
- Drive end-to-end automation pipelines (deploy → test → monitor) via backend orchestration and secure delegation
- Generate natural-language summaries and guided walkthroughs for transactions, errors and on-chain events

These AI capabilities will be added as optional modules that leverage the backend services and the delegation model of the DevKit to perform privileged actions safely and reproducibly.

## �🧪 Testing

The project includes:

- **Unit tests**: Component and utility testing
- **Integration tests**: API and DevKit integration
- **E2E tests**: Full application workflows

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy Backend

The backend can be deployed as a standalone service:

```bash
# Install globally
npm install -g @conflux-devkit/backend

# Run the service
conflux-devkit-backend
```

Or use the local backend service:

```bash
node backend-service.js
```

## 📖 Documentation

- [Conflux DevKit Node Documentation](https://www.npmjs.com/package/@conflux-devkit/node)
- [Conflux DevKit Backend Documentation](https://www.npmjs.com/package/@conflux-devkit/backend)
- [Mantine UI Documentation](https://mantine.dev/)
- [Conflux Documentation](https://doc.confluxnetwork.org/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Conflux Network** for the blockchain platform
- **Mantine** for the beautiful UI components
- **Vite** for the fast development experience
- **React Query** for data fetching and caching
