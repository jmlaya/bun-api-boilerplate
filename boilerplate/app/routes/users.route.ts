import { Hono } from 'hono';
import { auth, jsonResponse, jsonValidator } from '@talon/core';
import type { AppEnv, UsersService } from '@talon/core';
import { z } from 'zod';

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

    // return jsonResponse(c, await c.var.services.get<UsersService>('UsersService').getUsers());
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
