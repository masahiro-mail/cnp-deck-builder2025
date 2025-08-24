# Vercel デプロイメント設定

## 1. Twitter App 設定

Twitter Developer Console で以下を設定：

### Callback URLs
```
https://your-app-name.vercel.app/api/auth/callback/twitter
```

### Website URL  
```
https://your-app-name.vercel.app
```

## 2. Vercel 環境変数設定

Vercel Dashboard の Environment Variables に以下を設定：

```env
# NextAuth設定
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-generate-new-one

# Twitter OAuth設定  
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

# Supabase データベース接続
DATABASE_URL=your-supabase-database-url

# 本番環境
NODE_ENV=production
```

## 3. デバッグ用エンドポイント

### データベース接続テスト
```
https://your-app-name.vercel.app/api/test-db
```

### 環境変数確認（開発環境のみ）
```
https://your-app-name.vercel.app/api/debug/auth
```

## 4. トラブルシューティング

### ログイン失敗の場合
1. Twitter App のコールバックURLが正しく設定されているか確認
2. Vercel の環境変数が正しく設定されているか確認
3. NEXTAUTH_URL が正しいVercel URLになっているか確認

### デッキ保存失敗の場合
1. データベース接続テストを実行
2. Vercel Functions ログを確認
3. ブラウザ開発者ツールでネットワークエラーを確認