import { compress } from 'hono/compress';
import { logger } from 'hono/logger';
import { initializeRouter } from '../app/router';
import { initializeDatabase } from './database';
import { appFactory } from './helpers/appFactory';
import { log } from './log';
import { keepAlive } from './middlewares/keepAlive';
import { ServerOptions } from './types';

export async function sivro(options?: ServerOptions) {
  // Initialize the database connection
  await initializeDatabase();

  const app = await appFactory({
    servicesPath: options?.servicesPath,
    configPath: options?.configPath,
    middlewares: [
      // Enable keep alive to improve performance and reduce latency
      keepAlive(),

      // Middleware to log requests
      logger(log.INFO),

      // Middleware to compress responses
      compress(),
    ],
  });

  const router = initializeRouter(app);

  return { app, router };
}
