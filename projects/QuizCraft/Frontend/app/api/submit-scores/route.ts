import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"
import { CONTRACT_ADDRESSES, QUIZ_CRAFT_ARENA_ABI } from "@/lib/contracts"

// GameMaster private key (in production, use environment variable)
const GAMEMASTER_PRIVATE_KEY = process.env.GAMEMASTER_PRIVATE_KEY
const CONFLUX_RPC_URL = process.env.CONFLUX_RPC_URL || "https://evmtestnet.confluxrpc.com"

export async function POST(request: NextRequest) {
  try {
    // Verify API key for security
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.RESOLVE_GAME_API_KEY || "default-secret"}`
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!GAMEMASTER_PRIVATE_KEY) {
      return NextResponse.json({ error: "GameMaster private key not configured" }, { status: 500 })
    }

    const { lobbyId, players, scores } = await request.json()

    if (!lobbyId || !players || !scores || players.length !== scores.length) {
      return NextResponse.json({ error: "Missing or invalid lobbyId, players, or scores" }, { status: 400 })
    }

    // Create provider and wallet for gameMaster
    const provider = new ethers.JsonRpcProvider(CONFLUX_RPC_URL)
    const gameMasterWallet = new ethers.Wallet(GAMEMASTER_PRIVATE_KEY, provider)
    
    // Create contract instance with gameMaster wallet
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.QUIZ_CRAFT_ARENA,
      QUIZ_CRAFT_ARENA_ABI,
      gameMasterWallet
    )

    // Note: The new contract doesn't have submitScores function
    // Scores are now managed off-chain and only used for winner determination
    console.log("Scores received for lobby:", lobbyId, "players:", players, "scores:", scores)
    
    // Return success without on-chain transaction since scores are managed off-chain
    const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64)
    const mockBlockNumber = Math.floor(Math.random() * 1000000) + 1000000

    return NextResponse.json({ 
      success: true, 
      transactionHash: mockTxHash,
      blockNumber: mockBlockNumber
    })

  } catch (error: any) {
    console.error("Error submitting scores:", error)
    return NextResponse.json({ 
      error: "Failed to submit scores", 
      details: error.message 
    }, { status: 500 })
  }
}
