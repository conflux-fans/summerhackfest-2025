# ChainBrawler Core API Reference

## Quick Start

```typescript
import { ChainBrawlerSDK } from '@chainbrawler/core';

const sdk = new ChainBrawlerSDK({
  address: '0x...',
  chain: { id: 2030, name: 'Conflux Testnet' },
  publicClient: publicClient,
  walletClient: walletClient,
  wagmiConfig: wagmiConfig
});
```

## Main SDK API

### State Access
```typescript
// Get current state
const state = sdk.getState();

// Get specific data
const character = sdk.getCharacter();
const menu = sdk.getMenu();
const pools = sdk.getPools();
const leaderboard = sdk.getLeaderboard();
const claims = sdk.getClaims();

// Get UI state
const isLoading = sdk.isLoading();
const error = sdk.getError();
const statusMessage = sdk.getStatusMessage();
```

### Actions
```typescript
// Character actions
await sdk.actions.createCharacter(classId);
await sdk.actions.getCharacter(playerAddress);
await sdk.actions.healCharacter();
await sdk.actions.resurrectCharacter();
await sdk.actions.canHeal(playerAddress);
await sdk.actions.canResurrect(playerAddress);

// Combat actions
await sdk.actions.fightEnemy(enemyId, enemyLevel);
await sdk.actions.continueFight();
await sdk.actions.fleeRound();
await sdk.actions.isCharacterInCombat(playerAddress);
await sdk.actions.getCombatState(playerAddress);
await sdk.actions.getEnemyStats(enemyId, enemyLevel);

// Pools actions
await sdk.actions.loadPools();
await sdk.actions.refreshPools();

// Leaderboard actions
await sdk.actions.loadLeaderboard(playerAddress);
await sdk.actions.refreshLeaderboard(playerAddress);
await sdk.actions.getCurrentEpoch();
await sdk.actions.getEpochScore(playerAddress, epoch);
await sdk.actions.getTotalPlayerCount();
await sdk.actions.getPlayerRank(playerAddress, epoch);

// Claims actions
await sdk.actions.loadClaims(playerAddress);
await sdk.actions.refreshClaims(playerAddress);
await sdk.actions.claimPrize(epoch, index, amount, proof);
await sdk.actions.isClaimed(epoch, index);
await sdk.actions.getMerkleProof(playerAddress, epoch);

// Utility actions
await sdk.actions.refreshAll(playerAddress);
```

### Event Subscription
```typescript
// Subscribe to state changes
const unsubscribe = sdk.subscribe((state) => {
  console.log('State updated:', state);
});

// Subscribe to specific events
const eventEmitter = sdk.getEventEmitter();
eventEmitter.on(EventType.FIGHT_COMPLETED, (data) => {
  console.log('Fight completed:', data);
});
```

### Utility Methods
```typescript
// Clear errors
sdk.clearError();

// Reset state
sdk.reset();

// Set player address
sdk.setPlayerAddress('0x...');

// Get player address
const address = sdk.getPlayerAddress();

// Cleanup
sdk.cleanup();
```

## Data Types

### CharacterData
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

### PoolsData
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
```typescript
interface ClaimsData {
  available: ClaimableReward[];
  totalClaimable: bigint;
  lastChecked: number;
}
```

## Event Types

```typescript
enum EventType {
  CHARACTER_CREATED = "characterCreated",
  CHARACTER_UPDATED = "characterUpdated",
  FIGHT_STARTED = "fightStarted",
  FIGHT_COMPLETED = "fightCompleted",
  HEALING_STARTED = "healingStarted",
  HEALING_COMPLETED = "healingCompleted",
  RESURRECTION_STARTED = "resurrectionStarted",
  RESURRECTION_COMPLETED = "resurrectionCompleted",
  OPERATION_STARTED = "operationStarted",
  OPERATION_COMPLETED = "operationCompleted",
  OPERATION_FAILED = "operationFailed",
  POOLS_UPDATED = "poolsUpdated",
  LEADERBOARD_UPDATED = "leaderboardUpdated",
  CLAIMS_UPDATED = "claimsUpdated",
  CLAIM_STARTED = "claimStarted",
  CLAIM_COMPLETED = "claimCompleted",
  CLAIM_FAILED = "claimFailed",
  STATE_CHANGED = "stateChanged",
  ERROR_OCCURRED = "errorOccurred",
  VALIDATION_FAILED = "validationFailed",
  TRANSACTION_STATUS = "transactionStatus",
  CHARACTER_DATA_REFRESH = "characterDataRefresh",
}
```

## Error Handling

```typescript
enum ErrorType {
  NETWORK_ERROR = "Network connection failed",
  CONTRACT_ERROR = "Contract interaction failed",
  VALIDATION_ERROR = "Invalid operation",
  COOLDOWN_ERROR = "Operation on cooldown",
  CHARACTER_ERROR = "Character state error",
  TRANSACTION_ERROR = "Transaction failed",
  POOL_ERROR = "Pool operation failed",
  LEADERBOARD_ERROR = "Leaderboard operation failed",
  CLAIM_ERROR = "Prize claim failed",
  UNKNOWN_ERROR = "Unknown error occurred",
}

interface ChainBrawlerError {
  type: ErrorType;
  code: number;
  message: string;
  originalError?: any;
  retryable: boolean;
  context?: Record<string, any>;
}
```

## Configuration

```typescript
interface ChainBrawlerConfig {
  address: `0x${string}`;
  chain: { id: number; name: string };
  publicClient: any; // Viem public client
  walletClient?: any; // Viem wallet client
  wagmiConfig?: any; // Wagmi config
  contractClient?: any; // Optional custom client
}
```

## Utilities

### Chain Utils
```typescript
import {
  detectWalletType,
  getChainConfig,
  getSupportedChainById,
  hasContractDeployed,
  isSupportedChain,
  SUPPORTED_CHAINS,
} from '@chainbrawler/core';
```

### Character Utils
```typescript
import {
  CHARACTER_CLASSES,
  getCharacterClass,
  getCharacterClassName,
} from '@chainbrawler/core';
```

### Enemy Utils
```typescript
import {
  calculateEnemyStats,
  ENEMY_TYPES,
  getDifficultyColor,
  getDifficultyLevel,
  getEnemyName,
  getEnemyType,
} from '@chainbrawler/core';
```

### UI Utils
```typescript
import {
  formatAddress,
  formatEthAmount,
  formatHealthDisplay,
  formatTimeRemaining,
  getFightOutcome,
} from '@chainbrawler/core';
```

### Merkle Tree Utils
```typescript
import {
  generateMerkleTree,
  generatePlayerMerkleProof,
  MerkleTreeUtils,
  verifyMerkleProof,
} from '@chainbrawler/core';
```

## Examples

### Basic Usage
```typescript
import { ChainBrawlerSDK } from '@chainbrawler/core';

const sdk = new ChainBrawlerSDK(config);

// Subscribe to state changes
sdk.subscribe((state) => {
  if (state.character) {
    console.log('Character level:', state.character.level);
  }
});

// Create a character
await sdk.actions.createCharacter(1);

// Fight an enemy
await sdk.actions.fightEnemy(1, 5);
```

### Error Handling
```typescript
try {
  await sdk.actions.createCharacter(1);
} catch (error) {
  console.error('Character creation failed:', error);
  // Handle error appropriately
}
```

### Event Listening
```typescript
const eventEmitter = sdk.getEventEmitter();

eventEmitter.on(EventType.FIGHT_COMPLETED, (fightData) => {
  console.log('Fight completed!', fightData);
  if (fightData.victory) {
    console.log('Victory! XP gained:', fightData.xpGained);
  }
});
```
