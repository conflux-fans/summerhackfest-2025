# FluxSub

**Decentralized Subscription Management Platform on Conflux Blockchain**

FluxSub is a modern, decentralized subscription management platform that enables merchants to create subscription services and users to manage their recurring payments with complete transparency and control.

## 🚀 Features

### For Merchants
- **Create Subscription Services** with unique IDs for easy sharing
- **Shareable Links** - Get subscription IDs to share with customers
- **Member Management** - View all subscribers sorted by subscription date
- **Revenue Tracking** - Monitor subscription revenue and customer growth
- **Flexible Pricing** - Set any amount in CFX and billing period (daily, weekly, monthly, etc.)

### For Users
- **Easy Subscription** - Subscribe using just the subscription ID from merchant links
- **Auto-funding** - Fund subscriptions with initial CFX payment
- **Balance Management** - Add CFX funds to maintain active subscriptions
- **Cancellation** - Cancel anytime with automatic refunds
- **Transparent Tracking** - View all subscription details on blockchain

### Core Features
- **Blockchain-based** - All data stored on Conflux blockchain
- **Subscription IDs** - Each service gets a unique ID for easy sharing
- **Date-based Sorting** - Members listed by subscription date
- **Automatic Charging** - Merchants can charge when due
- **Real-time Balance** - Track CFX balance and next charge date
- **Pause/Resume** - Users can pause subscriptions
- **Automatic Refunds** - CFX refunds on cancellation

## 📁 Project Structure

```
FluxSub/
├── f-e/                          # Frontend (Next.js + React)
│   ├── src/
│   │   ├── app/                  # Next.js app router
│   │   │   ├── dashboard/        # User dashboard
│   │   │   ├── merchant/         # Merchant dashboard
│   │   │   └── page.tsx          # Home page
│   │   ├── components/           # React components
│   │   │   ├── layout/           # Layout components
│   │   │   ├── ui/               # UI components
│   │   │   ├── web3/             # Web3 components
│   │   │   ├── SimpleConnectButton.tsx
│   │   │   └── WalletModal.tsx
│   │   ├── contexts/             # React contexts
│   │   │   └── WalletContext.tsx
│   │   ├── config/               # Configuration
│   │   │   └── contracts.ts      # Contract addresses
│   │   └── types/                # TypeScript types
│   ├── public/                   # Static assets
│   ├── package.json
│   └── README.md
├── smart-contracts/              # Smart contracts
│   ├── FluxSub.sol              # Main subscription contract
│   ├── FluxSubFactory.sol       # Factory contract
│   ├── INFO.md                  # Contract documentation
│   └── CONTRACT_ADDRESSES.md    # Deployed addresses
└── README.md                    # This file
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with app router
- **React 19** - UI library
- **TypeScript** - Type safety
- **EIP6963** - Wallet detection standard
- **Ethers.js** - Ethereum/Conflux interaction
- **Lucide React** - Icons
- **CSS-in-JS** - Styling with inline styles

### Smart Contracts
- **Solidity 0.8.19** - Smart contract language
- **OpenZeppelin** - Security libraries
- **Conflux Network** - Blockchain platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Conflux wallet (MetaMask, Fluent, etc.)

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FluxSub
   ```

2. **Install dependencies**
   ```bash
   cd f-e
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Smart Contracts

The smart contracts are already deployed on Conflux Mainnet:

- **FluxSubFactory**: `0xb62B847c8F00d15b0d05A5902B6C995B2E6B87dC`
- **FluxSub**: `0xe475f7E4caC5ED0229dbc0e040a88A09c625dF74`

Contract addresses are configured in `f-e/src/config/contracts.ts`.

## 📖 Usage Guide

### For Merchants

1. **Connect Wallet**
   - Click "Connect Wallet" in the header
   - Select your preferred wallet (MetaMask, Fluent, etc.)

2. **Create Subscription Service**
   - Go to Merchant Dashboard
   - Click "Create Service"
   - Fill in service details (name, description, amount, period)
   - Get your unique subscription ID

3. **Share with Customers**
   - Share the subscription ID or create a link
   - Customers can subscribe using just the ID

4. **Manage Subscribers**
   - View all subscribers sorted by subscription date
   - Charge subscriptions when due
   - Monitor revenue and growth

### For Users

1. **Connect Wallet**
   - Click "Connect Wallet" in the header
   - Select your preferred wallet

2. **Subscribe to Service**
   - Get subscription ID from merchant
   - Go to Dashboard
   - Click "Create Subscription"
   - Enter subscription ID and initial funding

3. **Manage Subscriptions**
   - View all active subscriptions
   - Add funds when needed
   - Cancel subscriptions anytime

## 🔧 Configuration

### Network Configuration

The app is configured for Conflux Mainnet by default. To switch networks, update `f-e/src/config/contracts.ts`:

```typescript
export const CURRENT_NETWORK = 'mainnet'; // or 'testnet'
```

### Contract Addresses

Contract addresses are managed in `f-e/src/config/contracts.ts`:

```typescript
export const CONTRACTS = {
  mainnet: {
    FluxSubFactory: "0xb62B847c8F00d15b0d05A5902B6C995B2E6B87dC",
    FluxSub: "0xe475f7E4caC5ED0229dbc0e040a88A09c625dF74",
  }
};
```

## 🧪 Development

### Frontend Development

```bash
cd f-e

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Smart Contract Development

The smart contracts are located in `smart-contracts/`:

- `FluxSub.sol` - Main subscription contract
- `FluxSubFactory.sol` - Factory contract for creating instances

For contract development, you'll need:
- Solidity compiler
- Hardhat or Remix IDE
- Conflux network access

## 📊 Smart Contract Details

### FluxSub Contract

**Key Functions:**
- `createSubscriptionService()` - Create new subscription service
- `subscribe()` - Subscribe to a service using subscription ID
- `chargeSubscription()` - Charge a user's subscription
- `fundSubscription()` - Add funds to subscription
- `cancelSubscription()` - Cancel and get refund
- `getSubscriptionMembers()` - Get all members sorted by date

**Events:**
- `SubscriptionCreated` - When a new service is created
- `UserSubscribed` - When a user subscribes
- `SubscriptionCharged` - When a subscription is charged
- `SubscriptionCancelled` - When a subscription is cancelled

### FluxSubFactory Contract

**Key Functions:**
- `createFluxSub()` - Deploy new FluxSub contract
- `getAllFluxSubContracts()` - List all deployed contracts
- `getUserFluxSubContracts()` - Get contracts by creator

## 🔒 Security

- **OpenZeppelin Libraries** - Battle-tested security patterns
- **ReentrancyGuard** - Prevents reentrancy attacks
- **Pausable** - Emergency pause functionality
- **Ownable** - Access control for admin functions
- **Input Validation** - All inputs are validated
- **Safe Math** - Solidity 0.8+ built-in overflow protection

## 🌐 Network Information

### Conflux Mainnet
- **Chain ID**: 1029
- **RPC URL**: https://main.confluxrpc.com
- **Explorer**: https://confluxscan.io
- **Native Token**: CFX

### Conflux Testnet
- **Chain ID**: 1
- **RPC URL**: https://test.confluxrpc.com
- **Explorer**: https://testnet.confluxscan.io
- **Native Token**: CFX

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **GitHub Issues**: [Create an issue](https://github.com/your-repo/fluxsub/issues)
- **Documentation**: Check the `smart-contracts/INFO.md` for contract details
- **Community**: Join our Discord/Telegram for support

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-token support
- [ ] Subscription templates
- [ ] API for third-party integrations
- [ ] Governance token
- [ ] Cross-chain support

## 🙏 Acknowledgments

- **Conflux Network** - For the blockchain platform
- **OpenZeppelin** - For security libraries
- **Next.js Team** - For the amazing React framework
- **Ethers.js** - For Web3 interaction library

---

**Built with ❤️ for the decentralized future**
