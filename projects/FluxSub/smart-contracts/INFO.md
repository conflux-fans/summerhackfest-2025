# FluxSub Smart Contracts

## 📋 Contract Files

- **`FluxSub.sol`** - Main subscription contract
- **`FluxSubFactory.sol`** - Factory contract for creating multiple instances

## 🎯 Key Features

### For Merchants
- **Create Subscription Services** with unique IDs
- **Shareable Links** - Get subscription ID to share with customers
- **Member Management** - View all subscribers sorted by subscription date
- **Revenue Tracking** - Monitor subscription revenue and growth

### For Users
- **Easy Subscription** - Subscribe using just the subscription ID
- **Auto-funding** - Fund subscriptions with initial CFX payment
- **Balance Management** - Add CFX funds to maintain active subscriptions
- **Cancellation** - Cancel anytime with automatic refunds

## 🚀 How It Works

### Merchant Flow
1. **Create Service**: `createSubscriptionService(name, description, amount, period)`
2. **Get ID**: Contract returns unique `subscriptionId`
3. **Share Link**: `https://fluxsub.com/subscribe/{subscriptionId}`
4. **View Members**: `getSubscriptionMembers(subscriptionId)` - sorted by date

### User Flow
1. **Get Link**: From merchant (contains subscriptionId)
2. **Subscribe**: `subscribe(subscriptionId, initialFunding)`
3. **Fund**: `fundSubscription(userSubscriptionId)`
4. **Cancel**: `cancelSubscription(userSubscriptionId)` - auto refund

## 📊 Contract Addresses

Update these addresses in your frontend after deployment:

### Testnet
```
FluxSubFactory: [TO_BE_DEPLOYED]
FluxSub: [TO_BE_DEPLOYED]
```

### Mainnet
```
FluxSubFactory: [TO_BE_DEPLOYED]
FluxSub: [TO_BE_DEPLOYED]
```

## 🔧 Frontend Integration

The contracts are designed to work with your existing frontend:

- **Subscription IDs** match the frontend's subscription creation flow
- **Member listing** supports the merchant dashboard's member management
- **Date sorting** provides chronological member lists
- **Balance tracking** matches the frontend's subscription display

## 📝 Notes

- Contracts use OpenZeppelin for security (ReentrancyGuard, Pausable, Ownable)
- All amounts are in wei (use ethers.utils.parseEther() for CFX amounts)
- Members are automatically sorted by subscription date
- Automatic refunds on cancellation
- Pause/resume functionality included
