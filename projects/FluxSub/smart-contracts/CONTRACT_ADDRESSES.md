# FluxSub Contract Addresses

Update these addresses in your frontend after deployment.

## 🧪 Conflux Testnet
- **Chain ID**: 1
- **RPC**: https://test.confluxrpc.com
- **Explorer**: https://testnet.confluxscan.io

```
FluxSubFactory: [TO_BE_DEPLOYED]
FluxSub: [TO_BE_DEPLOYED]
```

## 🌐 Conflux Mainnet
- **Chain ID**: 1029
- **RPC**: https://main.confluxrpc.com
- **Explorer**: https://confluxscan.io

```
FluxSubFactory: 0xb62B847c8F00d15b0d05A5902B6C995B2E6B87dC
FluxSub: 0xe475f7E4caC5ED0229dbc0e040a88A09c625dF74
```

## 🔧 Frontend Integration

```typescript
// src/config/contracts.ts
export const CONTRACTS = {
  testnet: {
    FluxSubFactory: "0x...", // Replace with deployed address
    FluxSub: "0x...",        // Replace with deployed address
  },
  mainnet: {
    FluxSubFactory: "0xb62B847c8F00d15b0d05A5902B6C995B2E6B87dC",
    FluxSub: "0xe475f7E4caC5ED0229dbc0e040a88A09c625dF74",
  }
};
```
