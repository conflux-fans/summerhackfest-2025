# Architecture Documentation

## System Overview

Conflux Box is designed as a modern, layered frontend application that showcases the proper use of preview versions of the upcoming Conflux DevKit packages. The architecture emphasizes developer experience, real-time data synchronization, and maintainable code structure.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  Dashboard  │ │  Accounts   │ │ Smart Contracts │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                  Application Layer                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │   Stores    │ │    Hooks    │ │   Components    │   │
│  │ (Zustand)   │ │  (DevKit)   │ │   (Mantine)     │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                   Service Layer                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  API Client │ │ WebSocket   │ │  DevKit Backend │   │
│  │  (Axios)    │ │ Connection  │ │   (@conflux)    │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                 Blockchain Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │ Core Space  │ │   eSpace    │ │ Cross-Chain     │   │
│  │ (CFX Chain) │ │(EVM Compat) │ │    Bridge       │   │
│  └─────────────┘ └─────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Mantine UI v7.12.0 for consistent, accessible components
- **State Management**:
  - Zustand for client-side state
  - TanStack Query (React Query) for server state
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios for API communications
- **WebSocket**: Native WebSocket API with custom hooks
- **Testing**: Vitest with React Testing Library

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ConnectButton.tsx        # Wallet connection
│   ├── ContractInteraction.tsx  # Smart contract UI
│   ├── DeploymentWizard.tsx     # Contract deployment
│   ├── DevConnectButton.tsx     # DevKit connection
│   ├── DevKitAccountManager.tsx # Account management
│   ├── Header.tsx               # App header/navigation
│   ├── NetworkDropdown.tsx      # Network selector
│   └── NodeControlPanel.tsx     # Node control interface
├── pages/                # Top-level page components
│   ├── Accounts.tsx      # Account management page
│   ├── Contracts.tsx     # Smart contracts page
│   ├── Dashboard.tsx     # Main dashboard
│   ├── Network.tsx       # Network configuration
│   ├── Protocols.tsx     # DeFi protocol integrations
│   └── Settings.tsx      # Application settings
├── integrations/         # DeFi protocol integrations
│   ├── ginsenswap/      # GinsenSwap DEX integration
│   ├── meson/           # Meson Bridge integration
│   ├── registry.ts      # Integration registry
│   └── types.ts         # Integration type definitions
├── hooks/                # Custom React hooks
│   └── useDevKit.ts      # DevKit integration hook
├── stores/               # State management
│   └── authStore.ts      # Authentication state
├── services/             # External service integrations
│   ├── api.ts           # HTTP API client
│   └── websocket.ts     # WebSocket service
├── providers/            # React context providers
│   └── WagmiProvider.tsx # Wallet connection provider
├── utils/                # Utility functions
│   ├── errorHandling.ts  # Error handling utilities
│   └── rpc.ts           # RPC client utilities
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared type definitions
├── config/               # Configuration files
│   └── wagmi.ts          # Wallet configuration
├── data/                 # Static data
│   └── contractTemplates.ts # Contract templates
└── test/                 # Test setup and utilities
    └── setup.ts          # Vitest test configuration
```

## Backend Integration

### DevKit Package Usage

Conflux Box leverages preview versions of the upcoming Conflux DevKit packages:

#### @conflux-devkit/backend (v0.1.0)

- **Purpose**: Provides backend API services and WebSocket functionality
- **Usage**: Runs as a separate Node.js service (`backend-service.js`)
- **Features**:
  - REST API endpoints for blockchain operations
  - WebSocket server for real-time updates
  - Account management services
  - Network status monitoring
  - Contract deployment assistance

#### @conflux-devkit/node (v0.1.0)

- **Purpose**: Core blockchain interaction and network management
- **Integration**: Used by backend service and frontend hooks
- **Features**:
  - Core Space and eSpace network support
  - Transaction handling and monitoring
  - Account creation and management
  - Smart contract deployment and interaction

### Service Communication

```
Frontend Application
       │
       ├── HTTP API Calls ────────┐
       │                         │
       └── WebSocket Connection ──┼─── Backend Service
                                  │   (@conflux-devkit/backend)
                                  │
                              Uses │
                                  │
                            DevKit Node Package
                          (@conflux-devkit/node)
                                  │
                            Connects │
                                  │
                           Conflux Blockchain
                         (Core Space + eSpace)
```

## State Management Architecture

### Client State (Zustand)

```typescript
// Authentication Store
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  clearSession: () => void;
}
```

### Server State (React Query)

```typescript
// Network status queries
const { data: devkitStatus } = useQuery({
  queryKey: ["devkit-status"],
  queryFn: fetchDevKitStatus,
  refetchInterval: 5000,
});

// Account data queries
const { data: accounts } = useQuery({
  queryKey: ["accounts"],
  queryFn: fetchAccounts,
});
```

## Component Architecture

### Design Patterns

1. **Composition over Inheritance**: Components are composed of smaller, reusable parts
2. **Props-based Configuration**: Components accept props for customization
3. **Custom Hooks**: Business logic extracted into reusable hooks
4. **Error Boundaries**: Graceful error handling throughout the component tree

### Example Component Structure

```typescript
// Page Component (Dashboard.tsx)
export function Dashboard() {
  const { status, accounts } = useDevKit();
  const [currentNetwork, setCurrentNetwork] = useState("testnet");

  return (
    <Container>
      <Header />
      <NetworkDropdown value={currentNetwork} onChange={setCurrentNetwork} />
      <StatsGrid data={stats} />
      <NetworkInformation status={status} />
    </Container>
  );
}
```

## Data Flow Architecture

### Real-time Data Flow

1. **WebSocket Connection**: Established on app initialization
2. **Event Subscription**: Components subscribe to relevant blockchain events
3. **State Updates**: Incoming data updates React Query cache
4. **UI Reactivity**: Components re-render with new data automatically

```
Blockchain Event
       │
   WebSocket ─────► Backend Service
       │                   │
   Broadcast ◄─────────────┘
       │
   Frontend Hook ─────► React Query Cache
       │                       │
   Component ◄────────────────┘
       │
   UI Update
```

### User Action Flow

1. **User Interaction**: User clicks button or submits form
2. **Action Dispatch**: Event handler calls appropriate service
3. **API Request**: HTTP request sent to backend service
4. **Blockchain Transaction**: Backend interacts with Conflux network
5. **Response Handling**: Success/error feedback to user
6. **State Synchronization**: Cache invalidation triggers re-fetch

## Network Architecture

### Supported Networks

```typescript
interface NetworkConfig {
  name: string;
  chainId: {
    core: number;
    evm: number;
  };
  rpcUrls: {
    core: string;
    evm: string;
  };
}

const networks: Record<string, NetworkConfig> = {
  testnet: {
    name: "Conflux Testnet",
    chainId: { core: 1, evm: 71 },
    rpcUrls: {
      core: "https://test.confluxrpc.com",
      evm: "https://evmtestnet.confluxrpc.com",
    },
  },
  mainnet: {
    name: "Conflux Mainnet",
    chainId: { core: 1029, evm: 1030 },
    rpcUrls: {
      core: "https://main.confluxrpc.com",
      evm: "https://evm.confluxrpc.com",
    },
  },
  local: {
    name: "Local Development",
    chainId: { core: 2029, evm: 2030 }, // DevKit defaults
    rpcUrls: {
      core: "http://localhost:12537",
      evm: "http://localhost:8545",
    },
  },
};
```

### Dynamic Chain ID Handling

Recent enhancement to properly display chain IDs based on selected network:

```typescript
function getChainIds(network: string, status: any) {
  switch (network) {
    case "testnet":
      return { core: "1", evm: "71" };
    case "mainnet":
      return { core: "1029", evm: "1030" };
    case "local":
    default:
      return {
        core: status?.config?.chainId || "2029",
        evm: status?.config?.evmChainId || "2030",
      };
  }
}
```

## Security Architecture

### Best Practices Implemented

1. **No Private Key Storage**: Keys managed by DevKit backend service
2. **Environment Variables**: Sensitive configuration in environment files
3. **Input Validation**: All user inputs validated before processing
4. **Error Boundaries**: Graceful handling of unexpected errors
5. **Type Safety**: TypeScript prevents many runtime errors

### DevKit Security Features

- Secure account generation and management
- Safe transaction signing workflows
- Network validation and verification
- Secure RPC communication

## Testing Architecture

### Test Structure

```
src/test/
├── setup.ts              # Test environment configuration
├── components/           # Component tests
├── hooks/               # Hook tests
├── stores/              # State management tests
├── utils/               # Utility function tests
└── integrations/        # Integration tests
```

### Testing Strategy

1. **Unit Tests**: Individual components and functions
2. **Integration Tests**: Component interactions and data flow
3. **Hook Tests**: Custom hook behavior and state management
4. **API Tests**: Service layer and external integrations

### Current Test Coverage

- ✅ 14 tests passing across all categories
- ✅ Component rendering and interaction tests
- ✅ State management and store tests
- ✅ Utility function and RPC client tests
- ✅ Mock implementations for external services

## Performance Architecture

### Optimization Strategies

1. **Code Splitting**: Dynamic imports for large components
2. **Lazy Loading**: Route-based component loading
3. **Memoization**: React.memo for expensive components
4. **Query Optimization**: React Query caching and background updates
5. **Bundle Optimization**: Vite tree-shaking and minification

### Real-time Performance

- WebSocket connection pooling
- Efficient event subscription/unsubscription
- Debounced user inputs
- Optimized re-render cycles

## Deployment Architecture

### Development Environment

```
Local Development Setup:
├── Frontend Dev Server (Vite) ── Port 3000
├── Backend Service (DevKit) ──── Port 3001
├── Conflux Local Node ─────────── Port 12537 (Core)
└── eSpace Local Node ──────────── Port 8545 (eVM)
```

### Production Considerations

1. **Static Hosting**: Frontend can be deployed to CDN (Vercel, Netlify)
2. **Backend Service**: Requires Node.js hosting for DevKit backend
3. **Environment Configuration**: Production network endpoints
4. **Build Optimization**: Production builds with optimized bundles

## Integration Points

### External Services

1. **Conflux DevKit**: Core integration for all blockchain operations
2. **Mantine UI**: Component library providing design system
3. **React Query**: Server state management and caching
4. **WebSocket**: Real-time communication with blockchain

### Future Integration Opportunities

1. **Wallet Providers**: MetaMask, Fluent Wallet integration
2. **Additional Networks**: Support for other Conflux-compatible chains
3. **Analytics**: Usage tracking and performance monitoring
4. **Community Features**: Plugin system for extensions
5. **AI-driven Automation & Workflows (Planned)**:

- Conflux Box will include modular AI integration layers that leverage the backend and delegation structure to implement advanced automation flows. These modules will support tasks such as:

  - Automated contract template generation and customization based on project context
  - Smart test scenario generation and automated deployment pipelines (deploy → test → monitor)
  - Contextual code suggestions and contract audits powered by configurable AI models
  - Natural-language interfaces for querying chain state, summarizing transactions, and explaining errors

  AI modules will be implemented as optional backend services or connectors, with clear delegation rules and audit logs to ensure actions requiring privilege are executed safely. This architecture enables flexible experimentation with AI while keeping the core developer experience predictable and auditable.

6. **Protocol Showcase: All Active Conflux Protocols (Planned)**

- The project will expand its integrations and demo pages to include a curated showcase of active Conflux ecosystem protocols and services. The showcase aims to demonstrate interoperability and best practices by integrating and highlighting protocols such as DEXes, bridges, lending platforms, and tooling providers available on Conflux. Example activities:

  - Direct integrations with major DEXes and bridges for swap and bridge demos
  - Showcase modules for lending/borrowing flows and liquidity provision
  - Integration registry and metadata pages describing each protocol, required permissions, and example flows
  - Live demos and screenshots for each showcased protocol to help developers understand integration patterns

  The protocol showcase will be continuously updated to reflect the active Conflux ecosystem and will serve as both a demo surface for judges and a learning hub for developers.

---

This architecture provides a solid foundation for modern Conflux application development while showcasing best practices for using the preview DevKit packages.
