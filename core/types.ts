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
export type AppOptions = ServerOptions & { middlewares?: MiddlewareHandler[] };
export type ServerOptions = {
  configPath?: string;
  servicesPath?: string;
};
