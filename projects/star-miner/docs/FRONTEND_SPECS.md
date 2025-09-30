# StarMiner Frontend Specifications

## 🎯 Overview

The StarMiner frontend is built with Next.js 14, React 18, TypeScript, and TailwindCSS, featuring a space-themed UI with smooth animations and comprehensive Web3 integration for Conflux eSpace.

## 🏗️ Project Structure

```
star-miner/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                   # Main game page
│   │   ├── globals.css                # Global styles and animations
│   │   └── favicon.ico
│   ├── components/
│   │   ├── game/
│   │   │   ├── ClickArea.tsx          # Main clicking interface
│   │   │   ├── StatsPanel.tsx         # Game statistics display
│   │   │   ├── UpgradeShop.tsx        # Upgrade purchasing interface
│   │   │   ├── StarField.tsx          # Animated background
│   │   │   ├── PrestigeModal.tsx      # Prestige system
│   │   │   └── GameHUD.tsx            # Heads-up display
│   │   ├── wallet/
│   │   │   ├── WalletConnect.tsx      # Wallet connection component
│   │   │   ├── WalletStatus.tsx       # Connection status display
│   │   │   └── NetworkSwitch.tsx      # Network switching
│   │   ├── ui/
│   │   │   ├── Button.tsx             # Reusable button component
│   │   │   ├── Modal.tsx              # Modal wrapper
│   │   │   ├── LoadingSpinner.tsx     # Loading states
│   │   │   ├── Toast.tsx              # Notification system
│   │   │   └── ProgressBar.tsx        # Progress indicators
│   │   └── layout/
│   │       ├── Header.tsx             # Top navigation
│   │       ├── Footer.tsx             # Footer with links
│   │       └── Sidebar.tsx            # Side navigation
│   ├── hooks/
│   │   ├── useGameState.ts            # Game state management
│   │   ├── useWallet.ts               # Wallet connection logic
│   │   ├── useContracts.ts            # Smart contract interactions
│   │   ├── useAnimations.ts           # Animation controls
│   │   ├── useLocalStorage.ts         # Local persistence
│   │   └── useSound.ts                # Sound effects
│   ├── lib/
│   │   ├── contracts/
│   │   │   ├── addresses.ts           # Contract addresses
│   │   │   ├── abis.ts                # Contract ABIs
│   │   │   └── interactions.ts        # Contract interaction helpers
│   │   ├── game/
│   │   │   ├── mechanics.ts           # Core game logic
│   │   │   ├── upgrades.ts            # Upgrade calculations
│   │   │   ├── achievements.ts        # Achievement system
│   │   │   └── persistence.ts         # Save/load functionality
│   │   ├── utils/
│   │   │   ├── formatting.ts          # Number/text formatting
│   │   │   ├── animations.ts          # Animation utilities
│   │   │   ├── constants.ts           # Game constants
│   │   │   └── helpers.ts             # General utilities
│   │   └── providers/
│   │       ├── GameProvider.tsx       # Game state context
│   │       ├── WalletProvider.tsx     # Wallet context
│   │       └── ToastProvider.tsx      # Notification context
│   ├── types/
│   │   ├── game.ts                    # Game-related types
│   │   ├── contracts.ts               # Contract types
│   │   ├── wallet.ts                  # Wallet types
│   │   └── ui.ts                      # UI component types
│   └── styles/
│       ├── components.css             # Component-specific styles
│       └── animations.css             # Animation definitions
├── public/
│   ├── sounds/
│   │   ├── click.mp3                  # Click sound effect
│   │   ├── upgrade.mp3                # Upgrade purchase sound
│   │   └── ambient.mp3                # Background music
│   ├── images/
│   │   ├── upgrades/                  # Upgrade icons
│   │   ├── backgrounds/               # Background images
│   │   └── ui/                        # UI elements
│   └── icons/
│       └── favicon.ico
├── contracts/                         # Smart contract files
├── scripts/                          # Deployment scripts
├── tests/                            # Test files
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🎮 Core Components

### 1. ClickArea Component

**Purpose**: Main interactive area where players click to generate Stardust.

```typescript
// src/components/game/ClickArea.tsx
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useSound } from '@/hooks/useSound';

interface ClickEffect {
  id: string;
  x: number;
  y: number;
  value: number;
}

export const ClickArea: React.FC = () => {
  const { gameState, incrementStardust } = useGameState();
  const { playSound } = useSound();
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const clickAreaRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((event: React.MouseEvent) => {
    const rect = clickAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate stardust gained
    const stardustGained = gameState.stardustPerClick;
    
    // Create click effect
    const effect: ClickEffect = {
      id: Math.random().toString(36),
      x,
      y,
      value: Number(stardustGained)
    };
    
    setClickEffects(prev => [...prev, effect]);
    
    // Remove effect after animation
    setTimeout(() => {
      setClickEffects(prev => prev.filter(e => e.id !== effect.id));
    }, 1000);
    
    // Update game state
    incrementStardust(stardustGained);
    playSound('click');
  }, [gameState.stardustPerClick, incrementStardust, playSound]);

  return (
    <div className="relative flex-1 flex items-center justify-center">
      {/* Animated Star Field Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-animation" />
      </div>
      
      {/* Main Click Area */}
      <motion.div
        ref={clickAreaRef}
        className="relative w-80 h-80 cursor-pointer select-none"
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Central Star */}
        <motion.div
          className="w-full h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-full shadow-2xl"
          animate={{
            boxShadow: [
              '0 0 20px rgba(251, 191, 36, 0.5)',
              '0 0 40px rgba(251, 191, 36, 0.8)',
              '0 0 20px rgba(251, 191, 36, 0.5)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
            ⭐
          </div>
        </motion.div>
        
        {/* Click Effects */}
        <AnimatePresence>
          {clickEffects.map((effect) => (
            <motion.div
              key={effect.id}
              className="absolute pointer-events-none text-yellow-400 font-bold text-xl"
              style={{
                left: effect.x,
                top: effect.y,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{ opacity: 0, scale: 1.5, y: -50 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              +{effect.value.toLocaleString()}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      {/* Orbital Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border border-blue-400/30 rounded-full"
            style={{
              width: `${400 + i * 60}px`,
              height: `${400 + i * 60}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 20 + i * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              style={{
                top: '50%',
                right: 0,
                transform: 'translateY(-50%)'
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
```

### 2. StatsPanel Component

**Purpose**: Display current game statistics and progress.

```typescript
// src/components/game/StatsPanel.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { formatNumber, formatTime } from '@/lib/utils/formatting';

export const StatsPanel: React.FC = () => {
  const { gameState } = useGameState();

  const stats = [
    {
      label: 'Stardust',
      value: formatNumber(gameState.stardust),
      icon: '✨',
      color: 'text-yellow-400'
    },
    {
      label: 'Per Click',
      value: formatNumber(gameState.stardustPerClick),
      icon: '👆',
      color: 'text-blue-400'
    },
    {
      label: 'Per Second',
      value: formatNumber(gameState.stardustPerSecond),
      icon: '⏱️',
      color: 'text-green-400'
    },
    {
      label: 'Total Clicks',
      value: formatNumber(gameState.totalClicks),
      icon: '🎯',
      color: 'text-purple-400'
    },
    {
      label: 'Credits',
      value: formatNumber(gameState.credits),
      icon: '💎',
      color: 'text-cyan-400'
    },
    {
      label: 'Prestige Level',
      value: gameState.prestigeLevel.toString(),
      icon: '👑',
      color: 'text-orange-400'
    }
  ];

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        📊 Statistics
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{stat.icon}</span>
              <span className="text-sm text-gray-400">{stat.label}</span>
            </div>
            <div className={`text-lg font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Progress to Next Prestige */}
      {gameState.stardust < 1000000n && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Progress to Prestige</span>
            <span>{((Number(gameState.stardust) / 1000000) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min((Number(gameState.stardust) / 1000000) * 100, 100)}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3. UpgradeShop Component

**Purpose**: Interface for purchasing upgrades with Stardust or Credits.

```typescript
// src/components/game/UpgradeShop.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useContracts } from '@/hooks/useContracts';
import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/utils/formatting';
import { UPGRADE_CONFIGS } from '@/lib/game/upgrades';

interface UpgradeItemProps {
  upgradeId: string;
  config: any;
  level: number;
  cost: bigint;
  canAfford: boolean;
  onPurchase: (upgradeId: string) => void;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({
  upgradeId,
  config,
  level,
  cost,
  canAfford,
  onPurchase
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`bg-gray-800/50 rounded-lg p-4 border transition-all duration-200 ${
        canAfford 
          ? 'border-green-500/50 hover:border-green-400' 
          : 'border-gray-600 opacity-60'
      }`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={canAfford ? { scale: 1.02 } : {}}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{config.icon}</div>
          <div>
            <h3 className="text-white font-semibold">{config.name}</h3>
            <p className="text-sm text-gray-400">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm ${config.costType === 'credits' ? 'text-cyan-400' : 'text-yellow-400'}`}>
            {formatNumber(cost)} {config.costType === 'credits' ? '💎' : '✨'}
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-300 mb-3">
        <div>+{formatNumber(config.stardustPerClick)} per click</div>
        <div>+{formatNumber(config.stardustPerSecond)} per second</div>
      </div>
      
      <Button
        onClick={() => onPurchase(upgradeId)}
        disabled={!canAfford}
        className={`w-full ${
          canAfford 
            ? 'bg-green-600 hover:bg-green-500' 
            : 'bg-gray-600 cursor-not-allowed'
        }`}
      >
        {canAfford ? 'Purchase' : 'Cannot Afford'}
      </Button>
      
      {/* Hover Details */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute z-10 bg-gray-900 border border-gray-600 rounded-lg p-3 mt-2 shadow-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p className="text-sm text-gray-300">{config.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const UpgradeShop: React.FC = () => {
  const { gameState, purchaseUpgrade } = useGameState();
  const { getUpgradeCost } = useContracts();
  const [activeTab, setActiveTab] = useState<'stardust' | 'credits'>('stardust');

  const stardustUpgrades = Object.entries(UPGRADE_CONFIGS).filter(
    ([_, config]) => config.costType === 'stardust'
  );
  
  const creditUpgrades = Object.entries(UPGRADE_CONFIGS).filter(
    ([_, config]) => config.costType === 'credits'
  );

  const handlePurchase = async (upgradeId: string) => {
    try {
      await purchaseUpgrade(upgradeId);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🛒 Upgrade Shop
      </h2>
      
      {/* Tab Navigation */}
      <div className="flex mb-4 bg-gray-800 rounded-lg p-1">
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            activeTab === 'stardust'
              ? 'bg-yellow-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('stardust')}
        >
          ✨ Stardust Upgrades
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            activeTab === 'credits'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('credits')}
        >
          💎 Credit Upgrades
        </button>
      </div>
      
      {/* Upgrade List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {(activeTab === 'stardust' ? stardustUpgrades : creditUpgrades).map(
          ([upgradeId, config]) => {
            const level = gameState.upgrades[upgradeId]?.level || 0;
            const cost = getUpgradeCost(upgradeId, level);
            const canAfford = activeTab === 'stardust' 
              ? gameState.stardust >= cost
              : gameState.credits >= cost;

            return (
              <UpgradeItem
                key={upgradeId}
                upgradeId={upgradeId}
                config={config}
                level={level}
                cost={cost}
                canAfford={canAfford}
                onPurchase={handlePurchase}
              />
            );
          }
        )}
      </div>
      
      {/* Credits Purchase Section */}
      {activeTab === 'credits' && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Need more Credits?</span>
            <span className="text-sm text-cyan-400">1 CFX = 1000 💎</span>
          </div>
          <Button
            onClick={() => {/* Open credits purchase modal */}}
            className="w-full bg-cyan-600 hover:bg-cyan-500"
          >
            Purchase Credits with CFX
          </Button>
        </div>
      )}
    </div>
  );
};
```

### 4. WalletConnect Component

**Purpose**: Handle wallet connection and network switching.

```typescript
// src/components/wallet/WalletConnect.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export const WalletConnect: React.FC = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    connect, 
    disconnect, 
    switchNetwork,
    isCorrectNetwork 
  } = useWallet();
  
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async (walletType: 'metamask' | 'fluent') => {
    try {
      await connect(walletType);
      setShowModal(false);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500"
        >
          Connect Wallet
        </Button>
        
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Connect Wallet</h2>
            <div className="space-y-3">
              <Button
                onClick={() => handleConnect('metamask')}
                className="w-full bg-orange-600 hover:bg-orange-500"
              >
                🦊 MetaMask
              </Button>
              <Button
                onClick={() => handleConnect('fluent')}
                className="w-full bg-purple-600 hover:bg-purple-500"
              >
                🌊 Fluent Wallet
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {!isCorrectNetwork && (
        <Button
          onClick={switchNetwork}
          className="bg-red-600 hover:bg-red-500 text-sm"
        >
          Switch to Conflux eSpace
        </Button>
      )}
      
      <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-600">
        <div className="text-sm text-gray-400">Balance</div>
        <div className="text-white font-semibold">
          {balance ? `${parseFloat(balance).toFixed(4)} CFX` : '0 CFX'}
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-600">
        <div className="text-sm text-gray-400">Address</div>
        <div className="text-white font-mono text-sm">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
        </div>
      </div>
      
      <Button
        onClick={disconnect}
        className="bg-gray-600 hover:bg-gray-500 text-sm"
      >
        Disconnect
      </Button>
    </div>
  );
};
```

## 🎨 Styling and Animations

### TailwindCSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        cosmic: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate',
      },
      keyframes: {
        twinkle: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '1' }
        }
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(135deg, #0c4a6e 0%, #1e1b4b 50%, #581c87 100%)',
        'star-field': 'radial-gradient(2px 2px at 20px 30px, #eee, transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent)',
      }
    },
  },
  plugins: [],
}
```

### Global Animations

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-space-gradient min-h-screen text-white;
  }
}

@layer components {
  .stars-animation {
    @apply absolute inset-0 opacity-30;
    background-image: 
      radial-gradient(2px 2px at 20px 30px, #eee, transparent),
      radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 90px 40px, #fff, transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 160px 30px, rgba(255,255,255,0.9), transparent);
    background-repeat: repeat;
    background-size: 200px 100px;
    animation: twinkle 4s ease-in-out infinite alternate;
  }
  
  .click-ripple {
    @apply absolute rounded-full border-2 border-yellow-400 pointer-events-none;
    animation: ripple 0.6s linear;
  }
  
  .floating-number {
    @apply absolute pointer-events-none font-bold text-yellow-400;
    animation: float-up 1s ease-out forwards;
  }
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes float-up {
  to {
    transform: translateY(-50px);
    opacity: 0;
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}
```

## 📱 Responsive Design

The application is designed to be fully responsive across all device sizes:

- **Desktop (1024px+)**: Full layout with sidebar and multiple panels
- **Tablet (768px-1023px)**: Stacked layout with collapsible panels
- **Mobile (320px-767px)**: Single-column layout with bottom navigation

## 🔧 State Management

The application uses Zustand for state management with the following stores:

- **GameStore**: Core game state (stardust, upgrades, stats)
- **WalletStore**: Wallet connection and blockchain state
- **UIStore**: UI state (modals, notifications, themes)
- **SettingsStore**: User preferences and settings

## 🎵 Audio System

Sound effects and background music enhance the gaming experience:

- **Click sounds**: Different tones based on stardust amount
- **Upgrade sounds**: Success/failure audio feedback
- **Background music**: Ambient space-themed soundtrack
- **UI sounds**: Button clicks, modal opens/closes

This frontend specification provides a comprehensive foundation for building an engaging, performant, and visually stunning space-themed idle clicker game with full Web3 integration.