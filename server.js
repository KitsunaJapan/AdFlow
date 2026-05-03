require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const { sessionMiddleware, requireAuth } = require('./middleware/session');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

app.use('/auth', require('./routes/auth'));
app.use('/auth/google', require('./routes/google'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/create.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'create.html'));
});

app.use('/api/campaigns', requireAuth, require('./routes/campaigns'));
app.use('/api/google', requireAuth, require('./routes/google'));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✅ AdFlow running on http://localhost:${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Google API: ${process.env.GOOGLE_CLIENT_ID ? '本番接続' : 'モック'}`);
  console.log(`   Firebase: ${process.env.FIREBASE_PROJECT_ID ? '接続済み' : 'モック（インメモリ）'}`);
});