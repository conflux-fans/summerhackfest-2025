import { UpgradeConfig } from '@/types/game';

// Network configurations
export const CONFLUX_NETWORKS = {
  testnet: {
    chainId: 71,
    chainName: 'Conflux eSpace Testnet',
    nativeCurrency: {
      name: 'CFX',
      symbol: 'CFX',
      decimals: 18,
    },
    rpcUrls: ['https://evmtestnet.confluxrpc.com'],
    blockExplorerUrls: ['https://evmtestnet.confluxscan.io'],
  },
  mainnet: {
    chainId: 1030,
    chainName: 'Conflux eSpace',
    nativeCurrency: {
      name: 'CFX',
      symbol: 'CFX',
      decimals: 18,
    },
    rpcUrls: ['https://evm.confluxrpc.com'],
    blockExplorerUrls: ['https://evm.confluxscan.io'],
  },
};

// Game constants
export const GAME_CONSTANTS = {
  INITIAL_STARDUST_PER_CLICK: 1n,
  INITIAL_STARDUST_PER_SECOND: 0n,
  PRESTIGE_REQUIREMENT: 1000000n, // 1M Stardust
  MAX_DAILY_REWARDS: 1n * 10n ** 18n, // 1 CFX
  STARDUST_TO_CFX_RATE: 10000n, // 10,000 Stardust = 1 CFX
  CREDITS_PER_CFX: 1000n, // 1 CFX = 1000 Credits
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  IDLE_CALCULATION_INTERVAL: 1000, // 1 second
};

// Upgrade configurations
export const UPGRADE_CONFIGS: Record<string, UpgradeConfig> = {
  telescope: {
    id: 'telescope',
    name: 'Telescope',
    description: 'A basic telescope to observe distant stars and collect more stardust.',
    icon: '🔭',
    baseCost: 10n,
    costMultiplier: 1150, // 15% increase per level
    stardustPerClick: 1n,
    stardustPerSecond: 0n,
    costType: 'stardust',
    isActive: true,
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    description: 'An orbital satellite that automatically collects stardust from space.',
    icon: '🛰️',
    baseCost: 100n,
    costMultiplier: 1150,
    stardustPerClick: 5n,
    stardustPerSecond: 1n,
    costType: 'stardust',
    isActive: true,
  },
  observatory: {
    id: 'observatory',
    name: 'Observatory',
    description: 'A ground-based observatory with advanced detection capabilities.',
    icon: '🏢',
    baseCost: 1000n,
    costMultiplier: 1150,
    stardustPerClick: 10n,
    stardustPerSecond: 5n,
    costType: 'stardust',
    isActive: true,
  },
  starship: {
    id: 'starship',
    name: 'Starship',
    description: 'A powerful starship that can harvest stardust from multiple star systems.',
    icon: '🚀',
    baseCost: 10n,
    costMultiplier: 1200, // 20% increase per level
    stardustPerClick: 50n,
    stardustPerSecond: 25n,
    costType: 'credits',
    isActive: true,
  },
  spacestation: {
    id: 'spacestation',
    name: 'Space Station',
    description: 'A massive space station with industrial-scale stardust processing.',
    icon: '🛸',
    baseCost: 50n,
    costMultiplier: 1200,
    stardustPerClick: 100n,
    stardustPerSecond: 50n,
    costType: 'credits',
    isActive: true,
  },
  wormhole: {
    id: 'wormhole',
    name: 'Wormhole Generator',
    description: 'Creates wormholes to access distant galaxies rich in stardust.',
    icon: '🌀',
    baseCost: 200n,
    costMultiplier: 1250, // 25% increase per level
    stardustPerClick: 500n,
    stardustPerSecond: 250n,
    costType: 'credits',
    isActive: true,
  },
  blackhole: {
    id: 'blackhole',
    name: 'Black Hole',
    description: 'Harnesses the immense energy of black holes to generate stardust.',
    icon: '🕳️',
    baseCost: 500n,
    costMultiplier: 1250,
    stardustPerClick: 1000n,
    stardustPerSecond: 500n,
    costType: 'credits',
    isActive: true,
  },
  galacticnetwork: {
    id: 'galacticnetwork',
    name: 'Galactic Network',
    description: 'A network spanning entire galaxies, collecting stardust automatically.',
    icon: '🌌',
    baseCost: 1000n,
    costMultiplier: 1300, // 30% increase per level
    stardustPerClick: 5000n,
    stardustPerSecond: 2500n,
    costType: 'credits',
    isActive: true,
  },
  universeengine: {
    id: 'universeengine',
    name: 'Universe Engine',
    description: 'The ultimate stardust generator, powered by the energy of entire universes.',
    icon: '⚡',
    baseCost: 2000n,
    costMultiplier: 1500, // 50% increase per level
    stardustPerClick: 10000n,
    stardustPerSecond: 5000n,
    costType: 'credits',
    isActive: true,
  },
};

// Achievement definitions
export const ACHIEVEMENTS = [
  {
    id: 'first_click',
    name: 'First Light',
    description: 'Click your first star',
    icon: '⭐',
    condition: (gameState: any) => gameState.totalClicks >= 1,
    reward: { type: 'stardust' as const, amount: 10n },
  },
  {
    id: 'hundred_clicks',
    name: 'Star Gazer',
    description: 'Click 100 stars',
    icon: '🌟',
    condition: (gameState: any) => gameState.totalClicks >= 100,
    reward: { type: 'stardust' as const, amount: 100n },
  },
  {
    id: 'first_upgrade',
    name: 'First Steps',
    description: 'Purchase your first upgrade',
    icon: '🔭',
    condition: (gameState: any) => Object.values(gameState.upgrades).some((u: any) => u.level > 0),
    reward: { type: 'stardust' as const, amount: 50n },
  },
  {
    id: 'thousand_stardust',
    name: 'Cosmic Collector',
    description: 'Collect 1,000 stardust',
    icon: '✨',
    condition: (gameState: any) => gameState.stardust >= 1000n,
    reward: { type: 'multiplier' as const, amount: 110n }, // 10% bonus
  },
  {
    id: 'first_prestige',
    name: 'Rebirth',
    description: 'Activate prestige for the first time',
    icon: '👑',
    condition: (gameState: any) => gameState.prestigeLevel >= 1,
    reward: { type: 'stardust' as const, amount: 1000n },
  },
];

// UI Constants
export const UI_CONSTANTS = {
  CLICK_EFFECT_DURATION: 1000, // ms
  ANIMATION_DURATION: 300, // ms
  TOAST_DURATION: 3000, // ms
  MODAL_ANIMATION_DURATION: 200, // ms
};

// Sound effects
export const SOUND_EFFECTS = {
  CLICK: '/sounds/click.mp3',
  UPGRADE: '/sounds/upgrade.mp3',
  ACHIEVEMENT: '/sounds/achievement.mp3',
  ERROR: '/sounds/error.mp3',
  SUCCESS: '/sounds/success.mp3',
};

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
  testnet: {
    starMinerCredits: process.env.NEXT_PUBLIC_CREDITS_CONTRACT || '',
    gameStateManager: process.env.NEXT_PUBLIC_GAMESTATE_CONTRACT || '',
    p2eRewards: process.env.NEXT_PUBLIC_P2E_CONTRACT || '',
    upgradeNFTs: process.env.NEXT_PUBLIC_NFT_CONTRACT || '',
  },
  mainnet: {
    starMinerCredits: '',
    gameStateManager: '',
    p2eRewards: '',
    upgradeNFTs: '',
  },
};