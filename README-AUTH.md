# CNPデッキビルダー - OAuth認証とデータベース設定ガイド

## 概要

CNPデッキビルダーにTwitter OAuth認証とPostgreSQLデータベースを使用したデッキ保存機能を追加しました。

## 機能概要

- **Twitter OAuth認証**: NextAuthを使用したTwitterログイン
- **デッキ保存**: ログイン後、構築したデッキをサーバーに保存
- **個人デッキ管理**: ユーザーごとに専用のデッキ一覧ページ
- **公開/非公開設定**: デッキの公開レベルを選択可能
- **セキュリティ**: 各ユーザーは自分のデッキのみアクセス可能

## 必要な設定

### 1. PostgreSQLデータベースの準備

```bash
# PostgreSQLがインストールされていない場合
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: apt-get install postgresql

# データベース作成
createdb cnp_deck_builder

# スキーマ初期化
psql cnp_deck_builder < sql/init.sql
```

### 2. Twitter Developer Account設定

1. [Twitter Developer Portal](https://developer.twitter.com/) にアクセス
2. 新しいAppを作成
3. OAuth 2.0設定を有効化
4. Callback URL設定: `http://localhost:3000/api/auth/callback/twitter`
5. Client IDとClient Secretを取得

### 3. 環境変数設定

`.env.example`をコピーして`.env.local`を作成し、以下の値を設定：

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-32-characters

TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

DATABASE_URL=postgresql://username:password@localhost:5432/cnp_deck_builder

NODE_ENV=development
```

### 4. 依存関係のインストール

```bash
# 既にインストール済みですが、確認用
pnpm install
```

## 使用方法

### 1. アプリケーション起動

```bash
pnpm dev
```

### 2. 認証とデッキ保存

1. **ログイン**: ヘッダーの「Xでログイン」ボタンをクリック
2. **デッキ作成**: デッキビルダーでデッキを構築
3. **サーバー保存**: 「サーバーに保存」ボタンでデッキを保存
4. **デッキ管理**: 「保存済みデッキ」ページで管理

### 3. デッキ管理機能

- **デッキ一覧表示**: 保存されたデッキの一覧
- **デッキIDダウンロード**: ファイルとしてダウンロード
- **デッキ削除**: 不要なデッキを削除
- **公開/非公開**: デッキの可視性設定

## データベーススキーマ

### users テーブル
```sql
- id: ユーザーID (SERIAL PRIMARY KEY)
- x_id: TwitterのユーザーID (UNIQUE)
- x_name: Twitter表示名
- x_username: Twitterユーザー名
- x_icon_url: プロフィール画像URL
- created_at: 作成日時
- updated_at: 更新日時
```

### saved_decks テーブル
```sql
- id: デッキID (SERIAL PRIMARY KEY)
- user_id: ユーザーID (FOREIGN KEY)
- deck_name: デッキ名
- deck_id: 生成されたデッキID文字列
- description: デッキの説明
- is_public: 公開設定 (BOOLEAN)
- created_at: 作成日時
- updated_at: 更新日時
```

## APIエンドポイント

### 認証
- `GET/POST /api/auth/[...nextauth]` - NextAuth認証処理

### デッキ管理
- `POST /api/decks` - デッキ保存
- `GET /api/decks` - ユーザーのデッキ一覧取得
- `GET /api/decks/[id]` - 特定デッキ取得
- `PUT /api/decks/[id]` - デッキ更新
- `DELETE /api/decks/[id]` - デッキ削除
- `GET /api/decks/public` - 公開デッキ一覧取得

## セキュリティ機能

- **認証必須**: デッキ保存・管理にはログインが必要
- **所有者確認**: ユーザーは自分のデッキのみアクセス可能
- **CSRF保護**: NextAuthによる自動保護
- **SQL注入対策**: パラメータ化クエリを使用

## トラブルシューティング

### 認証エラー
1. Twitter OAuth設定を確認
2. Callback URLが正確か確認
3. NEXTAUTH_SECREETが設定されているか確認

### データベース接続エラー
1. PostgreSQLが起動しているか確認
2. DATABASE_URLが正確か確認
3. データベースが作成されているか確認

### デッキ保存エラー
1. ログイン状態を確認
2. ネットワーク接続を確認
3. ブラウザーのコンソールでエラーを確認

## 本番環境デプロイ時の注意

1. **NEXTAUTH_URL**を本番URLに変更
2. **NODE_ENV**を`production`に設定
3. TwitterのCallback URLを本番環境用に追加
4. データベース接続をSSL有効化
5. 環境変数をセキュアに管理

## 開発者向け情報

### ファイル構成
```
app/api/auth/[...nextauth]/route.ts    # NextAuth設定
app/api/decks/route.ts                 # デッキCRUD API
app/saved-decks/page.tsx              # 保存済みデッキページ
components/auth-button.tsx            # 認証ボタン
components/saved-decks.tsx            # デッキ一覧コンポーネント
lib/database.ts                       # データベース関数
sql/init.sql                          # データベーススキーマ
types/next-auth.d.ts                  # NextAuth型定義拡張
```

### カスタマイズ可能な設定
- デッキの公開/非公開デフォルト値
- データベース接続プール設定
- セッション有効期限
- OAuth スコープ設定