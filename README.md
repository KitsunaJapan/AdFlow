# AdFlow — Google & YouTube 広告管理アプリ

## 🚀 Renderへのデプロイ手順

### 1. GitHubにプッシュ
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_NAME/adflow.git
git push -u origin main
```

### 2. Render で Web Service を作成
1. [render.com](https://render.com) → **New** → **Web Service**
2. GitHubリポジトリを連携
3. 以下を確認（render.yaml が自動で読み込まれます）
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Environment Variables** に以下を追加：
   - `APP_PASSWORD` → 任意のパスワード（例: `adflow2025`）
   - `SESSION_SECRET` → 長いランダム文字列（Renderが自動生成）

### 3. デプロイ完了 🎉
`https://adflow.onrender.com` でアクセス可能になります。

---

## 🔧 ローカル開発

```bash
# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env を編集して APP_PASSWORD などを設定

# 開発サーバー起動
npm run dev   # nodemon（ホットリロード）
# または
npm start
```

---

## 📡 後でAPIを本番接続する手順

### Google OAuth + Ads API
1. [Google Cloud Console](https://console.cloud.google.com/) で プロジェクト作成
2. **APIとサービス** → **認証情報** → **OAuth 2.0 クライアント ID** を作成
   - リダイレクトURI: `https://your-app.onrender.com/auth/google/callback`
3. `npm install googleapis` を実行
4. `routes/google.js` のコメントアウト箇所を有効化
5. Renderの環境変数に `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` を追加

### Firebase Firestore
1. [Firebase Console](https://console.firebase.google.com/) でプロジェクト作成
2. **Firestore Database** を有効化（本番モード）
3. **プロジェクト設定** → **サービスアカウント** → **新しい秘密鍵の生成**
4. `npm install firebase-admin` を実行
5. `routes/campaigns.js` のFirebaseスタブ部分を有効化
6. Renderの環境変数に `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` を追加

---

## 📁 ファイル構成

```
adflow/
├── server.js              # Expressサーバー（エントリポイント）
├── render.yaml            # Render デプロイ設定
├── .env.example           # 環境変数テンプレート
├── package.json
├── middleware/
│   └── session.js         # セッション・認証ミドルウェア
├── routes/
│   ├── auth.js            # ログイン・ログアウト API
│   ├── campaigns.js       # キャンペーン CRUD API（モック→Firestore対応済み）
│   └── google.js          # Google OAuth スタブ（→本番API対応済み）
└── public/
    ├── index.html         # ログイン画面
    ├── dashboard.html     # ダッシュボード（キャンペーン一覧）
    └── create.html        # 広告作成フロー（4ステップ）
```

---

## 🔐 セキュリティ
- パスワードは環境変数 `APP_PASSWORD` で管理（コードに直書きしない）
- セッションは `express-session` でサーバーサイド管理
- 5回失敗でIPロックアウト（10分間）
- Helmet.js でセキュリティヘッダーを付与
