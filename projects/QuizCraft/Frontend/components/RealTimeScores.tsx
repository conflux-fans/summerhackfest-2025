"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, RefreshCw, Users, Medal, Crown, Star, Zap, Target } from "lucide-react"

interface RealTimeScoresProps {
  lobbyId: string | number
  refreshInterval?: number // in milliseconds
  gameState?: 'waiting' | 'playing' | 'finished' // Add game state
  currentPlayerAddress?: string // Add current player for highlighting
}

interface PlayerScore {
  player_address: string
  score: number
  correct_answers: number
  total_questions: number
  time_bonus: number
  has_played: boolean
}

export default function RealTimeScores({ lobbyId, refreshInterval = 10000, gameState = 'waiting', currentPlayerAddress }: RealTimeScoresProps) {
  const [scores, setScores] = useState<PlayerScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Early return if lobbyId is invalid
  if (!lobbyId || lobbyId === 'undefined' || lobbyId === 'null') {
    return (
      <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-white via-red-50/30 to-red-50/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium">Invalid lobby ID. Please check the URL.</p>
        </CardContent>
      </Card>
    )
  }

  const fetchScores = async () => {
    try {
      // Prevent multiple simultaneous requests
      if (loading) return
      
      setLoading(true)
      
      // Validate lobbyId before making the request
      if (!lobbyId || lobbyId === 'undefined' || lobbyId === 'null') {
        throw new Error('Invalid lobby ID')
      }
      
      console.log('Fetching scores for lobbyId:', lobbyId)
      const response = await fetch(`/api/scores/all-players?lobbyId=${lobbyId}`)
      
      if (!response.ok) {
        console.error('Response not OK:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        })
        
        let errorData
        try {
          errorData = await response.json()
          console.error('API Error Data:', errorData)
        } catch (parseError) {
          console.error('Failed to parse error response as JSON:', parseError)
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Fetched scores data:', data)
      console.log('Debug info:', data.debug)
      setScores(data.players || [])
      setLastUpdated(new Date())
      setError(null)
    } catch (err: any) {
      console.error('Error fetching real-time scores:', err)
      setError(err.message || 'Failed to fetch scores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch scores immediately on mount
    fetchScores()
    
    // No automatic refresh - only manual refresh via button
  }, [lobbyId])

  const getRankIcon = (index: number, hasPlayed: boolean) => {
    if (!hasPlayed) {
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 animate-pulse">
          <Zap className="h-5 w-5 text-gray-500" />
        </div>
      )
    }

    if (index === 0) {
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-500 shadow-lg shadow-yellow-500/30">
          <Crown className="h-5 w-5 text-white" />
        </div>
      )
    } else if (index === 1) {
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-500 border-2 border-gray-400 shadow-lg shadow-gray-500/30">
          <Medal className="h-5 w-5 text-white" />
        </div>
      )
    } else if (index === 2) {
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-500 shadow-lg shadow-amber-500/30">
          <Medal className="h-5 w-5 text-white" />
        </div>
      )
    } else {
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-500 shadow-md">
          <span className="text-white font-bold text-sm">{index + 1}</span>
        </div>
      )
    }
  }

  const getRankBadge = (index: number, hasPlayed: boolean) => {
    if (!hasPlayed) {
      return (
        <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600">
          <Target className="h-3 w-3 mr-1" />
          Waiting
        </Badge>
      )
    }

    if (index === 0) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 shadow-lg">
          <Crown className="h-3 w-3 mr-1" />
          Champion
        </Badge>
      )
    } else if (index === 1) {
      return (
        <Badge className="bg-gradient-to-r from-gray-400 to-gray-600 text-white border-0 shadow-lg">
          <Medal className="h-3 w-3 mr-1" />
          Runner-up
        </Badge>
      )
    } else if (index === 2) {
      return (
        <Badge className="bg-gradient-to-r from-amber-500 to-amber-700 text-white border-0 shadow-lg">
          <Medal className="h-3 w-3 mr-1" />
          Third Place
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
          <Star className="h-3 w-3 mr-1" />
          Player
        </Badge>
      )
    }
  }

  return (
    <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {gameState === 'waiting' ? 'Lobby Players' : 
                   gameState === 'playing' ? 'Live Scores' : 
                   'Final Results'}
                </div>
                <div className="text-sm text-gray-600 font-normal">
                  {gameState === 'waiting' ? 'Players waiting to start the game' : 
                   gameState === 'playing' ? 'Live on-chain scores during quiz' : 
                   'Final scores and rankings'}
                </div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{scores.length} players</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>{gameState === 'finished' ? 'Final scores' : 'Real-time updates'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Last updated</div>
                <div className="text-xs font-medium">{lastUpdated.toLocaleTimeString()}</div>
              </div>
            )}
            <Button
              onClick={fetchScores}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              ) : (
                <RefreshCw className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-blue-600 font-medium">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <Button 
              onClick={fetchScores} 
              variant="outline" 
              size="sm" 
              className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        ) : loading && scores.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <RefreshCw className="h-10 w-10 animate-spin text-blue-500" />
            </div>
            <p className="text-muted-foreground font-medium">Loading leaderboard...</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="p-12 text-center">
            {/* Big Celebration Button */}
            <div className="mb-8">
              <button
                onClick={fetchScores}
                disabled={loading}
                className="group relative inline-flex items-center justify-center px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                title="Click to reveal the leaderboard!"
              >
                {/* Celebration Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Big Celebration Emojis */}
                <div className="relative z-10 flex items-center gap-4">
                  <span className="text-4xl animate-bounce">🌸</span>
                  <span className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎉</span>
                  <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
                  <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎊</span>
                  <span className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌺</span>
                </div>
                
                {/* Loading State */}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full">
                    <RefreshCw className="h-10 w-10 text-white animate-spin" />
                  </div>
                )}
              </button>
            </div>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
              Click on this to reveal the Leaderboard!
            </p>
            <p className="text-lg text-gray-600 font-medium">
              🌸 Celebrate the winners! 🌸
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {scores
              .slice()
              .sort((a, b) => {
                // First sort by whether they've played (played players first)
                if (a.has_played !== b.has_played) {
                  return b.has_played ? -1 : 1
                }
                // Then sort by score (highest first)
                if (b.score !== a.score) {
                  return b.score - a.score
                }
                // Tie-breaker 1: More correct answers
                if (b.correct_answers !== a.correct_answers) {
                  return b.correct_answers - a.correct_answers
                }
                // Tie-breaker 2: Higher time bonus
                if (b.time_bonus !== a.time_bonus) {
                  return b.time_bonus - a.time_bonus
                }
                // Tie-breaker 3: Alphabetical by address (deterministic)
                return a.player_address.localeCompare(b.player_address)
              })
              .map((player, index) => {
                // Calculate rank based on the sorted array index
                // Only players who have played get ranks
                const playedPlayers = scores.filter(p => p.has_played)
                const sortedPlayedPlayers = playedPlayers.sort((a, b) => {
                  // Same sorting logic as above
                  if (b.score !== a.score) {
                    return b.score - a.score
                  }
                  // Tie-breaker 1: More correct answers
                  if (b.correct_answers !== a.correct_answers) {
                    return b.correct_answers - a.correct_answers
                  }
                  // Tie-breaker 2: Higher time bonus
                  if (b.time_bonus !== a.time_bonus) {
                    return b.time_bonus - a.time_bonus
                  }
                  // Tie-breaker 3: Alphabetical by address (deterministic)
                  return a.player_address.localeCompare(b.player_address)
                })
                const playerRank = sortedPlayedPlayers.findIndex(p => p.player_address === player.player_address)
                const isTopThree = player.has_played && playerRank >= 0 && playerRank < 3
                const isCurrentPlayer = currentPlayerAddress && 
                  player.player_address.toLowerCase() === currentPlayerAddress.toLowerCase()
                
                return (
                <div
                  key={`realtime-${player.player_address}-${index}`}
                  className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                    isCurrentPlayer ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 ring-2 ring-green-400 ring-opacity-50 shadow-lg shadow-green-500/20' :
                    isTopThree && playerRank === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 shadow-lg shadow-yellow-500/20' :
                    isTopThree && playerRank === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 shadow-lg shadow-gray-500/20' :
                    isTopThree && playerRank === 2 ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300 shadow-lg shadow-amber-500/20' :
                    player.has_played ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300' :
                    'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                    isTopThree && playerRank === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    isTopThree && playerRank === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                    isTopThree && playerRank === 2 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                    'bg-gradient-to-r from-blue-400 to-indigo-600'
                  }`} />
                  
                  <div className="relative flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      {getRankIcon(playerRank, player.has_played)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 font-mono">
                            {isCurrentPlayer ? 'You' : `${player.player_address.slice(0, 6)}...${player.player_address.slice(-4)}`}
                          </p>
                          {isCurrentPlayer && (
                            <Badge className="bg-green-500 text-white border-0 shadow-lg">
                              <Star className="h-3 w-3 mr-1" />
                              You
                            </Badge>
                          )}
                          {!isCurrentPlayer && getRankBadge(playerRank, player.has_played)}
                        </div>
                        {player.has_played && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {player.correct_answers}/{player.total_questions} correct
                            </span>
                            {player.time_bonus > 0 && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Zap className="h-3 w-3" />
                                +{player.time_bonus} time bonus
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className={`text-3xl font-bold ${
                          isTopThree && playerRank === 0 ? 'text-yellow-600' :
                          isTopThree && playerRank === 1 ? 'text-gray-600' :
                          isTopThree && playerRank === 2 ? 'text-amber-600' :
                          player.has_played ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {player.score.toLocaleString()}
                        </span>
                        {isTopThree && playerRank === 0 && (
                          <div className="animate-bounce">
                            <Crown className="h-6 w-6 text-yellow-500" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">points</p>
                    </div>
                  </div>
                </div>
                )
              })
            }
            
            {/* Summary Stats */}
            {scores.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">{scores.length}</div>
                    <div className="text-sm text-muted-foreground">Total Players</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-green-600">
                      {scores.filter(p => p.has_played).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-orange-600">
                      {scores.filter(p => !p.has_played).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Waiting</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-purple-600">
                      {scores.length > 0 ? Math.round(scores.reduce((sum, p) => sum + p.score, 0) / scores.length) : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Score</div>
                  </div>
                </div>
              </div>
            )}

            {/* No action buttons post-game as requested */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}