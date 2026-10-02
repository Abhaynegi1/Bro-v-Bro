import * as dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server as SocketIOServer } from 'socket.io';
import { registerRoutes } from './routes.js';
import { setupSocketServer } from './socket.js';

const PORT = Number(process.env.PORT) || 3001;

async function bootstrap() {
  const app = Fastify({
    logger: true,
  });

  // Enable CORS
  await app.register(cors, {
    origin: true, // Allow frontend dev server
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Attach Socket.IO to Fastify underlying HTTP server
  const io = new SocketIOServer(app.server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Register REST routes & Socket listeners
  registerRoutes(app, io);
  setupSocketServer(io);

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`🎮 Bro v Bro Backend listening on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
