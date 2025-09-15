# ChainBrawler Deployment Guide

## 🚀 Quick Deployment for Hackathon Demo

This guide provides step-by-step instructions for deploying ChainBrawler for the hackathon demo.

## Prerequisites

- Node.js 18+
- pnpm 9.1.0+
- Vercel account (or similar hosting platform)
- Conflux testnet CFX for testing

## Deployment Steps

### 1. Prepare the Repository

```bash
# Clone and setup
git clone https://github.com/chainbrawler/chainbrawler.git
cd chainbrawler
pnpm install
pnpm build
```

### 2. Deploy Smart Contracts

```bash
# Deploy to Conflux Testnet
cd packages/contract

# Set environment variables
export HARDHAT_VAR_DEPLOYER_MNEMONIC="your_mnemonic_here"
export HARDHAT_VAR_CONFLUX_TESTNET_RPC="https://evmtestnet.confluxrpc.com"

# Deploy contracts
pnpm hardhat ignition deploy ./ignition/modules/ChainBrawlerModule.ts --network confluxTestnet
```

### 3. Update Contract Addresses

After deployment, update the contract addresses in the core package:

```bash
# Generate new addresses
cd packages/core
pnpm generate:addresses
```

### 4. Deploy Web Application

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from web-ui directory
cd packages/web-ui
vercel --prod

# Set environment variables in Vercel dashboard
# VITE_WALLETCONNECT_PROJECT_ID=your_project_id
# VITE_CONFLUX_API_KEY=your_api_key (optional)
```

#### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build the application
cd packages/web-ui
pnpm build

# Deploy
netlify deploy --prod --dir=dist
```

#### Option C: GitHub Pages

```bash
# Build the application
cd packages/web-ui
pnpm build

# Deploy to GitHub Pages
npx gh-pages -d dist
```

### 5. Configure Environment Variables

Set the following environment variables in your hosting platform:

```bash
# Required
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Optional (for better RPC performance)
VITE_CONFLUX_API_KEY=your_conflux_api_key
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
VITE_INFURA_API_KEY=your_infura_api_key
```

### 6. Update Contract Addresses

After deployment, update the contract addresses in the deployed application:

1. Go to your hosting platform's environment variables
2. Add the deployed contract addresses:
   ```
   VITE_CHAINBRAWLER_CONTRACT=0x123...
   VITE_LEADERBOARD_MANAGER=0x456...
   VITE_LEADERBOARD_TREASURY=0x789...
   ```

### 7. Test the Deployment

1. Visit your deployed URL
2. Connect a wallet (MetaMask, Fluent)
3. Switch to Conflux eSpace Testnet (ID: 71)
4. Test character creation
5. Test combat system
6. Test all major features

## 🐳 Docker Deployment (Alternative)

### Build Docker Image

```bash
# Build the web application
cd packages/web-ui
docker build -t chainbrawler-web .

# Run the container
docker run -p 3000:3000 chainbrawler-web
```

### Docker Compose

```bash
# Use the provided docker-compose.yml
cd packages/web-ui
docker-compose up -d
```

## 🔧 Configuration

### WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID
4. Add to environment variables

### Conflux API Key (Optional)

1. Go to [Conflux RPC Pro](https://confluxrpc.com/)
2. Sign up for an account
3. Get your API key
4. Add to environment variables

## 📱 Mobile Testing

Test the deployed application on mobile devices:

1. Open the URL on mobile browser
2. Test wallet connection
3. Test character creation
4. Test combat system
5. Verify responsive design

## 🔍 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
```

**Contract Deployment Fails**
```bash
# Check network configuration
pnpm hardhat console --network confluxTestnet

# Verify RPC endpoint
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://evmtestnet.confluxrpc.com
```

**Web App Not Loading**
- Check environment variables
- Verify contract addresses
- Check browser console for errors
- Ensure wallet is connected to correct network

### Debug Mode

Enable debug mode for troubleshooting:

```bash
# Set debug environment variable
export VITE_DEBUG=true

# Rebuild and deploy
pnpm build
```

## 📊 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
cd packages/web-ui
pnpm build
npx vite-bundle-analyzer dist
```

### Runtime Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Optimize images and fonts

## 🔒 Security Considerations

### Environment Variables

- Never commit API keys to repository
- Use environment variables for sensitive data
- Rotate keys regularly
- Monitor usage and access

### Smart Contract Security

- Verify contracts on Conflux explorer
- Use multi-sig for contract upgrades
- Implement access controls
- Regular security audits

## 📈 Monitoring

### Application Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor performance metrics
- Track user analytics
- Monitor blockchain transactions

### Smart Contract Monitoring

- Monitor contract events
- Track gas usage
- Monitor contract interactions
- Set up alerts for critical events

## 🎯 Demo Preparation

### Pre-Demo Checklist

- [ ] Application is deployed and accessible
- [ ] All features are working correctly
- [ ] Mobile version is responsive
- [ ] Wallet connection is seamless
- [ ] Contract addresses are correct
- [ ] Environment variables are set
- [ ] Performance is optimized
- [ ] Error handling is working
- [ ] Loading states are smooth
- [ ] All game mechanics are functional

### Demo Environment

- Use Conflux eSpace Testnet for demo
- Have test CFX available for transactions
- Test with multiple wallet types
- Prepare backup demo environment
- Have screenshots ready for backup

## 📞 Support

For deployment issues:

- **GitHub Issues**: [Create an issue](https://github.com/chainbrawler/chainbrawler/issues)
- **Discord**: [ChainBrawler Discord](https://discord.gg/chainbrawler)
- **Email**: sp@chainbrawler-web-ui.vercel.app

---

**Ready to deploy ChainBrawler for the hackathon demo!** 🚀
