"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  Clock, 
  Trophy, 
  Users, 
  Zap,
  CheckCircle,
  Timer
} from "lucide-react"

interface QuizProgressProps {
  currentQuestion: number
  totalQuestions: number
  playerScore: number
  timeRemaining: number
  questionDuration: number
  playersFinished: number
  totalPlayers: number
  isLastQuestion?: boolean
  questionSource?: 'ai' | 'fallback' | null
}

export default function QuizProgress({
  currentQuestion,
  totalQuestions,
  playerScore,
  timeRemaining,
  questionDuration,
  playersFinished,
  totalPlayers,
  isLastQuestion = false,
  questionSource = null
}: QuizProgressProps) {
  // Fix progress calculation - currentQuestion is 0-based, but we want 1-based for display
  const displayQuestion = Math.min(currentQuestion + 1, totalQuestions)
  const progressPercentage = (displayQuestion / totalQuestions) * 100
  const timePercentage = Math.max(0, Math.min(100, (timeRemaining / questionDuration) * 100))
  const isTimeRunningLow = timeRemaining <= 5
  const isTimeCritical = timeRemaining <= 2
  const gradientBar = isTimeCritical
    ? 'from-red-600 via-red-500 to-orange-500 animate-pulse'
    : isTimeRunningLow
    ? 'from-rose-500 via-red-500 to-orange-500'
    : 'from-emerald-500 via-green-500 to-teal-500'
  const subtleBg = 'bg-gradient-to-r from-white via-blue-50/40 to-purple-50/40'

  return (
    <div className="sticky top-20 z-40 w-full mb-6 px-4 animate-in slide-in-from-top-4 duration-500">
      <Card className={`border-0 shadow-2xl ${subtleBg} backdrop-blur-xl hover:shadow-3xl transition-all duration-300`}
        style={{ borderRadius: 16 }}>
        <CardContent className="p-4">
          {/* Horizontal Layout */}
          <div className="flex items-center justify-between gap-6">
            
            {/* Left: Question Progress */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Question</div>
                  <div className="text-lg font-bold text-blue-600">
                    {displayQuestion}/{totalQuestions}
                  </div>
                </div>
              </div>
              
              <div className="w-28">
                <div className={`h-2 w-full rounded-full bg-gray-200 overflow-hidden`}>
                  <div
                    className={`h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 transition-all`}
                    style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
                  />
                </div>
                <div className="text-xs text-center text-gray-600 mt-1 font-semibold">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
            </div>

            {/* Center: Score & Time */}
            <div className="flex items-center gap-8">
              {/* Score */}
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Score</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {playerScore.toLocaleString()}
                </div>
              </div>

              {/* Time */}
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className={`h-4 w-4 ${isTimeCritical ? 'text-red-600 animate-pulse' : isTimeRunningLow ? 'text-red-600' : 'text-orange-600'}`} />
                  <span className="text-sm font-medium text-gray-700">Time</span>
                </div>
                <div className={`text-2xl font-bold transition-colors duration-300 ${
                  isTimeCritical ? 'text-red-600 animate-pulse' : 
                  isTimeRunningLow ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {Math.max(0, timeRemaining)}s
                </div>
                {isTimeCritical && (
                  <div className="text-xs text-red-600 font-bold animate-bounce">
                    🚨 CRITICAL!
                  </div>
                )}
                {isTimeRunningLow && !isTimeCritical && (
                  <div className="text-xs text-red-600 font-medium animate-pulse">
                    ⚠️ Hurry!
                  </div>
                )}
              </div>
            </div>

            {/* Right: Lobby Status */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Players</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {playersFinished}/{totalPlayers}
                </div>
                <div className="text-xs text-gray-600">
                  {playersFinished === totalPlayers ? 'All done!' : 'playing'}
                </div>
              </div>

              {/* Question Source Badge */}
              {questionSource && (
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  questionSource === 'ai' 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                }`}>
                  {questionSource === 'ai' ? '🤖 AI Questions' : '📚 Fallback'}
                </div>
              )}

              {/* Final Question Badge */}
              {isLastQuestion && (
                <div className="px-3 py-1 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-full text-sm font-bold animate-pulse">
                  🎉 Final Q!
                </div>
              )}
            </div>

          </div>

          {/* Bottom: Enhanced Time Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="relative h-4 rounded-full overflow-hidden bg-gray-200 shadow-inner">
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradientBar} transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(100, Math.max(0, timePercentage))}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[11px] font-bold transition-colors duration-300 ${
                  isTimeCritical ? 'text-white' : 
                  isTimeRunningLow ? 'text-red-800' : 'text-gray-700'
                }`}>
                  {Math.round(timePercentage)}% time left
                </span>
              </div>
            </div>
            
            {/* Question Progress Indicator */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Question {displayQuestion} of {totalQuestions}</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}