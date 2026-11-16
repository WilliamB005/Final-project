// server/server.js
// Starts the real server: read .env, connect to MongoDB, then listen.
// All middleware and routes live in app.js (so tests can use them without a database).
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

for (const key of ['MONGODB_URI', 'JWT_SECRET']) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const PORT = process.env.PORT || 3000;
const dbUri = process.env.MONGODB_URI;

// Connect to MongoDB, then start server
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
