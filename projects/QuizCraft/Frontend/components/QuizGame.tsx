'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Trophy, Users, Zap, Shield } from 'lucide-react';
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

interface QuizGameProps {
  lobbyId: string;
  players: string[];
  category?: string;
  onGameEnd: (results: GameResult[]) => void;
  onScoreUpdate?: (scores: Record<string, number>) => void;
  startTimestampSec: number; // on-chain createdAt + countdown
  questionDurationSec: number; // per-question duration
  seed: string; // deterministic quiz seed
  currentPlayerAddress: string; // connected wallet address to credit scores
}

interface GameResult {
  player: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeBonus: number;
}

export default function QuizGame({ lobbyId, players, category, onGameEnd, onScoreUpdate, startTimestampSec, questionDurationSec, seed, currentPlayerAddress }: QuizGameProps) {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
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
  const [quizStartedAt, setQuizStartedAt] = useState<number | null>(null);
  const [quizEndedAt, setQuizEndedAt] = useState<number | null>(null);
  const [gameProtectionActive, setGameProtectionActive] = useState(false);
  const [scoresSubmitted, setScoresSubmitted] = useState(false);

  // Hydrate persisted scores
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`quizcraft:scores:${lobbyId}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        console.log('Hydrating scores from sessionStorage:', parsed)
        setPlayerScores(parsed)
      }
    } catch (e) {
      console.error('Error hydrating scores:', e)
    }
  }, [lobbyId])

  // Persist scores
  useEffect(() => {
    try {
      console.log('Persisting scores to sessionStorage:', playerScores)
      sessionStorage.setItem(`quizcraft:scores:${lobbyId}`, JSON.stringify(playerScores))
    } catch (e) {
      console.error('Error persisting scores:', e)
    }
  }, [lobbyId, playerScores])

  // Generate quiz once when component mounts
  useEffect(() => {
    if (questions.length === 0) {
      console.log("Starting quiz generation...")
      generateQuiz()
    }
  }, []) // Empty dependency array - run only once

  // Initialize game phase - start playing when questions are loaded
  useEffect(() => {

      if (questions.length === 0) return

    // Only start playing if we have valid questions and we're not already playing
    if (questions.length > 0 && questions[0] && questions[0].question && gameState !== 'playing') {
      setGameState('playing')
      setCurrentQuestion(0) // Start from question 1
      setTimeLeft(questionDurationSec)
    } else if (questions.length > 0 && questions[0] && questions[0].question && gameState === 'playing') {
    } else {
      
      // If questions are invalid, try to regenerate them
      if (questions.length > 0 && questions.every(q => !q || !q.question)) {
        generateQuiz();
      }
    }
  }, [questions.length, questionDurationSec, questions, gameState])

  const endGame = async () => {
    if (scoresSubmitted) {
      console.log('Scores already submitted, skipping duplicate submission');
      return;
    }
    
    setGameState('finished');
    setQuizEndedAt(Date.now());
    setScoresSubmitted(true);
    
    console.log('=== ENDGAME DEBUG ===');
    console.log('currentPlayerAddress:', currentPlayerAddress);
    console.log('playerScores state:', playerScores);
    console.log('players array:', players);
    
    // Get the most recent scores from sessionStorage as backup
    let backupScores = {};
    try {
      const raw = sessionStorage.getItem(`quizcraft:scores:${lobbyId}`)
      if (raw) {
        backupScores = JSON.parse(raw)
        console.log('Backup scores from sessionStorage:', backupScores)
      }
    } catch (e) {
      console.error('Error getting backup scores:', e)
    }
    
    // Always prefer sessionStorage scores as they're more up-to-date
    // This fixes the timing issue where state hasn't updated yet
    const scoresToUse = Object.keys(backupScores).length > 0 ? backupScores : playerScores;
    console.log('Using scores (preferring sessionStorage):', scoresToUse);
    
    // If we found backup scores and playerScores is empty, restore them
    if (Object.keys(playerScores).length === 0 && Object.keys(backupScores).length > 0) {
      console.log('Restoring scores from backup');
      setPlayerScores(backupScores);
    }
    
    // Calculate final results - use current player's score and create results for all players
    // Try to find the current player's score with case-insensitive matching
    let currentPlayerScore = 0;
    let foundKey = null;
    
    for (const [key, score] of Object.entries(scoresToUse)) {
      if (key.toLowerCase() === currentPlayerAddress.toLowerCase()) {
        currentPlayerScore = Number(score);
        foundKey = key;
        break;
      }
    }
    
    console.log('Found key:', foundKey);
    console.log('currentPlayerScore:', currentPlayerScore);
    
    const currentPlayerCorrectAnswers = Math.floor(currentPlayerScore / 100);
    const currentPlayerTimeBonus = currentPlayerScore % 100;
    
    console.log('currentPlayerCorrectAnswers:', currentPlayerCorrectAnswers);
    console.log('currentPlayerTimeBonus:', currentPlayerTimeBonus);
    
    const results: GameResult[] = players.map(player => {
      if (player.toLowerCase() === currentPlayerAddress.toLowerCase()) {
        // Current player - use actual score
        return {
          player,
          score: currentPlayerScore,
          correctAnswers: currentPlayerCorrectAnswers,
          totalQuestions: questions.length,
          timeBonus: currentPlayerTimeBonus
        };
      } else {
        // Other players - use 0 for now (they'll have their own scores)
        return {
          player,
          score: 0,
          correctAnswers: 0,
          totalQuestions: questions.length,
          timeBonus: 0
        };
      }
    });
    
    // Only log current player's result
    const currentPlayerResult = results.find(r => r.player.toLowerCase() === currentPlayerAddress.toLowerCase());
    console.log('Current player result:', currentPlayerResult);
    console.log('Current player score:', currentPlayerScore);
    
    setGameResults(results);
    onGameEnd(results);
    
    // Post score and time taken for the connected player
    const totalMs = (Date.now() - (quizStartedAt || Date.now()));
    const timeTakenSeconds = Math.max(0, Math.round(totalMs / 1000));
    fetch('/api/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score: currentPlayerScore,
        category: category || 'Technology',
        timeTakenSeconds,
      })
    }).catch(() => {});

    // Send scores to Supabase (primary) and store locally as fallback
    try {
      // POST to Supabase API
      try {
        // Send only current player's result to Supabase
        const currentPlayerData = {
          player_address: currentPlayerAddress,
          score: currentPlayerScore,
          correct_answers: currentPlayerCorrectAnswers,
          total_questions: questions.length,
          time_bonus: currentPlayerTimeBonus
        };
        
        await fetch('/api/scores/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lobbyId: Number(lobbyId),
            results: [currentPlayerData]
          })
        })
      } catch (e) {
        console.error('Supabase upsert failed, will rely on local fallback', e)
      }

      // Local fallback for GM consolidation and UI
      // Create comprehensive score data for all players
      const allPlayerScores: { [key: string]: number } = {};
      const allPlayerResults: any[] = [];
      
      // Add current player's actual score
      allPlayerScores[currentPlayerAddress] = currentPlayerScore;
      allPlayerResults.push({
        player: currentPlayerAddress,
        score: currentPlayerScore,
        correctAnswers: currentPlayerCorrectAnswers,
        totalQuestions: questions.length,
        timeBonus: currentPlayerTimeBonus,
        isCurrentPlayer: true
      });
      
      // Add other players with placeholder scores (they'll submit their own)
      players.forEach(player => {
        if (player.toLowerCase() !== currentPlayerAddress.toLowerCase()) {
          allPlayerScores[player] = 0; // Placeholder - will be updated when they submit
          allPlayerResults.push({
            player: player,
            score: 0,
            correctAnswers: 0,
            totalQuestions: questions.length,
            timeBonus: 0,
            isCurrentPlayer: false
          });
        }
      });
      
      const scoresData = {
        lobbyId: lobbyId,
        players: players,
        scores: players.map(p => allPlayerScores[p] || 0),
        allPlayerScores: allPlayerScores, // Store individual scores by address
        detailedResults: allPlayerResults,
        timestamp: Date.now(),
        status: 'pending', // pending, submitted, confirmed
        gameEndedAt: Date.now(),
        totalQuestions: questions.length,
        category: category || 'Technology',
        currentPlayerAddress: currentPlayerAddress,
        currentPlayerScore: currentPlayerScore
      };
      
      // Store in localStorage for the lobby owner to retrieve
      localStorage.setItem(`quizcraft:lobby-scores:${lobbyId}`, JSON.stringify(scoresData));
      console.log('All players scores stored locally for lobby owner to update:', scoresData);
      
      // Also store in sessionStorage for immediate display
      sessionStorage.setItem(`quizcraft:local-scores:${lobbyId}`, JSON.stringify(scoresData));
      
      // Store individual player scores for debugging
      results.forEach(result => {
        const playerKey = `quizcraft:player-score:${lobbyId}:${result.player}`;
        localStorage.setItem(playerKey, JSON.stringify({
          player: result.player,
          score: result.score,
          correctAnswers: result.correctAnswers,
          totalQuestions: result.totalQuestions,
          timeBonus: result.timeBonus,
          timestamp: Date.now()
        }));
      });
      
      // Also store current player's score separately for easy access
      const currentPlayerKey = `quizcraft:current-player-score:${lobbyId}:${currentPlayerAddress}`;
      localStorage.setItem(currentPlayerKey, JSON.stringify({
        player: currentPlayerAddress,
        score: currentPlayerScore,
        correctAnswers: currentPlayerCorrectAnswers,
        totalQuestions: questions.length,
        timeBonus: currentPlayerTimeBonus,
        timestamp: Date.now()
      }));
      
      // Store individual player contribution for merging with other players
      const playerContributionKey = `quizcraft:player-contribution:${lobbyId}:${currentPlayerAddress}`;
      localStorage.setItem(playerContributionKey, JSON.stringify({
        player: currentPlayerAddress,
        score: currentPlayerScore,
        correctAnswers: currentPlayerCorrectAnswers,
        totalQuestions: questions.length,
        timeBonus: currentPlayerTimeBonus,
        timestamp: Date.now(),
        gameEndedAt: Date.now()
      }));
      
      // Try to merge with existing lobby scores from other players
      try {
        const existingLobbyScores = localStorage.getItem(`quizcraft:lobby-scores:${lobbyId}`);
        if (existingLobbyScores) {
          const existingData = JSON.parse(existingLobbyScores);
          // Update the existing data with current player's score
          if (existingData.allPlayerScores) {
            existingData.allPlayerScores[currentPlayerAddress] = currentPlayerScore;
            existingData.scores = existingData.players.map((p: string) => existingData.allPlayerScores[p] || 0);
            existingData.detailedResults = existingData.detailedResults.map((result: any) => 
              result.player.toLowerCase() === currentPlayerAddress.toLowerCase() 
                ? { ...result, score: currentPlayerScore, correctAnswers: currentPlayerCorrectAnswers, timeBonus: currentPlayerTimeBonus }
                : result
            );
            localStorage.setItem(`quizcraft:lobby-scores:${lobbyId}`, JSON.stringify(existingData));
            console.log('Updated existing lobby scores with current player:', existingData);
          }
        }
      } catch (e) {
        console.error('Error merging with existing scores:', e);
      }
      
    } catch (error) {
      console.error('Error storing scores locally:', error);
    }
  };

  // Combined effect to handle question changes and timer
  useEffect(() => {
    if (gameState !== 'playing' || questions.length === 0) return
    if (currentQuestion >= questions.length) {
      console.log("Question index out of bounds, ending game");
      endGame();
      return;
    }

    console.log(`Question ${currentQuestion + 1}: Resetting selection and timer`);
    
    // Reset selection and answered state for new question
    setSelectedAnswer(prev => {
      console.log(`Resetting selection from ${prev} to null for question ${currentQuestion + 1}`);
      return null;
    });
    setIsAnswered(false);
    
    // Reset timer and explanation for new question
    setTimeLeft(questionDurationSec);
    setShowExplanation(false);
    setTimerActive(true); // Start timer for new question

    // Simple countdown timer - only runs when timer is active
    const tick = () => {
      if (!timerActive) return; // Don't tick if timer is stopped
      
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up for current question
          
          // Move to next question or end game
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            return questionDurationSec; // Reset timer for next question
          } else {
            endGame();
            return 0;
          }
        }
        return prev - 1; // Simple countdown
      });
    }

    const i = setInterval(tick, 1000) // Simple 1-second countdown
    return () => clearInterval(i)
  }, [currentQuestion, gameState, questions.length, questionDurationSec, endGame, timerActive])

  // Emit live score reset at game start
  useEffect(() => {
    if (gameState === 'playing' && onScoreUpdate) onScoreUpdate(playerScores)
  }, [gameState])

  // Game protection - prevent navigation during active game
  useEffect(() => {
    const isGameActive = gameState === 'playing';
    setGameProtectionActive(isGameActive);

    if (isGameActive) {
      // Prevent page refresh
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your progress will be lost!';
        return 'Are you sure you want to leave? Your progress will be lost!';
      };

      // Prevent back button
      const handlePopState = (e: PopStateEvent) => {
        if (isGameActive) {
          e.preventDefault();
          window.history.pushState(null, '', window.location.href);
          alert('Cannot go back during the quiz! Please complete the game first.');
        }
      };

      // Add event listeners
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      
      // Push a state to prevent back button
      window.history.pushState(null, '', window.location.href);

      // Disable right-click context menu
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      // Disable F5, Ctrl+R, Ctrl+Shift+R, DevTools shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'F5' || 
            (e.ctrlKey && e.key === 'r') || 
            (e.ctrlKey && e.shiftKey && e.key === 'R') ||
            (e.ctrlKey && e.key === 'w') ||
            (e.altKey && e.key === 'ArrowLeft') ||
            (e.ctrlKey && e.shiftKey && e.key === 'I') || // DevTools
            (e.ctrlKey && e.shiftKey && e.key === 'C') || // DevTools
            (e.ctrlKey && e.shiftKey && e.key === 'J') || // Console
            (e.ctrlKey && e.key === 'u') || // View source
            (e.key === 'F12')) { // DevTools
          e.preventDefault();
          alert('Please complete the quiz before refreshing or closing the page!');
          return false;
        }
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      // Add visual protection overlay
      const overlay = document.createElement('div');
      overlay.id = 'quiz-protection-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.02);
        pointer-events: none;
        z-index: 9999;
        display: none;
      `;
      document.body.appendChild(overlay);

      // Cleanup function
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
        
        // Remove overlay
        const existingOverlay = document.getElementById('quiz-protection-overlay');
        if (existingOverlay) {
          existingOverlay.remove();
        }
      };
    }
  }, [gameState]);

  // timeLeft derived by main tick; no separate timer needed

  // Game starts automatically when component mounts - no manual start needed

  const generateQuiz = async () => {
    try {
      console.log("Generating quiz with params:", {
        category: category || 'Technology',
        difficulty: 'medium',
        questionCount: 10,
        timePerQuestion: questionDurationSec,
        seed,
      });
      
      let response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category || 'Technology',
          difficulty: 'medium',
          questionCount: 10,
          timePerQuestion: questionDurationSec,
          seed,
        })
      });
      
      console.log("Quiz generation response status:", response.status);
      
      if (!response.ok) {
        console.log("First attempt failed, retrying...");
        // brief retry once on 503 from AI
        response = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: category || 'Technology',
            difficulty: 'medium',
            questionCount: 10,
            timePerQuestion: questionDurationSec,
            seed,
          })
        });
        console.log("Retry response status:", response.status);
      }
      
      const data = await response.json();
      console.log("Quiz generation response data:", data);
      
      if (process.env.NODE_ENV !== 'production') {
        // Helpful debug in console
        // eslint-disable-next-line no-console
        console.log('Quiz generation debug:', data.debug);
      }
      
      if (data.success) {
        console.log("Quiz generated successfully, questions:", data.quiz.questions);
        setQuestions(data.quiz.questions);
        setTimeLeft(data.quiz.timePerQuestion);
        const usedFallback = Boolean(data.debug?.fallbackUsed);
        const source = usedFallback ? 'fallback' : 'ai';
        console.log("Question source set to:", source, "fallbackUsed:", data.debug?.fallbackUsed);
        setQuestionSource(source);
      } else {
        console.warn("Quiz generation failed, using placeholder");
        // Fallback: minimal placeholder quiz so UI proceeds
        const placeholder = {
          id: 'placeholder',
          question: 'Placeholder question: Which letter comes first?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          timeLimit: 30,
          explanation: 'The correct answer is "A".',
          category: category || 'General',
          difficulty: 'easy' as const,
        };
        setQuestions([placeholder]);
        setTimeLeft(placeholder.timeLimit);
        console.log("Question source set to: fallback (placeholder)");
        setQuestionSource('fallback');
        console.warn('Using placeholder quiz due to generation failure');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      const placeholder = {
        id: 'placeholder',
        question: 'Placeholder question: Which letter comes first?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        timeLimit: questionDurationSec,
        explanation: 'The correct answer is "A".',
        category: category || 'General',
        difficulty: 'easy' as const,
      };
      setQuestions([placeholder]);
      setTimeLeft(placeholder.timeLimit);
      console.log("Question source set to: fallback (error)");
      setQuestionSource('fallback');
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    console.log(`handleAnswerSelect called: answerIndex=${answerIndex}, selectedAnswer=${selectedAnswer}, gameState=${gameState}, currentQuestion=${currentQuestion}`);
    
    // Prevent multiple selections and ensure we're in playing state
    if (selectedAnswer !== null || isAnswered || gameState !== 'playing') {
      console.log(`Answer selection blocked: selectedAnswer=${selectedAnswer}, isAnswered=${isAnswered}, gameState=${gameState}`);
      return;
    }
    
    console.log(`Answer ${answerIndex} selected for question ${currentQuestion + 1}`);
    
    // Use functional update to ensure we get the latest state
    setSelectedAnswer(prev => {
      if (prev !== null) {
        console.log(`Selection already exists: ${prev}, ignoring new selection: ${answerIndex}`);
        return prev; // Don't change if already selected
      }
      console.log(`Setting selection to: ${answerIndex}`);
      return answerIndex;
    });
    
    // Mark as answered to lock the selection and stop timer
    setIsAnswered(true);
    setTimerActive(false); // Stop timer when answer is selected
    setShowExplanation(true);
    
    // Calculate score
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    const timeBonus = Math.floor(timeLeft / 5); // Bonus points for speed (0-2 points)
    // Scoring: 100 points for correct answer + time bonus, -25 for wrong answer
    const points = isCorrect ? (100 + timeBonus) : -25;
    
    // Update scores for the connected player
    setPlayerScores(prev => {
      const next = { ...prev }
      
      // Find existing key with case-insensitive matching
      let existingKey = null;
      for (const key of Object.keys(next)) {
        if (key.toLowerCase() === currentPlayerAddress.toLowerCase()) {
          existingKey = key;
          break;
        }
      }
      
      // Use existing key if found, otherwise use currentPlayerAddress
      const playerKey = existingKey || currentPlayerAddress;
      const current = next[playerKey] || 0
      const newScore = Math.max(0, current + points) // Minimum score is 0, don't go negative
      next[playerKey] = newScore
      
      console.log(`Score update: ${playerKey} - ${current} + ${points} = ${newScore} (correct: ${isCorrect}, timeBonus: ${timeBonus})`)
      
      if (onScoreUpdate) onScoreUpdate(next)
      return next
    });

    // DO NOT clear selection - keep it locked until next question
    // The selection will be reset when moving to the next question
  };

  const handleTimeUp = () => {
    // no-op; advancement handled by wall-clock
  };

  if (gameState === 'waiting' || questions.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-blue-600">Preparing Quiz...</h2>
              <p className="text-muted-foreground">
                Generating questions for your quiz battle. Please wait...
              </p>
              <div className="text-xs text-muted-foreground mt-4 p-2 bg-gray-100 rounded">
                Debug: gameState={gameState}, questions.length={questions.length}, 
                firstQuestion={questions[0] ? 'exists' : 'missing'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No countdown needed - lobby page handles it

  if (gameState === 'playing' && questions.length > 0) {
    // Ensure currentQuestion is within bounds
    const safeCurrentQuestion = Math.max(0, Math.min(currentQuestion, questions.length - 1));
    const question = questions[safeCurrentQuestion];
    
    
    // Add safety check for question object
    if (!question || !question.question) {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-lg text-muted-foreground">
                Loading question... (Debug: questions.length = {questions.length}, currentQuestion = {currentQuestion}, safeCurrentQuestion = {safeCurrentQuestion})
                </div>
              <div className="text-sm text-muted-foreground mt-2">
                Questions status: {questions.map((q, i) => `${i}:${!!q ? '✓' : '✗'}`).join(', ')}
              </div>
          </CardContent>
        </Card>
      </div>
    );
  }

    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Game Protection Indicator */}
        {gameProtectionActive && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-orange-700 dark:text-orange-300">
                <Shield className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">Game Protection Active</p>
                  <p className="text-sm opacity-80">
                    Page refresh, back button, and navigation are disabled during the quiz to protect your progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Personal Progress Component */}
        <QuizProgress
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          playerScore={playerScores[currentPlayerAddress] || 0}
          timeRemaining={timeLeft}
          questionDuration={questionDurationSec}
          playersFinished={Object.keys(playerScores).length}
          totalPlayers={players.length}
          isLastQuestion={currentQuestion === questions.length - 1}
          questionSource={questionSource}
        />

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{question.category || 'General'}</Badge>
              <Badge variant="secondary">{question.difficulty || 'medium'}</Badge>
            </div>
            <CardTitle className="text-xl">{question.question || 'Loading question...'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              console.log(`Rendering question ${currentQuestion + 1} buttons: selectedAnswer=${selectedAnswer}, isAnswered=${isAnswered}, gameState=${gameState}`);
              return (question.options || []).map((option, index) => {
                const isDisabled = selectedAnswer !== null || isAnswered || gameState !== 'playing';
                console.log(`Button ${index}: disabled=${isDisabled} (selectedAnswer=${selectedAnswer}, isAnswered=${isAnswered})`);
                return (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className={`w-full justify-start h-12 text-left ${
                  selectedAnswer !== null && index === question.correctAnswer
                    ? "bg-green-500 hover:bg-green-600"
                    : selectedAnswer === index && index !== question.correctAnswer
                    ? "bg-red-500 hover:bg-red-600"
                    : ""
                }`}
                onClick={() => handleAnswerSelect(index)}
                    disabled={isDisabled}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
                );
              });
            })()}
          </CardContent>
        </Card>

        {/* Explanation */}
        {showExplanation && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800">{question.explanation || 'No explanation available.'}</p>
            </CardContent>
          </Card>
        )}

        {/* Next Question Button */}
        {isAnswered && currentQuestion < questions.length - 1 && (
          <div className="mt-4 text-center">
            <Button 
              onClick={() => {
                console.log(`Moving to next question: ${currentQuestion + 1} -> ${currentQuestion + 2}`);
                setCurrentQuestion(prev => prev + 1);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              size="lg"
            >
              Next Question ({currentQuestion + 1}/{questions.length})
            </Button>
          </div>
        )}

        {/* Finish Quiz Button */}
        {isAnswered && currentQuestion === questions.length - 1 && (
          <div className="mt-4 text-center">
            <Button 
              onClick={() => {
                console.log(`Finishing quiz on question ${currentQuestion + 1}`);
                endGame();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
              size="lg"
            >
              Finish Quiz
            </Button>
          </div>
        )}

      </div>
    );
  }

  if (gameState === 'finished') {
    // Don't render anything here - let the parent component handle the finished state
    // The RealTimeScores component will show the final leaderboard
    return null;
  }


  return null;
}
