import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import pollsRoutes from './routes/polls.routes.js';
import votesRoutes from './routes/votes.routes.js';

export const createApp = () => {
  const app = express();

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

  return app;
};
