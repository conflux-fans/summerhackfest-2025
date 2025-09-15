import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AccessControl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const accessControlAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ChainBrawlerClean
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const chainBrawlerCleanAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [{ name: 'code', internalType: 'uint16', type: 'uint16' }],
    name: 'GameError',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'characterClass',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'CharacterCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'CharacterHealed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'CharacterResurrected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'classId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'ClassBaseUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'combatIndex',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'multiplierBP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'baseXP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'adjustedXP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'baseDropRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'adjustedDropRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DifficultyMultiplierApplied',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'ids',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'EnemiesPopulated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'EnemyUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bonuses',
        internalType: 'uint256[4]',
        type: 'uint256[4]',
        indexed: false,
      },
    ],
    name: 'EquipmentDropped',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'toDev',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'toPrize',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'toGasRefund',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'toEquipmentRewards',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'toNextEpochReserve',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'toEmergencyReserve',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FeeDistributed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'epoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'isKill', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'fightScore',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FightRecorded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'roundsElapsed',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'playerStartEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'playerEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyStartEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'victory', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'unresolved',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'roundNumbers',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'playerDamages',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'enemyDamages',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'playerCriticals',
        internalType: 'bool[]',
        type: 'bool[]',
        indexed: false,
      },
      {
        name: 'enemyCriticals',
        internalType: 'bool[]',
        type: 'bool[]',
        indexed: false,
      },
    ],
    name: 'FightSummary',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'xpGained',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FightXPReward',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'GasRefundIssued',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'LevelUp',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryUpdated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_DROP_RATE_BP',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canContinueFight',
    outputs: [
      { name: 'canContinueResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canFight',
    outputs: [
      { name: 'canFightResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canHeal',
    outputs: [
      { name: 'canHealResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canResurrect',
    outputs: [
      { name: 'canResurrectResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'continueFight',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'characterClass', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createCharacter',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'developerFund',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochDuration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'player', internalType: 'address', type: 'address' },
    ],
    name: 'epochRefundsUsed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'player', internalType: 'address', type: 'address' },
    ],
    name: 'epochScores',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochStartTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochState',
    outputs: [
      { name: 'currentEpoch', internalType: 'uint256', type: 'uint256' },
      { name: 'epochDuration', internalType: 'uint256', type: 'uint256' },
      { name: 'epochStartTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'equipmentRewardPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'enemyId', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLevel', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'fightEnemy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fleeRound',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundCapPerFight',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundConfig',
    outputs: [
      { name: 'capPerFight', internalType: 'uint256', type: 'uint256' },
      {
        name: 'perEpochRefundCapPerAccount',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'lowLevelThreshold', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllPoolData',
    outputs: [
      { name: 'prizePool', internalType: 'uint256', type: 'uint256' },
      { name: 'equipmentPool', internalType: 'uint256', type: 'uint256' },
      { name: 'gasRefundPool', internalType: 'uint256', type: 'uint256' },
      { name: 'developerPool', internalType: 'uint256', type: 'uint256' },
      { name: 'nextEpochPool', internalType: 'uint256', type: 'uint256' },
      { name: 'emergencyPool', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getCharacter',
    outputs: [
      { name: 'characterClass', internalType: 'uint256', type: 'uint256' },
      { name: 'level', internalType: 'uint256', type: 'uint256' },
      { name: 'experience', internalType: 'uint256', type: 'uint256' },
      { name: 'currentEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'maxEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'totalCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'totalDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'totalLuck', internalType: 'uint256', type: 'uint256' },
      { name: 'aliveFlag', internalType: 'bool', type: 'bool' },
      { name: 'equippedCombatBonus', internalType: 'uint256', type: 'uint256' },
      {
        name: 'equippedEnduranceBonus',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'equippedDefenseBonus',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'equippedLuckBonus', internalType: 'uint256', type: 'uint256' },
      { name: 'totalKills', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'classId', internalType: 'uint256', type: 'uint256' }],
    name: 'getClassBase',
    outputs: [
      { name: 'baseCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'baseEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'baseDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'baseLuck', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getCombatState',
    outputs: [
      { name: 'enemyId', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLevel', internalType: 'uint256', type: 'uint256' },
      {
        name: 'enemyCurrentEndurance',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'playerCurrentEndurance',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'roundsElapsed', internalType: 'uint256', type: 'uint256' },
      {
        name: 'playerStartEndurance',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'enemyStartEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
      {
        name: 'difficultyMultiplier',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCreationFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDeveloperFund',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getEffectiveCurrentEndurance',
    outputs: [
      { name: 'effectiveEndurance', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEmergencyReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEpochDuration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'player', internalType: 'address', type: 'address' },
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEpochScore',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEpochStartTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEpochTimeRemaining',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEquipmentRewardPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGasRefundPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getHealingCooldown',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getHealingCooldownRemaining',
    outputs: [
      { name: 'timeRemaining', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getHealingFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getNextEpochReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getPendingPassiveRegeneration',
    outputs: [
      { name: 'pendingRegen', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'getPlayerByIndex',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPrizePool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRegenWindow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getResurrectionFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'enemyId', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLevel', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getScaledEnemyStats',
    outputs: [
      { name: 'enemyCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLuck', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalPlayerCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'level', internalType: 'uint256', type: 'uint256' }],
    name: 'getXPRequiredForLevel',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'healCharacter',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'isCharacterInCombat',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'leaderboardManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'leaderboardTreasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lowLevelThreshold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextEpochReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'perEpochRefundCapPerAccount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'prizePool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resurrectCharacter',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_manager', internalType: 'address', type: 'address' }],
    name: 'setLeaderboardManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_treasury', internalType: 'address', type: 'address' }],
    name: 'setLeaderboardTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasuryState',
    outputs: [
      { name: 'treasury', internalType: 'address', type: 'address' },
      { name: 'developerFund', internalType: 'uint256', type: 'uint256' },
      { name: 'prizePool', internalType: 'uint256', type: 'uint256' },
      { name: 'gasRefundPool', internalType: 'uint256', type: 'uint256' },
      { name: 'equipmentRewardPool', internalType: 'uint256', type: 'uint256' },
      { name: 'nextEpochReserve', internalType: 'uint256', type: 'uint256' },
      { name: 'emergencyReserve', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ChainBrawlerState
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const chainBrawlerStateAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'classId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'ClassBaseUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'combatIndex',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'multiplierBP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'baseXP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'adjustedXP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'baseDropRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'adjustedDropRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DifficultyMultiplierApplied',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'ids',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'EnemiesPopulated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'EnemyUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'epoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'isKill', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'fightScore',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FightRecorded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'roundsElapsed',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'playerStartEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'playerEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyStartEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'victory', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'unresolved',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'roundNumbers',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'playerDamages',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'enemyDamages',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'playerCriticals',
        internalType: 'bool[]',
        type: 'bool[]',
        indexed: false,
      },
      {
        name: 'enemyCriticals',
        internalType: 'bool[]',
        type: 'bool[]',
        indexed: false,
      },
    ],
    name: 'FightSummary',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'xpGained',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FightXPReward',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'GasRefundIssued',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryUpdated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'developerFund',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochDuration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'player', internalType: 'address', type: 'address' },
    ],
    name: 'epochRefundsUsed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'player', internalType: 'address', type: 'address' },
    ],
    name: 'epochScores',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochStartTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochState',
    outputs: [
      { name: 'currentEpoch', internalType: 'uint256', type: 'uint256' },
      { name: 'epochDuration', internalType: 'uint256', type: 'uint256' },
      { name: 'epochStartTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'equipmentRewardPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundCapPerFight',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundConfig',
    outputs: [
      { name: 'capPerFight', internalType: 'uint256', type: 'uint256' },
      {
        name: 'perEpochRefundCapPerAccount',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'lowLevelThreshold', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lowLevelThreshold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextEpochReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'perEpochRefundCapPerAccount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'prizePool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasuryState',
    outputs: [
      { name: 'treasury', internalType: 'address', type: 'address' },
      { name: 'developerFund', internalType: 'uint256', type: 'uint256' },
      { name: 'prizePool', internalType: 'uint256', type: 'uint256' },
      { name: 'gasRefundPool', internalType: 'uint256', type: 'uint256' },
      { name: 'equipmentRewardPool', internalType: 'uint256', type: 'uint256' },
      { name: 'nextEpochReserve', internalType: 'uint256', type: 'uint256' },
      { name: 'emergencyReserve', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ChainBrawlerTestHelpersForTests
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const chainBrawlerTestHelpersForTestsAbi = [
  {
    type: 'error',
    inputs: [{ name: 'code', internalType: 'uint16', type: 'uint16' }],
    name: 'GameError',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'characterClass',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'CharacterCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'CharacterHealed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'CharacterResurrected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'classId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'ClassBaseUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'combatIndex',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'multiplierBP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'baseXP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'adjustedXP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'baseDropRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'adjustedDropRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DifficultyMultiplierApplied',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'ids',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'EnemiesPopulated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'EnemyUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bonuses',
        internalType: 'uint256[4]',
        type: 'uint256[4]',
        indexed: false,
      },
    ],
    name: 'EquipmentDropped',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'toDev',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'toPrize',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'toGasRefund',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'toEquipmentRewards',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'toNextEpochReserve',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'toEmergencyReserve',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FeeDistributed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'epoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'isKill', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'fightScore',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FightRecorded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'roundsElapsed',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'playerStartEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'playerEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyStartEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'victory', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'unresolved',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'roundNumbers',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'playerDamages',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'enemyDamages',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'playerCriticals',
        internalType: 'bool[]',
        type: 'bool[]',
        indexed: false,
      },
      {
        name: 'enemyCriticals',
        internalType: 'bool[]',
        type: 'bool[]',
        indexed: false,
      },
    ],
    name: 'FightSummary',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'xpGained',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FightXPReward',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'GasRefundIssued',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'LevelUp',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryUpdated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_DROP_RATE_BP',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canContinueFight',
    outputs: [
      { name: 'canContinueResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canFight',
    outputs: [
      { name: 'canFightResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canHeal',
    outputs: [
      { name: 'canHealResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canResurrect',
    outputs: [
      { name: 'canResurrectResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'continueFight',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'characterClass', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createCharacter',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'developerFund',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochDuration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'player', internalType: 'address', type: 'address' },
    ],
    name: 'epochRefundsUsed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'player', internalType: 'address', type: 'address' },
    ],
    name: 'epochScores',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochStartTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochState',
    outputs: [
      { name: 'currentEpoch', internalType: 'uint256', type: 'uint256' },
      { name: 'epochDuration', internalType: 'uint256', type: 'uint256' },
      { name: 'epochStartTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'equipmentRewardPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'enemyId', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLevel', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'fightEnemy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fleeRound',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundCapPerFight',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundConfig',
    outputs: [
      { name: 'capPerFight', internalType: 'uint256', type: 'uint256' },
      {
        name: 'perEpochRefundCapPerAccount',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'lowLevelThreshold', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllPoolData',
    outputs: [
      { name: 'prizePool', internalType: 'uint256', type: 'uint256' },
      { name: 'equipmentPool', internalType: 'uint256', type: 'uint256' },
      { name: 'gasRefundPool', internalType: 'uint256', type: 'uint256' },
      { name: 'developerPool', internalType: 'uint256', type: 'uint256' },
      { name: 'nextEpochPool', internalType: 'uint256', type: 'uint256' },
      { name: 'emergencyPool', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getCharacter',
    outputs: [
      { name: 'characterClass', internalType: 'uint256', type: 'uint256' },
      { name: 'level', internalType: 'uint256', type: 'uint256' },
      { name: 'experience', internalType: 'uint256', type: 'uint256' },
      { name: 'currentEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'maxEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'totalCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'totalDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'totalLuck', internalType: 'uint256', type: 'uint256' },
      { name: 'aliveFlag', internalType: 'bool', type: 'bool' },
      { name: 'equippedCombatBonus', internalType: 'uint256', type: 'uint256' },
      {
        name: 'equippedEnduranceBonus',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'equippedDefenseBonus',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'equippedLuckBonus', internalType: 'uint256', type: 'uint256' },
      { name: 'totalKills', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'classId', internalType: 'uint256', type: 'uint256' }],
    name: 'getClassBase',
    outputs: [
      { name: 'baseCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'baseEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'baseDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'baseLuck', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getCombatState',
    outputs: [
      { name: 'enemyId', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLevel', internalType: 'uint256', type: 'uint256' },
      {
        name: 'enemyCurrentEndurance',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'playerCurrentEndurance',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'roundsElapsed', internalType: 'uint256', type: 'uint256' },
      {
        name: 'playerStartEndurance',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'enemyStartEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
      {
        name: 'difficultyMultiplier',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCreationFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDeveloperFund',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getEffectiveCurrentEndurance',
    outputs: [
      { name: 'effectiveEndurance', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEmergencyReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEpochDuration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'player', internalType: 'address', type: 'address' },
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEpochScore',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEpochStartTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEpochTimeRemaining',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEquipmentRewardPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGasRefundPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getHealingCooldown',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getHealingCooldownRemaining',
    outputs: [
      { name: 'timeRemaining', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getHealingFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getNextEpochReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getPendingPassiveRegeneration',
    outputs: [
      { name: 'pendingRegen', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'getPlayerByIndex',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPrizePool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRegenWindow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getResurrectionFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'enemyId', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLevel', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getScaledEnemyStats',
    outputs: [
      { name: 'enemyCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLuck', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalPlayerCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'level', internalType: 'uint256', type: 'uint256' }],
    name: 'getXPRequiredForLevel',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'healCharacter',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'isCharacterInCombat',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'leaderboardManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'leaderboardTreasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lowLevelThreshold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextEpochReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'perEpochRefundCapPerAccount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'prizePool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resurrectCharacter',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'baseCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'baseEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'baseDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'baseLuck', internalType: 'uint256', type: 'uint256' },
      { name: 'xpReward', internalType: 'uint256', type: 'uint256' },
      { name: 'dropRate', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setEnemyBase',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_manager', internalType: 'address', type: 'address' }],
    name: 'setLeaderboardManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_treasury', internalType: 'address', type: 'address' }],
    name: 'setLeaderboardTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'player', internalType: 'address', type: 'address' },
      { name: 'coreStats', internalType: 'uint256', type: 'uint256' },
      { name: 'progressionStats', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setPackedCharacter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newTreasury', internalType: 'address', type: 'address' }],
    name: 'setTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasuryState',
    outputs: [
      { name: 'treasury', internalType: 'address', type: 'address' },
      { name: 'developerFund', internalType: 'uint256', type: 'uint256' },
      { name: 'prizePool', internalType: 'uint256', type: 'uint256' },
      { name: 'gasRefundPool', internalType: 'uint256', type: 'uint256' },
      { name: 'equipmentRewardPool', internalType: 'uint256', type: 'uint256' },
      { name: 'nextEpochReserve', internalType: 'uint256', type: 'uint256' },
      { name: 'emergencyReserve', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CombatConfigTester
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const combatConfigTesterAbi = [
  {
    type: 'function',
    inputs: [{ name: 'classId', internalType: 'uint8', type: 'uint8' }],
    name: 'baseStatsByClass',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256' }],
    name: 'enemyBaseById',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'playerLevel', internalType: 'uint256', type: 'uint256' }],
    name: 'levelScalingBP',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CombatEngine
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const combatEngineAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'classId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'ClassBaseUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'combatIndex',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'multiplierBP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'baseXP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'adjustedXP',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'baseDropRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'adjustedDropRate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DifficultyMultiplierApplied',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'ids',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'EnemiesPopulated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'EnemyUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'epoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'isKill', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'fightScore',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FightRecorded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'roundsElapsed',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'playerStartEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'playerEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyStartEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'enemyEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'victory', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'unresolved',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'roundNumbers',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'playerDamages',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'enemyDamages',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'playerCriticals',
        internalType: 'bool[]',
        type: 'bool[]',
        indexed: false,
      },
      {
        name: 'enemyCriticals',
        internalType: 'bool[]',
        type: 'bool[]',
        indexed: false,
      },
    ],
    name: 'FightSummary',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'enemyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'enemyLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'xpGained',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FightXPReward',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'GasRefundIssued',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryUpdated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'developerFund',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochDuration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'player', internalType: 'address', type: 'address' },
    ],
    name: 'epochRefundsUsed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'player', internalType: 'address', type: 'address' },
    ],
    name: 'epochScores',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochStartTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochState',
    outputs: [
      { name: 'currentEpoch', internalType: 'uint256', type: 'uint256' },
      { name: 'epochDuration', internalType: 'uint256', type: 'uint256' },
      { name: 'epochStartTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'equipmentRewardPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundCapPerFight',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundConfig',
    outputs: [
      { name: 'capPerFight', internalType: 'uint256', type: 'uint256' },
      {
        name: 'perEpochRefundCapPerAccount',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'lowLevelThreshold', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gasRefundPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lowLevelThreshold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextEpochReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'perEpochRefundCapPerAccount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'prizePool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasuryState',
    outputs: [
      { name: 'treasury', internalType: 'address', type: 'address' },
      { name: 'developerFund', internalType: 'uint256', type: 'uint256' },
      { name: 'prizePool', internalType: 'uint256', type: 'uint256' },
      { name: 'gasRefundPool', internalType: 'uint256', type: 'uint256' },
      { name: 'equipmentRewardPool', internalType: 'uint256', type: 'uint256' },
      { name: 'nextEpochReserve', internalType: 'uint256', type: 'uint256' },
      { name: 'emergencyReserve', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CombatEngineLib
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const combatEngineLibAbi = [
  {
    type: 'error',
    inputs: [{ name: 'code', internalType: 'uint16', type: 'uint16' }],
    name: 'GameError',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CombatMathTest
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const combatMathTestAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'playerCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'playerDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'playerLuck', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLuck', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'calculateCombatIndex',
    outputs: [{ name: '', internalType: 'int256', type: 'int256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'combatIndex', internalType: 'int256', type: 'int256' }],
    name: 'calculateDifficultyMultiplier',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CombatMathTester
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const combatMathTesterAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'combatSkill', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'defense', internalType: 'uint256', type: 'uint256' },
      { name: 'currentEndurance', internalType: 'uint256', type: 'uint256' },
      {
        name: 'enemyCurrentEndurance',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'playerLuck', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLuck', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'performRound',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bool', type: 'bool' },
      { name: '', internalType: 'bool', type: 'bool' },
      { name: '', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'baseCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'baseEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'baseDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'baseLuck', internalType: 'uint256', type: 'uint256' },
      { name: 'level', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'scaleEnemyForLevel',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'pure',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC165
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc165Abi = [
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HelpersForTests
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const helpersForTestsAbi = [
  {
    type: 'error',
    inputs: [{ name: 'code', internalType: 'uint16', type: 'uint16' }],
    name: 'GameError',
  },
  {
    type: 'function',
    inputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'mask', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'clampToMask',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'seed', internalType: 'uint256', type: 'uint256' },
      { name: 'baseCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'baseEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'baseDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'baseLuck', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'generateNewCharacter',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'packed', internalType: 'uint256', type: 'uint256' },
      { name: 'shift', internalType: 'uint256', type: 'uint256' },
      { name: 'mask', internalType: 'uint256', type: 'uint256' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'writeClamped',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAccessControl
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAccessControlAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IChainBrawlerUI
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iChainBrawlerUiAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'characterClass',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'CharacterCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newEndurance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'CharacterHealed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'CharacterResurrected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bonuses',
        internalType: 'uint256[4]',
        type: 'uint256[4]',
        indexed: false,
      },
    ],
    name: 'EquipmentDropped',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newLevel',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'LevelUp',
  },
  {
    type: 'function',
    inputs: [],
    name: 'continueFight',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'characterClass', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createCharacter',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'enemyId', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLevel', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'fightEnemy',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fleeRound',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getCharacter',
    outputs: [
      { name: 'characterClass', internalType: 'uint256', type: 'uint256' },
      { name: 'level', internalType: 'uint256', type: 'uint256' },
      { name: 'experience', internalType: 'uint256', type: 'uint256' },
      { name: 'currentEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'maxEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'totalCombat', internalType: 'uint256', type: 'uint256' },
      { name: 'totalDefense', internalType: 'uint256', type: 'uint256' },
      { name: 'totalLuck', internalType: 'uint256', type: 'uint256' },
      { name: 'aliveFlag', internalType: 'bool', type: 'bool' },
      { name: 'equippedCombatBonus', internalType: 'uint256', type: 'uint256' },
      {
        name: 'equippedEnduranceBonus',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'equippedDefenseBonus',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'equippedLuckBonus', internalType: 'uint256', type: 'uint256' },
      { name: 'totalKills', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getCombatState',
    outputs: [
      { name: 'enemyId', internalType: 'uint256', type: 'uint256' },
      { name: 'enemyLevel', internalType: 'uint256', type: 'uint256' },
      {
        name: 'enemyCurrentEndurance',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'playerCurrentEndurance',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'roundsElapsed', internalType: 'uint256', type: 'uint256' },
      {
        name: 'playerStartEndurance',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'enemyStartEndurance', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
      {
        name: 'difficultyMultiplier',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCreationFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getHealingFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getResurrectionFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'level', internalType: 'uint256', type: 'uint256' }],
    name: 'getXPRequiredForLevel',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'healCharacter',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'isCharacterInCombat',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resurrectCharacter',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICharacterValidation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCharacterValidationAbi = [
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canContinueFight',
    outputs: [
      { name: 'canContinueResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canFight',
    outputs: [
      { name: 'canFightResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canHeal',
    outputs: [
      { name: 'canHealResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'canResurrect',
    outputs: [
      { name: 'canResurrectResult', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC165
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc165Abi = [
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILeaderboardInfo
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iLeaderboardInfoAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'player', internalType: 'address', type: 'address' },
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEpochScore',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalPlayerCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ILeaderboardTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iLeaderboardTreasuryAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'depositForEpoch',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'winners', internalType: 'address[]', type: 'address[]' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'distribute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'root', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'publishEpochRoot',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ITreasuryInfo
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iTreasuryInfoAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'getAllPoolData',
    outputs: [
      { name: 'prizePool', internalType: 'uint256', type: 'uint256' },
      { name: 'equipmentPool', internalType: 'uint256', type: 'uint256' },
      { name: 'gasRefundPool', internalType: 'uint256', type: 'uint256' },
      { name: 'developerPool', internalType: 'uint256', type: 'uint256' },
      { name: 'nextEpochPool', internalType: 'uint256', type: 'uint256' },
      { name: 'emergencyPool', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDeveloperFund',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEmergencyReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEquipmentRewardPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGasRefundPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getNextEpochReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPrizePool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LeaderboardManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const leaderboardManagerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'treasuryAddr', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'code', internalType: 'uint16', type: 'uint16' }],
    name: 'GameError',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'root', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'epoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'totalRewards',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Published',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PUBLISHER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'root', internalType: 'bytes32', type: 'bytes32' },
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'winners', internalType: 'address[]', type: 'address[]' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'publishAndDistribute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'root', internalType: 'bytes32', type: 'bytes32' },
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'publishAndFund',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'treasuryAddr', internalType: 'address', type: 'address' },
    ],
    name: 'setTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [
      {
        name: '',
        internalType: 'contract ILeaderboardTreasury',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LeaderboardTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const leaderboardTreasuryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [{ name: 'code', internalType: 'uint16', type: 'uint16' }],
    name: 'GameError',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'secondsWindow',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'ClaimWindowSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'epoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'index',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Claimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Deposited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'secondsWindow',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'DisputeWindowSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'EmergencyWithdrawal',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'epoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'EpochFunded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'epoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'EpochReserveConsumed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'epoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'root',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'publishedAt',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'EpochRootPublished',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'RewardDistributed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'fromEpoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'UnclaimedFundsRolled',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MANAGER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'proof', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimWindow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'depositForEpoch',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'disputeWindow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'winners', internalType: 'address[]', type: 'address[]' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'distribute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address payable', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'epochPublishedAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'epochPublishedBy',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'epochReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'epochRoot',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'getClaimDeadline',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'getUnclaimedAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'isClaimWindowExpired',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isClaimed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'root', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'publishEpochRoot',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'rollUnclaimedFunds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'secondsWindow', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setClaimWindow',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'secondsWindow', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setDisputeWindow',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link accessControlAbi}__
 */
export const readAccessControl = /*#__PURE__*/ createReadContract({
  abi: accessControlAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link accessControlAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const readAccessControlDefaultAdminRole =
  /*#__PURE__*/ createReadContract({
    abi: accessControlAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link accessControlAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const readAccessControlGetRoleAdmin = /*#__PURE__*/ createReadContract({
  abi: accessControlAbi,
  functionName: 'getRoleAdmin',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link accessControlAbi}__ and `functionName` set to `"hasRole"`
 */
export const readAccessControlHasRole = /*#__PURE__*/ createReadContract({
  abi: accessControlAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link accessControlAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const readAccessControlSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: accessControlAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link accessControlAbi}__
 */
export const writeAccessControl = /*#__PURE__*/ createWriteContract({
  abi: accessControlAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link accessControlAbi}__ and `functionName` set to `"grantRole"`
 */
export const writeAccessControlGrantRole = /*#__PURE__*/ createWriteContract({
  abi: accessControlAbi,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link accessControlAbi}__ and `functionName` set to `"renounceRole"`
 */
export const writeAccessControlRenounceRole = /*#__PURE__*/ createWriteContract(
  { abi: accessControlAbi, functionName: 'renounceRole' },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link accessControlAbi}__ and `functionName` set to `"revokeRole"`
 */
export const writeAccessControlRevokeRole = /*#__PURE__*/ createWriteContract({
  abi: accessControlAbi,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link accessControlAbi}__
 */
export const simulateAccessControl = /*#__PURE__*/ createSimulateContract({
  abi: accessControlAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link accessControlAbi}__ and `functionName` set to `"grantRole"`
 */
export const simulateAccessControlGrantRole =
  /*#__PURE__*/ createSimulateContract({
    abi: accessControlAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link accessControlAbi}__ and `functionName` set to `"renounceRole"`
 */
export const simulateAccessControlRenounceRole =
  /*#__PURE__*/ createSimulateContract({
    abi: accessControlAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link accessControlAbi}__ and `functionName` set to `"revokeRole"`
 */
export const simulateAccessControlRevokeRole =
  /*#__PURE__*/ createSimulateContract({
    abi: accessControlAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link accessControlAbi}__
 */
export const watchAccessControlEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: accessControlAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link accessControlAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const watchAccessControlRoleAdminChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: accessControlAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link accessControlAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const watchAccessControlRoleGrantedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: accessControlAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link accessControlAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const watchAccessControlRoleRevokedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: accessControlAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__
 */
export const readChainBrawlerClean = /*#__PURE__*/ createReadContract({
  abi: chainBrawlerCleanAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const readChainBrawlerCleanDefaultAdminRole =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"MAX_DROP_RATE_BP"`
 */
export const readChainBrawlerCleanMaxDropRateBp =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'MAX_DROP_RATE_BP',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"canContinueFight"`
 */
export const readChainBrawlerCleanCanContinueFight =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'canContinueFight',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"canFight"`
 */
export const readChainBrawlerCleanCanFight = /*#__PURE__*/ createReadContract({
  abi: chainBrawlerCleanAbi,
  functionName: 'canFight',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"canHeal"`
 */
export const readChainBrawlerCleanCanHeal = /*#__PURE__*/ createReadContract({
  abi: chainBrawlerCleanAbi,
  functionName: 'canHeal',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"canResurrect"`
 */
export const readChainBrawlerCleanCanResurrect =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'canResurrect',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"currentEpoch"`
 */
export const readChainBrawlerCleanCurrentEpoch =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'currentEpoch',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"developerFund"`
 */
export const readChainBrawlerCleanDeveloperFund =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'developerFund',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"emergencyReserve"`
 */
export const readChainBrawlerCleanEmergencyReserve =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'emergencyReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"epochDuration"`
 */
export const readChainBrawlerCleanEpochDuration =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'epochDuration',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"epochRefundsUsed"`
 */
export const readChainBrawlerCleanEpochRefundsUsed =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'epochRefundsUsed',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"epochScores"`
 */
export const readChainBrawlerCleanEpochScores =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'epochScores',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"epochStartTime"`
 */
export const readChainBrawlerCleanEpochStartTime =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'epochStartTime',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"epochState"`
 */
export const readChainBrawlerCleanEpochState = /*#__PURE__*/ createReadContract(
  { abi: chainBrawlerCleanAbi, functionName: 'epochState' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"equipmentRewardPool"`
 */
export const readChainBrawlerCleanEquipmentRewardPool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'equipmentRewardPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"gasRefundCapPerFight"`
 */
export const readChainBrawlerCleanGasRefundCapPerFight =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'gasRefundCapPerFight',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"gasRefundConfig"`
 */
export const readChainBrawlerCleanGasRefundConfig =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'gasRefundConfig',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"gasRefundPool"`
 */
export const readChainBrawlerCleanGasRefundPool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'gasRefundPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getAllPoolData"`
 */
export const readChainBrawlerCleanGetAllPoolData =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getAllPoolData',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getCharacter"`
 */
export const readChainBrawlerCleanGetCharacter =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getCharacter',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getClassBase"`
 */
export const readChainBrawlerCleanGetClassBase =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getClassBase',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getCombatState"`
 */
export const readChainBrawlerCleanGetCombatState =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getCombatState',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getCreationFee"`
 */
export const readChainBrawlerCleanGetCreationFee =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getCreationFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getCurrentEpoch"`
 */
export const readChainBrawlerCleanGetCurrentEpoch =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getCurrentEpoch',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getDeveloperFund"`
 */
export const readChainBrawlerCleanGetDeveloperFund =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getDeveloperFund',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getEffectiveCurrentEndurance"`
 */
export const readChainBrawlerCleanGetEffectiveCurrentEndurance =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getEffectiveCurrentEndurance',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getEmergencyReserve"`
 */
export const readChainBrawlerCleanGetEmergencyReserve =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getEmergencyReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getEpochDuration"`
 */
export const readChainBrawlerCleanGetEpochDuration =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getEpochDuration',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getEpochScore"`
 */
export const readChainBrawlerCleanGetEpochScore =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getEpochScore',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getEpochStartTime"`
 */
export const readChainBrawlerCleanGetEpochStartTime =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getEpochStartTime',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getEpochTimeRemaining"`
 */
export const readChainBrawlerCleanGetEpochTimeRemaining =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getEpochTimeRemaining',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getEquipmentRewardPool"`
 */
export const readChainBrawlerCleanGetEquipmentRewardPool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getEquipmentRewardPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getGasRefundPool"`
 */
export const readChainBrawlerCleanGetGasRefundPool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getGasRefundPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getHealingCooldown"`
 */
export const readChainBrawlerCleanGetHealingCooldown =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getHealingCooldown',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getHealingCooldownRemaining"`
 */
export const readChainBrawlerCleanGetHealingCooldownRemaining =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getHealingCooldownRemaining',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getHealingFee"`
 */
export const readChainBrawlerCleanGetHealingFee =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getHealingFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getNextEpochReserve"`
 */
export const readChainBrawlerCleanGetNextEpochReserve =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getNextEpochReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getPendingPassiveRegeneration"`
 */
export const readChainBrawlerCleanGetPendingPassiveRegeneration =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getPendingPassiveRegeneration',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getPlayerByIndex"`
 */
export const readChainBrawlerCleanGetPlayerByIndex =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getPlayerByIndex',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getPrizePool"`
 */
export const readChainBrawlerCleanGetPrizePool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getPrizePool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getRegenWindow"`
 */
export const readChainBrawlerCleanGetRegenWindow =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getRegenWindow',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getResurrectionFee"`
 */
export const readChainBrawlerCleanGetResurrectionFee =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getResurrectionFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const readChainBrawlerCleanGetRoleAdmin =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getScaledEnemyStats"`
 */
export const readChainBrawlerCleanGetScaledEnemyStats =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getScaledEnemyStats',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getTotalPlayerCount"`
 */
export const readChainBrawlerCleanGetTotalPlayerCount =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getTotalPlayerCount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"getXPRequiredForLevel"`
 */
export const readChainBrawlerCleanGetXpRequiredForLevel =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'getXPRequiredForLevel',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"hasRole"`
 */
export const readChainBrawlerCleanHasRole = /*#__PURE__*/ createReadContract({
  abi: chainBrawlerCleanAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"isCharacterInCombat"`
 */
export const readChainBrawlerCleanIsCharacterInCombat =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'isCharacterInCombat',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"leaderboardManager"`
 */
export const readChainBrawlerCleanLeaderboardManager =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'leaderboardManager',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"leaderboardTreasury"`
 */
export const readChainBrawlerCleanLeaderboardTreasury =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'leaderboardTreasury',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"lowLevelThreshold"`
 */
export const readChainBrawlerCleanLowLevelThreshold =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'lowLevelThreshold',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"nextEpochReserve"`
 */
export const readChainBrawlerCleanNextEpochReserve =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'nextEpochReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"perEpochRefundCapPerAccount"`
 */
export const readChainBrawlerCleanPerEpochRefundCapPerAccount =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'perEpochRefundCapPerAccount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"prizePool"`
 */
export const readChainBrawlerCleanPrizePool = /*#__PURE__*/ createReadContract({
  abi: chainBrawlerCleanAbi,
  functionName: 'prizePool',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const readChainBrawlerCleanSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"treasury"`
 */
export const readChainBrawlerCleanTreasury = /*#__PURE__*/ createReadContract({
  abi: chainBrawlerCleanAbi,
  functionName: 'treasury',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"treasuryState"`
 */
export const readChainBrawlerCleanTreasuryState =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'treasuryState',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__
 */
export const writeChainBrawlerClean = /*#__PURE__*/ createWriteContract({
  abi: chainBrawlerCleanAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"continueFight"`
 */
export const writeChainBrawlerCleanContinueFight =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'continueFight',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"createCharacter"`
 */
export const writeChainBrawlerCleanCreateCharacter =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'createCharacter',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"fightEnemy"`
 */
export const writeChainBrawlerCleanFightEnemy =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'fightEnemy',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"fleeRound"`
 */
export const writeChainBrawlerCleanFleeRound =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'fleeRound',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"grantRole"`
 */
export const writeChainBrawlerCleanGrantRole =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"healCharacter"`
 */
export const writeChainBrawlerCleanHealCharacter =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'healCharacter',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"renounceRole"`
 */
export const writeChainBrawlerCleanRenounceRole =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"resurrectCharacter"`
 */
export const writeChainBrawlerCleanResurrectCharacter =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'resurrectCharacter',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"revokeRole"`
 */
export const writeChainBrawlerCleanRevokeRole =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"setLeaderboardManager"`
 */
export const writeChainBrawlerCleanSetLeaderboardManager =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'setLeaderboardManager',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"setLeaderboardTreasury"`
 */
export const writeChainBrawlerCleanSetLeaderboardTreasury =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'setLeaderboardTreasury',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"withdraw"`
 */
export const writeChainBrawlerCleanWithdraw = /*#__PURE__*/ createWriteContract(
  { abi: chainBrawlerCleanAbi, functionName: 'withdraw' },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__
 */
export const simulateChainBrawlerClean = /*#__PURE__*/ createSimulateContract({
  abi: chainBrawlerCleanAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"continueFight"`
 */
export const simulateChainBrawlerCleanContinueFight =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'continueFight',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"createCharacter"`
 */
export const simulateChainBrawlerCleanCreateCharacter =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'createCharacter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"fightEnemy"`
 */
export const simulateChainBrawlerCleanFightEnemy =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'fightEnemy',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"fleeRound"`
 */
export const simulateChainBrawlerCleanFleeRound =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'fleeRound',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"grantRole"`
 */
export const simulateChainBrawlerCleanGrantRole =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"healCharacter"`
 */
export const simulateChainBrawlerCleanHealCharacter =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'healCharacter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"renounceRole"`
 */
export const simulateChainBrawlerCleanRenounceRole =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"resurrectCharacter"`
 */
export const simulateChainBrawlerCleanResurrectCharacter =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'resurrectCharacter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"revokeRole"`
 */
export const simulateChainBrawlerCleanRevokeRole =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"setLeaderboardManager"`
 */
export const simulateChainBrawlerCleanSetLeaderboardManager =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'setLeaderboardManager',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"setLeaderboardTreasury"`
 */
export const simulateChainBrawlerCleanSetLeaderboardTreasury =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'setLeaderboardTreasury',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `functionName` set to `"withdraw"`
 */
export const simulateChainBrawlerCleanWithdraw =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerCleanAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__
 */
export const watchChainBrawlerCleanEvent =
  /*#__PURE__*/ createWatchContractEvent({ abi: chainBrawlerCleanAbi })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"CharacterCreated"`
 */
export const watchChainBrawlerCleanCharacterCreatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'CharacterCreated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"CharacterHealed"`
 */
export const watchChainBrawlerCleanCharacterHealedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'CharacterHealed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"CharacterResurrected"`
 */
export const watchChainBrawlerCleanCharacterResurrectedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'CharacterResurrected',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"ClassBaseUpdated"`
 */
export const watchChainBrawlerCleanClassBaseUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'ClassBaseUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"DifficultyMultiplierApplied"`
 */
export const watchChainBrawlerCleanDifficultyMultiplierAppliedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'DifficultyMultiplierApplied',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"EnemiesPopulated"`
 */
export const watchChainBrawlerCleanEnemiesPopulatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'EnemiesPopulated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"EnemyUpdated"`
 */
export const watchChainBrawlerCleanEnemyUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'EnemyUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"EquipmentDropped"`
 */
export const watchChainBrawlerCleanEquipmentDroppedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'EquipmentDropped',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"FeeDistributed"`
 */
export const watchChainBrawlerCleanFeeDistributedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'FeeDistributed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"FightRecorded"`
 */
export const watchChainBrawlerCleanFightRecordedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'FightRecorded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"FightSummary"`
 */
export const watchChainBrawlerCleanFightSummaryEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'FightSummary',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"FightXPReward"`
 */
export const watchChainBrawlerCleanFightXpRewardEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'FightXPReward',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"GasRefundIssued"`
 */
export const watchChainBrawlerCleanGasRefundIssuedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'GasRefundIssued',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"LevelUp"`
 */
export const watchChainBrawlerCleanLevelUpEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'LevelUp',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const watchChainBrawlerCleanRoleAdminChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const watchChainBrawlerCleanRoleGrantedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const watchChainBrawlerCleanRoleRevokedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerCleanAbi}__ and `eventName` set to `"TreasuryUpdated"`
 */
export const watchChainBrawlerCleanTreasuryUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerCleanAbi,
    eventName: 'TreasuryUpdated',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__
 */
export const readChainBrawlerState = /*#__PURE__*/ createReadContract({
  abi: chainBrawlerStateAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"currentEpoch"`
 */
export const readChainBrawlerStateCurrentEpoch =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'currentEpoch',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"developerFund"`
 */
export const readChainBrawlerStateDeveloperFund =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'developerFund',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"emergencyReserve"`
 */
export const readChainBrawlerStateEmergencyReserve =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'emergencyReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"epochDuration"`
 */
export const readChainBrawlerStateEpochDuration =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'epochDuration',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"epochRefundsUsed"`
 */
export const readChainBrawlerStateEpochRefundsUsed =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'epochRefundsUsed',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"epochScores"`
 */
export const readChainBrawlerStateEpochScores =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'epochScores',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"epochStartTime"`
 */
export const readChainBrawlerStateEpochStartTime =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'epochStartTime',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"epochState"`
 */
export const readChainBrawlerStateEpochState = /*#__PURE__*/ createReadContract(
  { abi: chainBrawlerStateAbi, functionName: 'epochState' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"equipmentRewardPool"`
 */
export const readChainBrawlerStateEquipmentRewardPool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'equipmentRewardPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"gasRefundCapPerFight"`
 */
export const readChainBrawlerStateGasRefundCapPerFight =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'gasRefundCapPerFight',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"gasRefundConfig"`
 */
export const readChainBrawlerStateGasRefundConfig =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'gasRefundConfig',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"gasRefundPool"`
 */
export const readChainBrawlerStateGasRefundPool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'gasRefundPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"lowLevelThreshold"`
 */
export const readChainBrawlerStateLowLevelThreshold =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'lowLevelThreshold',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"nextEpochReserve"`
 */
export const readChainBrawlerStateNextEpochReserve =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'nextEpochReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"perEpochRefundCapPerAccount"`
 */
export const readChainBrawlerStatePerEpochRefundCapPerAccount =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'perEpochRefundCapPerAccount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"prizePool"`
 */
export const readChainBrawlerStatePrizePool = /*#__PURE__*/ createReadContract({
  abi: chainBrawlerStateAbi,
  functionName: 'prizePool',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"treasury"`
 */
export const readChainBrawlerStateTreasury = /*#__PURE__*/ createReadContract({
  abi: chainBrawlerStateAbi,
  functionName: 'treasury',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `functionName` set to `"treasuryState"`
 */
export const readChainBrawlerStateTreasuryState =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerStateAbi,
    functionName: 'treasuryState',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerStateAbi}__
 */
export const watchChainBrawlerStateEvent =
  /*#__PURE__*/ createWatchContractEvent({ abi: chainBrawlerStateAbi })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `eventName` set to `"ClassBaseUpdated"`
 */
export const watchChainBrawlerStateClassBaseUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerStateAbi,
    eventName: 'ClassBaseUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `eventName` set to `"DifficultyMultiplierApplied"`
 */
export const watchChainBrawlerStateDifficultyMultiplierAppliedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerStateAbi,
    eventName: 'DifficultyMultiplierApplied',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `eventName` set to `"EnemiesPopulated"`
 */
export const watchChainBrawlerStateEnemiesPopulatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerStateAbi,
    eventName: 'EnemiesPopulated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `eventName` set to `"EnemyUpdated"`
 */
export const watchChainBrawlerStateEnemyUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerStateAbi,
    eventName: 'EnemyUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `eventName` set to `"FightRecorded"`
 */
export const watchChainBrawlerStateFightRecordedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerStateAbi,
    eventName: 'FightRecorded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `eventName` set to `"FightSummary"`
 */
export const watchChainBrawlerStateFightSummaryEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerStateAbi,
    eventName: 'FightSummary',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `eventName` set to `"FightXPReward"`
 */
export const watchChainBrawlerStateFightXpRewardEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerStateAbi,
    eventName: 'FightXPReward',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `eventName` set to `"GasRefundIssued"`
 */
export const watchChainBrawlerStateGasRefundIssuedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerStateAbi,
    eventName: 'GasRefundIssued',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerStateAbi}__ and `eventName` set to `"TreasuryUpdated"`
 */
export const watchChainBrawlerStateTreasuryUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerStateAbi,
    eventName: 'TreasuryUpdated',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__
 */
export const readChainBrawlerTestHelpersForTests =
  /*#__PURE__*/ createReadContract({ abi: chainBrawlerTestHelpersForTestsAbi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const readChainBrawlerTestHelpersForTestsDefaultAdminRole =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"MAX_DROP_RATE_BP"`
 */
export const readChainBrawlerTestHelpersForTestsMaxDropRateBp =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'MAX_DROP_RATE_BP',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"canContinueFight"`
 */
export const readChainBrawlerTestHelpersForTestsCanContinueFight =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'canContinueFight',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"canFight"`
 */
export const readChainBrawlerTestHelpersForTestsCanFight =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'canFight',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"canHeal"`
 */
export const readChainBrawlerTestHelpersForTestsCanHeal =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'canHeal',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"canResurrect"`
 */
export const readChainBrawlerTestHelpersForTestsCanResurrect =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'canResurrect',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"currentEpoch"`
 */
export const readChainBrawlerTestHelpersForTestsCurrentEpoch =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'currentEpoch',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"developerFund"`
 */
export const readChainBrawlerTestHelpersForTestsDeveloperFund =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'developerFund',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"emergencyReserve"`
 */
export const readChainBrawlerTestHelpersForTestsEmergencyReserve =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'emergencyReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"epochDuration"`
 */
export const readChainBrawlerTestHelpersForTestsEpochDuration =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'epochDuration',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"epochRefundsUsed"`
 */
export const readChainBrawlerTestHelpersForTestsEpochRefundsUsed =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'epochRefundsUsed',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"epochScores"`
 */
export const readChainBrawlerTestHelpersForTestsEpochScores =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'epochScores',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"epochStartTime"`
 */
export const readChainBrawlerTestHelpersForTestsEpochStartTime =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'epochStartTime',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"epochState"`
 */
export const readChainBrawlerTestHelpersForTestsEpochState =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'epochState',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"equipmentRewardPool"`
 */
export const readChainBrawlerTestHelpersForTestsEquipmentRewardPool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'equipmentRewardPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"gasRefundCapPerFight"`
 */
export const readChainBrawlerTestHelpersForTestsGasRefundCapPerFight =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'gasRefundCapPerFight',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"gasRefundConfig"`
 */
export const readChainBrawlerTestHelpersForTestsGasRefundConfig =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'gasRefundConfig',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"gasRefundPool"`
 */
export const readChainBrawlerTestHelpersForTestsGasRefundPool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'gasRefundPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getAllPoolData"`
 */
export const readChainBrawlerTestHelpersForTestsGetAllPoolData =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getAllPoolData',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getCharacter"`
 */
export const readChainBrawlerTestHelpersForTestsGetCharacter =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getCharacter',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getClassBase"`
 */
export const readChainBrawlerTestHelpersForTestsGetClassBase =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getClassBase',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getCombatState"`
 */
export const readChainBrawlerTestHelpersForTestsGetCombatState =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getCombatState',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getCreationFee"`
 */
export const readChainBrawlerTestHelpersForTestsGetCreationFee =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getCreationFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getCurrentEpoch"`
 */
export const readChainBrawlerTestHelpersForTestsGetCurrentEpoch =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getCurrentEpoch',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getDeveloperFund"`
 */
export const readChainBrawlerTestHelpersForTestsGetDeveloperFund =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getDeveloperFund',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getEffectiveCurrentEndurance"`
 */
export const readChainBrawlerTestHelpersForTestsGetEffectiveCurrentEndurance =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getEffectiveCurrentEndurance',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getEmergencyReserve"`
 */
export const readChainBrawlerTestHelpersForTestsGetEmergencyReserve =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getEmergencyReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getEpochDuration"`
 */
export const readChainBrawlerTestHelpersForTestsGetEpochDuration =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getEpochDuration',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getEpochScore"`
 */
export const readChainBrawlerTestHelpersForTestsGetEpochScore =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getEpochScore',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getEpochStartTime"`
 */
export const readChainBrawlerTestHelpersForTestsGetEpochStartTime =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getEpochStartTime',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getEpochTimeRemaining"`
 */
export const readChainBrawlerTestHelpersForTestsGetEpochTimeRemaining =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getEpochTimeRemaining',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getEquipmentRewardPool"`
 */
export const readChainBrawlerTestHelpersForTestsGetEquipmentRewardPool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getEquipmentRewardPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getGasRefundPool"`
 */
export const readChainBrawlerTestHelpersForTestsGetGasRefundPool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getGasRefundPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getHealingCooldown"`
 */
export const readChainBrawlerTestHelpersForTestsGetHealingCooldown =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getHealingCooldown',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getHealingCooldownRemaining"`
 */
export const readChainBrawlerTestHelpersForTestsGetHealingCooldownRemaining =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getHealingCooldownRemaining',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getHealingFee"`
 */
export const readChainBrawlerTestHelpersForTestsGetHealingFee =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getHealingFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getNextEpochReserve"`
 */
export const readChainBrawlerTestHelpersForTestsGetNextEpochReserve =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getNextEpochReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getPendingPassiveRegeneration"`
 */
export const readChainBrawlerTestHelpersForTestsGetPendingPassiveRegeneration =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getPendingPassiveRegeneration',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getPlayerByIndex"`
 */
export const readChainBrawlerTestHelpersForTestsGetPlayerByIndex =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getPlayerByIndex',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getPrizePool"`
 */
export const readChainBrawlerTestHelpersForTestsGetPrizePool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getPrizePool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getRegenWindow"`
 */
export const readChainBrawlerTestHelpersForTestsGetRegenWindow =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getRegenWindow',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getResurrectionFee"`
 */
export const readChainBrawlerTestHelpersForTestsGetResurrectionFee =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getResurrectionFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const readChainBrawlerTestHelpersForTestsGetRoleAdmin =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getScaledEnemyStats"`
 */
export const readChainBrawlerTestHelpersForTestsGetScaledEnemyStats =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getScaledEnemyStats',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getTotalPlayerCount"`
 */
export const readChainBrawlerTestHelpersForTestsGetTotalPlayerCount =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getTotalPlayerCount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"getXPRequiredForLevel"`
 */
export const readChainBrawlerTestHelpersForTestsGetXpRequiredForLevel =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'getXPRequiredForLevel',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"hasRole"`
 */
export const readChainBrawlerTestHelpersForTestsHasRole =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"isCharacterInCombat"`
 */
export const readChainBrawlerTestHelpersForTestsIsCharacterInCombat =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'isCharacterInCombat',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"leaderboardManager"`
 */
export const readChainBrawlerTestHelpersForTestsLeaderboardManager =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'leaderboardManager',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"leaderboardTreasury"`
 */
export const readChainBrawlerTestHelpersForTestsLeaderboardTreasury =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'leaderboardTreasury',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"lowLevelThreshold"`
 */
export const readChainBrawlerTestHelpersForTestsLowLevelThreshold =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'lowLevelThreshold',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"nextEpochReserve"`
 */
export const readChainBrawlerTestHelpersForTestsNextEpochReserve =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'nextEpochReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"perEpochRefundCapPerAccount"`
 */
export const readChainBrawlerTestHelpersForTestsPerEpochRefundCapPerAccount =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'perEpochRefundCapPerAccount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"prizePool"`
 */
export const readChainBrawlerTestHelpersForTestsPrizePool =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'prizePool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const readChainBrawlerTestHelpersForTestsSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"treasury"`
 */
export const readChainBrawlerTestHelpersForTestsTreasury =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'treasury',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"treasuryState"`
 */
export const readChainBrawlerTestHelpersForTestsTreasuryState =
  /*#__PURE__*/ createReadContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'treasuryState',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__
 */
export const writeChainBrawlerTestHelpersForTests =
  /*#__PURE__*/ createWriteContract({ abi: chainBrawlerTestHelpersForTestsAbi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"continueFight"`
 */
export const writeChainBrawlerTestHelpersForTestsContinueFight =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'continueFight',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"createCharacter"`
 */
export const writeChainBrawlerTestHelpersForTestsCreateCharacter =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'createCharacter',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"fightEnemy"`
 */
export const writeChainBrawlerTestHelpersForTestsFightEnemy =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'fightEnemy',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"fleeRound"`
 */
export const writeChainBrawlerTestHelpersForTestsFleeRound =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'fleeRound',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"grantRole"`
 */
export const writeChainBrawlerTestHelpersForTestsGrantRole =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"healCharacter"`
 */
export const writeChainBrawlerTestHelpersForTestsHealCharacter =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'healCharacter',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"renounceRole"`
 */
export const writeChainBrawlerTestHelpersForTestsRenounceRole =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"resurrectCharacter"`
 */
export const writeChainBrawlerTestHelpersForTestsResurrectCharacter =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'resurrectCharacter',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"revokeRole"`
 */
export const writeChainBrawlerTestHelpersForTestsRevokeRole =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"setEnemyBase"`
 */
export const writeChainBrawlerTestHelpersForTestsSetEnemyBase =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'setEnemyBase',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"setLeaderboardManager"`
 */
export const writeChainBrawlerTestHelpersForTestsSetLeaderboardManager =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'setLeaderboardManager',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"setLeaderboardTreasury"`
 */
export const writeChainBrawlerTestHelpersForTestsSetLeaderboardTreasury =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'setLeaderboardTreasury',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"setPackedCharacter"`
 */
export const writeChainBrawlerTestHelpersForTestsSetPackedCharacter =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'setPackedCharacter',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"setTreasury"`
 */
export const writeChainBrawlerTestHelpersForTestsSetTreasury =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"withdraw"`
 */
export const writeChainBrawlerTestHelpersForTestsWithdraw =
  /*#__PURE__*/ createWriteContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__
 */
export const simulateChainBrawlerTestHelpersForTests =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"continueFight"`
 */
export const simulateChainBrawlerTestHelpersForTestsContinueFight =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'continueFight',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"createCharacter"`
 */
export const simulateChainBrawlerTestHelpersForTestsCreateCharacter =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'createCharacter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"fightEnemy"`
 */
export const simulateChainBrawlerTestHelpersForTestsFightEnemy =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'fightEnemy',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"fleeRound"`
 */
export const simulateChainBrawlerTestHelpersForTestsFleeRound =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'fleeRound',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"grantRole"`
 */
export const simulateChainBrawlerTestHelpersForTestsGrantRole =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"healCharacter"`
 */
export const simulateChainBrawlerTestHelpersForTestsHealCharacter =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'healCharacter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"renounceRole"`
 */
export const simulateChainBrawlerTestHelpersForTestsRenounceRole =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"resurrectCharacter"`
 */
export const simulateChainBrawlerTestHelpersForTestsResurrectCharacter =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'resurrectCharacter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"revokeRole"`
 */
export const simulateChainBrawlerTestHelpersForTestsRevokeRole =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"setEnemyBase"`
 */
export const simulateChainBrawlerTestHelpersForTestsSetEnemyBase =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'setEnemyBase',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"setLeaderboardManager"`
 */
export const simulateChainBrawlerTestHelpersForTestsSetLeaderboardManager =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'setLeaderboardManager',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"setLeaderboardTreasury"`
 */
export const simulateChainBrawlerTestHelpersForTestsSetLeaderboardTreasury =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'setLeaderboardTreasury',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"setPackedCharacter"`
 */
export const simulateChainBrawlerTestHelpersForTestsSetPackedCharacter =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'setPackedCharacter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"setTreasury"`
 */
export const simulateChainBrawlerTestHelpersForTestsSetTreasury =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `functionName` set to `"withdraw"`
 */
export const simulateChainBrawlerTestHelpersForTestsWithdraw =
  /*#__PURE__*/ createSimulateContract({
    abi: chainBrawlerTestHelpersForTestsAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__
 */
export const watchChainBrawlerTestHelpersForTestsEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"CharacterCreated"`
 */
export const watchChainBrawlerTestHelpersForTestsCharacterCreatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'CharacterCreated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"CharacterHealed"`
 */
export const watchChainBrawlerTestHelpersForTestsCharacterHealedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'CharacterHealed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"CharacterResurrected"`
 */
export const watchChainBrawlerTestHelpersForTestsCharacterResurrectedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'CharacterResurrected',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"ClassBaseUpdated"`
 */
export const watchChainBrawlerTestHelpersForTestsClassBaseUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'ClassBaseUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"DifficultyMultiplierApplied"`
 */
export const watchChainBrawlerTestHelpersForTestsDifficultyMultiplierAppliedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'DifficultyMultiplierApplied',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"EnemiesPopulated"`
 */
export const watchChainBrawlerTestHelpersForTestsEnemiesPopulatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'EnemiesPopulated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"EnemyUpdated"`
 */
export const watchChainBrawlerTestHelpersForTestsEnemyUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'EnemyUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"EquipmentDropped"`
 */
export const watchChainBrawlerTestHelpersForTestsEquipmentDroppedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'EquipmentDropped',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"FeeDistributed"`
 */
export const watchChainBrawlerTestHelpersForTestsFeeDistributedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'FeeDistributed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"FightRecorded"`
 */
export const watchChainBrawlerTestHelpersForTestsFightRecordedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'FightRecorded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"FightSummary"`
 */
export const watchChainBrawlerTestHelpersForTestsFightSummaryEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'FightSummary',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"FightXPReward"`
 */
export const watchChainBrawlerTestHelpersForTestsFightXpRewardEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'FightXPReward',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"GasRefundIssued"`
 */
export const watchChainBrawlerTestHelpersForTestsGasRefundIssuedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'GasRefundIssued',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"LevelUp"`
 */
export const watchChainBrawlerTestHelpersForTestsLevelUpEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'LevelUp',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const watchChainBrawlerTestHelpersForTestsRoleAdminChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const watchChainBrawlerTestHelpersForTestsRoleGrantedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const watchChainBrawlerTestHelpersForTestsRoleRevokedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link chainBrawlerTestHelpersForTestsAbi}__ and `eventName` set to `"TreasuryUpdated"`
 */
export const watchChainBrawlerTestHelpersForTestsTreasuryUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: chainBrawlerTestHelpersForTestsAbi,
    eventName: 'TreasuryUpdated',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatConfigTesterAbi}__
 */
export const readCombatConfigTester = /*#__PURE__*/ createReadContract({
  abi: combatConfigTesterAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatConfigTesterAbi}__ and `functionName` set to `"baseStatsByClass"`
 */
export const readCombatConfigTesterBaseStatsByClass =
  /*#__PURE__*/ createReadContract({
    abi: combatConfigTesterAbi,
    functionName: 'baseStatsByClass',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatConfigTesterAbi}__ and `functionName` set to `"enemyBaseById"`
 */
export const readCombatConfigTesterEnemyBaseById =
  /*#__PURE__*/ createReadContract({
    abi: combatConfigTesterAbi,
    functionName: 'enemyBaseById',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatConfigTesterAbi}__ and `functionName` set to `"levelScalingBP"`
 */
export const readCombatConfigTesterLevelScalingBp =
  /*#__PURE__*/ createReadContract({
    abi: combatConfigTesterAbi,
    functionName: 'levelScalingBP',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__
 */
export const readCombatEngine = /*#__PURE__*/ createReadContract({
  abi: combatEngineAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"currentEpoch"`
 */
export const readCombatEngineCurrentEpoch = /*#__PURE__*/ createReadContract({
  abi: combatEngineAbi,
  functionName: 'currentEpoch',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"developerFund"`
 */
export const readCombatEngineDeveloperFund = /*#__PURE__*/ createReadContract({
  abi: combatEngineAbi,
  functionName: 'developerFund',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"emergencyReserve"`
 */
export const readCombatEngineEmergencyReserve =
  /*#__PURE__*/ createReadContract({
    abi: combatEngineAbi,
    functionName: 'emergencyReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"epochDuration"`
 */
export const readCombatEngineEpochDuration = /*#__PURE__*/ createReadContract({
  abi: combatEngineAbi,
  functionName: 'epochDuration',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"epochRefundsUsed"`
 */
export const readCombatEngineEpochRefundsUsed =
  /*#__PURE__*/ createReadContract({
    abi: combatEngineAbi,
    functionName: 'epochRefundsUsed',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"epochScores"`
 */
export const readCombatEngineEpochScores = /*#__PURE__*/ createReadContract({
  abi: combatEngineAbi,
  functionName: 'epochScores',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"epochStartTime"`
 */
export const readCombatEngineEpochStartTime = /*#__PURE__*/ createReadContract({
  abi: combatEngineAbi,
  functionName: 'epochStartTime',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"epochState"`
 */
export const readCombatEngineEpochState = /*#__PURE__*/ createReadContract({
  abi: combatEngineAbi,
  functionName: 'epochState',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"equipmentRewardPool"`
 */
export const readCombatEngineEquipmentRewardPool =
  /*#__PURE__*/ createReadContract({
    abi: combatEngineAbi,
    functionName: 'equipmentRewardPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"gasRefundCapPerFight"`
 */
export const readCombatEngineGasRefundCapPerFight =
  /*#__PURE__*/ createReadContract({
    abi: combatEngineAbi,
    functionName: 'gasRefundCapPerFight',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"gasRefundConfig"`
 */
export const readCombatEngineGasRefundConfig = /*#__PURE__*/ createReadContract(
  { abi: combatEngineAbi, functionName: 'gasRefundConfig' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"gasRefundPool"`
 */
export const readCombatEngineGasRefundPool = /*#__PURE__*/ createReadContract({
  abi: combatEngineAbi,
  functionName: 'gasRefundPool',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"lowLevelThreshold"`
 */
export const readCombatEngineLowLevelThreshold =
  /*#__PURE__*/ createReadContract({
    abi: combatEngineAbi,
    functionName: 'lowLevelThreshold',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"nextEpochReserve"`
 */
export const readCombatEngineNextEpochReserve =
  /*#__PURE__*/ createReadContract({
    abi: combatEngineAbi,
    functionName: 'nextEpochReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"perEpochRefundCapPerAccount"`
 */
export const readCombatEnginePerEpochRefundCapPerAccount =
  /*#__PURE__*/ createReadContract({
    abi: combatEngineAbi,
    functionName: 'perEpochRefundCapPerAccount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"prizePool"`
 */
export const readCombatEnginePrizePool = /*#__PURE__*/ createReadContract({
  abi: combatEngineAbi,
  functionName: 'prizePool',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"treasury"`
 */
export const readCombatEngineTreasury = /*#__PURE__*/ createReadContract({
  abi: combatEngineAbi,
  functionName: 'treasury',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatEngineAbi}__ and `functionName` set to `"treasuryState"`
 */
export const readCombatEngineTreasuryState = /*#__PURE__*/ createReadContract({
  abi: combatEngineAbi,
  functionName: 'treasuryState',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link combatEngineAbi}__
 */
export const watchCombatEngineEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: combatEngineAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link combatEngineAbi}__ and `eventName` set to `"ClassBaseUpdated"`
 */
export const watchCombatEngineClassBaseUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: combatEngineAbi,
    eventName: 'ClassBaseUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link combatEngineAbi}__ and `eventName` set to `"DifficultyMultiplierApplied"`
 */
export const watchCombatEngineDifficultyMultiplierAppliedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: combatEngineAbi,
    eventName: 'DifficultyMultiplierApplied',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link combatEngineAbi}__ and `eventName` set to `"EnemiesPopulated"`
 */
export const watchCombatEngineEnemiesPopulatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: combatEngineAbi,
    eventName: 'EnemiesPopulated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link combatEngineAbi}__ and `eventName` set to `"EnemyUpdated"`
 */
export const watchCombatEngineEnemyUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: combatEngineAbi,
    eventName: 'EnemyUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link combatEngineAbi}__ and `eventName` set to `"FightRecorded"`
 */
export const watchCombatEngineFightRecordedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: combatEngineAbi,
    eventName: 'FightRecorded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link combatEngineAbi}__ and `eventName` set to `"FightSummary"`
 */
export const watchCombatEngineFightSummaryEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: combatEngineAbi,
    eventName: 'FightSummary',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link combatEngineAbi}__ and `eventName` set to `"FightXPReward"`
 */
export const watchCombatEngineFightXpRewardEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: combatEngineAbi,
    eventName: 'FightXPReward',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link combatEngineAbi}__ and `eventName` set to `"GasRefundIssued"`
 */
export const watchCombatEngineGasRefundIssuedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: combatEngineAbi,
    eventName: 'GasRefundIssued',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link combatEngineAbi}__ and `eventName` set to `"TreasuryUpdated"`
 */
export const watchCombatEngineTreasuryUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: combatEngineAbi,
    eventName: 'TreasuryUpdated',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatMathTestAbi}__
 */
export const readCombatMathTest = /*#__PURE__*/ createReadContract({
  abi: combatMathTestAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatMathTestAbi}__ and `functionName` set to `"calculateCombatIndex"`
 */
export const readCombatMathTestCalculateCombatIndex =
  /*#__PURE__*/ createReadContract({
    abi: combatMathTestAbi,
    functionName: 'calculateCombatIndex',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatMathTestAbi}__ and `functionName` set to `"calculateDifficultyMultiplier"`
 */
export const readCombatMathTestCalculateDifficultyMultiplier =
  /*#__PURE__*/ createReadContract({
    abi: combatMathTestAbi,
    functionName: 'calculateDifficultyMultiplier',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatMathTesterAbi}__
 */
export const readCombatMathTester = /*#__PURE__*/ createReadContract({
  abi: combatMathTesterAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatMathTesterAbi}__ and `functionName` set to `"performRound"`
 */
export const readCombatMathTesterPerformRound =
  /*#__PURE__*/ createReadContract({
    abi: combatMathTesterAbi,
    functionName: 'performRound',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link combatMathTesterAbi}__ and `functionName` set to `"scaleEnemyForLevel"`
 */
export const readCombatMathTesterScaleEnemyForLevel =
  /*#__PURE__*/ createReadContract({
    abi: combatMathTesterAbi,
    functionName: 'scaleEnemyForLevel',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc165Abi}__
 */
export const readErc165 = /*#__PURE__*/ createReadContract({ abi: erc165Abi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc165Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const readErc165SupportsInterface = /*#__PURE__*/ createReadContract({
  abi: erc165Abi,
  functionName: 'supportsInterface',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link helpersForTestsAbi}__
 */
export const readHelpersForTests = /*#__PURE__*/ createReadContract({
  abi: helpersForTestsAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link helpersForTestsAbi}__ and `functionName` set to `"clampToMask"`
 */
export const readHelpersForTestsClampToMask = /*#__PURE__*/ createReadContract({
  abi: helpersForTestsAbi,
  functionName: 'clampToMask',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link helpersForTestsAbi}__ and `functionName` set to `"generateNewCharacter"`
 */
export const readHelpersForTestsGenerateNewCharacter =
  /*#__PURE__*/ createReadContract({
    abi: helpersForTestsAbi,
    functionName: 'generateNewCharacter',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link helpersForTestsAbi}__ and `functionName` set to `"writeClamped"`
 */
export const readHelpersForTestsWriteClamped = /*#__PURE__*/ createReadContract(
  { abi: helpersForTestsAbi, functionName: 'writeClamped' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iAccessControlAbi}__
 */
export const readIAccessControl = /*#__PURE__*/ createReadContract({
  abi: iAccessControlAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iAccessControlAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const readIAccessControlGetRoleAdmin = /*#__PURE__*/ createReadContract({
  abi: iAccessControlAbi,
  functionName: 'getRoleAdmin',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iAccessControlAbi}__ and `functionName` set to `"hasRole"`
 */
export const readIAccessControlHasRole = /*#__PURE__*/ createReadContract({
  abi: iAccessControlAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iAccessControlAbi}__
 */
export const writeIAccessControl = /*#__PURE__*/ createWriteContract({
  abi: iAccessControlAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iAccessControlAbi}__ and `functionName` set to `"grantRole"`
 */
export const writeIAccessControlGrantRole = /*#__PURE__*/ createWriteContract({
  abi: iAccessControlAbi,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iAccessControlAbi}__ and `functionName` set to `"renounceRole"`
 */
export const writeIAccessControlRenounceRole =
  /*#__PURE__*/ createWriteContract({
    abi: iAccessControlAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iAccessControlAbi}__ and `functionName` set to `"revokeRole"`
 */
export const writeIAccessControlRevokeRole = /*#__PURE__*/ createWriteContract({
  abi: iAccessControlAbi,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iAccessControlAbi}__
 */
export const simulateIAccessControl = /*#__PURE__*/ createSimulateContract({
  abi: iAccessControlAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iAccessControlAbi}__ and `functionName` set to `"grantRole"`
 */
export const simulateIAccessControlGrantRole =
  /*#__PURE__*/ createSimulateContract({
    abi: iAccessControlAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iAccessControlAbi}__ and `functionName` set to `"renounceRole"`
 */
export const simulateIAccessControlRenounceRole =
  /*#__PURE__*/ createSimulateContract({
    abi: iAccessControlAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iAccessControlAbi}__ and `functionName` set to `"revokeRole"`
 */
export const simulateIAccessControlRevokeRole =
  /*#__PURE__*/ createSimulateContract({
    abi: iAccessControlAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iAccessControlAbi}__
 */
export const watchIAccessControlEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: iAccessControlAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iAccessControlAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const watchIAccessControlRoleAdminChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: iAccessControlAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iAccessControlAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const watchIAccessControlRoleGrantedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: iAccessControlAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iAccessControlAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const watchIAccessControlRoleRevokedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: iAccessControlAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__
 */
export const readIChainBrawlerUi = /*#__PURE__*/ createReadContract({
  abi: iChainBrawlerUiAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"getCharacter"`
 */
export const readIChainBrawlerUiGetCharacter = /*#__PURE__*/ createReadContract(
  { abi: iChainBrawlerUiAbi, functionName: 'getCharacter' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"getCombatState"`
 */
export const readIChainBrawlerUiGetCombatState =
  /*#__PURE__*/ createReadContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'getCombatState',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"getCreationFee"`
 */
export const readIChainBrawlerUiGetCreationFee =
  /*#__PURE__*/ createReadContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'getCreationFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"getHealingFee"`
 */
export const readIChainBrawlerUiGetHealingFee =
  /*#__PURE__*/ createReadContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'getHealingFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"getResurrectionFee"`
 */
export const readIChainBrawlerUiGetResurrectionFee =
  /*#__PURE__*/ createReadContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'getResurrectionFee',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"getXPRequiredForLevel"`
 */
export const readIChainBrawlerUiGetXpRequiredForLevel =
  /*#__PURE__*/ createReadContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'getXPRequiredForLevel',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"isCharacterInCombat"`
 */
export const readIChainBrawlerUiIsCharacterInCombat =
  /*#__PURE__*/ createReadContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'isCharacterInCombat',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__
 */
export const writeIChainBrawlerUi = /*#__PURE__*/ createWriteContract({
  abi: iChainBrawlerUiAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"continueFight"`
 */
export const writeIChainBrawlerUiContinueFight =
  /*#__PURE__*/ createWriteContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'continueFight',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"createCharacter"`
 */
export const writeIChainBrawlerUiCreateCharacter =
  /*#__PURE__*/ createWriteContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'createCharacter',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"fightEnemy"`
 */
export const writeIChainBrawlerUiFightEnemy = /*#__PURE__*/ createWriteContract(
  { abi: iChainBrawlerUiAbi, functionName: 'fightEnemy' },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"fleeRound"`
 */
export const writeIChainBrawlerUiFleeRound = /*#__PURE__*/ createWriteContract({
  abi: iChainBrawlerUiAbi,
  functionName: 'fleeRound',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"healCharacter"`
 */
export const writeIChainBrawlerUiHealCharacter =
  /*#__PURE__*/ createWriteContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'healCharacter',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"resurrectCharacter"`
 */
export const writeIChainBrawlerUiResurrectCharacter =
  /*#__PURE__*/ createWriteContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'resurrectCharacter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__
 */
export const simulateIChainBrawlerUi = /*#__PURE__*/ createSimulateContract({
  abi: iChainBrawlerUiAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"continueFight"`
 */
export const simulateIChainBrawlerUiContinueFight =
  /*#__PURE__*/ createSimulateContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'continueFight',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"createCharacter"`
 */
export const simulateIChainBrawlerUiCreateCharacter =
  /*#__PURE__*/ createSimulateContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'createCharacter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"fightEnemy"`
 */
export const simulateIChainBrawlerUiFightEnemy =
  /*#__PURE__*/ createSimulateContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'fightEnemy',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"fleeRound"`
 */
export const simulateIChainBrawlerUiFleeRound =
  /*#__PURE__*/ createSimulateContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'fleeRound',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"healCharacter"`
 */
export const simulateIChainBrawlerUiHealCharacter =
  /*#__PURE__*/ createSimulateContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'healCharacter',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `functionName` set to `"resurrectCharacter"`
 */
export const simulateIChainBrawlerUiResurrectCharacter =
  /*#__PURE__*/ createSimulateContract({
    abi: iChainBrawlerUiAbi,
    functionName: 'resurrectCharacter',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iChainBrawlerUiAbi}__
 */
export const watchIChainBrawlerUiEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: iChainBrawlerUiAbi },
)

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `eventName` set to `"CharacterCreated"`
 */
export const watchIChainBrawlerUiCharacterCreatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: iChainBrawlerUiAbi,
    eventName: 'CharacterCreated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `eventName` set to `"CharacterHealed"`
 */
export const watchIChainBrawlerUiCharacterHealedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: iChainBrawlerUiAbi,
    eventName: 'CharacterHealed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `eventName` set to `"CharacterResurrected"`
 */
export const watchIChainBrawlerUiCharacterResurrectedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: iChainBrawlerUiAbi,
    eventName: 'CharacterResurrected',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `eventName` set to `"EquipmentDropped"`
 */
export const watchIChainBrawlerUiEquipmentDroppedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: iChainBrawlerUiAbi,
    eventName: 'EquipmentDropped',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iChainBrawlerUiAbi}__ and `eventName` set to `"LevelUp"`
 */
export const watchIChainBrawlerUiLevelUpEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: iChainBrawlerUiAbi,
    eventName: 'LevelUp',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iCharacterValidationAbi}__
 */
export const readICharacterValidation = /*#__PURE__*/ createReadContract({
  abi: iCharacterValidationAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iCharacterValidationAbi}__ and `functionName` set to `"canContinueFight"`
 */
export const readICharacterValidationCanContinueFight =
  /*#__PURE__*/ createReadContract({
    abi: iCharacterValidationAbi,
    functionName: 'canContinueFight',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iCharacterValidationAbi}__ and `functionName` set to `"canFight"`
 */
export const readICharacterValidationCanFight =
  /*#__PURE__*/ createReadContract({
    abi: iCharacterValidationAbi,
    functionName: 'canFight',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iCharacterValidationAbi}__ and `functionName` set to `"canHeal"`
 */
export const readICharacterValidationCanHeal = /*#__PURE__*/ createReadContract(
  { abi: iCharacterValidationAbi, functionName: 'canHeal' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iCharacterValidationAbi}__ and `functionName` set to `"canResurrect"`
 */
export const readICharacterValidationCanResurrect =
  /*#__PURE__*/ createReadContract({
    abi: iCharacterValidationAbi,
    functionName: 'canResurrect',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc165Abi}__
 */
export const readIerc165 = /*#__PURE__*/ createReadContract({ abi: ierc165Abi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link ierc165Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const readIerc165SupportsInterface = /*#__PURE__*/ createReadContract({
  abi: ierc165Abi,
  functionName: 'supportsInterface',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iLeaderboardInfoAbi}__
 */
export const readILeaderboardInfo = /*#__PURE__*/ createReadContract({
  abi: iLeaderboardInfoAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iLeaderboardInfoAbi}__ and `functionName` set to `"getCurrentEpoch"`
 */
export const readILeaderboardInfoGetCurrentEpoch =
  /*#__PURE__*/ createReadContract({
    abi: iLeaderboardInfoAbi,
    functionName: 'getCurrentEpoch',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iLeaderboardInfoAbi}__ and `functionName` set to `"getEpochScore"`
 */
export const readILeaderboardInfoGetEpochScore =
  /*#__PURE__*/ createReadContract({
    abi: iLeaderboardInfoAbi,
    functionName: 'getEpochScore',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iLeaderboardInfoAbi}__ and `functionName` set to `"getTotalPlayerCount"`
 */
export const readILeaderboardInfoGetTotalPlayerCount =
  /*#__PURE__*/ createReadContract({
    abi: iLeaderboardInfoAbi,
    functionName: 'getTotalPlayerCount',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iLeaderboardTreasuryAbi}__
 */
export const writeILeaderboardTreasury = /*#__PURE__*/ createWriteContract({
  abi: iLeaderboardTreasuryAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iLeaderboardTreasuryAbi}__ and `functionName` set to `"deposit"`
 */
export const writeILeaderboardTreasuryDeposit =
  /*#__PURE__*/ createWriteContract({
    abi: iLeaderboardTreasuryAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iLeaderboardTreasuryAbi}__ and `functionName` set to `"depositForEpoch"`
 */
export const writeILeaderboardTreasuryDepositForEpoch =
  /*#__PURE__*/ createWriteContract({
    abi: iLeaderboardTreasuryAbi,
    functionName: 'depositForEpoch',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iLeaderboardTreasuryAbi}__ and `functionName` set to `"distribute"`
 */
export const writeILeaderboardTreasuryDistribute =
  /*#__PURE__*/ createWriteContract({
    abi: iLeaderboardTreasuryAbi,
    functionName: 'distribute',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iLeaderboardTreasuryAbi}__ and `functionName` set to `"publishEpochRoot"`
 */
export const writeILeaderboardTreasuryPublishEpochRoot =
  /*#__PURE__*/ createWriteContract({
    abi: iLeaderboardTreasuryAbi,
    functionName: 'publishEpochRoot',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iLeaderboardTreasuryAbi}__
 */
export const simulateILeaderboardTreasury =
  /*#__PURE__*/ createSimulateContract({ abi: iLeaderboardTreasuryAbi })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iLeaderboardTreasuryAbi}__ and `functionName` set to `"deposit"`
 */
export const simulateILeaderboardTreasuryDeposit =
  /*#__PURE__*/ createSimulateContract({
    abi: iLeaderboardTreasuryAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iLeaderboardTreasuryAbi}__ and `functionName` set to `"depositForEpoch"`
 */
export const simulateILeaderboardTreasuryDepositForEpoch =
  /*#__PURE__*/ createSimulateContract({
    abi: iLeaderboardTreasuryAbi,
    functionName: 'depositForEpoch',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iLeaderboardTreasuryAbi}__ and `functionName` set to `"distribute"`
 */
export const simulateILeaderboardTreasuryDistribute =
  /*#__PURE__*/ createSimulateContract({
    abi: iLeaderboardTreasuryAbi,
    functionName: 'distribute',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link iLeaderboardTreasuryAbi}__ and `functionName` set to `"publishEpochRoot"`
 */
export const simulateILeaderboardTreasuryPublishEpochRoot =
  /*#__PURE__*/ createSimulateContract({
    abi: iLeaderboardTreasuryAbi,
    functionName: 'publishEpochRoot',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iTreasuryInfoAbi}__
 */
export const readITreasuryInfo = /*#__PURE__*/ createReadContract({
  abi: iTreasuryInfoAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iTreasuryInfoAbi}__ and `functionName` set to `"getAllPoolData"`
 */
export const readITreasuryInfoGetAllPoolData = /*#__PURE__*/ createReadContract(
  { abi: iTreasuryInfoAbi, functionName: 'getAllPoolData' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iTreasuryInfoAbi}__ and `functionName` set to `"getDeveloperFund"`
 */
export const readITreasuryInfoGetDeveloperFund =
  /*#__PURE__*/ createReadContract({
    abi: iTreasuryInfoAbi,
    functionName: 'getDeveloperFund',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iTreasuryInfoAbi}__ and `functionName` set to `"getEmergencyReserve"`
 */
export const readITreasuryInfoGetEmergencyReserve =
  /*#__PURE__*/ createReadContract({
    abi: iTreasuryInfoAbi,
    functionName: 'getEmergencyReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iTreasuryInfoAbi}__ and `functionName` set to `"getEquipmentRewardPool"`
 */
export const readITreasuryInfoGetEquipmentRewardPool =
  /*#__PURE__*/ createReadContract({
    abi: iTreasuryInfoAbi,
    functionName: 'getEquipmentRewardPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iTreasuryInfoAbi}__ and `functionName` set to `"getGasRefundPool"`
 */
export const readITreasuryInfoGetGasRefundPool =
  /*#__PURE__*/ createReadContract({
    abi: iTreasuryInfoAbi,
    functionName: 'getGasRefundPool',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iTreasuryInfoAbi}__ and `functionName` set to `"getNextEpochReserve"`
 */
export const readITreasuryInfoGetNextEpochReserve =
  /*#__PURE__*/ createReadContract({
    abi: iTreasuryInfoAbi,
    functionName: 'getNextEpochReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iTreasuryInfoAbi}__ and `functionName` set to `"getPrizePool"`
 */
export const readITreasuryInfoGetPrizePool = /*#__PURE__*/ createReadContract({
  abi: iTreasuryInfoAbi,
  functionName: 'getPrizePool',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardManagerAbi}__
 */
export const readLeaderboardManager = /*#__PURE__*/ createReadContract({
  abi: leaderboardManagerAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const readLeaderboardManagerDefaultAdminRole =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardManagerAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"PUBLISHER_ROLE"`
 */
export const readLeaderboardManagerPublisherRole =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardManagerAbi,
    functionName: 'PUBLISHER_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const readLeaderboardManagerGetRoleAdmin =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardManagerAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"hasRole"`
 */
export const readLeaderboardManagerHasRole = /*#__PURE__*/ createReadContract({
  abi: leaderboardManagerAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const readLeaderboardManagerSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardManagerAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"treasury"`
 */
export const readLeaderboardManagerTreasury = /*#__PURE__*/ createReadContract({
  abi: leaderboardManagerAbi,
  functionName: 'treasury',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardManagerAbi}__
 */
export const writeLeaderboardManager = /*#__PURE__*/ createWriteContract({
  abi: leaderboardManagerAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"grantRole"`
 */
export const writeLeaderboardManagerGrantRole =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardManagerAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"publishAndDistribute"`
 */
export const writeLeaderboardManagerPublishAndDistribute =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardManagerAbi,
    functionName: 'publishAndDistribute',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"publishAndFund"`
 */
export const writeLeaderboardManagerPublishAndFund =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardManagerAbi,
    functionName: 'publishAndFund',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const writeLeaderboardManagerRenounceRole =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardManagerAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const writeLeaderboardManagerRevokeRole =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardManagerAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"setTreasury"`
 */
export const writeLeaderboardManagerSetTreasury =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardManagerAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardManagerAbi}__
 */
export const simulateLeaderboardManager = /*#__PURE__*/ createSimulateContract({
  abi: leaderboardManagerAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"grantRole"`
 */
export const simulateLeaderboardManagerGrantRole =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardManagerAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"publishAndDistribute"`
 */
export const simulateLeaderboardManagerPublishAndDistribute =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardManagerAbi,
    functionName: 'publishAndDistribute',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"publishAndFund"`
 */
export const simulateLeaderboardManagerPublishAndFund =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardManagerAbi,
    functionName: 'publishAndFund',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const simulateLeaderboardManagerRenounceRole =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardManagerAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const simulateLeaderboardManagerRevokeRole =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardManagerAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `functionName` set to `"setTreasury"`
 */
export const simulateLeaderboardManagerSetTreasury =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardManagerAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardManagerAbi}__
 */
export const watchLeaderboardManagerEvent =
  /*#__PURE__*/ createWatchContractEvent({ abi: leaderboardManagerAbi })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `eventName` set to `"Published"`
 */
export const watchLeaderboardManagerPublishedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardManagerAbi,
    eventName: 'Published',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const watchLeaderboardManagerRoleAdminChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardManagerAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const watchLeaderboardManagerRoleGrantedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardManagerAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardManagerAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const watchLeaderboardManagerRoleRevokedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardManagerAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__
 */
export const readLeaderboardTreasury = /*#__PURE__*/ createReadContract({
  abi: leaderboardTreasuryAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const readLeaderboardTreasuryDefaultAdminRole =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"MANAGER_ROLE"`
 */
export const readLeaderboardTreasuryManagerRole =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'MANAGER_ROLE',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"claimWindow"`
 */
export const readLeaderboardTreasuryClaimWindow =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'claimWindow',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"disputeWindow"`
 */
export const readLeaderboardTreasuryDisputeWindow =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'disputeWindow',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"epochPublishedAt"`
 */
export const readLeaderboardTreasuryEpochPublishedAt =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'epochPublishedAt',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"epochPublishedBy"`
 */
export const readLeaderboardTreasuryEpochPublishedBy =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'epochPublishedBy',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"epochReserve"`
 */
export const readLeaderboardTreasuryEpochReserve =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'epochReserve',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"epochRoot"`
 */
export const readLeaderboardTreasuryEpochRoot =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'epochRoot',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"getBalance"`
 */
export const readLeaderboardTreasuryGetBalance =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'getBalance',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"getClaimDeadline"`
 */
export const readLeaderboardTreasuryGetClaimDeadline =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'getClaimDeadline',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const readLeaderboardTreasuryGetRoleAdmin =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"getUnclaimedAmount"`
 */
export const readLeaderboardTreasuryGetUnclaimedAmount =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'getUnclaimedAmount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"hasRole"`
 */
export const readLeaderboardTreasuryHasRole = /*#__PURE__*/ createReadContract({
  abi: leaderboardTreasuryAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"isClaimWindowExpired"`
 */
export const readLeaderboardTreasuryIsClaimWindowExpired =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'isClaimWindowExpired',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"isClaimed"`
 */
export const readLeaderboardTreasuryIsClaimed =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'isClaimed',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const readLeaderboardTreasurySupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__
 */
export const writeLeaderboardTreasury = /*#__PURE__*/ createWriteContract({
  abi: leaderboardTreasuryAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"claim"`
 */
export const writeLeaderboardTreasuryClaim = /*#__PURE__*/ createWriteContract({
  abi: leaderboardTreasuryAbi,
  functionName: 'claim',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"deposit"`
 */
export const writeLeaderboardTreasuryDeposit =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"depositForEpoch"`
 */
export const writeLeaderboardTreasuryDepositForEpoch =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'depositForEpoch',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"distribute"`
 */
export const writeLeaderboardTreasuryDistribute =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'distribute',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"emergencyWithdraw"`
 */
export const writeLeaderboardTreasuryEmergencyWithdraw =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'emergencyWithdraw',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"grantRole"`
 */
export const writeLeaderboardTreasuryGrantRole =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"publishEpochRoot"`
 */
export const writeLeaderboardTreasuryPublishEpochRoot =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'publishEpochRoot',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"renounceRole"`
 */
export const writeLeaderboardTreasuryRenounceRole =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"revokeRole"`
 */
export const writeLeaderboardTreasuryRevokeRole =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"rollUnclaimedFunds"`
 */
export const writeLeaderboardTreasuryRollUnclaimedFunds =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'rollUnclaimedFunds',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"setClaimWindow"`
 */
export const writeLeaderboardTreasurySetClaimWindow =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'setClaimWindow',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"setDisputeWindow"`
 */
export const writeLeaderboardTreasurySetDisputeWindow =
  /*#__PURE__*/ createWriteContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'setDisputeWindow',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__
 */
export const simulateLeaderboardTreasury = /*#__PURE__*/ createSimulateContract(
  { abi: leaderboardTreasuryAbi },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"claim"`
 */
export const simulateLeaderboardTreasuryClaim =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'claim',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"deposit"`
 */
export const simulateLeaderboardTreasuryDeposit =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"depositForEpoch"`
 */
export const simulateLeaderboardTreasuryDepositForEpoch =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'depositForEpoch',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"distribute"`
 */
export const simulateLeaderboardTreasuryDistribute =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'distribute',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"emergencyWithdraw"`
 */
export const simulateLeaderboardTreasuryEmergencyWithdraw =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'emergencyWithdraw',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"grantRole"`
 */
export const simulateLeaderboardTreasuryGrantRole =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"publishEpochRoot"`
 */
export const simulateLeaderboardTreasuryPublishEpochRoot =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'publishEpochRoot',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"renounceRole"`
 */
export const simulateLeaderboardTreasuryRenounceRole =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"revokeRole"`
 */
export const simulateLeaderboardTreasuryRevokeRole =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"rollUnclaimedFunds"`
 */
export const simulateLeaderboardTreasuryRollUnclaimedFunds =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'rollUnclaimedFunds',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"setClaimWindow"`
 */
export const simulateLeaderboardTreasurySetClaimWindow =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'setClaimWindow',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `functionName` set to `"setDisputeWindow"`
 */
export const simulateLeaderboardTreasurySetDisputeWindow =
  /*#__PURE__*/ createSimulateContract({
    abi: leaderboardTreasuryAbi,
    functionName: 'setDisputeWindow',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__
 */
export const watchLeaderboardTreasuryEvent =
  /*#__PURE__*/ createWatchContractEvent({ abi: leaderboardTreasuryAbi })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"ClaimWindowSet"`
 */
export const watchLeaderboardTreasuryClaimWindowSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'ClaimWindowSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"Claimed"`
 */
export const watchLeaderboardTreasuryClaimedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'Claimed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"Deposited"`
 */
export const watchLeaderboardTreasuryDepositedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'Deposited',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"DisputeWindowSet"`
 */
export const watchLeaderboardTreasuryDisputeWindowSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'DisputeWindowSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"EmergencyWithdrawal"`
 */
export const watchLeaderboardTreasuryEmergencyWithdrawalEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'EmergencyWithdrawal',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"EpochFunded"`
 */
export const watchLeaderboardTreasuryEpochFundedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'EpochFunded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"EpochReserveConsumed"`
 */
export const watchLeaderboardTreasuryEpochReserveConsumedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'EpochReserveConsumed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"EpochRootPublished"`
 */
export const watchLeaderboardTreasuryEpochRootPublishedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'EpochRootPublished',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"RewardDistributed"`
 */
export const watchLeaderboardTreasuryRewardDistributedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'RewardDistributed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const watchLeaderboardTreasuryRoleAdminChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const watchLeaderboardTreasuryRoleGrantedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const watchLeaderboardTreasuryRoleRevokedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link leaderboardTreasuryAbi}__ and `eventName` set to `"UnclaimedFundsRolled"`
 */
export const watchLeaderboardTreasuryUnclaimedFundsRolledEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: leaderboardTreasuryAbi,
    eventName: 'UnclaimedFundsRolled',
  })
