const express = require('express');
const router = express.Router();

// ログイン試行カウント（本番ではRedisなどに移行推奨）
const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000;

// POST /auth/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  const ip = req.ip;
  const now = Date.now();

  // ロックアウトチェック
  const attempt = loginAttempts[ip] || { count: 0, lockedUntil: 0 };
  if (attempt.lockedUntil > now) {
    const remaining = Math.ceil((attempt.lockedUntil - now) / 60000);
    return res.status(429).json({ error: `ロック中です。${remaining}分後に再試行してください` });
  }

  const correctPassword = process.env.APP_PASSWORD || 'adflow2025';

  if (password === correctPassword) {
    // 成功: セッション確立
    loginAttempts[ip] = { count: 0, lockedUntil: 0 };
    req.session.authenticated = true;
    req.session.loginAt = new Date().toISOString();
    return res.json({ success: true });
  }

  // 失敗: カウントアップ
  attempt.count = (attempt.count || 0) + 1;
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_MS;
    loginAttempts[ip] = attempt;
    return res.status(429).json({ error: '試行回数超過。10分間ロックします', locked: true });
  }
  loginAttempts[ip] = attempt;
  const remaining = MAX_ATTEMPTS - attempt.count;
  return res.status(401).json({ error: `パスワードが正しくありません（残り${remaining}回）` });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// GET /auth/me
router.get('/me', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

module.exports = router;
