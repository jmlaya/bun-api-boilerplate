import { cors } from 'hono/cors';
import { createFactory } from 'hono/factory';
import { initializeAndGetServicesContainer } from '../services';
import { AppEnv, AppOptions } from '../types';

export const appFactory = async (options?: AppOptions) => {
  const { middlewares, servicesPath } = options || {};
  const config = require(options?.configPath || '../../app/config');

  // Setup application services
  const servicesContainer = await initializeAndGetServicesContainer(servicesPath || '../../app/services');

  return createFactory<AppEnv>({
    initApp: (app) => {
      app.use(async (c, next) => {
        c.set('services', servicesContainer);
        await next();
      });

      // Enable CORS for all origins
      app.use(
        '*',
        cors({
          origin: config.general.corsOrigins,
          allowMethods: ['POST'],
          allowHeaders: ['Content-Type'],
          credentials: true,
        }),
      );

      if (middlewares && middlewares.length) {
        app.use(...middlewares);
      }
    },
  }).createApp();
};
