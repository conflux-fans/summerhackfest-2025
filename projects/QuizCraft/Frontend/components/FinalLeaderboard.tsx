"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  Zap, 
  Target,
  Share2,
  Download,
  Twitter,
  Copy,
  CheckCircle,
  Users,
  Timer,
  Award
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PlayerResult {
  player_address: string
  score: number
  correct_answers: number
  total_questions: number
  time_bonus: number
  has_played: boolean
}

interface FinalLeaderboardProps {
  results: PlayerResult[]
  lobbyId: string
  currentPlayerAddress?: string
  onPlayAgain?: () => void
  onBackToLobby?: () => void
}

export default function FinalLeaderboard({
  results,
  lobbyId,
  currentPlayerAddress,
  onPlayAgain,
  onBackToLobby
}: FinalLeaderboardProps) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [winner, setWinner] = useState<PlayerResult | null>(null)
  const [isCurrentPlayerWinner, setIsCurrentPlayerWinner] = useState(false)

  // Sort results by score with tie-breakers
  const sortedResults = results
    .filter(r => r.has_played)
    .sort((a, b) => {
      // Primary sort: by score (highest first)
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

  useEffect(() => {
    if (sortedResults.length > 0) {
      setWinner(sortedResults[0])
      setIsCurrentPlayerWinner(
        currentPlayerAddress && 
        sortedResults[0].player_address.toLowerCase() === currentPlayerAddress.toLowerCase()
      )
      
      // Show celebration after a short delay
      setTimeout(() => {
        setShowCelebration(true)
      }, 1000)
    }
  }, [sortedResults, currentPlayerAddress])

  const getRankIcon = (index: number) => {
    if (index === 0) {
      return (
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-500 shadow-2xl shadow-yellow-500/50 animate-bounce">
          <Crown className="h-8 w-8 text-white" />
        </div>
      )
    } else if (index === 1) {
      return (
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-500 border-4 border-gray-400 shadow-xl shadow-gray-500/50">
          <Medal className="h-7 w-7 text-white" />
        </div>
      )
    } else if (index === 2) {
      return (
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-amber-500 shadow-lg shadow-amber-500/50">
          <Medal className="h-6 w-6 text-white" />
        </div>
      )
    } else {
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-500">
          <span className="text-white font-bold">{index + 1}</span>
        </div>
      )
    }
  }

  const getRankTitle = (index: number) => {
    const titles = [
      "🏆 Champion",
      "🥈 Runner-up", 
      "🥉 Third Place",
      "⭐ Player"
    ]
    return titles[Math.min(index, titles.length - 1)]
  }

  const shareResults = async () => {
    const resultText = `🎉 Quiz Results for Lobby #${lobbyId}:\n\n` +
      sortedResults.slice(0, 3).map((result, index) => 
        `${index + 1}. ${result.player_address.slice(0, 6)}...${result.player_address.slice(-4)}: ${result.score} points`
      ).join('\n')
    
    try {
      await navigator.clipboard.writeText(resultText)
      toast({
        title: "Success!",
        description: "Results copied to clipboard!",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy results",
        variant: "destructive",
      })
    }
  }

  const shareToTwitter = () => {
    const text = `Just finished a QuizCraft game in Lobby #${lobbyId}! 🎮`
    const url = window.location.origin
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Celebration Background */}
      {showCelebration && isCurrentPlayerWinner && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 animate-pulse" />
          <div className="absolute top-1/4 left-1/4 text-6xl animate-bounce">🎉</div>
          <div className="absolute top-1/3 right-1/4 text-4xl animate-bounce delay-100">🏆</div>
          <div className="absolute bottom-1/3 left-1/3 text-5xl animate-bounce delay-200">⭐</div>
          <div className="absolute bottom-1/4 right-1/3 text-4xl animate-bounce delay-300">🎊</div>
        </div>
      )}

      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-2xl">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              🎉 Quiz Complete!
            </h1>
          </div>
          
          {isCurrentPlayerWinner && (
            <div className="bg-gradient-to-r from-yellow-200 to-orange-200 border-2 border-yellow-400 rounded-2xl p-6 shadow-xl animate-pulse">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                <Crown className="h-8 w-8 text-yellow-600" />
                Congratulations! You're the Champion! 🏆
                <Crown className="h-8 w-8 text-yellow-600" />
              </h2>
            </div>
          )}
          
          <p className="text-gray-600 text-lg">
            Final Results for Lobby #{lobbyId}
          </p>
        </div>

        {/* Leaderboard */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
                <Award className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Final Leaderboard
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {sortedResults.map((player, index) => {
              const isCurrentPlayer = currentPlayerAddress && 
                player.player_address.toLowerCase() === currentPlayerAddress.toLowerCase()
              
              return (
                <div
                  key={`final-${player.player_address}-${index}`}
                  className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 shadow-xl shadow-yellow-500/30 scale-105' :
                    index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 shadow-lg shadow-gray-500/30' :
                    index === 2 ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300 shadow-lg shadow-amber-500/30' :
                    'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300'
                  } ${isCurrentPlayer ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}`}
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animation: showCelebration ? 'slideInUp 0.6s ease-out forwards' : 'none'
                  }}
                >
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-6">
                      {getRankIcon(index)}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <p className={`font-bold text-lg font-mono ${
                            isCurrentPlayer ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            {isCurrentPlayer ? 'You' : `${player.player_address.slice(0, 6)}...${player.player_address.slice(-4)}`}
                          </p>
                          {isCurrentPlayer && (
                            <Badge className="bg-blue-500 text-white">
                              <Star className="h-3 w-3 mr-1" />
                              You
                            </Badge>
                          )}
                          <Badge className={`${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-500 text-white' :
                            index === 2 ? 'bg-amber-600 text-white' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {getRankTitle(index)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {player.correct_answers}/{player.total_questions} correct
                          </span>
                          {player.time_bonus > 0 && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Zap className="h-4 w-4" />
                              +{player.time_bonus} time bonus
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            {Math.round((player.correct_answers / player.total_questions) * 100)}% accuracy
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-3">
                        <span className={`text-4xl font-bold ${
                          index === 0 ? 'text-yellow-600' :
                          index === 1 ? 'text-gray-600' :
                          index === 2 ? 'text-amber-600' :
                          'text-blue-600'
                        }`}>
                          {player.score.toLocaleString()}
                        </span>
                        {index === 0 && (
                          <div className="animate-bounce">
                            <Crown className="h-8 w-8 text-yellow-500" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-500">points</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">{sortedResults.length}</div>
                <div className="text-sm text-gray-600">Total Players</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(sortedResults.reduce((sum, p) => sum + p.score, 0) / sortedResults.length)}
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-600">
                  {sortedResults.reduce((sum, p) => sum + p.correct_answers, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Correct</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-orange-600">
                  {winner?.score || 0}
                </div>
                <div className="text-sm text-gray-600">Highest Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={shareResults}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 hover:bg-blue-50 border-blue-200"
          >
            <Copy className="h-5 w-5" />
            Copy Results
          </Button>
          
          <Button
            onClick={shareToTwitter}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 hover:bg-blue-50 border-blue-200"
          >
            <Twitter className="h-5 w-5" />
            Share on Twitter
          </Button>
          
          {onPlayAgain && (
            <Button
              onClick={onPlayAgain}
              size="lg"
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            >
              <Zap className="h-5 w-5" />
              Play Again
            </Button>
          )}
          
          {onBackToLobby && (
            <Button
              onClick={onBackToLobby}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <Users className="h-5 w-5" />
              Back to Lobby
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
