# Multi-Wallet Connection Setup

## Supported Wallets

Forlux now supports multiple wallet types! You can connect using any of the following wallets:

### 🦊 **MetaMask** (Most Popular)
- Visit [metamask.io](https://metamask.io/)
- Install the browser extension
- Create or import a wallet

### 🌊 **Fluent Wallet** (Conflux Native)
- Visit [fluentwallet.com](https://fluentwallet.com/)
- Install the browser extension
- Create or import a wallet

### 🔷 **Coinbase Wallet**
- Visit [coinbase.com/wallet](https://coinbase.com/wallet)
- Install the browser extension
- Create or import a wallet

### 🛡️ **Trust Wallet**
- Visit [trustwallet.com](https://trustwallet.com/)
- Install the browser extension
- Create or import a wallet

### 🟡 **Binance Chain Wallet**
- Visit [binance.org](https://binance.org/)
- Install the browser extension
- Create or import a wallet

## Prerequisites

You need to have **at least one** of the supported wallet extensions installed in your browser.

## How to Connect Your Wallet

### Single Wallet (Auto-Connect)
1. **Open the Forlux application** in your browser
2. **Click the "Connect Wallet" button** in the top-right corner of the header
3. **If only one wallet is detected**, it will connect automatically
4. **Approve the connection** in the wallet popup
5. **Your wallet address will be displayed** in the header once connected

### Multiple Wallets (Selection)
1. **Open the Forlux application** in your browser
2. **Click the "Connect Wallet" button** in the top-right corner of the header
3. **If multiple wallets are detected**, a selection modal will appear
4. **Choose your preferred wallet** from the list
5. **Approve the connection** in the selected wallet popup
6. **Your wallet address will be displayed** in the header once connected

## Features

- **Multi-wallet support**: Connect with MetaMask, Fluent Wallet, Coinbase Wallet, Trust Wallet, or Binance Chain Wallet
- **Auto-detection**: Automatically detects all installed wallet extensions
- **Smart selection**: Auto-connects if only one wallet is available, shows selection modal for multiple wallets
- **Real-time connection status**: The app automatically detects if your wallet is connected
- **Address display**: Your wallet address is shown in a shortened format (e.g., `0x1234...5678`)
- **Wallet type indicator**: Hover over the address to see which wallet type you're connected with
- **Easy disconnect**: Click the "Disconnect" button to disconnect your wallet
- **Error handling**: Clear error messages if connection fails

## Supported Networks

Currently, the application is configured to work with:
- **Conflux Testnet** (recommended for testing)
- **Conflux Mainnet** (for production use)

## Troubleshooting

### "No wallet extensions detected" Error
- Make sure at least one supported wallet extension is installed and enabled
- Refresh the page after installing the extension
- Check that the extension is not blocked by your browser
- Try installing MetaMask, Fluent Wallet, or another supported wallet

### Connection Failed
- Ensure you have at least one account in your selected wallet
- Try disconnecting and reconnecting your wallet
- Check your internet connection
- Try selecting a different wallet if multiple are available

### Wrong Network
- Make sure your wallet is connected to Conflux testnet
- You can switch networks in your wallet settings
- Different wallets may have different network switching methods

## Security Notes

- Never share your private keys or seed phrases
- Always verify you're on the correct website before connecting
- The application only requests read access to your wallet address
- You maintain full control of your wallet at all times
