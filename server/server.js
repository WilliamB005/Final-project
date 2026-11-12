// server/server.js
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.js';
import roomsRouter from './routes/rooms.js';
import messagesRouter from './routes/messages.js';
for (const key of ['MONGODB_URI', 'JWT_SECRET']) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
const app = express();
const PORT = process.env.PORT || 3000;
const dbUri = process.env.MONGODB_URI;

// 1. Security & Core Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.set('trust proxy', 1);

// 2. Rate Limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60_000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 5,
  message: { error: 'Too many login attempts. Try again later.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// 3. Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StudyRoom API is running' });
});

app.use('/api/auth', authRouter);
// Messages first: the more specific path, so it isn't routed through roomsRouter
app.use('/api/rooms/:roomId/messages', messagesRouter);
app.use('/api/rooms', roomsRouter);

// Unknown /api routes -> JSON 404
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler: malformed JSON bodies -> 400, anything else -> 500 (always JSON)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error(err);
  res.status(err.status || 500).json({ error: 'Something went wrong' });
});

// 4. Connect to MongoDB, then start server
try {
  await mongoose.connect(dbUri);
  console.log('Connected to MongoDB');

  app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('DB connection failed:', err.message);
  process.exit(1);
}