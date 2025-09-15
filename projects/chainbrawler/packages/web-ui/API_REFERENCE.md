# ChainBrawler Web UI API Reference

## Component API

### App Component

Main application component that orchestrates the entire application.

```typescript
function App(): JSX.Element
```

**Features:**
- Error boundary management
- Global state initialization
- Route configuration
- Provider setup

### GamePage Component

Main game interface with tabbed navigation and feature management.

```typescript
function GamePage(): JSX.Element
```

**State:**
- Character data and management
- Combat system interface
- Treasury pools display
- Leaderboard system
- Claims management
- Transaction history

**Features:**
- Tab-based navigation
- Modal management
- Event handling
- Action coordination

## Feature Components

### Character Management

#### CharacterCreationForm

Character creation interface with class selection.

```typescript
interface CharacterCreationFormProps {
  onCreateCharacter: (classId: number) => Promise<void>;
  isLoading: boolean;
  canCreate: boolean;
}

function CharacterCreationForm(props: CharacterCreationFormProps): JSX.Element
```

**Features:**
- 4 character classes (Warrior, Mage, Rogue, Paladin)
- Class descriptions and stats
- Visual class selection
- Creation fee display

#### CharacterDetailCard

Character information display and management.

```typescript
interface CharacterDetailCardProps {
  character: CharacterData | null;
  menu: MenuState | null;
  onHealCharacter: () => Promise<void>;
  onResurrectCharacter: () => Promise<void>;
  onFightEnemy: () => void;
  onContinueFight: () => Promise<void>;
  onFleeRound: () => Promise<void>;
  isLoading: boolean;
  isWriteOperationInProgress: boolean;
}

function CharacterDetailCard(props: CharacterDetailCardProps): JSX.Element
```

**Features:**
- Character stats display
- Health and endurance bars
- Action buttons
- Status indicators

### Combat System

#### EnemySelectionModal

Enemy selection interface for combat initiation.

```typescript
interface EnemySelectionModalProps {
  opened: boolean;
  onClose: () => void;
  onFightEnemy: (enemyId: number, enemyLevel: number) => Promise<void>;
}

function EnemySelectionModal(props: EnemySelectionModalProps): JSX.Element
```

**Features:**
- Enemy list display
- Level selection slider
- Enemy stats preview
- Difficulty indicators

#### FightSummaryModal

Fight results display with detailed information.

```typescript
interface FightSummaryModalProps {
  opened: boolean;
  onClose: () => void;
  fightSummary: FightSummaryData | null;
  onContinueFight: () => Promise<void>;
  onFleeRound: () => Promise<void>;
}

function FightSummaryModal(props: FightSummaryModalProps): JSX.Element
```

**Features:**
- Fight results display
- Round-by-round breakdown
- Equipment drops
- Action buttons

#### MonsterArena

Combat interface with enemy selection and combat management.

```typescript
interface MonsterArenaProps {
  character: CharacterData | null;
  operation: OperationState | null;
  onFightEnemy: (enemyId: number, enemyLevel: number) => Promise<void>;
  onContinueFight: () => Promise<void>;
  onFleeRound: () => Promise<void>;
  isLoading: boolean;
  isWriteOperationInProgress: boolean;
}

function MonsterArena(props: MonsterArenaProps): JSX.Element
```

**Features:**
- Enemy grid display
- Level selection
- Combat state management
- Action buttons

### Treasury System

#### PoolsDisplay

Treasury pools information and management.

```typescript
interface PoolsDisplayProps {
  pools: PoolsData | null;
  isLoading: boolean;
  error: string | null;
  onLoadPools: () => Promise<void>;
  onRefreshPools: () => Promise<void>;
}

function PoolsDisplay(props: PoolsDisplayProps): JSX.Element
```

**Features:**
- Pool information display
- Real-time updates
- Pool statistics
- Refresh functionality

### Leaderboard System

#### LeaderboardDisplay

Player rankings and leaderboard management.

```typescript
interface LeaderboardDisplayProps {
  leaderboard: LeaderboardData | null;
  isLoading: boolean;
  error: string | null;
  onLoadLeaderboard: () => Promise<void>;
  onRefreshLeaderboard: () => Promise<void>;
}

function LeaderboardDisplay(props: LeaderboardDisplayProps): JSX.Element
```

**Features:**
- Player rankings
- Score display
- Epoch information
- Player statistics

### Claims System

#### ClaimsDisplay

Prize claims management and display.

```typescript
interface ClaimsDisplayProps {
  claims: ClaimsData | null;
  isLoading: boolean;
  error: string | null;
  onLoadClaims: () => Promise<void>;
  onRefreshClaims: () => Promise<void>;
  onClaimPrize: (epoch: bigint, index: bigint, amount: bigint, proof: string[]) => Promise<void>;
}

function ClaimsDisplay(props: ClaimsDisplayProps): JSX.Element
```

**Features:**
- Claimable prizes display
- Claim history
- Proof verification
- Claim actions

### Transaction Management

#### TransactionModal

Transaction status and progress display.

```typescript
interface TransactionModalProps {
  opened: boolean;
  onClose: () => void;
  operationType: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  message?: string;
  error?: string;
  transactionHash?: string;
  canClose: boolean;
}

function TransactionModal(props: TransactionModalProps): JSX.Element
```

**Features:**
- Transaction progress display
- Status indicators
- Error handling
- Hash display

#### TransactionHistoryDisplay

Transaction history and activity tracking.

```typescript
function TransactionHistoryDisplay(): JSX.Element
```

**Features:**
- Transaction list
- Activity tracking
- Event logging
- User analytics

## UI Components

### Game Components

#### GameCard

Reusable card component for game content.

```typescript
interface GameCardProps {
  variant?: "elevated" | "glass" | "default";
  children: React.ReactNode;
  className?: string;
}

function GameCard(props: GameCardProps): JSX.Element
```

**Variants:**
- `elevated`: Raised card with shadow
- `glass`: Glass morphism effect
- `default`: Standard card styling

#### GameButton

Game-specific button component.

```typescript
interface GameButtonProps {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

function GameButton(props: GameButtonProps): JSX.Element
```

#### GameModal

Modal component for game dialogs.

```typescript
interface GameModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

function GameModal(props: GameModalProps): JSX.Element
```

#### StatDisplay

Character stat display component.

```typescript
interface StatDisplayProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  icon?: React.ReactNode;
  format?: "number" | "percentage" | "currency";
}

function StatDisplay(props: StatDisplayProps): JSX.Element
```

#### LoadingState

Loading state component.

```typescript
interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
}

function LoadingState(props: LoadingStateProps): JSX.Element
```

### Navigation Components

#### MobileNavigation

Mobile navigation bar component.

```typescript
interface MobileNavigationProps {
  activeTab: string | null;
  onTabChange: (tab: string) => void;
  hasNotifications: {
    claims: boolean;
    pools: boolean;
    leaderboard: boolean;
  };
}

function MobileNavigation(props: MobileNavigationProps): JSX.Element
```

**Features:**
- Bottom navigation bar
- Tab indicators
- Notification badges
- Touch-friendly interface

### Wallet Components

#### WalletConnection

Wallet connection interface.

```typescript
function WalletConnection(): JSX.Element
```

**Features:**
- Wallet selection
- Connection status
- Chain switching
- Error handling

#### WalletActionBar

Wallet actions and status display.

```typescript
function WalletActionBar(): JSX.Element
```

**Features:**
- Wallet status
- Account information
- Chain information
- Action buttons

## Custom Hooks

### useAppState

Application state management hook.

```typescript
function useAppState(): {
  isLoading: boolean;
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (seen: boolean) => void;
}
```

### useGasConfig

Gas configuration hook.

```typescript
function useGasConfig(): {
  gasPrice: bigint;
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}
```

### useWalletEvents

Wallet event handling hook.

```typescript
function useWalletEvents(): {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onChainChange: (chainId: number) => void;
}
```

### useWriteContractWithGas

Contract writing with gas optimization hook.

```typescript
function useWriteContractWithGas(): {
  writeContract: (config: WriteContractConfig) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}
```

## Configuration

### Wagmi Configuration

```typescript
export const config = createConfig({
  chains: [confluxESpaceLocal, confluxESpaceTestnet, confluxESpace, mainnet, polygon, arbitrum],
  transports: {
    [confluxESpaceLocal.id]: http("http://127.0.0.1:8545"),
    [confluxESpaceTestnet.id]: fallback([/* Multiple RPC providers */]),
    // ... other chains
  },
  connectors: [metaMask({ /* MetaMask configuration */ })],
});
```

### Theme Configuration

```typescript
export const theme = createTheme({
  primaryColor: "chainbrawler-primary",
  fontFamily: 'Inter, system-ui, sans-serif',
  colors: {
    "chainbrawler-primary": primaryColor,
    "game-combat": combatColor,
    "game-defense": defenseColor,
    "game-luck": luckColor,
  },
  components: {
    Card: { /* Custom styling */ },
    Button: { /* Custom styling */ },
    Modal: { /* Custom styling */ },
  },
});
```

### Chain Configuration

```typescript
export const confluxESpaceLocal = {
  id: 2030,
  name: "ChainBrawler Local",
  network: "chainbrawler-local",
  nativeCurrency: { name: "Conflux", symbol: "CFX", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: { name: "Local Explorer", url: "http://localhost:3000" },
  },
};
```

## Utility Functions

### Chain Utilities

```typescript
// Get chain information
export function getChainInfo(chainId: number): ChainInfo | null;

// Check if chain is supported
export function isSupportedChain(chainId: number): boolean;

// Get contract address for chain
export function getContractAddress(chainId: number): string | null;
```

### Rate Limiting

```typescript
// Rate limited function calls
export async function rateLimitedRead<T>(
  key: string,
  fn: () => Promise<T>,
  cacheTime: number
): Promise<T>;
```

### Write Contract Utilities

```typescript
// Write contract with gas optimization
export async function writeCallWithGas(
  config: WriteContractConfig
): Promise<WriteContractResult>;
```

## Event System

### Custom Events

```typescript
// Transaction status events
window.addEventListener("transactionStatus", (event: CustomEvent) => {
  const { type, status, progress, message, error, transactionHash } = event.detail;
});

// Fight summary events
window.addEventListener("fightSummary", (event: CustomEvent) => {
  const fightSummary = event.detail;
});

// Character data refresh events
window.addEventListener("characterDataRefresh", (event: CustomEvent) => {
  const { shouldRefresh } = event.detail;
});
```

### Event Emission

```typescript
// Emit transaction status
window.dispatchEvent(new CustomEvent("transactionStatus", {
  detail: {
    type: "createCharacter",
    status: "processing",
    progress: 50,
    message: "Creating character...",
  }
}));

// Emit fight summary
window.dispatchEvent(new CustomEvent("fightSummary", {
  detail: fightSummaryData
}));
```

## Styling System

### Design Tokens

```typescript
export const designTokens = {
  colors: {
    primary: { /* Primary color palette */ },
    game: {
      combat: "#ef4444",
      defense: "#3b82f6",
      luck: "#10b981",
      experience: "#f59e0b",
    },
    surface: {
      primary: "#0f172a",
      elevated: "rgba(30, 41, 59, 0.8)",
      overlay: "rgba(15, 23, 42, 0.95)",
    },
  },
  typography: {
    sizes: { xs: "12px", sm: "14px", md: "16px", lg: "18px", xl: "20px" },
    weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  },
  spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px" },
  borderRadius: { sm: "4px", md: "8px", lg: "12px", xl: "16px" },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    game: "0 20px 40px rgba(0, 0, 0, 0.6)",
  },
  animation: {
    durations: { fast: "150ms", normal: "300ms", slow: "500ms" },
    easings: { easeOut: "cubic-bezier(0.4, 0, 0.2, 1)" },
  },
};
```

### CSS Classes

```css
/* Global styles */
.global-container {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  min-height: 100vh;
}

/* Game-specific styles */
.game-card {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
}

/* ConnectKit theme */
:root {
  --ck-font-family: Inter, system-ui, sans-serif;
  --ck-border-radius: 12px;
  --ck-primary-button-background: #3b82f6;
  --ck-body-color: #1e293b;
  --ck-body-background: #0f172a;
}
```

## Development Tools

### Vite Configuration

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Testing

### Playwright Configuration

```typescript
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
```

### Test Examples

```typescript
// Component testing
test("CharacterCreationForm renders correctly", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-testid=character-creation-form]")).toBeVisible();
});

// Integration testing
test("Complete character creation flow", async ({ page }) => {
  await page.goto("/");
  await page.click("[data-testid=warrior-class]");
  await page.click("[data-testid=create-character-button]");
  await expect(page.locator("[data-testid=character-detail-card]")).toBeVisible();
});
```
