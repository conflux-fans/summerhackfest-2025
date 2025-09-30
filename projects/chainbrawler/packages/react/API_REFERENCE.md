# ChainBrawler React API Reference

## Quick Start

```typescript
import { ChainBrawlerProvider, useChainBrawlerContext } from '@chainbrawler/react';

function App() {
  return (
    <ChainBrawlerProvider config={config}>
      <GameComponent />
    </ChainBrawlerProvider>
  );
}

function GameComponent() {
  const { character, actions, isLoading } = useChainBrawlerContext();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {character ? (
        <div>Character: {character.className}</div>
      ) : (
        <button onClick={() => actions.createCharacter(1)}>
          Create Character
        </button>
      )}
    </div>
  );
}
```

## Hooks

### useChainBrawler

Main hook for ChainBrawler functionality in React applications.

```typescript
function useChainBrawler(config: ChainBrawlerConfig): {
  // State
  playerAddress: string | null;
  character: CharacterData | null;
  menu: MenuState | null;
  operation: OperationState | null;
  pools: PoolsData | null;
  leaderboard: LeaderboardData | null;
  claims: ClaimsData | null;
  statusMessage: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  actions: {
    createCharacter: (classId: number) => Promise<OperationResult<CharacterData>>;
    getCharacter: (playerAddress: string) => Promise<CharacterData | null>;
    healCharacter: () => Promise<OperationResult<any>>;
    resurrectCharacter: () => Promise<OperationResult<any>>;
    fightEnemy: (enemyId: number, enemyLevel: number) => Promise<OperationResult<any>>;
    continueFight: () => Promise<OperationResult<any>>;
    fleeRound: () => Promise<OperationResult<any>>;
    loadPools: () => Promise<OperationResult<any>>;
    refreshPools: () => Promise<OperationResult<any>>;
    loadLeaderboard: (playerAddress: string) => Promise<OperationResult<any>>;
    refreshLeaderboard: (playerAddress: string) => Promise<OperationResult<any>>;
    loadClaims: (playerAddress: string) => Promise<OperationResult<any>>;
    refreshClaims: (playerAddress: string) => Promise<OperationResult<any>>;
    claimPrize: (epoch: bigint, index: bigint, amount: bigint, proof: string[]) => Promise<OperationResult<any>>;
    clearError: () => void;
    refreshAll: (playerAddress?: string) => Promise<OperationResult<any>>;
  };
  
  // SDK
  sdk: ChainBrawlerSDK | undefined;
}
```

### useWebChainBrawler

Web-specific hook with Wagmi integration.

```typescript
function useWebChainBrawler(config?: ChainBrawlerConfig): {
  // Same return type as useChainBrawler
  // Automatically handles Wagmi integration
}
```

### useUXState

Hook for UX state management.

```typescript
function useUXState(store: UXStore): UXState
```

### useClaims

Claims-specific functionality hook.

```typescript
function useClaims(): {
  claims: ClaimsData | null;
  isLoading: boolean;
  error: string | null;
  loadClaims: ((playerAddress: string) => Promise<any>) | undefined;
  refreshClaims: ((playerAddress: string) => Promise<any>) | undefined;
  claimPrize: ((epoch: bigint, index: bigint, amount: bigint, proof: string[]) => Promise<any>) | undefined;
}
```

### useLeaderboard

Leaderboard-specific functionality hook.

```typescript
function useLeaderboard(): {
  leaderboard: LeaderboardData | null;
  isLoading: boolean;
  error: string | null;
  loadLeaderboard: ((playerAddress: string) => Promise<any>) | undefined;
  refreshLeaderboard: ((playerAddress: string) => Promise<any>) | undefined;
}
```

### usePools

Pools-specific functionality hook.

```typescript
function usePools(): {
  pools: PoolsData | null;
  isLoading: boolean;
  error: string | null;
  loadPools: (() => Promise<any>) | undefined;
  refreshPools: (() => Promise<any>) | undefined;
}
```

### useWalletManager

Wallet connection management hook.

```typescript
function useWalletManager(): {
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
}
```

## Context Providers

### ChainBrawlerProvider

Main context provider for React applications.

```typescript
interface ChainBrawlerProviderProps {
  config: ChainBrawlerConfig;
  children: ReactNode;
}

function ChainBrawlerProvider({ config, children }: ChainBrawlerProviderProps): JSX.Element
```

### useChainBrawlerContext

Hook to access ChainBrawler context.

```typescript
function useChainBrawlerContext(): {
  character: CharacterData | null;
  menu: MenuState | null;
  operation: OperationState | null;
  pools: PoolsData | null;
  leaderboard: LeaderboardData | null;
  claims: ClaimsData | null;
  statusMessage: string;
  isLoading: boolean;
  error: string | null;
  actions: any;
  config: ChainBrawlerConfig;
}
```

### WebChainBrawlerProvider

Web-specific context provider with Wagmi integration.

```typescript
interface WebChainBrawlerProviderProps {
  config?: ChainBrawlerConfig;
  children: ReactNode;
}

function WebChainBrawlerProvider({ config, children }: WebChainBrawlerProviderProps): JSX.Element
```

### useWebChainBrawlerContext

Hook to access Web ChainBrawler context.

```typescript
function useWebChainBrawlerContext(): {
  character: CharacterData | null;
  menu: MenuState | null;
  operation: OperationState | null;
  pools: PoolsData | null;
  leaderboard: LeaderboardData | null;
  claims: ClaimsData | null;
  statusMessage: string;
  isLoading: boolean;
  error: string | null;
  actions: any;
  config?: ChainBrawlerConfig;
}
```

### RouterProvider

React Router integration provider.

```typescript
interface RouterProviderProps {
  children: ReactNode;
}

function RouterProvider({ children }: RouterProviderProps): JSX.Element
```

## Adapters

### ReactAdapter

Generic React adapter for any environment.

```typescript
class ReactAdapter {
  constructor(config: ChainBrawlerConfig);
  
  getSDK(): ChainBrawlerSDK;
  getState(): UXState;
  subscribe(callback: (state: UXState) => void): () => void;
  updateWalletClient(walletClient: WalletClient | undefined): void;
  updatePlayerAddress(address: `0x${string}` | undefined): void;
  cleanup(): void;
  
  // Convenience methods
  createCharacter(classId: number): Promise<any>;
  getCharacter(playerAddress: string): Promise<any>;
  healCharacter(): Promise<any>;
  resurrectCharacter(): Promise<any>;
  loadPools(): Promise<any>;
  loadLeaderboard(playerAddress: string): Promise<any>;
  loadClaims(playerAddress: string): Promise<any>;
  claimPrize(epoch: bigint, index: bigint, amount: bigint, proof: string[]): Promise<any>;
  clearError(): void;
  refreshAll(): Promise<any>;
}
```

### WebAdapter

Web-specific adapter with Wagmi integration.

```typescript
class WebAdapter {
  constructor(config: ChainBrawlerConfig);
  
  getSDK(): ChainBrawlerSDK;
  getState(): UXState;
  subscribe(callback: (state: UXState) => void): () => void;
  updateWalletClient(walletClient: WalletClient | undefined): Promise<void>;
  updatePlayerAddress(address: `0x${string}` | undefined): void;
  refreshCharacterData(playerAddress: string): Promise<void>;
  cleanup(): void;
  
  // Convenience methods (same as ReactAdapter)
}
```

## UI Components

### Basic Components

#### CharacterDisplay

Basic character display component.

```typescript
function CharacterDisplay(): JSX.Element
```

#### ClaimsDisplay

Basic claims display component.

```typescript
function ClaimsDisplay(): JSX.Element
```

#### ErrorDisplay

Basic error display component.

```typescript
function ErrorDisplay(): JSX.Element
```

#### LeaderboardDisplay

Basic leaderboard display component.

```typescript
function LeaderboardDisplay(): JSX.Element
```

#### PoolsDisplay

Basic pools display component.

```typescript
function PoolsDisplay(): JSX.Element
```

#### StatusDisplay

Basic status display component.

```typescript
function StatusDisplay(): JSX.Element
```

### Enhanced Components

#### EnhancedCharacterDisplay

Enhanced character display with rich UI.

```typescript
interface CharacterDisplayProps {
  character: CharacterData | null;
  menu: MenuState | null;
  operation: OperationState | null;
  onCreateCharacter: (classId: number) => Promise<void>;
  onHealCharacter: () => Promise<void>;
  onResurrectCharacter: () => Promise<void>;
  onFightEnemy: (enemyId: number, enemyLevel: number) => Promise<void>;
  onContinueFight: () => Promise<void>;
  onFleeRound: () => Promise<void>;
}

function EnhancedCharacterDisplay(props: CharacterDisplayProps): JSX.Element
```

#### EnhancedClaimsDisplay

Enhanced claims display with rich UI.

```typescript
interface ClaimsDisplayProps {
  claims: ClaimsData | null;
  isLoading: boolean;
  error: string | null;
  onLoadClaims: (playerAddress: string) => Promise<void>;
  onRefreshClaims: (playerAddress: string) => Promise<void>;
  onClaimPrize: (epoch: bigint, index: bigint, amount: bigint, proof: string[]) => Promise<void>;
}

function EnhancedClaimsDisplay(props: ClaimsDisplayProps): JSX.Element
```

#### EnhancedLeaderboardDisplay

Enhanced leaderboard display with rich UI.

```typescript
interface LeaderboardDisplayProps {
  leaderboard: LeaderboardData | null;
  isLoading: boolean;
  error: string | null;
  onLoadLeaderboard: (playerAddress: string) => Promise<void>;
  onRefreshLeaderboard: (playerAddress: string) => Promise<void>;
}

function EnhancedLeaderboardDisplay(props: LeaderboardDisplayProps): JSX.Element
```

#### EnhancedPoolsDisplay

Enhanced pools display with rich UI.

```typescript
interface PoolsDisplayProps {
  pools: PoolsData | null;
  isLoading: boolean;
  error: string | null;
  onLoadPools: () => Promise<void>;
  onRefreshPools: () => Promise<void>;
}

function EnhancedPoolsDisplay(props: PoolsDisplayProps): JSX.Element
```

#### EnhancedErrorDisplay

Enhanced error display with rich UI.

```typescript
interface ErrorDisplayProps {
  error: string | null;
  onClearError: () => void;
}

function EnhancedErrorDisplay(props: ErrorDisplayProps): JSX.Element
```

#### EnhancedStatusDisplay

Enhanced status display with rich UI.

```typescript
interface StatusDisplayProps {
  statusMessage: string;
  isLoading: boolean;
  operation: OperationState | null;
}

function EnhancedStatusDisplay(props: StatusDisplayProps): JSX.Element
```

### Primitive Components

#### EnemySelection

Enemy selection component.

```typescript
interface EnemySelectionProps {
  onSelect: (enemyId: number, enemyLevel: number) => void;
  disabled?: boolean;
  availableEnemies?: Array<{ id: number; level: number; name: string }>;
}

function EnemySelection(props: EnemySelectionProps): JSX.Element
```

#### FightSummary

Fight summary display component.

```typescript
interface FightSummaryProps {
  fight: FightSummaryData | null;
  onClose?: () => void;
}

function FightSummary(props: FightSummaryProps): JSX.Element
```

#### OperationStatus

Operation status indicator component.

```typescript
interface OperationStatusProps {
  operation: OperationState | null;
  isVisible: boolean;
  onDismiss: () => void;
}

function OperationStatus(props: OperationStatusProps): JSX.Element
```

## Type Definitions

### ChainBrawlerConfig

Configuration for ChainBrawler.

```typescript
interface ChainBrawlerConfig {
  address: `0x${string}`;
  chain: { id: number; name: string };
  publicClient: PublicClient;
  walletClient?: WalletClient;
  wagmiConfig?: any;
  contractClient?: any;
}
```

### CharacterData

Character data structure.

```typescript
interface CharacterData {
  exists: boolean;
  isAlive: boolean;
  class: number;
  className: string;
  level: number;
  experience: number;
  endurance: {
    current: number;
    max: number;
    percentage: number;
  };
  stats: {
    combat: number;
    defense: number;
    luck: number;
  };
  equipment: EquipmentData[];
  inCombat: boolean;
  combatState?: CombatState;
  totalKills: number;
}
```

### MenuState

Menu state structure.

```typescript
interface MenuState {
  canCreateCharacter: boolean;
  canAct: boolean;
  canFight: boolean;
  canHeal: boolean;
  canResurrect: boolean;
  canContinueFight: boolean;
  canFlee: boolean;
  canViewPools: boolean;
  canViewLeaderboard: boolean;
  canViewClaims: boolean;
  canClaimPrize: boolean;
  availableActions: string[];
  disabledActions: string[];
  disabledReasons: Record<string, string>;
  healingCooldownRemaining: number;
}
```

### OperationState

Operation state structure.

```typescript
interface OperationState {
  isActive: boolean;
  operationType: string;
  status: "pending" | "processing" | "completed" | "error";
  hash?: string;
  startTime: number;
  progress?: string;
  error?: string;
  isWriteOperation?: boolean;
}
```

### PoolsData

Pools data structure.

```typescript
interface PoolsData {
  prizePool: PoolInfo;
  equipmentPool: PoolInfo;
  gasRefundPool: PoolInfo;
  developerPool: PoolInfo;
  nextEpochPool: PoolInfo;
  emergencyPool: PoolInfo;
  totalValue: bigint;
  lastUpdated: number;
}
```

### LeaderboardData

Leaderboard data structure.

```typescript
interface LeaderboardData {
  currentEpoch: bigint;
  playerScore: bigint;
  playerRank: bigint;
  totalPlayers: bigint;
  topPlayers: LeaderboardPlayer[];
  epochTimeRemaining: bigint;
  lastUpdated: number;
}
```

### ClaimsData

Claims data structure.

```typescript
interface ClaimsData {
  available: ClaimableReward[];
  totalClaimable: bigint;
  lastChecked: number;
}
```

### UXState

Complete UX state structure.

```typescript
interface UXState {
  playerAddress: string | null;
  character: CharacterData | null;
  menu: MenuState | null;
  operation: OperationState | null;
  pools: PoolsData | null;
  leaderboard: LeaderboardData | null;
  claims: ClaimsData | null;
  statusMessage: string;
  isLoading: boolean;
  error: string | null;
  lastFightSummary?: FightSummaryData;
  lastEquipmentDropped?: EquipmentDropData;
  lastHealing?: HealingData;
  lastResurrection?: ResurrectionData;
}
```

## Examples

### Basic Usage

```typescript
import React from 'react';
import { ChainBrawlerProvider, useChainBrawlerContext } from '@chainbrawler/react';

const config = {
  address: '0x...',
  chain: { id: 2030, name: 'Conflux Testnet' },
  publicClient: publicClient,
  walletClient: walletClient,
  wagmiConfig: wagmiConfig
};

function GameComponent() {
  const { character, actions, isLoading, error } = useChainBrawlerContext();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {character ? (
        <div>
          <h2>{character.className} - Level {character.level}</h2>
          <div>Health: {character.endurance.current}/{character.endurance.max}</div>
          <button onClick={() => actions.fightEnemy(1, 5)}>
            Fight Enemy
          </button>
        </div>
      ) : (
        <div>
          <h2>No Character</h2>
          <button onClick={() => actions.createCharacter(1)}>
            Create Character
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ChainBrawlerProvider config={config}>
      <GameComponent />
    </ChainBrawlerProvider>
  );
}
```

### Web Integration

```typescript
import { WagmiProvider } from 'wagmi';
import { WebChainBrawlerProvider } from '@chainbrawler/react';

function WebApp() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <WebChainBrawlerProvider config={chainBrawlerConfig}>
        <GameComponent />
      </WebChainBrawlerProvider>
    </WagmiProvider>
  );
}
```

### Custom Components

```typescript
import { useChainBrawler } from '@chainbrawler/react';

function CustomCharacterCard() {
  const { character, actions, isLoading } = useChainBrawler(config);

  if (isLoading) return <div>Loading character...</div>;

  return (
    <div className="character-card">
      <h3>{character?.className || 'No Character'}</h3>
      <div className="stats">
        <div>Level: {character?.level || 0}</div>
        <div>XP: {character?.experience || 0}</div>
        <div>Health: {character?.endurance.current || 0}/{character?.endurance.max || 0}</div>
      </div>
      <div className="actions">
        <button 
          onClick={() => actions.healCharacter()}
          disabled={!character?.isAlive}
        >
          Heal
        </button>
        <button 
          onClick={() => actions.fightEnemy(1, 5)}
          disabled={character?.inCombat}
        >
          Fight
        </button>
      </div>
    </div>
  );
}
```

### Using Specialized Hooks

```typescript
import { useClaims, useLeaderboard, usePools } from '@chainbrawler/react';

function GameDashboard() {
  const { claims, loadClaims, claimPrize } = useClaims();
  const { leaderboard, loadLeaderboard } = useLeaderboard();
  const { pools, loadPools } = usePools();

  return (
    <div>
      <div>
        <h3>Claims</h3>
        <button onClick={() => loadClaims?.(playerAddress)}>
          Load Claims
        </button>
        {claims && (
          <div>
            Total Claimable: {claims.totalClaimable.toString()}
            {claims.available.map((claim, index) => (
              <div key={index}>
                <span>{claim.description}</span>
                <button 
                  onClick={() => claimPrize?.(claim.epoch!, claim.index!, claim.amount, claim.proof!)}
                  disabled={!claim.canClaim}
                >
                  Claim
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h3>Leaderboard</h3>
        <button onClick={() => loadLeaderboard?.(playerAddress)}>
          Load Leaderboard
        </button>
        {leaderboard && (
          <div>
            <div>Your Rank: {leaderboard.playerRank.toString()}</div>
            <div>Your Score: {leaderboard.playerScore.toString()}</div>
            <div>Total Players: {leaderboard.totalPlayers.toString()}</div>
          </div>
        )}
      </div>
      
      <div>
        <h3>Pools</h3>
        <button onClick={() => loadPools?.()}>
          Load Pools
        </button>
        {pools && (
          <div>
            <div>Prize Pool: {pools.prizePool.formatted}</div>
            <div>Equipment Pool: {pools.equipmentPool.formatted}</div>
            <div>Total Value: {pools.totalValue.toString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}
```
