import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all lobbies with their game results
    const { data: lobbies, error: lobbiesError } = await supabase
      .from('lobbies')
      .select(`
        id,
        name,
        created_at,
        games!inner(
          id,
          started_at,
          game_results(
            player_address,
            score,
            correct_answers,
            total_questions,
            time_bonus
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (lobbiesError) {
      console.error('Error fetching lobbies:', lobbiesError)
      return NextResponse.json({ error: 'Failed to fetch lobby data' }, { status: 500 })
    }

    const lobbyLeaderboards = lobbies?.map((lobby: any) => {
      // Get all players from game results for this lobby
      const players = lobby.games?.flatMap((game: any) => 
        game.game_results?.map((result: any) => ({
          player_address: result.player_address,
          total_score: result.score,
          games_played: 1,
          wins: 0, // Will be calculated based on highest score
          win_rate: 0,
          average_score: result.score,
          best_score: result.score,
          total_correct_answers: result.correct_answers,
          total_questions: result.total_questions,
          accuracy: Math.round((result.correct_answers / result.total_questions) * 100),
          last_played: game.started_at,
          achievements: []
        })) || []
      ) || []

      // Sort players by score and determine wins
      players.sort((a: any, b: any) => b.total_score - a.total_score)
      
      // Mark the highest scorer as winner
      if (players.length > 0) {
        players[0].wins = 1
        players[0].win_rate = 100
        players[0].achievements.push('Lobby Winner')
      }

      return {
        lobby_id: lobby.id,
        lobby_name: lobby.name || `Lobby #${lobby.id}`,
        players: players,
        total_players: players.length,
        created_at: lobby.created_at,
        status: 'completed'
      }
    }) || []

    return NextResponse.json({ lobbies: lobbyLeaderboards })
  } catch (error) {
    console.error('Error processing lobby leaderboards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
