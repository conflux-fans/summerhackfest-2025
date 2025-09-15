import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verify API key for security
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.RESOLVE_GAME_API_KEY || "default-secret"}`
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { lobbyId, winnerAddress } = await request.json()

    if (!lobbyId || !winnerAddress) {
      return NextResponse.json({ error: "Missing lobbyId or winnerAddress" }, { status: 400 })
    }

    // Return success without on-chain transaction
    // The actual transaction will be handled by the frontend using the user's wallet
    console.log("Prize resolution requested for lobby:", lobbyId, "winner:", winnerAddress)

    return NextResponse.json({ 
      success: true, 
      message: "Prize resolution request received. Transaction will be handled by frontend wallet.",
      lobbyId,
      winnerAddress
    })

  } catch (error: any) {
    console.error("Error resolving game:", error)
    return NextResponse.json({ 
      error: "Failed to resolve game", 
      details: error.message 
    }, { status: 500 })
  }
}
