import { Pool } from 'pg'

// PostgreSQL接続プール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false,
    mode: 'require'
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // タイムアウトを10秒に延長
})

// ユーザー型定義
export interface User {
  id?: number
  x_id: string
  x_name: string
  x_username: string
  x_icon_url?: string
  created_at?: Date
  updated_at?: Date
}

// 保存されたデッキ型定義
export interface SavedDeck {
  id?: number
  user_id: number
  deck_name: string
  deck_id: string
  description?: string
  is_public: boolean
  created_at?: Date
  updated_at?: Date
}

// ユーザー情報をupsert（存在しない場合は作成、存在する場合は更新）
export async function upsertUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  const client = await pool.connect()
  
  try {
    const query = `
      INSERT INTO users (x_id, x_name, x_username, x_icon_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (x_id) 
      DO UPDATE SET 
        x_name = EXCLUDED.x_name,
        x_username = EXCLUDED.x_username,
        x_icon_url = EXCLUDED.x_icon_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    
    const values = [userData.x_id, userData.x_name, userData.x_username, userData.x_icon_url]
    const result = await client.query(query, values)
    
    return result.rows[0] as User
  } catch (error) {
    console.error('Error upserting user:', error)
    throw error
  } finally {
    client.release()
  }
}

// ユーザーをX IDで取得
export async function getUserByXId(xId: string): Promise<User | null> {
  const client = await pool.connect()
  
  try {
    console.log('Database: Searching for user with X ID:', xId)
    const query = 'SELECT * FROM users WHERE x_id = $1'
    const result = await client.query(query, [xId])
    console.log('Database: Query result rows count:', result.rows.length)
    
    return result.rows[0] || null
  } catch (error: any) {
    console.error('Error getting user by X ID:', error)
    console.error('Database error details:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail
    })
    throw error
  } finally {
    client.release()
  }
}

// デッキを保存
export async function saveDeck(deckData: Omit<SavedDeck, 'id' | 'created_at' | 'updated_at'>): Promise<SavedDeck> {
  const client = await pool.connect()
  
  try {
    console.log('Database: Saving deck with data:', deckData)
    const query = `
      INSERT INTO saved_decks (user_id, deck_name, deck_id, description, is_public)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    
    const values = [deckData.user_id, deckData.deck_name, deckData.deck_id, deckData.description, deckData.is_public]
    console.log('Database: Query values:', values)
    const result = await client.query(query, values)
    console.log('Database: Insert result:', result.rows[0])
    
    return result.rows[0] as SavedDeck
  } catch (error: any) {
    console.error('Error saving deck:', error)
    console.error('Database error details:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      constraint: error?.constraint
    })
    throw error
  } finally {
    client.release()
  }
}

// ユーザーの保存されたデッキを取得
export async function getUserDecks(userId: number): Promise<SavedDeck[]> {
  const client = await pool.connect()
  
  try {
    const query = `
      SELECT * FROM saved_decks 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `
    
    const result = await client.query(query, [userId])
    
    return result.rows as SavedDeck[]
  } catch (error) {
    console.error('Error getting user decks:', error)
    throw error
  } finally {
    client.release()
  }
}

// 特定のデッキを取得（所有者確認付き）
export async function getDeckById(deckId: number, userId: number): Promise<SavedDeck | null> {
  const client = await pool.connect()
  
  try {
    const query = `
      SELECT * FROM saved_decks 
      WHERE id = $1 AND user_id = $2
    `
    
    const result = await client.query(query, [deckId, userId])
    
    return result.rows[0] || null
  } catch (error) {
    console.error('Error getting deck by ID:', error)
    throw error
  } finally {
    client.release()
  }
}

// デッキを更新
export async function updateDeck(
  deckId: number, 
  userId: number, 
  updates: Partial<Pick<SavedDeck, 'deck_name' | 'deck_id' | 'description' | 'is_public'>>
): Promise<SavedDeck | null> {
  const client = await pool.connect()
  
  try {
    const updateFields = []
    const values = []
    let paramCount = 1

    if (updates.deck_name !== undefined) {
      updateFields.push(`deck_name = $${paramCount}`)
      values.push(updates.deck_name)
      paramCount++
    }
    
    if (updates.deck_id !== undefined) {
      updateFields.push(`deck_id = $${paramCount}`)
      values.push(updates.deck_id)
      paramCount++
    }
    
    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramCount}`)
      values.push(updates.description)
      paramCount++
    }
    
    if (updates.is_public !== undefined) {
      updateFields.push(`is_public = $${paramCount}`)
      values.push(updates.is_public)
      paramCount++
    }

    if (updateFields.length === 0) {
      return null
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(deckId, userId)

    const query = `
      UPDATE saved_decks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `
    
    const result = await client.query(query, values)
    
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

// デッキを削除
export async function deleteDeck(deckId: number, userId: number): Promise<boolean> {
  const client = await pool.connect()
  
  try {
    const query = `
      DELETE FROM saved_decks 
      WHERE id = $1 AND user_id = $2
    `
    
    const result = await client.query(query, [deckId, userId])
    
    return result.rowCount > 0
  } finally {
    client.release()
  }
}

// 公開デッキを取得（ページネーション付き）
export async function getPublicDecks(limit: number = 10, offset: number = 0): Promise<SavedDeck[]> {
  const client = await pool.connect()
  
  try {
    const query = `
      SELECT sd.*, u.x_name, u.x_username, u.x_icon_url
      FROM saved_decks sd
      JOIN users u ON sd.user_id = u.id
      WHERE sd.is_public = true
      ORDER BY sd.created_at DESC
      LIMIT $1 OFFSET $2
    `
    
    const result = await client.query(query, [limit, offset])
    
    return result.rows as SavedDeck[]
  } finally {
    client.release()
  }
}

// データベース接続テスト
export async function testConnection(): Promise<{ connected: boolean; error?: string; details?: any }> {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    
    const client = await pool.connect()
    const result = await client.query('SELECT NOW() as current_time, version() as db_version')
    client.release()
    
    console.log('Database connection successful:', result.rows[0])
    return { 
      connected: true, 
      details: {
        timestamp: result.rows[0].current_time,
        version: result.rows[0].db_version?.substring(0, 50) + '...'
      }
    }
  } catch (error: any) {
    console.error('Database connection error:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name
    })
    return { 
      connected: false, 
      error: error?.message || 'Unknown error',
      details: {
        code: error?.code,
        name: error?.name
      }
    }
  }
}