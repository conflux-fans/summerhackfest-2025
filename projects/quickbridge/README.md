# QuickBridge
> **A user-friendly cross-chain swap dApp built on Conflux eSpace, leveraging the Meson protocol for seamless, low-cost token bridging between networks like Base and Conflux.**
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Conflux](https://img.shields.io/badge/built%20on-Conflux-blue)](https://confluxnetwork.org)
[![Hackathon](https://img.shields.io/badge/SummerHackfest-2025-green)](https://github.com/conflux-fans/summerhackfest-2025)
## 🎯 Overview
The QuickBridge is a decentralized application that simplifies cross-chain token swaps, allowing users to bridge assets like USDC from Ethereum-compatible chains (e.g., Base) to Conflux eSpace with minimal fees and fast execution. By integrating the Meson relayer protocol, it addresses the pain points of fragmented liquidity and high bridging costs in multi-chain ecosystems. This project uniquely combines Conflux's high-throughput eSpace with Meson's intent-based swapping for a smooth, non-custodial experience, enabling instant status tracking and automated retries for pending transactions.
## 🏆 Hackathon Information
- **Event**: Code Without Borders - SummerHackfest 2025
- **Focus Area**: [Open Innovation - Build anything you want using Conflux features]
- **Team**: N/A
- **Submission Date**: September 15, 2025
## 👥 Team
| Name | Role | GitHub | Discord |
|------|------|--------|---------|
| syv_dev | Developer | [@0xfdbu](https://github.com/0xfdbu) | syv_dev |
## 🚀 Problem Statement
**What problem does your project solve?**
Cross-chain asset transfers are notoriously complex, involving high gas fees, long wait times, and fragmented user interfaces that confuse non-expert users. DeFi enthusiasts and everyday users on chains like Base struggle to move tokens to high-performance networks like Conflux without relying on centralized bridges or facing liquidity risks. Existing solutions often lack real-time status updates and retry mechanisms, leading to failed transactions and lost trust. Blockchain's interoperability potential is underutilized here—Conflux's eSpace can enable faster, cheaper swaps, but tools are needed to make it accessible.
- Why this problem matters: It hinders DeFi adoption by creating barriers to liquidity flow across ecosystems.
- Who is affected: Retail users, developers building multi-chain dApps, and projects seeking efficient Conflux integration.
- Current limitations: Slow confirmations, no built-in retries, and UI silos that don't track end-to-end swaps.
- How blockchain technology can help: Leverages Conflux's Tree-Graph consensus for speed and Meson's relayer for trustless execution.
## 💡 Solution
**How does your project address the problem?**
The QuickBridge provides an intuitive React-based frontend for initiating and monitoring cross-chain swaps via the Meson protocol, directly on Conflux eSpace. Users connect their wallet, select source/target chains (e.g., Base to Conflux), and execute swaps with one-click— the app handles encoding, submission, and status polling with automatic retries every 5 seconds for pending initiations. It improves on traditional bridges by offering a unified dashboard for timeline tracking (Posted, Bonded, Locked, Executed, Released) and visual feedback via gradients and icons.
- High-level overview: Wallet integration → Swap initiation via Meson API → Real-time polling and retry → Completion notification.
- Key features: Seamless wallet connect, swap details grid, status banners, and timeline view.
- How it improves: Reduces user friction with auto-retries and eSpace-optimized txs, vs. manual polling in other tools.
- Benefits: Faster onboarding to Conflux, lower costs via Meson, and enhanced UX for multi-chain DeFi.
## ⚡ Conflux Integration
**How does your project leverage Conflux features?**
- [x] **Core Space** - Not directly used; focused on eSpace for EVM compatibility.
- [x] **eSpace** - Primary network for swap execution and status queries, utilizing its high TPS for quick confirmations.
- [ ] **Cross-Space Bridge** - Future integration planned for Core-eSpace transfers.
- [ ] **Gas Sponsorship** - Not implemented; relies on user-paid gas for authenticity.
- [ ] **Built-in Contracts** - Uses Conflux's native EVM contracts for transaction handling.
- [x] **Tree-Graph Consensus** - Benefits from Conflux's unique consensus for sub-second finality in swap executions, ensuring reliable Meson relayer interactions.
### Partner Integrations
- [ ] **Privy** - Not used.
- [ ] **Pyth Network** - Not used.
- [x] **LayerZero** - Indirectly via Meson for cross-chain messaging.
- [x] **Other** - Meson.fi relayer API for swap initiation and status polling.
## ✨ Features
### Core Features
- **Wallet Connection** - Secure integration with wagmi for MetaMask/Fluent Wallet support on eSpace.
- **Swap Initiation** - One-click bridging from Base/CFX with Meson encoding for USDC-like tokens.
- **Status Tracking** - Real-time timeline with banners for In Progress, Completed, or Expired states.
### Advanced Features
- **Auto-Retry Polling** - Retries API calls every 5s if swap not found, with user-friendly "Awaiting Initiation" screen.
- **Visual Feedback** - Gradient icons and animations (e.g., pulsing Clock) for intuitive UX.
### Future Features (Roadmap)
- **Multi-Token Support** - Expand beyond USDC to ETH/WETH.
- **Mobile Responsiveness** - Full PWA conversion for on-the-go swaps.
- **Merge with AstrumGate** - Integrate NFT bridging capabilities from the AstrumGate project for comprehensive asset transfers.
## 🛠️ Technology Stack
### Frontend
- **Framework**: React
- **Styling**: Tailwind CSS
- **State Management**: React Query (via @tanstack/react-query)
- **Web3 Integration**: wagmi + viem
### Backend
- **Runtime**: N/A (Pure frontend dApp)
- **Framework**: N/A
- **Database**: N/A
- **APIs**: REST (Meson relayer API)
### Blockchain
- **Network**: Conflux eSpace
- **Smart Contracts**: Solidity (via Meson protocol)
- **Development**: N/A (Relies on Meson SDK)
- **Testing**: Jest (frontend unit tests)
### Infrastructure
- **Hosting**: Vercel/Netlify
- **Storage**: N/A
- **Monitoring**: N/A
## 🏗️ Architecture
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Frontend │ │ Meson API │ │ Blockchain │
│ (React) │◄──►│ (Relayer) │◄──►│ (Conflux eSpace) │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         │ │ │
         ▼ ▼ ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ User Interface│ │ Status Poller │ │ Swap Execution │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```
**High-level architecture description:**
The React frontend handles UI and wallet interactions, sending encoded swap intents to the Meson relayer API. The API processes the request and executes on Conflux eSpace via smart contracts. Status updates flow back through polling (with retries), updating the local state via React Query for real-time UI refreshes. Data flows unidirectionally from user input → API → chain, with bidirectional polling for feedback.
## 📋 Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **Git**
- **Conflux Wallet** ([Fluent Wallet](https://fluentwallet.com/) or [MetaMask](https://metamask.io/) for eSpace)
### Development Tools (Optional)
- **Hardhat** - For smart contract development
- **Foundry** - Alternative smart contract framework
- **Docker** - For containerized development
## 🚀 Installation & Setup
### 1. Clone the Repository
```bash
git clone https://github.com/0xfdbu/summerhackfest-2025.git
cd projects/quickbridge/app
```
### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install
```
### 3. Smart Contract Deployment (if applicable)
N/A (Uses Meson protocol contracts)
### 4. Start Development Servers
```bash
# Start frontend
npm run dev
```
Your application should now be running at `http://localhost:5173`
## 📱 Usage
### Getting Started
1. **Connect Wallet**
- Open the application in your browser
- Click "Connect Wallet" button
- Select your preferred wallet (Fluent/MetaMask)
- Approve the connection
2. **Initiate Swap**
- Navigate to /bridge
- Select from/to chains (e.g., Base USDC to Conflux USDC)
- Enter amount and confirm tx
- View tx hash for status page
3. **Track Status**
- Go to /swap/{txid}
- Watch timeline update in real-time
### Example Workflows
#### Workflow 1: Base to Conflux Swap
```
1. Connect your wallet
2. Navigate to Bridge
3. Select Base → Conflux, 0.1 USDC
4. Click Swap and confirm
5. Redirect to status; auto-refreshes until complete
```
#### Workflow 2: Check Pending Swap
```
1. Enter txid in URL
2. View "Awaiting Initiation" if not found
3. Timeline populates as steps complete
```
## 🎬 Demo
### Live Demo
- **URL**: [https://meson-integration.vercel.app/](https://meson-integration.vercel.app/)
- **Test Account**: Use testnet USDC on Base; no credentials needed
### Demo Video
- **YouTube**: [https://youtube.com/watch?v=demo-meson-bridge](https://youtube.com/watch?v=demo-meson-bridge)
- **Duration**: [2 minutes]
## 🔒 Security
### Security Measures
- **Smart Contract Auditing**: Relies on audited Meson protocol
- **Input Validation**: Amount/token validation in frontend
- **Access Control**: Wallet signature required for txs
### Known Security Considerations
- Relayer trust: Meson is non-custodial, but API downtime possible
- Frontend-only: No server-side secrets
## 🚧 Known Issues & Limitations
### Current Limitations
- **Limitation 1**: Single token (USDC) support; workaround: Manual token selection in future
- **Limitation 2**: Testnet only; mainnet via env toggle
### Known Issues
- **Issue 1**: Rare API 404 retries may lag; status: Monitored
- **Issue 2**: No mobile optimization; status: Planned
### Future Improvements
- **Improvement 1**: Add error modals; Q4 2025
- **Improvement 2**: Integrate notifications; Q1 2026
## 🗺️ Roadmap
### Phase 1 (Hackathon) ✅
- [x] Core functionality implementation
- [x] Basic UI/UX
- [x] Smart contract deployment
- [x] Demo preparation
### Phase 2 (Post-Hackathon)
- [ ] Enhanced user interface
- [ ] Additional features
- [ ] Security audit
- [ ] Mainnet deployment
### Phase 3 (Future)
- [ ] Mobile application
- [ ] Advanced analytics
- [ ] Third-party integrations
- [ ] Scaling optimizations
## 🤝 Contributing
We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.
### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
### Code Style
- Follow established conventions
- Write meaningful commit messages
## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
## Acknowledgments
### Conflux Hackathon
- **Conflux Network** - For hosting the hackathon and providing the platform
- **Conflux Team** - For technical support and mentorship
- **Community** - For feedback and encouragement
## 📞 Contact & Support
### Team Contact
- **Discord**: [syv_dev]
- **GitHub**: [Team Lead Profile](https://github.com/0xfdbu)
### Project Links
- **GitHub**: [https://github.com/0xfdbu/summerhackfest-2025/tree/main/projects/quickbridge](https://github.com/0xfdbu/summerhackfest-2025/tree/main/projects/quickbridge)
- **Demo**: [https://meson-integration.vercel.app/](https://meson-integration.vercel.app/)
- **Documentation**: [https://docs.meson-conflux-bridge.com](https://docs.meson-conflux-bridge.com)
### Support
- **Issues**: [GitHub Issues](https://github.com/0xfdbu/summerhackfest-2025/issues)
- **Discussions**: [GitHub Discussions](https://github.com/0xfdbu/summerhackfest-2025/discussions)
---
**Built with ❤️ for the Code Without Borders - SummerHackfest 2025**
*Thank you for checking out our project! We hope it contributes to the growth and innovation of the Conflux ecosystem.*