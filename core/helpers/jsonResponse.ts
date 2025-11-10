import { Context } from 'hono';
import { AppEnv } from '../bootstrap';

export function jsonResponse(c: Context<AppEnv>, data: Record<string, any>, metadata?: Record<string, any>) {
  return c.json({
    data,
    ...(!!metadata ? metadata : {}),
  });
}
