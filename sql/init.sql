-- CNPデッキビルダー用データベーススキーマ
-- PostgreSQL対応

-- ユーザー情報テーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    x_id VARCHAR(255) UNIQUE NOT NULL,
    x_name VARCHAR(255) NOT NULL,
    x_username VARCHAR(255) NOT NULL,
    x_icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 保存されたデッキテーブル
CREATE TABLE saved_decks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deck_name VARCHAR(255) NOT NULL,
    deck_id TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 複合インデックス: ユーザーごとのデッキを効率的に取得
    INDEX idx_saved_decks_user_id (user_id),
    INDEX idx_saved_decks_public (is_public),
    INDEX idx_saved_decks_created_at (created_at DESC)
);

-- updated_at自動更新のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_decks_updated_at BEFORE UPDATE ON saved_decks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータ挿入（開発用）
-- INSERT INTO users (x_id, x_name, x_username, x_icon_url) VALUES
-- ('sample_user_1', 'テストユーザー1', 'test_user_1', 'https://example.com/avatar1.png');

-- INSERT INTO saved_decks (user_id, deck_name, deck_id, description, is_public) VALUES
-- (1, 'テストデッキ1', 'btaaaaeaavaaaaaaazvqaxvavauaaaakaaaaaaaavaaaaaaaaaaaaaaaaaaa', '青中心のテストデッキ', true);