import type { Next } from 'hono';
import type { Context } from 'hono';
import type { AuthService } from '../../app/services/auth.service';
import type { AppEnv } from '../bootstrap';
import { UnauthorizedException } from '../exceptions/Unauthorized';

export const auth = async (c: Context<AppEnv>, next: Next) => {
  const accessToken = c.req.header('Authorization')?.split(' ')?.[1];

  if (!accessToken) {
    throw new UnauthorizedException();
  }

  try {
    //TODO: Desacoplar el llamado a este servicio
    const { iat, exp, nbf, ...session } = await c.var.services
      .get<AuthService>('AuthService')
      .verifyAccessToken(accessToken);

    c.set('sesion', session);

    await next();
  } catch (error) {
    throw new UnauthorizedException();
  }
};
