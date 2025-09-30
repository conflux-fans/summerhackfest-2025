import { NextResponse, type NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lobbyId = Number(searchParams.get('lobbyId'))
    if (!lobbyId) return NextResponse.json({ error: 'Missing lobbyId' }, { status: 400 })

    // Get all games for this lobby
    const { data: games, error: gamesErr } = await supabase
      .from('games')
      .select('*')
      .eq('lobby_id', lobbyId)
      .order('started_at', { ascending: false })

    // Get all game results for this lobby
    const { data: allGameResults, error: resErr } = await supabase
      .from('game_results')
      .select(`
        *,
        games!inner(lobby_id)
      `)
      .eq('games.lobby_id', lobbyId)
      .order('score', { ascending: false })

    // Get all lobbies
    const { data: lobbies, error: lobbiesErr } = await supabase
      .from('lobbies')
      .select('*')
      .eq('id', lobbyId)

    return NextResponse.json({ 
      lobbyId,
      games: games || [],
      allGameResults: allGameResults || [],
      lobbies: lobbies || [],
      errors: {
        gamesErr,
        resErr,
        lobbiesErr
      }
    })
  } catch (e: any) {
    console.error('debug error', e)
    return NextResponse.json({ error: 'Unexpected error', details: e.message }, { status: 500 })
  }
}
