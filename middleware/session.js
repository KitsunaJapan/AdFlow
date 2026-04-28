const session = require('express-session');

// セッション設定
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000 // 8時間
  }
});

// ログイン済みチェック
const requireAuth = (req, res, next) => {
  if (req.session && req.session.authenticated) return next();
  res.redirect('/');
};

module.exports = { sessionMiddleware, requireAuth };
