"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Crown, Zap, TrendingUp } from "lucide-react"
import type { LeaderboardEntry } from "@/types"

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // Mock data with more realistic usernames and enhanced data
  return [
    {
      rank: 1,
      address: "0x1234567890123456789012345678901234567890",
      score: 2850,
      timestamp: Date.now(),
      username: "CryptoMaster",
      streak: 15,
      nfts: 8,
    },
    {
      rank: 2,
      address: "0x2345678901234567890123456789012345678901",
      score: 2720,
      timestamp: Date.now(),
      username: "QuizNinja",
      streak: 12,
      nfts: 6,
    },
    {
      rank: 3,
      address: "0x3456789012345678901234567890123456789012",
      score: 2650,
      timestamp: Date.now(),
      username: "BrainPower",
      streak: 9,
      nfts: 5,
    },
    {
      rank: 4,
      address: "0x4567890123456789012345678901234567890123",
      score: 2580,
      timestamp: Date.now(),
      username: "Web3Wizard",
      streak: 7,
      nfts: 4,
    },
    {
      rank: 5,
      address: "0x5678901234567890123456789012345678901234",
      score: 2500,
      timestamp: Date.now(),
      username: "AIExplorer",
      streak: 6,
      nfts: 3,
    },
  ]
}

export function LeaderboardCard() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard()
        setLeaderboard(data)
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow ring-2 ring-yellow-400/30">
            <Crown className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
        )
      case 2:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-gray-300/30">
            <Trophy className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
        )
      case 3:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-amber-400/30">
            <Medal className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
        )
      default:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-muted via-muted/80 to-muted-foreground/20 rounded-full flex items-center justify-center shadow-sm ring-1 ring-muted-foreground/20">
            <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
          </div>
        )
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 hover:border-accent/50 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-2xl" />

      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent via-accent/80 to-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-montserrat font-bold text-2xl bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
                Live Leaderboard
              </h3>
              <p className="text-sm text-muted-foreground font-medium">Top performers today</p>
            </div>
          </div>
          <Badge variant="secondary" className="animate-pulse bg-gradient-to-r from-accent/20 to-secondary/20 border-accent/30 text-accent font-semibold px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="flex gap-3">
                      <div className="h-6 bg-muted rounded-full w-12"></div>
                      <div className="h-6 bg-muted rounded-full w-16"></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-muted rounded w-16 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-accent/10 hover:to-secondary/10 transition-all duration-300 group/item border border-transparent hover:border-accent/20 hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  {getRankIcon(entry.rank)}
                  <div className="flex flex-col">
                    <span className="font-bold text-base group-hover/item:text-accent transition-colors duration-300">
                      {entry.username || formatAddress(entry.address)}
                    </span>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                        <span className="text-orange-500">🔥</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">{entry.streak || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                        <span className="text-purple-500">🏆</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{entry.nfts || 0} NFTs</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-accent text-xl group-hover/item:scale-105 transition-transform duration-300">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">points</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gradient-to-r from-transparent via-border to-transparent">
          <button 
            onClick={() => router.push('/leaderboard')}
            className="w-full text-center text-sm text-accent hover:text-accent/80 transition-all duration-300 font-semibold py-2 px-4 rounded-lg hover:bg-accent/10 group/btn"
          >
            <span className="group-hover/btn:translate-x-1 transition-transform duration-300 inline-flex items-center gap-2">
              View Full Leaderboard
              <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
