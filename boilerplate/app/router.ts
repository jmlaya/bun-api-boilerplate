import { Hono } from 'sivro';
import type { AppEnv } from 'sivro';
import { authRouter } from './routes/auth.route';
import { usersRouter } from './routes/users.route';

export const initializeRouter = (app: Hono<AppEnv>) => app.route('/', usersRouter).route('/', authRouter);
