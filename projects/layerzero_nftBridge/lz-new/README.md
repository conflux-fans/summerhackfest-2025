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
# Deploy to Conflux network
npx hardhat run scripts/deployDynamicConfluxAdapter.ts --network conflux

# Deploy to Base network
npx hardhat run scripts/deployDynamicWrappedONFT.ts --network base
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
