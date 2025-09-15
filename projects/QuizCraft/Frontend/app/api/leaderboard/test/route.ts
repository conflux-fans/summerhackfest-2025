import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test basic Supabase connection
    const { data: gameResults, error } = await supabase
      .from('game_results')
      .select('player_address, score')
      .limit(5)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: 'Supabase connection failed', 
        details: error 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection working',
      sampleData: gameResults,
      count: gameResults?.length || 0
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
