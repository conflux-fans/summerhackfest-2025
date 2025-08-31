import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from '@/contexts/WalletContext'
import { GameStateProvider } from '@/contexts/GameStateContext'
import { ToastProvider } from '@/contexts/ToastContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StarMiner - Play-to-Earn Idle Clicker',
  description: 'A space-themed idle clicker game with blockchain integration on Conflux eSpace',
  keywords: ['blockchain', 'game', 'play-to-earn', 'idle clicker', 'conflux', 'web3'],
  authors: [{ name: 'StarMiner Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <GameStateProvider>
            <ToastProvider>
              <div className="min-h-screen bg-space-gradient">
                {children}
              </div>
            </ToastProvider>
          </GameStateProvider>
        </WalletContextProvider>
      </body>
    </html>
  )
}