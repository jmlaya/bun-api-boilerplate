import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../core/bootstrap';
import { jsonResponse } from '../../core/helpers/jsonResponse';
import { auth } from '../../core/middlewares/auth';
import { jsonValidator } from '../../core/middlewares/jsonValidator';
import type { UsersService } from '../services/users.service';

export const usersRouter = new Hono<AppEnv>()
  .basePath('/users')

  /**
   * Public endpoints
   */
  .get('/', async (c) => {
    return jsonResponse(c, [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ]);

    return jsonResponse(c, await c.var.services.get<UsersService>('UsersService').getUsers());
  })

  .use(auth)

  /**
   * Private endpoints
   */
  .post(
    '/',
    jsonValidator(
      z.object({
        name: z.string(),
        role: z.string(),
        email: z.string().email(),
      }),
    ),
    async (c) => {
      const payload = await c.req.valid('json');

      return jsonResponse(c, await c.var.services.get<UsersService>('UsersService').createUser(payload));
    },
  )

  .get('/:id', async (c) => {
    const id = await c.req.param('id');
    return jsonResponse(c, await c.var.services.get<UsersService>('UsersService').getUserById(id));
  })

  .put(
    '/:id',
    jsonValidator(
      z.object({
        name: z.string(),
        role: z.string(),
      }),
    ),
    async (c) => {
      const id = await c.req.param('id');
      const payload = await c.req.valid('json');

      return jsonResponse(c, await c.var.services.get<UsersService>('UsersService').updateUser({ id, ...payload }));
    },
  );
