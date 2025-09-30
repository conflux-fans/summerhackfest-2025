"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWeb3 } from "@/components/Web3Provider"
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  Zap, 
  Target,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Gamepad2,
  Flame,
  Sparkles,
  RefreshCw,
  Filter,
  Search
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface PlayerStats {
  player_address: string
  total_score: number
  games_played: number
  wins: number
  win_rate: number
  average_score: number
  best_score: number
  total_correct_answers: number
  total_questions: number
  accuracy: number
  last_played: string
  achievements: string[]
}

interface LobbyLeaderboard {
  lobby_id: number
  lobby_name: string
  players: PlayerStats[]
  total_players: number
  created_at: string
  status: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
}

export default function LeaderboardPage() {
  const { account, isConnected } = useWeb3()
  const [activeTab, setActiveTab] = useState("global")
  const [globalLeaderboard, setGlobalLeaderboard] = useState<PlayerStats[]>([])
  const [lobbyLeaderboards, setLobbyLeaderboards] = useState<LobbyLeaderboard[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLobby, setSelectedLobby] = useState<number | null>(null)

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    setLoading(true)
    try {
      // Fetch global leaderboard
      const globalResponse = await fetch('/api/leaderboard/global')
      const globalData = await globalResponse.json()
      setGlobalLeaderboard(globalData.players || [])

      // Fetch lobby leaderboards
      const lobbiesResponse = await fetch('/api/leaderboard/lobbies')
      const lobbiesData = await lobbiesResponse.json()
      setLobbyLeaderboards(lobbiesData.lobbies || [])

      // Fetch achievements
      const achievementsResponse = await fetch('/api/leaderboard/achievements')
      const achievementsData = await achievementsResponse.json()
      setAchievements(achievementsData.achievements || [])
    } catch (error) {
      console.error('Error fetching leaderboard data:', error)
      // Mock data for demonstration
      setGlobalLeaderboard(generateMockGlobalData())
      setLobbyLeaderboards(generateMockLobbyData())
      setAchievements(generateMockAchievements())
    } finally {
      setLoading(false)
    }
  }

  const generateMockGlobalData = (): PlayerStats[] => [
    {
      player_address: "0x1234567890123456789012345678901234567890",
      total_score: 15420,
      games_played: 25,
      wins: 18,
      win_rate: 72,
      average_score: 617,
      best_score: 950,
      total_correct_answers: 180,
      total_questions: 250,
      accuracy: 72,
      last_played: "2024-01-15T10:30:00Z",
      achievements: ["Quiz Master", "Arena Champion", "Perfect Score"]
    },
    {
      player_address: account || "0x9876543210987654321098765432109876543210",
      total_score: 12850,
      games_played: 20,
      wins: 14,
      win_rate: 70,
      average_score: 643,
      best_score: 890,
      total_correct_answers: 150,
      total_questions: 200,
      accuracy: 75,
      last_played: "2024-01-14T15:45:00Z",
      achievements: ["Knowledge Seeker", "Speed Demon"]
    },
    {
      player_address: "0x5555555555555555555555555555555555555555",
      total_score: 11200,
      games_played: 18,
      wins: 12,
      win_rate: 67,
      average_score: 622,
      best_score: 820,
      total_correct_answers: 135,
      total_questions: 180,
      accuracy: 75,
      last_played: "2024-01-13T09:20:00Z",
      achievements: ["Category Master"]
    }
  ]

  const generateMockLobbyData = (): LobbyLeaderboard[] => [
    {
      lobby_id: 1,
      lobby_name: "General Knowledge Championship",
      total_players: 8,
      created_at: "2024-01-15T10:00:00Z",
      status: "completed",
      players: [
        {
          player_address: "0x1234567890123456789012345678901234567890",
          total_score: 950,
          games_played: 1,
          wins: 1,
          win_rate: 100,
          average_score: 950,
          best_score: 950,
          total_correct_answers: 9,
          total_questions: 10,
          accuracy: 90,
          last_played: "2024-01-15T10:30:00Z",
          achievements: ["Perfect Score"]
        },
        {
          player_address: account || "0x9876543210987654321098765432109876543210",
          total_score: 820,
          games_played: 1,
          wins: 0,
          win_rate: 0,
          average_score: 820,
          best_score: 820,
          total_correct_answers: 7,
          total_questions: 10,
          accuracy: 70,
          last_played: "2024-01-15T10:30:00Z",
          achievements: []
        }
      ]
    }
  ]

  const generateMockAchievements = (): Achievement[] => [
    {
      id: "1",
      name: "Quiz Master",
      description: "Achieve a perfect score in any quiz",
      icon: "🏆",
      rarity: "legendary",
      unlocked: true
    },
    {
      id: "2", 
      name: "Arena Champion",
      description: "Win your first Live Arena battle",
      icon: "🥇",
      rarity: "epic",
      unlocked: true
    },
    {
      id: "3",
      name: "Knowledge Seeker",
      description: "Complete 10 quizzes in different categories",
      icon: "📚",
      rarity: "rare",
      unlocked: true
    },
    {
      id: "4",
      name: "Speed Demon",
      description: "Answer 5 questions in under 10 seconds",
      icon: "⚡",
      rarity: "rare",
      unlocked: false
    }
  ]

  const getRankIcon = (index: number) => {
    if (index === 0) {
      return (
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-yellow-400/30 animate-pulse-glow">
          <Crown className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
      )
    } else if (index === 1) {
      return (
        <div className="w-16 h-16 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-gray-400/30">
          <Medal className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
      )
    } else if (index === 2) {
      return (
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-amber-400/30">
          <Medal className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
      )
    } else {
      return (
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-400/20">
          <span className="text-white text-lg font-black drop-shadow-sm">#{index + 1}</span>
        </div>
      )
    }
  }

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white font-bold px-4 py-2 text-sm shadow-lg ring-2 ring-yellow-400/30">
          👑 Quiz Champion
        </Badge>
      )
    } else if (index === 1) {
      return (
        <Badge className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white font-bold px-4 py-2 text-sm shadow-lg ring-2 ring-gray-400/30">
          🥈 Elite Player
        </Badge>
      )
    } else if (index === 2) {
      return (
        <Badge className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white font-bold px-4 py-2 text-sm shadow-lg ring-2 ring-amber-400/30">
          🥉 Expert Player
        </Badge>
      )
    } else if (index < 10) {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-3 py-1 text-xs shadow-md">
          🏆 Top 10
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-600 font-medium px-3 py-1 text-xs">
          Player
        </Badge>
      )
    }
  }

  const getAchievementRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500'
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-cyan-500'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600'
    }
  }

  const filteredGlobalPlayers = globalLeaderboard.filter(player =>
    player.player_address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredLobbyPlayers = selectedLobby 
    ? lobbyLeaderboards.find(lobby => lobby.lobby_id === selectedLobby)?.players.filter(player =>
        player.player_address.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    : []

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
            <CardContent className="py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Connect to View Leaderboard
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Connect your wallet to see your ranking and compete with other players!
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Start Playing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                🏆 Global Leaderboard
              </h1>
              <p className="text-lg text-muted-foreground mt-2">Compete with players worldwide</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{globalLeaderboard.length}</div>
                <div className="text-sm text-muted-foreground">Total Players</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-4 text-center">
                <Gamepad2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {globalLeaderboard.reduce((sum, p) => sum + p.games_played, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Games Played</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {globalLeaderboard.length > 0 ? Math.round(globalLeaderboard.reduce((sum, p) => sum + p.win_rate, 0) / globalLeaderboard.length) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Win Rate</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
              <CardContent className="p-4 text-center">
                <Flame className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {globalLeaderboard.length > 0 ? globalLeaderboard[0].total_score.toLocaleString() : 0}
                </div>
                <div className="text-sm text-muted-foreground">Highest Score</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Global
            </TabsTrigger>
            <TabsTrigger value="lobbies" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Lobbies
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Global Leaderboard */}
          <TabsContent value="global" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button onClick={fetchLeaderboardData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 backdrop-blur-sm">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
              
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-3xl font-black">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
                    <Crown className="h-7 w-7 text-white drop-shadow-sm" />
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                      Global Rankings
                    </span>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      🏆 Compete with the world's best quiz masters
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between p-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl">
                          <div className="flex items-center gap-8">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-300 rounded-full" />
                              <div className="text-center">
                                <div className="h-3 w-12 bg-gray-300 rounded mb-2" />
                                <div className="h-6 w-8 bg-gray-300 rounded" />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-4">
                                <div className="h-6 w-32 bg-gray-300 rounded" />
                                <div className="h-6 w-20 bg-gray-300 rounded" />
                              </div>
                              <div className="grid grid-cols-4 gap-4">
                                {[...Array(4)].map((_, j) => (
                                  <div key={j} className="h-8 bg-gray-300 rounded-full" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="h-10 w-24 bg-gray-300 rounded mb-2" />
                            <div className="space-y-2">
                              <div className="h-6 w-20 bg-gray-300 rounded" />
                              <div className="h-6 w-16 bg-gray-300 rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredGlobalPlayers.map((player, index) => {
                      const isCurrentPlayer = player.player_address.toLowerCase() === account?.toLowerCase()
                      
                      return (
                        <div
                          key={`global-${player.player_address}-${index}`}
                          className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl group ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-50 via-yellow-100/50 to-orange-50 border-yellow-300 shadow-2xl shadow-yellow-500/30 ring-4 ring-yellow-400/20' :
                            index === 1 ? 'bg-gradient-to-br from-gray-50 via-gray-100/50 to-slate-50 border-gray-300 shadow-2xl shadow-gray-500/30 ring-4 ring-gray-400/20' :
                            index === 2 ? 'bg-gradient-to-br from-amber-50 via-amber-100/50 to-orange-50 border-amber-300 shadow-2xl shadow-amber-500/30 ring-4 ring-amber-400/20' :
                            isCurrentPlayer ? 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 border-blue-400 ring-4 ring-blue-400/30 shadow-2xl shadow-blue-500/30' :
                            'bg-gradient-to-br from-white via-gray-50/30 to-slate-50 border-gray-200 hover:border-gray-300 hover:shadow-xl'
                          }`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {/* Animated background effects for top 3 */}
                          {index < 3 && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                          )}
                          
                          <div className="flex items-center justify-between p-8 relative">
                            <div className="flex items-center gap-8">
                              <div className="flex items-center gap-4">
                                {getRankIcon(index)}
                                <div className="text-center">
                                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</div>
                                  <div className="text-2xl font-black bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                                    #{index + 1}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                                    <p className="font-black text-xl font-mono bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                                      {isCurrentPlayer ? 'You' : `${player.player_address.slice(0, 6)}...${player.player_address.slice(-4)}`}
                                    </p>
                                  </div>
                                  {isCurrentPlayer && (
                                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-3 py-1 shadow-lg">
                                      <Star className="h-3 w-3 mr-1" />
                                      You
                                    </Badge>
                                  )}
                                  {getRankBadge(index)}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-3 py-2 rounded-full">
                                    <Target className="h-4 w-4 text-orange-600" />
                                    <span className="font-semibold text-orange-700 dark:text-orange-300">
                                      {player.games_played} games
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-full">
                                    <Trophy className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold text-green-700 dark:text-green-300">
                                      {player.wins} wins ({player.win_rate}%)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-2 rounded-full">
                                    <Zap className="h-4 w-4 text-purple-600" />
                                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                                      {player.accuracy}% accuracy
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-full">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                                      {new Date(player.last_played).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                
                                {player.achievements.length > 0 && (
                                  <div className="flex items-center gap-3 mt-3">
                                    <span className="text-sm font-semibold text-muted-foreground">🏆 Achievements:</span>
                                    <div className="flex gap-2 flex-wrap">
                                      {player.achievements.slice(0, 3).map((achievement, i) => (
                                        <Badge key={i} variant="outline" className="text-xs font-medium bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-700">
                                          {achievement}
                                        </Badge>
                                      ))}
                                      {player.achievements.length > 3 && (
                                        <Badge variant="outline" className="text-xs font-medium bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 text-gray-600">
                                          +{player.achievements.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="text-4xl font-black bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent mb-1">
                                    {player.total_score.toLocaleString()}
                                  </div>
                                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Points</div>
                                </div>
                                {index === 0 && (
                                  <div className="animate-bounce">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                                      <Crown className="h-6 w-6 text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-4 py-2 rounded-xl">
                                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">Best Score</span>
                                  <span className="font-bold text-green-800 dark:text-green-200">{player.best_score.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-2 rounded-xl">
                                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Average</span>
                                  <span className="font-bold text-blue-800 dark:text-blue-200">{player.average_score.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lobby Leaderboards */}
          <TabsContent value="lobbies" className="space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users className="h-6 w-6 text-blue-500" />
                  Recent Lobby Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lobbyLeaderboards.map((lobby) => (
                    <Card key={lobby.lobby_id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Lobby #{lobby.lobby_id}</CardTitle>
                          <Badge variant="outline">
                            {lobby.total_players} players
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(lobby.created_at).toLocaleDateString()}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {lobby.players.slice(0, 3).map((player, index) => (
                            <div key={`${lobby.lobby_id}-${player.player_address}-${index}`} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getRankIcon(index)}
                                <span className="text-sm font-medium">
                                  {player.player_address.slice(0, 6)}...{player.player_address.slice(-4)}
                                </span>
                              </div>
                              <Badge variant="outline">{player.total_score} pts</Badge>
                            </div>
                          ))}
                          {lobby.players.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{lobby.players.length - 3} more players
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Award className="h-6 w-6 text-purple-500" />
                  Achievement Collection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className={`border-0 shadow-lg transition-all duration-300 hover:scale-105 ${
                      achievement.unlocked ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gray-50'
                    }`}>
                      <CardContent className="p-4 text-center">
                        <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl ${
                          achievement.unlocked 
                            ? getAchievementRarityColor(achievement.rarity)
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {achievement.unlocked ? achievement.icon : '🔒'}
                        </div>
                        <h3 className="font-semibold mb-1">{achievement.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                        <Badge 
                          variant={achievement.unlocked ? "default" : "secondary"}
                          className={achievement.unlocked ? getAchievementRarityColor(achievement.rarity) : ""}
                        >
                          {achievement.rarity}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
