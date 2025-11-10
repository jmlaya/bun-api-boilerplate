import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../core/bootstrap';
import { BadRequestException } from '../../core/exceptions/BadRequest';
import { UnauthorizedException } from '../../core/exceptions/Unauthorized';
import { jsonResponse } from '../../core/helpers/jsonResponse';
import { log } from '../../core/log';
import { jsonValidator } from '../../core/middlewares/jsonValidator';
import type { AuthService } from '../services/auth.service';

export const authRouter = new Hono<AppEnv>()
  .basePath('/auth')
  .post(
    '/signin',
    jsonValidator(
      z.object({
        email: z.email(),
        password: z.string(),
      }),
    ),
    async (c) => {
      try {
        const { email, password } = await c.req.valid('json');
        const sessionData = await c.var.services.get<AuthService>('AuthService').login(email, password);

        return jsonResponse(c, sessionData);
      } catch (error) {
        log.ERROR((error as Error).message, error);
        throw new BadRequestException();
      }
    },
  )

  .post(
    '/signup',
    jsonValidator(
      z.object({
        name: z.string(),
        email: z.email(),
      }),
    ),
    async (c) => {
      try {
        const { email, name } = await c.req.valid('json');
        const tokens = await c.var.services.get<AuthService>('AuthService').signUp(email, name);

        return jsonResponse(c, tokens);
      } catch (error) {
        log.ERROR((error as Error).message, error);
        throw new BadRequestException();
      }
    },
  )

  .post(
    '/forgotPassword',
    jsonValidator(
      z.object({
        email: z.string().email(),
      }),
    ),
    async (c) => {
      try {
        const { email } = await c.req.valid('json');
        const result = await await c.var.services.get<AuthService>('AuthService').forgotPassword(email);

        return jsonResponse(c, result);
      } catch (error) {
        log.ERROR((error as Error).message, error);
        throw new BadRequestException();
      }
    },
  )

  .post(
    '/resetPassword',
    jsonValidator(
      z.object({
        token: z.string(),
        newPassword: z.string(),
      }),
    ),
    async (c) => {
      try {
        const { token, newPassword } = await c.req.json();
        const result = await c.var.services.get<AuthService>('AuthService').resetPassword(token, newPassword);

        return jsonResponse(c, result);
      } catch (error) {
        log.ERROR((error as Error).message, error);
        throw new UnauthorizedException();
      }
    },
  )

  .post(
    '/refreshToken',
    jsonValidator(
      z.object({
        refresh_token: z.string(),
      }),
    ),
    async (c) => {
      const { refresh_token } = await c.req.valid('json');

      if (!refresh_token) {
        throw new UnauthorizedException();
      }

      try {
        const tokens = await c.var.services.get<AuthService>('AuthService').refreshToken(refresh_token);

        return jsonResponse(c, tokens);
      } catch (error) {
        log.ERROR((error as Error).message, error);

        if ((error as Error).message === 'User not found') {
          throw new BadRequestException();
        }

        throw new UnauthorizedException();
      }
    },
  );
