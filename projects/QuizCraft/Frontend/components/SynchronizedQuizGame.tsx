'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Trophy, Users, Zap, Shield, Target, Crown, Star } from 'lucide-react';
import { ethers } from 'ethers';
import QuizProgress from './QuizProgress';
import FinalLeaderboard from './FinalLeaderboard';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

interface SynchronizedQuizGameProps {
  lobbyId: string;
  players: string[];
  category?: string;
  onGameEnd: (results: GameResult[]) => void;
  onScoreUpdate?: (scores: Record<string, number>) => void;
  questionDurationSec: number;
  seed: string;
  currentPlayerAddress: string;
}

interface GameResult {
  player: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeBonus: number;
}

interface LivePlayer {
  address: string;
  score: number;
  currentQuestion: number;
  isConnected: boolean;
}

export default function SynchronizedQuizGame({ 
  lobbyId, 
  players, 
  category, 
  onGameEnd, 
  onScoreUpdate, 
  questionDurationSec, 
  seed, 
  currentPlayerAddress 
}: SynchronizedQuizGameProps) {
  const [gameState, setGameState] = useState<'waiting' | 'countdown' | 'playing' | 'finished'>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(questionDurationSec);
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [questionSource, setQuestionSource] = useState<'ai' | 'fallback' | null>(null);
  const [gameProtectionActive, setGameProtectionActive] = useState(false);
  
  // Hydrate scores from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`quizcraft:scores:${lobbyId}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        console.log('SynchronizedQuizGame hydrating scores from sessionStorage:', parsed)
        setPlayerScores(parsed)
      }
    } catch (e) {
      console.error('Error hydrating SynchronizedQuizGame scores:', e)
    }
  }, [lobbyId])

  // Persist scores to sessionStorage
  useEffect(() => {
    try {
      console.log('SynchronizedQuizGame persisting scores to sessionStorage:', playerScores)
      sessionStorage.setItem(`quizcraft:scores:${lobbyId}`, JSON.stringify(playerScores))
    } catch (e) {
      console.error('Error persisting SynchronizedQuizGame scores:', e)
    }
  }, [lobbyId, playerScores])
  
  // Synchronization states
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [livePlayers, setLivePlayers] = useState<LivePlayer[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [scoresSubmitted, setScoresSubmitted] = useState(false);

  // Generate quiz once when component mounts
  useEffect(() => {
    if (questions.length === 0) {
      generateQuiz()
    }
  }, [])

  // Ensure game starts when questions are loaded and game should be playing
  useEffect(() => {
    
    if (gameState === 'playing' && questions.length > 0 && gameStartTime) {
      // Call startSynchronizedGame directly without dependency to avoid circular reference
      startSynchronizedGameInternal(gameStartTime)
    }
  }, [gameState, questions.length, gameStartTime])

  // Sync with game server to get start time
  useEffect(() => {
    const syncWithGame = async () => {
      try {
        const response = await fetch(`/api/game-sync?lobbyId=${lobbyId}`)
        const data = await response.json()
        
        if (data.success) {
          setGameStartTime(data.gameStartTime)
          setCountdown(data.countdown)
          
          if (data.hasStarted) {
            setGameState('playing')
            startSynchronizedGameInternal(data.gameStartTime)
          } else if (data.countdown > 0) {
            setGameState('countdown')
            startCountdown(data.countdown)
          }
        } else {
          setGameState('waiting')
        }
      } catch (error) {
        console.error('Sync error:', error)
        setSyncError('Failed to sync with game server')
      }
    }

    // Initial sync
    syncWithGame()

    // Poll for sync updates - reduced frequency
    const syncInterval = setInterval(syncWithGame, 3000)
    return () => clearInterval(syncInterval)
  }, [lobbyId])

  const startSynchronizedGameInternal = useCallback((startTime: number) => {
    
    if (questions.length === 0) {
      return
    }
    
    setGameProtectionActive(true)
    
    // Calculate which question we should be on based on elapsed time
    const now = Date.now()
    const elapsed = now - startTime
    const questionIndex = Math.floor(elapsed / (questionDurationSec * 1000))
    const questionElapsed = elapsed % (questionDurationSec * 1000)
    const timeRemaining = Math.max(0, questionDurationSec - Math.floor(questionElapsed / 1000))
    
    
    // Ensure question index doesn't exceed bounds
    const safeQuestionIndex = Math.min(questionIndex, questions.length - 1)
    
    if (questionIndex >= questions.length) {
      // Game should have ended
      console.log('Game ended via questionIndex check');
      endGame()
      return
    }
    
    setCurrentQuestion(safeQuestionIndex)
    setTimeLeft(timeRemaining)
    
    // Track the last processed question to prevent unnecessary resets
    let lastProcessedQuestion = safeQuestionIndex
    
    // Start synchronized timer
    const syncTimer = setInterval(() => {
      const currentTime = Date.now()
      const currentElapsed = currentTime - startTime
      const currentQuestionIndex = Math.floor(currentElapsed / (questionDurationSec * 1000))
      const currentQuestionElapsed = currentElapsed % (questionDurationSec * 1000)
      const currentTimeRemaining = Math.max(0, questionDurationSec - Math.floor(currentQuestionElapsed / 1000))
      
      // Ensure question index doesn't exceed bounds
      const safeCurrentQuestionIndex = Math.min(currentQuestionIndex, questions.length - 1)
      
      if (currentQuestionIndex >= questions.length) {
        clearInterval(syncTimer)
        console.log('Game ended via currentQuestionIndex check');
        endGame()
        return
      }
      
      // Only reset answer state when we actually move to a NEW question
      if (safeCurrentQuestionIndex !== lastProcessedQuestion) {
        console.log(`SynchronizedQuizGame question changed from ${lastProcessedQuestion} to ${safeCurrentQuestionIndex}, resetting selection`);
        
        // Update the tracked question
        lastProcessedQuestion = safeCurrentQuestionIndex
        
        // Update current question state
        setCurrentQuestion(safeCurrentQuestionIndex)
        
        // Reset selection and answered state for new question
        setSelectedAnswer(null);
        setIsAnswered(false);
        setTimerActive(true); // Start timer for new question
        setShowExplanation(false)
      }
      
      setTimeLeft(currentTimeRemaining)
    }, 100) // Update every 100ms for smooth sync
    
    return () => clearInterval(syncTimer)
  }, [questions.length, questionDurationSec, questions])

  const startCountdown = useCallback((initialCountdown: number) => {
    let count = initialCountdown
    setCountdown(count)
    
    const countdownInterval = setInterval(() => {
      count -= 1
      setCountdown(count)
      
      if (count <= 0) {
        clearInterval(countdownInterval)
        setGameState('playing')
        startSynchronizedGameInternal(gameStartTime!)
      }
    }, 1000)
  }, [gameStartTime, startSynchronizedGameInternal])

  // Update live player scores
  useEffect(() => {
    const updateLiveScores = async () => {
      if (gameState !== 'playing') return
      
      try {
        const response = await fetch(`/api/scores/all-players?lobbyId=${lobbyId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.players) {
            const liveData = data.players.map((p: any) => ({
              address: p.player_address,
              score: p.score,
              currentQuestion: currentQuestion, // Assume same question for all
              isConnected: true
            }))
            setLivePlayers(liveData)
          }
        }
      } catch (error) {
        console.error('Error updating live scores:', error)
      }
    }

    const interval = setInterval(updateLiveScores, 2000) // Update every 2 seconds
    return () => clearInterval(interval)
  }, [lobbyId, gameState, currentQuestion])

  const generateQuiz = async () => {
    try {
      
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category || 'Technology',
          difficulty: 'medium',
          questionCount: 10,
          timePerQuestion: questionDurationSec,
          seed,
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setQuestions(data.quiz.questions)
        setTimeLeft(questionDurationSec)
        const usedFallback = Boolean(data.debug?.fallbackUsed)
        const source = usedFallback ? 'fallback' : 'ai'
        setQuestionSource(source)
      } else {
        const placeholder = {
          id: 'placeholder',
          question: 'Placeholder question: Which letter comes first?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          timeLimit: questionDurationSec,
          explanation: 'The correct answer is "A".',
          category: category || 'General',
          difficulty: 'easy' as const,
        }
        setQuestions([placeholder])
        setTimeLeft(placeholder.timeLimit)
        setQuestionSource('fallback')
      }
    } catch (error) {
      console.error('Error generating quiz:', error)
    }
  }

  const endGame = async () => {
    if (scoresSubmitted) {
      console.log('Synchronized scores already submitted, skipping duplicate submission');
      return;
    }
    
    // Additional safeguard: check if game is already finished
    if (gameState === 'finished') {
      console.log('Game already finished, skipping duplicate endGame call');
      return;
    }
    
    console.log('Ending synchronized game - first time');
    setGameState('finished')
    setGameProtectionActive(false)
    setScoresSubmitted(true)
    
    
    // Calculate final results - get the most up-to-date score
    // First try to get from sessionStorage (more reliable)
    let currentPlayerScore = 0;
    try {
      const raw = sessionStorage.getItem(`quizcraft:scores:${lobbyId}`)
      if (raw) {
        const sessionScores = JSON.parse(raw)
        // Find current player's score with case-insensitive matching
        for (const [key, score] of Object.entries(sessionScores)) {
          if (key.toLowerCase() === currentPlayerAddress.toLowerCase()) {
            currentPlayerScore = Number(score);
            break;
          }
        }
      }
    } catch (e) {
      console.error('Error getting sessionStorage scores:', e)
    }
    
    // Fallback to state if sessionStorage doesn't have the score
    if (currentPlayerScore === 0) {
      currentPlayerScore = playerScores[currentPlayerAddress] || 0;
    }
    
    console.log('SynchronizedQuizGame final score:', currentPlayerScore, 'from playerScores:', playerScores[currentPlayerAddress]);
    
    const currentPlayerCorrectAnswers = Math.floor(currentPlayerScore / 100)
    const currentPlayerTimeBonus = currentPlayerScore % 100
    
    const results: GameResult[] = players.map(player => {
      if (player.toLowerCase() === currentPlayerAddress.toLowerCase()) {
        return {
          player,
          score: currentPlayerScore,
          correctAnswers: currentPlayerCorrectAnswers,
          totalQuestions: questions.length,
          timeBonus: currentPlayerTimeBonus
        }
      } else {
        // Get other players' scores from live data
        const livePlayer = livePlayers.find(p => p.address.toLowerCase() === player.toLowerCase())
        const score = livePlayer?.score || 0
        return {
          player,
          score,
          correctAnswers: Math.floor(score / 100),
          totalQuestions: questions.length,
          timeBonus: score % 100
        }
      }
    })
    
    setGameResults(results)
    onGameEnd(results)
    
    // Store results
    const scoresData = {
      lobbyId: lobbyId,
      players: players,
      scores: players.map(p => {
        const result = results.find(r => r.player.toLowerCase() === p.toLowerCase())
        return result?.score || 0
      }),
      detailedResults: results,
      timestamp: Date.now(),
      status: 'completed',
      totalQuestions: questions.length,
      category: category || 'Technology',
      currentPlayerAddress: currentPlayerAddress,
      currentPlayerScore: currentPlayerScore,
      synchronized: true
    }
    
    localStorage.setItem(`quizcraft:lobby-scores:${lobbyId}`, JSON.stringify(scoresData))
    sessionStorage.setItem(`quizcraft:local-scores:${lobbyId}`, JSON.stringify(scoresData))
    
    // Submit current player's score to Supabase
    try {
      const currentPlayerData = {
        player_address: currentPlayerAddress,
        score: currentPlayerScore,
        correct_answers: currentPlayerCorrectAnswers,
        total_questions: questions.length,
        time_bonus: currentPlayerTimeBonus
      };
      
      console.log('Submitting synchronized game score to Supabase:', currentPlayerData);
      
      await fetch('/api/scores/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lobbyId: Number(lobbyId),
          results: [currentPlayerData]
        })
      });
      
      console.log('Synchronized game score submitted successfully to Supabase');
    } catch (e) {
      console.error('Failed to submit synchronized game score to Supabase:', e);
    }
    
    console.log('Synchronized game results stored:', scoresData)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    console.log(`SynchronizedQuizGame handleAnswerSelect: answerIndex=${answerIndex}, selectedAnswer=${selectedAnswer}, gameState=${gameState}, currentQuestion=${currentQuestion}`);
    
    // Prevent multiple selections and ensure we're in playing state
    if (selectedAnswer !== null || isAnswered || gameState !== 'playing') {
      console.log(`SynchronizedQuizGame answer selection blocked: selectedAnswer=${selectedAnswer}, isAnswered=${isAnswered}, gameState=${gameState}`);
      return;
    }
    
    const question = questions[currentQuestion]
    if (!question) return
    
    // Use functional update to ensure we get the latest state
    setSelectedAnswer(prev => {
      if (prev !== null) {
        console.log(`SynchronizedQuizGame selection already exists: ${prev}, ignoring new selection: ${answerIndex}`);
        return prev; // Don't change if already selected
      }
      console.log(`SynchronizedQuizGame setting selection to: ${answerIndex}`);
      return answerIndex;
    });
    
    // Mark as answered to lock the selection and stop timer
    setIsAnswered(true);
    setTimerActive(false); // Stop timer when answer is selected
    setShowExplanation(true)
    
    const isCorrect = answerIndex === question.correctAnswer
    const timeBonus = Math.floor(timeLeft * 2) // 2 points per second remaining
    const points = isCorrect ? 100 + timeBonus : -25 // Deduct 25 points for wrong answers
    
    console.log(`SynchronizedQuizGame score update: correct=${isCorrect}, timeBonus=${timeBonus}, points=${points}, timeLeft=${timeLeft}`)
    
    setPlayerScores(prev => {
      const currentScore = prev[currentPlayerAddress] || 0;
      const newScore = Math.max(0, currentScore + points); // Minimum score is 0, don't go negative
      const newScores = {
        ...prev,
        [currentPlayerAddress]: newScore
      }
      console.log(`SynchronizedQuizGame scores updated: ${currentScore} + ${points} = ${newScore}`, newScores)
      
      // Update live scores with the new scores
      if (onScoreUpdate) {
        onScoreUpdate(newScores)
      }
      
      return newScores
    })
  }

  // Game protection
  useEffect(() => {
    if (gameProtectionActive) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = 'Are you sure you want to leave? Your progress will be lost!'
        return 'Are you sure you want to leave? Your progress will be lost!'
      }

      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault()
        window.history.pushState(null, '', window.location.href)
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('popstate', handlePopState)
      window.history.pushState(null, '', window.location.href)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [gameProtectionActive])

  // Render different states
  if (gameState === 'waiting') {
    return (
      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-600">Waiting for Game Start</h2>
            <p className="text-muted-foreground">
              The quiz will begin when all players are ready and synchronized.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{players.length} players connected</span>
            </div>
            <div className="text-xs text-muted-foreground mt-4 p-2 bg-gray-100 rounded">
              Debug: gameState={gameState}, questions.length={questions.length}, 
              gameStartTime={gameStartTime}, countdown={countdown}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (gameState === 'countdown') {
    return (
      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="text-8xl font-bold text-green-600 mb-4 animate-pulse">
              {countdown}
            </div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Get Ready!</h2>
            <p className="text-xl text-muted-foreground">
              The synchronized quiz battle is about to begin!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{players.length} players ready</span>
              <Target className="h-4 w-4" />
              <span>All questions start together</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (gameState === 'finished') {
    // Convert GameResult to PlayerResult format for FinalLeaderboard
    const playerResults = gameResults.map(result => ({
      player_address: result.player,
      score: result.score,
      correct_answers: result.correctAnswers,
      total_questions: result.totalQuestions,
      time_bonus: result.timeBonus,
      has_played: true
    }))
    
    return <FinalLeaderboard 
      results={playerResults} 
      lobbyId={lobbyId}
      currentPlayerAddress={currentPlayerAddress}
    />
  }

  if (gameState === 'playing' && questions.length > 0) {
    const question = questions[currentQuestion]
    
    if (!question) {
      return (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="text-lg text-muted-foreground">
              Loading question {currentQuestion + 1}...
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Game Protection Indicator */}
        {gameProtectionActive && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                <Shield className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">Synchronized Quiz Active</p>
                  <p className="text-sm opacity-80">
                    All players are answering the same questions at the same time!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Progress Component */}
        <QuizProgress
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          playerScore={playerScores[currentPlayerAddress] || 0}
          timeRemaining={timeLeft}
          questionDuration={questionDurationSec}
          playersFinished={livePlayers.length}
          totalPlayers={players.length}
          isLastQuestion={currentQuestion === questions.length - 1}
          questionSource={questionSource}
        />


        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {question.category} - {question.difficulty}
              </CardTitle>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <Target className="h-3 w-3 mr-1" />
                Question {currentQuestion + 1}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-medium">{question.question}</p>
            
            <div className="grid gap-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className={`p-4 h-auto text-left justify-start ${
                    selectedAnswer !== null && index === question.correctAnswer
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : selectedAnswer === index && selectedAnswer !== question.correctAnswer
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : selectedAnswer !== null
                      ? "opacity-50"
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null || isAnswered || gameState !== 'playing'}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}
            </div>

            {showExplanation && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}

            {/* Synchronized Game Info - No Manual Navigation */}
            {isAnswered && (
              <div className="mt-4 text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">
                  {currentQuestion < questions.length - 1 
                    ? `Waiting for next question... (${currentQuestion + 1}/${questions.length})`
                    : `Final question completed! (${currentQuestion + 1}/${questions.length})`
                  }
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  All players will advance together automatically
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {syncError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-800 text-sm">{syncError}</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-8 text-center">
        <div className="text-lg text-muted-foreground">
          Preparing synchronized quiz...
        </div>
      </CardContent>
    </Card>
  )
}
