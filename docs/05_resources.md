# Developer Resources & Tools

## 🚀 Getting Started with Conflux

### Essential Documentation
- [**Conflux Documentation**](https://doc.confluxnetwork.org/) - Complete developer portal and documentation
- [**eSpace Developer Quickstart**](https://doc.confluxnetwork.org/docs/espace/DeveloperQuickstart) - Get started with Ethereum-compatible development
  
## 🛠️ Development Tools & SDKs

### eSpace Development (EVM-Compatible) - **Recommended for Ethereum Developers**

#### Ethereum-Compatible Tools
- **[MetaMask Wallet](https://metamask.io/)** - Connect to Conflux eSpace like any EVM chain
- **[Hardhat](https://hardhat.org/)** - Full Ethereum development environment
- **[Foundry](https://getfoundry.sh/)** - Fast, portable Ethereum testing framework
- **[Remix IDE](https://remix.ethereum.org/)** - Web-based Solidity IDE
- **[thirdweb](https://thirdweb.com/)** - Web3 development platform

#### JavaScript/TypeScript Libraries for eSpace
```bash
# Ethereum-compatible libraries (for eSpace)
npm install ethers@^6.0.0  # Latest ethers.js
npm install viem@^2.0.0    # Modern TypeScript Ethereum library
npm install web3@^4.0.0    # Web3.js latest

# Ethereum development frameworks
npm install hardhat
npm install @foundry-rs/hardhat-foundry
```

### Core Space Development (Native Conflux)

#### Conflux-Specific Tools
- **[js-conflux-sdk](https://www.npmjs.com/package/js-conflux-sdk)** - Official Conflux JavaScript SDK
- **[Hardhat Conflux Plugin](https://github.com/Conflux-Chain/hardhat-conflux)** - Hardhat integration for Core Space
- **[Fluent Wallet](https://fluentwallet.com/)** - Native Conflux wallet

#### Core Space SDKs
```bash
# Conflux JavaScript SDK (for Core Space)
npm install js-conflux-sdk@^2.5.0

# Python SDK
pip install conflux-web3

# Go SDK
go get github.com/Conflux-Chain/go-conflux-sdk
```

### Code Examples

#### eSpace Development (Ethereum-Compatible)

**Using Ethers.js with eSpace:**
```javascript
import { ethers } from 'ethers';

// Connect to Conflux eSpace
const provider = new ethers.JsonRpcProvider('https://evm.confluxrpc.com');
const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

// Deploy contract (same as Ethereum)
const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
const contract = await contractFactory.deploy(...constructorArgs);
await contract.deployed();
```

**Using Viem with eSpace:**
```javascript
import { createPublicClient, createWalletClient, http } from 'viem';
import { confluxESpace } from 'viem/chains';

// Create clients for Conflux eSpace
const publicClient = createPublicClient({
  chain: confluxESpace,
  transport: http('https://evm.confluxrpc.com')
});

const walletClient = createWalletClient({
  chain: confluxESpace,
  transport: http('https://evm.confluxrpc.com')
});
```

#### Core Space Development
```javascript
const { Conflux } = require('js-conflux-sdk');

const conflux = new Conflux({
  url: 'https://main.confluxrpc.com',
  networkId: 1029,
});

// Deploy contract with sponsorship
const contract = conflux.Contract({
  abi: contractABI,
  bytecode: contractBytecode,
});

const receipt = await contract.constructor(param1, param2)
  .sendTransaction({ from: account })
  .executed();
```

#### Cross-Space Bridge Usage
```javascript
// Transfer CFX from Core Space to eSpace
const crossSpaceCall = conflux.InternalContract('CrossSpaceCall');
await crossSpaceCall.transferEVM(mappedAddress)
  .sendTransaction({
    from: coreSpaceAddress,
    value: amount,
  });
```

## 🌐 Network Information

### Mainnet Configuration
```javascript
// Core Space Mainnet
{
  chainId: 1029,
  rpcUrl: 'https://main.confluxrpc.com',
  explorerUrl: 'https://confluxscan.io'
}

// eSpace Mainnet
{
  chainId: 1030,
  rpcUrl: 'https://evm.confluxrpc.com',
  explorerUrl: 'https://evm.confluxscan.io'
}
```

### Testnet Configuration
```javascript
// Core Space Testnet
{
  chainId: 1,
  rpcUrl: 'https://test.confluxrpc.com',
  explorerUrl: 'https://testnet.confluxscan.io'
}

// eSpace Testnet
{
  chainId: 71,
  rpcUrl: 'https://evmtestnet.confluxrpc.com',
  explorerUrl: 'https://evmtestnet.confluxscan.io'
}
```

### Faucets
- **[Conflux Portal Faucet](https://confluxnetwork.org/developers#faucet)** - Get test CFX for both Core Space and eSpace
- **[Core Space Testnet Faucet](https://faucet.confluxnetwork.org/)** - Get test CFX for Core Space
- **[eSpace Testnet Faucet](https://efaucet.confluxnetwork.org/)** - Get test CFX for eSpace

## 🎯 Why Choose Conflux?

### eSpace (Ethereum Compatible)
- **Zero Migration Cost** - Deploy Ethereum dApps without any code changes
- **Lower Gas Fees** - Significantly cheaper transactions than Ethereum mainnet  
- **Faster Confirmations** - 3-second block times vs 12 seconds on Ethereum
- **Use Familiar Tools** - MetaMask, Hardhat, Remix, ethers.js work out of the box
- **Better UX** - Fast, affordable transactions for better user experience

### Core Space (Native Conflux)
- **Transaction Sponsorship** - Users can interact without holding tokens
- **Higher Throughput** - Up to 6,000 TPS with Tree-Graph consensus
- **Finality** - PoS finality for enhanced security
- **Gas Optimization** - Advanced gas sponsorship mechanisms
- **Regulatory Compliance** - Gasless transactions help with compliance

## 💡 Innovation Areas & Project Ideas

Build anything you want! Here are some popular areas for inspiration:

**🤖 AI + Blockchain**: AI-powered trading bots, decentralized AI marketplaces, smart contract auditing tools

**🛠️ Developer Tools**: Visual contract builders, testing frameworks, deployment platforms, analytics dashboards

**💰 DeFi Innovation**: Yield optimizers, lending platforms, AMMs, liquid staking solutions

**🌍 Real-World Apps**: Supply chain tracking, digital identity, voting systems, IoT management

**⛓️ Cross-Chain**: Multi-chain wallets, governance systems, bridge aggregators, universal interfaces

**🎮 Gaming**: Play-to-earn platforms, NFT games, esports tournaments, virtual economies

## 🔧 Development Best Practices

### For eSpace Development
- **Use Standard Ethereum Tools** - Leverage familiar tooling like Hardhat, Foundry, Remix
- **Gas Optimization** - While cheaper than Ethereum, still optimize for better UX
- **Security** - Use OpenZeppelin contracts, implement proper access controls
- **Testing** - Use Hardhat/Foundry for comprehensive testing
- **Frontend** - Use ethers.js, viem, or web3.js for frontend integration

### For Core Space Development  
- **Sponsorship Design** - Implement gas sponsorship for better user experience
- **Address Format** - Use CIP-37 address format for Core Space
- **Cross-Space Integration** - Plan for Core Space ↔ eSpace interactions
- **Native Features** - Leverage unique Conflux features like internal contracts

## 📚 Learning Resources

### Essential Reading
- **[Conflux Documentation](https://doc.confluxnetwork.org/)** - Complete developer portal
- **[eSpace vs Core Space Guide](https://doc.confluxnetwork.org/docs/general/conflux-basics/spaces)** - Understanding the differences
- **[Ethereum Development](https://ethereum.org/developers)** - Ethereum fundamentals for eSpace
- **[Solidity Documentation](https://docs.soliditylang.org/)** - Smart contract programming
- **[OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)** - Secure smart contract library

### Video Tutorials
- **[Conflux Developer YouTube](https://www.youtube.com/@ConfluxNetwork)** - Official tutorials
- **[Ethereum Development Playlist](https://ethereum.org/developers/tutorials/)** - Applicable to eSpace development

## 🆘 Getting Help

### Community Support
- **Discord**: https://discord.gg/4A2q3xJKjC
- **Telegram**: https://t.me/ConfluxDevs
- **Reddit**: [r/Conflux_Network](https://reddit.com/r/Conflux_Network)
- **GitHub Discussions**: [Technical discussions](https://github.com/Conflux-Chain/conflux-rust/discussions)

### Official Support
- **Developer Forum**: [forum.conflux.fun](https://forum.conflux.fun/)
- **Discord**: https://discord.gg/4A2q3xJKjC
- **Bug Reports**: [GitHub Issues](https://github.com/Conflux-Chain/conflux-rust/issues)

### Hackathon-Specific Support
- **Discord**: https://discord.gg/4A2q3xJKjC - Get real-time help from the community and core team
- **Office Hours** - Weekly live Q&A sessions with Conflux engineers
- **Mentor Program** - 1-on-1 guidance from blockchain experts
- **Developer Relations** - Direct support from the Conflux DevRel team

## 🎯 Success Tips

### Choosing Your Development Path

**Choose eSpace if:**
- You have Ethereum development experience
- You want to migrate an existing Ethereum dApp
- You need access to existing Ethereum tooling and libraries
- You prioritize development speed and familiar workflows

**Choose Core Space if:**
- You want to leverage transaction sponsorship features
- You're building from scratch and want maximum throughput
- You want to explore unique Conflux capabilities

### Project Planning
1. **Start with a clear problem statement** - What real-world problem are you solving?
2. **Define your target users** - Who will benefit from your solution?
3. **Choose your space** - eSpace for Ethereum compatibility, Core Space for advanced features
4. **Select appropriate tools** - Use the right tech stack for your chosen space
5. **Set realistic milestones** - Break work into achievable deliverables

### Development Process
1. **Begin with an MVP** - Core functionality first, polish later
2. **Use existing templates** - Leverage proven patterns and code examples
3. **Test on testnet first** - Validate functionality before mainnet deployment
4. **Document as you build** - Clear README and inline documentation
5. **Engage with community** - Use Discord and forums for support

### Presentation Preparation
1. **Demo live functionality** - Working code beats slide decks
2. **Highlight Conflux advantages** - Show why you chose Conflux over other chains
3. **Address real problems** - Connect your solution to actual user needs
4. **Show technical depth** - Demonstrate understanding of blockchain concepts
5. **Prepare for Q&A** - Anticipate questions about architecture and design choices

---
