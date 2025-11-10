import { Context } from 'hono';
import { cors } from 'hono/cors';
import { createFactory } from 'hono/factory';
import type { JwtVariables } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';
import { config } from '../app/config';
import { initializeRouter } from '../app/router';
import { initializeDatabase } from './database';
import { ServicesContainer } from './lib/service-container.class';
import { initializeAndGetServicesContainer } from './services';

export type TokenPayload = JWTPayload & {
  userId: string;
  email: string;
};

export type AppEnv = {
  Variables: JwtVariables & {
    services: ServicesContainer;
    sesion: TokenPayload;
  };
};

export async function bootstrap() {
  // Initialize the database connection
  await initializeDatabase();

  // Setup application services
  const servicesContainer = await initializeAndGetServicesContainer();

  const app = createFactory<AppEnv>({
    initApp: (app) => {
      app.use(async (c: Context<AppEnv, never, {}>, next) => {
        c.set('services', servicesContainer);
        await next();
      });

      app.use(
        '*',
        cors({
          origin: config.general.corsOrigins,
          allowMethods: ['POST', 'GET'],
          allowHeaders: ['Content-Type'],
          credentials: true,
        }),
      );
    },
  }).createApp();

  const router = initializeRouter(app);

  return { app, router };
}
