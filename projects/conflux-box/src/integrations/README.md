# Integration System Documentation

## Overview

The modular integration system allows easy addition of DeFi protocol integrations to the Conflux DevKit. Each integration is a self-contained component with metadata that defines its behavior and compatibility.

## Architecture

### Core Components

1. **Integration Framework** (`src/integrations/types.ts`)

   - Defines interfaces and types for integrations
   - Provides the IntegrationRegistry class for managing integrations
   - Network-aware filtering system

2. **Integration Registry** (`src/integrations/registry.ts`)

   - Auto-registers all available integrations
   - Provides filtering by network and category
   - Manages integration metadata

3. **Integration Components**
   - Individual protocol integration components
   - Based on patterns from the original frontend
   - Network-aware and wallet-integrated

## Current Integrations

### GinsenSwap (`src/integrations/ginsenswap/GinsenSwapIntegration.tsx`)

- **Type**: DEX (Decentralized Exchange)
- **Networks**: Testnet, Mainnet
- **Features**:
  - Token swapping (USDT/USDC)
  - Real-time quotes from backend API
  - Slippage and fee controls
  - Balance management
  - Based on Uniswap V3 architecture

### Meson Bridge (`src/integrations/meson/MesonIntegration.tsx`)

- **Type**: Bridge (Cross-chain)
- **Networks**: Mainnet only
- **Features**:
  - **Real Meson SDK Integration** using `@mesonfi/to/react`
  - Cross-chain asset transfers from 20+ chains to Conflux eSpace
  - Native Meson UI with embedded bridge interface
  - Real transaction processing and completion callbacks
  - EVM address integration with DevKit accounts
  - Live transaction tracking via Meson Explorer

## Adding New Integrations

### Step 1: Create Integration Component

Create a new component following this structure:

```typescript
// src/integrations/your-protocol/YourProtocolIntegration.tsx
import React from "react";
import { Card, Stack, Text, Button } from "@mantine/core";
import { useAccount } from "wagmi";
import type { IntegrationComponentProps } from "../types";

export const YourProtocolIntegration: React.FC<IntegrationComponentProps> = ({
  currentNetwork,
  isVisible,
  onNetworkSwitch,
}) => {
  const { isConnected } = useAccount();

  // Network filtering
  if (!isVisible || currentNetwork === "local") {
    return (
      <Alert color="yellow">
        Your Protocol is not available on this network.
      </Alert>
    );
  }

  // Component implementation
  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Text fw={600}>Your Protocol Integration</Text>
        {/* Your integration UI here */}
      </Stack>
    </Card>
  );
};
```

### Step 2: Register Integration

Add to `src/integrations/registry.ts`:

```typescript
import { YourProtocolIntegration } from "./your-protocol/YourProtocolIntegration";

// In registerIntegrations function:
const yourProtocolMetadata: IntegrationMetadata = {
  id: "your-protocol",
  name: "Your Protocol",
  description: "Description of your protocol",
  category: "dex", // or 'bridge', 'lending', 'yield', 'tools'
  networks: ["testnet", "mainnet"], // supported networks
  icon: React.createElement(IconYourProtocol, { size: 24 }),
  tvl: "$X.XM", // optional
  website: "https://yourprotocol.com", // optional
  isActive: true,
  requiresWallet: true, // optional
};

registry.register(
  createIntegration(yourProtocolMetadata, YourProtocolIntegration)
);
```

### Step 3: Export Component (Optional)

Add to `src/integrations/index.ts` if you want direct access:

```typescript
export { YourProtocolIntegration } from "./your-protocol/YourProtocolIntegration";
```

## Integration Features

### Network Awareness

- Integrations automatically filter based on supported networks
- `currentNetwork` prop provides the active network
- Components can show different behavior per network

### Wallet Integration

- All integrations receive `useAccount()` from wagmi
- Can check connection status and wallet addresses
- Automatic wallet requirement detection

### Backend API Integration

- GinsenSwap example shows how to integrate with `/api/swap/*` endpoints
- Uses `useAuthStore()` for session management
- Proper error handling and loading states

### UI Consistency

- Uses Mantine UI components for consistent design
- Follows existing patterns from Dashboard and other pages
- Responsive design with mobile support

## Protocol Categories

- **dex**: Decentralized exchanges and AMMs
- **bridge**: Cross-chain bridges and asset transfers
- **lending**: Lending and borrowing protocols
- **yield**: Yield farming and staking protocols
- **tools**: Developer tools and utilities

## Network Types

- **local**: Local development network
- **testnet**: Conflux eSpace Testnet
- **mainnet**: Conflux eSpace Mainnet

## Best Practices

1. **Error Handling**: Always include proper error states and user feedback
2. **Loading States**: Show loading indicators for async operations
3. **Network Validation**: Check network compatibility before rendering
4. **Wallet Integration**: Handle both connected and disconnected states
5. **Responsive Design**: Ensure mobile compatibility
6. **Performance**: Use React.memo() for expensive components if needed

## Backend Integration

For integrations requiring backend support, follow the GinsenSwap pattern:

1. Create API routes in `backend-service.js`
2. Use proper authentication with session tokens
3. Implement proper error handling and validation
4. Cache responses where appropriate
5. Follow RESTful API patterns

## Third-Party SDK Integration

The Meson Bridge integration demonstrates how to integrate real third-party SDKs:

### Meson SDK Integration

```typescript
import { MesonToButton } from "@mesonfi/to/react";

// Basic integration
<MesonToButton
  options={{
    to: "cfx", // Target Conflux eSpace
    recipient: evmAddress, // DevKit account EVM address
  }}
  onCompleted={handleCompleted} // Handle completion
>
  <CustomButtonContent />
</MesonToButton>;
```

### SDK Integration Best Practices

1. **Install SDK dependencies**: `npm install @mesonfi/to`
2. **Handle completion callbacks**: Process real transaction data
3. **Integrate with DevKit accounts**: Use EVM addresses as recipients
4. **Provide user feedback**: Show loading states and completion status
5. **Error handling**: Catch and display SDK errors gracefully
6. **Network validation**: Ensure SDK is only used on supported networks

## Future Enhancements

- Dynamic loading of integrations
- Plugin system for third-party integrations
- Integration marketplace
- A/B testing for integration UIs
- Analytics and usage tracking
