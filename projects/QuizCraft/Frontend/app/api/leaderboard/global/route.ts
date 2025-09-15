import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all game results and calculate player statistics
    const { data: gameResults, error } = await supabase
      .from('game_results')
      .select(`
        player_address,
        score,
        correct_answers,
        total_questions,
        time_bonus,
        games!inner(started_at)
      `)

    if (error) {
      console.error('Error fetching game results:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 })
    }

    // Group results by player and calculate statistics
    const playerStats = new Map()

    if (gameResults && gameResults.length > 0) {
      gameResults.forEach((result: any) => {
        const playerAddress = result.player_address
        
        if (!playerStats.has(playerAddress)) {
          playerStats.set(playerAddress, {
            player_address: playerAddress,
            total_score: 0,
            games_played: 0,
            wins: 0,
            win_rate: 0,
            average_score: 0,
            best_score: 0,
            total_correct_answers: 0,
            total_questions: 0,
            accuracy: 0,
            last_played: result.games?.started_at || new Date().toISOString(),
            achievements: []
          })
        }

        const player = playerStats.get(playerAddress)
        player.total_score += result.score || 0
        player.games_played += 1
        player.total_correct_answers += result.correct_answers || 0
        player.total_questions += result.total_questions || 0
        player.best_score = Math.max(player.best_score, result.score || 0)
        player.last_played = result.games?.started_at || player.last_played

        // Determine if this was a win (highest score in the game)
        // This is a simplified calculation - in reality you'd need to group by game_id
        if ((result.score || 0) >= 800) { // Assuming 800+ is a win
          player.wins += 1
        }
      })
    }

    // Calculate derived statistics
    const players = Array.from(playerStats.values()).map(player => {
      player.average_score = player.games_played > 0 ? Math.round(player.total_score / player.games_played) : 0
      player.win_rate = player.games_played > 0 ? Math.round((player.wins / player.games_played) * 100) : 0
      player.accuracy = player.total_questions > 0 ? Math.round((player.total_correct_answers / player.total_questions) * 100) : 0
      
      // Add achievements based on stats
      const achievements = []
      if (player.best_score >= 950) achievements.push('Quiz Master')
      if (player.wins >= 5) achievements.push('Arena Champion')
      if (player.games_played >= 10) achievements.push('Knowledge Seeker')
      if (player.accuracy >= 90) achievements.push('Accuracy Master')
      player.achievements = achievements

      return player
    })

    // Sort by total score
    players.sort((a, b) => b.total_score - a.total_score)

    // Return empty array if no data
    if (players.length === 0) {
      console.log('No game results found, returning empty leaderboard')
    }

    return NextResponse.json({ players })
  } catch (error) {
    console.error('Error processing leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
