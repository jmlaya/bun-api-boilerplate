import { Next } from 'hono';
import { AppContext } from '../types';

export const keepAlive = () => async (ctx: AppContext, next: Next) => {
  ctx.res.headers.set('Connection', 'Keep-Alive');
  await next();
};
