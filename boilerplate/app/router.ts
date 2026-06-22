import { Hono } from 'hono';
import type { AppEnv } from '@talon/core';
import { usersRouter } from './routes/users.route';

export const initializeRouter = (app: Hono<AppEnv>) => app.route('/', usersRouter);
