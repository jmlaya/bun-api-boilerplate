import { compress } from 'hono/compress';
import { logger } from 'hono/logger';
import { initializeRouter } from '../app/router';
import { initializeDatabase } from './database';
import { appFactory } from './helpers/appFactory';
import { deepMerge } from './helpers/deepMerge';
import { errorHandler } from './helpers/errorHandler';
import { getAbsolutePath } from './helpers/getAbsolutePath';
import { loadBaseConfig } from './helpers/loadConfig';
import { log } from './log';
import { keepAlive } from './middlewares/keepAlive';
import { GeneralAppOptions } from './types';

const baseConfig = await loadBaseConfig();

export async function sivro(_options?: GeneralAppOptions) {
  // Initialize the database connection
  const sql = await initializeDatabase();
  const options = deepMerge(baseConfig, _options || {});

  const app = await appFactory({
    servicesPath: getAbsolutePath(options?.paths?.services!),
    corsOrigins: options?.general?.corsOrigins?.join(',') || '*',
    sql,
    middlewares: [
      ...(_options?.middlewares || []),

      // Enable keep alive to improve performance and reduce latency
      keepAlive(),

      // Middleware to log requests
      logger(log.INFO),

      // Middleware to compress responses
      compress(),
    ],
  });

  const router = initializeRouter(app);

  app.onError(errorHandler);

  return { app, router };
}
