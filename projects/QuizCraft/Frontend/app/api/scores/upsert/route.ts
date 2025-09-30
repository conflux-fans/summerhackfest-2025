import { NextResponse, type NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { lobbyId, results } = await req.json()
    if (!lobbyId || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'Invalid payload: require lobbyId and non-empty results' }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 })
    }

    // Ensure a game row exists for this lobby: latest open game or create one
    const db = supabase

    const { data: existingGame, error: gameQueryErr } = await db
      .from('games')
      .select('*')
      .eq('lobby_id', lobbyId)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    // If no rows, supabase returns error with code like PGRST116; that's okay
    if (gameQueryErr && (gameQueryErr as any).code !== 'PGRST116') {
      console.error('games query error', gameQueryErr)
    }

    // Ensure a minimal lobby row exists to satisfy FK (if your schema enforces it)
    const { data: existingLobby, error: lobbyQueryErr } = await db
      .from('lobbies')
      .select('id')
      .eq('id', lobbyId)
      .single()

    if (lobbyQueryErr && (lobbyQueryErr as any).code === 'PGRST116') {
      // Lobby doesn't exist, create it using upsert to avoid duplicate key errors
      const { error: lobbyCreateErr } = await db
        .from('lobbies')
        .upsert({
          id: lobbyId,
          name: `Lobby ${lobbyId}`,
          category: 'General',
          entry_fee_wei: 0,
          max_players: 2,
          creator: '0x0000000000000000000000000000000000000000'
        }, { onConflict: 'id' })
      
      if (lobbyCreateErr) {
        console.error('create lobby error', lobbyCreateErr)
        return NextResponse.json({ error: 'Failed to create lobby', details: lobbyCreateErr.message }, { status: 500 })
      }
    } else if (lobbyQueryErr) {
      console.error('lobby query error', lobbyQueryErr)
      return NextResponse.json({ error: 'Failed to check lobby', details: lobbyQueryErr.message }, { status: 500 })
    }

    let gameId = existingGame?.id
    if (!gameId) {
      const { data: created, error: createErr } = await db
        .from('games')
        .insert({ lobby_id: lobbyId, status: 'in_progress' })
        .select('*')
        .single()
      if (createErr) {
        console.error('create game error', createErr)
        return NextResponse.json({ error: 'Failed to create game', details: createErr.message }, { status: 500 })
      }
      gameId = created.id
    }

    // Upsert all player results for this game
    const rows = results.map((r: any) => ({
      game_id: gameId,
      lobby_id: lobbyId,
      player_address: typeof r.player_address === 'string' ? r.player_address.toLowerCase() : r.player_address,
      score: Number(r.score || 0),
      correct_answers: Number(r.correct_answers || 0),
      total_questions: Number(r.total_questions || 0),
      time_bonus: Number(r.time_bonus || 0),
    }))

    console.log('Upserting scores for lobby', lobbyId, 'game', gameId, 'rows:', rows)

    // Check for existing scores to prevent unnecessary duplicates
    for (const row of rows) {
      const { data: existing } = await db
        .from('game_results')
        .select('*')
        .eq('game_id', gameId)
        .eq('player_address', row.player_address)
        .single()
      
      if (existing) {
        console.log(`Player ${row.player_address} already has score ${existing.score} for game ${gameId}, updating to ${row.score}`)
      } else {
        console.log(`New score for player ${row.player_address} in game ${gameId}: ${row.score}`)
      }
    }

    const { error: upsertErr } = await db
      .from('game_results')
      .upsert(rows, { 
        onConflict: 'game_id,player_address',
        ignoreDuplicates: false // Update existing records instead of ignoring
      })

    if (upsertErr) {
      console.error('upsert results error', upsertErr)
      return NextResponse.json({ error: 'Failed to save results', details: upsertErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, gameId, inserted: rows.length })
  } catch (e: any) {
    console.error('scores upsert error', e)
    return NextResponse.json({ error: 'Unexpected error', details: e?.message || String(e) }, { status: 500 })
  }
}


