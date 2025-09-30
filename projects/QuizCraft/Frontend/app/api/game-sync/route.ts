import { NextResponse, type NextRequest } from 'next/server'

// Store game start times for synchronization
const gameStartTimes = new Map<string, number>()

export async function POST(req: NextRequest) {
  try {
    const { lobbyId, action } = await req.json()
    
    if (!lobbyId) {
      return NextResponse.json({ error: 'Missing lobbyId' }, { status: 400 })
    }

    const now = Date.now()

    switch (action) {
      case 'start_game':
        // Set the game start time for this lobby
        const gameStartTime = now + 10000 // Start in 10 seconds
        gameStartTimes.set(lobbyId, gameStartTime)
        
        console.log(`Game start time set for lobby ${lobbyId}:`, new Date(gameStartTime))
        
        return NextResponse.json({
          success: true,
          gameStartTime,
          countdown: 10,
          message: 'Game start time synchronized'
        })

      case 'get_game_start':
        // Get the game start time for this lobby
        const startTime = gameStartTimes.get(lobbyId)
        
        if (!startTime) {
          return NextResponse.json({
            success: false,
            message: 'Game not started yet'
          })
        }

        const timeUntilStart = Math.max(0, startTime - now)
        const countdown = Math.ceil(timeUntilStart / 1000)

        return NextResponse.json({
          success: true,
          gameStartTime: startTime,
          timeUntilStart,
          countdown,
          hasStarted: timeUntilStart <= 0
        })

      case 'clear_game':
        // Clear the game start time
        gameStartTimes.delete(lobbyId)
        return NextResponse.json({
          success: true,
          message: 'Game cleared'
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (e: any) {
    console.error('Game sync error:', e)
    return NextResponse.json({ error: 'Unexpected error', details: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lobbyId = searchParams.get('lobbyId')
    
    if (!lobbyId) {
      return NextResponse.json({ error: 'Missing lobbyId' }, { status: 400 })
    }

    const startTime = gameStartTimes.get(lobbyId)
    
    if (!startTime) {
      return NextResponse.json({
        success: false,
        message: 'Game not started yet'
      })
    }

    const now = Date.now()
    const timeUntilStart = Math.max(0, startTime - now)
    const countdown = Math.ceil(timeUntilStart / 1000)

    return NextResponse.json({
      success: true,
      gameStartTime: startTime,
      timeUntilStart,
      countdown,
      hasStarted: timeUntilStart <= 0
    })
  } catch (e: any) {
    console.error('Game sync GET error:', e)
    return NextResponse.json({ error: 'Unexpected error', details: e.message }, { status: 500 })
  }
}
