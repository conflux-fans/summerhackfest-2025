'use client'

import { useState, useEffect } from 'react'
import { ClickArea } from '@/components/game/ClickArea'
import { StatsPanel } from '@/components/game/StatsPanel'
import { UpgradeShop } from '@/components/game/UpgradeShop'
import { WalletConnect } from '@/components/wallet/WalletConnect'
import P2ERewards from '@/components/p2e/P2ERewards'
import BlockchainSync from '@/components/blockchain/BlockchainSync'
import { RestartGame } from '@/components/game/RestartGame'
import { useGameStateContext } from '@/contexts/GameStateContext'
import { useWalletContext } from '@/contexts/WalletContext'
import { useContracts } from '@/hooks/useContracts'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { isConnected } = useWalletContext()
  const { isHydrated } = useGameStateContext()
  const { isReady, playerRegistered } = useContracts()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-white">Loading StarMiner...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Star Field Background */}
      <div className="absolute inset-0 stars-animation" />
      
      {/* Restart Game Button - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <RestartGame />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with Wallet Connection */}
        <header className="text-center mb-8">
          <div className="flex justify-between items-start mb-6">
            <div></div> {/* Spacer */}
            <div className="flex-1">
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 mb-4">
                ⭐ StarMiner
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Play-to-Earn Idle Clicker Game on Conflux eSpace
              </p>
            </div>
            <div className="flex-shrink-0">
              <WalletConnect />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 inline-block border border-gray-700">
            <p className="text-sm text-gray-400">
              🚀 Click stars to collect Stardust • 💎 Purchase upgrades • 💰 Earn CFX rewards
            </p>
            {isConnected && (
              <p className="text-xs text-green-400 mt-2">
                {playerRegistered ? '✅ Player registered' : '⚠️ Register to sync with blockchain'}
              </p>
            )}
          </div>
        </header>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Stats Panel */}
          <StatsPanel />

          {/* Click Area */}
          <ClickArea />

          {/* Upgrade Shop */}
          <UpgradeShop />
        </div>

        {/* P2E and Blockchain Sync Section */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <P2ERewards />
            <BlockchainSync />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-400">
          <p className="text-sm">
            Built with ❤️ for Code Without Borders - SummerHackfest 2025
          </p>
          <p className="text-xs mt-2">
            Powered by Conflux eSpace • Play-to-Earn Gaming
          </p>
        </footer>
      </div>
    </main>
  )
}