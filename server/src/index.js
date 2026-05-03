import { env } from './config/env.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './socket/socket.js';
import authRoutes from './routes/auth.routes.js';
import pollsRoutes from './routes/polls.routes.js';
import votesRoutes from './routes/votes.routes.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.clientOrigin,
    credentials: true,
  },
});

// Trust first proxy so req.ip resolves correctly behind Nginx / Railway / Render
app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser(env.cookieSecret));
app.use(generalLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
    },
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollsRoutes);
app.use('/api/polls', votesRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.io
initSocket(io);

// Make io accessible to controllers
app.set('io', io);

const start = async () => {
  try {
    await connectDB();
    httpServer.listen(env.port, () => {
      console.log(`VotePulse server running on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
