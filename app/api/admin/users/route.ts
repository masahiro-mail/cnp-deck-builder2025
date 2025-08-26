import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase-client'

// 管理者権限チェック
function isAdmin(session: any): boolean {
  return session?.user?.name === '図解師★ウルフ'
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 全ユーザーを取得
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        x_id,
        x_name,
        x_username,
        x_icon_url,
        created_at,
        updated_at,
        saved_decks(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(users || [])
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}