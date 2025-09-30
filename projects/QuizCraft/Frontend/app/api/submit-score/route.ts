import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { score, category, timeTakenSeconds } = await request.json()

    // Mock score submission - replace with actual database/leaderboard logic
    console.log("Score submitted:", { score, category, timeTakenSeconds, timestamp: new Date() })

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting score:", error)
    return NextResponse.json({ error: "Failed to submit score" }, { status: 500 })
  }
}
