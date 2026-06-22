import type { Next } from 'hono';
import { UnauthorizedException } from '../exceptions/Unauthorized';
import type { AppContext, TokenPayload } from '../types';

type AuthService = {
  verifyAccessToken(accessToken: string): Promise<TokenPayload>;
};

export const auth = async (c: AppContext, next: Next) => {
  const accessToken = c.req.header('Authorization')?.split(' ')?.[1];

  if (!accessToken) {
    throw new UnauthorizedException();
  }

  try {
    //TODO: Desacoplar el llamado a este servicio
    const { iat, exp, nbf, ...session } = await c.var.services
      .get<AuthService>('AuthService')
      .verifyAccessToken(accessToken);

    c.set('session', session);

    await next();
  } catch (error) {
    throw new UnauthorizedException();
  }
};
