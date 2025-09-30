import { NextResponse, type NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lobbyId = Number(searchParams.get('lobbyId'))
    if (!lobbyId) return NextResponse.json({ error: 'Missing lobbyId' }, { status: 400 })

    // get latest game for lobby
    const { data: latest, error: latestErr } = await supabase
      .from('games')
      .select('*')
      .eq('lobby_id', lobbyId)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (latestErr) {
      return NextResponse.json({ error: 'No game found' }, { status: 404 })
    }

    const { data: results, error: resErr } = await supabase
      .from('game_results')
      .select('*')
      .eq('game_id', latest.id)
      .order('score', { ascending: false })

    if (resErr) {
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
    }

    return NextResponse.json({ gameId: latest.id, results })
  } catch (e: any) {
    console.error('scores by-lobby error', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}


