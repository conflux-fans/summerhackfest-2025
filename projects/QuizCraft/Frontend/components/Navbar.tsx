"use client"

import Link from "next/link"
import { useWeb3 } from "./Web3Provider"
import { CONFLUX_TESTNET } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Trophy, Gamepad2, BarChart3, Menu, X, Sparkles } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { account, isConnected, isOnConflux, connectWallet, loading, error, chainId, switchToConflux } = useWeb3()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 glass-effect">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Trophy className="h-8 w-8 text-accent group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-secondary rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-sm" />
            </div>
            <div className="flex flex-col">
              <span className="font-montserrat font-black text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                QuizCraft AI
              </span>
              <Badge variant="secondary" className="text-xs px-2 py-0 w-fit">
                <Sparkles className="h-3 w-3 mr-1" />
                Web3
              </Badge>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-foreground/70 hover:text-accent transition-all duration-300 font-medium hover:scale-105"
            >
              Home
            </Link>
            <Link
              href="/solo"
              className="text-foreground/70 hover:text-accent transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105"
            >
              <Gamepad2 className="h-4 w-4" />
              Solo Training
            </Link>
            <Link
              href="/arena"
              className="text-foreground/70 hover:text-accent transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105"
            >
              <Trophy className="h-4 w-4" />
              Live Arena
            </Link>
            <Link
              href="/leaderboard"
              className="text-foreground/70 hover:text-accent transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105"
            >
              <BarChart3 className="h-4 w-4" />
              Leaderboard
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {error && (
              <Badge variant="destructive" className="text-xs">
                {error}
              </Badge>
            )}

            {isConnected ? (
              <div className="flex items-center space-x-3 bg-accent/10 rounded-full px-4 py-2 border border-accent/20">
                <div className={`h-2 w-2 rounded-full ${isOnConflux ? "bg-green-500" : "bg-yellow-500"} animate-pulse`}></div>
                <span className="text-sm font-semibold text-accent">{formatAddress(account!)}</span>
                {!isOnConflux && (
                  <Button size="sm" variant="secondary" onClick={switchToConflux} className="ml-2">
                    Switch to {CONFLUX_TESTNET.name}
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                disabled={loading}
                className="flex items-center gap-2 font-semibold shadow-lg hover:shadow-accent/25 transition-all duration-300 animate-pulse-glow"
              >
                <Wallet className="h-4 w-4" />
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-foreground/70 hover:text-accent transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/solo"
                className="text-foreground/70 hover:text-accent transition-colors flex items-center gap-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Gamepad2 className="h-4 w-4" />
                Solo Training
              </Link>
              <Link
                href="/arena"
                className="text-foreground/70 hover:text-accent transition-colors flex items-center gap-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy className="h-4 w-4" />
                Live Arena
              </Link>
              <Link
                href="/leaderboard"
                className="text-foreground/70 hover:text-accent transition-colors flex items-center gap-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />
                Leaderboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
