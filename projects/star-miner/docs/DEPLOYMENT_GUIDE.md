# StarMiner Deployment & Development Guide

## 🚀 Quick Start

This guide covers the complete setup, development, and deployment process for the StarMiner play-to-earn idle clicker game.

## 📋 Prerequisites

### Required Software
- **Node.js** v18.0.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **MetaMask** or **Fluent Wallet** for testing

### Development Tools
- **VS Code** (recommended IDE)
- **Hardhat** for smart contract development
- **Foundry** (optional, alternative to Hardhat)

### Accounts & Services
- **Conflux eSpace Testnet** account with test CFX
- **ConfluxScan API Key** (for contract verification)
- **Vercel/Netlify** account (for frontend deployment)

## 🛠️ Development Environment Setup

### 1. Clone and Initialize Project

```bash
# Clone the repository
git clone <repository-url>
cd star-miner

# Install dependencies
npm install

# Install smart contract dependencies
cd contracts
npm install
cd ..
```

### 2. Environment Configuration

Create environment files for different components:

#### Frontend Environment (`.env.local`)
```env
# Network Configuration
NEXT_PUBLIC_CONFLUX_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=71
NEXT_PUBLIC_RPC_URL=https://evmtestnet.confluxrpc.com
NEXT_PUBLIC_EXPLORER_URL=https://evmtestnet.confluxscan.io

# Contract Addresses (update after deployment)
NEXT_PUBLIC_CREDITS_CONTRACT=0x...
NEXT_PUBLIC_GAMESTATE_CONTRACT=0x...
NEXT_PUBLIC_P2E_CONTRACT=0x...
NEXT_PUBLIC_NFT_CONTRACT=0x...

# Feature Flags
NEXT_PUBLIC_ENABLE_SOUND=true
NEXT_PUBLIC_ENABLE_ANIMATIONS=true
NEXT_PUBLIC_DEBUG_MODE=false

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Smart Contract Environment (`.env`)
```env
# Deployment Configuration
PRIVATE_KEY=your_private_key_here
CONFLUX_TESTNET_RPC=https://evmtestnet.confluxrpc.com
CONFLUX_MAINNET_RPC=https://evm.confluxrpc.com

# API Keys
CONFLUXSCAN_API_KEY=your_api_key_here
COINMARKETCAP_API_KEY=your_api_key_here

# Deployment Settings
DEPLOY_VERIFY=true
DEPLOY_GAS_PRICE=20000000000
DEPLOY_GAS_LIMIT=8000000

# Initial Configuration
INITIAL_CREDITS_SUPPLY=1000000
REWARD_POOL_INITIAL=1000000000000000000
STARDUST_TO_CFX_RATE=10000
```

### 3. Network Configuration

#### Hardhat Configuration (`hardhat.config.js`)
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const CONFLUXSCAN_API_KEY = process.env.CONFLUXSCAN_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    confluxTestnet: {
      url: "https://evmtestnet.confluxrpc.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 71,
      gasPrice: 20000000000, // 20 gwei
      gas: 8000000
    },
    confluxMainnet: {
      url: "https://evm.confluxrpc.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1030,
      gasPrice: 20000000000,
      gas: 8000000
    }
  },
  etherscan: {
    apiKey: {
      confluxTestnet: CONFLUXSCAN_API_KEY,
      confluxMainnet: CONFLUXSCAN_API_KEY
    },
    customChains: [
      {
        network: "confluxTestnet",
        chainId: 71,
        urls: {
          apiURL: "https://evmapi-testnet.confluxscan.io/api",
          browserURL: "https://evmtestnet.confluxscan.io"
        }
      },
      {
        network: "confluxMainnet",
        chainId: 1030,
        urls: {
          apiURL: "https://evmapi.confluxscan.io/api",
          browserURL: "https://evm.confluxscan.io"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};
```

#### Next.js Configuration (`next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig;
```

## 🔧 Development Workflow

### 1. Smart Contract Development

#### Compile Contracts
```bash
cd contracts
npx hardhat compile
```

#### Run Tests
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/StarMinerCredits.test.js

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test
```

#### Deploy to Testnet
```bash
# Deploy all contracts
npx hardhat run scripts/deploy.js --network confluxTestnet

# Deploy specific contract
npx hardhat run scripts/deploy-credits.js --network confluxTestnet

# Verify contracts
npx hardhat verify --network confluxTestnet CONTRACT_ADDRESS
```

#### Local Development Node
```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local node (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Frontend Development

#### Start Development Server
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

#### Development Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 3. Testing Strategy

#### Smart Contract Tests
```bash
# Unit tests
npx hardhat test test/unit/

# Integration tests
npx hardhat test test/integration/

# Gas optimization tests
REPORT_GAS=true npx hardhat test
```

#### Frontend Tests
```bash
# Unit tests
npm run test

# Component tests
npm run test:components

# E2E tests (with Playwright)
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment Process

### 1. Smart Contract Deployment

#### Testnet Deployment
```bash
# 1. Deploy contracts to testnet
npx hardhat run scripts/deploy.js --network confluxTestnet

# 2. Verify contracts
npx hardhat run scripts/verify.js --network confluxTestnet

# 3. Initialize contracts
npx hardhat run scripts/initialize.js --network confluxTestnet

# 4. Fund reward pool
npx hardhat run scripts/fund-pool.js --network confluxTestnet
```

#### Mainnet Deployment
```bash
# 1. Final testing on testnet
npm run test:full

# 2. Deploy to mainnet
npx hardhat run scripts/deploy.js --network confluxMainnet

# 3. Verify contracts
npx hardhat run scripts/verify.js --network confluxMainnet

# 4. Initialize with production values
npx hardhat run scripts/initialize-mainnet.js --network confluxMainnet
```

### 2. Frontend Deployment

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

#### Manual Deployment
```bash
# Build optimized bundle
npm run build

# Export static files (if using static export)
npm run export

# Upload to your hosting provider
```

### 3. Environment-Specific Configurations

#### Production Environment Variables
```env
# Production Frontend (.env.production)
NEXT_PUBLIC_CONFLUX_NETWORK=mainnet
NEXT_PUBLIC_CHAIN_ID=1030
NEXT_PUBLIC_RPC_URL=https://evm.confluxrpc.com
NEXT_PUBLIC_EXPLORER_URL=https://evm.confluxscan.io

# Production contract addresses
NEXT_PUBLIC_CREDITS_CONTRACT=0x...
NEXT_PUBLIC_GAMESTATE_CONTRACT=0x...
NEXT_PUBLIC_P2E_CONTRACT=0x...
NEXT_PUBLIC_NFT_CONTRACT=0x...

# Production features
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 📊 Monitoring & Analytics

### 1. Smart Contract Monitoring

#### ConfluxScan Integration
- Monitor contract transactions
- Track gas usage and optimization
- Verify contract source code
- Monitor event logs

#### Custom Monitoring
```javascript
// scripts/monitor.js
const { ethers } = require("hardhat");

async function monitorContracts() {
  const creditsContract = await ethers.get