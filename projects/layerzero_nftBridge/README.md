# L0 NftBridge

> **A cross-chain NFT bridge built on LayerZero, enabling seamless transfer of ERC721 tokens between Conflux and Base networks.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Conflux](https://img.shields.io/badge/built%20on-Conflux-blue)](https://confluxnetwork.org)
[![Hackathon](https://img.shields.io/badge/SummerHackfest-2025-green)](https://github.com/conflux-fans/summerhackfest-2025)

---

## 🎯 Overview

**L0 NftBridge** is a proof-of-concept cross-chain NFT bridge between **Conflux eSpace** and **Base**.  
It enables NFT projects on Conflux to access the **$15.54B TVL liquidity on Base (as of writing)** and expand NFT utility beyond a single chain.  

The project demonstrates how **LayerZero-powered interoperability** can unlock new opportunities for NFT projects.  

⚠️ This is **not production-ready**:
- Metadata is not yet passed between chains  
- NFT minting feature is experimental (metadata not created correctly)  
- Frontend lacks LayerZero explorer integrations (fees, bridge time, etc.)

---

## 🏆 Hackathon Information

- **Event**: Code Without Borders - SummerHackfest 2025  
- **Focus Area**: Open Innovation — Build anything using Conflux features  
- **Team**: N/A 
- **Submission Date**: September 15, 2025  

---

## 👥 Team

| Name | Role                      | GitHub | Discord |
|------|---------------------------|--------|---------|
| Syv  | Full-Stack Blockchain Dev | [@0xfdbu](https://github.com/0xfdbu) | syv_dev |

---

## 🚀 Problem Statement

NFT ecosystems are siloed by design. On Conflux, NFT projects:  
- Cannot reach the liquidity available on other chains (e.g., Base’s $15.54B TVL)  
- Have limited cross-chain utility and exposure  
- Rely on centralized bridges or exchanges  

This isolation reduces NFT adoption and market opportunities.

---

## 💡 Solution

L0 NftBridge provides a **permissionless ERC721 cross-chain bridge**:  
- 🌉 **Bridge NFTs** from Conflux eSpace to Base and back  
- 🔗 **Dynamic Adapter** — works with multiple NFT contracts without hardcoding  
- 🧾 **Proof-of-Concept** for LayerZero’s omnichain NFT interoperability  

**Unique aspects:**
- Designed specifically for **Conflux eSpace**  
- Showcases how Conflux projects can expand into Base’s liquidity pools  
- Lightweight prototype ready for hackathon demonstration  

---

## ⚡ Conflux Integration

- [x] **eSpace** – Bridge contracts deployed on eSpace  
- [ ] **Core Space** – Not used  
- [ ] **Cross-Space Bridge** – Not used in this POC  
- [ ] **Gas Sponsorship** – Not implemented  
- [ ] **Built-in Contracts** – Not used  
- [ ] **Tree-Graph Consensus** – Inherited from eSpace  

### Partner Integrations
- [x] **LayerZero** – Cross-chain messaging layer  
- [ ] **Privy** – Not used  
- [ ] **Pyth Network** – Not used  
- [ ] **Other** – N/A  

---

## ✨ Features

### Core Features
- 🌉 **Cross-chain NFT Bridging** between Conflux and Base  
- 🔗 **Dynamic Support** for multiple ERC721 contracts  
- ⚡ **Hackathon-ready demo** with frontend + contracts  

### Current Limitations
- ❌ Metadata (name, symbol, tokenURI) not passed  
- ❌ NFT minting feature unreliable (test/demo only)  
- ❌ No UI support for fees or bridge time from LayerZero  

### Future Roadmap
- ✅ Metadata bridging  
- ✅ Stable NFT minting  
- ✅ Frontend with LayerZeroScan integrations (fees, bridge tracking)  
- ✅ Mainnet-ready deployment  

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React + TypeScript + Vite  
- **Web3 Integration**: ethers.js  
- **Hosting**: [Vercel Demo](https://summerhackfest-2025-sooty.vercel.app/)  

### Blockchain
- **Networks**: Conflux eSpace, Base  
- **Smart Contracts**: Solidity  
- **Framework**: Hardhat  

### External APIs
- Etherscan v2 API (loading NFTs by contract address)
- Espace conflux scan API (loading NFTs by contract address)
---

## 🏗️ Architecture

```
    ┌────────────────────────────┐
    │          Frontend          │
    │    (React + Vite + ethers) │
    └─────────────▲──────────────┘
                  │
                  │ User tx / UI
                  │
    ┌─────────────┴──────────────┐
    │ Conflux eSpace (Origin)    │
    │                            │
    │ DynamicConfluxONFTAdapter  │
    │                            │
    └─────────────┬──────────────┘
                  │
                  │ LayerZero Msg
                  ▼
    ┌─────────────┴──────────────┐
    │        LayerZero            │
    │    Messaging Relayer/ULN    │
    └─────────────┬──────────────┘
                  │
                  │ LayerZero Msg
                  ▼
    ┌─────────────┴──────────────┐
    │ Base (Destination)         │
    │                            │
    │ DynamicWrappedONFT         │
    │                            │
    └─────────────┬──────────────┘
                  │
                  │ Mint wrapped NFT
                  ▼
          ┌───────┴────────┐
          │    Recipient   │
          │ (User wallet)  │
          └────────────────┘

```

## 🔄 Reverse Flow (Base → Conflux)

```
┌────────────────────────────┐
│          Frontend          │
│    (React + Vite + ethers) │
└─────────────▲──────────────┘
              │
              │ User tx / UI
              │
┌─────────────┴──────────────┐
│ Base (Origin)              │
│                            │
│ DynamicWrappedONFT         │
│ (Burn wrapped NFT)         │
└─────────────┬──────────────┘
              │
              │ LayerZero Msg
              ▼
┌─────────────┴──────────────┐
│        LayerZero            │
│    Messaging Relayer/ULN    │
└─────────────┬──────────────┘
              │
              │ LayerZero Msg
              ▼
┌─────────────┴──────────────┐
│ Conflux eSpace (Destination)│
│                             │
│ DynamicConfluxONFTAdapter   │
│ (Unlock original NFT)       │
└─────────────┬──────────────┘
              │
              │ Transfer original NFT
              ▼
      ┌───────┴────────┐
      │    Recipient   │
      │ (User wallet)  │
      └────────────────┘
```

**Flow:**
1. User connects wallet in frontend  
2. User selects NFT + destination chain 
3. Whitelist if the first time collection is being bridged.
4. Grant permission for nft transfer (approval)
5. Sign the bridge transaction
6. Contract on Conflux debits NFT and sends message via LayerZero  
7. Destination contract on Base credits NFT to user  

---

## 📄 Smart Contracts

### Deployed Addresses

```
DynamicConfluxONFTAdapter (Conflux original): 0x890C3dEc7d958bBCd5D4fcd308F6b04946f30ada

DynamicWrappedONFT (Base): 0xcF394722e8fF94579eC98BA0D11309F7E888a029

Nftminter (just for tests - broken metadata..) (Conflux): 0xD9Ed0B00Aa868Cd2E7aa4198C7D792D3aF9ec61d
```

---

## 📋 Prerequisites

- Node.js (>= 18)
- npm or yarn
- Git
- Fluent Wallet or MetaMask for eSpace - (Rabby is recommended due to native multichain support)

---

## 🚀 Installation & Setup

**Clone the repo**
```bash
git clone https://github.com/0xfdbu/summerhackfest-2025.git
```

**Contract setup instructions**
```bash
https://github.com/0xfdbu/summerhackfest-2025/blob/main/projects/layerzero_nftBridge/lz-new/README.md
```

**Frontend setup instructions**
```bash
https://github.com/0xfdbu/summerhackfest-2025/blob/main/projects/layerzero_nftBridge/app/README.md
```


Open: [http://localhost:5173](http://localhost:5173)

---

## 📱 Usage

1. Connect your wallet (Fluent / MetaMask) - (Rabby is recommended due to native multichain support)
2. Select NFT and target chain
3. Approve & send transaction
4. Wait for LayerZero delivery
5. NFT appears on destination chain

---

## 🧪 Testing

```bash
# Run contract tests
cd lz-new
npx hardhat compile
```

---

## 🚧 Known Issues & Limitations

- Metadata not passed between chains
- NFT mint unreliable
- Frontend lacks LayerZeroScan integration for fees/time

---

## 🗺️ Roadmap

**Phase 1 (Hackathon) ✅**
- Core contracts deployed
- Demo frontend built
- Proof-of-concept live

**Phase 2 (Post-Hackathon)**
- Add metadata bridging
- Improve minting reliability
- UI support for fees + bridge time

**Phase 3 (Future)**
- Security audit
- Production deployment
- Mainnet launch

---

## 🤝 Contributing

We welcome contributions!  
Please fork, branch, and open a Pull Request.

---

## 📄 License

MIT License – see the LICENSE file for details.

---

## ⭐ Acknowledgments

- Conflux Hackathon
- Conflux Network — hosting and platform
- Conflux Team — technical guidance
- Community — feedback and encouragement

**Third-Party Tools**
- LayerZero Labs — cross-chain messaging
- OpenZeppelin — ERC721 contracts
- Vercel — hosting

Built with ❤️ for Code Without Borders – SummerHackfest 2025

---

Thanks for checking out our project!  
We hope it helps expand NFT innovation in the Conflux ecosystem.