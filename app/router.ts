import { Hono } from 'hono';
import type { AppEnv } from '../core/bootstrap';
import { authRouter } from './routes/auth.route';
import { usersRouter } from './routes/users.route';

export const initializeRouter = (app: Hono<AppEnv>) => app.route('/', usersRouter).route('/', authRouter);
