import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Supabase-js経由で公開デッキ一覧取得
    const { data: publicDecks, error } = await supabase
      .from('saved_decks')
      .select(`
        *,
        users (
          x_name,
          x_username,
          x_icon_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Public decks retrieved:', publicDecks?.length || 0)
    return NextResponse.json(publicDecks || [])
  } catch (error: any) {
    console.error('Error fetching public decks:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 })
  }
}