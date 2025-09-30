"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useWeb3 } from "@/components/Web3Provider"
import { ethers } from "ethers"
import { CONTRACT_ADDRESSES, QUIZ_CRAFT_ARENA_ABI } from "@/lib/contracts"
import { CONFLUX_TESTNET } from "@/lib/constants"
import type { Lobby } from "@/types"
import { 
  Trophy, 
  Users, 
  Coins, 
  Clock, 
  Zap, 
  Crown, 
  Swords, 
  Shield, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  RefreshCw,
  User
} from "lucide-react"
import SynchronizedQuizGame from "@/components/SynchronizedQuizGame"
import RealTimeScores from "@/components/RealTimeScores"
import { useWinnerPayoutToast } from "@/components/WinnerPayoutToast"

export default function LobbyPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { showSuccessToast, showErrorToast, WinnerToast } = useWinnerPayoutToast()
  const { signer, isConnected, isOnConflux, account } = useWeb3()
  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<string[]>([])
  const [isUserInLobby, setIsUserInLobby] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameResults, setGameResults] = useState<any[]>([])
  const [expiresInSec, setExpiresInSec] = useState<number | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [pendingReturns, setPendingReturns] = useState<string | null>(null)
  const [createdAtSec, setCreatedAtSec] = useState<number | null>(null)
  const [expiresAtSec, setExpiresAtSec] = useState<number | null>(null)
  const [lobbyTimeoutSec, setLobbyTimeoutSec] = useState<number | null>(null)
  const [gameFinished, setGameFinished] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [claimingPrize, setClaimingPrize] = useState(false)
  const [startingGame, setStartingGame] = useState(false)
  const [contractScores, setContractScores] = useState<{address: string, score: number}[]>([])
  const [contractLeaderboard, setContractLeaderboard] = useState<string[]>([])
  const [isLeaderboardSet, setIsLeaderboardSet] = useState(false)
  const [rawStatus, setRawStatus] = useState<number | null>(null)
  const [prizeDistributedOnChain, setPrizeDistributedOnChain] = useState<boolean | null>(null)
  const [resolvingPrize, setResolvingPrize] = useState(false)
  const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null)
  // Synchronized mode is now the only mode available

  const lobbyId = params.lobbyId as string
  const numericLobbyId = Number(lobbyId)

  const [joinedHint, setJoinedHint] = useState<boolean>(false)

  // Allow access if user is in lobby OR if lobby is expired/completed (open to anyone for viewing)
  const canAccessLobby = isUserInLobby || isExpired || rawStatus === 3 // COMPLETED
  const isViewingResults = !isUserInLobby && (isExpired || rawStatus === 3)
  const isExpiredLobbyOpen = isExpired || rawStatus === 3 // Expired lobbies are open to anyone

  // Persisted finished state: keep leaderboard visible permanently after a quiz ends
  useEffect(() => {
    try {
      const finishedFlag = typeof window !== 'undefined' ? sessionStorage.getItem(`quizcraft:finished:${lobbyId}`) : null
      if (finishedFlag === 'true') {
        setGameFinished(true)
        setGameStarted(false)
      }
    } catch {}
  }, [lobbyId])

  useEffect(() => {
    try {
      if (account) {
        const flag = sessionStorage.getItem(`quizcraft:joined:${lobbyId}:${account.toLowerCase()}`)
        setJoinedHint(flag === 'true')
      } else {
        setJoinedHint(false)
      }
    } catch {
      setJoinedHint(false)
    }
  }, [account, lobbyId])

  const fetchLobbyDetails = async () => {
      console.log("Lobby page loaded for lobbyId:", lobbyId)
      console.log("isConnected:", isConnected, "isOnConflux:", isOnConflux, "account:", account)

      try {
        // Use wallet provider if on the correct network; otherwise fall back to public RPC for read-only data
        const hasWindowProvider = typeof window !== 'undefined' && (window as any).ethereum
        const browserProvider = hasWindowProvider ? new ethers.BrowserProvider((window as any).ethereum) : null
        const rpcProvider = new ethers.JsonRpcProvider(CONFLUX_TESTNET.rpcUrl)
        // Prefer wallet provider if on the right network; still keep rpc for fallbacks
        const provider = (hasWindowProvider && isOnConflux) ? (browserProvider as any) : (rpcProvider as any)

        const contract = new ethers.Contract(
          CONTRACT_ADDRESSES.QUIZ_CRAFT_ARENA,
          QUIZ_CRAFT_ARENA_ABI,
          provider
        )

        // Get lobby details
        const lobbyData = await contract.lobbies(numericLobbyId)
        console.log("Raw lobby data from contract:", lobbyData)
        
        // Fix field mapping - ABI is missing players array field
        // Smart contract struct: [id, name, category, entryFee, playerCount, maxPlayers, prizePool, createdAt, status, distribution, players, winner, creator]
        // ABI has: [id, name, category, entryFee, playerCount, maxPlayers, prizePool, createdAt, status, distribution, winner, creator]
        // So winner is at index 10, creator is at index 11
        const creatorAddress = lobbyData[11] // creator is at index 11 (not 12 due to missing players array)
        const winnerAddress = lobbyData[10] // winner is at index 10 (not 11 due to missing players array)
        
        console.log("Creator address (index 11):", creatorAddress)
        console.log("Winner address (index 10):", winnerAddress)
        
        const entryFeeCFX = ethers.formatEther(lobbyData.entryFee)
        const status = Number(lobbyData.status)
        setRawStatus(status)
        const playerCount = Number(lobbyData.playerCount)
        const maxPlayers = Number(lobbyData.maxPlayers)
        
        // Determine lobby status
        let statusText = ""
        if (status === 0) { // OPEN
          statusText = playerCount === 0 ? "Waiting for players" : `${playerCount}/${maxPlayers} players`
        } else if (status === 1) { // STARTED
          if (gameFinished) {
            statusText = "Game Completed"
          } else if (gameStarted) {
            statusText = "Game in progress"
          } else if (playerCount >= maxPlayers) {
            statusText = "All players joined - Game starting soon"
          } else {
            statusText = `${playerCount}/${maxPlayers} players - Waiting for more players`
          }
        } else if (status === 2) { // IN_PROGRESS
          statusText = "Game in progress"
        } else if (status === 3) { // COMPLETED
          statusText = "Completed"
        } else if (status === 4) { // CANCELLED
          statusText = "Cancelled"
        }

        // Get players in lobby
        const playersList = await contract.getPlayersInLobby(numericLobbyId)
        
        // Check if current user is in lobby using efficient mapping with robust fallbacks
        let userInLobby = false
        if (account) {
          // Primary: use whichever provider selected above
          try {
            userInLobby = await contract.isPlayerInLobby(numericLobbyId, account)
            console.log("Contract membership check (primary):", userInLobby)
          } catch (err) {
            console.error("Contract membership check (primary) failed:", err)
          }

          // Secondary: try the other provider flavor as redundancy
          if (!userInLobby) {
            try {
              const altProvider = (provider === rpcProvider && browserProvider) ? browserProvider : rpcProvider
              const altContract = new ethers.Contract(
                CONTRACT_ADDRESSES.QUIZ_CRAFT_ARENA,
                QUIZ_CRAFT_ARENA_ABI,
                altProvider as any
              )
              userInLobby = await altContract.isPlayerInLobby(numericLobbyId, account)
              console.log("Contract membership check (secondary):", userInLobby)
            } catch (err) {
              console.error("Contract membership check (secondary) failed:", err)
            }
          }

          // Fallback: derive from players list (case-insensitive)
          if (!userInLobby) {
            const acct = account.toLowerCase()
            userInLobby = playersList.some((p: string) => p.toLowerCase() === acct)
            console.log("Players list fallback check:", userInLobby)
          }

          // If detected from on-chain or players list, persist a session hint for smoother UX
          try {
            if (userInLobby) {
              sessionStorage.setItem(`quizcraft:joined:${lobbyId}:${account.toLowerCase()}`, 'true')
            }
          } catch {}

          // Final fallback: recently joined hint from session
          if (!userInLobby && joinedHint) {
            userInLobby = true
            console.log("Session hint fallback:", userInLobby)
          }

          console.log("Final membership result:", { lobbyId: numericLobbyId, account, userInLobby })
        }

        const lobbyInfo: Lobby = {
          id: String(lobbyData.id),
          name: lobbyData.name,
          category: lobbyData.category,
          mode: `🎯 ${lobbyData.name}`,
          entryFee: entryFeeCFX,
          currentPlayers: playerCount,
          maxPlayers: maxPlayers,
          isActive: status === 0 && playerCount < maxPlayers,
          creator: creatorAddress, // Use correct creator address from index 11
          status: statusText,
          isUserInLobby: userInLobby,
        }

        setLobby(lobbyInfo)
        setPlayers(playersList)
        setIsUserInLobby(userInLobby)
        const distributionStatus = lobbyData.distribution === 1
        console.log('Contract distribution status:', lobbyData.distribution, 'isDistributed:', distributionStatus)
        setPrizeDistributedOnChain(distributionStatus) // 1 = DISTRIBUTED
        
        // Compute timing details based on createdAt + LOBBY_TIMEOUT
        try {
          const createdAt: bigint = lobbyData.createdAt
          const LOBBY_TIMEOUT: bigint = await contract.LOBBY_TIMEOUT()
          const nowSec = Math.floor(Date.now() / 1000)
          const expiresAt = Number(createdAt + LOBBY_TIMEOUT)
          const remain = Math.max(0, expiresAt - nowSec)
          setExpiresInSec(remain)
          setIsExpired(remain === 0)
          setCreatedAtSec(Number(createdAt))
          setExpiresAtSec(expiresAt)
          setLobbyTimeoutSec(Number(LOBBY_TIMEOUT))
        } catch (e) {
          // ignore timing calculation errors
        }
        
        // Game start is now handled by the countdown timer effect above

        // Check if game is completed and get winner from Supabase scores
        if (status === 3) { // COMPLETED
          // Always set finished for completed games - prevent restart
          setGameFinished(true)
          setGameStarted(false) // Ensure game doesn't restart
          
          // Get winner from Supabase scores instead of contract
          try {
            const response = await fetch(`/api/scores/all-players?lobbyId=${lobbyId}`)
            if (response.ok) {
              const data = await response.json()
              if (data.players && data.players.length > 0) {
                // Find player with highest score who has played
                const playedPlayers = data.players.filter((p: any) => p.has_played)
                if (playedPlayers.length > 0) {
                  const winnerPlayer = playedPlayers.reduce((prev: any, current: any) => 
                    prev.score > current.score ? prev : current
                  )
                  setWinner(winnerPlayer.player_address)
                  console.log("Winner determined from Supabase scores:", winnerPlayer.player_address, "with score:", winnerPlayer.score)
                }
              }
            }
          } catch (e) {
            console.error('Error fetching winner from Supabase:', e)
            // Fallback to contract winner if Supabase fails
            setWinner(lobbyData.winner)
          }
        }

      } catch (error) {
        console.error("Error fetching lobby details:", error)
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchLobbyDetails()
  }, [lobbyId, isConnected, isOnConflux, account, joinedHint])

  // Fetch results for non-members viewing expired lobbies
  useEffect(() => {
    const fetchResultsForViewing = async () => {
      if (!isViewingResults || gameResults.length > 0) return
      
      try {
        // First, try to get results from smart contract using getLobbyResult
        const hasWindowProvider = typeof window !== 'undefined' && (window as any).ethereum
        const browserProvider = hasWindowProvider ? new ethers.BrowserProvider((window as any).ethereum) : null
        const rpcProvider = new ethers.JsonRpcProvider(CONFLUX_TESTNET.rpcUrl)
        const provider = (hasWindowProvider && isOnConflux) ? (browserProvider as any) : (rpcProvider as any)

        const contract = new ethers.Contract(
          CONTRACT_ADDRESSES.QUIZ_CRAFT_ARENA,
          QUIZ_CRAFT_ARENA_ABI,
          provider
        )

        try {
          const [contractStatus, contractWinner, contractPrizePool] = await contract.getLobbyResult(numericLobbyId)
          console.log('Smart contract results:', { contractStatus, contractWinner, contractPrizePool })
          
          // Update winner and prize information from contract
          if (contractWinner && contractWinner !== '0x0000000000000000000000000000000000000000') {
            setWinner(contractWinner)
          }
          
          // Update status if available
          if (contractStatus !== undefined) {
            setRawStatus(Number(contractStatus))
          }
        } catch (contractError) {
          console.log('getLobbyResult not available yet or error:', contractError)
        }

        // Fetch detailed results from the API
        const response = await fetch(`/api/scores/all-players?lobbyId=${lobbyId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.players && data.players.length > 0) {
            // Convert API data to gameResults format
            const results = data.players.map((player: any) => ({
              player: player.player_address,
              score: player.score || 0,
              correctAnswers: player.correct_answers || 0,
              totalQuestions: player.total_questions || 10,
              timeBonus: 0
            }))
            setGameResults(results)
            
            // Set winner if not already set from contract
            if (!winner && results.length > 0) {
              const winnerPlayer = results.reduce((prev: any, current: any) => 
                prev.score > current.score ? prev : current
              )
              setWinner(winnerPlayer.player)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching results for viewing:', error)
      }
    }

    fetchResultsForViewing()
  }, [isViewingResults, lobbyId, gameResults.length, winner, numericLobbyId, isOnConflux])

  // Listen to PlayerJoined events scoped to this lobby to refresh membership promptly
  useEffect(() => {
    let contract: ethers.Contract | null = null
    const setup = async () => {
      try {
        if (typeof window === 'undefined' || !(window as any).ethereum) return
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        contract = new ethers.Contract(
          CONTRACT_ADDRESSES.QUIZ_CRAFT_ARENA,
          QUIZ_CRAFT_ARENA_ABI,
          provider
        )
        const handler = (eventLobbyId: bigint, player: string) => {
          if (Number(eventLobbyId) === numericLobbyId) {
            console.log('Player joined this lobby:', player)
            
            // Toast notification for player joining
            toast({
              title: "👤 Player Joined!",
              description: `${player.slice(0, 6)}...${player.slice(-4)} joined the lobby.`,
              duration: 3000
            })
            
            // Soft refresh membership related state
            setTimeout(() => {
              fetchLobbyDetails()
            }, 1000)
          }
        }
        contract.on('PlayerJoined', handler)
      } catch {}
    }
    setup()
    return () => {
      try { contract?.removeAllListeners?.('PlayerJoined') } catch {}
    }
  }, [numericLobbyId, toast])

  // Tick countdown every second
  useEffect(() => {
    if (expiresInSec === null) return
    
    // Don't expire if all players are present and game hasn't started yet
    if (expiresInSec <= 0) {
      if (lobby && players.length >= lobby.maxPlayers && !gameStarted && !gameFinished) {
        console.log("Lobby would expire but all players are present, keeping lobby active")
        return
      }
      setIsExpired(true)
      return
    }
    const t = setTimeout(() => setExpiresInSec((s) => (s ? s - 1 : 0)), 1000)
    return () => clearTimeout(t)
  }, [expiresInSec, lobby, players.length, gameStarted, gameFinished])

  // Game start countdown timer
  useEffect(() => {
    if (gameStartCountdown === null) return
    if (gameStartCountdown <= 0) {
      console.log("Game countdown reached 0, starting game...")
      setGameStarted(true)
      setGameStartCountdown(null)
      
      // Toast notification for game start
      toast({
        title: "🎮 Game Started!",
        description: "The quiz battle has begun! Good luck!",
        duration: 3000
      })
      return
    }
    const t = setTimeout(() => setGameStartCountdown((s) => (s ? s - 1 : 0)), 1000)
    return () => clearTimeout(t)
  }, [gameStartCountdown, toast])

  // Auto-start game when all players join
  useEffect(() => {
    if (lobby && players.length >= lobby.maxPlayers && !gameStarted && !gameStartCountdown && !gameFinished) {
      console.log("All players joined, triggering game start logic...")
      
      // Clear any previous finished state from session storage for a fresh game
      // BUT only if the lobby status is not COMPLETED (status 3)
      if (lobby.status !== 'COMPLETED') {
        try {
          sessionStorage.removeItem(`quizcraft:finished:${lobbyId}`)
          setGameFinished(false) // Reset the finished state
          console.log("Cleared previous game finished state for fresh start")
        } catch (e) {
          console.error("Error clearing finished state:", e)
        }
      }
      
      
      console.log("All players joined, starting synchronized game")
      startSynchronizedGame()
    }
  }, [lobby, players.length, gameStarted, gameStartCountdown, toast, lobbyId])

  // Start synchronized game
  const startSynchronizedGame = async () => {
    try {
      const response = await fetch('/api/game-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lobbyId: lobbyId,
          action: 'start_game'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        console.log('Synchronized game started:', data)
        setGameStarted(true)
      } else {
        console.error('Failed to start synchronized game:', data)
      }
    } catch (error) {
      console.error('Error starting synchronized game:', error)
    }
  }

  // Poll for lobby updates when waiting for players
  useEffect(() => {
    if (gameStarted || gameFinished) return
    
    let isPolling = false
    
    const pollInterval = setInterval(async () => {
      // Prevent overlapping requests
      if (isPolling) return
      
      isPolling = true
      try {
        await fetchLobbyDetails()
      } finally {
        isPolling = false
      }
    }, 5000) // Poll every 5 seconds - reduced frequency
    
    return () => clearInterval(pollInterval)
  }, [gameStarted, gameFinished])

  const claimRefund = async () => {
    if (!signer || !isUserInLobby) return
    
    // Show loading toast
    toast({
      title: "⏳ Claiming Refund...",
      description: "Processing refund claim. Please wait.",
      duration: 3000
    })
    
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.QUIZ_CRAFT_ARENA,
        QUIZ_CRAFT_ARENA_ABI,
        signer
      )
      const tx = await contract.claimRefund(lobbyId)
      await tx.wait()
      
      toast({
        title: "💰 Refund Claimed Successfully!",
        description: "Refund claimed. You can withdraw now.",
        duration: 5000,
        action: (
          <a 
            href={`https://evmtestnet.confluxscan.org/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            View Transaction
          </a>
        )
      })
    } catch (e: any) {
      console.error('claimRefund error', e)
      toast({
        title: "❌ Refund Claim Failed",
        description: e?.message || 'Failed to claim refund. Please try again.',
        variant: "destructive",
        duration: 5000
      })
    }
  }


  const claimPrize = async () => {
    if (!signer || !winner || winner.toLowerCase() !== account?.toLowerCase()) return
    setClaimingPrize(true)
    
    // Show loading toast
    toast({
      title: "⏳ Claiming Prize...",
      description: "Processing prize claim. Please wait.",
      duration: 3000
    })
    
    try {
      // Call the resolve-game API to trigger on-chain resolution
      const response = await fetch('/api/resolve-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_RESOLVE_GAME_API_KEY || 'default-secret'}`
        },
        body: JSON.stringify({
          lobbyId: lobbyId,
          winnerAddress: winner
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "🎉 Prize Claimed Successfully!",
          description: `Game resolved on-chain! Transaction: ${result.transactionHash}`,
          duration: 6000,
          action: (
            <a 
              href={`https://evmtestnet.confluxscan.org/tx/${result.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              View Transaction
            </a>
          )
        })
        // Refresh lobby data to show updated status
        window.location.reload()
      } else {
        const error = await response.json()
        toast({
          title: "❌ Prize Claim Failed",
          description: `Failed to resolve game: ${error.error}`,
          variant: "destructive",
          duration: 5000
        })
      }
    } catch (e: any) {
      console.error('claimPrize error', e)
      toast({
        title: "❌ Prize Claim Failed",
        description: e?.message || 'Failed to claim prize. Please try again.',
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setClaimingPrize(false)
    }
  }

  const resolvePrizeAsCreator = async () => {
    if (!signer || !lobby?.creator || lobby.creator.toLowerCase() !== account?.toLowerCase()) return
    setResolvingPrize(true)
    
    // Show loading toast
    const loadingToast = toast({
      title: "⏳ Resolving Prize...",
      description: "Processing prize distribution on-chain. Please wait.",
      duration: 0 // Don't auto-dismiss loading toast
    })
    
    try {
      // Determine winner from Supabase scores (highest score)
      let winnerAddress = null
      
      try {
        // Get winner from Supabase scores
        const response = await fetch(`/api/scores/all-players?lobbyId=${lobbyId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.players && data.players.length > 0) {
            // Find player with highest score who has played
            const playedPlayers = data.players.filter((p: any) => p.has_played)
            if (playedPlayers.length > 0) {
              const winnerPlayer = playedPlayers.reduce((prev: any, current: any) => 
                prev.score > current.score ? prev : current
              )
              winnerAddress = winnerPlayer.player_address
              console.log("Winner for prize resolution determined from Supabase scores:", winnerPlayer.player_address, "with score:", winnerPlayer.score)
            }
          }
        }
      } catch (e) {
        console.error('Error fetching winner from Supabase:', e)
      }

      if (!winnerAddress) {
        // Fallback to current winner state
        winnerAddress = winner
        console.log("Using fallback winner from state:", winnerAddress)
      }

      if (!winnerAddress) {
        toast({
          title: "❌ Cannot Resolve Prize",
          description: "Could not determine winner. Please try again.",
          variant: "destructive",
          duration: 5000
        })
        return
      }

      // Execute the prize payout directly using the user's wallet
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.QUIZ_CRAFT_ARENA, QUIZ_CRAFT_ARENA_ABI, signer)
      
      // Call executeWinnerPayout on-chain using the creator's wallet
      console.log("Calling executeWinnerPayout with lobbyId:", numericLobbyId, "winner:", winnerAddress)
      const tx = await contract.executeWinnerPayout(numericLobbyId, winnerAddress)
      console.log("executeWinnerPayout transaction sent:", tx.hash)
      
      // Wait for confirmation
      console.log("Waiting for transaction confirmation...")
      const receipt = await tx.wait()
      console.log("Prize payout transaction confirmed:", receipt)
      console.log("Transaction status:", receipt.status === 1 ? "SUCCESS" : "FAILED")

      // Dismiss loading toast
      loadingToast.dismiss()

      // Show enhanced winner payout success toast
      showSuccessToast({
        title: "🏆 Prize Resolved Successfully!",
        description: "The winner has received the prize pool!",
        transactionHash: tx.hash,
        winnerAddress: winnerAddress,
        prizeAmount: lobby ? (Number.parseFloat(lobby.entryFee) * lobby.maxPlayers).toFixed(1) : undefined
      })
      
      // Update prize distribution status locally
      console.log('Setting prizeDistributedOnChain to true after successful distribution')
      setPrizeDistributedOnChain(true)
      
      // Wait a moment for the transaction to be mined, then refresh lobby data
      setTimeout(() => {
        fetchLobbyDetails()
      }, 2000) // Wait 2 seconds for transaction to be mined
      
    } catch (e: any) {
      console.error('resolvePrizeAsCreator error', e)
      
      // Dismiss loading toast
      loadingToast.dismiss()
      
      // Extract more specific error message
      let errorMessage = 'Failed to resolve prize. Please try again.'
      
      if (e?.reason) {
        errorMessage = e.reason
      } else if (e?.message) {
        errorMessage = e.message
      } else if (e?.error?.message) {
        errorMessage = e.error.message
      }
      
      // Handle specific smart contract errors
      if (errorMessage.includes('Already distributed')) {
        errorMessage = 'Prize has already been distributed for this lobby.'
      } else if (errorMessage.includes('Lobby not in progress')) {
        errorMessage = 'Lobby is not in the correct state for prize distribution.'
      } else if (errorMessage.includes('Winner not in this lobby')) {
        errorMessage = 'The selected winner is not a valid participant in this lobby.'
      } else if (errorMessage.includes('Lobby not expired yet')) {
        errorMessage = 'Lobby timeout has not been reached yet. Please wait before resolving.'
      } else if (errorMessage.includes('Prize transfer failed')) {
        errorMessage = 'Failed to transfer prize to winner. Please try again.'
      }
      
      // Show enhanced winner payout error toast
      showErrorToast({
        title: "❌ Prize Resolution Failed",
        errorMessage: errorMessage
      })
    } finally {
      setResolvingPrize(false)
    }
  }

  // Game starts automatically when lobby is full - no manual start needed


  // Fetch scores and leaderboard from smart contract
  useEffect(() => {
    const fetchContractData = async () => {
      try {
        if (!isOnConflux) return
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.QUIZ_CRAFT_ARENA, QUIZ_CRAFT_ARENA_ABI, provider)
        
        // Check if leaderboard is set and read it if present
        const leaderboardSet = await contract.leaderboardSet(numericLobbyId)
        setIsLeaderboardSet(leaderboardSet)
        console.log('Leaderboard set on-chain:', leaderboardSet)
        
        if (leaderboardSet) {
          const leaderboard = await contract.lobbyLeaderboard(numericLobbyId, 0) // Get first entry, need to loop for all
          setContractLeaderboard(leaderboard)
          console.log('On-chain leaderboard:', leaderboard)
        }

        // Read player scores individually since getAllScores doesn't exist in new contract
        const players = await contract.getPlayersInLobby(numericLobbyId)
        const scores: bigint[] = []
        for (const player of players) {
          const score = await contract.playerScores(numericLobbyId, player)
          scores.push(score)
        }
        const scoresData = players.map((player: string, index: number) => ({
          address: player,
          score: Number(scores[index])
        }))
        setContractScores(scoresData)
        console.log('On-chain scores:', scoresData)
        
        // Also check local storage for any pending scores
        try {
          const localScores = localStorage.getItem(`quizcraft:lobby-scores:${lobbyId}`)
          if (localScores) {
            const localData = JSON.parse(localScores)
            console.log('Local scores found:', localData)
            
            // If local scores exist and on-chain scores are empty, use local scores
            if (scoresData.length === 0 && localData.scores && localData.scores.length > 0) {
              const localScoresData = localData.players.map((player: string, index: number) => ({
                address: player,
                score: Number(localData.scores[index])
              }))
              setContractScores(localScoresData)
              console.log('Using local scores as fallback:', localScoresData)
            }
          }
        } catch (e) {
          console.error('Error reading local scores:', e)
        }
        
      } catch (e) {
        console.error('Error fetching contract data:', e)
      }
    }
    
    fetchContractData()
  }, [lobbyId, isOnConflux, gameFinished, gameStarted])

  const refreshScoresAndLeaderboard = async () => {
    try {
      if (!isOnConflux) return
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.QUIZ_CRAFT_ARENA, QUIZ_CRAFT_ARENA_ABI, provider)
      
      // Check if leaderboard is set and read it if present
      const leaderboardSet = await contract.leaderboardSet(numericLobbyId)
      setIsLeaderboardSet(leaderboardSet)
      
      if (leaderboardSet) {
        const leaderboard = await contract.lobbyLeaderboard(numericLobbyId, 0) // Get first entry, need to loop for all
        setContractLeaderboard(leaderboard)
      }

      // Read player scores individually since getAllScores doesn't exist in new contract
      const players = await contract.getPlayersInLobby(numericLobbyId)
      const scores: bigint[] = []
      for (const player of players) {
        const score = await contract.playerScores(numericLobbyId, player)
        scores.push(score)
      }
      const scoresData = players.map((player: string, index: number) => ({
        address: player,
        score: Number(scores[index])
      }))
      setContractScores(scoresData)
      
      console.log('Scores and leaderboard refreshed:', { leaderboardSet, leaderboard: leaderboardSet ? await contract.getLeaderboard(numericLobbyId) : null, scores: scoresData })
    } catch (e) {
      console.error('Error refreshing scores and leaderboard:', e)
    }
  }

  const getLobbyIcon = (mode: string) => {
    if (mode.includes("Duel")) return <Swords className="h-6 w-6" />
    if (mode.includes("Royale")) return <Crown className="h-6 w-6" />
    if (mode.includes("Quick")) return <Zap className="h-6 w-6" />
    if (mode.includes("Championship")) return <Trophy className="h-6 w-6" />
    return <Shield className="h-6 w-6" />
  }

  const getStatusLabel = (statusNum: number | null) => {
    if (statusNum === null) return 'Unknown'
    switch (statusNum) {
      case 0: return 'OPEN'
      case 1: return 'FULL'
      case 2: return 'IN_PROGRESS'
      case 3: return 'COMPLETED'
      case 4: return 'CANCELLED'
      default: return 'Unknown'
    }
  }

  const formatRelativeTime = (targetSeconds: number, isFuture: boolean) => {
    const nowSec = Math.floor(Date.now() / 1000)
    const delta = Math.max(0, Math.abs(targetSeconds - nowSec))
    const minutes = Math.floor(delta / 60)
    const seconds = delta % 60
    if (minutes > 0) {
      return isFuture ? `in ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s ago`
    }
    return isFuture ? `in ${seconds}s` : `${seconds}s ago`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top shimmer banner */}
          <div className="relative overflow-hidden rounded-xl border border-muted/30 bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.6s_infinite]" />
            <div className="p-6 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-40 bg-white/20 rounded" />
                <div className="h-4 w-64 bg-white/10 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/20" />
                <div className="h-10 w-28 rounded-lg bg-white/20" />
              </div>
            </div>
          </div>

          {/* Info cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0,1,2].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-xl border border-muted/30 bg-card p-5">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="space-y-2 w-full">
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-4 w-32 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Details and list skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-xl border border-muted/30 bg-card p-6">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
              <div className="h-5 w-40 bg-muted rounded mb-4" />
              <div className="space-y-3">
                {[0,1,2,3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="space-y-2 w-full">
                      <div className="h-3 w-28 bg-muted rounded" />
                      <div className="h-3 w-40 bg-muted/80 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-muted/30 bg-card p-6">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
              <div className="h-5 w-48 bg-muted rounded mb-4" />
              <div className="space-y-3">
                {[0,1,2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div className="h-4 w-32 bg-muted rounded" />
                    </div>
                    <div className="h-4 w-16 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer action skeleton */}
          <div className="relative overflow-hidden rounded-xl border border-muted/30 bg-card p-8 text-center">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.6s_infinite]" />
            <div className="mx-auto h-10 w-40 bg-muted rounded" />
          </div>
        </div>
        <style jsx global>{`
          @keyframes shimmer { 100% { transform: translateX(100%); } }
        `}</style>
      </div>
    )
  }

  if (!lobby) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-2 border-red-500/20 bg-red-900/10">
            <CardContent className="py-16">
              <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="font-montserrat font-bold text-3xl mb-4 text-red-400">Lobby Not Found</h2>
              <p className="text-xl text-muted-foreground mb-8">
                The lobby you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button
                onClick={() => router.push("/arena")}
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                <ArrowLeft className="mr-3 h-5 w-5" />
                Back to Arena
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!loading && !canAccessLobby && account && !joinedHint) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-2 border-yellow-500/20 bg-yellow-900/10">
            <CardContent className="py-16">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-yellow-500" />
              </div>
              <h2 className="font-montserrat font-bold text-3xl mb-4 text-yellow-400">Access Denied</h2>
              <p className="text-xl text-muted-foreground mb-4">
                You are not a member of this lobby. Please join the lobby from the arena first.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Note: Expired or completed lobbies are open to anyone for viewing results.
              </p>
              <Button
                onClick={() => router.push("/arena")}
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
              >
                <ArrowLeft className="mr-3 h-5 w-5" />
                Back to Arena
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => router.push("/arena")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Arena
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold">Lobby #{lobbyId}</h1>
            <p className="text-muted-foreground">{lobby.status} ({getStatusLabel(rawStatus)})</p>
            {isViewingResults && (
              <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-300">
                <Trophy className="h-3 w-3 mr-1" />
                Viewing Results
              </Badge>
            )}
            {isExpiredLobbyOpen && !isUserInLobby && (
              <Badge className="mt-2 bg-green-100 text-green-800 border-green-300">
                <Users className="h-3 w-3 mr-1" />
                Open to Everyone
              </Badge>
            )}
          </div>
        </div>


        {/* Lobby Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                {getLobbyIcon(lobby.mode)}
                {lobby.mode}
              </CardTitle>
              {/* Synchronized Mode Toggle */}
              {!gameStarted && !gameFinished && (
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                    <Zap className="h-3 w-3 mr-1" />
                    Synchronized
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Coins className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Entry Fee</p>
                  <p className="font-semibold">{lobby.entryFee} CFX</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Players</p>
                  <p className="font-semibold">{lobby.currentPlayers}/{lobby.maxPlayers}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Prize Pool</p>
                  <p className="font-semibold">{(Number.parseFloat(lobby.entryFee) * lobby.maxPlayers).toFixed(1)} CFX</p>
                </div>
              </div>
            </div>
            
            {/* Winner Information - Show when lobby is completed or expired */}
            {(isExpired || rawStatus === 3) && winner && (
              <div className="mt-6 p-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                    <Crown className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-1 winner-text">🏆 Winner</p>
                    <p className="font-bold text-xl text-black mb-1 winner-text">
                      {winner.slice(0, 6)}...{winner.slice(-4)}
                    </p>
                    <p className="text-sm font-semibold text-orange-700 px-3 py-1 rounded-full inline-block winner-prize">
                      Prize: {(Number.parseFloat(lobby.entryFee) * lobby.maxPlayers).toFixed(1)} CFX
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lobby Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Lobby Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Raw status from enum */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">{getStatusLabel(rawStatus)}</p>
                </div>
              </div>
              {createdAtSec !== null && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-semibold">{new Date(createdAtSec * 1000).toLocaleString()} <span className="text-xs text-muted-foreground">({formatRelativeTime(createdAtSec, false)})</span></p>
                    {rawStatus === 1 && (
                      <p className="text-xs text-muted-foreground">Timer reset when lobby became FULL</p>
                    )}
                  </div>
                </div>
              )}
              {expiresAtSec !== null && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expires</p>
                    <p className="font-semibold">{new Date(expiresAtSec * 1000).toLocaleString()} <span className="text-xs text-muted-foreground">({formatRelativeTime(expiresAtSec, true)})</span></p>
                  </div>
                </div>
              )}
              {lobbyTimeoutSec !== null && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeout Window</p>
                    <p className="font-semibold">{Math.floor(lobbyTimeoutSec / 60)} minutes</p>
                  </div>
                </div>
              )}
              {expiresInSec !== null && !isExpired && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Remaining</p>
                    <p className="font-semibold text-green-600">
                      {Math.floor((expiresInSec || 0) / 60)}m {(expiresInSec || 0) % 60}s
                    </p>
                  </div>
                </div>
              )}
              {/* Creator */}
              {lobby?.creator && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Creator</p>
                    <p className="font-semibold">{lobby.creator.slice(0, 6)}...{lobby.creator.slice(-4)}</p>
                  </div>
                </div>
              )}
              {/* Prize distribution status */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prize Distributed (on-chain)</p>
                  <p className="font-semibold">{rawStatus === 3 ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Over Message */}
        {gameFinished && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="text-6xl">🏁</div>
                <h2 className="text-3xl font-bold text-green-700">Game Over!</h2>
                <p className="text-lg text-green-600">
                  The quiz battle has ended. Check the leaderboard below for final results.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time Scores from Supabase - Show before game starts and after game ends */}
        {(!gameStarted || gameFinished || isViewingResults) && (
          <RealTimeScores 
            key={`scores-${gameFinished ? 'finished' : 'waiting'}`}
            lobbyId={lobbyId} 
            refreshInterval={3000}
            gameState={gameFinished ? 'finished' : 'waiting'}
            currentPlayerAddress={account || undefined}
          />
        )}

        {/* Creator-only Resolve Prize Button */}
        {lobby?.creator && account && lobby?.creator?.toLowerCase() === account.toLowerCase() && gameFinished && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <h3 className="text-xl font-semibold">
                    {rawStatus === 3 ? "Prize Pool Distributed" : "Resolve Prize Pool"}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  {rawStatus === 3 
                    ? "The prize pool has been successfully distributed to the winner."
                    : "As the lobby creator, you can resolve the prize pool and distribute it to the winner."
                  }
                </p>
                {rawStatus !== 3 ? (
                  <Button 
                    onClick={resolvePrizeAsCreator} 
                    disabled={resolvingPrize}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {resolvingPrize ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resolving Prize...
                      </>
                    ) : (
                      <>
                        <Trophy className="mr-2 h-4 w-4" />
                        Resolve Prize (Creator)
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    Completed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}


        {/* Synchronized Quiz Game */}
        {(() => {
          const shouldShowQuiz = gameStarted && !isExpired && !gameFinished && lobby;
          console.log("Quiz rendering check:", {
            gameStarted,
            isExpired,
            gameFinished,
            lobby: !!lobby,
            shouldShowQuiz
          });
          return shouldShowQuiz;
        })() && (
          <SynchronizedQuizGame
            lobbyId={lobbyId}
            players={players}
            category={lobby.category}
            questionDurationSec={10}
            seed={`${CONTRACT_ADDRESSES.QUIZ_CRAFT_ARENA}-${numericLobbyId}-${createdAtSec || 0}`}
            currentPlayerAddress={account || players.find(p => p) || ''}
            onGameEnd={(results) => {
              setGameResults(results)
              setGameFinished(true)
              setGameStarted(false)
              try { sessionStorage.setItem(`quizcraft:finished:${lobbyId}`, 'true') } catch {}
              
              // Determine winner from results
              const gameWinner = results.reduce((prev, current) => 
                prev.score > current.score ? prev : current
              )
              setWinner(gameWinner.player)
              
              // Toast notification for game end
              toast({
                title: "🏁 Game Finished!",
                description: `Check the leaderboard below for final results!`,
                duration: 5000
              })
              
              console.log("Synchronized game ended with results:", results)
            }}
            onScoreUpdate={(scores) => {
              // Keep a lightweight preview list in gameResults shape for display
              const preview = Object.entries(scores).map(([player, score]) => ({
                player,
                score,
                correctAnswers: Math.floor((score || 0) / 100),
                totalQuestions: 10,
                timeBonus: Math.floor((score || 0) % 100)
              }))
              setGameResults(preview)
            }}
          />
        )}


        {/* Players List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Players ({lobby.currentPlayers}/{lobby.maxPlayers})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={`${player}-${index}`}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    player.toLowerCase() === account?.toLowerCase()
                      ? "bg-green-50 border-green-200"
                      : "bg-muted/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">
                        {player.toLowerCase() === account?.toLowerCase() ? "You" : `${player.slice(0, 6)}...${player.slice(-4)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">{player}</p>
                    </div>
                  </div>
                  {player.toLowerCase() === account?.toLowerCase() && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      You
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
      
      {/* Winner Payout Toast */}
      {WinnerToast}
    </div>
  )
}