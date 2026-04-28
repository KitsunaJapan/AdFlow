const express = require('express');
const router = express.Router();

// ============================================================
//  Google OAuth 2.0 + Ads API
//  現在: モックスタブ（環境変数未設定でも動作）
//
//  本番化手順:
//  1. .env に GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET を設定
//  2. npm install googleapis
//  3. 下記コメントアウト箇所を有効化
// ============================================================

const isGoogleConfigured =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// --- 本番用（googleapis インストール後に有効化）---
// const { google } = require('googleapis');
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
// );
// const SCOPES = [
//   'https://www.googleapis.com/auth/adwords',
//   'https://www.googleapis.com/auth/userinfo.email',
// ];

// GET /auth/google - OAuth開始
router.get('/', (req, res) => {
  if (!isGoogleConfigured) {
    // モック: 環境変数未設定の場合はダミーで連携済みに
    req.session.googleConnected = true;
    req.session.googleEmail = 'demo@example.com';
    return res.redirect('/dashboard.html?google=mock');
  }
  // 本番:
  // const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  // res.redirect(url);
});

// GET /auth/google/callback
router.get('/callback', async (req, res) => {
  if (!isGoogleConfigured) return res.redirect('/dashboard.html');
  // 本番:
  // const { code } = req.query;
  // const { tokens } = await oauth2Client.getToken(code);
  // oauth2Client.setCredentials(tokens);
  // req.session.googleTokens = tokens;
  // req.session.googleConnected = true;
  // res.redirect('/dashboard.html?google=connected');
});

// GET /api/google/status
router.get('/status', (req, res) => {
  res.json({
    connected: req.session.googleConnected || false,
    email: req.session.googleEmail || null,
    mock: !isGoogleConfigured
  });
});

// GET /api/google/accounts - Ads アカウント一覧（モック）
router.get('/accounts', (req, res) => {
  // 本番: Google Ads API で CustomerService.listAccessibleCustomers() を呼ぶ
  res.json({
    mock: !isGoogleConfigured,
    accounts: [
      { id: '123-456-7890', name: 'メインアカウント（デモ）', currency: 'JPY' },
      { id: '234-567-8901', name: 'サブアカウント（デモ）', currency: 'JPY' }
    ]
  });
});

module.exports = router;
