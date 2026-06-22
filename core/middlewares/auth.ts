import type { Next } from 'hono';
import type { AuthService } from '../../app/services/auth.service';
import { UnauthorizedException } from '../exceptions/Unauthorized';
import type { AppContext } from '../types';

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
