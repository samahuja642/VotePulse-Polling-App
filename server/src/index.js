import { env } from './config/env.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/socket.js';
import { createApp } from './app.js';

const app = createApp();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.clientOrigin,
    credentials: true,
  },
});

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
