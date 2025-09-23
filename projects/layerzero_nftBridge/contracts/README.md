# Smart Contract Deployment & Configuration Guide

This guide walks you through setting up your environment, deploying contracts, and configuring LayerZero (OApp wiring) for your project. Follow each step carefully for a seamless deployment experience.

---

## 🛠️ Step 1 — Environment Setup

Create a `.env` file in your project root directory and add your private key:

```env
PRIVATE_KEY=your_private_key_here
```

> **Tip:**  
> Keep your private key secure! Never share or commit it to version control.

---

## 📦 Step 2 — Install Dependencies

Install all necessary project dependencies by running:

```sh
npm install
```

---

## 🚀 Step 3 — Deploy Contracts

Deploy your contracts to their respective networks using Hardhat:

```sh
npx hardhat lz:deploy
```
Result should look like

```
 npx hardhat  lz:deploy 

    ╭─────────────────────────────────────────╮
    │       ▓▓▓ LayerZero DevTools ▓▓▓        │
    │  ═══════════════════════════════════    │
    │          /*\                            │
    │         /* *\     BUILD ANYTHING        │
    │         ('v')                           │
    │        //-=-\\    ▶ OMNICHAIN           │
    │        (\_=_/)                          │
    │         ^^ ^^                           │
    │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
    ╰─────────────────────────────────────────╯

info:    Compiling your hardhat project
Nothing to compile
? Which networks would you like to deploy? ›  
Instructions:
    ↑/↓: Highlight option
    ←/→/[space]: Toggle selection
    [a,b,c]/delete: Filter choices
? Which networks would you like to deploy? ›  
Instructions:
    ↑/↓: Highlight option
    ←/→/[space]: Toggle selection
    [a,b,c]/delete: Filter choices
✔ Which networks would you like to deploy? › base, conflux
✔ Which deploy script tags would you like to use? … 
info:    Will deploy 2 networks: base, conflux
warn:    Will use all deployment scripts
✔ Do you want to continue? … yes
Network: base
Deployer: 0xB9DCA4c38547Aea56C1036aa421b4DA083e62bcc
Network: conflux
Deployer: 0xB9DCA4c38547Aea56C1036aa421b4DA083e62bcc
Deployed contract: DynamicONFTBridge, network: base, address: 0xB0C9C474AD0dBd3c8B4658F548B51976cDE0F19F
Deployed contract: DynamicONFTBridge, network: conflux, address: 0xdCe7e8289fe891209Cc6C850d76c7B5B8e401fFa
info:    ✓ Your contracts are now deployed

```

---

## ✍️ Step 4 — Update Deployment Addresses

After deployment, copy the deployed contract addresses into the following files:

- `deployments/base/DynamicWrappedONFT.json`
- `deployments/conflux/DynamicConfluxONFTAdapter.json`

> **Tip:**  
> This ensures layerzero.config.ts reads it before wiring.

---

## 🔗 Step 5 — Configure LayerZero (OApp Wiring)

Wire your OApp using the LayerZero configuration:

```sh
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

**⚠️ Note:**
- Transactions may fail during this process due to network or configuration issues.
- If a transaction fails, rerun the command until it succeeds (usually 4–5 attempts).
- This is a problem with layerzero not the code itself, currently getting feedback from L0 support to address the issue in the future.
- Upon success, you'll see:

```
info:    ✓ Your OApp is now configured
```

---

## 🎉 Completion

**Congratulations!**  
Your contracts are deployed and fully configured.

---

### Troubleshooting & Tips

- **Keep retrying:** Deployment and LayerZero configuration may require multiple attempts due to network congestion or gas issues.
- **Check logs:** Always review the terminal output for errors or confirmations.
- **Security:** Double-check your `.env` file and never expose secrets.
- **MinftNFT.sol:** This contract was only created for tests not real use and does not follow metadata standards.
---

For questions or further assistance, refer to project documentation or reach out to maintainers.
