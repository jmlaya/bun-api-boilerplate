import { compress } from 'hono/compress';
import { logger } from 'hono/logger';
import { initializeDatabase } from './database';
import { appFactory } from './helpers/appFactory';
import { deepMerge } from './helpers/deepMerge';
import { errorHandler } from './helpers/errorHandler';
import { getAbsolutePath } from './helpers/getAbsolutePath';
import { loadBaseConfig } from './helpers/loadBaseConfig';
import { log } from './log';
import { keepAlive } from './middlewares/keepAlive';
import { authRouter } from './routes/auth.route';
import { GeneralAppOptions } from './types';

const baseConfig = await loadBaseConfig();

export async function talon(_options?: GeneralAppOptions) {
  // Initialize the database connection
  const options = deepMerge(baseConfig, _options || {});
  const sql = await initializeDatabase(options.database!);

  const app = await appFactory({
    servicesPath: getAbsolutePath(options?.paths?.services!),
    corsOrigins: options?.general?.corsOrigins?.join(',') || '*',
    generalOptions: options,
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

  const router = options.router?.(app) || app;

  router.route('/', authRouter);

  app.onError(errorHandler);

  return { app, router };
}
