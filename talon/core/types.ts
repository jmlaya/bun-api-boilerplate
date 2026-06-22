import { SQL } from 'bun';
import { Context, Hono, MiddlewareHandler } from 'hono';
import type { JwtVariables } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';
import { ServicesContainer } from './lib/service-container.class';

export type TokenPayload = JWTPayload & {
  userId: string;
  email: string;
};

export type AppEnv = {
  Variables: JwtVariables & {
    services: ServicesContainer;
    session: TokenPayload;
  };
};
export type App = Hono<AppEnv>;
export type AppContext = Context<AppEnv>;
export type AppOptions = {
  servicesPath: string;
  corsOrigins: string;
  sql: SQL;
  middlewares?: MiddlewareHandler[];
  generalOptions?: GeneralAppOptions;
};
export type GeneralAppOptions = {
  general?: { corsOrigins?: string[]; debug?: boolean; isProduction?: boolean };
  paths?: {
    services?: string;
    migrations?: string;
    seeds?: string;
  };
  auth?: {
    jwtSecret: string;
    jwtRefreshSecret: string;
    accessTokenExpires: string;
    refreshTokenExpires: string;
  };
  middlewares?: MiddlewareHandler[];
  router?: (app: App) => Hono<any>;
  database?: {
    user: string;
    password: string;
    host: string;
    database: string;
    schema?: string;
    port: number;
    ssl?: boolean | { rejectUnauthorized: boolean };
    pool?: {
      max?: number;
      maxLifetime?: number;
      idleTimeout?: number;
      connectionTimeout?: number;
    };
  };
};
