import { cors } from 'hono/cors';
import { createFactory } from 'hono/factory';
import { AppEnv, AppOptions } from '../types';
import { initializeAndGetServicesContainer } from './initializeAndGetServicesContainer';

export const appFactory = async (options: AppOptions) => {
  const { middlewares, servicesPath, corsOrigins, sql, generalOptions } = options || {};

  // Setup application services
  const servicesContainer = await initializeAndGetServicesContainer(servicesPath, sql, generalOptions || {});

  return createFactory<AppEnv>({
    initApp: (app) => {
      app.use(async (c, next) => {
        c.set('services', servicesContainer);
        await next();
      });

      // Enable CORS for all origins
      if (corsOrigins) {
        app.use(
          '*',
          cors({
            origin: corsOrigins,
            allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
            allowHeaders: ['Content-Type'],
            credentials: true,
          }),
        );
      }

      if (middlewares && middlewares.length) {
        app.use(...middlewares);
      }
    },
  }).createApp();
};
