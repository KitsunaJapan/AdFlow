const session = require('express-session');

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  proxy: true, // ← Render対応
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none', // ← クロスオリジン対応
    maxAge: 8 * 60 * 60 * 1000
  }
});

const requireAuth = (req, res, next) => {
  if (req.session && req.session.authenticated) return next();
  res.redirect('/');
};

module.exports = { sessionMiddleware, requireAuth };